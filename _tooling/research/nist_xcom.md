# NIST XCOM — Photon Cross Sections Database

## Reference

**Standard:** NIST Standard Reference Database 8 (XGAM)  
**Title:** *NIST XCOM: Photon Cross Sections Database*  
**URL:** https://www.nist.gov/pml/xcom-photon-cross-sections-database  
**Primary Reference:** Berger, M.J., et al., *XCOM: Photon Cross Sections Database*, NISTIR 6537

## Overview

NIST XCOM provides tabulated mass attenuation coefficients (μ/ρ, in cm²/g) for elements and compounds over the energy range 1 keV to 100 GeV. PenOpt uses the data for energies 1–1000+ keV, covering the industrial CT range.

## Role in PenOpt (PenOpt: `internal/physics/`)

### 1. Material Database (`mats_data.go`)

- **40+ materials** ported byte-for-byte from the JavaScript reference implementation
- Categories: metallic (Al, Ti, Fe, Cu, etc.) and non-metallic (acrylic, nylon, PVC, etc.)
- Each material has tabulated (energy_keV, μ/ρ) data points from NIST XCOM
- Density (ρ in g/cm³) and K-edge energy (where applicable)

### 2. Log-Log Interpolation (`material.go`)

```go
func LogLogInterp(E float64, pts []MuRhoPoint) float64
```

Matches the standard NIST XCOM interpolation method: linear interpolation in log-log space.

### 3. Beer-Lambert Physics

| Function | Formula | Purpose |
|---|---|---|
| `CalcMu(mat, E)` | μ = μ/ρ · ρ | Linear attenuation coefficient (cm⁻¹) |
| `CalcTransmission(μ, x)` | T = exp(−μ · x/10) | Transmission through thickness x (mm) |
| `CalcTMm(μ, Tmin)` | x = −ln(Tmin) / μ · 10 | Max penetration for target transmission |
| `FilterTrans(E, layers)` | T = Π exp(−μ_i · ρ_i · t_i) | Multi-layer filter transmission |

### 4. Effective Energy & KV Recommendation

- `ComputeEffectiveEnergy()` — Simulates polychromatic spectrum through filter layers
- `RecommendKV()` — Sweeps 50–500 kV to find minimum voltage achieving target transmission
- `HVLCu()` — Copper half-value layer calculation

## Data Sources

The material data in `mats_data.go` was originally ported from the JavaScript reference implementation at `/home/mainuser/Desktop/ct/`, which in turn sourced its data from NIST XCOM standard reference data.

## Implementation Alignment Checklist

- [x] Log-log interpolation matching NIST XCOM method
- [x] Correct μ/ρ values for all 40+ materials in CT-relevant energy range
- [x] Beer-Lambert transmission calculation
- [x] Filter material data (Cu, Zn)
- [x] KV recommendation algorithm
- [ ] Verification against current NIST XCOM online tool values
- [ ] Temperature/density correction for materials
