---
version: "3.0"
name: HMH Systems
description: True-black kinetic system for a systems-builder portfolio. Pure #000 canvas, bone ink, hairline structure, mono specs. One signal color (International Orange #FF4D00) only where meaning is carried.
colors:
  canvas: "#000000"
  panel: "#0B0A09"
  panel-raised: "#100E0C"
  ink: "#F2EFE9"
  muted: "#A8A49B"
  faint: "#716D64"
  hairline: "rgba(242,239,233,0.13)"
  hairline-soft: "rgba(242,239,233,0.07)"
  hairline-strong: "rgba(242,239,233,0.26)"
  signal: "#FF4D00"
  signal-soft: "rgba(255,77,0,0.12)"
  signal-border: "rgba(255,77,0,0.45)"
  codebg: "#0B0A09"
  codetext: "#E9E5DC"
  buttontext: "#000000"
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 2.85rem
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Space Grotesk
    fontSize: 1.35rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body-md:
    fontFamily: Inter
    fontSize: 0.95rem
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0em"
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 0.7rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.08em"
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 0.82rem
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0em"
rounded:
  sm: 4px
  md: 8px
  lg: 14px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.buttontext}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "#FFFFFF"
  chip-tech:
    backgroundColor: "rgba(242,239,233,0.05)"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 8px
  status-live:
    backgroundColor: "{colors.signal-soft}"
    textColor: "{colors.signal}"
    rounded: 999px
    padding: 8px
  status-beta:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: 999px
    padding: 8px
  card-flat:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 28px
  code-block:
    backgroundColor: "{colors.codebg}"
    textColor: "{colors.codetext}"
    rounded: "{rounded.lg}"
    padding: 16px
  divider-rule:
    backgroundColor: "{colors.hairline}"
    textColor: "{colors.faint}"
    rounded: 0
    padding: 8px
  meta-label:
    backgroundColor: "transparent"
    textColor: "{colors.faint}"
    rounded: "{rounded.sm}"
    padding: 8px
---

## Overview

HMH Systems v3 is a darkroom, not a dashboard. The page is true black `#000000` — not "dark mode gray". Bone-white ink (`#F2EFE9`), hairline structure, tabular data, and exactly one signal color: International Orange `#FF4D00`, used only where meaning is carried. Everything else is light on a void. There is no theme toggle — the site is dark-only by identity.

The system is kinetic by design: a cursor spotlight, a scroll-progress wire, staged reveals, count-up stat tiles, a tech marquee, spotlighted cards with 3–4° micro-tilt, and a REC-style pulse on live systems. Motion is atmosphere and feedback — never decoration without meaning, never on text you're trying to read.

## Colors

- **Canvas (`#000000`):** Page background. Pure black — warm, not blue-tinted. No texture except the injected hairline field.
- **Panel (`#0B0A09`) / Panel-raised (`#100E0C`):** Cards and elevated surfaces. Barely lighter than the canvas; separation comes from hairlines, not contrast.
- **Ink (`#F2EFE9`):** Headlines, primary buttons, strong text. Warm bone white.
- **Muted (`#A8A49B`) / Faint (`#716D64`):** Body-muted text and metadata.
- **Hairlines (13% / 7% / 26% ink):** All dividers, table rules, card borders. Strong variant for dotted leaders and emphasized rules.
- **Signal (`#FF4D00`):** International Orange. Reserved for: scroll wire, active nav underline, section indices, LIVE status, REC pulse, active-filter dot, article links, focus rings, and the featured-dossier ray. **Signal budget:** if the orange carries no meaning, it must be gray.

Banned palette: indigo, violet, cyan, blue-purple gradients, slate-blue tints — the entire "AI slop" spectrum. No green success chips either; LIVE is orange or nothing.

## Typography

Space Grotesk for display (h1, h2, card titles, section titles) at tight tracking `-0.02em`. Inter for prose and UI. JetBrains Mono for specs only — section indices (`01 / CHANGELOG`), paths (`~/articles`), table headers, tech chips, status labels, buttons in uppercase-mono where the action is technical. Never serif display, never script. Body 0.95rem/1.7.

## Layout

Max width 1140px, 26px gutters. Every page: hairline field → sticky blurred topbar (brand chip + nav) → hero (mono eyebrow with REC dot, word-rise display H1 ≤ 860px measure, dim bio, CTA row) → body sections → outlined-signal footer. The About page carries the approved composition end to end: stat tiles (count-ups) → tech marquee → maintained systems → the 15-card index with filters → the ray-wrapped featured dossier. Work adds the full dossier room; Writing is the same shell with an article list + reader. One idea per section, left-aligned, never center-stacked.

## Elevation & Depth

Depth comes from three sources only: 1px hairlines, the barely-raised panels, and the ambient light rig. Blur (`backdrop-filter`) is allowed exclusively as a functional scrim over the black canvas — sticky header and modal palette. Cards may lift on hover: border brightening + deep black shadow (`0 18px 44px rgba(0,0,0,.6)`) + the top signal line. No colored drop shadows anywhere.

## Ambient Rig (motion)

- **Hairline field (`.field`):** 56px grid, masked to fade below the fold — the void's only texture. Injected in markup, bound by `motion.js`.
- **Cursor spotlight (`#spot`):** faint radial light tracking the pointer. Fine pointers only; no light on touch.
- **Scroll wire (`#beam`):** 2px orange line, fixed at the very top, width = scroll progress. The page's single continuous indicator.
- **Reveals (`.reveal` → `.in`):** IntersectionObserver, 28px rise, 0.7s, `--d` stagger. Content is never hidden for users without reveal support — reduced motion forces everything visible.
- **Word-rise (`.hero h1 .w`):** hero words rise 70ms apart on load; one word (or word group) may carry the signal color.
- **Stat count-ups (`[data-count]`):** 1100ms ease-out cubic count when the tile enters the viewport. Real numbers only — no invented metrics.
- **Marquee (`.marq`):** infinite 30s tech-chatter strip between hairline rules, masked at the edges. Decorative chatter is allowed here and only here.
- **Cell spotlight + micro-tilt (`.card`):** on pointer move the card carries its own whitespot (`--mx/--my`) and tilts up to 4° (`--rx/--ry`), returning to flat on leave. Fine pointers only.
- **REC pulse (`rec`):** expanding ring on LIVE dots, the ALL-MONITORED-style labels, and hero eyebrow dot. A "recording studio" tell for systems that are actually live.
- **Signature ray (`.beambox`):** conic orange band rotating (7s) around the border of a featured dossier. Only builds Hassan created and led get it — **Altair (creator & sole builder)** and **Marsad (sole contributor)**. It's a rank marker for authorship, not an ornament.

`prefers-reduced-motion: reduce`: all of the above stops — animations and transitions are clamped globally, reveals and hero words are forced visible, count-ups print their final values, spotlight and wire are removed, no JS listeners attached. Touch devices: spotlight and tilt off, everything else still alive (scroll wire, reveals, count-ups are pointer-independent).

## Shapes

Cards/dossiers 16–20px, buttons 10px, inner chips 6–8px, filters and status pills fully rounded (`999px`). Status pills and LED dots are the only "indicator" shapes — they read as hardware, not UI chrome. No avatars, no portrait strip; the operator shows up as data, not photographs.

## Components

- `button-primary` (`.btn-a`): bone fill, pure black text .95rem/600, 10px radius, min-height 48px. Hover: 2px lift + faint bone bloom.
- `button-ghost` (`.btn-b`): 1px hairline on a 50%-panel fill. Hover: border brightens + 2px lift.
- `filters`: pill buttons (.88rem/600). Active = bone fill, black text, orange dot appended. That dot is the only decoration they get.
- `stat` tiles: panel fill, mono eyebrow label, display number (count-up), dim footnote. The orange-bordered `.sigline` variant marks the one number that matters most (upstream PRs).
- `card`: panel fill, 16px radius, mono category + year header row, Space Grotesk title, dim summary, mono chips. Hover: border `.3` ink, whitespot follows the pointer, top signal line fades in, 3–4° tilt. LIVE/BETA ride as mono pills.
- `beambox` + `dossier` (featured): the ray-wrapped panel; inside, a 2px-raised gradient dossier with mono badge row, dim prose, paired `.dcol` lists (black inset, mono section headers — signal for primary column, dim for secondary), mono tech chips, and a footer row with actions. Other projects reuse the same `.dossier` unwrapped.
- `sys` (maintained systems): bordered panel of status rows — grid of name+small, mono location, and a LED dot. LIVE dots pulse; BETA dots stay dim. States must be truthful — LIVE only where uptime is real.
- Command palette (`⌘K` / Ctrl+K): raised panel, grouped results, keyboard-first (arrows + enter + esc), federated per-page index (`window.HMH_INDEX`) plus global actions (copy email, navigation). No theme action — dark-only.
- `marq`: hairline-ruled tech strip; mono uppercase, signal slashes between items.
- Index → detail flow: the 15-card grid is the index; every card links to its live destination (GitHub or the full dossier on the Work page). Dossier anchors stay stable (`#tawfikia` … `#upstream`).
- Footer: plain text-link row (44px targets) over a mono fine-print rail. No slogans — footer says facts and links only.
- Code: `.cmdline` tiles and reader code panels on `#0B0A09`, mono header bar ("code" + language badge), github-dark highlighting.

## Do's and Don'ts

Do: true black, bone ink, hairlines, mono for data, left-aligned dense grids and tables, real content (years, stacks, links), one signal color used sparingly, kinetic atmosphere with meaning (wire, spotlight, reveals, count-ups, micro-tilt), 44px+ touch targets, `prefers-reduced-motion` fully honored.
Don't: gradients (especially blue/violet/cyan), slate-blue tints, theme toggles, decorative orange (rings, washes, glows with no meaning), glassmorphism on content cards, emoji, icon-topper feature grids, center-stacked heroes, fake metrics, stock imagery, serif/script display type, colored drop shadows, leading with any build except Altair (created) and Marsad (built solo).
