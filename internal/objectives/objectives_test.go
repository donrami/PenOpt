package objectives

import (
	"math"
	"testing"
)

func TestFMtl_AllZeros(t *testing.T) {
	lengths := []float64{0, 0, 0, 0}
	got := FMtl(lengths, 3)
	if got != 0 {
		t.Errorf("FMtl(all zeros) = %v, want 0", got)
	}
}

func TestFMtl_Identical(t *testing.T) {
	lengths := []float64{10, 10, 10, 10}
	got := FMtl(lengths, 3)
	if math.Abs(got-10) > 1e-10 {
		t.Errorf("FMtl(identical) = %v, want 10", got)
	}
}

func TestFMtl_OrderInvariant(t *testing.T) {
	a := FMtl([]float64{1, 2, 3, 4, 5}, 3)
	b := FMtl([]float64{5, 4, 3, 2, 1}, 3)
	if math.Abs(a-b) > 1e-10 {
		t.Errorf("FMtl not order-invariant: %v vs %v", a, b)
	}
}

func TestFEnergy(t *testing.T) {
	cases := []struct {
		vals []float64
		want float64
	}{
		{[]float64{1, 5, 3, 2}, 5},
		{[]float64{0, 0, 0}, 0},
		{[]float64{-1, -5, -3}, 0}, // current behavior: max starts at 0, so negatives don't change it
		{[]float64{100}, 100},
	}
	for _, c := range cases {
		got := FEnergy(c.vals)
		if got != c.want {
			t.Errorf("FEnergy(%v) = %v, want %v", c.vals, got, c.want)
		}
	}
}

func TestFHdn(t *testing.T) {
	cases := []struct {
		vals []float64
		want float64
	}{
		{[]float64{1, 5, 3}, 4},
		{[]float64{10, 10, 10}, 0},
		{[]float64{}, 0},
	}
	for _, c := range cases {
		got := FHdn(c.vals)
		if got != c.want {
			t.Errorf("FHdn(%v) = %v, want %v", c.vals, got, c.want)
		}
	}
}

func TestNormalize(t *testing.T) {
	got := Normalize([]float64{1, 3, 5})
	want := []float64{0, 0.5, 1}
	for i := range got {
		if math.Abs(got[i]-want[i]) > 1e-10 {
			t.Errorf("Normalize[%d] = %v, want %v", i, got[i], want[i])
		}
	}
}

func TestNormalize_AllEqual(t *testing.T) {
	got := Normalize([]float64{5, 5, 5})
	if len(got) != 3 {
		t.Fatal("expected 3 results")
	}
	for i, v := range got {
		if v != 0 {
			t.Errorf("Normalize[%d] on equal vals = %v, want 0", i, v)
		}
	}
}

func TestFTuy_Inversion(t *testing.T) {
	input := []float64{1.0, 0.8, 0.5, 0.0}
	got := FTuy(input)
	want := []float64{0.0, 0.2, 0.5, 1.0}
	for i := range got {
		if math.Abs(got[i]-want[i]) > 1e-10 {
			t.Errorf("FTuy[%d] = %v, want %v", i, got[i], want[i])
		}
	}
}

func TestFMtl_KnownGeometry(t *testing.T) {
	// For a perfect parallel beam through a 100mm cube face-on,
	// every ray penetrates exactly 100mm. fMtl (m=3) = 100mm.
	lengths := make([]float64, 64)
	for i := range lengths {
		lengths[i] = 100.0
	}
	got := FMtl(lengths, 3)
	if math.Abs(got-100.0) > 0.01 {
		t.Errorf("FMtl(all 100mm) = %.4f, want 100.0", got)
	}
}

func TestCombinedScore_Weighted(t *testing.T) {
	fMtl := []float64{1, 2, 3}
	fEnergy := []float64{4, 5, 6}
	fHdn := []float64{7, 8, 9}
	fTuy := []float64{0.9, 0.8, 0.7}
	fBh := []float64{0.1, 0.2, 0.3}
	scores := CombinedScore(fMtl, fEnergy, fHdn, fTuy, fBh, 0.4, 0.3, 0.15, 0.1, 0.05, "weighted")
	if len(scores) != 3 {
		t.Fatalf("expected 3 scores, got %d", len(scores))
	}
	// Check scores are in [0,1.0]
	for i, s := range scores {
		if s < 0 || s > 1.0+1e-10 {
			t.Errorf("score[%d] = %v, outside [0,1]", i, s)
		}
	}
}

func TestCombinedScore_Minimax(t *testing.T) {
	fMtl := []float64{1, 2, 3}
	fEnergy := []float64{4, 5, 6}
	fHdn := []float64{7, 8, 9}
	fTuy := []float64{0.9, 0.8, 0.7}
	fBh := []float64{0.1, 0.2, 0.3}
	scores := CombinedScore(fMtl, fEnergy, fHdn, fTuy, fBh, 0.4, 0.3, 0.15, 0.1, 0.05, "minimax")
	if len(scores) != 3 {
		t.Fatalf("expected 3 scores, got %d", len(scores))
	}
}
