package physics

import (
	"math"
	"testing"
)

func TestLogLogInterp_ExactMatch(t *testing.T) {
	pts := []MuRhoPoint{
		{Energy: 30, MuRho: 0.600},
		{Energy: 50, MuRho: 0.278},
		{Energy: 80, MuRho: 0.202},
	}
	got := LogLogInterp(30, pts)
	if math.Abs(got-0.600) > 1e-6 {
		t.Errorf("LogLogInterp(30) = %v, want 0.600", got)
	}
}

func TestLogLogInterp_BelowRange(t *testing.T) {
	pts := []MuRhoPoint{
		{Energy: 30, MuRho: 0.600},
		{Energy: 50, MuRho: 0.278},
	}
	got := LogLogInterp(10, pts)
	if math.Abs(got-0.600) > 1e-6 {
		t.Errorf("LogLogInterp(10, below range) = %v, want 0.600", got)
	}
}

func TestLogLogInterp_AboveRange(t *testing.T) {
	pts := []MuRhoPoint{
		{Energy: 30, MuRho: 0.600},
		{Energy: 50, MuRho: 0.278},
	}
	got := LogLogInterp(100, pts)
	if math.Abs(got-0.278) > 1e-6 {
		t.Errorf("LogLogInterp(100, above range) = %v, want 0.278", got)
	}
}

func TestLogLogInterp_Empty(t *testing.T) {
	got := LogLogInterp(50, []MuRhoPoint{})
	if got != 0 {
		t.Errorf("LogLogInterp(empty) = %v, want 0", got)
	}
}

func TestCalcMu(t *testing.T) {
	mat := Material{ID: "al", Name: "Aluminum", Rho: 2.70,
		Data: []MuRhoPoint{{Energy: 30, MuRho: 0.600}, {Energy: 50, MuRho: 0.278}},
	}
	mu := CalcMu(mat, 30)
	// mu = muRho * rho = 0.600 * 2.70 = 1.62
	if math.Abs(mu-1.62) > 1e-6 {
		t.Errorf("CalcMu(Al, 30keV) = %v, want 1.62", mu)
	}
}

func TestCalcTransmission(t *testing.T) {
	// T = exp(-mu * x/10) where mu is cm^-1, x is mm
	// mu=1, x=10mm -> T = exp(-1 * 1) = 0.3679
	T := CalcTransmission(1.0, 10.0)
	if math.Abs(T-0.367879) > 1e-4 {
		t.Errorf("CalcTransmission(1, 10) = %v, want ~0.3679", T)
	}
}

func TestCalcTMm(t *testing.T) {
	// T = exp(-mu * x/10) -> x = -ln(T) / mu * 10
	// mu=1, T=0.5 -> x = -ln(0.5) / 1 * 10 = 6.931
	x := CalcTMm(1.0, 0.5)
	if math.Abs(x-6.93147) > 1e-3 {
		t.Errorf("CalcTMm(1, 0.5) = %v, want ~6.931", x)
	}
}

func TestMaterialByID_Found(t *testing.T) {
	m, ok := MaterialByID("al")
	if !ok {
		t.Fatal("MaterialByID('al') should find Aluminium")
	}
	if m.Name != "Aluminum" {
		t.Errorf("got name %q, want 'Aluminum'", m.Name)
	}
}

func TestMaterialByID_NotFound(t *testing.T) {
	_, ok := MaterialByID("nonexistent")
	if ok {
		t.Error("MaterialByID('nonexistent') should return false")
	}
}

func TestFmtPenetration(t *testing.T) {
	cases := []struct {
		mm   float64
		want string
	}{
		{5.2, "5.2 mm"},
		{150, "150 mm"},
		{150.0, "150 mm"},
		{1500, "1.50 m"},
		{10000, ">10 m"},
	}
	for _, c := range cases {
		got := FmtPenetration(c.mm)
		if got != c.want {
			t.Errorf("FmtPenetration(%v) = %q, want %q", c.mm, got, c.want)
		}
	}
}
