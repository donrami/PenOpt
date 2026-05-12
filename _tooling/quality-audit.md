# Quality & Skeptical Review — PenOpt Codebase

**Date**: 2026-05-12  
**Scope**: Full codebase audit — Go backend (8 packages) + JavaScript frontend (10 modules) + CSS + HTML  
**Methodology**: Quality Skill checklist + Skeptical Review (Principal Engineer perspective)

---

## Blocker Issues (must fix immediately)

### B1. Tests don't compile — `objectives` package

**File**: `internal/objectives/objectives_test.go`  
**Problem**: `CombinedScore` now expects **5** objective slices + **5** weights (upgraded from 3 to support fTuy/fBh), but tests still call it with 3:

```go
// Old (broken):
CombinedScore(fMtl, fEnergy, fHdn, 0.5, 0.3, 0.2, "weighted")
// New signature expects:
CombinedScore(fMtlVals, fEnergyVals, fHdnVals, fTuyVals, fBhVals,
    wMtl, wEnergy, wHdn, wTuy, wBh, method)
```

**Impact**: `go test ./internal/objectives` fails to build. CI is red.

### B2. Tests don't compile — `search` package

**File**: `internal/search/search_test.go` lines 70, 137  
**Problem**: `Run` now expects `[5]float64` weights, but tests pass `[3]float64{...}`:

```go
// Old (broken):
result, err := Run(bvhTree, m, cfg, [3]float64{0.4, 0.4, 0.2}, "weighted", nil, 0, 0)
```

**Impact**: `go test ./internal/search` fails to build. CI is red.

### B3. Frontend sends wrong weights array to backend

**File**: `frontend/src/optimizer.js` — `RunOptimization` call:

```js
RunOptimization({ weights: [w.wMtl, w.wEnergy, w.wHdn], method: S.method })
```

The Go struct expects `[5]float64` weights. JSON deserialization silently pads missing elements to 0, meaning **wTuy and wBh are always 0** from the frontend, even though `WEIGHT_PRESETS` in `state.js` defines all 5 weights. The Tuy-Smith completeness objective is effectively disabled at runtime despite being technically implemented.

---

## Critical Issues (fix before release)

### C1. Unused function `mu` in physics module

**File**: `internal/physics/material.go` line ~26  
**Problem**: Function `mu(energy, pts)` wraps `LogLogInterp` but is never called anywhere. Dead code.

### C2. `EmitProgress` is a stub

**File**: `app.go` lines ~107-111  
**Problem**: `EmitProgress` accepts parameters and does nothing with them. Comment says "kept for Wails compatibility". Should be removed or documented as deprecated — it's dead code that creates confusion. The real progress is via `runtime.EventsEmit` in `optimizer.go`.

### C3. Unused `three-mesh-bvh` npm dependency

**File**: `frontend/package.json`  
**Problem**: `three-mesh-bvh@^0.9.9` is listed as a dependency but never imported anywhere in the frontend code. The BVH is implemented in Go (`internal/bvh/`). This adds ~200KB+ of unused bundled JS.

### C4. MeshLoader exposes Lock/Unlock publicly

**File**: `internal/app/meshloader.go` lines ~65-67  
**Problem**: `Lock()` and `Unlock()` are public methods, exposing internal synchronization details. The `Optimizer` correctly uses them, but any other caller could misuse them. Should be internal or use a callback pattern.

### C5. All test files use unkeyed Vec3 struct literals

**Files**: All `*_test.go` files across `bvh`, `vec`, `raycaster`, `mesh`  
**Problem**: `mesh.Vec3{X, Y, Z}` has field names, but tests use unkeyed literals like `mesh.Vec3{-10, -10, 50}`. `go vet` reports ~100+ warnings. If a field is ever added to `Vec3` (e.g., a padding field for SIMD alignment), every test silently breaks.

---

## Major Issues (should fix soon)

### M1. `FEnergy` starts max at 0, potentially wrong for negative values

**File**: `internal/objectives/objectives.go`  
**Problem**: `var max float64` starts at 0. For a set of all-negative values, `FEnergy` returns 0 (never set), which is the test expectation but semantically incorrect — penetration lengths should never be negative, so the edge case is conceptual, but the implementation would mask actual bugs if negative values ever appear.

### M2. `FTuy` and `FBh` are pass-through no-ops

**File**: `internal/objectives/objectives.go`  
**Problem**: Both functions just return their input unchanged. This is fine for an MVP placeholder but wastes compute time and dilutes the scoring signal. `FTuy` especially has a confusing docstring suggesting callers should use `(1 - tuy)` to minimize, but no caller does this.

### M3. Coarse + fine evaluations use different ray grid resolutions

**File**: `internal/search/search.go`  
**Problem**: Coarse evaluations use `cfg.RayGridX/Y` (default 8×8, 36 projections) while fine evaluations use 2× (16×16, 90 projections). The scores from coarse and fine evaluations are combined and globally normalized together. This means coarse evaluations are systematically noisier, potentially distorting the normalization relative to fine evaluations.

### M4. `S.isPartial` / `result.isPartial` referenced but never set

**Files**: `frontend/src/optimizer.js`, `frontend/src/plots.js`  
**Problem**: The frontend checks `result.isPartial` in `showResults`, `drawContourPlot`, and `drawPenetrationRose`, but the Go backend never sets this field and the frontend `S` state doesn't initialize it. It's always undefined/falsy, so the "Partial results" warning is never shown — silent dead feature.

### M5. Stale/clear ordering in `removeMesh`

**File**: `frontend/src/filehandler.js` — `removeMesh()`  
**Problem**: The code sets `S.result = null` first, then calls `invalidateResults()` (which checks `if (!S.result) return;` → no-op), then `clearStaleResults()`. The order is confusing and the `invalidateResults()` call is a dead no-op that misleads readers.

### M6. Search range slider init order

**File**: `frontend/src/state.js` — `S.searchRange = 45` (initial value)  
**File**: `frontend/src/materials.js` — `$('cfg-searchrange').value = S.searchRange` — this sets the slider to the initial 45, then line `$('disp-searchrange').textContent = S.searchRange + '°'` syncs the display. However, the slider `input` handler calls `S.searchRange = parseInt(srSl.value, 10) || 45` which is already 45. This works but has a subtle init → localStorage → init race if localStorage was previously saved.

### M7. Progress ring completion timing

**File**: `frontend/src/optimizer.js` — The SVG ring stroke-dashoffset animation resets from `100.53` on each progress event. If the search completes quickly with few events, the ring may appear to never reach 100%. Minor issue.

---

## Minor Issues

### m1. Redundant `Normalize` call in computeNormal on OBJ import

**File**: `internal/mesh/parser_obj.go` — `computeNormal` is called for each triangle, which normalizes. But the cross-product magnitude could be zero for degenerate triangles, and the function handles that case. Not a bug, just redundant processing since the normal is already computed per-face.

### m2. Double requestAnimationFrame pattern repeated 5+ times

**Files**: `frontend/src/filehandler.js`, `frontend/src/main.js`  
**Problem**: The double-rAF pattern for CSS transitions is repeated verbatim:  
```js
requestAnimationFrame(function() {
  requestAnimationFrame(function() {
    body.classList.remove('no-animate');
  });
});
```
This idiom appears ~5 times. Should be extracted to a helper.

### m3. CSS focus-visible selector has trailing comma with blank line

**File**: `frontend/src/style.css`  
**Problem**: The selector group for focus-visible has a blank line between `.vp-mode-btn:focus-visible,` and `.acc-head:focus-visible,`. This is syntactically valid (CSS ignores whitespace in selector lists) but visually looks like an error and could confuse maintainers.

### m4. `min`/`max` functions duplicated

**File**: `internal/mesh/mesh.go` — defines local `min(a, b int) int` and `max(a, b int) int`  
**File**: `internal/vec/vec.go` — defines identical `Min(a, b int) int` and `Max(a, b int) int`  
**Problem**: Duplicated helper functions. Should use a single source or Go 1.21+ builtins (`min`/`max` are builtins since Go 1.21 and the module uses `go 1.23.0`).

### m5. `Min`/`Max` in `vec` package are unused

**File**: `internal/vec/vec.go` — `Min` and `Max` are defined but never called from any package that imports `vec`. Dead code.

### m6. Comment says "Vector helpers removed" in raycaster.go

**File**: `internal/raycaster/raycaster.go` — comments like:
```go
// Vector helpers removed — use vec.Normalize, vec.Sub, vec.RotateX, vec.RotateY from penopt/internal/vec
```
These are refactoring artifacts. Clean them up.

### m7. `_intersectNode` and `_intersectAllNode` are public-visible but underscore-prefixed

**File**: `internal/bvh/bvh.go` — Functions `_intersectNode` and `_intersectAllNode` start with underscore, mimicking private-visibility conventions from other languages. In Go, they're still package-visible. Should be lowercased `intersectNode`/`intersectAllNode` per Go convention (underscore prefix is non-idiomatic).

---

## Architectural Observations

### A1. Clean separation of concerns ✅

The Go backend has a clear architecture:
- `main.go` / `app.go` — Wails app wiring (thin layer)
- `internal/app/` — API adapters (meshloader, optimizer, physicsapi, scannerapi)
- `internal/search/` — Grid search algorithm
- `internal/raycaster/` — Core ray casting / physics simulation
- `internal/bvh/` — BVH acceleration structure
- `internal/mesh/` — Mesh data structures and parsers
- `internal/vec/` — Vector math
- `internal/objectives/` — Objective functions
- `internal/physics/` — NIST XCOM material database, Beer-Lambert physics

The frontend is similarly well-organized:
- `state.js` — Shared state + DOM helpers
- `scene.js` — Three.js scene management
- `materials.js` — Material/filter/beam UI
- `optimizer.js` — Search lifecycle
- `plots.js` — Canvas-based plotting
- `export.js` — JSON/PNG export
- `filehandler.js` — File upload/drag-drop

### A2. Good use of Go idioms ✅

- Mutex-protected shared state in `MeshLoader`
- Goroutine-per-projection for parallel ray casting (good CPU utilization)
- Clean error handling with wrapped errors (`%w`)
- Proper use of `sync.WaitGroup` for parallel completion
- Channel-based result merging (raycaster heatmap)

### A3. Over-engineered `IntelliScan` detection

The Butzhammer 2026 tangent-ray angle computation uses the same formula for both parallel and cone-beam, with the geometry mode being purely informational (`GeometryMode` field). The code comments claim the formula is mathematically identical, which raises the question: why have two modes at all? If they're identical, just have one path.

### A4. Frontend state management is implicit

All global state is on the `S` object (`state.js`). This works for a single-view app but will become unwieldy with more features. Events modify `S` directly and multiple modules read/write the same properties. There's no explicit data flow or event bus abstraction beyond Wails runtime events.

### A5. Good defensive patterns ✅

- Null/empty checks before mesh operations
- `CenterAtOrigin()` called on load (ensures BVH assumption)
- Progress callback debounced via rAF
- Error banners with dismiss
- Themed confirm dialog replaces `window.confirm()`
- Watertight mesh warning propagated to results

---

## Performance Observations

### P1. Goroutine scaling is fine

`ComputeTransmissionLengths` creates one goroutine per projection (up to 360). Go handles this well. Each goroutine processes an independently allocatable slice chunk.

### P2. Memory allocation per evaluation

Each orientation evaluation allocates:
- `lengths` slice: NumProjections × RayGridX × RayGridY float64s
- `maxPerProjection` slice: NumProjections float64s

For 180 projections × 16×16 grid = 46,080 float64s (~360KB). Over ~150 evaluations, that's ~54MB minimum. Acceptable for desktop but worth monitoring.

### P3. HUD rotation display uses innerHTML

Minor: `$('hud-rot').innerHTML = '\u03B8: ' + ...` uses innerHTML where textContent would suffice. Not a security issue (controlled data), but slightly wasteful.

### P4. rAF-coalesced render and resize are well done ✅

The Three.js renderer only renders once per frame even when multiple changes happen, via `S.renderScene()` queuing. ResizeObserver is similarly debounced.

---

## Testing Gaps

| Area | Tests | Coverage Notes |
|------|-------|----------------|
| mesh | 4 tests | AddTriangle, CenterAtOrigin, CheckWatertight, VertexBuffer, Extent — good |
| vec | 5 tests | Dot, Cross, Normalize, RotateX, RotateY — good |
| bvh | 5 tests | Build, Intersect, Miss, IntersectAll, AABB, MultiTri — good |
| raycaster | 5 tests | Cube center/off-center, sphere center, slab, cube-vs-sphere — good validation tests |
| objectives | 6 tests | FMtl (3), FEnergy, FHdn, Normalize (2), CombinedScore (2) — BUT CombinedScore tests don't compile |
| physics | 7 tests | LogLogInterp (4), CalcMu, CalcTransmission, CalcTMm, MaterialByID, FmtPenetration — good |
| search | 4 tests | EvaluateSingle, Run (broken), TuyCompleteness (box + plate), RunWithMesh — Run tests don't compile |
| app | 0 tests | No tests for meshloader, optimizer, physicsapi, scannerapi |

---

## Summary

### Must fix (blocker)
1. Fix test signatures for `CombinedScore` in `objectives_test.go`
2. Fix test signatures for `Run` in `search_test.go`
3. Fix frontend to send all 5 weights to backend

### Should fix (critical)
1. Remove dead code: `mu()` function, `EmitProgress` stub
2. Remove unused `three-mesh-bvh` dependency
3. Clean up MeshLoader public Lock/Unlock
4. Fix unkeyed Vec3 struct fields in all tests

### Nice to have
1. Extract double-rAF pattern to helper
2. Use Go 1.23 builtins `min`/`max` instead of local duplicates
3. Clean up refactoring artifact comments
4. Rename underscore-prefixed functions to idiomatic Go
