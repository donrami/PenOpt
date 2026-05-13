# Paper-Code Gap Analysis: PenOpt vs. Cited Research

**Date**: 2026-05-12  
**Scope**: Full comparison of the PenOpt codebase against the 9 cited scientific papers/standards in `_tooling/research/`  
**Methodology**: Read every Go source file, JS frontend module, research reference document, and test file. Cross-referenced each paper's method claims against implementation.

---

## Summary of Findings

| Severity | Count | Description |
|----------|-------|-------------|
| **GAP** | 9 | Implementation deviates from paper methods in documented and undocumented ways |
| **PLACEHOLDER** | 2 | Objective functions that exist as stubs but return 0 / pass-through |
| **WARNING** | 5 | Physics model is significantly simplified vs. cited methods |
| **FRONTEND** | 5 | UI implications of science gaps — presets misrepresent what's optimized, thresholds inconsistent |
| **COVERAGE** | 4 | Missing tests / validation against known reference values |

## GAP: Implementation Deviations from Papers

### G1. Ito 2020 §2.4 — Coarse grid uses 15°, paper specifies 10°

**Paper**: "discretize (θ, φ) at 10° intervals" (per code comment line 2 and research note §2.4)  
**Code**: `generateSearchGrid()` uses `step := 15.0` (search.go line 24)  
**Comment mismatch**: The package docstring says "10° intervals" but the function docstring correctly says "15° steps"

| (θ, φ) range | Paper: 10° grid | Code: 15° grid |
|---|---|---|
| ±45° | 10×10=100 orientations | 7×7=49 orientations |
| ±75° | 16×16=256 orientations | 11×11=121 orientations |

The code evaluates roughly half the coarse orientations the paper specifies. This is a trade-off for speed, but:
1. Reduces the chance of finding the true global optimum on the coarse grid
2. Makes the refinement phase more dependent on picking the right top-3 candidates
3. Should at minimum be documented as a deliberate deviation

### G2. Ito 2020 eq 2 — f_hdn uses max-path-length range, not silhouette area

**Paper** (Ito 2020 eq 2): f_hdn = A_max − A_min, where A is the **projection silhouette area**. This measures how much the projected cross-section varies with rotation — high variation means some projections have very little ray coverage.

**Code** (objectives.go lines 53-66): f_hdn = max(maxPerProjection) − min(maxPerProjection), where `maxPerProjection` is the **max path length** per projection angle.

```go
// This approximates the projection range concept from Ito 2020 eq 2
// (which uses silhouette area), but uses max X-ray path length as a
// fast geometric proxy.
```

**Impact**: Path-length range and silhouette-area range are correlated but not equivalent:
- A long thin part rotated to be edge-on to the beam produces both high max path and small silhouette → the proxy holds
- A complex part with internal cavities could have near-identical max path lengths across projections while silhouette area varies significantly → the proxy breaks

This is a deliberate approximation (documented in code comment) but the impact on optimization quality is unvalidated.

### G3. Ito 2020 §2.2 — f_fdk (Tuy-Smith condition) not implemented as objective

**Paper**: Three objectives: f_mtl, f_hdn, f_fdk (Tuy-Smith completeness condition for cone-beam reconstruction)  
**Code**: Tuy-Smith exists as a **tracking metric** (`ComputeTuyCompleteness()` in `tuy.go`) and a warning is shown when below 90%, but it is **not an optimized objective**. The `FTuy()` function in objectives.go is a pass-through:

```go
func FTuy(values []float64) []float64 {
    // We return the values as-is...
    // We'll document that the caller should use (1 - tuy) if they want to minimize.
    return values
}
```

And the calling code in search.go never applies `1 - tuy` inversion, so fTuy even if it had non-zero weight would optimize in the wrong direction.

**Impact**: Tuy-Smith is a critical condition for cone-beam CT — without it as a true objective, the optimal orientation may have poor cone-beam reconstruction quality that the user isn't warned about beyond a generic <90% flag.

### G4a. Ito 2020 — Coarse→fine normalization is global, paper is batch-local

**Paper**: Normalization is per-batch (coarse scores normalized independently, top candidates identified from coarse-normalized scores, then fine scores refined).  
**Code**: Coarse-only normalization used for top-3 selection (`globalScoreAndNormalize` applied to coarse results only), then **all** coarse + fine results are globally normalized together for the final ranking. The docstring says this avoids "batch-local bias."

**Impact**: This is arguably an *improvement* over the paper — global normalization is more correct.

### G4b. Coarse/fine ray grid resolution mismatch

**Code**: Coarse evaluations use 8×8 ray grid with 36 projections. Fine evaluations use 16×16 ray grid (2×) with 90 projections (2.5×).

**Problem**: Top-3 candidates are selected using coarse-resolution scores, but the final ranking combines coarse and fine scores under global normalization. An orientation that scores well at 8×8/36 projections may score poorly at 16×16/90 projections, and vice versa. The coarse-only top-3 selection may systematically miss orientations that perform better at higher resolution.

**Impact**: Combined with the global normalization across resolutions, a coarse-evaluated orientation and a fine-evaluated orientation at similar true quality can have artificially different normalized scores, distorting the ranking.

### G5. Heinzl 2011 — CPU-based ray casting, not GPU

**Paper**: Uses GPU-based ray casting for penetration length computation.  
**Code**: CPU-based parallel goroutines with BVH acceleration.

**Impact**: The paper's approach is faster for production use; PenOpt's approach is simpler and more portable. This is documented in the research note as "intentional design choice." The goroutine-per-projection model works well but limits scalability to ~CPU-core-count parallelism.

### G6. Butzhammer 2026 — Only Method A implemented

**Paper**: Proposes two variants — Method A (basic angle selection for complete surface coverage) and Method B (extended greedy variant for geometrically complex objects with surface-fraction awareness).  
**Code**: Single-pass approach collecting all tangent angles with deduplication — maps to Method A only.

**Research note** (butzhammer2026_angles.md): Claims "Two algorithmic variants (Method A + Method B)" and "Surface-fraction coverage selection (Method B greedy selection)" as implemented, with checkboxes marked ✅.

**Impact**: Another phantom checkbox. Method B is not implemented.

### G7. FTuy inverted — optimizes for worse Tuy-Smith completeness

**File**: `objectives.go` lines 67-76

```go
func FTuy(values []float64) []float64 {
    return values  // no inversion, no transformation
}
```

**Problem**: The scoring system minimizes scores, but fTuy is "higher is better." The docstring says the caller should use `(1 - tuy)` to invert, but no caller does. Since all 5 weights now transmit from the frontend (B3 fixed), every weight preset allocates non-zero wTuy:
- Quality: wTuy = 0.05
- Balanced: wTuy = 0.10
- Energy: wTuy = 0.05

**5-10% of the optimization signal actively prefers orientations with worse Tuy-Smith completeness.** This is not a harmless placeholder — it produces systematically wrong ranking.

**Concrete fix**:
```go
func FTuy(values []float64) []float64 {
    result := make([]float64, len(values))
    for i, v := range values {
        result[i] = 1.0 - v
    }
    return result
}
```

### G8. Fine search angle-wrapping can evaluate irrelevant orientations

**File**: `internal/search/search.go` lines 236-239

When the fine search generates candidates within ±5° of a top-3 coarse candidate, the code wraps angles:
```go
if t < 0 { t += 180 }
if t >= 180 { t -= 180 }
if p < 0 { p += 360 }
if p >= 360 { p -= 360 }
```

The theta wrapping (mod 180) is correct for symmetry. But phi wrapping (mod 360) means candidates **at the edge of the search range** (±75° max) may wrap to orientations 180° away from the original candidate — far outside the ±5° refinement neighborhood. This wastes evaluations on orientations that may be irrelevant to the refinement.

**Impact**: Small efficiency loss. Correct handling would clamp to the search range rather than wrapping.

### G9. No handling for small parts where the ray grid undersamples the mesh

**Files**: `internal/raycaster/raycaster.go`, `internal/search/search.go`, `internal/objectives/objectives.go`

**Problem**: The ray grid is a fixed number of rays (default 8×8 coarse, 16×16 fine) evenly spaced across the full detector area. A small part whose projected area is smaller than the inter-ray spacing will be **missed entirely or severely undersampled** by most or all rays.

**Concrete scenario**: A 5mm part on a 400×400mm detector with a 16×16 ray grid:
- Each ray covers a 25×25mm cell of detector space
- The part's projection covers ~5×5mm — less than 5% of a single cell
- At most 1-2 rays out of 256 intersect the part
- The remaining 254 rays report 0mm penetration

**Failure modes**:

1. **fMtl dilution** (objectives.go lines 19-27): The cube-root mean divides by total ray count (including zeros). For 2 hits at 10mm out of 256 rays:
   ```
   sum = 2 × 1000 = 2000
   mean = 2000/256 ≈ 7.8
   cbrt ≈ 1.98 mm
   ```
   The reported penetration (~2mm) is 5× smaller than the true max penetration (10mm). The orientation appears artificially good.

2. **False zero fHdn**: If no projection happens to intersect the part, `maxPerProjection` is all zeros, fHdn = 0, and that orientation scores perfectly for this objective.

3. **Random optimum when all orientations score near-zero**: If no orientation has meaningful ray intersections, all fMtl values are near-zero → normalization produces all zeros → every orientation gets the same score → the first one is returned as "best." The result is effectively random.

4. **Granularity starvation step function**: At fine grids, the difference between "one ray grazes the part" and "zero rays hit" becomes a step function, producing a non-smooth objective landscape that the coarse→fine search cannot navigate reliably.

**No guard exists**: There is no check anywhere in the pipeline for:
- Fraction of rays that intersected the mesh
- Whether the part's projected area exceeds the inter-ray spacing
- A minimum hit-count threshold below which results are flagged as unreliable

The ray sampling slider goes down to 4×4 (16 rays total), making the problem worse at low settings.

**Scales affected**:
| Detector size | Part size | Ray grid | Inter-ray distance | Rays hitting part | Reliability |
|---|---|---|---|---|---|
| 400mm | 200mm | 8×8 | 50mm | ~16 | ✅ Good |
| 400mm | 50mm | 8×8 | 50mm | ~1-4 | ⚠️ Marginal |
| 400mm | 10mm | 8×8 | 50mm | 0-1 | ❌ Unreliable |
| 400mm | 10mm | 32×32 | 12.5mm | ~1-2 | ⚠️ Marginal |

**What the papers don't say**: Neither Ito 2020 nor Heinzl 2011 explicitly addresses the small-part regime. Both assume the part fills a reasonable fraction of the detector. This is a blind spot in the literature as applied.

**Possible mitigations** (not implemented):
1. Automatic ray grid density adjustment based on part bounding box vs. detector size
2. A "coverage fraction" metric reported alongside objectives (fraction of rays with non-zero penetration)
3. A warning when the average non-zero ray count per projection falls below a threshold (e.g., < 10%)
4. Per-face heatmap-based adaptive sampling that concentrates rays on the projected silhouette

**Impact**: For small parts (common in industrial CT — watch components, MEMS, small medical devices), the optimization results are unreliable without the user manually selecting a dense enough ray grid. The UI gives no feedback on sampling adequacy.

---

## PLACEHOLDER: Stub Objective Functions

### P1. fBh (beam hardening) — always returns 0

**File**: `search.go` lines 117-123, 403-405

```go
// Placeholder for beam-hardening metric
var fBh float64
// For now, we set it to 0. In the future, we can compute a proper metric.
```

The function `FBh()` in objectives.go is a pass-through that returns input unchanged. The beam-hardening objective is entirely non-functional. The weight presets allocate `wBh: 0.05` or `0.1`, but since `fBh` is always 0, this weight slot is wasted.

### P2. f_uncertainty (Grozmani) — referenced but not implemented

**Research note**: Lists `f_uncertainty` as a PenOpt objective in the objectives package.  
**Code**: No `f_uncertainty` function exists anywhere. The comment in objectives.go line 4 lists "uncertainty" as an unimplemented additional objective that "require[s] per-face or per-projection data not collected by the sparse ray grid."

---

## WARNING: Physics Simplifications & Hardware Assumptions

### W1. Tucker/Boone spectrum — simplified continuum model

**Paper** (Tucker 1991): Depth-dependent bremsstrahlung production model with full K-shell ionization cross-section for characteristic line intensities. Self-filtration and anode-angle effects are included.

**Code** (material.go): 
```go
phi := math.Max(0, (kVp-E)/E)  // simplified bremsstrahlung spectrum
```
- No depth-dependent production model
- Characteristic lines are not modeled at all (the spectrum is purely continuum)
- Anode angle is a single default parameter (12°) embedded in the code
- No inherent filtration (beryllium window, oil insulation)
- No spectral validation against published spectra

**Impact**: The effective energy computation is a heuristic, not the cited Tucker/Boone model. The kV recommendation algorithm may be off by tens of kV for heavily filtered beams.

### W2. Alsaffar scatter — not implemented at all

The scatter-to-primary ratio model does not exist. The code has no awareness of scatter effects.

### W3. NIST XCOM data — unverified against current standard

**Code** (mats_data.go): 40+ materials ported from a JavaScript reference implementation.  
**Issue**: Not verified against the current NIST XCOM online tool values. If the JavaScript source had transcription errors, they propagate into PenOpt's physics. K-edge handling exists for only 3 materials (Sn, Pb, W) but K-edges affect attenuation significantly near transition energies.

---

## WARNING: IntelliScan Geometry Mode

### W4. Parallel-beam and cone-beam formulas claimed identical

**File**: `intelliscan.go` lines 23-40

The code claims that for both parallel-beam and cone-beam geometries:

> The formula is mathematically identical; the GeometryMode field communicates which approximation was used and whether the result is validated for the system.

**Issue**: For a true cone-beam system with wide-angle divergence, the tangent-ray condition is not simply `d̂(α) · n̂ = 0`. The ray direction through each face centroid varies across the detector, so the tangent condition is actually a nonlinear equation per face-per-projection-angle. The current code assumes all rays are parallel to the central ray, which is only valid for small cone angles (SOD ≫ object size).

**Impact**: For wide-angle systems (dental CBCT, large-area detectors), the computed IntelliScan angles may be suboptimal. The cone-beam warning message thresholds (SOD/SDD < 0.7) deserve tighter validation.

**Stronger claim**: The code uses parallel-beam physics **unconditionally**. The `GeometryMode` field is purely cosmetic — the formula never changes regardless of the mode selected. The cone-beam equation shown in the docstring only simplifies to the same `atan2(nx, nz)` under the assumption that the source is at infinity (i.e., all rays are parallel). For any real cone-beam system at finite SOD, the ray direction varies across the detector by the cone half-angle.

### W5. BVH early-exit can miss intersections for non-watertight meshes

**File**: `internal/bvh/bvh.go` line 157

```go
if tFar < 0 { return }
```

**Problem**: The ray-AABB intersection's `tFar < 0` early-exit is correct when the ray origin is outside the mesh. But for non-watertight meshes (which PenOpt warns about but accepts), a ray origin can be **inside** the mesh volume. In that case `tFar < 0` can occur when the AABB is entirely behind the ray, causing valid intersections to be silently skipped.

**Impact**: For non-watertight meshes, penetration lengths can be silently underestimated. The watertight warning is shown to the user, but the severity of the resulting error is not communicated.

---

## COVERAGE: Missing Tests

### T1. App layer — zero tests

| File | Tests |
|------|-------|
| `internal/app/meshloader.go` | 0 |
| `internal/app/optimizer.go` | 0 |
| `internal/app/physicsapi.go` | 0 |
| `internal/app/scannerapi.go` | 0 |

All four Wails adapter files are untested. The physics API in particular has no tests verifying:
- `CalcBeamParams` for any material/filter combination
- `CalcEnergyRecommendation` against known-good kV references
- JSON marshalling edge cases

### T2. NIST XCOM interpolation — not verified against standard

The `LogLogInterp` function is tested for basic correctness (exact match, below-range, above-range, empty). But there are no tests that:
- Verify μ/ρ values at interpolation points against known NIST XCOM outputs
- Verify K-edge interpolation correctness for Sn, Pb, W
- Verify filter transmission against Beer-Lambert known values
- Cross-validate the material database against the [NIST XCOM online tool](https://physics.nist.gov/PhysRefData/Xcom/html/xcom1.html)

### T3. Orientation scoring — no known-answer tests

There are no tests that:
- Load a simple geometric shape (cube, sphere, cylinder)
- Define a known-optimal orientation for that shape
- Verify the search finds that optimum
- Verify the objective function values match theoretical expectations

The existing search tests check that functions run without error, but never validate that the *answers are correct*. The Tuy-completeness tests verify counts for simple geometries, which is good, but the full search pipeline is unvalidated.

### T4. No end-to-end tests

There are no tests that exercise the frontend→backend→frontend round trip. The JSON serialization/deserialization path is untested, meaning API contract mismatches of this kind can go undetected until runtime.

---

## FRONTEND: UI Implications of Science Gaps

### F1. Weight presets misrepresent what's actually optimized

**File**: `frontend/src/state.js` lines 6-8, `frontend/src/optimizer.js` lines 216-218

The trade-off card lets users switch between three presets:
- Quality (wTuy=0.05, wBh=0.05)
- Balanced (wTuy=0.10, wBh=0.10)
- Energy (wTuy=0.05, wBh=0.05)

These present fBh and fTuy as meaningful objectives alongside fMtl, fEnergy, fHdn. **They are not**:
- fBh always returns 0 (P1) — **wBh is completely wasted**
- FTuy is never inverted (G7) — **wTuy actively worsens optimization**

The preset names and descriptions imply balanced optimization across all dimensions. In reality, 10-20% of the weight allocation (wTuy + wBh) is counterproductive or inert. A user selecting "Balanced" gets 70% real signal and 30% noise/wrongness.

### F2. f_tuy result row can show inverted rankings

**File**: `frontend/src/optimizer.js` line 165

```js
['f_tuy', fTuyWorst, fTuyBest, pctTuy, (bestScore.fTuy - worstScore.fTuy)],
```

The results table compares fTuy between the "best" and "worst" scored orientations. Since FTuy is not inverted, the "best" orientation (lowest combined score) may actually have **worse** Tuy-Smith completeness than the "worst." The improvement percentage shown is meaningless.

### F3. IntelliScan info text has threshold mismatch with backend

**File**: `frontend/src/optimizer.js` line 251 (hardcoded HTML)
> Tangent angles computed for parallel-beam geometry. For wide-angle cone-beam systems (SOD/SDD &lt; 0.6), consider verifying critical angles manually.

**File**: `internal/search/intelliscan.go` line 51
> `coneRatio < 0.7` → cone-beam mode

The frontend warns at SOD/SDD < 0.6, but the backend switches to "cone-beam" geometry at SOD/SDD < 0.7. These thresholds are inconsistent. The frontend will show the parallel-beam warning when the backend has already switched to cone-beam mode and vice versa.

### F4. Energy recommendation lacks physics caveat

**File**: `frontend/src/optimizer.js` line 202

```js
$('energy-caveat').textContent = 'Qualitative estimate. Actual consumption depends on scanner hardware.';
```

This caveat attributes inaccuracy to hardware variation. It doesn't mention that the underlying spectrum model is a simplified heuristic (W1), not the cited Tucker/Boone model, and that the kV recommendation may be off by 10-30 kV for heavily filtered beams.

### F5. Results panel doesn't communicate uncertainty

The optimal orientation is presented as a single definitive pair (θ, φ). The search produces a ranked list of candidates, but the UI shows only the best and worst. There's no indication of:
- How close the second-best candidate scores
- Whether the top-3 refined orientations converged to the same region
- The confidence in the result given the coarse→fine resolution gap

A 

### D1. search.go package doc says 10°, implements 15°

Line 1-2:
```go
// Package search implements the coarse→fine grid search for optimal orientation.
// Based on Ito et al. 2020 §2.4: discretize (θ, φ) at 10° intervals, find top 3,
```

But `generateSearchGrid()` at line 24: `step := 15.0`

### D2. "Vector helpers removed" refactoring artifacts

Multiple comments in raycaster.go reference removed inline vector functions:
```go
// Vector helpers removed — use vec.Normalize, vec.Sub, vec.RotateX, vec.RotateY
```

These are left over from a refactoring pass and should be cleaned up.

---

## Per-Paper Alignment Scores

| Paper | What's Implemented | Gaps | Score |
|---|---|---|---|
| **Ito 2020** | f_mtl, f_energy, f_hdn tracking, coarse→fine search, min-max normalization, weighted/minimax scoring | 15° not 10° grid, f_hdn uses wrong proxy, f_fdk not optimized, f_bh placeholder | **65%** |
| **Heinzl 2011** | Ray casting through mesh, penetration length computation, per-face analysis, configurable scanner geometry | CPU vs GPU, no Radon space visualization, no placement stability widget | **70%** |
| **Lifton/Poon 2023** | Tangent-ray condition d̂·n̂=0, two solutions per face, angle deduplication, automatic computation | No reconstruction validation, no multi-orientation fusion | **85%** |
| **Butzhammer 2026** | Automatic 3D tangent-ray detection, STL input, method A | Method B not implemented, no reference-scan pose estimation integration | **70%** |
| **Grozmani 2019** | Shared geometric proxy concept (f_mtl, f_energy) | f_uncertainty not implemented, no SOD optimization, no experimental validation | **30%** |
| **Deb 2002** | Nothing implemented — entire NSGA-II section is aspirational | **0%** |
| **Tucker/Boone 1991/1997** | Effective energy concept | Simplified heuristic spectrum, no depth-dependent model, no characteristic lines, no inherent filtration, unvalidated | **15%** |
| **Alsaffar 2022** | Nothing implemented — scatter awareness completely absent | **0%** |
| **NIST XCOM** | 40+ materials with log-log interpolation, Beer-Lambert physics, filter transmission, kV recommendation | Unverified against current NIST standard, incomplete K-edge handling (only 3/40+ materials), ported third-hand from JS | **55%** |

---

## Prioritized Recommendations for Hardening

### High priority:

1. **Fix FTuy inversion** — Apply `1 - tuy` in the scoring path. Currently 5-10% of the optimization signal actively prefers worse Tuy-Smith completeness.
2. **Add known-answer tests** for at least one simple geometry (e.g., a cube where optimal orientation is known by symmetry)
3. **Verify NIST XCOM material data** against the online tool for at least 3 representative materials (Al, Fe, Pb)
4. **Document the 15° → 10° coarse grid deviation** in the Ito research note — with rationale and validation

### Lower priority:

5. **Implement f_uncertainty from Grozmani** — It needs per-face data, but the infrastructure exists in `ComputeFacePenetrations()`
6. **Add cone-beam tangent test** with a known wide-angle system to verify the parallel-beam approximation's validity
7. **Cross-validate kV recommendations** against published CT protocol tables for known materials/geometries
8. **Remove dead code**: `EmitProgress` stub, `mu()` function, unused `Min`/`Max`, `three-mesh-bvh` dependency
9. **Clean up refactoring artifacts**: "Vector helpers removed" comments, underscore-prefixed Go functions

### Engineering task (small-part handling — no research needed):

10. **Add ray-grid undersampling detection** — Compute `hitRatio = nonZeroRays ÷ totalRays` per orientation in `ComputeTransmissionLengths()`. Surface as a `CoverageFraction` field on `OrientationResult`.
11. **Add coverage warning** — When hitRatio < 5%, emit a warning in the search results: "Only X% of rays intersected the part. Increase ray grid or adjust scanner geometry."
12. **Auto-size the ray grid** — In `search.Run()`, scale the default `RayGridX/Y` based on `partExtent ÷ detectorSize`. If the part bounding box is <10% of the detector, start at 32×32 instead of 8×8.
13. **Fallback to face-centroid sampling** — For very small parts (part extent < 2× inter-ray spacing), switch from grid-based sampling to per-face centroid ray casting (infrastructure exists in `ComputeFacePenetrations()`). This guarantees every face is sampled at the cost of more rays.

### Frontend fixes (should accompany backend fixes):

14. **Sync IntelliScan threshold** between frontend (0.6) and backend (0.7) — `optimizer.js` vs `intelliscan.go`
15. **Update energy caveat** to mention simplified spectrum model, not just hardware variation
16. **Add convergence indicator** to results — show second-best score or top-3 spread so users can judge result confidence
17. **Update weight preset descriptions** in the trade-off card UI to reflect that fBh is not yet functional

---

## Tagged Findings (for traceability)

| ID | File(s) | Paper | Type | Status |
|---|---|---|---|---|
| G1 | internal/search/search.go | Ito 2020 | 15° vs 10° grid | ❌ Open |
| G2 | internal/objectives/objectives.go | Ito 2020 | f_hdn uses wrong proxy (plus double-counted with f_energy) | ⚠️ Known/doc'd |
| G3 | search/, tuy.go | Ito 2020 | f_fdk not optimized | ❌ Open |
| G4a | internal/search/search.go | Ito 2020 | Global vs batch normalization | ⚠️ Intentional improvement |
| G4b | internal/search/search.go | Ito 2020 | Coarse/fine ray grid resolution mismatch | ❌ Open |
| G5 | raycaster/, bvh/ | Heinzl 2011 | CPU vs GPU | ⚠️ Intentional design |
| G6 | search/intelliscan.go | Butzhammer 2026 | Method B not implemented | ❌ Open |
| G7 | objectives.go | Ito 2020 | FTuy inverted — optimizes for worse completeness | 🔴 BLOCKER |
| G8 | internal/search/search.go | Ito 2020 | Fine search angle-wrapping evaluates irrelevant orientations | ❌ Open |
| P1 | search.go, objectives.go | — | fBh placeholder (0) | ❌ Open |
| P2 | — | Grozmani 2019 | f_uncertainty not implemented | ❌ Open |
| W1 | internal/physics/material.go | Tucker/Boone | Simplified spectrum model | ⚠️ Known/doc'd |
| W2 | — | Alsaffar | No scatter model | ❌ Open |
| W3 | internal/physics/mats_data.go | NIST XCOM | Unverified data (ported third-hand from JS) | ❌ Open |
| W4 | search/intelliscan.go | Butzhammer 2026 | Cone-beam approximation — uses parallel-beam unconditionally | ❌ Open |
| W5 | internal/bvh/bvh.go | — | BVH early-exit skips intersections for non-watertight meshes | ❌ Open |
| T1 | internal/app/* | — | Zero tests for app layer | ❌ Open |
| T2 | physics/ | NIST XCOM | No cross-validation against NIST standard | ❌ Open |
| T3 | search/, objectives/ | Ito 2020 | No known-answer tests | ❌ Open |
| T4 | (cross-cutting) | — | No end-to-end tests | ❌ Open |
| T5 | raycaster/ | — | No small-part / undersampling test | ❌ Open |
| D1 | search/search.go | Ito 2020 | Docstring says 10°, implements 15° | ❌ Open |
| D2 | raycaster/raycaster.go | — | Refactoring artifacts | ❌ Open |
| G9 | raycaster/, search/, objectives/ | — | No handling for small parts — ray grid undersamples mesh | ❌ Open |
| F1 | frontend/src/state.js, optimizer.js | — | Weight presets misrepresent fBh/fTuy as meaningful | ❌ Open |
| F2 | frontend/src/optimizer.js | — | f_tuy result row shows inverted rankings | ❌ Open |
| F3 | frontend/src/optimizer.js vs intelliscan.go | — | IntelliScan threshold mismatch (0.6 vs 0.7) | ❌ Open |
| F4 | frontend/src/optimizer.js | — | Energy caveat omits simplified spectrum model | ❌ Open |
| F5 | frontend/src/optimizer.js | — | No uncertainty communication on results | ❌ Open |

