#!/usr/bin/env bash
# Build Hassan-Mohamed-CV.pdf from cv.html
# ── pipeline: headless Chromium → A4 vector PDF → (optional) pikepdf metadata
# QA tools (optional, poppler-utils): pdfinfo, pdffonts, pdftotext, pdftoppm
set -euo pipefail
cd "$(dirname "$0")"

BIN=""
for c in chromium chromium-browser google-chrome-stable google-chrome; do
  command -v "$c" >/dev/null 2>&1 && BIN="$c" && break
done
if [ -z "$BIN" ]; then
  echo "error: no Chrome/Chromium found — 'Download CV (PDF)' button on cv.html still works via window.print()" >&2
  exit 1
fi

"$BIN" --headless --disable-gpu --no-sandbox \
  --run-all-compositor-stages-before-draw --virtual-time-budget=10000 \
  --no-pdf-header-footer \
  --print-to-pdf="Hassan-Mohamed-CV.pdf" "file://$PWD/cv.html"

# PDF metadata (Chromium sets Title from <title> but not Author)
# CV_PY can override the interpreter, e.g. CV_PY=/path/to/venv/bin/python3 ./build-cv.sh
py=""
for cand in "${CV_PY:-}" .cv-venv/bin/python3 python3; do
  [ -n "$cand" ] || continue
  if "$cand" -c "import pikepdf" 2>/dev/null; then py="$cand"; break; fi
done
if [ -n "$py" ]; then
"$py" - <<'PY'
import pikepdf
p = pikepdf.open("Hassan-Mohamed-CV.pdf", allow_overwriting_input=True)
with p.open_metadata() as m:
    m["dc:title"] = "Hassan Mohamed — CV (Systems Builder)"
    m["dc:creator"] = ["Hassan Mohamed"]
    m["dc:description"] = "Master CV — backend, business platforms, ERP, SaaS, desktop software and open-source engineering."
p.docinfo["/Title"] = "Hassan Mohamed — CV (Systems Builder)"
p.docinfo["/Author"] = "Hassan Mohamed"
p.docinfo["/Subject"] = "Business platforms, ERP, SaaS, desktop software and open-source engineering"
p.save("Hassan-Mohamed-CV.pdf")
print("metadata: Title/Author/Subject written")
PY
else
  echo "note: pikepdf not installed — skipped Author metadata (pip install pikepdf to enable)"
fi

echo "built Hassan-Mohamed-CV.pdf"
