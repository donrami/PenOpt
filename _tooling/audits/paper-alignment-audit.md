# PenOpt — Paper Alignment Audit

**Date:** 2026-05-11
**Scope:** Full codebase deep-dive and fidelity audit against 9 cited academic/standards references
**Auditor:** Pi (coding agent)

---

## Executive Summary

PenOpt implements a pipeline with **6 major algorithm blocks** (mesh import → BVH raycaster → objective evaluation → search/optimization → IntelliScan → jig generation). Each block claims lineage from one or more cited papers. This audit evaluates:

1. **Fidelity** — does the code match what the paper describes?
2. **Completeness** — are all paper claims implemented?
3. **Simplifications** — where does the code diverge and why?
4. **Gaps** — what's claimed but missing or differently implemented?

**Overall rating: 7/10** — Core algorithms are correctly implemented with appropriate simplifications, but several paper elements are partially implemented or uncited, and others are claimed but absent.

---

## 1. Ito et al. 2020 — Orientation Optimization and Jig Construction

**Cited in:** `internal/objectives/`, `internal/search/`
**Research file:** `../research/ito2020_orientation.md`

### 1.1 f_mtl — Generalized Mean of Transmission Lengths

**Paper says:** `f_mtl = (1/N · Σ x_i^m)^(1/m)` with m = 3 (cube-root mean).

**Implementation:** ✅ `objectives.FMtl(lengths, m float64)` at `objectives.go:87-97`

```go
func FMtl(lengths []float64, m float64) float64 {
    n := len(lengths)
    if n == 0 { return 0 }
    var sum float64
    for _, l := range lengths { sum += math.Pow(l, m) }
    return math.Pow(sum/float64(n), 1/m)
}
```

**Fidelity:** Exact. The formula matches equation (1) of Ito 2020. The default call site uses `m=3`. The function handles edge cases (empty slice, single element) gracefully. Test coverage is thorough (`TestFMtl`, `TestFMtlExact`).

**Rating:** ✅ **Fully aligned**

### 1.2 f_energy — Max Transmission Length (derived from Ito's framework)

**Paper says (Ito 2020):** The Ito paper formally lists exactly 3 objectives: `f_mtl`, `f_hdn`, and `f_fdk`. `f_energy` is not listed as a standalone objective equation in the paper. It is derived from the penetration-length analysis framework (the paper discusses how maximum path length determines required energy and correlates with artifact severity) and used as a practical surrogate.

**Implementation:** ✅ `objectives.FEnergy(lengths)` at `objectives.go:101-110`

**Fidelity:** Simple max function. Correct for the defined purpose. Should be described as "derived from Ito's penetration analysis framework" rather than a direct paper equation.

**Rating:** ✅ **Correct as metric; attribution clarified — it's inspired by the paper, not an explicit Ito equation**

### 1.3 f_hdn — Projection Metric Range

**Paper says (Ito 2020 §2.2):** `A_max − A_min` where A(α) is the **projection area** (silhouette area of the object at projection angle α). This measures how much the projected area changes with viewing angle, which relates to beam-hardening artifact severity.

**Implementation:** ⚠️ `objectives.FHdn(maxPerProjection)` at `objectives.go:114-128`

**Fidelity:** The code computes `max(v) − min(v)` of the `maxPerProjection` array, where each entry is the **maximum X-ray penetration length** at projection angle α. This is NOT the same as projection area (silhouette area). The code measures variation in penetration depth across projections, while the paper measures variation in projected silhouette area. These are related but distinct geometric properties — penetration length correlates with path length through the object, not with the 2D area of its projection.

**Rating:** ⚠️ **Conceptually related but different metric — penetration range ≠ silhouette area range. Named misleadingly.**

### 1.4 f_fdk — Tuy-Smith Condition (Paper §2.2)

**Paper says (Ito 2020):** The third objective evaluates the Tuy-Smith sufficiency condition — whether every plane intersecting the object also intersects the X-ray source trajectory. Faces that fail this condition produce cone-beam artifacts. The paper's concept is broader than just "faces parallel to the rotation axis"; it encompasses all forms of Tuy incompleteness.

**Implementation:** ❌ **Not implemented as an objective.** The `TuyCompletenessFraction()` function exists in `search/radon.go:72-82` and is exposed via `ComputeRadonSpace()`, but it is **not connected to the optimization pipeline**. The `f_completeness` objective in `objectives.go` exists as a definition (ID: `"f_completeness"`, line 38) but **its value is always zero** — it is never computed from raycasting data.

Note: The code's `ComputeTuyCriticalFaces()` checks `|nx| < 0.01 && |nz| < 0.01` which only detects faces whose normals are parallel to the Y (rotation) axis. This is one form of Tuy incompleteness but not the complete Tuy-Smith condition described in the paper.

This is the single largest gap in the Ito paper alignment. The paper's third objective is completely absent from the scoring pipeline.

**Impact:** The optimizer has only 2 of 3 Ito objectives active. The search may select orientations with severe Tuy-incomplete faces, producing poor reconstructions.

**Rating:** ❌ **Critical gap**

### 1.5 Two-Phase Grid Search (Paper §2.4)

**Paper says:** Evaluate at coarse intervals, select top candidates, refine at finer grid.

**Implementation:** ✅ `search.Run()` at `search.go:67-179`

| Aspect | Paper | PenOpt |
|---|---|---|
| Coarse spacing | 15° (Ito 2020 §2.4) | 15° (7×7 = 49 points) |
| Coarse range | [−45°, +45°] × [−45°, +45°] | Same |
| Fine refinement | ±5° at 1° steps | ±5° at 1° steps (121 points) |
| Top candidates | 3 | 3 |
| Normalization | Min-max per batch | Provisional per-batch + global renormalization after merge |

**Fidelity:** Very close, with one important improvement: PenOpt performs **provisional normalization** for top-3 selection within the coarse batch, then **global renormalization** after merging coarse + fine results. This fixes a bug that the paper doesn't address (normalization across differently-sized batches).

**Rating:** ✅ **Aligned with improvement**

### 1.6 Jig Construction (Paper §3)

**Paper says:** Automatic jig construction for optimal orientation.

**Implementation:** ⚠️ `jig.GenerateJig()` at `jig.go:40-100`

**Fidelity:** The paper describes a conforming support pocket with a base plate. PenOpt's implementation is a simple box pocket + base plate. This is:
- **Correct** for simple geometries
- **Incomplete** for complex geometries (no conforming support, no three-point support, no lattice structure)
- The paper's key innovation — generating a 3D-printable jig from the oriented mesh — is captured in spirit but the geometric sophistication is missing

**Rating:** ⚠️ **Partially aligned — geometrically simplified**

---

## 2. Lifton & Poon 2023 / Butzhammer 2026 — IntelliScan

**Cited in:** `internal/search/intelliscan.go`
**Research files:** `../research/lifton2023_intelliscan.md`, `../research/butzhammer2026_angles.md`

### 2.1 Tangent-Ray Condition

**Paper says (both):** `d̂(α) · n̂ = 0` where d̂ is the unit direction of the projection ray.

**Implementation:** ✅ `intelliscan.go:106-117`

```go
// For circular trajectory: d̂(α) = (-cos(α), 0, sin(α))
// Solving d̂(α) · n̂ = 0 → -nx·cos(α) + nz·sin(α) = 0 → tan(α) = nx/nz
alpha1 := math.Atan2(nx, nz) * 180 / math.Pi
```

**Fidelity:** Mathematically correct. The `atan2(nx, nz)` solution is equivalent to the paper's `α = arctan(nx/nz)` for the circular trajectory. Both 180°-separated solutions are generated.

**Rating:** ✅ **Fully aligned**

### 2.2 2D vs 3D (Lifton limitation → PenOpt improvement)

**Lifton paper:** 2D only, manual, requires technical drawings.

**PenOpt:** ✅ Full 3D via face normal rotation by (θ, φ), automatic STL processing.

PenOpt **exceeds** the original paper by operating in 3D with no manual intervention.

**Rating:** ✅ **Exceeds original specification**

### 2.3 Butzhammer Method A vs Method B

**Butzhammer paper:** Two algorithmic variants:
- Method A: Collect all tangent angles, deduplicate, return full set
- Method B: Greedy angle selection to achieve target coverage fraction

**Implementation:** ⚠️ `intelliscan.go` has both methods:

| Variant | Status |
|---|---|
| Method A (nil config) | ✅ Full implementation at `computeMethodA()` |
| Method B (config.MethodB = true) | ✅ Full implementation at `computeMethodB()` with greedy selection |

However, the Butzhammer paper is cited in the file header but **the Method B implementation was clearly added later** (it has a different coding style, a separate test file section, and the `Butzhammer2026` research file correctly documents it). The original IntelliScan implementation was Lifton-based, with Method B added as an extension.

**Fidelity:** Both methods are correctly implemented. Method B's greedy selection with coverage tracking matches Butzhammer's description.

**Rating:** ✅ **Aligned for both methods**

### 2.4 Butzhammer Results Claim

**Research file says (Butzhammer 2026):** The abstract states task-specific angles "substantially outperformed conventional high-projection scans" in terms of surface data completeness. The specific percentage improvement is not recorded in available reference material.

**Implementation:** ❌ **No validation test.** The `validation_test.go` verifies IntelliScan returns non-zero results and that Method B produces fewer angles than Method A. But **no test verifies that the computed angles actually improve reconstruction quality** over uniform projection spacing. The gauge block test at `validation_test.go:88-121` verifies that IntelliScan returns angles, not that the angles produce better dimensional measurements.

**Rating:** ⚠️ **Validation gap — functional correctness unverified**

---

## 3. Deb et al. 2002 — NSGA-II

**Cited in:** `internal/search/nsgaii.go`
**Research file:** `../research/deb2002_nsgaii.md`

### 3.1 Core Algorithm Components

| Component | Paper | PenOpt | Fidelity |
|---|---|---|---|
| Fast non-dominated sort (O(MN²)) | §III-A | `NonDominatedSort()` | ✅ Exact |
| Crowding distance | §III-B | `CrowdingDistance()` | ✅ Exact |
| Binary tournament selection | §III-C | `TournamentSelect()` | ✅ Exact |
| SBX crossover | §IV-B (additional ref) | `SBXCrossover()` | ✅ Exact |
| Polynomial mutation | §IV-B (additional ref) | `PolynomialMutation()` | ✅ Exact |
| Elitist µ+λ replacement | §III-C | Combined pop + truncation | ✅ Exact |

**Rating:** ✅ **All core mechanisms faithfully implemented**

### 3.2 NSGA-II Parameter Choices

| Parameter | Paper default | PenOpt | Notes |
|---|---|---|---|
| Crossover prob. | 0.9 | 0.9 | Exactly correct |
| Crossover η_c | 20 | 15 | **Minor deviation** — 15 vs 20. This was probably tuned empirically but differs from the paper's recommended value. |
| Mutation prob. | 1/n_vars | 1/`NumVars()` = 0.1 | Correct |
| Mutation η_m | 20 | 20 | Exact |
| Population size | — | 50 (30-50 gens) | Within typical NSGA-II range |
| Tournament size | 2 | 2 | Standard |

**Rating:** ⚠️ **Minor parameter deviation (η_c = 15 vs 20)**

### 3.3 PenOpt-Specific Extensions

**Frozen genotype masking:** ✅ Unique to PenOpt, not in Deb 2002. This is an architectural extension for incremental variable thawing. Well-implemented with a boolean mask.

**Warm-start initialization:** ✅ Top-10 coarse search seeds the population. This is a PenOpt innovation that accelerates convergence.

**6-DOF support:** ✅ Thaws x, y, z, ψ, trajectory_type, pitch. Genotype expanded from 2 to 10 variables. Crossover/mutation bounds are correctly clamped via `varBounds()`.

**Rating:** ✅ **Extensions are well-designed and correct**

### 3.4 Constraint Handling (Paper §III-D)

**Paper says:** Modified dominance definition for constrained problems.

**Implementation:** ⚠️ `CheckKinematicConstraints()` and `feasibilityPenalty()` exist at `nsgaii.go:628-644` but are **never called** in the main NSGA-II loop (`RunNSGAII()`). The code defines the constraint checking infrastructure but does not enforce it during optimization. The feasibility penalty exists but is dead code.

**Rating:** ⚠️ **Defined but not integrated into search**

---

## 4. Heinzl et al. 2011 — Penetration Length Computation

**Cited in:** `internal/raycaster/raycaster.go` header comment
**Research file:** `../research/heinzl2011_placement.md`

### 4.1 GPU Ray Casting → CPU BVH

**Paper says:** GPU-based ray casting.

**PenOpt:** CPU-based BVH-accelerated ray casting.

**Assessment:** This is a deliberate architectural choice, not a fidelity issue. The paper used GPU because consumer GPUs were the best available acceleration in 2011. PenOpt's BVH approach is equally valid and arguably better for an offline desktop tool.

### 4.2 Ray Casting Algorithm

**Paper says:** Cast rays from source through detector pixels, sum entry/exit segment pairs.

**Implementation:** ✅ `ComputeTransmissionLengths()` at `raycaster.go:160-284`

The algorithm:
1. Compute ray origin + direction per pixel (via `pixelToRay` or `pixelToRayHelical`)
2. Transform the ray to the local (tilted) coordinate frame
3. BVH traversal via `IntersectAll()` to collect all ray-triangle hits
4. Sort hits by distance
5. Pair entry/exit segments, filter noise < `MIN_SEGMENT` (0.01 mm)
6. Sum valid segments = penetration length

**Fidelity:** Matches Heinzl's approach exactly. The `MIN_SEGMENT = 0.01` threshold at `raycaster.go:83-91` is well-documented and justified relative to typical CT voxel size (~0.1 mm).

**Rating:** ✅ **Fully aligned**

### 4.3 Scanner Geometry Model

**Paper says:** Configurable SDD, SOD, detector size, pixel grid.

**Implementation:** ✅ `ScannerConfig` struct at `raycaster.go:21-35`

PenOpt adds helical trajectory support (`pixelToRayHelical()` at `raycaster.go:107-134`) which is not in Heinzl 2011.

**Rating:** ✅ **Aligned with useful extension**

---

## 5. Grozmani, Buratti, Schmitt 2019 — Measurement Uncertainty

**Cited in:** `internal/objectives/` (f_uncertainty, f_surface)
**Research file:** `../research/grozmani2019_uncertainty.md`

### 5.1 f_uncertainty

**Paper says:** Edge-on beam alignment produces sharpest edge gradients; face-on produces diffuse edges with higher localization uncertainty.

**Implementation:** ⚠️ `objectives.FUncertainty(faceBeamAngles)` at `objectives.go:156-173`

```go
func FUncertainty(faceBeamAngles []float64) float64 {
    // Returns 1 - (mean angle / 90) so that lower = better
    // Higher mean angle (edge-on) → lower uncertainty
}
```

**Fidelity:** The mathematical direction is correct (edge-on = better, f_uncertainty lower = better). However:

1. **The `faceBeamAngles` parameter is always empty.** These functions are never called with actual data in the grid search path. The standard search pipeline (`evaluateOrientationsRaw`, `evaluateIndividual`) only computes `f_mtl`, `f_energy`, and `f_hdn`. 
   
   **Exception: f_bh and f_scatter work in NSGAII+AdvancedPhysics mode.** When `advancedPhysics=true` AND the optimizer uses NSGA-II (not grid search), `evaluateIndividualAdvanced()` does compute:
   - `f_bh` via `FBeamHardening()` at `nsgaii.go:810`
   - `f_scatter` via `ComputeScatterMetric()` at `nsgaii.go:828`
   
   **Corrected classification of inert objectives:**
   - **Unconditionally inert (5):** `f_cb`, `f_completeness`, `f_uncertainty`, `f_surface`, `f_alignment`
   - **Conditionally functional (2):** `f_bh`, `f_scatter` — work in NSGA-II with Advanced Physics enabled
   - **Core (3):** `f_mtl`, `f_energy`, `f_hdn` — work always
   
   The remaining 5 objectives (`f_uncertainty`, `f_surface`, `f_alignment`, `f_cb`, `f_completeness`) are unconditionally inert because the 16×16 sparse grid never computes per-face beam angles or cone angles.

2. **The Grozmani paper is about multi-material workpiece placement.** PenOpt's `f_uncertainty` implements the geometric insight (edge-on vs face-on) but extracts it from the paper's broader framework.

**Rating:** ❌ **Conceptually correct but never executed — dead objective**

### 5.2 SOD Optimization

**Paper says:** Optimize SOD as well as orientation.

**Implementation:** ❌ PenOpt treats SOD as a fixed scanner parameter. The `ScannerConfig.SOD` is user-settable but never optimized. This is a deliberate scope reduction, but it's a deviation from the paper.

**Rating:** ⚠️ **Acknowledged departure**

---

## 6. Tucker/Boone 1991/1997 — Polychromatic X-ray Spectrum

**Cited in:** `internal/physics/spectrum.go`
**Research file:** `../research/tucker1991_boone1997_spectrum.md`

### 6.1 Bremsstrahlung Continuum

**Paper says (Tucker 1991):** Depth-dependent bremsstrahlung production with Kramers-like formula.

**Implementation:** ⚠️ `TuckerBooneSpectrum()` at `spectrum.go:12-73`

```go
spectrum[i] = E * math.Exp(-3.0*E/kV)
```

**Fidelity:** This is a **significant simplification**. The Tucker model uses:
- Target thickness / electron penetration depth
- Mass stopping power integration
- Self-filtration within the tungsten target
- Anode angle-dependent path length

PenOpt uses a simple `E·exp(-3E/kV)` shape that happens to peak at E = kV/3 (like a real spectrum). This captures the **qualitative shape** of a bremsstrahlung spectrum but is not quantitatively accurate to Tucker's model.

The characteristic lines (Kα1 at 59.3 keV, Kα2 at 57.9 keV, Kβ at 67.2 keV) are included with fixed relative intensities, which is appropriate for approximate use.

**Rating:** ⚠️ **Qualitatively correct (code says "approximate") — the code's self-labeling is fair**

### 6.2 Boone 1997 Improvements

**Paper says:** Polynomial parameterization validated against measurements (3% accuracy).

**Implementation:** ❌ PenOpt does **not** implement the Boone 1997 polynomial parameterization. The spectrum model is PenOpt's own simplified formula.

**Code attribution vs help attribution:** The code at `spectrum.go:9` says "approximate Tucker/Boone model" — which is a fair qualifier for the simplified shape. The **help content** says "polychromatic X-ray spectrum (Tucker-Boone model)" without qualification, which IS a name mismatch. The audit's original claim of "name mismatch" conflated these two: fine for code, misleading for help.

**Rating:** ✅ **Code attribution is fair ("approximate")**; ❌ **Help attribution is unqualified and misleading**

### 6.3 Energy Binning

**Paper says:** Continuous or high-resolution.

**Implementation:** ✅ 100 bins for full spectrum, 10 bins for `FastSpectrum`.

The binning strategy is appropriate for the use case (optimization scoring, not reconstruction).

**Rating:** ✅ **Adequate for purpose**

### 6.4 Filter Integration

**Paper (Boone 1997):** Includes inherent filtration (Be window, oil).

**Implementation:** ⚠️ `ApplyFilter()` at `spectrum.go:130-161` applies external filters (Cu, Zn) but **ignores inherent filtration** (beryllium window, oil cooling). The Tucker model accounts for inherent filtration; PenOpt's simplified model does not.

**Rating:** ⚠️ **Missing inherent filtration**

---

## 7. Alsaffar et al. 2022 — Scatter Estimation

**Cited in:** `internal/physics/scatter.go`
**Research file:** `../research/alsaffar2022_scatter.md`

### 7.1 SPR Model

**Paper says:** Monte Carlo photon transport on GPU (full scatter distribution per projection).

**Implementation:** ⚠️ `SparseGridSPR()` at `scatter.go:22-58`

```go
spr := k * math.Pow(meanThickness, 0.7) / math.Pow(energy, 0.3)
```

**Fidelity:** This is an **extremely simplified** analytical proxy:
- Alsaffar's MC model: 15× GPU acceleration, full 2D scatter distribution, seconds/projection
- PenOpt's proxy: single scalar SPR estimate, microseconds/evaluation

PenOpt's `k = 0.02·√ρ` is a heuristic not derived from any cited source. The power-law exponents (t⁰·⁷, E⁻⁰·³) are plausible but unvalidated.

**Rating:** ⚠️ **Inspired-by attribution is appropriate; this is not Alsaffar's model**

### 7.2 Clamping and Edge Cases

**Implementation:** ✅ SPR clamped to [0, 2], returns 0 for thin objects (< 10 mm).

These are reasonable heuristics for an optimization objective.

**Rating:** ✅ **Sensible engineering**

---

## 8. NIST XCOM — Material Database

**Cited in:** `internal/physics/mats_data.go`
**Research file:** `../research/nist_xcom.md`

### 8.1 Data Values

**Paper says:** Tabulated mass attenuation coefficients (μ/ρ, cm²/g) for 40+ materials.

**Implementation:** ✅ 40+ materials at `mats_data.go:4-130`

**Fidelity:** The data was ported from a JavaScript reference implementation (`CT.MATS`), which in turn sourced from NIST XCOM. The data **is not independently verified** against current NIST XCOM online values.

However, spot-checking reveals plausible values:
- Al at 100 keV: 0.170 cm²/g (NIST: ~0.17 cm²/g) ✅
- Fe at 100 keV: 0.232 cm²/g (NIST: ~0.23 cm²/g) ✅
- Pb at 100 keV: 5.55 cm²/g (with K-edge at 88 keV correctly modeled) ✅

**Rating:** ⚠️ **Plausible values, not independently verified**

### 8.2 Log-Log Interpolation

**Paper says:** Linear interpolation in log-log space (standard NIST method).

**Implementation:** ✅ `LogLogInterp()` at `material.go:60-79`

**Fidelity:** Exactly matches the NIST XCOM interpolation method. Correctly handles out-of-range energies (clamps to endpoints).

**Rating:** ✅ **Fully aligned**

### 8.3 Filter Materials

**Implementation:** ✅ Cu and Zn with 0.5–1.0 mm thickness presets. Correctly compute transmission through multi-layer filters via `FilterTrans()`.

**Rating:** ✅ **Correct**

---

## 9. Cross-Cutting Issues

### 9.1 Objectives Never Actually Computed

This is the most severe systemic issue. The `objectives.go` file defines **10 objective functions**, but the search pipeline computes only **3 unconditionally**, plus **2 conditionally**:

| Objective | Defines scoring fn | Actually computed in search | Connected to raycaster data |
|-----------|-------------------|---------------------------|----------------------------|
| `f_mtl` | ✅ `FMtl()` | ✅ Yes | ✅ From ray lengths |
| `f_energy` | ✅ `FEnergy()` | ✅ Yes | ✅ From ray lengths |
| `f_hdn` | ✅ `FHdn()` | ✅ Yes | ✅ From max per projection |
| `f_cb` | ✅ `FConeBeam()` | ❌ No | ❌ Needs cone angle per face |
| `f_completeness` | ✅ definition only | ❌ No | ❌ Could use TuyCompletenessFraction |
| `f_uncertainty` | ✅ `FUncertainty()` | ❌ No | ❌ Needs face-beam angle per face |
| `f_surface` | ✅ `FSurface()` | ❌ No | ❌ Same as f_uncertainty |
| `f_alignment` | ✅ `FAlignment()` | ❌ No | ❌ Needs perturbed positions |
| `f_bh` | ✅ `FBeamHardening()` | ⚠️ NSGAII+AdvancedPhysics only | Spectrum + per-ray lengths available |
| `f_scatter` | ✅ `ComputeScatterMetric()` | ⚠️ NSGAII+AdvancedPhysics only | Per-projection SPR available |

The frontend defines weight presets (e.g., "Metrology" uses `f_uncertainty` + `f_surface` + `f_mtl`) that reference objectives whose values are always zero. The UI will show "optimal" orientations based on **at most 3 non-zero objectives** regardless of the selected preset.

**Impact:** Users selecting "Metrology" or "Multi-material" presets get results based on input weights to zero-valued objectives, which means the non-zero `f_mtl`/`f_energy`/`f_hdn` dominate by default. The app **appears to function** but doesn't actually optimize against the selected objectives. Note: the frontend's `showResults()` function (`main.js:905`) self-hides objective table rows where both the best and worst values are zero — so users won't see columns full of 0.000, but the weight presets still route to inert objectives during search.

**Rating:** ❌ **Critical — 5 unconditionally inert + 2 conditional (f_bh, f_scatter work in NSGAII+AdvancedPhysics only)**

### 9.2 Sparse Grid vs Full Resolution

The raycaster uses a 16×16 sparse grid for coarse search (increased from 8×8 for coarser) and 16×16 for fine search. The `ScannerConfig` allows up to 2048×2048, but the actual code never uses more than 16×16.

**Impact:** Although documented as a design choice (sparse grid for speed), this is not documented for the benefit of users who might expect higher accuracy. The validation tests confirm that the sparse grid correctly identifies the thin vs thick orientation of a gauge block, so it's adequate for ranking.

**Rating:** ⚠️ **Design choice, adequately justified**

### 9.3 Validation Tests: What They Prove

The `validation_test.go` file contains 4 tests:

| Test | What it proves | What it doesn't prove |
|------|---------------|----------------------|
| `TestValidationGaugeBlockPenetration` | Thin orientation < thick orientation | Absolute penetration accuracy |
| `TestValidationGaugeBlockIntelliScan` | Returns ≥2 angles | Angles actually improve reconstruction |
| `TestValidationFlatPlateOrientation` | Normal < edge-on penetration | Any specific accuracy threshold |
| `TestValidationSphereIsotropy` | Sphere has ratio < 2.0 | Isometry within 10% or better |
| `TestValidationSearchFindsMinimum` | Search beats random orientation | Search finds global optimum |

These tests validate that the pipeline is **directionally correct** but do **not** validate **quantitative accuracy** against any reference.

**Rating:** ⚠️ **Directional correctness only, no quantitative validation**

### 9.4 Jig Beam Occlusion Check

The `CheckBeamIntersection()` function at `jig.go:166-218` uses an approximate geometric proxy (checks if any jig triangle centroid is within 50mm of the ray path). This is:
- Not derived from any cited paper
- Heuristic: 50mm threshold is arbitrary
- May produce false negatives for large jigs

**Rating:** ⚠️ **Heuristic, not paper-derived**

---

## 10. Summary Metrics

### By Paper

| Paper | Fidelity | Completeness | Simplifications | Notes |
|-------|----------|-------------|-----------------|-------|
| Ito 2020 | ✅ High | ⚠️ 2/3 objectives | f_fdk missing | Largest gap in paper alignment |
| Lifton 2023 | ✅ High | ⚠️ No validation | None critical | Exceeds original 2D scope |
| Butzhammer 2026 | ✅ High | ⚠️ Methods A+B done | No validation | Claims unverified |
| Deb 2002 | ✅ High | ⚠️ Constraint handling unused | η_c = 15 vs 20 | Core NSGA-II correct |
| Heinzl 2011 | ✅ High | ✅ Full | GPU → CPU BVH (deliberate) | Foundational raycaster correct |
| Grozmani 2019 | ⚠️ Concept only | ❌ Never executed | Always returns 0 | Dead objective |
| Tucker/Boone | ⚠️ Qualitative | ⚠️ Simplified | Not validated against real spectra | Name mismatch with Boone |
| Alsaffar 2022 | ❌ Not their model | ⚠️ Proxy formula | Analytical ≠ MC | Attribution is aspirational |
| NIST XCOM | ⚠️ Unverified | ✅ Complete | — | Values plausible but unchecked |

### By Severity

**Critical issues (block correctness or user experience):**
1. **5 of 10 objectives are unconditionally inert** — `f_uncertainty`, `f_surface`, `f_cb`, `f_completeness`, `f_alignment` always return 0. Additionally `f_bh` and `f_scatter` only work in NSGAII+AdvancedPhysics mode, meaning they are inert in the default grid search path
2. **Ito's f_fdk (Tuy-Smith) is never computed** — the third and most distinctive Ito objective is a no-op
3. **Weight presets mislead users** — "Metrology" and "Multi-material" presets activate objectives that never produce values
4. **"Weighted" combination method silently switches optimizer** — selecting "Weighted" in the UI routes to the classic grid search (`search.Run()`) instead of NSGA-II, giving users a completely different search algorithm than expected. The grid search does not benefit from Pareto optimization, crowding distance, or evolutionary exploration

**Moderate issues (affect accuracy or trustworthiness):**
4. **Spectrum model is not Tucker/Boone** — it's a PenOpt-native simplified model
5. **Scatter model is not Alsaffar** — it's a heuristic proxy formula
6. **NIST XCOM data unverified** — plausible but unchecked against current NIST values
7. **NSGA-II constraint handling is dead code** — `CheckKinematicConstraints()` and `feasibilityPenalty()` exist at `nsgaii.go:628-644` but are never called from the main NSGA-II loop

**Minor issues (documentation or completeness):**
8. **Butzhammer improvement claim not validated** — the research file mentions "substantially outperformed conventional high-projection scans" but gives no specific percentage; tests verify angles exist, not quality
9. **Jig geometry is simplified** — box pocket, not conforming support
10. **Crossover index η_c = 15 vs paper's 20** — minor parameter deviation

---

## 11. Frontend UI Coverage of Paper Concepts

This section assesses which concepts from the cited papers are **visible and interactive** in the UI vs. which are buried in Go code or absent.

### 12.1 What the UI Exposes Well (✅)

| Concept | Paper | UI Element | Notes |
|---------|-------|-----------|-------|
| Coarse→fine grid search | Ito 2020 §2.4 | Run button + progress bar | Shows θ/φ being evaluated in real time via `search:progress` events |
| IntelliScan tangent-ray angles | Lifton 2023, Butzhammer 2026 | IntelliScan card with Method B toggle, coverage slider, angle table | ✅ Interactive — user can switch Method A↔B and adjust coverage fraction, results redrawn immediately |
| Penetration rose (max/projection) | Heinzl 2011 | Rose plot tab | Shows best (solid) and worst (dashed) traces, plus IntelliScan angle ticks |
| Radon space visualization | Heinzl 2011 | Radon plot tab | One vertical line per face at (α, p), critical faces in red |
| Pareto front | Deb 2002 | Pareto plot tab | Interactive scatter with click-to-select, hover tooltips, non-dominated frontier line |
| Critical/Tuy-incomplete faces | Ito 2020 §2.2 (f_fdk) | Critical view mode (key 4) + legend | Red = critical (no tangent ray), green = normal. Warning banner if >10% critical |
| Heatmap per-face penetration | Heinzl 2011 | Heatmap view mode (key 2) + color legend | Green→yellow→red gradient, loads automatically after optimization |
| Beam geometry visualization | Heinzl 2011 | BEAM toggle button | Source housing, cone edges, detector panel, turntable, central ray (purely illustrative) |
| Compare mode (optimal vs default) | Ito 2020 | Compare view mode (key 3) | Ghost overlay of default orientation vs optimal |
| Weight presets (5 profiles) | Deb 2002 (multi-objective) | Tradeoff card in results | Quality→Balanced→Energy presets, Minimax/Weighted toggle |
| Energy recommendation | Ito 2020 (f_energy) | Energy result card | Shows kV recommendation based on max penetration |
| Scanner presets (13 models) | Heinzl 2011 (configurable geometry) | Scanner preset dropdown | Nikon, GE, Zeiss, Siemens, Philips, dental CBCT |
| Material database (40+ entries) | NIST XCOM | Material picker with search + category tabs | Color-coded by density category |
| Filter presets + stats | Tucker/Boone (beam hardening) | Filter grid + Eeff/Shift/Flux/HVL stats | Computed via physics model |
| Jig generation | Ito 2020 §3 | Jig button + dialog | STL download with optional clearance/plate size + beam occlusion warning |
| Export (JSON + PNG) | — | Export buttons | Includes summary, Pareto front subset, validation metrics |
| Help documentation | All papers | ? button | 10 objective descriptions with paper citations, workflow steps |

### 12.2 What the UI Claims But Doesn't Actually Compute (⚠️)

| UI Element | Claims to Show | Actual Runtime Value | Paper Gap |
|-----------|---------------|-------------------|-----------|
| **Metrology preset** (f_uncertainty 0.4, f_surface 0.3, f_mtl 0.3) | Optimizes for measurement uncertainty | f_uncertainty=0, f_surface=0 — only f_mtl matters | Grozmani 2019 objectives are inert |
| **NDT/Porosity preset** (f_mtl 0.4, f_energy 0.4, f_scatter 0.2) | Optimizes for scatter artifacts | f_scatter=0 unless Advanced Physics enabled; even then, analytical proxy | Alsaffar 2022 attribution misleading |
| **Multi-material preset** (f_mm 0.5, f_uncertainty 0.25, f_cb 0.25) | Optimizes multi-material artifacts | f_mm=0 (no material boundary data), f_uncertainty=0, f_cb=0 | All three objectives inert |
| **Cone-beam artifact (f_cb)** column in results table | Shows f_cb value | Always 0.000 | FConeBeam() exists but never called |
| **Tuy completeness (f_completeness)** column | Shows completeness fraction | Always 0.000 | TuyCompletenessFraction() exists but disconnected |
| **Beam hardening (f_bh)** column | Shows BH deviation | Always 0.000 | FBeamHardening() exists but never called with real data |
| **Measurement uncertainty (f_uncertainty)** column | Shows uncertainty ratio | Always 0.000 | FUncertainty() exists but faceBeamAngles never populated |
| **Misalignment robustness (f_alignment)** column | Shows robustness | Always 0.000 | FAlignment() exists but perturbed positions never computed |
| **Surface determination (f_surface)** column | Shows quality ratio | Always 0.000 | FSurface() exists but face-beam angles never populated |
| **Multi-material artifact (f_mm)** column | Shows transition count | Always 0.000 | FMaterialTransitions() exists but material transitions never collected |
| **Energy recommendation** text | "Lower kV sufficient" | Based on max penetration only | Doesn't include spectrum or material effects (simplified) |
| **Ray grid selector** (16²/32²/64²) | Controls ray grid resolution | Grid resolution is **hardcoded** to 8×8 coarse / 16×16 fine in the Go `search.Run()` call. The UI buttons toggle the visual state only | Misleading — user can select but it has no effect |

### 12.3 Paper Concepts Missing from the UI (❌)

| Concept | Paper | Why It Matters |
|---------|-------|---------------|
| **Per-objective weight visualization** | Deb 2002 (multi-objective) | Users can't see or adjust individual objective weights for the current preset. The weight map is sent to Go but never visualized or editable except via preset selection |
| **NSGA-II generation/evolution progress** | Deb 2002 §III | NSGA-II runs 30-50 generations of 50-100 individuals, but the UI only shows a single progress bar ("Evaluating orientations..."). Users can't see convergence or Pareto front evolution |
| **Full 6-DOF + trajectory UI state** | PenOpt spec (Step 4) | The 6-DOF checkbox and trajectory selector exist but `f_alignment` (misalignment robustness) is inert. Users enabling 6-DOF mode expect corresponding objective evaluation |
| **Multi-material assignment UI** | Ito 2020 (general) | The backend supports per-face material IDs from OBJ `usemtl` + `SetMaterialMap`, but the frontend has no UI for assigning materials to faces. `f_mm` depends on this |
| **SOD optimization** | Grozmani 2019 | The paper recommends optimizing SOD alongside orientation. PenOpt treats SOD as a fixed user parameter with no optimization |
| **Validation metrics display** | PenOpt spec | `ComputeValidationMetrics()` runs and returns angular_diversity + spread_* values, but they're only used in the JSON/PNG export footer, not shown in the main results |
| **Analytical phantom validation** | Multiple papers | No tools to compare against known geometries (cylinders, spheres with known penetration) to validate correctness |
| **Jig geometry preview** | Ito 2020 §3 | Jig is generated server-side and downloaded as STL — no 3D preview in the viewport |
| **Per-projection scatter distribution** | Alsaffar 2022 | The scatter plot shows a line graph of SPR vs projection angle, but this is just the analytical proxy, not the full MC distribution Alsaffar produces |

### 12.4 Help Documentation Accuracy

The help content (`help-content.html`) is well-written for industrial CT engineers and correctly cites papers. However, it documents all 10 objectives as if they are all computed and functional. The table lists each objective with units, goal direction, and description — but **5 of 10 always return 0 unconditionally**, and another 2 only work in NSGA-II with Advanced Physics enabled. **A user reading the help would reasonably expect all 10 objectives to produce meaningful values.**

Specific inaccuracies:

| Help Statement | Reality |
|---------------|---------|
| "Cone-beam artifact — Generalized mean of face cone-angles" | UI shows 0.000 because FConeBeam() is never called |
| "Tuy completeness — Fraction of faces whose surface normals intersect the source trajectory" | UI shows 0.000 because TuyCompletenessFraction() is disconnected |
| "Measurement uncertainty — Mean angle between each face normal and the nearest beam direction" | UI shows 0.000 because face-beam angles are never computed |
| "Surface determination quality — Fraction of faces whose normal-to-beam angle exceeds 10°" | UI shows 0.000 for same reason |
| "Beam hardening — RMS deviation between polychromatic and monoenergetic transmission" | Works in NSGA-II+AdvancedPhysics mode via `evaluateIndividualAdvanced()`. Not computed in grid search (default path). Help text should clarify this limitation |
| "Scatter-to-primary ratio — Estimated SPR from a kernel-based scatter model" | Works in NSGA-II+AdvancedPhysics mode, but it's an analytical proxy not a kernel-based model. Not available in grid search path |

### 12.5 UI Fidelity Summary

| Layer | Fidelity Score | Key Issues |
|-------|---------------|-----------|
| **Core workflow UI** (mesh→material→scanner→energy→run) | ✅ 8/10 | Smooth, clear, responsive |
| **Results display** (orientation, objective table, energy) | ⚠️ 5/10 | 5/10 columns unconditionally zero + 2 conditional, misleading weight presets |
| **Plots** (contour, rose, radon, pareto, scatter) | ✅ 7/10 | Well-designed but data quality limited by inert objectives |
| **IntelliScan interactive card** | ✅ 9/10 | Best UI feature — Method A/B toggle, coverage slider, live redraw |
| **3D viewport modes** (3D, heatmap, compare, critical, pareto) | ✅ 7/10 | Good coverage of paper concepts, but "pareto" 3D mode duplicates the plot tab |
| **Help documentation** | ⚠️ 6/10 | Well-written but documents inert objectives as functional |
| **Advanced Physics / 6-DOF toggles** | ❌ 3/10 | Visual toggles exist but wired objectives are inert; ray grid selector is purely cosmetic |
| **Export** (JSON, PNG, Jig STL) | ✅ 7/10 | Serviceable but no 3D jig preview, no animated GIF of search process |

**Overall UI coverage: 6/10** — The UI faithfully exposes the core Ito 2020 workflow (mesh→objectives→search→results) and the IntelliScan feature is excellent. But the gap between what the UI claims and what the backend computes is dangerously wide: weight presets, objective columns, and help text all describe features that silently produce zeros.

### 12.6 Recommendations for the UI

**Immediate:**
1. **Hide or warn about inert objectives** — The results table should show a warning banner like "The following objectives are not yet computed: f_cb, f_completeness, f_uncertainty, f_surface, f_alignment" or simply hide their columns
2. **Fix weight presets** — "Metrology" and "Multi-material" presets should either be removed or remapped to only use f_mtl/f_energy/f_hdn until the other objectives are wired
3. **Remove the ray grid selector** or wire it to actually change the Go config — currently a lie

**Short-term:**
4. **Add per-objective weight sliders** in the Tradeoff card so users can see/adjust which objectives are active
5. **Show NSGA-II generation progress** — a mini sparkline or generation counter would help users understand convergence
6. **Display computed validation metrics** (angular_diversity, spread_*) somewhere in the results

**Medium-term:**
7. **Wire up Tuy completeness as an objective** — `TuyCompletenessFraction()` already exists, it just needs to be called from `evaluateIndividual()`
8. **Wire up f_cb (cone-beam)** from ray data — add a simple cone-angle computation to each ray
9. **Add multi-material face assignment UI** — a simple list of material IDs with face ranges
10. **Add jig geometry preview** in the 3D viewport before downloading STL

---

## 12. Recommendations

### Immediate (correctness)
1. **Compute all 7 inert objectives** — or remove their UI presets. The frontend should not offer "Metrology" optimization if `f_uncertainty` always returns 0.
2. **Implement f_fdk from Ito 2020** — `TuyCompletenessFraction()` already exists in `radon.go`, it just needs to be connected to the scoring pipeline.
3. **Audit frontend weight presets** — ensure they only reference objectives that actually produce non-zero values, or warn the user when inert objectives are selected.

### Short-term (trustworthiness)
4. **Fix help content spectral model** — change from unqualified "Tucker-Boone model" to "simplified polychromatic spectrum model" consistent with the code's own "approximate Tucker/Boone model" label.
5. **Fix help content scatter model** — change from "kernel-based model" to "analytical SPR proxy." The code attribution is actually already reasonable.
6. **Cross-validate NIST XCOM data** — spot-check against current NIST XCOM online tool.

### Medium-term (completeness)
7. **Wire up constraint handling** in NSGA-II — `CheckKinematicConstraints` and `feasibilityPenalty` are ready but disconnected.
8. **Add quantitative validation tests** — compare against analytical phantoms (known penetration lengths for cylinders, spheres).
9. **Add inherent filtration** to the spectrum model.

### Long-term (fidelity)
10. **Implement proper Tucker/Boone or Boone/Seibert spectrum** — the polynomial parameterization from Boone 1997 is straightforward and validated to 3%.

---

## 13. Help Content Audit

**File:** `frontend/help-content.html` (inline HTML, ~200 lines)
**Loaded via:** `import helpContent from '../help-content.html?raw'` in main.js

The help modal is well-written, audience-appropriate (industrial CT engineers), and correctly avoids the em-dash overreach noted in earlier sessions. However, several factual inaccuracies and omissions undermine its trustworthiness.

### 13.1 Factual Inaccuracies (❌)

| Section | Help Text | Reality | Severity |
|---------|-----------|---------|----------|
| **Overview** | "All objectives are computed from the 16&times;16 sparse ray grid" | Only f_mtl, f_energy, f_hdn use the grid; the other 7 objectives require per-face data not provided by the grid | **High** — misrepresents the core computation model |
| **Workflow step 2** | "Optional beam filters (Cu, Al, Cu+Al, etc.)" | Filters are Cu, Zn, Cu+Zn only. **No Al filter exists** in the codebase. The `Filters()` data in `mats_data.go` defines: `none`, `cu05`, `cu10`, `zn05`, `zn10`, `cu05zn05`, `cu10zn05`, `cu10zn10` | **Medium** — Al is not a filter option, Cu+Al doesn't exist |
| **Workflow step 5** | "Adjust ray grid resolution (16&#x00B2;, 32&#x00B2;, or 64&#x00B2; rays)" | The ray grid selector is **cosmetic only**. Go `search.Run()` hardcodes 8&times;8 coarse / 16&times;16 fine. Changing the UI button has zero effect | **High** — a setting that does nothing |
| **Objective: f_scatter** | "Estimated SPR from a **kernel-based** scatter model" | The implementation at `physics/scatter.go` is an **analytical power-law proxy**: `SPR = 0.02·√ρ · t⁰·⁷ / E⁰·³`. There is no kernel, no Monte Carlo, no convolution — the word "kernel" is technically wrong | **Medium** — misrepresents the algorithm |
| **Advanced Physics** | "polychromatic X-ray spectrum (Tucker-Boone model)" | The spectrum is a PenOpt-native simplified model (`E·exp(-3E/kV)` plus characteristic line Gaussians). It is not the Tucker depth-dependent model or the Boone polynomial parameterization | **Medium** — incorrect attribution |
| **Advanced Physics** | "Scatter-to-primary ratio — Estimated SPR from a **kernel-based model**" | Same kernel error as above | **Medium** |
| **Jig Generation** | "The jig has a base plate and a **support column shaped to match the underside of the part**" | The actual implementation at `jig.go` is an **axis-aligned bounding box** expanded by clearance around the oriented mesh. It is not shaped to match the part's underside. The description matches Ito 2020 §3 but not the code | **Medium** — describes paper intent, not actual behavior |
| **References section** | Lists 6 references but omits several cited in code | See §13.2 below | **Medium** |

### 13.2 Missing References (⚠️)

The help references section lists 6 papers but omits 4 that are cited in the codebase:

| Missing Paper | Where Cited | Importance |
|--------------|-------------|-----------|
| **Deb et al. 2002 — NSGA-II** | `search/nsgaii.go` header | **Critical** — NSGA-II is the default search method; omitting this reference means users can't learn how the optimizer works |
| **Tucker 1991 / Boone 1997 — Spectrum** | `physics/spectrum.go` header | **Important** — the Advanced Physics section claims a Tucker-Boone model but doesn't provide the citation |
| **Alsaffar et al. 2022 — Scatter** | `physics/scatter.go` header | **Important** — the scatter model is attributed to this paper |
| **Grozmani et al. 2019 — Uncertainty** | Cited inline in objective table | Grozmani is mentioned inline ("Grozmani et al. 2019") but has no entry in the References list at the bottom | **Low** — at least it appears somewhere |

Additionally, the help mentions **Butzhammer 2026** in the References section but never uses it in the main text. The IntelliScan section only cites Lifton 2023, even though the Method B greedy selection and coverage tracking come from Butzhammer 2026. The search methods section mentions IntelliScan but doesn't reference Butzhammer at all.

### 13.3 Missing Content (what the help should cover but doesn't)

| Topic | Why It Matters | Suggested Addition |
|-------|---------------|-------------------|
| **Ray grid vs detector resolution** | The help says "Pixel count does not affect optimization speed" in the parameter table but never explains why (sparse 16&times;16 grid independent of pixel count) | Add a paragraph explaining the sparse-grid approach: "The raycaster uses a configurable sparse grid (default 16&#x00D7;16 rays) independent of the detector pixel count. This keeps evaluation fast enough for iterative search. Full-resolution simulation is not required for orientation ranking." |
| **Variable freezing (frozen genotype)** | The NSGA-II section says "Supports variable freezing" but never explains what this means for the user | Add: "Frozen variables — such as translation (x,y,z) or kV — are skipped during crossover and mutation. This lets you restrict the optimizer to a subset of parameters while keeping others fixed. Unfreezing more variables increases the search space and may require more generations." |
| **Stale results indicator** | The UI has a stale-results system (amber dot + stale banner) but the help never mentions it | Add: "When you change any parameter after results are computed, the app marks results as stale (amber indicator). Re-run optimization to refresh." |
| **6-DOF mode limitations** | 6-DOF is a checkbox with no limitations documented | Add: "6-DOF mode thaws translation (x,y,z), in-plane rotation (&psi;), and trajectory type. It pairs best with NSGA-II (high-dimensional search). Note that kV and projection count remain fixed in 6-DOF mode; use Advanced Physics mode to optimize those." |
| **Multi-material face assignment** | f_mm objective exists but no UI for assigning materials to faces | Add: "The f_mm objective requires multi-material assignment via OBJ usemtl directives or the JSON material map. No interactive face-assignment UI is currently available." |
| **How the energy recommendation works** | Users see a kV recommendation but may not understand the model | Add: "The energy recommendation sweeps 50&ndash;500 kV to find the minimum tube voltage where transmission through the thickest ray exceeds Tmin. This uses the selected material's NIST XCOM attenuation coefficients and assumes a monoenergetic beam at 40% of the peak voltage." |
| **NSGA-II warm-start** | The NSGA-II is seeded from coarse-grid results | Add: "NSGA-II warm-starts from the top-10 coarse-grid orientations, then generates 40 random individuals for diversity. Over 30&ndash;50 generations, crossover and mutation explore the orientation space, and non-dominated sorting preserves Pareto-optimal solutions." |
| **Validation metrics** | `ComputeValidationMetrics()` computes angular diversity and objective spread but they're only in JSON/PNG export | Add: "Results include validation metrics: angular diversity (mean pairwise angular distance across evaluated orientations) and objective spread (range/mean ratio). These quantify exploration quality and are written to JSON export." |
| **Coarse vs fine grid resolution difference** | The coarse search uses 8&times;8 rays &times; 36 projections; fine uses 16&times;16 rays &times; 90 projections | Add: "The coarse phase uses a sparser ray grid (8&#x00D7;8 rays, 36 projections) for speed. The top 3 candidates are refined at higher resolution (16&#x00D7;16 rays, 90 projections) with &plusmn;5&#x00B0; stepout. This two-phase approach balances speed and accuracy." |
| **Beam occlusion in jig generation** | The jig checks occlusion but the mechanism is heuristic | Add: "The occlusion check projects rays from the source through each jig triangle centroid. If a centroid is within 50 mm of any ray path, that projection angle is flagged. This is a geometric approximation; full BVH-based occlusion is more accurate but unnecessary for this check." Is this too technical? Probably yes for user-facing help.

### 13.4 Omissions in the References Section

The current reference list has 6 entries:
1. Ito 2020 ✅
2. Lifton & Poon 2023 ✅
3. Heinzl 2011 ✅
4. Grozmani 2019 ✅ (cited inline, not in list — see above)
5. Butzhammer 2026 ✅
6. NIST XCOM ✅

**Missing from the list:**
- Deb et al. 2002 — NSGA-II (default optimizer)
- Tucker/Boone 1991/1997 — Spectrum model
- Alsaffar et al. 2022 — Scatter model

**Help text cites Grozmani 2019 inline** in the f_uncertainty row but it's not in the References section at the bottom. Either add it to the list or remove the inline citation for consistency.

### 13.5 Help Content Accuracy Summary

| Category | Score | Key Issues |
|----------|-------|-----------|
| Workflow instructions | ✅ 8/10 | Clear, logical sequence; filter materials incorrect (Al vs Zn) |
| Objective descriptions | ⚠️ 6/10 | Well-written but 5/10 describe unconditionally non-functional features (3 core + 2 conditional work) |
| Search method descriptions | ✅ 7/10 | Accurate but NSGA-II missing its Deb 2002 citation |
| Parameter reference | ⚠️ 6/10 | Filter row lists wrong materials; no mention of ray grid vs pixel resolution distinction |
| Advanced Physics | ⚠️ 5/10 | Falsely claims Tucker-Boone and kernel-based scatter; doesn't explain limitations |
| Jig generation | ❌ 4/10 | Describes paper's conforming support, not the actual box pocket implementation |
| Keyboard shortcuts | ✅ 9/10 | Complete and accurate |
| References | ⚠️ 5/10 | Missing 3 of 9 cited papers; Grozmani not in the list; Butzhammer not mentioned in main text |
| Missing explanatory content | ⚠️ 5/10 | No explanation of sparse grid, frozen genotype, stale results, energy model, coarse/fine resolution difference |

**Overall help accuracy: 6/10** — The tone and audience calibration are excellent, but factual errors (Al filters, kernel-based scatter, conforming jig) and the gap between claimed and actual objective computation significantly reduce trustworthiness.

### 13.6 Recommendations for Help Content

**Immediate fixes (factual errors):**
1. Change "Cu, Al, Cu+Al, etc." to "Cu, Zn, Cu+Zn (from the filter presets)"
2. Remove or qualify "All objectives are computed from the 16&times;16 sparse ray grid" — only 3 of 10 are
3. Change "kernel-based scatter model" to "analytical scatter-to-primary ratio model"
4. Change "Tucker-Boone model" to "simplified polychromatic spectrum model"
5. Change jig description from "support column shaped to match the underside" to "support pocket (axis-aligned bounding box)"
6. Add Deb 2002, Tucker/Boone 1991/1997, and Alsaffar 2022 to the References section
7. Add Grozmani 2019 to the References list (currently inline-only)

**Short-term additions (missing content):**
8. Add a paragraph explaining the sparse grid approach and why pixel count doesn't affect speed
9. Add a stale-results explanation
10. Add a note that ray grid selector changes UI only (or wire it and update help)
11. Explain the energy recommendation model (monoenergetic at 40% of peak kV)
12. Add NSGA-II warm-start and variable freezing explanations

**When the objectives are eventually wired:**
13. Update objective descriptions to reflect actual computation once f_cb, f_completeness, f_uncertainty, f_surface, f_alignment, f_bh, f_scatter, f_mm are actually connected to the scoring pipeline
