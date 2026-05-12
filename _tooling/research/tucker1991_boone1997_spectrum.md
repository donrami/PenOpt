# Tucker/Boone — X-ray Spectrum Models for Tungsten Anode Sources

## References

### Primary: Tucker et al. 1991

**Authors:** Douglas M. Tucker, Gary T. Barnes, D. P. Chakraborty  
**Title:** *Semiempirical model for generating tungsten target x-ray spectra*  
**Venue:** Medical Physics, Vol. 18(3), pp. 402–409 (1991)  
**DOI:** [10.1118/1.596709](https://doi.org/10.1118/1.596709)  
**PMID:** 2046607

### Secondary: Boone & Seibert 1997

**Authors:** John M. Boone, J. Anthony Seibert  
**Title:** *An accurate method for computer-generating tungsten anode x-ray spectra from 30 to 140 kV*  
**Venue:** Medical Physics, Vol. 24(11), pp. 1661–1670 (1997)  
**DOI:** [10.1118/1.597953](https://doi.org/10.1118/1.597953)

## Abstract (Tucker 1991)

A semiempirical model for generating tungsten target x-ray spectra is presented. The model extends earlier work in two significant areas: (1) both bremsstrahlung and characteristic x-ray production are assumed to occur at varying depths within the target; (2) optimal model parameters were determined from experimental spectra using nonlinear least-squares techniques. Good agreement is obtained between calculated and measured x-ray tube spectra for different target angles and a wide range of tube potentials.

## Abstract (Boone 1997)

A method for computer-generating tungsten anode x-ray spectra from 30 to 140 kV is presented. The model uses a simple polynomial parameterisation of the bremsstrahlung spectrum and incorporates K-characteristic lines. The resulting spectra agree with measured data to within 3% across the diagnostic energy range. The method is computationally efficient and suitable for integration into simulation and optimisation codes.

## Status in PenOpt: **Simplified Heuristic Spectrum**

> ⚠️ **SIMPLIFIED IMPLEMENTATION — Tucker/Boone spectrum generator not built.**
> The full Tucker/Boone model with depth-dependent bremsstrahlung and K-characteristic lines is not implemented. PenOpt uses a heuristic continuum spectrum for effective-energy computation. See below for details.

### What Actually Exists

PenOpt's only spectrum-aware code lives in **`internal/physics/material.go`**, specifically the function `ComputeEffectiveEnergy()` (not a standalone `spectrum.go` file). This function uses a **120-point heuristic spectrum** to compute effective beam energy after filter attenuation:

```
N(E) ∝ max(0, (kVp − E) / E)    — heuristic bremsstrahlung continuum (no characteristic lines)
```

The key function:

```go
func ComputeEffectiveEnergy(EInput float64, layers []FilterLayer) EffectiveEnergyResult
```

| Aspect | Full Tucker/Boone | PenOpt Implementation |
|---|---|---|
| **Physics model** | Depth-dependent bremsstrahlung + characteristic production | Simple heuristic: φ(E) ∝ max(0, (kVp−E)/E) |
| **Characteristic lines** | Kα, Kβ at precise energies with relative intensities | **Not modeled** |
| **Energy bins** | Continuous / high-resolution | 120 bins (uniform from 20 keV to kVp) |
| **Anode angle** | Full angular dependence | Not modeled (implicitly assumes 0°) |
| **Filtering** | Not included in base model | Separate `FilterTrans(E, layers)` function |
| **Normalisation** | Physical units (photons/mm²/mAs) | Sum = 1.0 (unit normalised) |
| **Self-filtration** | Beryllium window, oil, inherent filtration | **Not modeled** |

### Usage in PenOpt

| Function | Location | Purpose |
|---|---|---|
| `ComputeEffectiveEnergy(kV, filterLayers)` | `material.go:136` | Compute effective beam energy via 120-point heuristic spectrum integration |
| `FilterTrans(E, layers)` | `material.go:126` | Attenuation through multi-layer beam filter |
| `HVLCu(E)` | `material.go:165` | Copper half-value layer (mm) at energy E |
| `RecommendKVWithFilter(mat, pen, Tmin, filters)` | `material.go:182` | Sweep 50–500 kV to find minimum voltage achieving target transmission |

### Integration with Physics Pipeline

```
RecommendKVWithFilter(mat, maxPenetrationMM, Tmin, filterLayers)
       ↓
ComputeEffectiveEnergy(kVguess, filterLayers)     ← heuristic 120-point spectrum
       ↓
CalcMu(mat, keff)                                 ← NIST XCOM interpolation
       ↓
CalcTransmission(mu, maxPenetrationMM)            ← Beer-Lambert
       ↓
If T >= Tmin → return kVguess
```

## Deviations from Literature (Critical)

1. **No Tucker/Boone spectrum model.** The full depth-dependent bremsstrahlung model from Tucker 1991 is not implemented. The heuristic `(kVp−E)/E` formula is not grounded in any published model.
2. **No characteristic tungsten K-lines.** The Tucker and Boone models both include Kα (59.3, 57.9 keV) and Kβ (67.2, 69.0 keV) lines with intensity ratios derived from K-shell ionisation cross-sections. PenOpt omits these entirely. This biases effective energy low when kVp exceeds the W K-edge (69.5 keV).
3. **No self-filtration.** Real X-ray tubes have beryllium exit windows, oil cooling, and inherent filtration that harden the beam before it reaches any user-added filter. PenOpt does not model this, overestimating flux at low energies.
4. **No anode-angle dependence.** The heel effect and spectral hardening from angled anode targets are not modeled.
5. **Unvalidated effective energy.** The output of `ComputeEffectiveEnergy()` has never been compared against published Tucker/Boone spectra or measured beam quality data (HVL matching).

## Effect on Accuracy

The heuristic spectrum underestimates beam hardening. For a 200 kV beam with 1 mm Cu filter:
- True effective energy (Tucker/Boone): ~100–120 keV (depending on anode angle)
- PenOpt effective energy: likely lower due to missing characteristic lines and self-filtration
- **kV recommendation may overestimate required tube voltage** by 10–30 kV depending on filtration and material

## Roadmap to Full Tucker/Boone Implementation

- [ ] Implement `TuckerBooneSpectrum(kV, anodeAngle float64) []float64` generating 1 keV-bin spectrum
- [ ] Add tungsten Kα/Kβ characteristic lines with proper intensity ratios (from Boone 1997 polynomial parameterisation)
- [ ] Add inherent filtration model (0.8 mm Be + oil equivalent)
- [ ] Validate effective energy against published HVL curves from manufacturer data
- [ ] Cross-validate kV recommendations against published CT protocol tables
