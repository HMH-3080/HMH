# HMH — Portfolio & Blog

Personal portfolio and engineering blog of **Hassan Mohamed** (systems builder).
Live at **https://hmh-3080.github.io/HMH/** — deployed by the
[`pages.yml`](.github/workflows/pages.yml) workflow on every push to `master`
(check the **Actions** tab for build status). `.nojekyll` disables Jekyll processing.

## Pages

| File | What |
|---|---|
| `about.html` | Profile, status board, stats tiles, the 15-card work index with filters, article index |
| `projects.html` | Work dossiers: 15 cards + ray-wrapped featured builds (Altair, Marsad) + full dossier room — filterable |
| `articles.html` | 9 engineering notes, paginated reader with syntax highlighting |
| `cv.html` | Master CV — prints to A4 vector PDF (`build-cv.sh` or the in-page button) |
| `index.html` | Redirects to `about.html` |

Shared assets: `style.css` (single design system, dark-only), `motion.js`
(kinetic runtime: scroll beam, pointer spotlight, reveals, count-ups, card tilt),
`palette.js` (`⌘K` command palette + copy buttons, fed per-page by `window.HMH_INDEX`),
`logo.png`.

## Articles

Add the `.md` file under `articles/`, then register it in `articles/manifest.json`
with a short, URL-safe `slug` (lowercase words separated by dashes):

```json
{ "file": "my-new-post.md", "slug": "my-new-post", "date": "2026-09-10", "tags": ["elixir", "backend"] }
```

Then regenerate the committed data file:

```bash
python3 build-articles.py          # writes articles-data.js
python3 build-articles.py --check  # CI: fails if the committed file is stale
```

The build validates slugs (non-empty, unique, URL-safe) and bakes titles, reading
times and markdown into `articles-data.js`, so the reader renders instantly with
no `fetch`. Then add one row to the changelog in `about.html` and one entry to
`HMH_INDEX` in `about.html` + `articles.html`.

Shareable permalink: `articles.html?s=my-new-post` (legacy `?f=file.md` and `?a=N`
links still work). Titles come from the first `#` heading; reading time is
computed at build time.

## Design system

Tokens and rules live in [`DESIGN.md`](DESIGN.md) (lint with
`npx -y @google/design.md lint DESIGN.md`). Monochrome + one signal accent,
Inter + JetBrains Mono, hairline structure, no gradients, dark-only.

## Local preview

Articles are baked into `articles-data.js`, so no server is needed — open
`about.html` or `articles.html` directly, even from `file://`. A server works
too if you prefer:

```bash
python3 -m http.server 8000
# http://localhost:8000/about.html
```
