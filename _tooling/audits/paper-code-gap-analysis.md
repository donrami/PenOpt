# Paper-Code Gap Analysis: PenOpt vs. Cited Research

**Date**: 2026-05-12  
**Scope**: Full comparison of the PenOpt codebase against the 9 cited scientific papers/standards in `_tooling/research/`  
**Methodology**: Read every Go source file, JS frontend module, research reference document, and test file. Cross-referenced each paper's method claims against implementation.

---

## Summary of Findings

| Severity | Count | Description |
|----------|-------|-------------|
| **GAP** | 6 | Implementation deviates from paper methods in documented and undocumented ways |
| **PLACEHOLDER** | 3 | Objective functions that exist as stubs but return 0 / pass-through |
| **WARNING** | 2 | Physics model is significantly simplified vs. cited methods |
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

### G4. Ito 2020 — Coarse→fine normalization is global, paper is batch-local

**Paper**: Normalization is per-batch (coarse scores normalized independently, top candidates identified from coarse-normalized scores, then fine scores refined).  
**Code**: Coarse-only normalization used for top-3 selection (`globalScoreAndNormalize` applied to coarse results only), then **all** coarse + fine results are globally normalized together for the final ranking. The docstring says this avoids "batch-local bias."

**Impact**: This is arguably an *improvement* over the paper — global normalization is more correct. But it means coarse candidates that had poor coarse scores but improve dramatically with finer ray grids won't be discovered since top-3 selection is still coarse-only.

### G5. Heinzl 2011 — CPU-based ray casting, not GPU

**Paper**: Uses GPU-based ray casting for penetration length computation.  
**Code**: CPU-based parallel goroutines with BVH acceleration.

**Impact**: The paper's approach is faster for production use; PenOpt's approach is simpler and more portable. This is documented in the research note as "intentional design choice." The goroutine-per-projection model works well but limits scalability to ~CPU-core-count parallelism.

### G6. Butzhammer 2026 — Only Method A implemented

**Paper**: Proposes two variants — Method A (basic angle selection for complete surface coverage) and Method B (extended greedy variant for geometrically complex objects with surface-fraction awareness).  
**Code**: Single-pass approach collecting all tangent angles with deduplication — maps to Method A only.

**Research note** (butzhammer2026_angles.md): Claims "Two algorithmic variants (Method A + Method B)" and "Surface-fraction coverage selection (Method B greedy selection)" as implemented, with checkboxes marked ✅.

**Impact**: Another phantom checkbox. Method B is not implemented.

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

### P2. FTuy — pass-through, never inverted for minimization

**File**: `objectives.go` lines 67-76

```go
func FTuy(values []float64) []float64 {
    return values  // no inversion, no transformation
}
```

The docstring says "caller should use (1 - tuy) if they want to minimize" but no caller does this. Since the scoring system minimizes scores, and fTuy is "higher is better," the objective would need to be inverted to work correctly. (This was masked at launch because the frontend only sent 3 weights — now 5 are transmitted, so FTuy's inverted direction is an active bug.)

### P3. f_uncertainty (Grozmani) — referenced but not implemented

**Research note**: Lists `f_uncertainty` as a PenOpt objective in the objectives package.  
**Code**: No `f_uncertainty` function exists anywhere. The comment in objectives.go line 4 lists "uncertainty" as an unimplemented additional objective that "require[s] per-face or per-projection data not collected by the sparse ray grid."

---

## WARNING: Physics Simplifications

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

There are no tests that exercise the frontend→backend→frontend round trip. The JSON serialization/deserialization path is untested, meaning bugs like B3 (wrong weights array length) can go undetected until runtime.

---

## MINOR: Documentation vs. Reality Discrepancies

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
| **Tucker/Boone 1991/1997** | Effective energy concept | Simplified heuristic spectrum, no depth-dependent model, no characteristic lines, no inherent filtration, unvalidated | **25%** |
| **Alsaffar 2022** | Nothing implemented — scatter awareness completely absent | **0%** |
| **NIST XCOM** | 40+ materials with log-log interpolation, Beer-Lambert physics, filter transmission, kV recommendation | Unverified against current NIST standard, incomplete K-edge handling, no temperature/density correction | **75%** |

---

## Prioritized Recommendations for Hardening

### High priority:

1. **Document the 15° → 10° coarse grid deviation** in the Ito research note — with rationale and validation
2. **Fix FTuy inversion** — Either apply `1 - tuy` in the scoring path or document why the pass-through is correct
3. **Add known-answer tests** for at least one simple geometry (e.g., a cube where optimal orientation is known by symmetry)
4. **Verify NIST XCOM material data** against the online tool for at least 3 representative materials (Al, Fe, Pb)

### Lower priority:

5. **Implement f_uncertainty from Grozmani** — It needs per-face data, but the infrastructure exists in `ComputeFacePenetrations()`
6. **Add cone-beam tangent test** with a known wide-angle system to verify the parallel-beam approximation's validity
7. **Cross-validate kV recommendations** against published CT protocol tables for known materials/geometries
8. **Remove dead code**: `EmitProgress` stub, `mu()` function, unused `Min`/`Max`, `three-mesh-bvh` dependency
9. **Clean up refactoring artifacts**: "Vector helpers removed" comments, underscore-prefixed Go functions

---

## Tagged Findings (for traceability)

| ID | File(s) | Paper | Type | Status |
|---|---|---|---|---|
| G1 | internal/search/search.go | Ito 2020 | 15° vs 10° grid | ❌ Open |
| G2 | internal/objectives/objectives.go | Ito 2020 | f_hdn uses wrong proxy | ⚠️ Known/doc'd |
| G3 | search/, tuy.go | Ito 2020 | f_fdk not optimized | ❌ Open |
| G4 | internal/search/search.go | Ito 2020 | Global vs batch normalization | ⚠️ Intentional improvement |
| G5 | raycaster/, bvh/ | Heinzl 2011 | CPU vs GPU | ⚠️ Intentional design |
| G6 | search/intelliscan.go | Butzhammer 2026 | Method B not implemented | ❌ Open |
| P1 | search.go, objectives.go | — | fBh placeholder (0) | ❌ Open |
| P2 | objectives.go | — | FTuy never inverted (now actively wrong since 5 weights transmit) | ❌ Open |
| P3 | — | Grozmani 2019 | f_uncertainty not implemented | ❌ Open |
| W1 | internal/physics/material.go | Tucker/Boone | Simplified spectrum model | ⚠️ Known/doc'd |
| W2 | — | Alsaffar | No scatter model | ❌ Open |
| W3 | internal/physics/mats_data.go | NIST XCOM | Unverified data | ❌ Open |
| W4 | search/intelliscan.go | Butzhammer 2026 | Cone-beam approximation unvalidated | ❌ Open |
| T1 | internal/app/* | — | Zero tests for app layer | ❌ Open |
| T2 | physics/ | NIST XCOM | No cross-validation against NIST standard | ❌ Open |
| T3 | search/, objectives/ | Ito 2020 | No known-answer tests | ❌ Open |
| T4 | (cross-cutting) | — | No end-to-end tests | ❌ Open |
| D1 | search/search.go | Ito 2020 | Docstring says 10°, implements 15° | ❌ Open |
| D2 | raycaster/raycaster.go | — | Refactoring artifacts | ❌ Open |

