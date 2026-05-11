# Sprint 1 Spec: Correctness

**Source:** Final Audit Report (`../audits/FINAL_AUDIT_REPORT.md`) — Sprint 1  
<!-- NOTE: FINAL_AUDIT_REPORT.md does not yet exist. See `../audits/paper-alignment-audit.md` and `../audits/oracle-scrutiny.md` instead. -->
**Methodology:** Spec-Driven Development (Requirements → Design → Tasks)  
**Duration:** 3 days estimated  
**Goal:** Fix correctness bugs, add test foundation, enable search cancellation

---

## Phase 1: Requirements

### User Story

As a PenOpt user, I want the optimization results to be mathematically correct, the search to be cancellable, and the visualizations to match the actual search space. As a developer, I want tests to verify that future changes don't silently break existing behavior.

### Acceptance Criteria (EARS Format)

#### T1 — Test Suite
1. WHEN `FMtl()` is called with a known set of lengths THEN the result SHALL match the formula `(1/N · Σ x_i^m)^(1/m)` within 1e-12 relative error.
2. WHEN `FEnergy()` is called with a list of lengths THEN the result SHALL equal the maximum value.
3. WHEN `FHdn()` is called with a list of max-per-projection values THEN the result SHALL equal max−min.
4. WHEN `Normalize()` is called with values [5, 10, 15] THEN the result SHALL equal [0, 0.5, 1.0].
5. WHEN `CombinedScore()` is called with method "weighted" THEN the result SHALL equal Σ(w_i · n_i) per orientation.
6. WHEN `CombinedScore()` is called with method "minimax" THEN the result SHALL equal max(w_i · n_i) per orientation.
7. WHEN `RayTriangleIntersect()` is called with a ray that hits a triangle THEN it SHALL return true and a distance > Epsilon.
8. WHEN `RayTriangleIntersect()` is called with a ray parallel to a triangle THEN it SHALL return false.
9. WHEN `RayAABBIntersect()` is called with a ray through an AABB THEN it SHALL return true with correct near/far distances.
10. WHEN `LogLogInterp()` is called with E exactly matching an existing point THEN it SHALL return that point's value.
11. WHEN `LogLogInterp()` is called with E between two points THEN it SHALL return the log-log interpolated value.
12. WHEN `ComputeIntelliScanAngles()` is called with a cube mesh at (θ=0, φ=0) THEN the result SHALL have ≥3 unique angles.
13. WHEN `CalcMu()` is called for Aluminum at 100 keV THEN the result SHALL be within 1% of the known reference value.

#### T2 — Score Normalization Fix
1. WHEN `Run()` completes with both coarse and fine orientations THEN the combined scores SHALL be globally comparable (a score of 0.3 in the fine batch SHALL mean the same as 0.3 in the coarse batch).
2. WHEN the best orientation is selected from `allScores` THEN the selection SHALL be consistent with ranking all raw objective values in a single normalization pass.

#### T3 — Search Cancellation
1. WHEN the user clicks "Stop" during optimization THEN the Go goroutine SHALL stop evaluating remaining orientations within 1 second.
2. WHEN search is cancelled mid-evaluation THEN partial results SHALL NOT be delivered to the frontend.
3. WHEN `Run()` is called with a cancelled context THEN it SHALL return an error immediately without evaluating any orientations.

#### T4 — Contour Plot Grid Fix
1. WHEN `drawContourPlot()` renders the heatmap THEN the coarse grid values SHALL match the actual Go `CoarseThetas` and `CoarsePhis` arrays.
2. WHEN the Go search grid is changed THEN the contour plot SHALL automatically reflect the change (not require frontend code changes).

#### T5 — IntelliScan Wrap-Around Dedup
1. WHEN face normals produce tangent angles spanning the 360°/0° boundary THEN the deduplication SHALL not create duplicates near the boundary.
2. WHEN all faces produce angles within a 1.5° range THEN the result SHALL have ≤2 unique angles after deduplication (verifying no artificial spread from wrap-around).

---

## Phase 2: Design

### T1 — Test Suite Design

**Architecture:** Go standard `testing` package, table-driven tests. Package-level test files co-located with source.

```
internal/
├── objectives/
│   └── objectives_test.go
├── bvh/
│   └── bvh_test.go
├── search/
│   └── intelliscan_test.go
└── physics/
    └── material_test.go
```

**Pattern:**
```go
func TestFMtl(t *testing.T) {
    tests := []struct {
        name string
        lengths []float64
        m float64
        want float64
    }{
        {"all equal", []float64{10, 10, 10}, 3, 10},
        {"half zero", []float64{0, 10}, 2, 7.071},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := FMtl(tt.lengths, tt.m)
            if math.Abs(got-tt.want) > 1e-12 {
                t.Errorf("FMtl() = %v, want %v", got, tt.want)
            }
        })
    }
}
```

**Test data:**
- BVH tests use a known tetrahedron mesh (4 triangles, 4 vertices)
- Physics tests compare against hand-calculated Beer-Lambert values at known energies
- IntelliScan tests use a unit cube (6 faces, 12 triangles) — known tangent angles

### T2 — Score Normalization Fix Design

**Current flow:**
```go
coarseScores := evaluateOrientations(tree, coarse, cfg, w, m, progress, 0, len(coarse))
// ... picks top 3 from coarseScores (these have internally normalized scores)
fineScores := evaluateOrientations(tree, fine, fineCfg, w, m, progress, len(coarse), total)
// ... fineScores have internally normalized scores (different base)
allScores := append(coarseScores, fineScores...)
// bestIdx = argmin(allScores[i].Score) ← WRONG: scores from different normalization bases
```

**Fixed flow:**
```go
coarseRaw, coarseScores := evaluateOrientationsRaw(tree, coarse, cfg, w, m, progress, 0, len(coarse))
// picks top 3 from coarseScores (scores correct within batch for ranking purposes only)
fineRaw, fineScores := evaluateOrientationsRaw(tree, fine, fineCfg, w, m, progress, len(coarse), total)

// Combine ALL raw values, normalize once, re-compute combined scores
allRawFmtl := append(coarseRaw.fMtl, fineRaw.fMtl...)
allRawFenergy := append(coarseRaw.fEnergy, fineRaw.fEnergy...)
allRawFhdn := append(coarseRaw.fHdn, fineRaw.fHdn...)

normFmtl := Normalize(allRawFmtl)
normFenergy := Normalize(allRawFenergy)
normFhdn := Normalize(allRawFhdn)

// Compute combined scores with globally normalized values
combined := make([]float64, len(allRawFmtl))
for i := range combined {
    if method == "minimax" {
        combined[i] = max(w[0]*normFmtl[i], w[1]*normFenergy[i], w[2]*normFhdn[i])
    } else {
        combined[i] = w[0]*normFmtl[i] + w[1]*normFenergy[i] + w[2]*normFhdn[i]
    }
}

// Assign combined scores back to orientation records
allScores := append(coarseScores, fineScores...)
for i := range allScores { allScores[i].Score = combined[i] }
```

**Changes needed:**
1. Split `evaluateOrientations()` into `evaluateOrientationsRaw()` (returns raw + scores without global normalization) and keep `evaluateOrientations()` for backward compat or inline the logic.
2. Move normalization + combination to `Run()` after both batches are collected.

### T3 — Search Cancellation Design

**Changes:**

`search.Run()` signature:
```go
func Run(ctx context.Context, bvhTree *bvh.BVH, cfg raycaster.ScannerConfig,
    weights [3]float64, method string, onProgress ProgressFn, mesh *mesh.Mesh) (*Result, error)
```

In evaluation loop:
```go
for i, o := range orientations {
    select {
    case <-ctx.Done():
        return nil, ctx.Err()
    default:
    }
    // ... existing evaluation
}
```

`app.go` changes:
```go
type App struct {
    ctx         context.Context
    mu          sync.Mutex
    currentMesh *mesh.Mesh
    currentBVH  *bvh.BVH
    searchCtx   context.Context
    searchCancel context.CancelFunc
}

func (a *App) RunOptimization(req runRequest) (string, error) {
    // ... existing setup ...
    ctx, cancel := context.WithCancel(context.Background())
    a.searchCtx = ctx
    a.searchCancel = cancel
    
    go func() {
        result, err := search.Run(ctx, bvhTree, coarseCfg, ...)
        // ... rest of goroutine
    }()
    return "started", nil
}

func (a *App) CancelOptimization() {
    if a.searchCancel != nil {
        a.searchCancel()
        a.searchCancel = nil
    }
}
```

Frontend: call `CancelOptimization()` Wails binding when stop button is clicked.

### T4 — Contour Plot Grid Fix Design

**Option A (recommended — single source of truth):** Ship `CoarseThetas` and `CoarsePhis` as part of the search result JSON.

Add to `Result` struct:
```go
type Result struct {
    // ... existing fields ...
    CoarseThetas []float64 `json:"coarseThetas"`
    CoarsePhis   []float64 `json:"coarsePhis"`
}
```

Set in `Run()`:
```go
res.CoarseThetas = CoarseThetas
res.CoarsePhis = CoarsePhis
```

Frontend: read from `result.coarseThetas` / `result.coarsePhis` in `drawContourPlot()` instead of hard-coded arrays.

**Option B (simpler):** Export `CoarseThetas` and `CoarsePhis` as Wails bindings.

**Decision:** Option A — zero-latency, no extra round-trip, always in sync.

### T5 — IntelliScan Wrap-Around Dedup Fix

**Current code:**
```go
// line 80-89 in intelliscan.go
rounded := make([]float64, len(rawAngles))
for i, a := range rawAngles { rounded[i] = math.Round(a*2) / 2 }
sort.Float64s(rounded)
angles := make([]float64, 0, len(rounded))
for _, a := range rounded {
    if len(angles) == 0 || (a - angles[len(angles)-1]) > 1.5 {
        angles = append(angles, a)
    }
}
// Handle wrap-around
if len(angles) > 1 && (360 - angles[len(angles)-1] + angles[0]) <= 1.5 {
    angles = angles[1:]
}
```

**Problem:** If deduplication produces a chain where angles near 360° and 0° are within 1.5° but separated by multiple intermediate angles, the single check at the end may miss it. Also, if angles wrap around the boundary multiple times, only the first/last are checked.

**Fix — cyclic deduplication:**
```go
// After sorting, do a stable pass merging across the 360/0 boundary
if len(angles) > 1 {
    // Check if first and last should be merged (cyclic)
    for len(angles) > 1 && (angles[0] + 360 - angles[len(angles)-1]) <= 1.5 {
        angles = angles[1:] // remove first (redundant with last)
    }
}
```

This wrapped in a loop until no more merges happen. Simpler and handles all edge cases.

---

## Phase 3: Tasks

### Task 1.1 — Create test file for objectives package

**Files:** `internal/objectives/objectives_test.go` (new)

**Sub-tasks:**
- [ ] 1.1.1 Test `FMtl()` with equal lengths, varying lengths, m=2 and m=3, empty input
- [ ] 1.1.2 Test `FEnergy()` with positive values, zeros, empty input
- [ ] 1.1.3 Test `FHdn()` with monotonic, decreasing, empty input
- [ ] 1.1.4 Test `Normalize()` with various ranges, single value, all-equal values
- [ ] 1.1.5 Test `CombinedScore()` with "weighted" method, known weights and values
- [ ] 1.1.6 Test `CombinedScore()` with "minimax" method, known weights and values

**Requirements:** T1-1 through T1-6  
**Estimate:** 1 hour

### Task 1.2 — Create test file for BVH package

**Files:** `internal/bvh/bvh_test.go` (new)

**Sub-tasks:**
- [ ] 1.2.1 Define a known tetrahedron test mesh (4 triangles)
- [ ] 1.2.2 Build the BVH and verify structure (root bounds, leaf distribution)
- [ ] 1.2.3 Test `RayAABBIntersect()` with rays through center, grazing edges, missing entirely
- [ ] 1.2.4 Test `RayTriangleIntersect()` with direct hit, parallel ray, ray behind triangle, grazing edge
- [ ] 1.2.5 Test `Intersect()` — nearest hit on the tetrahedron
- [ ] 1.2.6 Test `IntersectAll()` — all hits through the tetrahedron (should be 2 per ray)
- [ ] 1.2.7 Test `IntersectAll()` with ray missing entirely (should return empty)

**Requirements:** T1-7 through T1-9  
**Estimate:** 2 hours

### Task 1.3 — Create test file for physics package

**Files:** `internal/physics/material_test.go` (new)

**Sub-tasks:**
- [ ] 1.3.1 Test `LogLogInterp()` at exact data points, between points, below min, above max
- [ ] 1.3.2 Test `CalcMu()` for Aluminum at 100 keV (known reference: μ/ρ ≈ 0.170 cm²/g × 2.70 g/cm³ = 0.459 cm⁻¹)
- [ ] 1.3.3 Test `CalcTransmission()` for known mu and thickness (hand-calculated)
- [ ] 1.3.4 Test `CalcTMm()` — reverse check against CalcTransmission
- [ ] 1.3.5 Test `FilterTrans()` — identity (no filter), single layer, double layer
- [ ] 1.3.6 Test `HVLCu()` at 100 keV — known reference ~0.27 mm Cu
- [ ] 1.3.7 Test `RecommendKV()` — should find kV where transmission exceeds Tmin

**Requirements:** T1-10 through T1-13  
**Estimate:** 1.5 hours

### Task 1.4 — Create test file for IntelliScan

**Files:** `internal/search/intelliscan_test.go` (new)

**Sub-tasks:**
- [ ] 1.4.1 Create a unit cube mesh (6 faces, 12 triangles, known normals)
- [ ] 1.4.2 Test `ComputeIntelliScanAngles()` at (θ=0, φ=0) — should find 4 unique angles (0, 90, 180, 270)
- [ ] 1.4.3 Test at (θ=30°, φ=45°) — known rotated normals
- [ ] 1.4.4 Test with degenerate mesh (all faces have zero area) — should return warning
- [ ] 1.4.5 Test with flat mesh (single triangle) — should return flat-mesh warning

**Requirements:** T1-12, T5-1, T5-2  
**Estimate:** 1 hour

### Task 1.5 — Fix score normalization scope

**Files:** `internal/search/search.go`, `internal/objectives/objectives.go`

**Changes:**
- [ ] 1.5.1 Refactor `evaluateOrientations()` to return raw (unnormalized) fMtl/fEnergy/fHdn arrays alongside the scored orientation records
- [ ] 1.5.2 In `Run()`, collect all raw values from coarse + fine batches
- [ ] 1.5.3 Normalize all raw values together in one `Normalize()` call per objective
- [ ] 1.5.4 Compute combined scores from globally normalized values
- [ ] 1.5.5 Verify: run the same search before and after — the best orientation should be the same or very close
- [ ] 1.5.6 Add regression test: search with two overlapping ranges, verify scores are globally comparable

**Requirements:** T2-1, T2-2  
**Estimate:** 30 min

### Task 1.6 — Add search cancellation via context

**Files:** `internal/search/search.go`, `app.go`, `frontend/src/main.js`

**Changes:**
- [ ] 1.6.1 Add `context.Context` parameter to `search.Run()` signature
- [ ] 1.6.2 Add `ctx.Done()` check in the evaluation loop inside `evaluateOrientations()` (or in `Run()`'s loop over orientations)
- [ ] 1.6.3 Add `searchCtx` / `searchCancel` fields to `App` struct in `app.go`
- [ ] 1.6.4 Create `CancelSearch()` in `app.go` — invoke `searchCancel()`
- [ ] 1.6.5 Wails binding: auto-generate binding for `CancelSearch()`
- [ ] 1.6.6 Frontend: wire "Stop" button to call the new cancellation binding
- [ ] 1.6.7 Frontend: remove the `searchCancel` flag (no longer needed — Go handles it)
- [ ] 1.6.8 Test: start a search on a large mesh, click Stop, verify CPU usage drops within 1 second

**Requirements:** T3-1, T3-2, T3-3  
**Estimate:** 1 day

### Task 1.7 — Fix contour plot coarse grid

**Files:** `internal/search/search.go`, `frontend/src/plots.js`

**Sub-tasks:**
- [ ] 1.7.1 Add `CoarseThetas` and `CoarsePhis` fields to `Result` struct in `search.go`
- [ ] 1.7.2 Set them in `Run()` from the package-level arrays
- [ ] 1.7.3 In `frontend/src/plots.js`, replace hard-coded `coarseThetas`/`coarsePhis` with values from `result.coarseThetas`/`result.coarsePhis`
- [ ] 1.7.4 Pass result object to `drawContourPlot()` (already done — just use the fields)
- [ ] 1.7.5 Remove the hard-coded arrays and their divergence from the actual Go values

**Requirements:** T4-1, T4-2  
**Estimate:** 30 min

### Task 1.8 — Fix IntelliScan wrap-around deduplication

**Files:** `internal/search/intelliscan.go`

**Changes:**
- [ ] 1.8.1 Replace the single wrap-around check with a loop that repeatedly merges across the 360/0 boundary until stable
- [ ] 1.8.2 Add test: generate angles that span the 360/0 boundary (e.g., 358, 359, 0, 1, 2 → should dedup to 1 or 2 unique values)
- [ ] 1.8.3 Add test: all angles within 1.5° range spanning 359° to 2° (should produce ≤2 unique values)

**Requirements:** T5-1, T5-2  
**Estimate:** 1 hour

---

## Task Dependency Graph

```
1.1 (objectives tests)
  └── no deps
1.2 (BVH tests)
  └── no deps
1.3 (physics tests)
  └── no deps
1.4 (IntelliScan tests)
  └── no deps (but needs T5 fix for wrap-around tests to pass)
1.5 (normalization fix)
  └── no code deps — but should run 1.1 after to verify tests still pass
1.6 (search cancellation)
  └── no deps
1.7 (contour grid)
  └── no deps
1.8 (IntelliScan dedup)
  └── no code deps
```

All tasks in Sprint 1 are **independent** and can be parallelized. Recommended execution:
1. **Day 1:** 1.1 + 1.2 + 1.3 (tests — morning) → 1.5 (normalization — afternoon)
2. **Day 2:** 1.6 (search cancellation — this is the biggest item)
3