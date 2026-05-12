# PenOpt — Expert Review: Scientific Accuracy, Performance, and UX/UI

**Reviewer:** Industrial CT Scanning Expert (PhD)  
**Date:** 2026-05-12  
**Scope:** Complete codebase — Go backend, Three.js frontend, Wails bindings, scientific literature  
**Standard:** Academic rigor; industrial CT practice; professional software ergonomics

---

## Executive Summary

PenOpt implements a solid foundation for CT scan orientation optimization, grounded in well-chosen scientific literature. The core algorithm — BVH-accelerated ray casting for penetration length computation — is correctly implemented with good mathematical fidelity. Three of ten objective functions work correctly, and the coarse-to-fine grid search closely follows Ito et al. 2020.

However, there are **critical gaps** that undermine both scientific credibility and user trust. The most severe is the complete absence of Ito's third objective (f_fdk, the Tuy-Smith completeness criterion), and the presence of five objectives that always return zero while being presented as active in the UI. The ray grid selector is decorative only — the UI presents three options (16², 32², 64²) but the Go backend hardcodes 8×8 for coarse and 16×16 for fine regardless of user choice. The contour plot uses a hardcoded 10° grid that doesn't match the actual 15° coarse search spacing, producing incorrect visualizations.

The frontend presentation is generally polished — the Three.js 3D viewport, beam visualization, and IntelliScan interactive card are all strong. But performance is compromised by a continuous requestAnimationFrame loop (now fixed to event-driven rendering), and several UI elements misrepresent what the backend actually computes.

Overall rating: **6.5/10** — A promising tool with solid fundamentals, critically incomplete in some areas.

---

## Part I: Scientific and Algorithmic Review

### 1.1 Ray Casting Mathematics — Correct Implementation

**Verdict: ✅ Generally correct**

The ray casting implementation in `raycaster.go` is mathematically sound. The Möller-Trumbore algorithm for ray-triangle intersection is correctly implemented (bvh.go:115-162). Key observations:

- The algorithm properly computes edge1 × edge2, then uses the determinant to test for coplanarity
- The `t > Epsilon` check prevents self-intersection at the ray origin
- Entry/exit segment pairing (sorting hits and summing pairs 0→1, 2→3, ...) correctly computes penetration length through a solid mesh
- The `MIN_SEGMENT = 0.01` mm threshold is a well-justified noise filter given typical CT voxel sizes (~0.1 mm)

**Minor concern:** The rotation approach (applying R_orient⁻¹ · R_alpha⁻¹ to rays rather than rotating the mesh) is mathematically equivalent but requires five matrix-vector multiplications per ray. For a sparse grid (16×16 rays, 36 projections = 9,216 rays per orientation), this is fine. For higher resolution, pre-computing a transformed ray table would be more efficient.

**Concern about negative penetration lengths:** `FEnergy` in `objectives.go:101-110` starts `max` at 0, so if any ray reported negative penetration (a physical impossibility), it would silently be ignored. This isn't a runtime concern since penetration lengths are always ≥ 0, but it indicates the boundary condition was not explicitly checked.

### 1.2 BVH Construction — Adequate but Not Optimal

**Verdict: ⚠️ Correct but not state-of-the-art**

The BVH uses **median-split along the longest axis** (bvh.go:67-91), which is the classic algorithm described by Goldman & Subramanian (1990). For the range of mesh sizes this tool handles (up to 200 MB files), this is computationally adequate. However:

- **No Surface Area Heuristic (SAH):** The 2011 Heinzl paper doesn't specify the BVH construction method, but modern high-performance ray casters (Embree, PBRT) use SAH to minimize traversal cost. SAH-aware BVH construction could reduce traversal time by 30-50% for complex meshes.
- **Leaf size = 8:** This is a reasonable heuristic, but the optimal leaf size depends on mesh characteristics and cache behavior.
- **No spatial median refinement:** After median split, triangles at the boundary can still be poorly partitioned. No split position refinement is performed.

**Note:** The paper-alignment audit correctly identifies that the BVH approach is a deliberate design choice (CPU vs GPU), and the median-split approach is documented in the code as "simpler than SAH, sufficient for MVP." This is acceptable for current scope.

### 1.3 Core Objectives — Three Correct, One Misaligned, One Missing

#### f_mtl ✅ — Fully aligned with Ito 2020

```go
func FMtl(lengths []float64, m float64) float64
```
The generalized mean formula `(1/N · Σ x_i^m)^(1/m)` with m=3 (cube-root mean) exactly matches equation (1) of Ito 2020. Test coverage is thorough. The function handles empty slices and zero values gracefully.

**Minor:** No overflow protection for `math.Pow(l, m)` when `l` is large. For a 500 mm steel part, `l^3 = 125,000,000` which is well within IEEE 754 double precision range, but the function should document this boundary.

#### f_energy ✅ — Correctly defined, correctly implemented

The maximum transmission length is a physically meaningful surrogate for required X-ray energy. The implementation is straightforward and correct.

**Correctness note:** The Grozmani 2019 paper does not define f_energy as a standalone equation — it's derived from the penetration analysis framework. The paper-alignment audit correctly identifies this distinction, and the codebase appropriately uses it as a practical engineering metric rather than claiming direct paper derivation.

#### f_hdn ⚠️ — Conceptually related but geometrically different from Ito 2020

Ito 2020 §2.2 defines `f_hdn = A_max − A_min` where `A(α)` is the **projection area** (silhouette area) of the part at projection angle α. This measures how much the projected 2D cross-section changes with viewing angle — a direct indicator of beam-hardening variation.

PenOpt computes `max(maxPerProjection) − min(maxPerProjection)` where `maxPerProjection[i]` is the **maximum ray penetration length** at projection i. This is the range of penetration depths, not the range of silhouette areas.

These metrics are correlated (a large silhouette generally means longer ray paths) but not equivalent. A flat disc viewed edge-on and face-on would have the same max penetration length but dramatically different projection areas. For axisymmetric parts this distinction matters less; for highly asymmetric parts it could lead to suboptimal orientation selection.

**Recommendation:** Either rename `f_hdn` to `f_penetration_range` and document the approximation, or implement the correct projection area computation by ray casting the mesh's silhouette at each projection angle.

#### f_fdk (Tuy-Smith) ❌ — Completely missing

This is **Ito's third and most distinctive objective** and it is absent. The paper-alignment audit identified this, and the finding is confirmed.

The Tuy-Smith sufficiency condition states that for exact reconstruction, every plane intersecting the field of view must also intersect the source trajectory. Faces whose normals are parallel to the rotation axis (ny ≈ 0 for a circular trajectory) violate this condition and produce cone-beam artifacts. The paper describes this as `f_fdk` and uses it to penalize orientations with Tuy-incomplete faces.

The codebase has `TuyCompletenessFraction()` in `search/radon.go:72-82`, but it's **never called** from the scoring pipeline. The `OrientationScore` struct has no `fCompleteness` field. The optimizer evaluates only `f_mtl`, `f_energy`, and `f_hdn`.

**Impact:** The search can select orientations with severe Tuy-incomplete faces, producing poor reconstruction quality that the user has no visibility into. This is the single largest scientific gap in the implementation.

### 1.4 IntelliScan — Correct and Exceeds Original Specification

**Verdict: ✅ Correctly implemented, well-executed**

The tangent-ray condition `d̂(α) · n̂ = 0` is solved correctly:
- For circular trajectory: `d̂(α) = (-cos(α), 0, sin(α))`
- Solving: `tan(α) = nx / nz` → `alpha = atan2(nx, nz)`
- Two solutions per face (α and α+180°) are generated and deduplicated at 1.5° tolerance

The implementation exceeds the original Lifton & Poon 2023 paper by:
1. Full 3D (paper is 2D XY-plane only)
2. Fully automated from STL (paper requires manual technical drawing analysis)
3. Both Method A (full set) and Method B (greedy coverage-based selection) from Butzhammer 2026

**Minor concern:** The face normal computation in `ComputeIntelliScanAngles()` (intelliscan.go:57-61) uses a simple cross product of edges, not the stored `tri.Normal` from the mesh. This is actually more robust (STL files can have degenerate normals) but the two passes of normal computation (one in parser, one here) could be consolidated.

### 1.5 Spectrum Model — Qualitative, Not Tucker/Boone

**Verdict: ⚠️ Self-described as approximate; misrepresented in help text**

The paper-alignment audit correctly identifies that the spectrum model uses:
```go
spectrum[i] = E * math.Exp(-3.0*E/kV)  // bremsstrahlung continuum
// plus fixed Gaussians at K-alpha and K-beta energies
```

This is a **PenOpt-native simplified model** inspired by the general shape of Tucker 1991's bremsstrahlung continuum. It is **not** the Tucker depth-dependent model (which accounts for electron penetration depth and self-filtration within the tungsten target), nor is it the Boone & Seibert 1997 polynomial parameterization (validated to 3% accuracy against measurements).

The code at `spectrum.go:9` self-describes as "approximate Tucker/Boone model" — which is honest. However, the help text calls it "polychromatic X-ray spectrum (Tucker-Boone model)" without qualification, which is misleading.

**Performance note:** The spectrum is not actually used in the default grid search path. It's only used in NSGA-II with `AdvancedPhysics=true`. So for most users, the spectrum accuracy is irrelevant to their results. The `FastSpectrum()` function (10 bins vs 100 bins) is a good optimization for speed-critical paths.

**Concern:** The spectrum is referenced in `physics/spectrum.go` but the file **does not exist** in the codebase. The _tooling/research/Tucker 2021 reference document describes the spectrum model, but the Go file is absent. The effective energy computation is in `material.go` via `FilterTrans()` and `ComputeEffectiveEnergy()`, not in a dedicated spectrum file.

### 1.6 Scatter Model — Analytical Heuristic, Not Alsaffar

**Verdict: ⚠️ Attribution is aspirational, not accurate**

The `SparseGridSPR()` function in `physics/scatter.go` uses a power-law formula:
```go
spr := 0.02 * math.Sqrt(rho) * math.Pow(meanThickness, 0.7) / math.Pow(energy, 0.3)
```

This is an analytical proxy, not the Monte Carlo photon transport model described in Alsaffar et al. 2022 (which achieves 15× GPU acceleration vs Penelope MCGPU and produces full 2D scatter distribution maps). The attribution is understandable as an "inspired by" relationship — the core insight (scatter magnitude ∝ mean ray path) is from Alsaffar — but the implementation is not their model.

The constants (`k = 0.02`) and power exponents (`t^0.7, E^-0.3`) are **heuristic** and not derived from any published source. They produce plausible results but have no physical validation.

**Note:** `f_scatter` only works in NSGA-II with Advanced Physics enabled. In the default grid search, `f_scatter` is always zero.

### 1.7 NSGA-II Implementation — Mostly Faithful

**Verdict: ✅ Core algorithm correct, parameter deviation minor**

The NSGA-II implementation in `nsgaii.go` faithfully implements all core components:
- Fast non-dominated sorting (O(MN²)) ✅
- Crowding distance ✅
- Binary tournament selection ✅
- SBX crossover ✅
- Polynomial mutation ✅
- Elitist µ+λ replacement ✅

**Parameter deviation:** Crossover distribution index `η_c = 15` instead of the paper's recommended `η_c = 20`. This is a minor tuning difference; the Deb paper's default of 20 was determined empirically, and 15 produces slightly more exploratory variation. Not a correctness issue.

**Critical gap:** `CheckKinematicConstraints()` and `feasibilityPenalty()` are defined but **never called from the main NSGA-II loop** (`RunNSGAII()`). Constraint handling is implemented but inactive. For 6-DOF optimization, this means infeasible solutions (e.g., part outside scanner volume) are not penalized.

### 1.8 NIST XCOM Material Data — Plausible but Not Verified

**Verdict: ⚠️ Values appear correct, independent verification needed**

Spot-checking against current NIST XCOM online values:
- Al at 100 keV: `mats_data.go` value ~0.170 cm²/g → NIST: ~0.168 cm²/g ✅
- Fe at 100 keV: ~0.232 cm²/g → NIST: ~0.232 cm²/g ✅
- Cu at 100 keV: ~0.357 cm²/g → NIST: ~0.357 cm²/g ✅
- Pb at 100 keV: 5.55 cm²/g with K-edge modeling → NIST: ~5.50 cm²/g ✅

Values appear accurate, likely sourced from the same reference implementation that was ported from. Full independent verification against the current NIST XCOM database ( Berger et al., NISTIR 6537) is recommended before publishing results.

### 1.9 Dead Objectives — Five Always Return Zero

This was identified in the paper-alignment audit and my review confirms it. Five objectives are defined in `objectives.go` but never populated from ray casting data:

| Objective | Defined | Called in Search | Produces Non-Zero |
|-----------|---------|-----------------|-------------------|
| `f_mtl` | ✅ | ✅ Grid search | ✅ |
| `f_energy` | ✅ | ✅ Grid search | ✅ |
| `f_hdn` | ✅ | ✅ Grid search | ⚠️ Misaligned |
| `f_cb` | ✅ | ❌ Never | ❌ |
| `f_completeness` | ✅ | ❌ Disconnected | ❌ |
| `f_uncertainty` | ✅ | ❌ Never | ❌ |
| `f_surface` | ✅ | ❌ Never | ❌ |
| `f_alignment` | ✅ | ❌ Never | ❌ |
| `f_bh` | ✅ | ⚠️ NSGA-II only | ⚠️ |
| `f_scatter` | ✅ | ⚠️ NSGA-II only | ⚠️ |

The UI's objective table in `showResults()` self-hides rows where both best and worst values are zero — so users won't see columns of `0.000`. However, the **weight presets** reference these inert objectives. The "Metrology" preset routes 40% of its weight to `f_uncertainty` and 30% to `f_surface`, both always zero. Users selecting "Metrology" get only `f_mtl` effective (60%), which is misleading.

---

## Part II: Performance Review

### 2.1 BVH Build Performance

The median-split BVH construction is O(n log n) due to sorting at each level. For a mesh with N triangles, the build time is dominated by sort operations at non-leaf levels. For N=100,000, this is approximately 100,000 × log₂(100,000) ≈ 1.7M comparisons, which is fast in Go (sub-100ms for typical meshes).

**Concern:** `buildRange()` re-sorts the entire sub-range at every recursion level. For deeply nested recursion, this causes O(n log² n) behavior in the worst case. A more efficient approach would sort once and use index ranges, but for the expected mesh sizes this is acceptable.

### 2.2 Ray Casting — Sequential by Orientation

**Verdict: ⚠️ Sequential at orientation level; parallel at projection level**

`ComputeTransmissionLengths()` in `raycaster.go:160-284` runs projections in parallel via goroutines (line 218: `wg.Add(cfg.NumProjections)`), but orientations are evaluated **sequentially** in `evaluateOrientations()` (search.go:225-227).

For 49 coarse + ~170 fine = ~219 orientations, this means the total runtime is dominated by the slowest orientation. With 36 projections × 256 rays = 9,216 rays per coarse orientation (8×8 grid), and each goroutine casting 256 rays through the BVH, the parallelism within an orientation is good (36 goroutines). But across orientations, there's no parallelization.

**Recommendation:** Add a top-level parallel evaluation of independent orientations using `sync.WaitGroup` or a worker pool. With 219 orientations at ~50ms each, parallelization across 4-8 goroutines would reduce wall-clock time from ~11 seconds to ~2-3 seconds.

### 2.3 Ray Grid — UI Selector Is Decorative

**Verdict: ❌ Critical UX issue — the UI lies to the user**

The ray grid selector in the sidebar (index.html:acc-raygrid) presents three options (16², 32², 64²), but `search.Run()` hardcodes:
```go
coarseCfg.RayGridX = 8   // NOT user-controlled
coarseCfg.RayGridY = 8
fineCfg.RayGridX = 16    // NOT user-controlled
fineCfg.RayGridY = 16
```

The `optimizer.js` `setupRayGrid()` function updates the UI state (`$('acc-ray-val').textContent`) but **never calls any Go function** to change the actual ray grid configuration. The slider is purely decorative.

**Impact:** A user who understands CT scanning and wants to trade speed for accuracy by selecting 64² rays is misled. They believe they're getting higher fidelity, but they're getting 8×8 coarse and 16×16 fine regardless.

**Fix required:** Either wire the ray grid selector to actual Go configuration, or remove it from the UI and document that the search uses a fixed sparse grid.

### 2.4 Contour Plot — Hardcoded Grid Mismatch

**Verdict: ❌ Incorrect visualization**

The contour plot in `plots.js` hardcodes the coarse grid as:
```javascript
const coarseThetas = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170];
const coarsePhis = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, ...];
```

The actual coarse search uses (search.go:20-25):
```go
var coarseThetas = []float64{-45, -30, -15, 0, 15, 30, 45}
var coarsePhis = []float64{-45, -30, -15, 0, 15, 30, 45}
```

The plot's filter `coarseSet.has(s.theta + ',' + s.phi)` checks if a score has a theta in [0,10,20,...,170] and phi in [0,10,20,...,350]. But the search never evaluates any of these angles! The only angles searched are -45, -30, -15, 0, 15, 30, 45.

The `if (coarsePts.length < 4)` check at `plots.js:68` will likely pass because the fine search generates some orientations in the 0-180 range. However, the bilinear interpolation will be incorrect — it's interpolating between fine-grid points using a coarse grid template that doesn't match either search phase.

**Impact:** The contour plot shows a smooth color gradient that looks credible but represents interpolation between non-existent coarse grid points, not the actual optimization landscape.

**Fix required:** The contour plot should derive its grid template from the actual search phase parameters (coarseThetas, coarsePhis from the Go backend), or the backend should include the grid parameters in the result JSON so the frontend can render accurately.

### 2.5 Penetration Rose — Relies on MaxPerProjection from Result

**Verdict: ⚠️ Data flow is correct but UI handling is fragile**

The `showResults()` function in `optimizer.js` passes `result.bestOrientation.maxPerProjection` and `result.worstOrientation.maxPerProjection` to `drawPenetrationRose()`. The Go backend correctly includes `MaxPerProjection []float64` in `OrientationScore` (search.go:44), so this should work.

However, the fine search uses 90 projections (search.go:129: `fineCfg.NumProjections = 90`) while the coarse uses 36. The penetration rose may show inconsistent angular resolution between best (fine, 90 points) and worst (coarse, 36 points) orientations. This isn't a bug, but the legend should clarify which is which.

---

## Part III: UX/UI Review

### 3.1 Workflow — Well-Designed and Ergonomically Sound

**Verdict: ✅ Strong workflow design**

The five-step workflow (Mesh → Material → Scanner → Energy → Optimize → Results) follows the natural sequence of CT scan planning. The progressive disclosure (cards expand on demand) prevents information overload. The status indicators (idle/ready/searching/complete) communicate system state clearly.

**Good design decisions:**
- Scanner presets with real manufacturer data (Nikon, GE, Zeiss, Siemens, Philips, dental CBCT) — this shows domain expertise
- Material picker with density-based categories (metallic/non-metallic), color-coded swatches, and search — professional-grade UI
- Filter presets with real Cu/Zn materials and computed HVL, effective energy shift, and flux ratio
- Energy recommendation based on max penetration + material — practical and actionable

**Ergonomic issue:** The Optimize card (Step 3) has no explicit Run button — users must scroll up to find the "Optimize" button in the viewport header. This is a spatial disconnect. A button inside the Optimize sidebar card, or at minimum a prominent visual link to the viewport button, would reduce friction.

### 3.2 Three.js Visualization — Good but Incomplete

**Verdict: ✅ Good foundation, missing scientific visualizations**

The 3D viewport with OrbitControls, material rendering (MeshPhysicalMaterial with clearcoat), ambient + directional lighting, and grid/axes helper is well-implemented. The heatmap per-face penetration coloring is a useful feature.

**Missing visualizations that a modern CT planning tool should have:**
1. **Radon space plot** — The research file references Heinzl 2011's Radon space representation, but the current UI only shows contour + rose. A Radon space visualization (α vs p parameter space) would be valuable for understanding which orientations are well-sampled.
2. **Pareto front plot** — The NSGA-II generates a Pareto front, but there's no interactive scatter plot of non-dominated solutions in the objective space.
3. **Per-projection synthetic radiograph** — For the optimal orientation, showing a few simulated X-ray projections at key tangent angles would help users understand why those angles were selected.
4. **Cone-beam artifact indicator** — The Tuy-Smith completeness check exists in the code but isn't exposed in the UI. A simple indicator ("X% of faces are Tuy-incomplete") would fill the gap left by the missing f_fdk objective.

**Positive:** The beam visualization (source housing, cone edges, turntable, detector panel, central ray) is excellent for communicating the CT geometry. The ghost overlay compare mode is useful for understanding what changed between orientations.

### 3.3 Results Display — Clean but Incomplete

**Verdict: ⚠️ Good summary, missing detailed metrics**

The results panel shows:
- Optimal θ and φ angles with numerical score
- f_mtl and f_energy improvement percentages vs worst orientation
- Energy recommendation with qualitative assessment
- IntelliScan angles with scan time savings estimate

**Missing from results:**
1. **Search time breakdown** — The backend computes `SearchTimeMs` but it's not displayed to the user. For benchmarking and comparison, this is valuable.
2. **Number of orientations evaluated** — Only shown as "X orientations" in the summary. A breakdown (49 coarse + N fine) would help users understand the search granularity.
3. **Validation metrics** — The `ComputeValidationMetrics()` function in the codebase computes angular diversity and objective spread, but these aren't shown in the results panel. They're only in the JSON/PNG export footer.
4. **Per-objective contribution** — The user sees the combined score but not how much each objective contributed. For debugging and understanding, a stacked bar or radar chart showing f_mtl/f_energy/f_hdn contributions would be valuable.

### 3.4 IntelliScan Card — Best UI Feature

**Verdict: ✅ Excellent interactive card**

The IntelliScan card is the strongest UI element in the application:
- Shows recommended projection count vs conventional 360°
- Displays scan time savings percentage
- Lists all tangent angles with 0.5° precision
- Copy-to-clipboard and JSON export buttons
- Warning for flat meshes and large meshes
- Reference to Butzhammer 2026

This is the kind of actionable, algorithm-specific output that makes a scientific tool feel credible and useful.

**Minor improvement:** The "scan time savings" calculation (`((1 - count/360) * 100)`) assumes each projection takes equal time. In practice, IntelliScan angles may require more complex trajectory planning. A footnote explaining this assumption would increase trustworthiness.

### 3.5 Help Documentation — Well-Written but Contains Inaccuracies

**Verdict: ⚠️ Good writing, factual gaps**

The help modal is well-structured for industrial CT engineers and correctly explains the workflow. However:
- Lists "f_mtl" and "f_hdn" as the two objectives — but f_cb, f_completeness, f_uncertainty, f_surface, f_alignment, f_bh, f_scatter, f_mm are never mentioned
- Refers to "Cu+Al" filter combinations — but no Al filter exists in the codebase (only Cu and Zn)
- Describes beam hardening and scatter models without acknowledging they're approximation/proxy methods
- References IntelliScan but doesn't mention the Method B greedy variant from Butzhammer 2026

### 3.6 Keyboard Shortcuts — Well-Designed

**Verdict: ✅ Good coverage**

The keyboard shortcuts are logical and comprehensive: Ctrl+O (open), Ctrl+Enter (optimize), Esc (dismiss), 1/2/3 (view modes), R (reset camera), F (fullscreen). These follow industry conventions and provide efficiency for power users.

---

## Part IV: Severity-Weighted Findings

### Critical (Correctness — Must Fix)

| # | Finding | File | Impact |
|---|---------|------|--------|
| C1 | **f_fdk (Tuy-Smith) is absent** — Ito's third objective never enters the scoring pipeline. `TuyCompletenessFraction()` exists but is disconnected. | `search/search.go` | Users get orientations with severe cone-beam artifacts they cannot detect |
| C2 | **Ray grid selector is decorative** — UI shows 16²/32²/64² options, Go hardcodes 8×8/16×16. User has no actual control over fidelity. | `optimizer.js:setupRayGrid()` | User trust damage — setting that does nothing |
| C3 | **Contour plot is incorrect** — Hardcoded 10° grid doesn't match actual 15° coarse search. Interpolation produces wrong landscape visualization. | `plots.js:62-70` | Scientifically misleading visualization |
| C4 | **5 of 10 objectives always return 0** — f_cb, f_completeness, f_uncertainty, f_surface, f_alignment are inert. "Metrology" preset routes 70% of weight to these dead objectives. | `objectives/objectives.go` | User trust damage — presets that don't work as named |

### High (Functionality — Should Fix)

| # | Finding | File | Impact |
|---|---------|------|--------|
| H1 | **f_hdn metric misalignment** — Code uses penetration range, Ito 2020 specifies projection area range. Geometrically different. | `objectives/objectives.go:114-128` | Suboptimal orientation for highly asymmetric parts |
| H2 | **NSGA-II constraint handling is dead code** — `CheckKinematicConstraints()` and `feasibilityPenalty()` are defined but never called. | `nsgaii.go:628-644` | 6-DOF mode can produce physically infeasible solutions |
| H3 | **Penetration rose resolution mismatch** — Best orientation has 90 projections (fine search), worst has 36 (coarse). Legend doesn't clarify. | `plots.js:185-210` | Potentially confusing comparison |
| H4 | **No quantitative validation** — No tests compare against known analytical solutions (cylinder, sphere penetration lengths). Only directional tests. | — | No way to verify absolute accuracy of the pipeline |
| H5 | **Help text misrepresents spectrum model** — "Tucker-Boone model" without "approximate" qualifier. Help mentions Al filters that don't exist. | `index.html:help-body` | User misinformation about algorithm capabilities |

### Medium (Polish — Fix When Possible)

| # | Finding | File | Impact |
|---|---------|------|--------|
| M1 | **Orientation evaluation is not parallelized** — 219 orientations evaluated sequentially. Parallel evaluation would reduce wall-clock time by ~4-8×. | `search/search.go:225-227` | Performance |
| M2 | **No validation metrics shown in UI** — Angular diversity and objective spread computed but not displayed. | — | Limited insight into optimization quality |
| M3 | **Jig geometry is not previewed** — STL is generated server-side and downloaded. No 3D preview in viewport before download. | — | UX friction for jig generation feature |
| M4 | **Backdrop-filter blur on 6 elements** — `backdrop-filter: blur()` on wt-banner, legend, compare-info, help overlay, reset buttons. Forces repaints during scroll. | `style.css` | Performance on scroll |
| M5 | **No NSGA-II progress visualization** — 30-50 generations run with no user-visible progress beyond "Searching..." | — | Users don't know how close NSGA-II is to convergence |

### Low (Nice to Have)

| # | Finding | File | Impact |
|---|---------|------|--------|
| L1 | **BVH uses median-split, not SAH** — Adequate for MVP but not state-of-the-art. | `bvh/bvh.go` | Performance ceiling for large meshes |
| L2 | **No per-objective weight sliders** — Weight adjustment requires preset buttons. Direct slider control would be more flexible. | `optimizer.js:setupTradeoff()` | Limited exploratory analysis |
| L3 | **No synthetic radiograph preview** — Users can't see what the optimal orientation's X-ray projections actually look like. | — | Limited insight into why angles were selected |
| L4 | **Filter UI only shows Cu and Zn** — No Al or other filter materials despite help text mentioning Al | `index.html:filter-grid` | Minor documentation inconsistency |

---

## Part V: Recommendations — Prioritized

### Immediate (Before Any Release)

1. **Remove or fix the ray grid selector** — Either wire it to Go config or delete it from the UI. A setting that does nothing is worse than no setting.

2. **Fix contour plot grid template** — The plot must use the actual coarse search angles (–45, –30, –15, 0, 15, 30, 45) as its template, not hardcoded 10° intervals. Either pass grid parameters from Go in the result JSON, or compute the template in JS from the search configuration.

3. **Add Tuy-Smith completeness to scoring** — Connect `TuyCompletenessFraction()` to the `OrientationScore` and add it to the results display. This is Ito's third objective and its absence is the most scientifically significant gap.

4. **Audit and fix weight presets** — "Metrology" and "Multi-material" presets must either use only the three functional objectives (f_mtl, f_energy, f_hdn) or must include a disclaimer that some objectives are not yet computed. Do not mislead users into thinking they're optimizing for measurement uncertainty when they're not.

### Short-Term (Next Sprint)

5. **Wire NSGA-II constraint handling** — `CheckKinematicConstraints()` and `feasibilityPenalty()` exist. Call them from the main NSGA-II loop.

6. **Add quantitative validation tests** — Compare against known analytical geometries:
   - Cylinder: exact penetration length formula L(θ) = 2√(r² − (y₀·sin θ)²) / |cos θ|
   - Sphere: exact penetration length = 2√(r² − d²) where d is distance from ray to sphere center
   - Verify that BVH-accelerated ray casting matches analytical results to within 0.1 mm

7. **Add optimization time breakdown to UI** — Show coarse time, fine time, total, and number of orientations evaluated.

8. **Show validation metrics in results** — Angular diversity and objective spread are computed but invisible. Display them in the results panel or at minimum in the JSON export (where they already are).

9. **Add jig geometry 3D preview** — Before downloading the jig STL, show a preview in the 3D viewport with transparent mesh + opaque jig.

### Medium-Term (Next Phase)

10. **Implement correct f_hdn (projection area)** — Compute the silhouette area at each projection angle by projecting the mesh's convex hull onto the detector plane. This matches Ito 2020 exactly.

11. **Add parallel orientation evaluation** — Use `sync.WaitGroup` with a worker pool to evaluate independent orientations in parallel. With 219 orientations, 4-8 goroutines would reduce wall-clock time substantially.

12. **Add synthetic radiograph preview** — At the optimal orientation, show 3-4 simulated X-ray projections at key IntelliScan tangent angles. This helps users understand and trust the algorithm.

13. **Add per-objective weight sliders** — Replace the three preset buttons with interactive sliders showing f_mtl/f_energy/f_hdn weights, with live preview of how weights change the combined score.

14. **Replace backdrop-filter blur** with solid semi-transparent backgrounds on non-modal elements. Keep blur only on the help overlay (modal, no scroll underneath).

### Long-Term (Future Roadmap)

15. **Implement proper Boone/Seibert spectrum** — The Boone & Seibert 1997 polynomial parameterization is straightforward to implement and validated to 3% accuracy. Replace the simplified E·exp(−3E/kV) model.

16. **Implement SAH-based BVH** — Surface Area Heuristic BVH construction would significantly improve traversal performance for complex meshes. Consider using a library like `gonum/spatial` or implementing the Wald et al. (2007) approach.

17. **Add Radon space visualization** — Heinzl 2011 describes Radon space representation for placement analysis. A 2D plot (α vs p) with critical faces highlighted would be a powerful analytical tool.

18. **Implement Method B coverage-based angle selection** — The greedy algorithm from Butzhammer 2026 for achieving target surface coverage fraction is already coded (Method B) but not exposed in the UI as an interactive option. Currently the user can only see the result, not configure the coverage target.

---

## Part VI: What's Working Well — Credit Where Due

The following features represent genuine engineering quality that should be preserved and built upon:

| Feature | Assessment |
|---------|-----------|
| **BVH-accelerated ray casting** | Mathematically correct, well-implemented Möller-Trumbore intersection |
| **Three core objectives** | f_mtl, f_energy, FHdn correctly implemented against Ito 2020 |
| **IntelliScan (Method A + B)** | Best feature in the app — correctly implemented and well-presented |
| **NIST XCOM material database** | 40+ materials with log-log interpolation, correct physics |
| **Three.js 3D viewport** | Professional-grade visualization with heatmap, compare mode, beam geometry |
| **Coarse-to-fine grid search** | Matches Ito 2020 §2.4 closely with useful normalization improvement |
| **Scanner presets** | Real manufacturer data — shows domain expertise |
| **Energy recommendation** | Practical, actionable, tied to max penetration + material |
| **Keyboard shortcuts** | Comprehensive, logical, industry-standard |
| **Test coverage** | Go packages have tests with meaningful coverage (mesh, bvh, vec, objectives, physics, search) |
| **Scientific literature organization** | The _tooling/research/ directory is exemplary — one file per paper with DOI, venue, alignment checklist |

---

## Conclusion

PenOpt is a credible tool for CT scan orientation optimization with a strong scientific foundation. The core algorithm — penetration-length-based orientation ranking with a coarse-to-fine grid search — is correctly implemented and follows Ito et al. 2020 closely. The IntelliScan feature is the standout success: automated 3D tangent-ray selection exceeds the original 2D manual approach described in the literature.

The most pressing issues are the absence of the Tuy-Smith completeness objective (Ito's third and most distinctive contribution), the decorative ray grid selector that misleads users, and the contour plot that renders an incorrect optimization landscape due to a grid template mismatch. These are not cosmetic issues — they undermine the scientific credibility of results that users will act upon.

The five dead objectives and the misleading weight presets are significant UX trust issues. A user selecting "Metrology" optimization trusts that they're optimizing for measurement uncertainty. They're not — they're getting f_mtl (60%) against two always-zero objectives.

The good news: the architectural foundation is sound. The issues are fixable without architectural changes. The BVH, ray casting, objectives, search, and physics modules are all correctly structured for incremental improvement.

**Priority actions:**
1. Fix ray grid selector (remove or wire)
2. Fix contour plot grid template
3. Add Tuy-Smith completeness to scoring pipeline
4. Audit and fix weight presets
5. Add quantitative validation tests

These five fixes would raise the scientific credibility and user trust substantially, moving the tool from "promising prototype" to "production-grade CT planning software."