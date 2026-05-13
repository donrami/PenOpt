# Oracle Scrutiny: Paper-Code Drift Analysis

**Date**: 2026-05-13  
**Scrutinizer**: Oracle subagent  
**Target**: `_tooling/audits/paper-code-drift-analysis.md`  
**Method**: Read every source file referenced, traced rotation math manually with matrix verification, verified IntersectAll sort vs triIndices correspondence.

---

## Verdict

The drift analysis is **correct on both critical bugs**. I verified each claim by reading the actual source code and tracing the math. No false positives, no missed issues of equal severity.

---

## B1 — Rotation Order Inconsistency: CONFIRMED (CRITICAL)

### What the drift analysis says
> tuy.go uses phi-then-theta (Y-then-X forward), raycaster.go uses theta-then-phi (X-then-Y forward).

### What I verified

I traced the rotation math for both paths using matrix multiplication and verified with the example values from the report.

**Raycaster.go** (and all other paths except tuy.go):
- Inverse applied: Ry(-phi) then Rx(-theta) (code order)
- Net inverse: Rx(-theta) . Ry(-phi)
- Forward (what's applied to the mesh): **Ry(phi) . Rx(theta)** = rotate around X by theta FIRST, then around Y by phi

**tuy.go:**
- Code order: Ry(phi) then Rx(theta) (forward, not inverse)
- Net forward: **Rx(theta) . Ry(phi)** = rotate around Y by phi FIRST, then around X by theta

**These are different.** In 3D rotation, Ry(phi).Rx(theta) != Rx(theta).Ry(phi) for non-zero angles.

I verified the example from the report with theta=30, phi=45:

| Component | Raycaster (Ry.Rx) | Tuy (Rx.Ry) | Difference |
|-----------|-------------------|-------------|------------|
| nx' | 0.605 | 0.428 | **0.177** |
| ny' | 0.504 | 0.771 | **-0.267** |
| nz' | -0.617 | -0.472 | **-0.145** |

The Tuy completeness score describes a different physical orientation than the f_mtl/f_energy/f_hdn scores. **The combined score is incoherent.**

### Which files are consistent with raycaster.go

| File | Forward order | Status |
|------|--------------|--------|
| `raycaster.go` — `ComputeTransmissionLengths` | Ry(phi) . Rx(theta) | -- (reference) |
| `raycaster.go` — `ComputeFacePenetrations` | Ry(phi) . Rx(theta) | OK |
| `raycaster.go` — `computeFacePenetrationsGrid` | Ry(phi) . Rx(theta) | OK |
| `raycaster.go` — `ComputeTransmissionLengthsFaceCentroid` | Ry(phi) . Rx(theta) | OK |
| `search/intelliscan.go` | Ry(phi) . Rx(theta) | OK |
| **`search/tuy.go` — `ComputeTuyCompleteness`** | **Rx(theta) . Ry(phi)** | **DIFFERENT ORDER** |

---

## B2 — Heatmap triIndices Sorting Bug: CONFIRMED (CRITICAL)

### What the drift analysis says
> computeFacePenetrationsGrid uses triIndices[i] assuming it corresponds to hits[i] after sorting, but IntersectAll sorts only hits and leaves triIndices unsorted.

### What I verified

**bvh.go IntersectAll** (lines 285-293):
```go
func (bvh *BVH) IntersectAll(...) (hits []float64, triIndices []int) {
    // ... collect hits and triIndices in BVH traversal order
    // Sort by distance (callers expect sorted results; triIndices left unsorted -- unused)
    if len(hits) > 1 {
        sort.Float64s(hits)
    }
    return
}
```
Comment explicitly says triIndices is unsorted after returning.

**raycaster.go computeFacePenetrationsGrid** (lines 608-620):
```go
hits, triIndices := bvhTree.IntersectAll(...)
for i := 0; i < len(hits)-1; i += 2 {
    seg := hits[i+1] - hits[i]
    if seg > MIN_SEGMENT {
        ti := triIndices[i]  // BUG: wrong face after sort
        if seg > localMax[ti] { localMax[ti] = seg }
    }
}
```

After sorting, hits[i] is the i-th closest hit, but triIndices[i] is from BVH traversal order at insertion time. They don't correspond. Per-face penetration values are assigned to wrong face indices.

**Note**: The main search paths (`ComputeTransmissionLengths`, `ComputeTransmissionLengthsFaceCentroid`) use `hits, _` and correctly ignore triIndices. Only `computeFacePenetrationsGrid` is affected.

---

## Additional findings

### M1: tuy.go missing ny update (Minor)
After the X-rotation step, the code never stores the updated Y component. Since only nx^2+nz^2 is checked, this doesn't affect the Tuy-Smith result. The normal is mathematically incomplete but functionally correct.

### M2: intelliscan.go comment misleading (Cosmetic)
Comment says "Rotate by phi around Y, then theta around X" but the code does the INVERSE rotation which corresponds to forward Ry(phi).Rx(theta) (first X then Y). The code is correct, the comment is wrong.

### Other findings
- No additional correctness issues found beyond B1 and B2
- All non-tuy.go paths use the same rotation order
- Only `computeFacePenetrationsGrid` uses triIndices and is affected by B2
- The main search paths are unaffected by B2 (they ignore triIndices)

---

## Summary

| ID | Issue | Status | Severity |
|----|-------|--------|----------|
| B1 | tuy.go rotation order wrong | **Confirmed** | CRITICAL |
| B2 | grid heatmap triIndices unsorted | **Confirmed** | CRITICAL |
| M1 | tuy.go ny not updated (no functional impact) | **Confirmed** | Minor |
| M2 | intelliscan.go comment misleading | **Confirmed** | Cosmetic |

Both critical bugs are real and verified against the actual source code. The drift analysis is accurate.
