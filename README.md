# HMH — Portfolio & Blog

Personal portfolio and engineering blog of **Hassan Mohamed** (systems builder).
Live at **https://hmh-3080.github.io/HMH/** — deployed by the
[`pages.yml`](.github/workflows/pages.yml) workflow on every push to `master`
(check the **Actions** tab for build status). `.nojekyll` disables Jekyll processing.

## Pages

| File | What |
|---|---|
| `about.html` | Profile, ship log (changelog), stack, selected work, contact |
| `projects.html` | 11 systems: 4 enterprise, 3 products/SaaS, 4 open source — filterable index + dossiers |
| `articles.html` | 9 engineering notes, paginated reader with syntax highlighting |
| `index.html` | Redirects to `about.html` |

Shared assets: `style.css` (single design system, light + dark via `data-theme`), `palette.js`
(`⌘K` command palette + copy buttons, fed per-page by `window.HMH_INDEX`), `logo.png`.

## Articles

Add the `.md` file under `articles/`, then register it in `articles/manifest.json`:

```json
{ "file": "my-new-post.md", "date": "2026-09-10", "tags": ["elixir", "backend"] }
```

Then add one row to the changelog in `about.html` and one entry to `HMH_INDEX`
in `about.html` + `articles.html` (deep link format: `articles.html?f=my-new-post.md`).
Titles are taken from the first `#` heading; reading time is computed automatically.

## Design system

Tokens and rules live in [`DESIGN.md`](DESIGN.md) (lint with
`npx -y @google/design.md lint DESIGN.md`). Monochrome + one signal accent,
Inter + JetBrains Mono, hairline structure, no gradients. Throwaway explorations
live in `sketches/` and are not part of the site.

## Local preview

Articles load via `fetch`, so open through a server, not `file://`:

```bash
python3 -m http.server 8000
# http://localhost:8000/about.html
```
