# Spec 01: Fix FTuy Inversion

**Gap analysis ref**: G7 (BLOCKER)  
**Papers**: Ito et al. 2020 §2.2 — Tuy-Smith completeness condition (f_fdk)  
**Packages**: `internal/objectives/`, `internal/search/`  
**Depends on**: Nothing  
**Effort**: ~10 lines of Go, 1 test update

---

## 1. Paper Ground Truth

Ito et al. 2020 defines three objectives to minimize: f_mtl, f_hdn, f_fdk.

The third objective **f_fdk** quantifies Tuy-Smith completeness violation — i.e., the fraction of mesh faces that do **not** satisfy the Tuy-Smith condition at a given orientation. A lower f_fdk value means fewer face normals lack a tangent ray, which means better cone-beam reconstruction quality.

Since PenOpt's scoring system **minimizes** all objectives, f_fdk should be: `f_fdk = 1 − completeness` where completeness is the fraction of faces with at least one tangent ray direction.

## 2. Current Code Behaviour

**File**: `internal/objectives/objectives.go` lines 67-76

```go
func FTuy(values []float64) []float64 {
    // We return the values as-is ...
    // We'll document that the caller should use (1 - tuy) if they want to minimize.
    return values
}
```

The function is a pass-through. It returns the completeness fraction (higher = better) unchanged. But the scoring system minimizes all objectives. **The optimizer actively prefers orientations with worse Tuy-Smith completeness.**

**File**: `internal/search/search.go` — the callers (`EvaluateSingle`, `evaluateOrientationsRaw`, `globalScoreAndNormalize`) never apply `1 - tuy`. Every weight preset allocates `wTuy: 0.05-0.10`, so 5-10% of the signal is inverted.

## 3. Correct Behaviour

`FTuy()` must return `(1 - completeness)` so that:
- An orientation where 95% of faces satisfy Tuy-Smith → fTuy = 0.05 (low = good)
- An orientation where only 60% satisfy Tuy-Smith → fTuy = 0.40 (high = bad)
- The scoring system correctly minimizes fTuy

## 4. Implementation

### 4.1 Fix `FTuy()` in `objectives.go`

Replace:
```go
func FTuy(values []float64) []float64 {
    return values
}
```

With:
```go
// FTuy inverts Tuy-Smith completeness for minimization.
// f_fdk = 1 - completeness, where completeness is the fraction of faces
// satisfying the Tuy-Smith condition. Lower fTuy = better (Ito 2020 §2.2).
func FTuy(values []float64) []float64 {
    result := make([]float64, len(values))
    for i, v := range values {
        result[i] = 1.0 - v
    }
    return result
}
```

### 4.2 No changes needed in `search.go`

The callers pass `FTuyRaw` values through `CombinedScore` which calls `objectives.FTuy(fTuyVals)`. Since we fixed `FTuy` itself, all callers automatically get inverted values.

### 4.3 Edge cases

- **Completeness = 1.0 (all faces satisfy Tuy)**: fTuy = 0.0 → correct, best possible score
- **Completeness = 0.0 (no faces satisfy Tuy)**: fTuy = 1.0 → correct, worst possible score
- **Single orientation evaluation** (EvaluateSingle path): `EvaluateSingle` computes `fTuy = ComputeTuyCompleteness(...)` and stores it directly. Since EvaluateSingle doesn't call `objectives.FTuy()`, it stores the raw completeness. This is correct — EvaluateSingle is a preview function that returns raw metrics, and the frontend displays the raw value correctly as a percentage.

### 4.4 Double-check: Does Normalize handle all-[0,1] range correctly?

After inversion, fTuy values are in [0, 1]. `Normalize` will map them:
- Min = 0.0, Max = 1.0 after `1 - x` conversion
- If all orientations have identical completeness: range = 0, all normalized to 0 → correct (no differentiation needed)

## 5. Validation

### 5.1 Existing tests that must still pass

```
go test ./internal/objectives    # CombinedScore, Normalize, FMtl, FEnergy, FHdn
go test ./internal/search        # EvaluateSingle, Run, TuyCompleteness
```

### 5.2 Updated test for `objectives_test.go`

Update `TestCombinedScore_Weighted` and `TestCombinedScore_Minimax` to verify FTuy inversion:

```go
func TestFTuy_Inversion(t *testing.T) {
    input := []float64{1.0, 0.8, 0.5, 0.0}
    got := FTuy(input)
    want := []float64{0.0, 0.2, 0.5, 1.0}
    for i := range got {
        if math.Abs(got[i]-want[i]) > 1e-10 {
            t.Errorf("FTuy[%d] = %v, want %v", i, got[i], want[i])
        }
    }
}
```

### 5.3 Manual verification

1. Load a box mesh (known: 8/12 faces satisfy Tuy at (0,0) → completeness = 0.666 → fTuy = 0.333)
2. Run optimization with all weight presets
3. Verify the f_tuy column in results shows 33.3% for the above orientation
4. Verify the "best" orientation has a lower f_tuy (better) than the "worst"

### 5.4 Regression risk

The fTuy values stored in `OrientationScore.FTuy` (used by the frontend for display in the results table) come from `EvaluateSingle` and `evaluateOrientationsRaw`, which store raw completeness. After this fix, `EvaluateSingle` still stores raw completeness (correct for display), while the scoring uses inverted values (correct for optimization). The frontend displays `(bestScore.fTuy * 100).toFixed(1) + '%'` which shows raw percentage — this remains correct.
