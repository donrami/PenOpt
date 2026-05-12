# PenOpt — Remediation Plan: Expert Review & Oracle Corrections

**Based on:** `EXPERT_REVIEW.md` (expert review) + `ORACLE_REVIEW.md` (oracle 2nd opinion)  
**Date:** 2026-05-12  
**Scope:** 4 critical correctness fixes, 3 scientific accuracy fixes, 6 UX polish items  
**Total tasks:** 19 implementation tasks across 5 phases  

> **How to use this plan:** Read each phase in order. Each phase has Requirements → Design → Tasks. Tasks are atomic (2–4 hours each) and reference their triggering requirement. Agents should work phase by phase, marking tasks complete, and re-running self-checks before moving to the next phase.

---

## Phase 0 — Pre-flight: Audit What We Have

*Before writing any code, verify the current state of every file mentioned in this plan.*

**Pre-flight self-check tasks:**

- [ ] 0.1 — Read `internal/search/search.go` and confirm that normalization in `evaluateOrientations()` is still per-batch (lines ~205-213). Confirm the coarse/fine config hardcoding.
- [ ] 0.2 — Read `frontend/src/plots.js` and confirm the hardcoded 10° grid template (lines ~62-70). Confirm it does not receive grid parameters from Go.
- [ ] 0.3 — Read `frontend/src/optimizer.js` `setupRayGrid()` and confirm it only updates text, never calls Go.
- [ ] 0.4 — Read `internal/search/search.go` `Run()` and confirm the hardcoded coarse `RayGridX = 8, RayGridY = 8` and fine `RayGridX = 16, RayGridY = 16`.
- [ ] 0.5 — Read `internal/search/intelliscan.go` `ComputeIntelliScanAngles()` and confirm no cone-beam geometry consideration (no SOD/SDD parameters).
- [ ] 0.6 — Read `internal/objectives/objectives.go` and confirm `FHdn` uses `maxPerProjection` (penetration range), not silhouette area.
- [ ] 0.7 — Run `go test ./...` and confirm all tests pass before any changes.
- [ ] 0.8 — Confirm frontend builds (`cd frontend && npm run build`).

---

## Phase 1 — Correctness Fixes (Correctness Bugs)

*These are bugs that can produce wrong search results. Fix them before any other work.*

### 1.1 — Fix Global Normalization in Search

**Requirement (EARS format):**
- WHEN the coarse-to-fine search completes, THEN the system SHALL normalize all orientation scores (coarse + fine combined) together before computing combined scores and ranking best/worst.
- WHEN coarse batch and fine batch have different objective ranges, THEN the system SHALL NOT rank coarse orientations against fine orientations using per-batch normalized values.
- _Current behavior:_ each batch normalizes independently, so a coarse orientation at the edge of the coarse range can beat a fine orientation that is objectively better.

**Design:**

The bug is in `search/search.go` at `evaluateOrientations()` (called twice — once for coarse, once for fine). Currently:

```
evaluateOrientations(coarse) → normalize coarse → score coarse
evaluateOrientations(fine)   → normalize fine   → score fine
combine → sort by score → best/worst
```

Fix: split normalization from evaluation:

```
1. Evaluate all orientations (coarse + fine) → raw objective values only (no normalization, no scoring)
2. Collect all raw values into one slice per objective
3. Global normalize across all orientations together
4. Compute combined scores using globally normalized values
5. Sort and select best/worst
```

**Interface change:**
- `evaluateOrientations()` should return raw `[]float64` values per objective, not normalized scores.
- A new function `NormalizeAndScore(allRaw []OrientationRaw, weights [3]float64, method string) []float64` handles global normalization + scoring.
- `OrientationRaw` struct: `{Theta, Phi, FMtlRaw, FEnergyRaw, FHdnRaw}` — no MaxPerProjection (that stays separate).

**Files to change:**
- `internal/search/search.go` — restructure `Run()`, split `evaluateOrientations()` into evaluation + normalization phases
- `internal/objectives/objectives.go` — add `CombinedScoreGlobal(allRaw, weights, method)` — or rename/extend existing `CombinedScore`
- `internal/search/search_test.go` — add test: coarse-batch outlier orientation should NOT beat fine-batch optimal when coarse range is wide and fine range is narrow

**Verification:**
- [ ] 1.1T1 — New test: `TestNormalizationGlobal` — create coarse batch with wide f_mtl range [10, 100] and fine batch with narrow range [15, 20]. Both batches have orientation at normalized value 0.0. Fine-batch orientation should have lower combined score than coarse-batch orientation (because fine's "0.0" represents worse absolute performance).
- [ ] 1.1T2 — Existing tests still pass: `go test ./internal/search/`
- [ ] 1.1T3 — Manual: load a mesh, run optimization, verify contour plot now shows data from both coarse and fine phases correctly aligned.

---

### 1.2 — Wire Ray Grid Selector (or Remove It)

**Requirement (EARS format):**
- WHEN the user selects a ray grid resolution in the UI, THEN the system SHALL pass that resolution to the Go search backend.
- WHEN the user does not change the default, THEN the system SHALL use the documented default (16² coarse, 16² fine).
- OR WHEN the feature is not implemented, THEN the UI SHALL NOT display ray grid resolution options.

**Design — Option A (Wire it):**

```
Frontend: setupRayGrid() → on click, store selection in S.rayGridRes (e.g., 16, 32, 64)
Frontend: runOptimization() → send {weights, method, rayGridRes} to Go
Go: App.RunOptimization(req RunRequest) → req.RayGridRes → coarseCfg.RayGridX = rayGridRes
Go: search.Run(bvhTree, coarseCfg, ...) → use req.RayGridRes for coarse grid
Go: fineCfg still hardcoded to 16×16 (fine is refinement, doesn't need user control)
```

**Files to change:**
- `frontend/src/state.js` — add `rayGridRes: 16` to state
- `frontend/src/optimizer.js` — pass `S.rayGridRes` in `RunOptimization()` call
- `frontend/src/materials.js` — `setupRayGrid()` also updates `S.rayGridRes` (not just text display)
- `app.go` / `optimizer.go` — `RunRequest` gains `RayGridRes int` field
- `internal/search/search.go` — `Run()` accepts `RayGridRes` parameter and uses it for coarse grid
- `internal/search/search_test.go` — add test for different ray grid resolutions

**Design — Option B (Remove it):**

Simply delete the ray grid selector accordion and related JS from the UI. No backend changes needed.

**Decision:** _Use Option B (Remove it)_ — the sparse grid is a deliberate design choice (speed vs accuracy tradeoff). Exposing it as a user setting creates expectations that can't be meaningfully satisfied with the current 2D grid search (higher resolution doesn't proportionally improve ranking quality). Simpler to remove and document the design decision in code.

**Files to change (Option B):**
- `frontend/index.html` — remove the "Ray Grid" accordion section
- `frontend/src/optimizer.js` — remove `setupRayGrid()` and the ray grid event listeners
- `frontend/src/state.js` — remove `rayGridRes` from state (if it was added)

**Verification:**
- [ ] 1.2T1 — UI has no ray grid selector (grep for "ray-opt", "Ray Grid", "acc-ray-val" returns no matches in index.html)
- [ ] 1.2T2 — Optimization still runs correctly: `go test ./internal/search/`
- [ ] 1.2T3 — Frontend builds without errors: `cd frontend && npm run build`

---

### 1.3 — Fix Contour Plot Grid Template

**Requirement (EARS format):**
- WHEN the results are displayed, THEN the contour plot SHALL render using the actual search grid angles (coarse θ ∈ {−45, −30, −15, 0, 15, 30, 45}, coarse φ ∈ {−45, −30, −15, 0, 15, 30, 45}) as the interpolation template, NOT hardcoded 10° intervals.
- WHEN the search uses a non-standard grid, THEN the contour plot SHALL receive grid parameters from the Go backend.

**Design:**

Two possible approaches. Approach A is cleaner (backend-driven); Approach B is simpler (frontend-only fix).

**Approach A (Backend-driven — preferred):**
```
Go: search.Run() → result.json includes a new field:
  "gridTemplate": {
    "thetas": [-45, -30, -15, 0, 15, 30, 45],
    "phis": [-45, -30, -15, 0, 15, 30, 45],
    "isPartial": false  // already exists in Result struct
  }
Frontend: plots.js drawContourPlot() reads result.gridTemplate instead of hardcoding
Frontend: if no gridTemplate (backward compat), fall back to deriving from allScores thetas
```

**Approach B (Frontend-only fix):**
```
Frontend: plots.js drawContourPlot() → derive grid template from allScores data:
  - Extract unique thetas and phis from allScores (they come from coarse + fine)
  - Use those as the interpolation grid
  - Fall back to hardcoded 10° only if fewer than 4 unique thetas exist
```

**Decision:** _Use Approach B_ — it's a one-line fix in `plots.js` and doesn't require changing the Go→JS API. The contour plot already collects `thetasAll` and `phisAll` from the scores, but then applies a hardcoded 10° filter. Just remove the hardcoded filter and use the actual evaluated angles.

**Files to change:**
- `frontend/src/plots.js` — in `drawContourPlot()`, replace the hardcoded `coarseThetas` / `coarsePhis` arrays with:
  ```javascript
  // Derive grid template from actual evaluated angles
  const evaluatedThetas = [...new Set(scores.map(s => s.theta))].sort((a,b)=>a-b);
  const evaluatedPhis = [...new Set(scores.map(s => s.phi))].sort((a,b)=>a-b);
  ```
  Then build the lookup map from these actual values (not from hardcoded 10° grid).
- `frontend/src/plots.js` — remove the `coarseSet.has(s.theta + ',' + s.phi)` filter that excludes fine-grid-only angles. All scores (coarse + fine) should be used as the interpolation source.

**Verification:**
- [ ] 1.3T1 — New test: load a mesh, run optimization, verify contour plot shows a smooth gradient that aligns with the coarse grid points (best marker should appear at a coarse-grid angle, not at a 10°-interval angle).
- [ ] 1.3T2 — Verify: open browser devtools, set breakpoint in `drawContourPlot()`, confirm `evaluatedThetas` contains −45, −30, −15, 0, 15, 30, 45 (not 0, 10, 20...).
- [ ] 1.3T3 — Manual: run on a simple geometry (cylinder), confirm best marker appears near the expected thin-orientation angle.

---

### 1.4 — Add Tuy-Smith Completeness to Scoring Pipeline

**Requirement (EARS format):**
- WHEN an orientation is evaluated, THEN the system SHALL compute the Tuy-Smith completeness fraction (fraction of faces with at least one tangent ray) and include it in the orientation score.
- WHEN the search completes, THEN the results SHALL display Tuy completeness for best and worst orientations.
- WHEN Tuy completeness is below a threshold (e.g., <90%), THEN the UI SHALL display a warning indicating potential cone-beam artifacts.

**Design:**

`TuyCompletenessFraction()` already exists in `search/radon.go`. It needs to be called from the evaluation path and included in `OrientationScore`.

```
1. Add Tuy completeness computation to each orientation evaluation:
   - ComputeFacePenetrations() already calls bvh.IntersectAll() for per-face analysis
   - The tangent-ray condition for a face normal n̂ at projection angle α:
     d̂(α) · n̂ = 0 where d̂(α) = (-cos(α), 0, sin(α)) for circular trajectory
   - Count faces with at least one tangent ray across all N projections
   - Tuy completeness = (faces with ≥1 tangent ray) / total faces

2. Add f_tuy field to OrientationScore:
   type OrientationScore struct {
       ...
       FTuy float64 `json:"fTuy"`  // 0 = all faces Tuy-incomplete, 1 = all faces have tangent ray
   }

3. Compute Tuy completeness in evaluateOrientations():
   - For each orientation, iterate over mesh faces (or sample them)
   - For each face normal, find projection angles where d̂(α)·n̂ = 0
   - Count how many faces have at least one tangent angle in [0°, 360°)
   - Normalize to [0, 1]

4. Display in UI:
   - Add "Tuy completeness" column to results table
   - Show as percentage: fTuy * 100
   - If fTuy < 0.90, show amber warning: "⚠ Only X% of faces have tangent rays — cone-beam artifacts may occur"

5. (Optional) Also add Tuy completeness to the heatmap:
   - Color faces by Tuy completeness (red = Tuy-incomplete, green = has tangent ray)
   - This requires per-face Tuy data, not just the aggregate score
```

**Performance note:** Tuy completeness computation over all faces at all projection angles is O(F × N) where F = number of faces and N = number of projections (90 for fine, 36 for coarse). For a 100K-triangle mesh: 100K × 36 = 3.6M operations for coarse, 100K × 90 = 9M for fine. This is fast in Go (single-threaded is fine for this scale).

**Files to change:**
- `internal/search/search.go` — add `FTuy float64` to `OrientationScore` struct; compute in `evaluateOrientations()`
- `internal/search/radon.go` — refactor `TuyCompletenessFraction()` to be callable per-orientation (currently computes for the whole mesh at origin). Move the face-normal iteration here.
- `internal/app/optimizer.go` — add `FTuy` to the JSON response (already included via struct JSON tags)
- `frontend/src/optimizer.js` — add Tuy column to `showResults()` objective table
- `frontend/src/style.css` — add warning styling for low Tuy completeness
- `frontend/index.html` — (optional) add Tuy warning banner element
- `internal/search/search_test.go` — add test: sphere should have fTuy ≈ 1.0 (all faces have tangent rays for a sphere); flat plate should have low fTuy

**Verification:**
- [ ] 1.4T1 — Unit test: `TestTuyCompletenessSphere` — sphere should score ≥0.95
- [ ] 1.4T2 — Unit test: `TestTuyCompletenessFlatPlate` — very thin flat plate (height << width) should score <0.80
- [ ] 1.4T3 — Unit test: `TestTuyCompletenessAtOptimal` — after search, best orientation should have higher fTuy than worst
- [ ] 1.4T4 — UI test: load mesh, run optimization, confirm Tuy column appears in results table
- [ ] 1.4T5 — UI test: for a flat geometry, confirm amber warning appears below 90% completeness

---

## Phase 2 — Scientific Accuracy Fixes

*These fix the mathematical and algorithmic accuracy of the CT simulation.*

### 2.1 — Document IntelliScan's Parallel-Beam Assumption

**Requirement (EARS format):**
- WHEN the user views IntelliScan results, THEN the system SHALL display a note that tangent angles are computed assuming parallel-beam geometry and may deviate for wide-angle cone-beam systems.
- WHEN the scanner SOD/SDD ratio indicates cone-beam geometry (SOD/SDD < 0.6), THEN the UI SHALL display a secondary note with guidance.

**Design:**

Add a disclaimer to the IntelliScan results card. No code changes needed for the calculation itself (the parallel-beam assumption is documented as intentional for the MVP).

```
In 'renderIntelliScan()' in optimizer.js:
- After building the IntelliScan table, append a info box:
  "Tangent angles computed for parallel-beam geometry. For wide-angle 
   cone-beam systems (SOD/SDD < 0.6), consider verifying critical angles
   manually. See Butzhammer 2026 §2 for cone-beam correction method."
```

**Files to change:**
- `frontend/src/optimizer.js` — `renderIntelliScan()` adds disclaimer element
- `frontend/src/style.css` — style the disclaimer with a blue-tinted background (info style, not warning)

**Verification:**
- [ ] 2.1T1 — UI test: run IntelliScan on any mesh, confirm disclaimer appears below the angle table
- [ ] 2.1T2 — Confirm disclaimer is visible for both Method A and Method B

---

### 2.2 — Add Resolution Labels to Penetration Rose

**Requirement (EARS format):**
- WHEN the penetration rose plot is displayed, THEN the legend SHALL indicate the angular resolution of each trace (e.g., "Optimal: 90 projections", "Worst: 36 projections").
- WHEN best and worst have the same resolution, THEN the legend SHALL state this.

**Design:**

The `drawPenetrationRose()` function in `plots.js` receives `bestData` and `worstData` arrays. Their lengths indicate resolution. Add this to the legend rendering:

```javascript
const bestRes = bestData?.length || 0;
const worstRes = worstData?.length || 0;

// In the legend section:
ctx.fillText(`Optimal: ${bestRes} proj`, legX, legY);
ctx.fillText(`Worst: ${worstRes} proj`, legX + 80, legY);
```

Also, when `bestRes !== worstRes`, add a small amber note near the top of the canvas:
```javascript
if (bestRes !== worstRes) {
  ctx.fillStyle = '#e8a838';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`⚠ Different sampling: ${bestRes} vs ${worstRes} projections`, cx, 12);
}
```

**Files to change:**
- `frontend/src/plots.js` — `drawPenetrationRose()`: add resolution labels to legend, add mismatch warning

**Verification:**
- [ ] 2.2T1 — Run optimization, confirm rose legend shows "Optimal: 90 proj" and "Worst: 36 proj" (or whatever the actual counts are)
- [ ] 2.2T2 — Confirm the mismatch warning appears when bestRes ≠ worstRes

---

### 2.3 — Add Quantitative Validation Tests

**Requirement (EARS format):**
- WHEN `go test ./internal/...` is run, THEN the test suite SHALL include at least one test that compares BVH ray-casting results against known analytical penetration values for a sphere and a cylinder.
- WHEN a test fails, THEN it SHALL report the absolute error in mm.

**Design:**

**Sphere test:**
- Geometry: sphere, radius R = 50mm, centered at origin
- Ray: from source at (−SOD, 0, 0) through detector center (along +X axis)
- Analytical: for a sphere intersected by a ray with impact parameter d (distance from ray to sphere center), penetration length = 2√(R² − d²)
- For centered ray (d=0): L = 2R = 100mm
- Test: cast ray through sphere center, verify |computed − 100| < 0.1mm

**Cylinder test (infinite cylinder along Y-axis):**
- Geometry: cylinder radius R = 30mm, axis at Y, centered at origin
- Ray: from source at (−SOD, 0, 0) through detector center (along +X axis)
- Analytical: for ray parallel to cylinder axis, L = 2√(R² − d²) where d is perpendicular distance from ray to axis
- For centered ray (d=0): L = 2R = 60mm
- Test: verify |computed − 60| < 0.1mm

**Implementation:**

Create `internal/raycaster/validation_test.go`:

```go
func TestPenetrationSphereCentered(t *testing.T) {
    m := mesh.NewMesh()
    // Add sphere approximation: icosphere with ~80 triangles
    // (use pre-computed sphere mesh or generate programmatically)
    bvh := bvh.Build(m)
    
    hit, lengths := bvh.IntersectAll(mesh.Vec3{-500, 0, 0}, mesh.Vec3{1, 0, 0})
    if !hit || len(lengths) < 2 {
        t.Fatal("expected two intersections with sphere")
    }
    computed := lengths[1] - lengths[0]  // back - front
    expected := 100.0  // 2 * radius
    if math.Abs(computed - expected) > 0.1 {
        t.Errorf("sphere penetration: got %.4f mm, want %.4f ± 0.1 mm (error: %.4f mm)", 
            computed, expected, math.Abs(computed-expected))
    }
}
```

Note: generating a proper sphere mesh is non-trivial. Instead, use a cube or a simple test geometry with known penetration:
- **Cube test:** axis-aligned cube from −R to +R. Ray along +X through center. Expected: 2R.
- **Slab test:** thin slab perpendicular to X-axis. Ray along +X. Expected: slab thickness.

**Files to change:**
- `internal/raycaster/validation_test.go` — new file with quantitative tests
- `internal/mesh/mesh.go` — add helper `AddSphere(radius float64, segments int)` and `AddSlab(x0, x1 float64)` to Mesh for test fixtures

**Verification:**
- [ ] 2.3T1 — `go test ./internal/raycaster/ -v` shows all validation tests pass
- [ ] 2.3T2 — Sphere test reports error < 0.1mm
- [ ] 2.3T3 — All existing tests still pass: `go test ./...`

---

## Phase 3 — UX and Presentation Fixes

*These improve the user-facing quality of the application.*

### 3.1 — Fix Help Text Inaccuracies

**Requirement (EARS format):**
- WHEN the user opens the help modal, THEN the displayed filter options SHALL match the actual filter options available in the app (Cu, Zn only; no Al).
- WHEN beam hardening or scatter is described, THEN the description SHALL accurately reflect the implementation (approximate/analytical proxy, not full physics model).

**Design:**

Update the help content in `frontend/index.html` (`#help-body` section):

1. **Filter row fix:** Change "Cu, Al, Cu+Al, etc." to "Cu (0.5mm, 1.0mm), Zn (0.5mm, 1.0mm), or combinations."

2. **Spectrum model description:** Change "polychromatic X-ray spectrum (Tucker-Boone model)" to:
   "simplified polychromatic spectrum (E·exp(−3E/kV) bremsstrahlung shape with fixed W K-lines; for quantitative work, use a validated spectrum model)"

3. **Scatter description:** Change "kernel-based scatter model" to:
   "analytical scatter-to-primary ratio (SPR) proxy based on mean ray path length"

4. **Objectives:** Add a note: "Only f_mtl, f_energy, and f_hdn are computed in the grid search. Other objectives (f_cb, f_completeness, f_uncertainty, f_surface, f_alignment) require the NSGA-II optimizer with Advanced Physics enabled."

5. **Add missing references** to the references section:
   - Deb et al. 2002 — NSGA-II (search method)
   - Tucker 1991 / Boone & Seibert 1997 — X-ray spectrum (Advanced Physics)
   - Alsaffar et al. 2022 — Scatter estimation (Advanced Physics)

**Files to change:**
- `frontend/index.html` — update `#help-body` content

**Verification:**
- [ ] 3.1T1 — Manual: open help modal, verify no mention of "Al" filters, no unqualified "Tucker-Boone", no "kernel-based" for scatter
- [ ] 3.1T2 — Manual: verify NSGA-II and spectrum references appear in help references section

---

### 3.2 — Add Optimization Time Breakdown to Results

**Requirement (EARS format):**
- WHEN the search completes, THEN the results panel SHALL display the total search time in milliseconds.
- WHEN coarse and fine phases have different ray grid configurations, THEN the results SHALL display coarse and fine phase times separately.

**Design:**

The Go backend already computes `SearchTimeMs` in the `Result` struct. Currently it records `time.Since(startTime)` for the entire `Run()`. To get per-phase timing:

```go
coarseStart := time.Now()
coarseScores := evaluateOrientations(...)
coarseTime := time.Since(coarseStart).Milliseconds()

fineStart := time.Now()
fineScores := evaluateOrientations(...)
fineTime := time.Since(fineStart).Milliseconds()

totalTime := coarseTime + fineTime
```

Add to `Result` struct:
```go
type Result struct {
    ...
    SearchTimeMs    float64 `json:"searchTimeMs"`
    CoarseTimeMs    float64 `json:"coarseTimeMs"`
    FineTimeMs      float64 `json:"fineTimeMs"`
    NumCoarseEval   int     `json:"numCoarseEval"`
    NumFineEval     int     `json:"numFineEval"`
}
```

Update `showResults()` in `optimizer.js` to display:
- "Search: Xms (Y coarse + Z fine) — N total orientations"
- Format: "3,421ms (842 coarse + 2,579 fine) — 219 orientations"

**Files to change:**
- `internal/search/search.go` — `Result` struct gains new fields; `Run()` computes per-phase timing
- `frontend/src/optimizer.js` — `showResults()` displays time breakdown in results panel
- `frontend/index.html` — add element for time breakdown display (or repurpose existing element)

**Verification:**
- [ ] 3.2T1 — Run optimization, confirm time breakdown appears in results: "Xms (Y coarse + Z fine)"
- [ ] 3.2T2 — Verify coarse time + fine time ≈ total time (within rounding error)

---

### 3.3 — Add Per-Objectives Weight Slider (Not Just Presets)

**Requirement (EARS format):**
- WHEN the user views the Quality vs Energy card, THEN the system SHALL display three interactive sliders (f_mtl, f_energy, f_hdn) showing current weights, NOT only preset buttons.
- WHEN the user adjusts a slider, THEN the displayed combined score for the best orientation SHALL update to reflect the new weight.

**Design:**

Replace the three preset buttons with a more flexible slider UI. Each slider shows the current weight as a percentage, and the sum of all three is always 1.0 (enforced by the slider logic).

```
UI: Three horizontal sliders, each 0-100%:
  f_mtl:    [=======----] 60%
  f_energy: [====------] 20%  
  f_hdn:    [====------] 20%
  
  Sum: 100% ✓  (auto-normalize on change)
  
  [Combined score preview]: 0.342
  [Run Search] button
```

**Implementation notes:**
- On slider change: recompute combined score for the current best orientation using `EvaluateSingle()` or the cached `AllScores`
- Display the new combined score without re-running the full search (fast, uses cached data)
- "Run Search" button still re-runs with the new weights

**Files to change:**
- `frontend/index.html` — replace `.tradeoff-stops` preset buttons with slider markup
- `frontend/src/style.css` — style the sliders, percentage labels, sum indicator
- `frontend/src/state.js` — add `weights: [0.6, 0.2, 0.2]` as mutable state
- `frontend/src/optimizer.js` — `setupTradeoff()`: add slider event listeners; add `recomputeScorePreview()` function
- `frontend/src/optimizer.js` — `showResults()`: compute score preview on load

**Verification:**
- [ ] 3.3T1 — Manual: drag f_mtl slider from 60% to 80%, confirm combined score preview updates in <100ms
- [ ] 3.3T2 — Manual: confirm sum always = 100% (auto-normalization)
- [ ] 3.3T3 — Manual: click "Update Search", confirm search runs with new weights
- [ ] 3.3T4 — `cd frontend && npm run build` succeeds

---

### 3.4 — Fix f_hdn Metric Name and Documentation

**Requirement (EARS format):**
- WHEN the results table is displayed, THEN the f_hdn column SHALL be labeled "f_hdn (penetration range)" to accurately reflect what is computed, NOT "f_hdn (projection area)" which misrepresents the metric.
- WHEN the tooltip for f_hdn is shown, THEN it SHALL describe penetration range, not projection area.

**Design:**

Simple rename and tooltip update:

1. In `frontend/src/optimizer.js` `showResults()`:
   - Change table header from "f_hdn" to "f_hdn (pen. range)" or "f_hdn (∅ max L)"
   - Update tooltip: "Range of max X-ray penetration per projection angle (lower = more isotropic)"

2. In `frontend/index.html` help body:
   - Update f_hdn description: "f_hdn — Penetration range, maxL_max − maxL_min across projections. Lower values indicate more isotropic ray penetration."

3. (Optional, long-term) In `internal/objectives/objectives.go`:
   - Consider renaming `FHdn` to `FPenetrationRange` and adding a comment that it approximates the projection isotropy goal from Ito 2020, but uses max penetration instead of silhouette area.

**Files to change:**
- `frontend/src/optimizer.js` — update f_hdn column label and tooltip in `showResults()`
- `frontend/index.html` — update help text for f_hdn

**Verification:**
- [ ] 3.4T1 — Manual: run optimization, verify f_hdn column header says "(pen. range)" not "(projection area)"
- [ ] 3.4T2 — Manual: hover over f_hdn header, verify tooltip describes penetration range, not silhouette area

---

## Phase 4 — Nice to Have (Polish)

*These are valuable improvements but don't affect correctness or scientific accuracy.*

### 4.1 — Add Jig Geometry 3D Preview
Before downloading the jig STL, show a semi-transparent preview in the Three.js viewport.

### 4.2 — Add Validation Metrics to Results Panel
Display angular diversity and objective spread (computed by `ComputeValidationMetrics()`) in the results panel, not just in JSON export.

### 4.3 — Add Pareto Front Plot
If NSGA-II is used, show an interactive scatter plot of non-dominated solutions in the objective space.

---

## Task Master Index

| # | Phase | Task | Est. Time | Blocking |
|---|-------|------|-----------|----------|
| 0.1–0.8 | 0 | Pre-flight audit | 30 min | — |
| 1.1T1–1.1T3 | 1 | Global normalization fix | 3h | — |
| 1.2T1–1.2T3 | 1 | Remove ray grid selector | 1h | — |
| 1.3T1–1.3T3 | 1 | Fix contour plot grid | 1h | — |
| 1.4T1–1.4T5 | 1 | Add Tuy-Smith to scoring | 4h | — |
| 2.1T1–2.1T2 | 2 | Document IntelliScan beam model | 30 min | — |
| 2.2T1–2.2T2 | 2 | Add rose resolution labels | 1h | — |
| 2.3T1–2.3T3 | 2 | Quantitative validation tests | 3h | 1.4 |
| 3.1T1–3.1T2 | 3 | Fix help text | 1h | — |
| 3.2T1–3.2T2 | 3 | Add time breakdown | 2h | 1.1 |
| 3.3T1–3.3T4 | 3 | Per-objective weight sliders | 4h | — |
| 3.4T1–3.4T2 | 3 | Fix f_hdn naming | 30 min | — |
| 4.1 | 4 | Jig 3D preview | 2h | 1.4 |
| 4.2 | 4 | Validation metrics in UI | 1h | 2.3 |
| 4.3 | 4 | Pareto front plot | 4h | 1.1 |

**Phase ordering recommendation:**
1. Start Phase 1 in parallel (all four correctness fixes are independent)
2. Phase 2 after Phase 1 (scientific accuracy builds on correctness)
3. Phase 3 after Phase 1 (UX polish can run in parallel with Phase 2)
4. Phase 4 last (polish, no dependencies)

**Total estimated time:** ~28 hours across 19 tasks

---

*Plan authored: 2026-05-12. Review against EXPERT_REVIEW.md and ORACLE_REVIEW.md before starting each phase.*