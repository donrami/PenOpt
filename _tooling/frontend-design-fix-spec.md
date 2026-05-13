# Frontend Design Fixes — Specification

## Overview

Systematic implementation of all design issues identified in the frontend design audit of PenOpt's UI. Fixes span color contrast, typography, accessibility, layout, animation polish, and code quality.

## Architecture

All changes target the frontend web layer (Vite + vanilla JS + Three.js). No Go backend changes required. The single CSS file (`style.css`) and the HTML template (`index.html`) are the primary targets, with minor JS adjustments for accessibility and animation.

---

## Requirements

### R1 — Color Contrast (P1 Critical)
WHEN text-muted (`--text-muted`) is rendered on any dark background THEN it SHALL meet WCAG AA contrast (≥4.5:1 for small text).
WHEN text-dim (`--text-dim`) is rendered on bg/surface backgrounds THEN it SHALL meet WCAG AA contrast.

### R2 — Minimum Font Size (P1 Critical)
WHEN UI text is rendered THEN body and label text SHALL be at least 11px.
WHEN plot/canvas labels are rendered THEN they SHALL be at least 10px.
WHEN 7–9px font sizes exist in CSS or canvas code THEN they SHALL be bumped to the minimums above.

### R3 — Keyboard Accessibility (P1 Critical)
WHEN a user tabs through the UI THEN all interactive elements SHALL show a visible focus ring.
WHEN a view mode button receives focus THEN a visible focus indicator SHALL appear.

### R4 — Typography System (P2)
WHEN the app loads THEN CSS custom properties for line-height per text role SHALL be defined.
WHEN text is styled THEN the line-height tokens SHALL be used instead of ad-hoc hardcoded values.

### R5 — Semantic Headings (P2)
WHEN a screen reader navigates the document THEN card heads and section titles SHALL use semantic heading elements (h2/h3) instead of styled divs.

### R6 — Error Banner Focus (P2)
WHEN an error is displayed THEN focus SHALL move to the error banner.
WHEN the error is dismissed THEN focus SHALL return to the previously focused element or a sensible default.

### R7 — Sidebar Visual Grouping (P2)
WHEN a user scans the sidebar THEN each card section SHALL have a visual distinction (icon/color accent) to differentiate its purpose.

### R8 — Modal Animations (P2)
WHEN a modal (help/confirm) opens THEN it SHALL animate in with a fade+scale transition.
WHEN a modal closes THEN it SHALL animate out.

### R9 — Spacing Token Consistency (P2)
WHEN inline margin/padding values of 8px, 10px appear THEN they SHALL be replaced with the corresponding `--sp-*` custom property.

### R10 — Responsive Plot Canvases (P2)
WHEN the results panel is resized THEN plot canvases SHALL resize proportionally to their container.

### R11 — Semantic Color Token (P3)
WHEN a semantic info color is needed THEN `--color-info` SHALL be defined and used.

### R12 — Shared Utilities (P3)
WHEN debounce or formatting functions are needed THEN they SHALL be imported from a shared helpers module instead of redefined locally.

### R13 — CSS Consolidation (P3)
WHEN WebKit scrollbar styles are applied THEN repeated selector blocks SHALL be consolidated.

---

## Design

### D1 — Color Token Updates

```css
/* Current → Fixed */
--text-muted: #555870 → #787ca0;  /* ~4.6:1 on bg2 — passes AA */
--text-dim: #8b8fa8 → #969ab0;    /* ~5.5:1 on bg — improved */
/* New token */
--color-info: #0891b2;            /* cyan-600 — matches WCAG thresholds */
```

### D2 — Typography System

New CSS custom properties for line heights:

```css
:root {
  --lh-tight: 1.2;
  --lh-heading: 1.3;
  --lh-body: 1.6;
  --lh-loose: 1.7;
  --lh-label: 1.4;
}
```

Apply to:
- Headings → `--lh-heading`
- Body/card text → `--lh-body`
- UI labels, button text → `--lh-label`
- Small caps, timestamps → `--lh-tight`

### D3 — Minimum Font Sizes

Bump all sub-11px UI fonts:
- `.card-head`: 10px → **11px**
- `.rc-head`: 10px → **11px**
- `.pill`: 10px → **11px**
- `.filter-btn`: 10px → **11px**
- `.export-btn`: 10px → **11px**
- `.fm-remove`: 10px → **11px**
- `.mat-tab`: 10px → **11px**
- `.mat-item`: 10px → **11px**
- `.mat-search`: 11px → **11px** (OK)
- `.ctrl-label`: 10px → **11px**
- `.scanner-grid label`: 10px → **11px**
- `.tradeoff-stop`: 10px → **11px**
- `.method-btn`: 10px → **11px**
- `.vp-mode-btn`: 10px → **11px**
- `.opt-table`: 11px → **11px** (OK)
- `.stale-banner`: 10px → **11px**
- `.legend-labels`: 9px → **10px**
- `.fstat-l`: 9px → **10px**
- `.is-ref`: 9px → **10px**
- `.energy-caveat`: 9px → **10px**
- 7px plot text → **10px**
- `.pr-info`: 11px → **11px** (OK)
- `.opt-status`: 11px → **11px** (OK)
- `.grid-info`: 10px → **11px**

### D4 — Semantic Headings

HTML changes:
- `<div class="card-head">` → `<h2 class="card-head">` in sidebar, `<h3 class="card-head">` in results cards
- JS accordion click handlers target `.card-head` — these work on any element, no change needed
- `.card-head` CSS keeps same styling but inherits font-size from the size bump

### D5 — Error Banner Focus

JS change in `state.js`:
- `showError()`: focus the error banner when shown
- Store previous focus in a variable
- On dismiss: restore focus

### D6 — Sidebar Visual Grouping

Add an icon prefix to each sidebar card (inline SVG). Style each with a subtle left-border accent color:
- Upload → upload icon, border-left color: `var(--accent)`
- Material → palette icon, border-left color: `var(--green-500)`
- Advanced → sliders icon, border-left color: `var(--color-info)`
- Optimize → play icon, border-left color: `var(--amber-500)`

CSS: `.card` gets `border-left: 3px solid transparent` → accent color per section.

### D7 — Modal Animations

CSS keyframes + class toggling:
```css
@keyframes fadeScaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes fadeScaleOut {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.95); }
}
```

- Add `.modal-open` and `.modal-closing` classes
- On open: add `modal-open` → triggers `fadeScaleIn` (250ms ease-out)
- On close: add `modal-closing` → triggers `fadeScaleOut` (200ms ease-in), then `display: none` after animation ends

### D8 — Spacing Token Replacement

Replace these inline styles:
- `margin-top: 8px` (scanner section) → `var(--sp-2)`
- `margin-top: 10px` (search range section) → `var(--sp-3)`
- `margin-top: 10px` (ray sampling section) → `var(--sp-3)`
- `margin-top: 8px` (Tuy warning in optimizer.js) → `var(--sp-2)`

### D9 — Responsive Plot Canvases

In `plots.js` `setupCanvas()`: use `ResizeObserver` to re-render when parent size changes.
Default sizes: `defaultWidth=236` → use `Math.max(rect.width - 4, 200)` instead.

### D10 — Semantic Color Token

Add `--color-info` to root, apply to:
- Info-style banners
- Scanner geometry section accent
- Info notes (`.is-info`)

### D11 — Shared Utilities Module

Create `/frontend/src/helpers.js`:
- `debounce(fn, ms)` — extracted from materials.js
- `formatTime(ms)` — already in state.js, just import path
- `clamp(val, min, max)` — new

Import in materials.js, optimizer.js instead of local definitions.

### D12 — Scrollbar CSS Consolidation

Use CSS `:is()` pseudo-class to combine selectors:
```css
:is(html, body, #sidebar, #results-content, #mat-grid,
    .is-table-wrap, .help-body, .acc-body)::-webkit-scrollbar {
  width: 6px !important;
  ...
}
```

---

## Tasks

### Task 1 — Color Token Fixes (R1, R11)
Files: `frontend/src/style.css`
- [ ] 1.1 Change `--text-muted` from `#555870` to `#787ca0`
- [ ] 1.2 Change `--text-dim` from `#8b8fa8` to `#969ab0`
- [ ] 1.3 Add `--color-info: #0891b2` to root
- [ ] 1.4 Add `.text-info`, `.bg-info-tint`, `.border-info` utility classes

### Task 2 — Typography System (R2, R4)
Files: `frontend/src/style.css`
- [ ] 2.1 Add line-height CSS tokens to `:root`
- [ ] 2.2 Apply `--lh-heading` to `#header h1`, `.card-head`, `.rc-head`, `#results-header h3`
- [ ] 2.3 Apply `--lh-body` to `#results-content`, `.card-body`, `.help-body`
- [ ] 2.4 Apply `--lh-tight` to `.pill`, `.opt-table td`, `.rs-val`
- [ ] 2.5 Apply `--lh-label` to `.ctrl-label`, `.scanner-grid label`, `.export-btn`, `.vp-mode-btn`
- [ ] 2.6 Bump minimum font sizes per D3 (all sub-11px UI elements → 11px, 7–9px plot/label text → 10px)

### Task 3 — Keyboard Accessibility (R3)
Files: `frontend/src/style.css`
- [ ] 3.1 Add `.vp-mode-btn:focus-visible` to the focus-visible rule group

### Task 4 — Semantic Headings (R5)
Files: `frontend/index.html`
- [ ] 4.1 Change sidebar `.card-head` divs to `<h2>`, results `.card-head` divs to `<h3>`
- [ ] 4.2 Ensure CSS selectors still match (they use `.card-head` class — no change needed)

### Task 5 — Error Banner Focus (R6)
Files: `frontend/src/state.js`
- [ ] 5.1 Add focus management to `showError()`: focus error banner, store previous focus
- [ ] 5.2 Add focus restoration on dismiss

### Task 6 — Sidebar Visual Grouping (R7)
Files: `frontend/index.html`, `frontend/src/style.css`
- [ ] 6.1 Add icon SVGs to each sidebar `.card-head`
- [ ] 6.2 Add `.card--upload`, `.card--material`, `.card--advanced`, `.card--optimize` modifier classes
- [ ] 6.3 Add left-border accent styling per card type

### Task 7 — Modal Animations (R8)
Files: `frontend/src/style.css`, `frontend/src/main.js`
- [ ] 7.1 Add `fadeScaleIn`/`fadeScaleOut` keyframes
- [ ] 7.2 Add `.modal-open`/`.modal-closing` classes
- [ ] 7.3 Animate help overlay open/close with event listeners

### Task 8 — Spacing Token Consistency (R9)
Files: `frontend/index.html`, `frontend/src/optimizer.js`, `frontend/src/scene.js`
- [ ] 8.1 Replace inline `margin-top: 8px` → `margin-top: var(--sp-2)` in HTML
- [ ] 8.2 Replace inline `margin-top: 10px` → `margin-top: var(--sp-3)` in HTML
- [ ] 8.3 Replace JS inline `marginTop: '8px'` → `--sp-2` equivalent

### Task 9 — Responsive Plot Canvases (R10)
Files: `frontend/src/plots.js`
- [ ] 9.1 Add ResizeObserver to re-render canvas on container resize
- [ ] 9.2 Use responsive width calculation instead of hardcoded 236px

### Task 10 — Shared Utilities (R12)
Files: `frontend/src/helpers.js`, `frontend/src/materials.js`
- [ ] 10.1 Create `helpers.js` with `debounce`, `clamp`
- [ ] 10.2 Update materials.js to import `debounce` from helpers

### Task 11 — CSS Scrollbar Consolidation (R13)
Files: `frontend/src/style.css`
- [ ] 11.1 Use `:is()` to consolidate repeated WebKit scrollbar selector blocks

---

## Next Steps

Implement tasks in order, one commit per logical change. Verify each task against its requirements before moving to the next.
