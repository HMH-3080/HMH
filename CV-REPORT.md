# CV Master-CV Overhaul — Report (2026-10-26)

## 1. Baseline audit (before any edit)

- **Authoritative source:** `cv.html` (v2). No PDF artifact existed in the repo — the previous "pipeline" was a manual browser print. A baseline snapshot was kept aside before changes; the git history was squashed into final, clean commits before publishing (no experimental/backup commits in the shared record).
- Baseline PDF generated for audit (2 pages, A4): Title metadata ✓, **Author empty ✗**, fonts embedded ✓, text extraction ✓, **0 clickable-link annotations** ✗, upstream PR list rendered as a 2-column CSS grid (ambiguous reading order for parsers) ✗, four desktop tools crammed into one title line ✗.

## 2. Changes applied

### Structural (ATS)
- Semantic headings: `h1` name, `h2` sections, `h3` group subheads — sections renamed to conventional labels:
  `Professional Summary` → `Technical Skills` → `Selected Projects & Engineering Experience` → `Open-Source Projects — Created & Led` → `Open-Source Contributions — External Projects` → `Technical Writing` → `Languages`.
- **Technical Skills moved to the top third of page 1** (recruiter-visible, standard order) and reorganized into: Programming languages / Frameworks & application development / Databases & data management / Infrastructure & operations / Architecture & engineering practices. Exact recognized names; no percentages or star bars.
- Projects grouped into a coherent hierarchy **without deleting anything**:
  1. Business Platforms & Production Systems (El Fath, GAL, El Tawfikia, Pioneer)
  2. SaaS & Commercial Products (Rocket 2, Egyfy, Rocket 1)
  3. Open-Source Projects — Created & Led (Altair, Marsad, EgyFy Parser) + Desktop, Automation & Utility Projects (KPM, EG-ID, Pomodoro — now one bullet each, individually searchable)
  4. Open-Source Contributions — External Projects (ASN lead role + 6 upstream fixes as a **single-column standard bullet list**, replacing the 2-col grid)
- Deliberate soft page-break before External Contributions → three well-formed pages: p1 = summary/skills/business platforms, p2 = products/own OSS, p3 = contributions/writing/languages.

### Editorial
- Summary rewritten as evidence-first positioning ("what I build, breadth of ownership, problems solved, verified outcomes").
- All bullets pruned to **action + technical implementation + scope/outcome**, keeping every factual claim (offline-first sync, RBAC, telemetry, AES-256-GCM vault, ~992 specs, 3 tenants, 15 systems, 8 merged PRs, 9 articles, MIT/AGPL/CC/Apache licenses).
- Dates standardized: `YYYY` for delivered programs, `YYYY → present` for ongoing ones; statuses consistent (`LIVE / BETA / MAINTAINED`). Phrasing now separates *created* (Altair, Marsad, Parser, KPM, EG-ID, Pomodoro, Egyfy, Rocket) from *contributed to others* (ASN, upstream fixes).
- No fabricated content: no invented Education, certifications, users, revenue or performance numbers.

### ATS / PDF
- 8 real hyperlink annotations: mailto, tel, GitHub, LinkedIn, galimport.shop, Altair repository + documentation, Marsad repository — all with readable visible labels.
- PDF metadata completed via `build-cv.sh`: Title / **Author** / Subject.
- Single-column primary flow; no tables; no icons-as-labels; contact info remains plain selectable body text; meaning never carried by color alone (every status is also spelled in text).

### Visual
- Same restrained system (paper white, bone ink, single orange accent) kept: strong typographic hierarchy, consistent dotted-leader rows, `break-inside: avoid` on entries, `break-after: avoid` on headings — no orphaned headings or split bullets (verified visually).

## 3. Project-preservation checklist — 22/22 retained ✓

| Original item | Status |
|---|---|
| El Tawfikia Auto Parts Markets | ✓ p1 (2022 → present · MAINTAINED) |
| GAL Factory Supplies | ✓ p1 (2023 → present · LIVE, linked) |
| El Fath Pharmacies | ✓ p1 (4 bullets, deepest evidence first) |
| Pioneer General Supplies & Contracting | ✓ p1 (2026) |
| Rocket System 2 | ✓ p2 (2026 · LIVE) |
| Egyfy | ✓ p2 (BETA · 3 tenants) |
| Rocket System 1 | ✓ p2 (2025, own entry no longer nested) |
| Altair (+ repo & docs links) | ✓ p2 (Creator · Sole Builder, MIT, phases 0–7) |
| Marsad (+ repo link) | ✓ p2 (Sole Builder, CC BY-NC 4.0) |
| EgyFy Parser | ✓ p2 (Apache-2.0) |
| KPM / EG-ID Checker / Pomodoro Timer | ✓ p2 — one explicit bullet each |
| ASN — Open Social Network | ✓ p3 (Leading Contributor, AGPL-3.0) |
| elixir-lang/elixir #15770 · ktorio/ktor #5633 · LiveCodes/browser-elixir #1 · loco-rs/loco #1785 · Racore #2 · 404-coffee-backend #1 | ✓ p3, single-column bullets |
| Altair #22 + #23 | ✓ **folded into the Altair entry** (hot-reload watcher in bullet 3, benchmark collector in bullet 4) — they are PRs to my own repository, not contributions to external projects; see questions |
| Contact block (email / phone / GitHub / LinkedIn / location) | ✓ p1, now clickable |
| 9 technical articles | ✓ p3 ("Nine published engineering articles: …") |
| 15 systems · 3 tenants · ~992 specs · 8 merged PRs · phases 0–7 | ✓ summary/entries, unchanged numbers |

## 4. Validation report — checks actually performed

| Check | Result |
|---|---|
| `pdftotext` coverage of 53 content tokens (name, contacts, all sections, all projects, skills, languages) | **53/53 present, none missing** |
| Reading-order probes (skills→projects→created→contributions→writing→languages) | ✓ correct sequence |
| Project-level coverage (22 tokens incl. every PR number) | **22/22 present** |
| Unicode integrity (`U+FFFD` scan, tofu/box glyph inspection of rendered pages) | 0 issues |
| `pdfinfo` | A4 (594.96 × 841.92 pts) · 3 pages · Title: "Hassan Mohamed — CV (Systems Builder)" · Author: "Hassan Mohamed" · Subject set |
| `pdffonts` | all fonts embedded (subsets); note: `→` glyphs resolve through locally available FiraCode NF fallback — embedded, extract clean |
| Link annotations (pikepdf) | **8/8 present** with correct URIs |
| Strict HTMLParser tag balance on `cv.html` | OK |
| `node --check` on inline download-button script | OK |
| `python3 -m http.server` serving | cv.html → 200 |
| Visual page-by-page inspection (`pdftoppm` → PNG, page 1/2/3) | performed — clean headers, no clipping, no orphaned headings, no split bullets across pages |
| HTTP 404/URL verification of linked targets | **not performed** (offline spot-check of repo/doc URLs skipped) — flagged below |

## 5. Open questions (answers could unlock further precision — nothing invented meanwhile)

1. **Altair #22/#23** — I folded them into the Altair entry (own repo ≠ external contribution). Prefer listing them separately as "PRs to my own repositories"?
2. **k6 benchmarks** — any recorded numbers (req/s, latency, concurrency level, hardware) to quote *with* the test context?
3. **Merged-or-open status** of `loco #1785`, `Racore #2`, `404-coffee-backend #1`, `browser-elixir #1`, `ktor #5633`, `elixir #15770` — all merged? And exact owner paths for `LiveCodes/browser-elixir`, `Racore`, `404-coffee-backend` so I can hyperlink the PRs safely (I linked only what I could verify structurally).
4. **ASN repository URL** to add as a link (kept text-only meanwhile).
5. **LinkedIn URL** `linkedin.com/in/hasan-mohamed-81a187289` — confirm it is current.
6. **Egyfy tenants** — add live URLs (twins · omhassan · tm) or keep plain text as now?
7. **El Fath** — is maintenance ongoing since 2024 (would upgrade meta to `2024 → present · LIVE`)?
8. **Ongoing-since definition of "15 production systems"** — which are counted (own products included?), so the summary number stays audit-proof on request.
9. **WhatsApp contact** — the site shortcut offers it; intentionally left off the CV. Add?
10. **Marsad public repo?** — currently CC BY-NC 4.0 with repository link; confirm public visibility is intended.

## 6. Regeneration

```bash
./build-cv.sh                      # Chromium required
CV_PY=/path/to/venv/bin/python3 ./build-cv.sh   # optional: writes Author/Subject metadata (pikepdf)
```
Fallback: open `cv.html` → "⇩ Download CV (PDF)" → Save as PDF (same A4 layout, browser-driven).
