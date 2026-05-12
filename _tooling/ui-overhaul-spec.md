# PenOpt UI Overhaul — Spec-Driven Implementation Plan

**Based on:** `_tooling/ui-ux-audit.md` (2026-05-12 audit, 5.5/10 score)
**Scope:** `frontend/index.html`, `frontend/src/style.css`, `frontend/src/main.js`,
`frontend/src/optimizer.js`, `frontend/src/materials.js`
**Approach:** Group related issues into 8 batches. Batches are sequenced by dependency:
critical foundations first, then accessibility, then progressive enhancement.

---

## BATCH ORDER

| # | Batch | Priority | Estimated Size |
|---|-------|----------|----------------|
| 1 | Step System + Card State | 🔴 Fix Immediately | Small |
| 2 | Accessibility Foundation | 🔴 Fix Immediately | Medium |
| 3 | Mesh Removal + State Feedback | 🟡 Fix Soon | Small |
| 4 | Visual Polish & Spacing | 🟡 Fix Soon | Medium |
| 5 | Layout Controls & Summary Bar | 🟡 Fix Soon | Medium |
| 6 | Design System Utilities | 🟢 Fix If Time | Small |
| 7 | Help Content Accuracy | 🟢 Fix If Time | Small |
| 8 | Small Polish & Cleanup | 🟡 Fix If Time | Small |

---

## BATCH 1 — Step System + Card State

**Issues addressed:** 1.1, 1.2, 4.1, 2.1

### 1.1 Requirements

**User Story 1:** As a user, I want the sidebar to clearly communicate which workflow steps are active and collapsed, so I know where I am in the process.

```
WHEN a mesh is NOT loaded THEN the sidebar SHALL show:
  - Step 1 "Upload" in open/active state with its drop-zone visible
  - Step 2 "Material" in collapsed state with chevron indicator
  - Step 3 "Optimize" in collapsed state with chevron indicator

WHEN a mesh IS loaded THEN the sidebar SHALL show:
  - Step 1 "Upload" in open state showing mesh file metadata (name, triangles, watertight dot)
  - Step 2 "Material" in OPEN state with current material name visible in card header subtitle
  - Step 3 "Optimize" in OPEN state ready for the user to click Optimize

WHEN a material is selected THEN the Material card header SHALL display
  "{MaterialName}" as a subtitle below "2 Material" (e.g., "2 Material — Aluminum")

WHEN the page loads with a previously loaded mesh in localStorage THEN
  the Material and Optimize cards SHALL auto-open on load.
```

**User Story 2:** As a user, I want the header beam pills to be scannable and self-explanatory, so I understand what values they represent before configuring anything.

```
WHEN no material is loaded THEN the header pills SHALL show "-- keV", "-- Tmin", "-- keV eff"
  with NO additional label required (the pill values are self-explanatory after a hover)

WHEN a material IS loaded THEN the header pills SHALL show live values
  (e.g., "76 keV", "0.10% Tmin", "68 keV eff")
```

---

### 1.2 Design Decisions

**D1: Remove step-number badges from card headers**

Decision: Replace step number badges (blue circles "1", "2", "3") with a single progress
indicator bar at the top of the sidebar showing "Step N of 3" when no mesh is loaded,
and a checklist-style indicator when a mesh is loaded.

Rationale: The current step badges create visual noise and are inconsistent (Advanced
Controls has no badge). A unified progress indicator communicates the same information
without creating hierarchy conflicts.

**D2: Material card header shows current material name**

Decision: Add a card-header subtitle line showing the selected material name.
Format: `"Material — {materialName}"` in `--text-dim` color below the main header text.

Implementation: In `selectMaterial()` in `materials.js`, also update the card head
subtitle element. In HTML add `<div class="mat-current-name" id="mat-current-name"></div>`
inside the Material card head.

**D3: Auto-open cards after mesh load**

Decision: In `handlePickedMesh()` in `main.js`, after `setOptimizeBtnState({ enabled: true })`
add calls to open the Material and Optimize accordion cards (add `.open` class and
remove `display: none` from their `.acc-body` elements).

---

### 1.3 Task Sequence

```
TASK 1.1 — Add progress indicator to sidebar
  Files: index.html, style.css
  - Remove `.step-num` badge elements from card-head divs
  - Add `<div class="sidebar-progress" id="sidebar-progress">...</div>` at top of #sidebar
    before card-upload. Shows "Step 1 of 3 — Load a mesh to begin"
  - When mesh loaded: update progress to "Step 2 of 3 — Configure material"
  - When optimization complete: update to "Step 3 of 3 — Review results"
  CSS: `.sidebar-progress` — small bar, 32px tall, bg var(--bg3), text centered 10px mono

TASK 1.2 — Add material name subtitle to Material card header
  Files: index.html, materials.js, style.css
  HTML: In `#card-material .card-head`, add `<span class="mat-subtitle" id="mat-subtitle"></span>`
  CSS: `.mat-subtitle { font-size: 9px; color: var(--text-muted); font-weight: 400; margin-left: var(--sp-1); }`
  JS: In `selectMaterial(id)` in materials.js, after setting S.materialID:
    const el = document.getElementById('mat-subtitle');
    const mat = S.mats.find(m => m.id === id);
    if (el && mat) el.textContent = '— ' + mat.name;
    // Also called on init to show "Aluminum" if default material is auto-selected

TASK 1.3 — Auto-open Material + Optimize cards on mesh load
  Files: main.js
  In `handlePickedMesh()` after `setOptimizeBtnState({ enabled: true })`:
    - Remove 'hidden' from card-material and card-optimize if present
    - Add 'open' class to both cards if not present
    - Update sidebar progress text to "Step 2 of 3"
  In `removeMesh()` when removing mesh, reset sidebar progress to "Step 1 of 3"
  In `init()` on first load with no mesh: keep Material + Optimize collapsed (current behavior)

TASK 1.4 — Header pills already show values — add aria-labels for screen readers
  Files: index.html
  Add `aria-label="Beam energy: {value} keV"` to each pill span.
  Add `aria-live="polite"` to the status bar text element.
```

---

## BATCH 2 — Accessibility Foundation

**Issues addressed:** 10.1, 10.2, 10.3

### 2.1 Requirements

**User Story 1:** As a keyboard-only user, I want all interactive elements to show their
tooltip on focus, not just on hover, so I can use the app without a mouse.

```
WHEN any element with data-tip attribute receives :focus-visible THEN
  the tooltip SHALL be shown using the same styling as the hover tooltip.

WHEN any element with data-tip attribute loses :focus-visible THEN
  the tooltip SHALL be hidden.
```

**User Story 2:** As a user with low vision, I want all text to meet WCAG AA contrast
requirements (4.5:1 for normal text, 3:1 for large text), so I can read all content.

```
WHEN amber-tinted warning backgrounds are displayed THEN
  the text color SHALL be var(--amber-300) (#fcd34d) or darker,
  achieving at least 4.5:1 contrast ratio against the tinted background.
```

**User Story 3:** As a keyboard user, I want all custom interactive elements (filter buttons,
material items, method toggles, plot tabs) to show a visible focus ring when I Tab to them.

```
WHEN any .filter-btn, .mat-item, .tradeoff-stop, .method-btn, .plot-tab, .tradeoff-stop
  receives :focus-visible THEN a visible 2px accent-colored outline SHALL appear
  with 2px offset, matching the existing outline style.
```

---

### 2.2 Design Decisions

**D1: Fix [data-tip] to work on :focus-visible**

Decision: Extend the existing CSS `[data-tip]:hover::after` rule to also match
`:focus-visible`. Add `[data-tip]:focus-visible::after` with identical content and
`[data-tip]:focus-visible::before` for the arrow. This is a pure CSS change — no JS required.

**D2: Fix amber contrast**

Decision: Change `color: var(--amber-500)` in `.is-warning`, `#wt-banner` to
`color: var(--amber-300)`. This achieves ~5.7:1 contrast ratio on the tinted background.
Also update the `--amber-tint` background to `rgba(245, 158, 11, 0.18)` for slightly
more contrast on the container.

**D3: Add :focus-visible to all custom interactive elements**

Decision: Add a single CSS rule that covers all custom interactive elements:
```css
.filter-btn:focus-visible,
.mat-item:focus-visible,
.tradeoff-stop:focus-visible,
.method-btn:focus-visible,
.plot-tab:focus-visible,
.tradeoff-stop:focus-visible,
.vp-mode-btn:focus-visible,
.vp-layout-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

---

### 2.3 Task Sequence

```
TASK 2.1 — Make data-tip tooltips keyboard-accessible
  Files: style.css
  Add after existing [data-tip]:hover rules:
    [data-tip]:focus-visible::after {
      content: attr(data-tip);
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%) scale(0.97);
      padding: 4px 8px;
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      font-size: 10px;
      font-weight: 500;
      font-family: var(--font);
      white-space: nowrap;
      max-width: 260px;
      overflow: hidden;
      text-overflow: ellipsis;
      pointer-events: none;
      z-index: 200;
      box-shadow: var(--shadow-lg);
      line-height: 1.4;
      transform-origin: bottom center;
      transition: transform 125ms var(--ease-out), opacity 125ms var(--ease-out);
      opacity: 1;
    }
    [data-tip]:focus-visible::before {
      content: '';
      position: absolute;
      bottom: calc(100% + 2px);
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: var(--border-light);
      pointer-events: none;
      z-index: 200;
    }

TASK 2.2 — Fix amber contrast to meet WCAG AA
  Files: style.css
  Change in #wt-banner rule:
    FROM: color: var(--amber-500);
    TO:   color: var(--amber-300);
  Change in .is-warning rule:
    FROM: color: var(--amber-500);
    TO:   color: var(--amber-300);
  Change --amber-tint:
    FROM: --amber-tint: rgba(245, 158, 11, 0.1);
    TO:   --amber-tint: rgba(245, 158, 11, 0.18);

TASK 2.3 — Add :focus-visible to all custom interactive elements
  Files: style.css
  Add new rule after :focus-visible base rule:
    .filter-btn:focus-visible,
    .mat-item:focus-visible,
    .tradeoff-stop:focus-visible,
    .method-btn:focus-visible,
    .plot-tab:focus-visible,
    .vp-mode-btn:focus-visible,
    .vp-layout-btn:focus-visible,
    .acc-head:focus-visible,
    .card-head:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
  Also remove tabindex="-1" from any elements that should be focusable.
```

---

## BATCH 3 — Mesh Removal + State Feedback

**Issues addressed:** 2.2, 2.3, 2.4, 5.1, 5.2

### 3.1 Requirements

**User Story 1:** As a user, I want to confirm before removing my loaded mesh, so I don't
accidentally lose my configuration and results.

```
WHEN the user clicks the "Remove" button on a loaded mesh THEN
  the system SHALL display a confirmation dialog: "Remove mesh and clear all results?"
  with two buttons: "Cancel" and "Remove"

WHEN the user confirms removal THEN the system SHALL remove the mesh,
  clear all results, reset the sidebar to pre-load state, and close all accordion cards.

WHEN the user cancels removal THEN the system SHALL take no action and close the dialog.
```

**User Story 2:** As a user, I want visible feedback when I click "Update Search" or "Restore",
so I know my action was registered while the system processes.

```
WHEN the user clicks "Update Search" THEN the button SHALL enter a "loading" state
  (opacity 0.7, text changes to "Updating...") until the optimization starts.

WHEN the user clicks "Restore" THEN the button text SHALL change to "Restoring..."
  for the duration of the restore operation.

WHEN the operation completes THEN the buttons SHALL return to their default state.
```

**User Story 3:** As a user, I want a brief confirmation when I export results, so I know
the download started successfully.

```
WHEN the user clicks "JSON" or "PNG" export button THEN
  the button text SHALL briefly change to "Saved!" for 1500ms,
  then revert to the original label.

WHEN the download fails THEN an error toast SHALL be shown in the error banner.
```

**User Story 4:** As a user, I want the non-watertight warning to be visible in the sidebar
as well as in the viewport, so I don't miss it.

```
WHEN a non-watertight mesh is loaded THEN the system SHALL display
  a warning message in BOTH:
  (a) the floating viewport banner (existing behavior)
  (b) the sidebar file meta row as a second-line item below the watertight dot
      with icon and plain-language text: "⚠ Open edges — values underestimated"
```

---

### 3.2 Design Decisions

**D1: Always confirm mesh removal**

Decision: Make the `confirm()` call in `removeMesh()` unconditional (currently gated
by `S.result` check). Change from:
```js
if (S.result && !confirm(...)) return;
```
to:
```js
if (!confirm('Remove mesh and clear all results?')) return;
```

**D2: Restore banner dismiss button needs higher affordance**

Decision: Replace the × character (14px) with a "Dismiss" text link styled as:
```css
.restore-dismiss {
  font-size: 10px;
  color: var(--text-dim);
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
}
.restore-dismiss:hover { color: var(--text); }
```
This is a one-line text button, no ambiguity about what it does.

**D3: Export button text feedback**

Decision: In `exportJSON()` and `exportPNG()` in `export.js`, temporarily replace
button text for 1500ms. Pass the button element to the export function.
```js
export function exportJSON(result, btn) {
  btn.textContent = 'Saved!';
  // ... download ...
  setTimeout(() => { btn.textContent = '↓ JSON'; }, 1500);
}
```
Update `optimizer.js` to pass `this` to the export call.

---

### 3.3 Task Sequence

```
TASK 3.1 — Unconditional mesh removal confirmation
  Files: filehandler.js
  In removeMesh() function:
    FROM:
      if (S.result && !confirm('Remove current mesh and clear all results?')) return;
    TO:
      if (!confirm('Remove mesh and clear all results?')) return;

TASK 3.2 — "Update Search" loading state
  Files: optimizer.js
  In runOptimization() — detect if called from "Update Search" button:
    - Add data attribute <button id="btn-update-search" data-from="tradeoff">
    - In runOptimization(), check e.target.closest('[data-from]')
    - If triggered from tradeoff, set btn-update-search opacity to 0.7, text to "Updating..."
    - After results shown, reset button state

TASK 3.3 — "Restore" loading state
  Files: main.js
  In the btn-restore click handler:
    FROM: just calls restore logic
    TO:
      const btn = $('btn-restore');
      btn.textContent = 'Restoring...';
      // do restore
      setTimeout(() => { btn.textContent = 'Restore'; }, 1500);

TASK 3.4 — Export button "Saved!" feedback
  Files: export.js
  exportJSON(result) → exportJSON(result, btn)
  exportPNG(renderer, result, text) → exportPNG(renderer, result, text, btn)
  Each sets btn.textContent = '✓ Saved!' for 1500ms, then reverts.
  Files: optimizer.js — update call sites to pass button reference.

TASK 3.5 — Add watertight warning to sidebar file meta
  Files: index.html, filehandler.js, style.css
  HTML: In #file-meta, add a warning row div:
    <div id="wt-sidebar-row" class="hidden">
      <span class="wt-icon">⚠</span>
      <span id="wt-sidebar-text"></span>
    </div>
  CSS:
    #wt-sidebar-row {
      display: flex; align-items: center; gap: 4px;
      padding: 3px 0; font-size: 10px; color: var(--amber-300);
    }
  JS: In handlePickedMesh(), after checking isWatertight:
    const wtRow = $('wt-sidebar-row');
    const wtText = $('wt-sidebar-text');
    if (!info.isWatertight) {
      wtRow.classList.remove('hidden');
      wtText.textContent = 'Open edges — penetration values are underestimated';
    } else {
      wtRow.classList.add('hidden');
    }
  In removeMesh(): add wtRow.classList.add('hidden');
```

---

## BATCH 4 — Visual Polish & Spacing

**Issues addressed:** 3.3, 3.4, 3.5, 8.1, 8.3, 6.2, 11.2

### 4.1 Requirements

**User Story 1:** As a user reading technical results, I want comfortable line height so
I don't lose my place while reading.

```
WHEN body text is displayed THEN the line-height SHALL be at least 1.6
  (currently 1.5) to improve readability of mixed mono/data content.
```

**User Story 2:** As a user configuring scanner geometry, I want number inputs wide enough
to display full values without clipping.

```
WHEN scanner number inputs (SDD, SOD, Det W, Det H, Pixels X, Pixels Y) are displayed THEN
  each input SHALL be at least 80px wide and display values without horizontal overflow.

WHEN filter buttons (4-column grid) are displayed THEN
  the grid SHALL wrap to multiple rows naturally with at least 70px per column.
```

**User Story 3:** As a user, I want the idle prompt icon to be clearly visible so I know
where to drop my file.

```
WHEN the viewport is in idle state (no mesh loaded) THEN
  the idle prompt upload icon SHALL have at least 0.35 opacity.
```

---

### 4.2 Design Decisions

**D1: Increase body line-height to 1.6**

Simple one-line change in `style.css`:
```css
html, body {
  /* FROM: line-height: 1.5; */
  line-height: 1.6;
}
```

**D2: Widen scanner number inputs to 88px**

Change `.scanner-grid input { width: 72px; }` → `width: 88px;`

**D3: Fix filter grid to use auto-fill**

Change `.filter-grid { grid-template-columns: repeat(4, 1fr); }` →
```css
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: var(--sp-1);
}
```

**D4: Inline styles → CSS classes**

Move all recurring inline style patterns to CSS:
- `style="margin-top:6px;..."` → `.mt-2 { margin-top: var(--sp-2); }`
- `style="color:var(--green-500)"` → `.text-green { color: var(--green-500); }`
- `style="padding:0"` → `.p-0 { padding: 0; }`
- `style="margin-top:8px;..."` on optimize btn → `.mt-3 { margin-top: var(--sp-3); }`

**D5: Increase idle prompt icon opacity to 0.4**

Change `ip-icon { opacity: 0.25; }` → `opacity: 0.4;`

**D6: Reduce step badge size**

Change `.step-num { width: 18px; height: 18px; font-size: 10px; }` → `width: 16px; height: 16px; font-size: 9px;`

---

### 4.3 Task Sequence

```
TASK 4.1 — Increase body line-height
  Files: style.css
  html, body { line-height: 1.5; } → line-height: 1.6;

TASK 4.2 — Widen scanner number inputs + fix filter grid layout
  Files: style.css
  .scanner-grid input { width: 72px; } → width: 88px;
  .filter-grid { grid-template-columns: repeat(4, 1fr); } → auto-fill minmax(70px, 1fr)

TASK 4.3 — Move inline styles to CSS utility classes
  Files: style.css, index.html
  Add utilities section at end of style.css:
    /* ── Utilities ── */
    .mt-1 { margin-top: var(--sp-1); }
    .mt-2 { margin-top: var(--sp-2); }
    .mt-3 { margin-top: var(--sp-3); }
    .mt-4 { margin-top: var(--sp-4); }
    .mb-1 { margin-bottom: var(--sp-1); }
    .mb-2 { margin-bottom: var(--sp-2); }
    .mb-3 { margin-bottom: var(--sp-3); }
    .p-0 { padding: 0; }
    .p-2 { padding: var(--sp-2); }
    .p-3 { padding: var(--sp-3); }
    .p-4 { padding: var(--sp-4); }
    .gap-2 { gap: var(--sp-2); }
    .gap-3 { gap: var(--sp-3); }
    .text-green { color: var(--green-500); }
    .text-amber { color: var(--amber-300); }
    .text-red { color: var(--red-500); }
    .text-muted { color: var(--text-muted); }
    .text-dim { color: var(--text-dim); }
    .font-mono { font-family: var(--mono); }
    .w-full { width: 100%; }
    .hidden { display: none !important; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .flex-1 { flex: 1; }
  Then in index.html:
    - Replace inline style on restore-banner with class="mt-2 flex items-center ..."
    - Replace inline style on optimize btn with class="w-full mt-3"
    - Replace inline style on plot-card body with class="p-0"
    - Replace inline style on energy export btns with class="flex gap-2"

TASK 4.4 — Increase idle prompt opacity + reduce step badge size
  Files: style.css
  .ip-icon { opacity: 0.25; } → opacity: 0.4;
  .step-num { width: 18px; height: 18px; font-size: 10px; } → 16px, 16px, 9px
```

---

## BATCH 5 — Layout Controls & Results Summary

**Issues addressed:** 1.4, 3.1, 3.2, 4.2, 4.3, 7.1

### 5.1 Requirements

**User Story 1:** As a user, I want layout mode buttons with clear labels, so I can
instantly understand what each layout does without reading tooltips.

```
WHEN layout buttons are displayed THEN each button SHALL show a visible text label
  (e.g., "Default", "Viewport", "Results") rather than single cryptic letters.

WHEN the user hovers over a layout button THEN a tooltip SHALL show additional
  detail about what that layout specifically changes.
```

**User Story 2:** As a user, I want the results summary bar to use plain language
and clear directional indicators, so I can quickly assess optimization quality.

```
WHEN the results summary bar is displayed THEN:
  - "f_mtl Δ" SHALL be renamed to "Max Penetration ↓"
  - "f_energy Δ" SHALL be renamed to "Energy ↓"
  - The delta value SHALL show a directional arrow indicator:
    - Green down-arrow (↓) when the optimal is better than worst
    - The value shows "X% better" (positive = improvement)
  - A Tuy completeness indicator SHALL be added as a fourth item:
    "Tuy: {value}%" with color: green (>90%), amber (70-90%), red (<70%)
```

**User Story 3:** As a user, I want a layout mode that shows the viewport and results
panel together without the sidebar, for focused review.

```
WHEN the user clicks a layout button THEN the following modes SHALL be available:
  - "Default": sidebar + viewport + results (current behavior)
  - "Viewport": viewport only (current V mode)
  - "Results": viewport + results (NEW — sidebar hidden, results visible)
  - "All": sidebar + viewport + results (same as Default)
```

---

### 5.2 Design Decisions

**D1: Layout buttons get visible 2-letter labels**

Change button text from single letters to short labels:
- "Dflt" (Default — sidebar + VP + Results)
- "VP" (Viewport only)
- "Res" (Viewport + Results)
- "All" (All panels — same as Default)

Update `switchLayoutMode()` in `scene.js` to handle new mode string values.

**D2: Results summary bar redesign**

Rename summary bar labels in HTML and update JS rendering in `showResults()`:
- `rs-fmtl` label: "f_mtl Δ" → "Max Penetration"
- `rs-fenergy` label: "f_energy Δ" → "Energy Demand"
- Delta values: show as "X% better" with green color (not "+X%" which reads as increase)
- Add `rs-tuy` item after f_energy items

**D3: Add "Results" layout mode**

In `scene.js switchLayoutMode()`:
```js
case 'results': {
  sb.style.display = 'none';
  res.style.display = '';
  res.classList.remove('hidden');
  break;
}
```
In `main.js`, update the fourth layout button (currently "R") to "Res" with mode="results".

**D4: Scanner preset name in accordion header**

In `materials.js setupScannerPresets()`:
```js
sel.addEventListener('change', () => {
  const p = S.presets.find(x => x.id === sel.value);
  // ... existing geometry update code ...
  // Update accordion header
  const accVal = $('acc-scanner-val');
  if (accVal) {
    if (p && p.id !== 'custom') {
      accVal.textContent = p.name;  // Show preset name
    } else {
      accVal.textContent = p.sdd + '/' + p.sod;  // Fall back to geometry values
    }
  }
});
```

---

### 5.3 Task Sequence

```
TASK 5.1 — Replace layout button single-letter labels with 2-letter labels
  Files: index.html, scene.js
  HTML: <button class="vp-layout-btn" data-layout="default" data-tip="Default layout">Dflt</button>
        <button class="vp-layout-btn" data-layout="viewport" data-tip="Viewport only">VP</button>
        <button class="vp-layout-btn" data-layout="results" data-tip="Viewport + results">Res</button>
        <button class="vp-layout-btn" data-layout="all" data-tip="All panels">All</button>
  scene.js: Add case 'all': → same as default layout (show all three panels)
  Update active button styling to use .active class (already works)

TASK 5.2 — Redesign results summary bar with plain language
  Files: index.html, optimizer.js, style.css
  HTML: Change summary bar item labels in the rs-items:
    FROM: f_mtl Δ / f_energy Δ
    TO:   Max Penetration / Energy Demand / Tuy %
  Add rs-tuy item between rs-energy and rs-fmtl:
    <div class="rs-item">
      <span class="rs-lbl">Tuy</span>
      <span class="rs-val" id="rs-tuy">--</span>
    </div>
  optimizer.js showResults():
    - After computing best/worst scores, compute tuyPct = bestScore.fTuy * 100
    - Set $('rs-tuy').textContent tuyPct.toFixed(0) + '%'
    - Color rs-tuy based on tuyPct: >90 green, 70-90 amber, <70 red
    - Change delta display to show "X% better" with green text
    - Update label text: $('rs-fmtl').previousElementSibling.textContent = 'Max Penetration'
      (use textContent assignment rather than DOM rebuilding)

TASK 5.3 — Add "Results" layout mode (viewport + results, no sidebar)
  Files: scene.js
  switchLayoutMode('results') {
    sb.style.display = 'none';
    res.style.display = '';
    res.classList.remove('hidden');
  }

TASK 5.4 — Scanner preset name in accordion header
  Files: materials.js
  In setupScannerPresets change handler: update acc-scanner-val to show preset name
  Add fallback to geometry values for 'custom'

TASK 5.5 — Dynamic grid-info text based on ray sampling slider
  Files: materials.js, main.js
  In sl-raygrid 'input' event handler, also update #grid-info text:
    function updateGridInfo(rayGrid) {
      const coarse = rayGrid === 0 ? 8 : rayGrid;
      const fine = Math.min(coarse * 2, 32);
      const timeLabel = rayGrid <= 8 ? '~10s-1m' : rayGrid <= 16 ? '~20s-2m' : '~1-5m';
      $('grid-info').textContent = coarse + '×' + coarse + ' coarse / ' + fine + '×' + fine + ' fine · ' + timeLabel;
    }
```

---

## BATCH 6 — Design System Utilities

**Issues addressed:** 6.1, 6.3, 11.1

### 6.1 Requirements

**User Story 1:** As a developer, I want the logo SVG to respond to CSS theme changes, so
the brand color updates automatically when the accent color changes.

```
WHEN the CSS accent color variable is updated THEN
  the header logo SVG SHALL automatically reflect the new color.
```

**User Story 2:** As a developer, I want consistent semantic color utility classes, so
I can apply semantic colors without writing custom CSS each time.

```
WHEN applying semantic colors in the UI THEN the following classes SHALL be available:
  .text-success → green-500
  .text-warning → amber-300
  .text-error → red-500
  .text-primary → accent
  .bg-success-tint → green-tint
  .bg-warning-tint → amber-tint
  .bg-error-tint → red-tint
  .bg-accent-tint → accent-tint
```

---

### 6.2 Design Decisions

**D1: SVG logo uses currentColor**

Replace `fill="#3b82f6"` with `fill="currentColor"` on the SVG rect element.
Add `color: var(--accent)` on `.header-logo` CSS class. This way the logo inherits
the CSS accent color automatically.

**D2: Semantic color utility classes**

Add at end of style.css under a `/* ── Semantic Utilities ── */` section:
```css
.text-primary { color: var(--accent); }
.text-success { color: var(--green-500); }
.text-warning { color: var(--amber-300); } /* amber-300 for contrast on tinted bg */
.text-error   { color: var(--red-500); }
.text-accent  { color: var(--accent); }
.bg-success-tint { background: var(--green-tint); }
.bg-warning-tint { background: var(--amber-tint); }
.bg-error-tint   { background: var(--red-tint); }
.bg-accent-tint  { background: var(--accent-tint); }
.border-success  { border-color: var(--green-500); }
.border-warning  { border-color: var(--amber-500); }
.border-error    { border-color: var(--red-500); }
```

---

### 6.3 Task Sequence

```
TASK 6.1 — Make SVG logo use currentColor
  Files: index.html, style.css
  HTML: Change <rect width="100" height="100" rx="20" fill="#3b82f6"/>
        TO: <rect width="100" height="100" rx="20" fill="currentColor"/>
  Add to style.css:
    .header-logo { color: var(--accent); }

TASK 6.2 — Add semantic color utility classes
  Files: style.css
  Add "/* ── Semantic Utilities ── */" section at end of file with classes listed in D2 above.

TASK 6.3 — Use .accent class consistently throughout (audit)
  Files: style.css, index.html
  Audit for direct `color: var(--accent)` usage vs .accent class.
  Apply .accent class where appropriate, remove .accent class definition
  if it becomes redundant (or keep it as a shortcut).
```

---

## BATCH 7 — Help Content Accuracy

**Issues addressed:** 9.1, 9.2

### 7.1 Requirements

**User Story 1:** As a user reading the help modal, I want accurate information about how
the system works, so I don't have incorrect expectations.

```
WHEN the help modal "How It Works" section is displayed THEN
  it SHALL describe the ACTUAL system with 3 active objectives (not 5),
  and SHALL NOT mention f_bh as an active objective.

WHEN the help modal "How It Works" section shows numbered steps THEN
  the steps SHALL correspond to the actual UI sections (3 numbered cards + Advanced Controls).
```

---

### 7.2 Task Sequence

```
TASK 7.1 — Update help modal content to match actual system
  Files: index.html
  Replace the "How It Works" section of #help-body with:
    <h3>Overview</h3>
    <p>PenOpt finds the optimal tilt (θ) and rotation (φ) angles for scanning a part in an X-ray CT system. It casts rays through your 3D mesh, evaluates three objectives per orientation, and returns the best angles plus a kV recommendation.</p>

    <h3>How It Works</h3>
    <p><strong>1.</strong> Upload an STL or OBJ mesh. The app centers it at the origin and builds a BVH for fast ray casting.</p>
    <p><strong>2.</strong> Pick a material from the NIST XCOM database (40+ options). Set beam energy and minimum transmission (Tmin).</p>
    <p><strong>3.</strong> Choose a scanner preset or configure SDD, SOD, and detector geometry manually. Optionally add a beam pre-filter.</p>
    <p><strong>4.</strong> Select a weight preset (Quality / Balanced / Energy) and scoring method (Minimax / Weighted). Adjust the search range.</p>
    <p><strong>5.</strong> Click Optimize. A coarse 15° grid is searched first, then the top 3 candidates are refined at 1° resolution.</p>
    <p><strong>6.</strong> Review the results: optimal angles, energy recommendation, Tuy completeness warning, score contour plot, and penetration rose.</p>
    <p><strong>7.</strong> Export as JSON (full data) or PNG (screenshot with summary).</p>

    <h3>Objective Functions</h3>
    <ul>
      <li><strong>f<sub>mtl</sub></strong> — Generalized mean of X-ray path lengths (m=3, cube-root). Lower = less artifact from thick cross-sections.</li>
      <li><strong>f<sub>energy</sub></strong> — Maximum path length. Determines the required X-ray tube voltage.</li>
      <li><strong>f<sub>hdn</sub></strong> — Range of max path lengths across projections. Lower = more isotropic ray coverage.</li>
    </ul>
    <p><em>Note: Tuy-Smith completeness is tracked and shown as a warning when below 90%. Beam-hardening (f_bh) is planned for a future release.</em></p>

    <h3>Keyboard Shortcuts</h3>
    <ul>
      <li><kbd>Ctrl+O</kbd> — Open file dialog</li>
      <li><kbd>Ctrl+Enter</kbd> — Start optimization</li>
      <li><kbd>Esc</kbd> — Dismiss error / help overlay</li>
      <li><kbd>1</kbd>/<kbd>2</kbd>/<kbd>3</kbd> — View mode: 3D / Heatmap / Compare</li>
      <li><kbd>R</kbd> — Reset camera</li>
      <li><kbd>F</kbd> — Toggle fullscreen</li>
    </ul>
```

---

## BATCH 8 — Small Polish & Cleanup

**Issues addressed:** 8.2, 5.1, 3.2

### 8.1 Requirements

**User Story 1:** As a user, I want the restore banner dismiss button to be clear and accessible.

```
WHEN the restore banner is displayed THEN the dismiss control SHALL be
  a "Dismiss" text button at least 24px tall with visible text, not a × character.
```

---

### 8.2 Task Sequence

```
TASK 8.1 — Replace × dismiss button with "Dismiss" text link
  Files: index.html, style.css
  HTML: Replace <button id="btn-restore-dismiss" style="...font-size:14px">&times;</button>
        WITH: <button id="btn-restore-dismiss" class="restore-dismiss">Dismiss</button>
  CSS: .restore-dismiss {
    font-size: 10px;
    color: var(--text-dim);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: var(--radius-sm);
  }
  .restore-dismiss:hover { color: var(--text); }

TASK 8.2 — Dynamic grid-info text
  Already covered in TASK 5.5 — move to BATCH 5 and implement there.

TASK 8.3 — Fix results card grid auto-fit → auto-fill
  Files: style.css
  #results-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
  →
  #results-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
```

---

## TASK MASTER LIST

All tasks flattened into a single sequential list for agent handoff:

```
BATCH 1 — Step System + Card State
  [ ] 1.1 Add sidebar progress indicator
  [ ] 1.2 Add material name subtitle to Material card header
  [ ] 1.3 Auto-open Material + Optimize cards on mesh load
  [ ] 1.4 Add aria-labels to header pills

BATCH 2 — Accessibility Foundation
  [ ] 2.1 Make data-tip tooltips keyboard-accessible (add :focus-visible rules)
  [ ] 2.2 Fix amber contrast (amber-500 → amber-300 on tinted backgrounds)
  [ ] 2.3 Add :focus-visible to all custom interactive elements

BATCH 3 — Mesh Removal + State Feedback
  [ ] 3.1 Unconditional mesh removal confirmation
  [ ] 3.2 "Update Search" loading state
  [ ] 3.3 "Restore" loading state
  [ ] 3.4 Export button "Saved!" feedback
  [ ] 3.5 Add watertight warning to sidebar file meta

BATCH 4 — Visual Polish & Spacing
  [ ] 4.1 Increase body line-height to 1.6
  [ ] 4.2 Widen scanner number inputs (72px → 88px) + fix filter grid
  [ ] 4.3 Move inline styles to CSS utility classes
  [ ] 4.4 Increase idle prompt opacity + reduce step badge size

BATCH 5 — Layout Controls & Results Summary
  [ ] 5.1 Replace layout button single-letter labels with 2-letter labels
  [ ] 5.2 Redesign results summary bar (plain language + Tuy indicator)
  [ ] 5.3 Add "Results" layout mode (viewport + results, no sidebar)
  [ ] 5.4 Scanner preset name in accordion header
  [ ] 5.5 Dynamic grid-info text based on ray sampling slider

BATCH 6 — Design System Utilities
  [ ] 6.1 Make SVG logo use currentColor
  [ ] 6.2 Add semantic color utility classes
  [ ] 6.3 Audit and consolidate .accent class usage

BATCH 7 — Help Content Accuracy
  [ ] 7.1 Update help modal content to match 3-active-objective system

BATCH 8 — Small Polish & Cleanup
  [ ] 8.1 Replace × dismiss button with "Dismiss" text link
  [ ] 8.2 Fix results card grid auto-fit → auto-fill
```

---

## IMPLEMENTATION NOTES

### File Ownership

| File | Batches |
|------|---------|
| `frontend/index.html` | 1.1, 1.2, 3.5, 4.3, 5.1, 5.2, 6.1, 7.1, 8.1 |
| `frontend/src/style.css` | 1.1, 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 4.4, 5.2, 6.1, 6.2, 8.1, 8.2 |
| `frontend/src/main.js` | 1.3, 1.4, 3.3, 5.1, 5.5 |
| `frontend/src/optimizer.js` | 3.2, 3.4, 5.2, 5.5 |
| `frontend/src/materials.js` | 1.2, 5.4, 5.5 |
| `frontend/src/filehandler.js` | 3.1, 3.5 |
| `frontend/src/export.js` | 3.4 |
| `frontend/src/scene.js` | 5.1, 5.3 |

### Testing Checklist (per batch)

After completing each batch, verify:
1. No regression in existing functionality (load mesh, run optimization, export)
2. All keyboard navigation works (Tab through all interactive elements)
3. Tooltips appear on both hover and focus
4. No console errors
5. Reduced motion preference respected
6. Layout works at 1280×800 and at wider breakpoints

### Parallelization Guidance

Batches 1–4 can be implemented in parallel (different files/minimal overlap).
Batch 5 requires reading Batch 1 output (progress indicator affects layout).
Batches 6–8 are independent and can run in parallel after Batch 4.

### Design Token Reference

All spacing values must use CSS variables (`--sp-1` through `--sp-12`).
All colors must use CSS variables (never hardcoded hex in CSS rules).
All transitions must use `--ease-out` or `--ease-spring` (no `linear` easing).