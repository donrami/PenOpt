# Alsaffar et al. 2022 — Fast Monte Carlo Scatter Correction for Cone-Beam CT

## Reference

**Authors:** Ammar Alsaffar, Steffen Kieß, Kaicong Sun, Sven Simon (University of Stuttgart)  
**Title:** *Computational scatter correction in near real-time with a fast Monte Carlo photon transport model for high-resolution flat-panel CT*  
**Venue:** Journal of Real-Time Image Processing, Vol. 19, pp. 1063–1079 (2022)  
**DOI:** [10.1007/s11554-022-01247-7](https://doi.org/10.1007/s11554-022-01247-7)  
**arXiv:** [2201.13191](https://arxiv.org/abs/2201.13191) (preprint)

## Abstract

In CT, scattering causes severe quality degradation (streaks, cupping artifacts) that reduce detectability of low-contrast objects. Monte Carlo simulation is the most accurate approach for scatter estimation, but existing MC estimators are computationally expensive, especially for high-resolution flat-panel CT. This paper proposes a fast and accurate MC photon transport model describing physics in the 1 keV to 1 MeV range with multiple controllable key parameters. Scatter computation for a single projection completes within seconds. Combining fast scatter estimation with filtered backprojection (FBP), scatter correction is performed iteratively. The proposed model achieved 15× acceleration on single-GPU vs. Penelope MCGPU and 202× speed-up on multi-GPU vs. EGSnrc.

## Status in PenOpt: **Not Implemented**

> ⚠️ **NOT IMPLEMENTED — REFERENCE ONLY**
> PenOpt currently has no scatter awareness. This research note serves as a reference for a planned future feature. The code described below does not exist in the codebase.

### Current Reality

PenOpt's objective functions do not include any scatter metric. The comment in `internal/objectives/objectives.go` line 4–6 lists scatter among planned objectives:

```go
// Additional objectives (beam hardening, scatter, cone-beam, uncertainty)
// are defined but require per-face or per-projection data not collected
// by the sparse ray grid — they are available in NSGA-II+AdvancedPhysics mode.
```

However, no scatter-related code exists in the codebase:
- No `internal/physics/scatter.go` file
- No `SparseGridSPR()` or any other scatter function
- No f_scatter objective
- No scatter-to-primary ratio computation

### Why Scatter Awareness Matters

Scatter is a major source of CT image quality degradation. For industrial CT of dense objects (metal, ceramic), scatter-to-primary ratios can exceed 5:1 in certain projections, causing:
- **Cupping artifacts**: Apparent density reduction in the centre of uniform objects
- **Streak artifacts**: Dark bands between high-density features
- **Reduced contrast resolution**: Low-contrast features become undetectable

Ignoring scatter means PenOpt's optimal orientation may:
- Favour orientations with favourable attenuation but **worst-case scatter geometry**
- Miss the true optimum that balances both penetration and scatter

### Proposed Approach (for when implementation begins)

The core insight from Alsaffar is that **scatter magnitude correlates with mean ray path length through the object** (more material → more Compton scattering → higher SPR). This suggests a geometric proxy approach:

```go
// Proposed signature:
func SparseGridSPR(meanThickness float64, energy float64, mat Material) float64
```

| Parameter | Description | Typical Range |
|---|---|---|
| `meanThickness` | Mean ray path through object (mm) | 0–500 mm |
| `energy` | Effective energy (keV) | 30–500 keV |
| `mat` | Material properties (density, μ) | Al, Fe, Ti, etc. |

The SPR would be clamped to [0, 2] to prevent unphysical values, and integrated into the physics pipeline as:

```
SparseGridSPR(meanThickness, energy, mat)
       ↓
SPR value [0, 2]  →  weighting factor for scatter degradation
       ↓
f_scatter objective (higher SPR → worse scatter artifacts)
```

### Simplification vs. Full Model

| Aspect | Alsaffar et al. (2022) | Proposed PenOpt Proxy |
|---|---|---|
| **Method** | MC photon transport (GPU) | Analytical SPR formula |
| **Resolution** | Full projection (high-res flat-panel) | 16×16 sparse grid |
| **Output** | Full scatter distribution map | Single SPR value |
| **Speed** | Seconds per projection | Microseconds per evaluation |
| **Accuracy** | High (validated against measurements) | Approximate (geometric proxy) |

## See Also

- Current objective functions (scatter not included): `internal/objectives/objectives.go`
- Grozmani et al. 2019 measurement uncertainty: [`grozmani2019_uncertainty.md`](./grozmani2019_uncertainty.md)
- Physical foundation (Beer-Lambert, NIST XCOM): [`nist_xcom.md`](./nist_xcom.md)
