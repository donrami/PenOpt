# Spec 02: Add Known-Answer Tests

**Gap analysis ref**: T3  
**Papers**: Ito et al. 2020, Heinzl et al. 2011  
**Packages**: `internal/search/`, `internal/objectives/`  
**Depends on**: Nothing (but ideally after 01 — FTuy fix — to avoid testing against wrong behaviour)  
**Effort**: ~60 lines of Go test code

---

## 1. Paper Ground Truth

Both Ito 2020 and Heinzl 2011 validate their methods by testing against simple geometries where the optimal orientation is known by symmetry:

- A **sphere** has no preferred orientation — any orientation produces identical penetration characteristics. The search should find no meaningful difference between orientations (all scores near-identical).
- A **cube** oriented face-on vs edge-on to the beam has known differences in max penetration (100mm face-on vs 141mm edge-on for a 100mm cube). The optimal orientation is face-on (lower max penetration).
- A **cylinder** has a known optimal orientation (axis parallel to rotation axis for uniform penetration).

## 2. Current Code Behaviour

**Existing tests** (`search_test.go`):
- Tests verify that functions run without error
- Tests verify Tuy completeness counts for known geometries (box, flat plate)
- **No test validates that the search finds the correct optimum** for any geometry
- `TestRun_ReturnsResult` checks that `AllScores` is non-empty and `SearchTimeMs > 0` — it tests execution, not correctness

## 3. Correct Behaviour

The test suite must include at least one test that:

1. Loads or constructs a simple geometric mesh
2. Computes objective function values at a **known-optimal orientation** analytically
3. Verifies the search produces a score at least as good at that orientation (or actually finds it)
4. Verifies objective function values match theoretical expectations within tolerance

## 4. Implementation

### 4.1 Test: Cube optimal orientation

A cube of side length S = 100mm (centered at origin):

| Orientation | Face-on (θ=0, φ=0) | Edge-on (θ=45, φ=0) |
|---|---|---|
| Center ray penetration | S = 100mm | S × √2 ≈ 141.4mm |
| f_energy (max path) | ~100mm | ~141mm |
| f_mtl (generalized mean) | ~100mm | ~124mm (distribution pulls up) |

The search should find the face-on orientation (θ≈0, φ≈0) as optimal.

Test structure:

```go
func TestSearch_FindsCubeFaceOn(t *testing.T) {
    m, bvhTree := buildCubeMesh(50.0) // 100mm cube
    cfg := raycaster.DefaultScannerConfig()
    cfg.RayGridX = 16
    cfg.RayGridY = 16
    cfg.NumProjections = 36

    result, err := search.Run(bvhTree, m, cfg, 
        [5]float64{0.3, 0.4, 0.2, 0.05, 0.05}, "weighted", nil, 0, 0)
    if err != nil {
        t.Fatalf("Run failed: %v", err)
    }

    // The best orientation should be near face-on
    best := result.BestOrientation
    t.Logf("Best: θ=%.1f°, φ=%.1f°, score=%.4f", best.Theta, best.Phi, best.Score)

    // Face-on: fMtl ≈ 100mm, fEnergy ≈ 100mm
    if best.FMtl < 90 || best.FMtl > 110 {
        t.Errorf("fMtl at optimum = %.1f mm, want ~100 mm", best.FMtl)
    }
    if best.FEnergy < 90 || best.FEnergy > 110 {
        t.Errorf("fEnergy at optimum = %.1f mm, want ~100 mm", best.FEnergy)
    }
}
```

Note: Tolerance will depend on the ray grid resolution. At 16×16 the ray grid is coarse enough that the exact values may vary. The test should check that the optimum is in the correct neighbourhood (±10°) rather than exact values.

### 4.2 Test: Sphere isotropy

A sphere has no preferred orientation — every orientation is equally good. The objective values should be near-identical regardless of search angles.

```go
func TestSphere_AllOrientationsEqual(t *testing.T) {
    m, bvhTree := buildSphereMesh(30.0, 2)
    cfg := raycaster.DefaultScannerConfig()
    cfg.RayGridX = 8
    cfg.RayGridY = 8
    cfg.NumProjections = 18  // few projections for speed

    // Evaluate two very different orientations
    s0 := search.EvaluateSingle(bvhTree, m, 0, 0, cfg)
    s45 := search.EvaluateSingle(bvhTree, m, 45, 45, cfg)

    // fMtl should be within 5% for a sphere
    diff := math.Abs(s0.FMtl - s45.FMtl) / math.Max(s0.FMtl, s45.FMtl)
    if diff > 0.05 {
        t.Errorf("Sphere fMtl varies by %.1f%% between orientations", diff*100)
    }
}
```

### 4.3 Test: fMtl known value for cube center penetration

For a ray passing through the center of a 100mm cube face-on, the penetration should be exactly 100mm. This is already tested in `raycaster_test.go` (`TestPenetrationCubeCenter`). The test here verifies that `FMtl` produces a value consistent with the known geometry.

```go
func TestFMtl_KnownGeometry(t *testing.T) {
    // For a 100mm cube face-on at center ray: path = 100mm
    // With some off-center rays having slightly shorter paths,
    // fMtl (m=3) should be close to but slightly less than 100mm
    lengths := make([]float64, 64)
    for i := range lengths {
        lengths[i] = 100.0  // all rays = 100mm for a perfect parallel beam
    }
    got := objectives.FMtl(lengths, 3)
    if math.Abs(got-100.0) > 0.01 {
        t.Errorf("FMtl(all 100mm) = %.4f, want 100.0", got)
    }
}
```

## 5. Validation

### 5.1 Existing tests that must still pass

```
go test ./internal/raycaster   # Penetration validation tests
go test ./internal/search      # Current search tests
```

### 5.2 New tests to write

Add to `search_test.go`:
- `TestSearch_FindsCubeFaceOn` — full search on box mesh, verify optimum neighbourhood
- `TestSphere_AllOrientationsEqual` — sphere isotropy check

Add to `objectives_test.go`:
- `TestFMtl_KnownGeometry` — FMtl with known-uniform penetration

### 5.3 Manual verification

Run the new tests, observe that:
- Cube optimum is within ±10° of (0, 0)
- Sphere fMtl varies by <5% between orientations
- FMtl with uniform input returns the expected value

If tests fail due to ray grid coarseness, adjust tolerances and document the actual expected range.
