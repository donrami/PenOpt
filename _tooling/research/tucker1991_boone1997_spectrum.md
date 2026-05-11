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

## Role in PenOpt (PenOpt: `internal/physics/spectrum.go`)

### 1. Tucker/Boone Spectrum Generator (`TuckerBooneSpectrum`)

PenOpt implements a **simplified Tucker/Boone model** that captures the essential physics:

```
N(E) ∝ E × exp(-3 × E / kV)    — bremsstrahlung continuum
      + Kα, Kβ characteristic lines at 59.3, 57.9, 67.2, 69.0 keV
```

| Aspect | Full Tucker/Boone | PenOpt Simplified |
|---|---|---|
| **Physics model** | Depth-dependent bremsstrahlung + characteristic production | Simplified continuum + fixed line energies |
| **Number of energy bins** | Continuous / high-resolution | 100 bins (10 keV resolution) |
| **Anode angle** | Full angular dependence | Single parameter (default 12°) |
| **Filtering** | Not included in base model | Separate `ApplyFilter()` function |
| **Normalisation** | Physical units (photons/mm²/mAs) | Sum = 1.0 (unit normalised) |
| **Characteristic lines** | Full intensity ratio model | Fixed Gaussian peaks at W K-lines |

### 2. Usage in PenOpt

| Function | Location | Purpose |
|---|---|---|
| `TuckerBooneSpectrum(kV, anodeAngle)` | `spectrum.go:10` | Generate 100-bin polychromatic spectrum |
| `EnergyBins(kV)` | `spectrum.go:90` | Bin centre energies for the spectrum |
| `FastSpectrum(kV, anodeAngle)` | `spectrum.go:167` | 10-bin coarse spectrum for optimisation loops |
| `ApplyFilter(spectrum, energyBins, filter)` | `spectrum.go:130` | Apply Cu/Al/Zn beam filter attenuation |

### 3. Integration with Physics Pipeline

```
TuckerBooneSpectrum(kV, 12°)  →  ApplyFilter(..., filter)
       ↓
EnergyBins(kV)  +  material μ(E) data (NIST XCOM)
       ↓
Polychromatic transmission for each ray
       ↓
f_bh (beam-hardening objective), AdvancedPhysics mode
```

## Deviations from Literature

- PenOpt uses a simplified continuum formula (`E×exp(-3E/kV)`) rather than Tucker's depth-dependent bremsstrahlung model
- Characteristic line intensities are fixed rather than computed from K-shell ionisation cross-section
- The 10-bin coarse spectrum (`FastSpectrum`) is a PenOpt addition, not from the literature
- No self-filtration or inherent filtration modelling (beryllium window, oil, etc.)
- Spectral validation against published Tucker/Boone spectra has not been performed
