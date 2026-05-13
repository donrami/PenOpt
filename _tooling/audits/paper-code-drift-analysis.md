# Paper-Code Drift Analysis

**Date:** 2026-05-13
**Auditor:** Paper-code drift review subagent
**Scope:** Compare PenOpt Go backend code against the scientific papers it cites, focusing on drift since original gap analysis.

---

## Summary

The codebase has two **critical correctness bugs** that violate consistency with the cited papers and can cause incorrect optimal-angle selection. Several lesser drifts (documented deviations, placeholder objectives, unverified data) noted in the original gap analysis remain unresolved.

### Immediate Action Required

1. **`tuy.go` rotation order is incompatible with `raycaster.go`** — Tuy-Smith completeness is computed for a *different physical orientation* than ray-casting objectives, rendering combined scores incoherent.
2. **`computeFacePenetrationsGrid` uses unsorted `triIndices` after sorted `hits`** — heatmap penetration values are assigned to wrong faces, producing misleading visual feedback.

---

## Per-Paper Findings

### 1. Ito et al. 2020 — Orientation Optimization & Jig Construction

**File:** `internal/search/search.go`, `internal/objectives/objectives.go`, `internal/search/tuy.go`

**Has implementation drifted since original gap analysis?**

- **CRITICAL:** `tuy.go` (ComputeTuyCompleteness) uses rotation order **φ-then-θ** (Y-axis first, then X-axis), while `raycaster.go` uses **θ-then-φ** (X-axis first, then Y-axis). For the same (θ, φ) input, these produce different physical orientations. The Tuy completeness score describes orientation O₁ while the f_mtl/f_energy/f_hdn scores describe orientation O₂. The combined score is therefore incoherent — it mixes objectives from two different orientations. This directly violates the paper's requirement that all objectives be evaluated at the same orientation.

  **Demonstration** (θ=30°, φ=45°, unit normal n=(0.864, 0.432, -0.259)):
  - Raycaster normal: n' = (0.605, 0.504, -0.617)
  - Tuy normal: n' = (0.428, 0.771, -0.472)
  - Both nx and nz differ materially (Δnx=0.177, Δnz=-0.145).

- **No drift in f_mtl formula** — still uses m=3 cube-root mean, correct with respect to paper eq. 1. ✅

- **f_hdn** remains a documented proxy: max-penetration range instead of paper's silhouette area range (not a regression — noted in original gap analysis).

- **Coarse grid:** still 15° vs paper's 10° (not a regression — documented speed trade-off).

- **f_fdk (Tuy condition):** The FTuy inversion (1-completeness for minimisation) is correctly implemented. This was a recent fix and is correct with respect to the paper. ✅

- **Missing ny update** in `tuy.go` line 60: after the X-rotation step, `ny` is never updated. The code reads `nz = ny*sinT + rz*cosT` using the pre-X-rotation `ny`. Since the completeness check only uses `nx²+nz²`, this doesn't change the result, but the normal is mathematically incorrect. This is a minor issue.

**Are RECENT changes incorrect with respect to the paper?**

- **FTuy inversion:** Correct (1-completeness → lower = better). ✅
- **Coverage detection and warnings:** Not in the paper, but does not contradict it. Neutral.
- **Auto-size ray grid:** Not in the paper. Extends beyond the paper's scope without contradiction.
- **Face-centroid fallback:** Not in the paper. Engineering solution for small parts. Neutral.
- **Grid heatmap:** Implementation has a bug (see item 2 below), but the concept doesn't contradict the paper.
- **Convergence metrics:** Not in the paper. Neutral.

**Could the optimal angle be wrong?** YES — the rotation order inconsistency in `tuy.go` means Tuy completeness scores are computed for a different orientation than the primary ray-casting objectives. This *directly corrupts* the combined score ranking, potentially causing a suboptimal orientation to be selected.

---

### 2. Heinzl et al. 2011 — Fast Estimation of Optimal Specimen Placements

**File:** `internal/raycaster/raycaster.go`

**Has implementation drifted since original gap analysis?**

No drift. The ray-casting pipeline (BVH-accelerated, CPU-based) matches the paper's GPU approach in algorithm (cast rays through voxels/pixels, compute entry/exit segment pairs). The CPU BVH choice is a documented design trade-off. ✅

**Are RECENT changes incorrect?**

- **computeFacePenetrationsGrid:** This new function has a **CRITICAL BUG** — it uses `triIndices` from `IntersectAll` assuming they correspond one-to-one with the sorted `hits` array. However, `IntersectAll()` sorts hits by distance but **leaves triIndices in BVH traversal order** (unsorted). The code at `raycaster.go:373` iterates:
  ```go
  for i := 0; i < len(hits)-1; i += 2 {
      ti := triIndices[i]   // BUG: does not correspond to hits[i] after sort
  ```
  After sorting, `hits[i]` is the i-th closest intersection, but `triIndices[i]` is the triangle at the i-th BVH-traversal position, which is unrelated. Per-face max penetration values are therefore mapped to **wrong face indices**, producing misleading heatmap visualisation.

- **Face-centroid fallback code** (both `ComputeTransmissionLengthsFaceCentroid` and the fallback path in `ComputeFacePenetrations`) does *not* use `triIndices` and is correct. ✅

---

### 3. Lifton & Poon 2023 / Butzhammer et al. 2026 — IntelliScan

**File:** `internal/search/intelliscan.go`

**Has implementation drifted since original gap analysis?**

No drift. The implementation matches both papers:
- Tangent condition `d̂(α) · n̂ = 0` ✅
- Two solutions per face (α and α+180°) ✅
- Automated atan2 computation ✅
- Deduplication with tolerance ✅
- Butzhammer's Method A (single-pass collection) implemented ✅

**Rotation order:** `intelliscan.go` applies inverse rotation as Ry(-φ) then Rx(-θ), giving forward rotation Ry(φ) * Rx(θ) — this is CONSISTENT with raycaster.go. ✅

(Note: The comment on line 83 says "Rotate by phi around Y, then theta around X" which is misleading — the actual inverse is -phi then -theta, forward is theta-then-phi. The comment should be corrected.)

**Are RECENT changes incorrect?**

- **Cone-beam geometry mode (T3.1):** The geometry mode detection (sod/sdd < 0.7 → cone-beam) and the comment that the math is identical for both modes is consistent with the papers. ✅
- **Butzhammer Method B (greedy selection)** is still not implemented — same gap as before.

---

### 4. Grozmani et al. 2019 — Measurement Uncertainty

**File:** `internal/objectives/objectives.go` (f_uncertainty referenced in comments)

**Has implementation drifted?**

No drift — f_uncertainty is still listed as a "requires per-face data not collected by sparse ray grid" placeholder. No regression. The SOD optimisation gap remains. ✅

---

### 5. Tucker et al. 1991 / Boone & Seibert 1997 — X-ray Spectrum Models

**File:** `internal/physics/material.go` (ComputeEffectiveEnergy)

**Has implementation drifted?**

No regression. The heuristic `(kVp-E)/E` spectrum is still used. The gap (no Tucker/Boone model, no characteristic lines, no self-filtration) remains documented and unchanged.

The comment in `ComputeEffectiveEnergy` still reads:
```go
phi := math.Max(0, (kVp-E)/E)   // heuristic bremsstrahlung continuum
```

No validation against published spectrum models has been added. ❌ (Still open gap.)

---

### 6. NIST XCOM — Photon Cross Sections

**File:** `internal/physics/material.go` (LogLogInterp, material data)

**Has implementation drifted?**

No drift. Log-log interpolation is implemented per NIST XCOM standard. ✅ The data cross-verification gap (not verified against current NIST XCOM online tool) remains. ❌

---

### 7. Deb et al. 2002 (NSGA-II) & Alsaffar et al. 2022 (Scatter)

Both remain aspirational/not-implemented. No regression. ✅

---

## Cross-Cutting Issues

### Critical Bugs

| # | Bug | Location | Impact |
|---|-----|----------|--------|
| **B1** | Rotation order inconsistency: `tuy.go` applies φ-then-θ (Y-then-X forward), `raycaster.go` applies θ-then-φ (X-then-Y forward) | `tuy.go:46-61` vs `raycaster.go:147-168` | Tuy completeness evaluated for wrong orientation → combined score mixes objectives from different orientations → optimal angle may be wrong |
| **B2** | `IntersectAll()` sorts `hits` but leaves `triIndices` unsorted; `computeFacePenetrationsGrid` assumes sorted correspondence | `bvh.go:288-292`, `raycaster.go:373` | Per-face penetration heatmap values assigned to wrong face indices → misleading visualisation |

### Moderate Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| **M1** | `tuy.go` X-rotation does not update `ny` component | `tuy.go:58-61` | Normal vector mathematically incomplete; doesn't affect completeness result (only uses nx²+nz²) |
| **M2** | `intelliscan.go` comment states "Rotate by phi around Y, then theta around X" but actual inverse order is -phi then -theta (forward = theta-then-phi) | `intelliscan.go:83` | Code is correct, comment is misleading |

### Documented Deviations (Unchanged)

| # | Deviation | Paper | Status |
|---|-----------|-------|--------|
| D1 | 15° coarse grid vs 10° | Ito 2020 | Speed trade-off, needs validation |
| D2 | f_hdn uses max penetration range vs silhouette area | Ito 2020 | Proxy, needs validation |
| D3 | Tucker/Boone spectrum not implemented | Tucker 1991 / Boone 1997 | Known gap |
| D4 | NIST XCOM data unverified against online tool | NIST XCOM | Checklist item |
| D5 | SOD not optimised jointly with orientation | Grozmani 2019 | Feature gap |
| D6 | Butzhammer Method B (greedy coverage) not implemented | Butzhammer 2026 | Feature gap |
| D7 | No scatter awareness | Alsaffar 2022 | Feature gap |

---

## Conclusion

**The code has critically drifted from the paper ground truth in two ways since the original gap analysis:**

1. **Rotation order inconsistency (B1)** is the most serious finding. It makes the combined score mathematically incoherent — the Tuy completeness objective and the ray-casting objectives (f_mtl, f_energy, f_hdn) describe *different orientations* despite sharing the same (θ, φ) parameter values. This is a correctness bug that can cause the optimizer to select the wrong optimal angle.

2. **Heatmap face-index mismatch (B2)** is a separate critical bug in the recently-added grid-based heatmap code, causing per-face visualisation data to be displayed on wrong faces.

**Recommendation:** Fix B1 first (make `tuy.go`'s rotation order consistent with `raycaster.go`), then fix B2 (sort triIndices alongside hits in `IntersectAll` or use a different mapping strategy). Address the documented deviations (D1–D7) as roadmap items.
