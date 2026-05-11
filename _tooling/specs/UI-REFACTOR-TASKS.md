# PenOpt UI Refactor — Phase Task List

## Rules for the AI Agent

1. **One commit per task.** Each numbered item below is exactly one commit. No combining.
2. **Commit message format:** `refactor(ui): <task title>` — e.g., `refactor(ui): add shadow scale CSS variables`
3. **After each commit, stop and validate:**
   - CSS must parse without errors
   - The app must not crash
   - No regressions in layout compared to before the commit
4. **Phases must be done in order** (0 → 1 → 2 → 3). Tasks within a phase can be done in any order.
5. **If a task touches both CSS and HTML, the commit includes both.**
6. **Do not combine refactoring with functional changes** — this is visual only.
7. **Before starting, read `frontend/src/style.css` and `frontend/index.html`** to confirm current state matches what these tasks expect.

---

## Phase 0 — Foundation Tokens (CSS only, additive, zero risk)

No UI changes in this phase. Only new CSS variables and classes that nothing references yet.

### Task 0.1 — Add shadow scale variables
**File:** `frontend/src/style.css`
**Scope:** New `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl` CSS custom properties in `:root`
**Details:**
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
--shadow-md: 0 4px 6px rgba(0,0,0,0.35);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.4);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.5);
```
Insert in `:root` after the existing token block (after `--mono` line, before `* { margin: 0 }`).

### Task 0.2 — Add icon size component classes
**File:** `frontend/src/style.css`
**Scope:** New CSS class block for icon sizing
**Details:** Add after the scrollbar section, before the header section:
```css
/* ── Icon Sizes ── */
.icon--xs { width: 12px; height: 12px; }
.icon--sm { width: 14px; height: 14px; }
.icon--md { width: 18px; height: 18px; }
.icon--lg { width: 24px; height: 24px; }
.icon--xl { width: 32px; height: 32px; }
```

### Task 0.3 — Add shade scales for semantic colors
**File:** `frontend/src/style.css`
**Scope:** Replace single-value `--green`, `--red`, `--amber`, `--orange`, `--teal` with 3-level shade scales
**Details:** In `:root`, replace these line pairs:
```css
/* Current */
--green: #34d399;
--green-tint: rgba(52,211,153,0.12);
/* ... etc for red, amber, orange, teal */

/* New — keep existing single value as --*-500, add --*-300 and --*-700 */
--green-300: #6ee7b7;
--green-500: #34d399;
--green-700: #059669;
--green-tint: rgba(52,211,153,0.12);

--red-300: #fca5a5;
--red-500: #ef4444;
--red-700: #b91c1c;
--red-tint: rgba(239,68,68,0.12);

--amber-300: #fcd34d;
--amber-500: #f59e0b;
--amber-700: #d97706;
--amber-tint: rgba(245,158,11,0.12);

--orange-500: #fb923c;
--teal-500: #2dd4bf;
```
Keep `--orange` and `--teal` as single values for now (they're less used). Do NOT update any selectors to use the new shade names yet — that happens in Phase 1.

---

## Phase 1 — Apply Foundation CSS Tokens (CSS only, low risk)

Update existing selectors to use the new tokens from Phase 0.

### Task 1.1 — Apply shadow to cards
**File:** `frontend/src/style.css`
**Details:** Add `box-shadow: var(--shadow-sm);` to `.card` selector. Keep existing `border: 1px solid var(--border)`.

### Task 1.2 — Apply shadow to help modal
**File:** `frontend/src/style.css`
**Details:** Add `box-shadow: var(--shadow-xl);` to `#help-card`.

### Task 1.3 — Apply shadows to floating elements
**File:** `frontend/src/style.css`
**Details:**
- `.btn-reset-float`: add `box-shadow: var(--shadow-md);`
- `#results-summary`: add `box-shadow: var(--shadow-lg);`
- `.res-card`: add `box-shadow: var(--shadow-sm);`

### Task 1.4 — Apply shadows to overlay elements
**File:** `frontend/src/style.css`
**Details:**
- `#progress-ring`: add `filter: drop-shadow(var(--shadow-lg));`
- `#help-overlay`: ensure the backdrop stands out (already has `rgba(0,0,0,0.6)`, no change needed)

### Task 1.5 — Replace ad-hoc SVG sizes with icon classes in index.html
**File:** `frontend/index.html`
**Details:** Find each inline `<svg>` element and replace its dimension attributes with the corresponding `.icon--*` CSS class:
- Header logo SVG (18×18) → add `class="icon--md"`, remove width/height
- Error banner SVG (12×12) → add `class="icon--xs"`, remove width/height
- Drop zone SVG (14×14) → add `class="icon--sm"`, remove width/height (this gets upgraded in Phase 3)
- Idle prompt SVG (32×32) → add `class="icon--xl"` to the existing `ip-icon` div, remove width/height from SVG
- Accordion chevron SVGs (8×8) → leave as-is (too small for the scale, they're decorative)

Only apply where the SVG `width` matches an icon class exactly. Keep `viewBox` and `fill`/`stroke` attributes.

### Task 1.6 — Update selectors to use shade-scale colors
**File:** `frontend/src/style.css`
**Details:** Find all usages of `var(--green)`, `var(--red)`, `var(--amber)` in selectors and update them:
- `.dot--green`: `background: var(--green)` → `background: var(--green-500)`
- `.dot--red`: `background: var(--red)` → `background: var(--red-500)`
- `.dot--amber`: `background: var(--amber)` → `background: var(--amber-500)`
- `#error-banner`: `background: var(--red-tint)` and `color: var(--red)` → stays same (tint pattern still works)
- `.btn-stop`: `background: var(--red-tint)`, `color: var(--red)`, `border:` → stays same
- `#wt-banner`: `background: var(--amber-tint)`, `color: var(--amber)` → stays same

Also update the amber references in `#wt-banner` border:
- `border-bottom: 1px solid rgba(245,158,11,0.3)` → no change (hardcoded, not a var reference)

---

## Phase 2 — Typography Consolidation (CSS only, mechanical)

Consolidate the type scale by removing 9px and collapsing the 10/11/12px range.

### Task 2.1 — Eliminate 9px font-size usage
**File:** `frontend/src/style.css`
**Details:** Find every selector with `font-size: 9px` and bump to `10px`:
- `.filter-btn` and `.filter-btn .fb-name`
- `.tradeoff-stop`
- `.fstat-l`
- `.vp-mode-btn`
- `.presets button`
- `.is-btn` (currently 10px — verify it's not 9px)
- Any other 9px usages found via grep

Do NOT change padding or layout — only the font-size value.

### Task 2.2 — Consolidate 10px and 11px into a cleaner scale
**File:** `frontend/src/style.css`
**Details:** Most 10px and 11px selectors are fine as-is. But some 10px labels that are labels (not data) should stay 10px, while 10px text that serves as content should be bumped to 11-12px. Specifically:
- `#header .subtitle`: 11px → keep (it's a label)
- `.card-head`: 11px → keep (label pattern)
- `.acc-head`: 11px → keep
- `.acc-val`: 10px → keep (it's compact data)
- `.ctrl-label`: 10px → keep
- `.ctrl-unit`: 10px → keep
- `.fm-row`: 11px → keep
- `.pill`: 10px → keep
- `.hud-rot`: 10px → keep

No changes — the 10-11px range is already appropriate for label text. Only eliminate 9px.

### Task 2.3 — Increase card body text
**File:** `frontend/src/style.css`
**Details:** `.card-body` text is 12px. Bump to **13px**. Check padding still looks balanced (12px card-body padding with 13px text is fine).

### Task 2.4 — Increase results summary values
**File:** `frontend/src/style.css`
**Details:** `.rs-val` is 13px. Bump to **14px** for better readability. The `.rs-val.accent` (energy value) should stay at 13px or match.

---

## Phase 3 — Layout & UX Improvements (CSS + HTML)

### Task 3.1 — Widen sidebar
**File:** `frontend/src/style.css`
**Details:** Change `#sidebar` width from `300px` to **`336px`** (both `width` and `min-width`).
Check that `min-width: 300px` also gets updated to `336px`.
Check that no other component has a hardcoded reference to 300px for alignment.

### Task 3.2 — Surface tradeoff/quality card
**File:** `frontend/index.html`
**Details:** Remove `style="display:none"` from `#card-tradeoff`. The card should always be visible but with controls in a disabled state when no results exist.
**File:** `frontend/src/style.css`
**Details:** Add a `.card--disabled` class or use `pointer-events: none; opacity: 0.5;` pattern for when tradeoff controls are not yet usable.
**File:** `frontend/src/optimizer.js`
**Details:** When results are loaded, enable the tradeoff controls. When mesh is removed, disable them.

### Task 3.3 — Increase drop zone icon
**File:** `frontend/index.html`
**Details:** In the `#drop-zone` SVG, change `width="14" height="14"` to `width="28" height="28"`. Change the icon class from `icon--sm` (if applied in Task 1.5) or keep ad-hoc sizing.
**File:** `frontend/src/style.css`
**Details:** Adjust `#drop-zone` padding if needed after the icon size increase.

### Task 3.4 — Reduce viewport header density
**File:** `frontend/index.html`
**Details:** Group the 4 icon buttons (`btn-reset-cam`, `btn-labels`, `btn-beam`, `btn-fullscreen`) inside a single dropdown "more" button that reveals them on click.
Alternatively: move `vp-actions` to a second row below the main header bar when the viewport is in a specific layout mode.
**File:** `frontend/src/style.css`
**Details:** Add styles for the dropdown/menu overflow pattern.
**File:** `frontend/src/main.js`
**Details:** Add click handler for the overflow menu toggle.

---

## Summary

| Task | Type | Risk | File(s) | Dependencies |
|------|------|------|---------|--------------|
| 0.1 | CSS token | None | style.css | — |
| 0.2 | CSS token | None | style.css | — |
| 0.3 | CSS token | None | style.css | — |
| 1.1 | CSS apply | Low | style.css | 0.1 |
| 1.2 | CSS apply | Low | style.css | 0.1 |
| 1.3 | CSS apply | Low | style.css | 0.1 |
| 1.4 | CSS apply | Low | style.css | 0.1 |
| 1.5 | HTML | Low | index.html | 0.2 |
| 1.6 | CSS apply | Low | style.css | 0.3 |
| 2.1 | CSS change | Medium | style.css | — |
| 2.2 | CSS audit | Low | style.css | — |
| 2.3 | CSS change | Low | style.css | — |
| 2.4 | CSS change | Low | style.css | — |
| 3.1 | CSS change | Low | style.css | — |
| 3.2 | CSS+JS | Medium | index.html, style.css, optimizer.js | — |
| 3.3 | CSS+HTML | Low | index.html, style.css | 1.5 |
| 3.4 | CSS+JS+HTML | Medium | index.html, style.css, main.js | — |

**Atomic commit rule enforced: one numbered task = one commit.**
