# Oracle Scrutiny: Paper-Code Gap Analysis

**Date**: 2026-05-12  
**Scrutinizer**: Oracle (high-context decision-consistency agent)  
**Target**: `_tooling/audits/paper-code-gap-analysis.md`  
**Method**: Full reread of both the gap analysis and the underlying source code, cross-referencing for soundness, completeness, severity, consistency, and blind spots.

---

## Issues Found in the Gap Analysis

### 1. P2 is under-severed — FTuy produces actively wrong optimization, not a placeholder

**Location**: PLACEHOLDER section, P2  
**Problem**: Now that all 5 weights transmit from the frontend, a non-zero wTuy makes the optimizer **actively prefer orientations with worse Tuy-Smith completeness**. This is a bug, not a placeholder.

All three weight presets allocate non-zero wTuy:
- Quality: 0.05
- Balanced: 0.10
- Energy: 0.05

P2 and P1 together mean **5-10% of the optimization signal is actively wrong (fTuy) or wasted (fBh)**.

**Fix**: Move P2 from PLACEHOLDER to GAP (or BLOCKER). The concrete fix for the inverted function:

```go
func FTuy(values []float64) []float64 {
    result := make([]float64, len(values))
    for i, v := range values {
        result[i] = 1.0 - v
    }
    return result
}
```

### 2. G2 misses f_hdn / f_energy double-counting

**Location**: GAP section, G2  
**Problem**: Both f_hdn and f_energy are computed from the same `maxPerProjection` values:
- f_energy = max(all maxPerProjection)
- f_hdn = max(maxPerProjection) − min(maxPerProjection)

These are highly correlated — a long path through the object in any projection increases both. A user setting high weights for both expecting a trade-off will get double-penalty instead. A better proxy for projection non-uniformity would be the standard deviation of max per-projection lengths.

**Blind spot**: The analysis should flag this correlation.

### 3. Warning count mismatch

**Location**: Summary table says "2", W section has 4 items (W1, W2, W3, W4)  
**Problem**: Consistency error. The count is wrong.

### 4. G4 conflates two separate concerns

**Location**: GAP section, G4  
**Problem**: The title says "global vs batch-local normalization" but the real issue is the **coarse/fine ray grid resolution mismatch**: coarse uses 8×8 (36 projections), fine uses 16×16 (90 projections). Top-3 selection uses coarse-only scores, but final ranking mixes both under global normalization. An orientation that scores well at 8×8 may score poorly at 16×16. The normalization scheme is a separate, less impactful detail.

**Fix**: Split into two findings — normalization approach (minor, arguably an improvement) and resolution mismatch (significant).

### 5. W4 insufficiently critical of cone-beam formula

**Location**: WARNING section, W4  
**Problem**: The analysis says the cone-beam claim deserves scrutiny but doesn't call it out strongly enough. The code's docstring gives two different equations that **only** simplify to the same `atan2(nx, nz)` under the parallel-beam assumption (source at infinity). For true cone-beam at short SOD, the ray direction varies across the detector by the cone half-angle, so the condition should be a nonlinear equation per face-per-projection.

**Fix**: Strengthen the critique — the code uses parallel-beam physics regardless of what `GeometryMode` says. The formula is NOT identical.

### 6. T4 references B3 which was removed from the document

**Location**: COVERAGE section, T4  
**Problem**: Says "bugs like B3 can go undetected" but B3 was removed from the tagged findings table since it's already fixed. Stale reference.

**Fix**: Remove or rephrase the B3 reference.

### 7. Recommendation priority should be reordered

**Location**: Prioritized Recommendations  
**Problem**: #2 (fix FTuy inversion — active wrongness) should be #1. #1 (document 15° deviation — documentation only) should be lower.

### 8. Per-paper alignment scores need recalibration

| Paper | Current Score | Oracle Assessment |
|-------|--------------|-------------------|
| NIST XCOM | 75% | Too high. Data ported third-hand from JS without verification against actual NIST standard. K-edges for only 3/40+ materials. **50-60%** is more appropriate. |
| Tucker/Boone | 25% | Slightly generous. The heuristic `(kVp-E)/E` formula shares nothing with Tucker/Boone beyond the concept of a spectrum. **15%** more accurate. |

### 9. Angle-wrapping in fine search not analyzed

**Blind spot**: search.go lines 236-239 wrap theta `+= 180` (correct for [0,180)) and phi `+= 360` (stays in [0,360)). Fine search around a candidate **at the edge of the search range** may wrap to orientations far from the original candidate, potentially evaluating irrelevant orientations.

### 10. BVH early-exit edge case with non-watertight meshes

**Blind spot**: bvh.go line 157 exits early when `tFar < 0`, which is correct for most cases. But when the ray origin is inside the mesh (possible with non-watertight meshes), this can miss intersections and produce silently wrong penetration lengths. PenOpt warns about watertightness but doesn't handle this case.

---

## Overall Assessment

**Soundness**: ✅ Core claims are correct. One mathematical claim (cone-beam formula identity in W4) should be stronger.

**Completeness**: ✅ Mostly complete. One significant blind spot (f_hdn/f_energy correlation). Two minor blind spots (angle-wrapping, BVH early-exit).

**Severity calibration**: ⚠️ One error: P2 under-severed (should be GAP or BLOCKER).

**Internal consistency**: ⚠️ Warning count mismatch (says 2, has 4). T4 stale reference to removed B3.

**Actionability**: ✅ Recommendations are specific and actionable. But priority order should swap #1 and #2.

**Overall**: The gap analysis is **thorough and fundamentally correct**. The corrections needed are moderate and focused: recalibrate P2's severity, add the f_hdn/f_energy correlation note, fix the warning count, strengthen the cone-beam critique, and reorder the recommendations.

---

## Concrete Corrections to Apply

1. Move P2 from PLACEHOLDER to GAP. Title: "FTuy inverted — optimizes for worse completeness"
2. Fix warning count: "2" → "4" (or restructure W section)
3. Add blind-spot note to G2: f_hdn/f_energy double-counting
4. Split G4: normalization scheme (minor) vs coarse/fine resolution mismatch (significant)
5. Strengthen W4: code uses parallel-beam regardless of GeometryMode
6. Remove stale B3 reference from T4
7. Swap recommendation #1 and #2
8. Recalibrate NIST XCOM (75% → 55%) and Tucker/Boone (25% → 15%) scores
9. Add blind-spot finding: angle-wrapping in fine search
10. Add blind-spot finding: BVH early-exit with non-watertight meshes
