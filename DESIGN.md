---
version: alpha
name: HMH Systems
description: Monochrome engineering system for a systems-builder portfolio. Flat surfaces, hairlines, mono specs. One signal accent only.
colors:
  primary: "#09090B"
  secondary: "#52525B"
  tertiary: "#C2410C"
  neutral: "#FAFAFA"
  surface: "#FFFFFF"
  hairline: "#E4E4E7"
  faint: "#71717A"
  codebg: "#09090B"
  codetext: "#E4E4E7"
  success: "#15803A"
typography:
  h1:
    fontFamily: Inter
    fontSize: 2.75rem
    fontWeight: 650
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  h2:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 650
    lineHeight: 1.3
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
  md: 6px
  lg: 10px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "#27272A"
  chip-tech:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.sm}"
    padding: 8px
  status-live:
    backgroundColor: "{colors.success}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: 8px
  status-beta:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: 8px
  card-flat:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 16px
  code-block:
    backgroundColor: "{colors.codebg}"
    textColor: "{colors.codetext}"
    rounded: "{rounded.md}"
    padding: 16px
  divider-rule:
    backgroundColor: "{colors.hairline}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: 8px
  meta-label:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.faint}"
    rounded: "{rounded.sm}"
    padding: 8px
---

## Overview

HMH Systems is an engineering dossier, not a marketing site. Monochrome surfaces, hairline structure, tabular data. One signal color (burnt orange `#C2410C`) reserved for status, active states, and key actions only. Everything else is ink on paper.

## Colors

- **Primary (#09090B):** Ink. Headlines, primary buttons, code background.
- **Secondary (#52525B):** Body-muted. Descriptions, secondary text.
- **Tertiary (#C2410C):** Signal. Status dots, active nav underline, key links, Beta badge. Never as background wash or gradient.
- **Neutral (#FAFAFA):** Page canvas. Flat, no texture, no noise.
- **Surface (#FFFFFF):** Cards and panels. Separated by 1px hairline, not shadow.
- **Hairline (#E4E4E7):** All dividers, table rules, card borders.
- **CodeBg (#09090B) / CodeText (#E4E4E7):** Code blocks and spec panels only.

Dark mode mirrors the same tokens with inverted luminance — no new hues: canvas `#09090B`, surface `#101013`, ink `#F4F4F5`, hairline `#26262B`, signal lightened to `#FB923C` for contrast. Primary buttons and the brand mark invert (paper fill, ink text). Activated via `data-theme="dark"` on `<html>`, persisted in `localStorage`, defaulting to `prefers-color-scheme`.

## Typography

Inter for prose and UI, JetBrains Mono for specs only — section indices (`01 / PROFILE`), paths (`~/projects`), table headers, tech chips, status labels, buttons in uppercase-mono where the action is technical. Never serif display, never script. H1 tight tracking `-0.03em`, weight 650. Body 0.95rem/1.7.

## Layout

Max width 1080px, 24px gutters. Sections numbered `NN / LABEL` in mono with a hairline rule. About hero is an asymmetric spec-sheet: left identity + availability + actions, right build manifest panel (flat dark, mono rows). Projects and Articles are Explore surfaces: dense index tables with filter, not card grids. One idea per section, left-aligned, never center-stacked.

## Elevation & Depth

No elevation system. Separation = 1px hairline border. Allowed shadow: `0 1px 2px rgba(0,0,0,0.04)` on hover only. No blur, no glass, no glow, no gradient wash.

## Shapes

Cards 6px, chips 4px, status pills 4px (rectangular-technical, not bubbly), buttons 6px. Portrait 6px square, grayscale, hairline border — no circle, no ring glow.

## Components

- `button-primary`: flat ink fill, white text, mono uppercase 0.72rem. Hover `#27272A`. No gradient.
- `chip-tech`: flat `#F4F4F5` fill, mono 0.7rem, hairline border. No icons required; icon optional at 14px monochrome.
- `status-live` / `status-beta`: 4px rect, white mono text on green/orange. Small, inline with title.
- `card-flat`: white, 1px hairline, 6px radius. Hover: border darkens + 1px lift shadow. No inset screws, no metallic texture.
- Index rows: full-width table rows with tabular numbers, hover `#FAFAFA`, active left 2px signal bar only on the row.
- Code: dark panel with mono header bar (filename + lang badge), GitHub-dark-ish highlighting.

## Do's and Don'ts

Do: flat monochrome, hairlines, mono for data, left-aligned dense tables, real content (years, stacks, links), one signal color, 44px touch targets, `prefers-reduced-motion` support.
Don't: gradients (especially blue/violet), glassmorphism, emoji, icon-topper feature grids, center-stacked heroes, left-rail accent cards, monument stats, fake metrics, stock imagery, serif/script display type, theatrical page-turn transitions.
