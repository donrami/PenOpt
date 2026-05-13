package physics

import (
	"math"
	"testing"
)

// Reference μ/ρ values from the current mats_data.go database.
// These transcribe the tabulated data points — they test internal self-consistency.
// TODO: Verify against actual NIST XCOM online tool values
// (https://physics.nist.gov/PhysRefData/Xcom/html/xcom1.html)
// to catch transcription errors from the original JS port.
type nistRef struct {
	MaterialID string
	Energy     float64 // keV
	Expected   float64 // cm²/g
	Tolerance  float64 // relative tolerance
}

func TestMaterialData_AgainstNistReference(t *testing.T) {
	refs := []nistRef{
		// Aluminum (Al)
		{MaterialID: "al", Energy: 30, Expected: 0.600, Tolerance: 0.001},  // exact tabulated
		{MaterialID: "al", Energy: 50, Expected: 0.278, Tolerance: 0.001},  // exact tabulated
		{MaterialID: "al", Energy: 100, Expected: 0.170, Tolerance: 0.001}, // exact tabulated
		{MaterialID: "al", Energy: 150, Expected: 0.128, Tolerance: 0.001}, // exact tabulated
		{MaterialID: "al", Energy: 500, Expected: 0.065, Tolerance: 0.001}, // exact tabulated

		// Steel / Iron (Fe)
		{MaterialID: "fe", Energy: 30, Expected: 4.59, Tolerance: 0.001}, // exact tabulated
		{MaterialID: "fe", Energy: 50, Expected: 1.09, Tolerance: 0.001}, // exact tabulated
		{MaterialID: "fe", Energy: 80, Expected: 0.350, Tolerance: 0.001},
		{MaterialID: "fe", Energy: 100, Expected: 0.232, Tolerance: 0.001}, // exact tabulated
		{MaterialID: "fe", Energy: 500, Expected: 0.060, Tolerance: 0.001}, // exact tabulated

		// Lead (Pb) — K-edge at 88.0 keV
		{MaterialID: "pb", Energy: 30, Expected: 27.3, Tolerance: 0.001},   // exact tabulated, below K-edge
		{MaterialID: "pb", Energy: 50, Expected: 8.04, Tolerance: 0.001},   // exact tabulated, below K-edge
		{MaterialID: "pb", Energy: 80, Expected: 2.32, Tolerance: 0.001},   // exact tabulated, below K-edge
		{MaterialID: "pb", Energy: 87, Expected: 1.94, Tolerance: 0.001},   // exact tabulated, just below K-edge
		{MaterialID: "pb", Energy: 89, Expected: 9.47, Tolerance: 0.001},   // exact tabulated, just above K-edge
		{MaterialID: "pb", Energy: 100, Expected: 5.55, Tolerance: 0.001},  // exact tabulated, above K-edge
		{MaterialID: "pb", Energy: 500, Expected: 0.118, Tolerance: 0.001}, // exact tabulated, above K-edge

		// Water (H2O)
		{MaterialID: "h2o", Energy: 30, Expected: 0.376, Tolerance: 0.001},  // exact tabulated
		{MaterialID: "h2o", Energy: 100, Expected: 0.171, Tolerance: 0.001}, // exact tabulated

		// Titanium (Ti)
		{MaterialID: "ti", Energy: 30, Expected: 1.84, Tolerance: 0.001},  // exact tabulated
		{MaterialID: "ti", Energy: 100, Expected: 0.214, Tolerance: 0.001}, // exact tabulated

		// Copper (Cu)
		{MaterialID: "cu", Energy: 30, Expected: 7.18, Tolerance: 0.001},  // exact tabulated
		{MaterialID: "cu", Energy: 100, Expected: 0.308, Tolerance: 0.001}, // exact tabulated
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
			t.Errorf("%s @ %.0f keV: got μ/ρ = %.4f, want %.4f (rel error = %.2f%%, tolerance = %.1f%%)",
				ref.MaterialID, ref.Energy, muRho, ref.Expected, relErr*100, ref.Tolerance*100)
		}
	}
}

// TestMaterialData_KEdge ensures K-edge transitions are present for the three
// materials that have them. The K-edge causes a discrete jump in μ/ρ at the
// edge energy — values just above the edge are higher than just below.
func TestMaterialData_KEdge(t *testing.T) {
	tests := []struct {
		MaterialID string
		KEdge      float64 // keV
		BelowKE    float64 // energy (keV) just below the K-edge (0 = no data)
		AboveKE    float64 // energy (keV) just above the K-edge (0 = no data)
	}{
		// Sn: K-edge at 29.2 keV. Lowest data point is 30 keV (above edge).
		// No below-edge data available, so only verify KEdge field.
		{MaterialID: "sn", KEdge: 29.2, BelowKE: 0, AboveKE: 0},
		// Pb: K-edge at 88.0 keV. Data at 87 keV (below) and 89 keV (above).
		{MaterialID: "pb", KEdge: 88.0, BelowKE: 87, AboveKE: 89},
		// W: K-edge at 69.5 keV. Data at 68 keV (below) and 70 keV (above).
		{MaterialID: "w", KEdge: 69.5, BelowKE: 68, AboveKE: 70},
	}

	for _, tt := range tests {
		mat, ok := MaterialByID(tt.MaterialID)
		if !ok {
			t.Errorf("Material %q not found", tt.MaterialID)
			continue
		}
		if mat.KEdge != tt.KEdge {
			t.Errorf("%s: expected KEdge = %.1f keV, got %.1f", tt.MaterialID, tt.KEdge, mat.KEdge)
		}

		// For materials with data on both sides of the K-edge, verify the jump
		if tt.BelowKE > 0 && tt.AboveKE > 0 {
			muBelow := LogLogInterp(tt.BelowKE, mat.Data)
			muAbove := LogLogInterp(tt.AboveKE, mat.Data)
			if muAbove <= muBelow {
				t.Errorf("%s: K-edge discontinuity — μ/ρ at %.0f keV (above edge) = %.4f should be > μ/ρ at %.0f keV (below edge) = %.4f",
					tt.MaterialID, tt.AboveKE, muAbove, tt.BelowKE, muBelow)
			}
		}
	}
}

// TestMaterialData_InterpConsistency checks that interpolation between tabulated
// points produces values bounded by the endpoints (typically true for smooth
// regions away from K-edges).
func TestMaterialData_InterpConsistency(t *testing.T) {
	mats := []string{"al", "fe", "h2o", "ti", "cu", "mg", "si", "ni", "zn"}

	for _, id := range mats {
		mat, ok := MaterialByID(id)
		if !ok {
			t.Errorf("Material %q not found", id)
			continue
		}
		for i := 0; i < len(mat.Data)-1; i++ {
			e0 := mat.Data[i].Energy
			e1 := mat.Data[i+1].Energy
			eMid := (e0 + e1) / 2.0
			muMid := LogLogInterp(eMid, mat.Data)
			mu0 := mat.Data[i].MuRho
			mu1 := mat.Data[i+1].MuRho

			// In smoothly decreasing regions, material attenuation decreases
			// monotonically with energy (away from K-edges). Interpolated
			// values should lie between endpoints.
			if muMid < math.Min(mu0, mu1) || muMid > math.Max(mu0, mu1) {
				// This can happen near K-edges (Pb, Sn, W — skip those)
				if id != "pb" && id != "sn" && id != "w" {
					t.Errorf("%s: interpolated μ/ρ at %.1f keV = %.4f, outside [%.4f, %.4f]",
						id, eMid, muMid, math.Min(mu0, mu1), math.Max(mu0, mu1))
				}
			}
		}
	}
}
