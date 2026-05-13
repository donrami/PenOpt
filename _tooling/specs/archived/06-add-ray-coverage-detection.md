# Spec 06: Add Ray Coverage Detection

**Gap analysis ref**: G9 (part 1)  
**Packages**: `internal/raycaster/`, `internal/search/`, `internal/objectives/`  
**Depends on**: Nothing (can be done independently)  
**Effort**: ~25 lines of Go

---

## 1. Paper Ground Truth

Neither Ito 2020 nor Heinzl 2011 explicitly address the small-part regime. Both assume the part fills a reasonable fraction of the detector. However, the principle of **adequate sampling** is fundamental to any ray-based method: if too few rays intersect the mesh, the objective function values are statistically unreliable.

This spec adds a **coverage fraction metric** — the fraction of rays that have non-zero penetration — alongside the existing objectives. This lets the user (and downstream code) detect undersampling.

## 2. Current Code Behaviour

**File**: `internal/raycaster/raycaster.go` in `ComputeTransmissionLengths`

```go
lengths := make([]float64, totalRays)
// ...
for ri := 0; ri < raysPerProj; ri++ {
    // ... ray casting, set lengths[offset+ri] = penetration
}
```

All ray penetration lengths are stored, but there is no aggregation of how many rays actually intersected the mesh. The objectives (`fMtl`, `fEnergy`, `fHdn`) are computed from all rays including the zeros. If 254 out of 256 rays miss the part, the objectives are diluted but there's no indicator of this.

## 3. Correct Behaviour

Each orientation evaluation should report a **coverage fraction**: the fraction of rays across all projections that have non-zero penetration. This value is:

- `1.0` when every ray passes through some material (oversampled — rare)
- `0.0` when no ray hits the part at all (completely undersampled)
- Typical values for well-matched grid: 0.3 - 0.8

A coverage fraction < 0.05 should trigger a warning: the ray grid is too coarse for the part at this orientation.

## 4. Implementation

### 4.1 Add coverage to `OrientationResult`

**File**: `internal/raycaster/raycaster.go`

Add a `CoverageFraction` field to `OrientationResult`:

```go
type OrientationResult struct {
    Theta             float64
    Phi               float64
    NumProjections    int
    RayGridX, RayGridY int
    Lengths           []float64
    MaxPerProjection  []float64
    CoverageFraction  float64   // NEW: fraction of rays with non-zero penetration
    BuildTimeMs       float64
}
```

### 4.2 Compute coverage in `ComputeTransmissionLengths`

After the projection loop, count non-zero entries:

```go
// After wg.Wait() and before returning:
nonZero := 0
for _, l := range lengths {
    if l > MIN_SEGMENT {
        nonZero++
    }
}
result.CoverageFraction = float64(nonZero) / float64(totalRays)
```

Use `MIN_SEGMENT` (0.01mm) as the threshold to avoid counting numerical noise as hits.

### 4.3 Surface coverage through the search pipeline

**File**: `internal/search/search.go`

Add `CoverageFraction` to `OrientationRaw`:

```go
type OrientationRaw struct {
    Theta            float64
    Phi              float64
    FMtlRaw          float64
    FEnergyRaw       float64
    FHdnRaw          float64
    FTuyRaw          float64
    FBhRaw           float64
    MaxPerProjection []float64
    CoverageFraction float64   // NEW
}
```

Fill it from the raycaster result in `evaluateOrientationsRaw`:

```go
raws = append(raws, OrientationRaw{
    // ... existing fields ...
    CoverageFraction: result.CoverageFraction,
})
```

### 4.4 Add coverage warning to Result

```go
type Result struct {
    // ... existing fields ...
    MinCoverageFraction float64 `json:"minCoverageFraction"` // NEW: lowest across all evaluated orientations
    CoverageWarning     string  `json:"coverageWarning,omitempty"`  // NEW
}
```

In `Run()`, after all evaluations, compute min coverage and emit a warning:

```go
// After all evaluations, find minimum coverage
minCov := 1.0
for _, r := range allRaws {
    if r.CoverageFraction < minCov {
        minCov = r.CoverageFraction
    }
}
result.MinCoverageFraction = minCov
if minCov < 0.05 {
    result.CoverageWarning = fmt.Sprintf(
        "Only %.1f%% of rays intersected the part. Consider increasing ray grid resolution or using a scanner with smaller detector for more reliable results.",
        minCov*100)
} else if minCov < 0.20 {
    result.CoverageWarning = fmt.Sprintf(
        "Ray coverage is low (%.1f%% of rays hit the part). Results may be less reliable for fine features.",
        minCov*100)
}
```

### 4.5 Edge cases

- **Mesh with zero faces**: All lengths = 0, coverage = 0. Warning is correct.
- **Mesh with zero-volume slice** (flat mesh like a 2D surface): Penetration lengths are all near-zero (single surface, no back face). CoverageFraction counts non-zero entries, so rays that do hit a face are counted. This correctly distinguishes "no mesh at all" (coverage = 0) from "mesh exists but is thin" (coverage > 0, though penetration lengths are small).
- **Performance**: The O(n) scan over `lengths` adds ~microseconds per orientation — negligible.

## 5. Validation

### 5.1 Existing tests that must still pass

```
go test ./internal/raycaster   # All penetration tests
go test ./internal/search      # Search execution tests
```

### 5.2 New test

```go
func TestCoverageFraction_SmallPart(t *testing.T) {
    // A tiny mesh on a large detector should produce low coverage
    m := buildSmallMesh(1.0) // 1mm part
    bvhTree := bvh.Build(m)
    cfg := raycaster.DefaultScannerConfig() // default 400mm detector
    cfg.RayGridX = 8
    cfg.RayGridY = 8
    cfg.NumProjections = 8
    
    grid := raycaster.ComputeRayGrid(cfg)
    result := raycaster.ComputeTransmissionLengths(0, 0, bvhTree, cfg, grid)
    
    if result.CoverageFraction > 0.1 {
        t.Errorf("Small part on coarse grid: coverage = %.4f, expected < 0.1", result.CoverageFraction)
    }
}

func TestCoverageFraction_LargePart(t *testing.T) {
    // A large mesh should have high coverage
    m, bvhTree := buildTestMesh() // ~100mm box
    cfg := raycaster.DefaultScannerConfig()
    cfg.RayGridX = 16
    cfg.RayGridY = 16
    cfg.NumProjections = 8
    
    grid := raycaster.ComputeRayGrid(cfg)
    result := raycaster.ComputeTransmissionLengths(0, 0, bvhTree, cfg, grid)
    
    if result.CoverageFraction < 0.5 {
        t.Errorf("Large part on fine grid: coverage = %.4f, expected > 0.5", result.CoverageFraction)
    }
}
```

### 5.3 Manual verification

1. Load a small part mesh (e.g., a 5mm cube)
2. Run optimization with default 8×8 grid
3. Verify coverage warning appears
4. Increase grid to 32×32
5. Verify coverage warning disappears or severity reduces
