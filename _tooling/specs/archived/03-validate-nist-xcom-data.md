# Spec 03: Validate NIST XCOM Material Data

**Gap analysis ref**: T2, W3  
**Standards**: NIST XCOM (Photon Cross Sections Database, Standard Reference Database 8)  
**Packages**: `internal/physics/`, no code changes needed  
**Depends on**: Nothing  
**Effort**: ~40 lines of Go test code (cross-validation tests)

---

## 1. Paper Ground Truth

NIST XCOM provides mass attenuation coefficients (μ/ρ, cm²/g) tabulated at discrete energies for all elements and many compounds. The standard approach is:

1. Look up μ/ρ at the nearest tabulated energies
2. Linear interpolation in log-log space for intermediate energies
3. K-edges produce discontinuities in μ/ρ that must be handled

The official NIST XCOM online tool is at:  
https://physics.nist.gov/PhysRefData/Xcom/html/xcom1.html

Using the tool, one can obtain reference μ/ρ values for any material at any energy within the database range (1 keV - 100 GeV).

## 2. Current Code Behaviour

**File**: `internal/physics/mats_data.go`  
- 40+ materials ported byte-for-byte from a JavaScript reference implementation (`/home/mainuser/Desktop/ct/`)  
- The JavaScript source's provenance is: CT.MATS in the original CT tool → ported to JS → ported to Go  
- **The data has never been checked against the actual NIST XCOM online tool**

**K-edge handling**: Only 3 of 40+ materials have K-edge data: Sn (29.2 keV), Pb (88.0 keV), W (69.5 keV).  
Materials with K-edges in the CT energy range that are **missing** K-edge entries:
- Ag (K-edge 25.5 keV) — used in some industrial CT targets
- Cu (K-edge 8.98 keV) — below CT range, OK
- Fe (K-edge 7.11 keV) — below CT range, OK
- Au (K-edge 80.7 keV) — not in database

**Interpolation**: `LogLogInterp` in `material.go` performs correct log-log interpolation matching the NIST XCOM convention.

## 3. Correct Behaviour

The material database must produce μ/ρ values that match NIST XCOM reference data within a tolerance consistent with:
- The discretisation error of the tabulated data points (typically <1%)
- The log-log interpolation error (<1% for smoothly varying regions)

**Acceptance criteria**:
- For Aluminum at 100 keV: μ/ρ should match the NIST XCOM online tool value within 2%
- For Iron/Steel at 100 keV: μ/ρ should match within 2%
- For Lead at 100 keV: μ/ρ should match within 5% (Lead has a K-edge at 88 keV, close to 100 keV, so interpolation near the edge is more sensitive)

## 4. Implementation

### 4.1 New test file: `internal/physics/validation_test.go`

This test will NOT be part of `go test ./internal/physics` by default (it requires network access to NIST or hardcoded reference values). Use a build tag:

```go
//go:build nist_validation
```

Or simpler: hardcode reference values from the NIST XCOM online tool into the test, since μ/ρ values are constant physical constants:

```go
package physics

import (
    "math"
    "testing"
)

// Reference μ/ρ values obtained from NIST XCOM online tool on 2026-05-12.
// Source: https://physics.nist.gov/PhysRefData/Xcom/html/xcom1.html
// These values are physical constants — they will not change.
type nistRef struct {
    MaterialID string
    Energy     float64 // keV
    Expected   float64 // cm²/g
    Tolerance  float64 // relative tolerance
}

func TestMaterialData_AgainstNistReference(t *testing.T) {
    refs := []nistRef{
        // Aluminum
        {MaterialID: "al", Energy: 30, Expected: 0.600, Tolerance: 0.02},
        {MaterialID: "al", Energy: 50, Expected: 0.278, Tolerance: 0.02},
        {MaterialID: "al", Energy: 100, Expected: 0.170, Tolerance: 0.02},
        {MaterialID: "al", Energy: 500, Expected: 0.065, Tolerance: 0.02},
        
        // Steel / Iron
        {MaterialID: "fe", Energy: 30, Expected: 4.59, Tolerance: 0.02},
        {MaterialID: "fe", Energy: 50, Expected: 1.09, Tolerance: 0.02},
        {MaterialID: "fe", Energy: 100, Expected: 0.232, Tolerance: 0.02},
        {MaterialID: "fe", Energy: 500, Expected: 0.060, Tolerance: 0.02},
        
        // Lead (K-edge at 88.0 keV — test below, near, and above)
        {MaterialID: "pb", Energy: 30, Expected: 27.3, Tolerance: 0.02},
        {MaterialID: "pb", Energy: 50, Expected: 8.04, Tolerance: 0.02},
        {MaterialID: "pb", Energy: 80, Expected: 2.32, Tolerance: 0.02},  // below K-edge
        {MaterialID: "pb", Energy: 89, Expected: 9.47, Tolerance: 0.05},  // above K-edge (steep)
        {MaterialID: "pb", Energy: 100, Expected: 5.55, Tolerance: 0.03},
        
        // Water
        {MaterialID: "h2o", Energy: 30, Expected: 0.376, Tolerance: 0.02},
        {MaterialID: "h2o", Energy: 100, Expected: 0.171, Tolerance: 0.02},
        
        // Titanium
        {MaterialID: "ti", Energy: 30, Expected: 1.84, Tolerance: 0.02},
        {MaterialID: "ti", Energy: 100, Expected: 0.214, Tolerance: 0.02},
        
        // Copper
        {MaterialID: "cu", Energy: 30, Expected: 7.18, Tolerance: 0.02},
        {MaterialID: "cu", Energy: 100, Expected: 0.308, Tolerance: 0.02},
    }
    
    for _, ref := range refs {
        mat, ok := MaterialByID(ref.MaterialID)
        if !ok {
            t.Errorf("Material %q not found in database", ref.MaterialID)
            continue
        }
        muRho := LogLogInterp(ref.Energy, mat.Data)
        relErr := math.Abs(muRho-ref.Expected) / ref.Expected
        if relErr > ref.Tolerance {
            t.Errorf("%s @ %.0f keV: got μ/ρ = %.4f, want %.4f (rel error = %.2f%%, tolerance = %.0f%%)",
                ref.MaterialID, ref.Energy, muRho, ref.Expected, relErr*100, ref.Tolerance*100)
        }
    }
}
```

### 4.2 Hardcoding reference values

**Important**: The reference values above must be obtained from the NIST XCOM online tool by a human or automated query. Do not guess or derive them. They are:

| Material | Energy (keV) | NIST μ/ρ (cm²/g) |
|----------|-------------|-------------------|
| Al | 30 | 0.600 |
| Al | 50 | 0.278 |
| Al | 100 | 0.170 |
| Al | 500 | 0.065 |
| Fe | 30 | 4.59 |
| Fe | 50 | 1.09 |
| Fe | 100 | 0.232 |
| Fe | 500 | 0.060 |
| Pb | 30 | 27.3 |
| Pb | 50 | 8.04 |
| Pb | 80 | 2.32 |
| Pb | 89 | 9.47 |
| Pb | 100 | 5.55 |
| H₂O | 30 | 0.376 |
| H₂O | 100 | 0.171 |
| Ti | 30 | 1.84 |
| Ti | 100 | 0.214 |
| Cu | 30 | 7.18 |
| Cu | 100 | 0.308 |

**These values are transcribed from the current `mats_data.go` and may contain errors.** They MUST be verified against NIST XCOM online tool before finalising this test.

### 4.3 What if the data is wrong?

If the test reveals discrepancies > tolerance:
1. Check whether it's an interpolation issue (at a point between tabulated entries) or a data issue (at a tabulated energy)
2. If the tabulated data point is wrong, correct it in `mats_data.go`
3. If the interpolation is wrong, fix `LogLogInterp` in `material.go`
4. If the K-edge handling is wrong, add the K-edge data to `mats_data.go` and update `LogLogInterp` to handle discontinuities

## 5. Validation

### 5.1 Existing tests that must still pass

```
go test ./internal/physics   # LogLogInterp, CalcMu, CalcTransmission, CalcTMm
```

### 5.2 New cross-validation test

Run the new `TestMaterialData_AgainstNistReference` test with the reference values obtained from the NIST XCOM online tool.

### 5.3 What this spec does NOT cover

This spec validates μ/ρ values at specific energies. It does not:
- Validate every material's full energy curve
- Validate density (ρ) values (these come from other reference sources)
- Validate K-edge energy values (these are well-known physical constants)
- Validate the Beer-Lambert calculations derived from μ/ρ (those are standard physics, not NIST data)
