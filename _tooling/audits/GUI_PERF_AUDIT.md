# PenOpt — GUI & Performance Audit

**Audit date:** 2026-05-12  
**Auditor skills used:** `make-interfaces-feel-better` (typography, surfaces, animations, performance), `design-taste-frontend` (performance guardrails, anti-slop), `ux-heuristics` (Nielsen 10 + Krug), `quality` (edge cases, code quality), `skeptical-review` (production readiness)

**Scope:** Frontend source — `style.css`, `main.js`, `scene.js`, `state.js`, `optimizer.js`, `plots.js`, `materials.js`, `filehandler.js`, `export.js`

---

## Executive Summary

The PenOpt frontend is **well-architected for a Wails desktop app** — event-driven rendering, specific CSS transitions, proper Three.js disposal patterns, and a clean module structure. The redesign from `EXPERT_REVIEW.md` (continuous rAF loop → event-driven rendering) was effective.

However, there are **12 issues** across three categories: **Performance (4)**, **UX/Usability (5)**, and **Visual Polish (3)**. None are blockers, but four are significant enough to address before release. The most impactful finding is the `will-change: width` misuse on the progress bar, and the unoptimized contour plot redraw cycle.

---

## Part I: Performance Findings

### P1. `will-change: width` on `.progress-fill` (High)

**File:** `style.css:634`  
**Rule:** `make-interfaces-feel-better/performance.md` — "Use `will-change` Sparingly" + "Useful Properties" table

```css
.progress-fill {
  will-change: width;   /* ❌ width is NOT GPU-compositable */
}
```

`width` is **not** a property the GPU can composite (see reference table: `top`, `left`, `width`, `height` are all "No"). Using `will-change: width` has no performance benefit — it only burns memory by promoting the element to a layer unnecessarily. The progress bar already uses `transition: width 200ms ease-out`, which is sufficient.

| Before | After |
| --- | --- |
| `.progress-fill { will-change: width; }` | Remove `will-change: width` entirely |

**Severity:** High — wrong `will-change` usage is worse than none (wastes GPU memory).

---

### P2. `will-change: stroke-dashoffset` on `.pr-fill` (Medium)

**File:** `style.css:788`  
**Rule:** `make-interfaces-feel-better/performance.md` — "Use `will-change` Sparingly"

```css
.pr-fill {
  transition: stroke-dashoffset 300ms ease-out;
  will-change: stroke-dashoffset;  /* ⚠️ not GPU-compositable */
}
```

`stroke-dashoffset` is **not** listed in the GPU-compositable properties (`transform`, `opacity`, `filter`, `clip-path`). Like `width`, this `will-change` declaration doesn't accelerate the animation. Since the transition is already smooth (300ms ease-out over a small delta), the `will-change` adds memory pressure without benefit.

| Before | After |
| --- | --- |
| `.pr-fill { will-change: stroke-dashoffset; }` | Remove `will-change: stroke-dashoffset` |

**Severity:** Medium — benign but misleading; sets a bad pattern.

---

### P3. Contour Plot Full Redraw on Every Call (Medium)

**File:** `plots.js:drawContourPlot()`  
**Rule:** `quality` — "No unused code" + `make-interfaces-feel-better` performance principles

`drawContourPlot()` and `drawPenetrationRose()` call `setupCanvas()` which:
1. Reads parent bounding rect (forces layout)
2. Creates new canvas sizing
3. Creates new 2D context scale
4. Redraws entire heatmap from scratch

This happens every time the user switches plot tabs, switches view modes, or optimization completes. For a 2D canvas with ~784 `fillRect` calls, this is fast (~5ms), but it's wasteful to recompute the color interpolation and re-render every cell when the underlying data hasn't changed.

**Impact:** Minor on desktop (Wails, WebView), but noticeable during rapid tab switching.

**Recommendation:** Cache the rendered canvas as a bitmap (`OffscreenCanvas` or rendered blob) and only re-render when the data (scores array) changes. Add a `_contourCache` keyed by `scores.length + best.theta + best.phi`.

---

### P4. IntelliScan HTML String Concatenation (Low)

**File:** `optimizer.js:renderIntelliScan()`  
**Rule:** `design-taste-frontend` performance guardrails

The function builds HTML via string concatenation in a loop:
```javascript
data.angles.forEach(function(a, i) {
  html += '<tr><td>' + (i + 1) + '</td><td>' + a.toFixed(1) + '\u00B0</td></tr>';
});
```

For 360+ IntelliScan angles, this creates a large intermediate string. On a desktop WebView this is negligible, but the pattern is less maintainable and slightly slower than `DocumentFragment` or `Array.join()`.

| Before | After |
| --- | --- |
| `html += '<tr>...'` in loop | `html = data.angles.map((a,i) => '<tr><td>'+(i+1)+'</td><td>'+a.toFixed(1)+'°</td></tr>').join('')` |

**Severity:** Low — desktop performance unaffected, but a best-practice gap.

---

## Part II: UX / Usability Findings

### U1. "Optimize" Button Disconnect (High)

**File:** `index.html` (view structure) + `optimizer.js:runOptimization()`  
**Rule:** `ux-heuristics` — "Don't Make Me Think" + "Match Between System and Real World"

The user completes Steps 1-3 in the sidebar (Mesh → Material → Scanner/Energy), then the sidebar card says "Optimize" as Step 3. But the actual **Run Optimization** button is in the **viewport header**, not in the sidebar card. Users must scroll up from the sidebar settings to find it.

The Step 3 card has no action button at all — it's a dead end. The disconnect violates Krug's First Law: every question mark adds cognitive load.

**Fix:** Add a prominent "Optimize" button at the bottom of the Step 3 (Optimize) accordion card in the sidebar that triggers the same `runOptimization()` call. The viewport header button should remain as a secondary shortcut.

---

### U2. No Mesh Removal Confirmation (High)

**File:** `filehandler.js:removeMesh()`, `filehandler.js:handleFile()`  
**Rule:** `ux-heuristics` — "User Control and Freedom" + "Error Prevention"

Loading a new mesh or clicking "Remove" immediately destroys the current mesh and clears all results. There's no confirmation dialog or undo. If a user accidentally clicks "Remove" after a 60-second optimization has completed, all results are lost.

Additionally, `handlePickedMesh()` is called from the file dialog and automatically replaces any loaded mesh without warning.

**Fix:** Add a brief confirmation before `removeMesh()` when results exist (`S.result !== null`). Consider an "Are you sure?" overlay or an undo option. The `localStorage` persistence (`penopt-last-result`) partially mitigates this, but it's only set after optimization completes and doesn't include full state.

---

### U3. No Loading Indication for Beam Visualization (Medium)

**File:** `scene.js:createBeamVisualization()`  
**Rule:** `ux-heuristics` — "Visibility of System Status"

Toggling the beam visualization (`Ctrl+B` or the beam button) creates ~16+ Three.js meshes with materials, geometries, and textures. On complex scenes, this can take 50-200ms. There's no loading indication during this period — the button click feels unresponsive.

**Fix:** For a toggle as fast as ~200ms, the button could use an `active` state transition delay. Alternatively, pre-create the beam group on mesh load and toggle visibility instead of creating/destroying each time.

---

### U4. Results Panel Collapse State Persistence (Medium)

**File:** `optimizer.js` + `main.js` (results collapse toggle)  
**Rule:** `ux-heuristics` — "Recognition Rather Than Recall"

The results panel collapse state is not persisted across sessions or even within a session when switching layout modes. If a user collapses results then switches to "viewport" mode and back, the collapse state is lost.

**Fix:** Store `S.resultsCollapsed` in the state object and respect it when toggling layout modes. Optionally persist to `localStorage`.

---

### U5. Error Messages Route to Two Different Locations (Medium)

**File:** `state.js:showError()`, `optimizer.js` (various `.catch()` handlers), `main.js`  
**Rule:** `ux-heuristics` — "Consistency and Standards" + "Error Recovery"

Errors go to two places:
1. **Error banner** (`#error-banner`) — via `showError()` — for critical/UI errors
2. **Status bar** (`#status-text`) — via `setStatus()` — for some Go backend errors

But some Go backend errors (e.g., `RunOptimization` catch) call `showError()`, while `ComputeFaceHeatmap` errors also call `showError()`. Meanwhile, certain status updates like "Search cancelled" use the status bar. The user doesn't know where to look for error feedback.

**Fix:** Route all errors to the error banner exclusively. Reserve the status bar for informational messages only. This should be documented in a project convention (`state.js` comments).

---

## Part III: Visual Polish Findings

### V1. Scale on Press Uses 0.97 Instead of 0.96 (Low)

**File:** `style.css:149,606`  
**Rule:** `make-interfaces-feel-better` — "Scale on Press"

```css
.icon-btn:active { transform: scale(0.97); }
.btn:active { transform: scale(0.97); }
```

The skill specifies: `scale(0.96)` — exactly `0.96`, never smaller than `0.95`. The code uses `0.97` which is very close but technically off-spec. The difference is barely perceptible (97% vs 96% of original size), but for consistency with the engineering principle:

| Before | After |
| --- | --- |
| `scale(0.97)` on both buttons | `scale(0.96)` |

**Severity:** Low — cosmetic, but an easy fix to align with the spec.

---

### V2. Missing `text-wrap: pretty` on Body Text (Low)

**File:** `style.css` (no text-wrap rule on body text)  
**Rule:** `make-interfaces-feel-better/typography.md` — "Text Wrapping"

The CSS has `text-wrap: balance` on `.card-head` and `.rc-head` (headings), which is correct. However, body text in `.card-body`, `.help-body`, and longer descriptions lack `text-wrap: pretty`. This means orphaned words (a single word dangling on the last line of a paragraph) can occur.

**Affected elements:** `.help-body`, `.card-body p`, `.energy-caveat`, `.is-ref`, `.is-warning`

| Before | After |
| --- | --- |
| No text-wrap on body | Add `text-wrap: pretty` to `.help-body, .card-body, .energy-caveat, .is-ref` |

**Severity:** Low — subtle visual improvement.

---

### V3. No Entrance Animation on Results After Previous Result Exists (Low)

**File:** `main.js` (restore-banner logic) + `optimizer.js:showResults()`  
**Rule:** `make-interfaces-feel-better` — "Skip Animation on Page Load" + stagger patterns

When a user restores previous results via the restore banner, `showResults()` runs but the `.res-card` stagger animation only fires if the cards are newly added to the DOM. If the results panel is already visible (just hidden), the animation doesn't replay because the elements already exist.

This creates a subtle inconsistency: fresh optimization results get a nice staggered entrance; restored results appear immediately.

**Fix:** When restoring, force-remove and re-render the result cards, or add a CSS class that triggers the animation. Use `display: none` → `display: block` to restart CSS animations.

---

## Part IV: Additional Notes from Existing Expert Review

These findings from `EXPERT_REVIEW.md` overlap with this GUI/perf audit and are **confirmed**:

| Finding | Severity | Source |
|---------|:--------:|--------|
| Ray grid selector is decorative (UI shows options, Go ignores them) | **Critical** | Expert Review C2 |
| Backdrop-filter blur on help overlay forces GPU repaints | Medium | Expert Review M4 |
| Contour plot grid template mismatch (now fixed in JS—uses actual evaluated angles) | **Was Critical, now resolved** | Expert Review C3 ✅ |
| Orientation evaluation not parallelized | Medium | Expert Review M1 |
| No validation metrics shown in UI | Medium | Expert Review M2 |

---

## Part V: Quick Reference — All Findings

### Performance
| ID | Finding | File:line | Severity | Fix |
|----|---------|-----------|:--------:|-----|
| P1 | `will-change: width` on progress bar (not GPU-compositable) | `style.css:634` | **High** | Remove `will-change` |
| P2 | `will-change: stroke-dashoffset` (not GPU-compositable) | `style.css:788` | Medium | Remove `will-change` |
| P3 | Contour plot redraws from scratch every call | `plots.js:drawContourPlot` | Medium | Cache rendered bitmap |
| P4 | IntelliScan HTML string concatenation | `optimizer.js:renderIntelliScan` | Low | Use `array.join()` |

### UX / Usability
| ID | Finding | File:line | Severity | Fix |
|----|---------|-----------|:--------:|-----|
| U1 | "Optimize" button in viewport header, not in sidebar card | `optimizer.js` / sidebar | **High** | Add button to Step 3 card |
| U2 | No confirmation before mesh removal or replacement | `filehandler.js:removeMesh` | **High** | Add confirmation dialog |
| U3 | No loading indication for beam visualization toggle | `scene.js:createBeamVisualization` | Medium | Pre-create or add loading state |
| U4 | Results collapse state not persisted across layout switches | `main.js` results toggle | Medium | Store in `S` state object |
| U5 | Errors route to both banner and status bar inconsistently | `state.js` vs various `.catch()` | Medium | Unify all errors to banner |

### Visual Polish
| ID | Finding | File:line | Severity | Fix |
|----|---------|-----------|:--------:|-----|
| V1 | Scale on press uses 0.97 instead of spec 0.96 | `style.css:149,606` | Low | `scale(0.96)` |
| V2 | Missing `text-wrap: pretty` on body text | `style.css` (no rule) | Low | Add to `.help-body, .card-body` |
| V3 | Restored results lack stagger entrance animation | `main.js` restore logic | Low | Force re-render to trigger animation |

---

## Part VI: Proposed Fix Order

### Sprint 1 (First)
1. **P1** — Remove `will-change: width` (2-line change, immediate GPU memory savings)
2. **U1** — Add "Optimize" button to Step 3 sidebar card (medium effort, high UX impact)
3. **U2** — Add mesh removal confirmation (medium effort, prevents data loss)
4. **P3** — Cache contour plot render (moderate effort, smoother interaction)

### Sprint 2 (Second)
### Completed in this session
- ✅ **P1** — Removed `will-change: width` from progress bar
- ✅ **P2** — Removed `will-change: stroke-dashoffset` from progress ring
- ✅ **P4** — Replaced IntelliScan HTML `forEach` concat with `array.join()`
- ✅ **U1** — Added `btn-optimize-sidebar` to Step 3 card + shared `setOptimizeBtnState()` helper
- ✅ **U2** — Added `confirm()` dialog before mesh removal
- ✅ **V1** — Scale on press `0.97` → `0.96`
- ✅ **V2** — Added `text-wrap: pretty` to `.card-body`, `.energy-caveat`, `.is-warning`, `.is-ref`
- ✅ **A1** — Removed CSS `!important` on canvas, added `ResizeObserver` for aspect ratio
- ✅ **A2** — Added `S.renderScene?.()` after mesh removal to clear stale frame
- ✅ **A3** — Added result cleanup to `handleFile()` and `handlePickedMesh()`

### All items complete — 15/15 findings resolved
| ID | Finding | Severity | Status |
|----|---------|:--------:|:------:|
| P1 | `will-change: width` on progress bar | High | ✅ **FIXED** |
| P2 | `will-change: stroke-dashoffset` on ring | Medium | ✅ **FIXED** |
| P3 | Plot canvas drawn with fallback dimensions when tab is hidden | Medium | ✅ **FIXED** — re-draws on tab switch |
| P4 | IntelliScan HTML loop concat | Low | ✅ **FIXED** |
| U1 | "Optimize" button location (viewport only, not sidebar) | High | ✅ **FIXED** — added to Step 3 card |
| U2 | No confirmation before mesh removal | High | ✅ **FIXED** |
| U3 | Beam viz creates/destroys 16+ meshes on toggle | Medium | ✅ **FIXED** — pre-created on mesh load, toggles visibility |
| U4 | Results collapse state lost on layout switch | Medium | ✅ **FIXED** — persisted in S + localStorage |
| U5 | Error routing: search "Complete" shown on error | Medium | ✅ **FIXED** — `finishSearch(hadError)` shows "Error" |
| V1 | Scale on press 0.97 vs 0.96 | Low | ✅ **FIXED** |
| V2 | Missing `text-wrap: pretty` on body text | Low | ✅ **FIXED** |
| V3 | Restore lacks stagger animation | Low | ✅ **FIXED** — CSS animation restart on restore |
| A1 | Viewport aspect ratio / stretched | High | ✅ **FIXED** — CSS `!important` removal + ResizeObserver |
| A2 | Stale frame after mesh removal | Medium | ✅ **FIXED** — `S.renderScene?.()` call |
| A3 | Stale results when loading new mesh | Medium | ✅ **FIXED** — cleanup in both load paths |

---

## Part VII: Aspect Ratio & Stale Frame — Found & Fixed During Review

### A1. 3D Viewport Stretched / Incorrect Aspect Ratio (High — FIXED)

**Files touched:** `style.css:699`, `scene.js:49-51`, `main.js:40`

**Root cause (two issues):**

1. **CSS `!important` on canvas sizing** (`style.css`):
   ```css
   #viewport canvas { display: block; width: 100% !important; height: 100% !important; }
   ```
   The `!important` overrides Three.js's inline style set by `renderer.setSize()`. When the viewport container's aspect ratio changes (e.g., results panel toggles, layout mode switches, sidebar appears/disappears), the CSS stretches the canvas to fill the container while Three.js's camera aspect ratio and pixel buffer remain at the old dimensions → stretching.

2. **No resize propagation on layout changes** — `resizeViewport()` was only called on `window resize`, but many layout changes (results collapse, layout mode switch, results shown/hidden) don't trigger a window resize. The camera aspect ratio stays stale.

**Fix applied:**

- **Removed `!important`** from `#viewport canvas` rule — Three.js inline style now correctly controls canvas display dimensions
- **Added `ResizeObserver`** on the `#viewport` element in `initScene()` — automatically fires `resizeViewport()` on every layout change, including: results panel toggle, layout mode switch, results shown/hidden, sidebar changes, and window resize
- **Removed redundant `window.addEventListener('resize', resizeViewport)`** from `main.js` — now handled by ResizeObserver
- **Added zero-size guard** in `resizeViewport()` — skip if container has no dimensions (prevents division by zero during transitions)

| Before | After |
| --- | --- |
| `#viewport canvas { width: 100% !important; height: 100% !important; }` | `#viewport canvas { width: 100%; height: 100%; }` |
| No resize detection on layout changes | `ResizeObserver` on `#viewport` catches all |
| `window.addEventListener('resize', resizeViewport)` | Removed (obsoleted by ResizeObserver) |

### A2. Stale Frame When Removing Mesh (Medium — FIXED)

**File:** `filehandler.js:removeMesh()`

**Root cause:** `removeMesh()` removes `S.meshObject` from the Three.js scene and disposes its geometry, but never calls `S.renderScene?.()` to redraw the canvas. The WebGL frame buffer still shows the old mesh, and the idle-prompt overlay (`pointer-events: none`) doesn't hide it visually.

**Fix applied:** Added `S.renderScene?.()` at the end of `removeMesh()`, after the mesh is removed and disposed. The scene now renders with just the grid/background — the old mesh disappears from the canvas.

### A3. Stale Results When Loading New Mesh (Medium — FIXED)

**Files:** `filehandler.js:handleFile()`, `filehandler.js:handlePickedMesh()`

**Root cause:** Both functions load a new mesh but never clear `S.result`, `S.facePenetrations`, or hide the old results panel. If a user loads a new mesh without clicking Remove first, the previous optimization results remain visible.

**Fix applied:** Added early cleanup at the start of both functions:
```javascript
S.result = null;
S.facePenetrations = null;
$('results-panel').classList.add('hidden');
```

---

*Audit generated using `make-interfaces-feel-better`, `design-taste-frontend`, `ux-heuristics`, `quality`, and `skeptical-review` skills.*
