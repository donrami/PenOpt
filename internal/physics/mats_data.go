package physics

// mats is the NIST XCOM material database. Ported from JS CT.MATS.
var mats = []Material{
	{ID: "h2o", Name: "Water", Cat: "N", Rho: 1.00, Color: "#38BDF8",
		Data: pts(30, .376, 50, .227, 80, .184, 100, .171, 150, .151, 200, .137, 300, .119, 400, .106, 500, .097)},
	{ID: "pmma", Name: "PMMA", Cat: "N", Rho: 1.18, Color: "#38BDF8",
		Data: pts(30, .378, 50, .229, 80, .185, 100, .172, 150, .152, 200, .138, 300, .120, 400, .107, 500, .098)},
	{ID: "ptfe", Name: "PTFE", Cat: "N", Rho: 2.16, Color: "#38BDF8",
		Data: pts(30, .616, 50, .309, 80, .218, 100, .192, 150, .163, 200, .143, 300, .121, 400, .108, 500, .098)},
	{ID: "pc", Name: "Polycarbonate", Cat: "N", Rho: 1.20, Color: "#38BDF8",
		Data: pts(30, .377, 50, .228, 80, .185, 100, .172, 150, .152, 200, .138, 300, .120, 400, .107, 500, .098)},
	{ID: "pom", Name: "POM / Delrin", Cat: "N", Rho: 1.42, Color: "#38BDF8",
		Data: pts(30, .398, 50, .237, 80, .188, 100, .174, 150, .153, 200, .138, 300, .119, 400, .106, 500, .097)},
	{ID: "cfrp", Name: "Carbon Fiber", Cat: "N", Rho: 1.80, Color: "#60A5FA",
		Data: pts(30, .305, 50, .188, 80, .161, 100, .151, 150, .136, 200, .124, 300, .108, 400, .097, 500, .089)},
	{ID: "gls", Name: "Glass", Cat: "N", Rho: 2.50, Color: "#818CF8",
		Data: pts(30, .476, 50, .257, 80, .195, 100, .175, 150, .151, 200, .135, 300, .115, 400, .103, 500, .094)},
	{ID: "conc", Name: "Concrete", Cat: "N", Rho: 2.30, Color: "#818CF8",
		Data: pts(30, .452, 50, .247, 80, .192, 100, .173, 150, .150, 200, .135, 300, .115, 400, .103, 500, .094)},
	{ID: "al2o3", Name: "Ceramic Al2O3", Cat: "N", Rho: 3.97, Color: "#A78BFA",
		Data: pts(30, .577, 50, .272, 80, .199, 100, .176, 150, .149, 200, .131, 300, .110, 400, .098, 500, .090)},
	{ID: "mg", Name: "Magnesium", Cat: "M", Rho: 1.74, Color: "#4ADE80",
		Data: pts(30, .467, 50, .245, 80, .184, 100, .163, 150, .134, 200, .117, 300, .094, 400, .082, 500, .074)},
	{ID: "al", Name: "Aluminum", Cat: "M", Rho: 2.70, Color: "#4ADE80",
		Data: pts(30, .600, 50, .278, 80, .202, 100, .170, 150, .128, 200, .107, 300, .084, 400, .073, 500, .065)},
	{ID: "si", Name: "Silicon", Cat: "M", Rho: 2.33, Color: "#4ADE80",
		Data: pts(30, .643, 50, .295, 80, .209, 100, .174, 150, .131, 200, .109, 300, .086, 400, .074, 500, .066)},
	{ID: "ti", Name: "Titanium", Cat: "M", Rho: 4.51, Color: "#FDE047",
		Data: pts(30, 1.84, 50, .612, 80, .261, 100, .214, 150, .152, 200, .122, 300, .092, 400, .079, 500, .072)},
	{ID: "fe", Name: "Steel / Iron", Cat: "M", Rho: 7.87, Color: "#FB923C",
		Data: pts(30, 4.59, 50, 1.09, 80, .350, 100, .232, 150, .143, 200, .110, 300, .081, 400, .067, 500, .060)},
	{ID: "ni", Name: "Nickel", Cat: "M", Rho: 8.90, Color: "#FB923C",
		Data: pts(30, 6.25, 50, 1.46, 80, .425, 100, .281, 150, .156, 200, .115, 300, .083, 400, .068, 500, .060)},
	{ID: "cu", Name: "Copper", Cat: "M", Rho: 8.96, Color: "#F97316",
		Data: pts(30, 7.18, 50, 1.65, 80, .470, 100, .308, 150, .163, 200, .118, 300, .083, 400, .068, 500, .060)},
	{ID: "zn", Name: "Zinc", Cat: "M", Rho: 7.13, Color: "#F97316",
		Data: pts(30, 8.30, 50, 1.90, 80, .528, 100, .340, 150, .172, 200, .121, 300, .084, 400, .068, 500, .060)},
	{ID: "sn", Name: "Tin", Cat: "M", Rho: 7.31, Color: "#EF4444", KEdge: 29.2,
		Data: pts(30, 7.71, 50, 3.35, 80, 1.19, 100, .765, 150, .285, 200, .154, 300, .085, 400, .067, 500, .058)},
	{ID: "pb", Name: "Lead", Cat: "M", Rho: 11.35, Color: "#EF4444", KEdge: 88.0,
		Data: pts(30, 27.3, 50, 8.04, 80, 2.32, 87, 1.94, 89, 9.47, 100, 5.55, 150, 2.24, 200, 1.02, 300, .371, 400, .188, 500, .118)},
	{ID: "w", Name: "Tungsten", Cat: "M", Rho: 19.30, Color: "#DC2626", KEdge: 69.5,
		Data: pts(30, 16.2, 50, 5.31, 68, 2.13, 70, 8.48, 80, 6.60, 100, 4.44, 150, 1.59, 200, .741, 300, .265, 400, .141, 500, .096)},

	// ── Additive Manufacturing: Polymers ──
	{ID: "pla", Name: "PLA", Cat: "N", Rho: 1.24, Color: "#38BDF8",
		Data: pts(30, 0.316, 50, 0.207, 80, 0.172, 100, 0.161, 150, 0.143, 200, 0.130, 300, 0.113, 400, 0.101, 500, 0.092)},
	{ID: "abs", Name: "ABS", Cat: "N", Rho: 1.04, Color: "#38BDF8",
		Data: pts(30, 0.268, 50, 0.200, 80, 0.173, 100, 0.163, 150, 0.145, 200, 0.133, 300, 0.115, 400, 0.103, 500, 0.094)},
	{ID: "petg", Name: "PETG", Cat: "N", Rho: 1.27, Color: "#38BDF8",
		Data: pts(30, 0.301, 50, 0.202, 80, 0.169, 100, 0.159, 150, 0.141, 200, 0.128, 300, 0.111, 400, 0.099, 500, 0.091)},
	{ID: "pa6", Name: "Nylon 6 (PA6)", Cat: "N", Rho: 1.13, Color: "#38BDF8",
		Data: pts(30, 0.290, 50, 0.207, 80, 0.177, 100, 0.166, 150, 0.148, 200, 0.135, 300, 0.117, 400, 0.105, 500, 0.096)},
	{ID: "nylon12", Name: "Nylon 12 (PA12)", Cat: "N", Rho: 1.01, Color: "#38BDF8",
		Data: pts(30, 0.281, 50, 0.207, 80, 0.179, 100, 0.169, 150, 0.150, 200, 0.137, 300, 0.119, 400, 0.107, 500, 0.097)},
	{ID: "pp", Name: "Polypropylene", Cat: "N", Rho: 0.90, Color: "#38BDF8",
		Data: pts(30, 0.271, 50, 0.208, 80, 0.182, 100, 0.172, 150, 0.153, 200, 0.140, 300, 0.122, 400, 0.109, 500, 0.099)},
	{ID: "hips", Name: "HIPS", Cat: "N", Rho: 1.04, Color: "#38BDF8",
		Data: pts(30, 0.264, 50, 0.199, 80, 0.172, 100, 0.162, 150, 0.145, 200, 0.132, 300, 0.115, 400, 0.103, 500, 0.094)},
	{ID: "peek", Name: "PEEK", Cat: "N", Rho: 1.30, Color: "#38BDF8",
		Data: pts(30, 0.281, 50, 0.198, 80, 0.168, 100, 0.158, 150, 0.140, 200, 0.128, 300, 0.111, 400, 0.099, 500, 0.091)},
	{ID: "tresin", Name: "Tough Resin", Cat: "N", Rho: 1.20, Color: "#38BDF8",
		Data: pts(30, 0.298, 50, 0.205, 80, 0.174, 100, 0.163, 150, 0.144, 200, 0.132, 300, 0.114, 400, 0.102, 500, 0.093)},

	// ── AM: Metal Alloys ──
	{ID: "ti64", Name: "Ti-6Al-4V", Cat: "M", Rho: 4.43, Color: "#FDE047",
		Data: pts(30, 4.765, 50, 1.168, 80, 0.394, 100, 0.267, 150, 0.163, 200, 0.131, 300, 0.104, 400, 0.091, 500, 0.082)},
	{ID: "alsi10mg", Name: "AlSi10Mg", Cat: "M", Rho: 2.68, Color: "#4ADE80",
		Data: pts(30, 1.157, 50, 0.375, 80, 0.204, 100, 0.172, 150, 0.138, 200, 0.123, 300, 0.105, 400, 0.093, 500, 0.085)},
	{ID: "ss316l", Name: "SS316L", Cat: "M", Rho: 7.99, Color: "#FB923C",
		Data: pts(30, 9.649, 50, 2.313, 80, 0.680, 100, 0.409, 150, 0.208, 200, 0.150, 300, 0.111, 400, 0.095, 500, 0.084)},
	{ID: "in718", Name: "Inconel 718", Cat: "M", Rho: 8.19, Color: "#FB923C",
		Data: pts(30, 10.005, 50, 2.412, 80, 0.715, 100, 0.434, 150, 0.216, 200, 0.155, 300, 0.113, 400, 0.096, 500, 0.086)},
	{ID: "cocr", Name: "CoCr Alloy", Cat: "M", Rho: 8.30, Color: "#FB923C",
		Data: pts(30, 10.117, 50, 2.455, 80, 0.728, 100, 0.442, 150, 0.217, 200, 0.154, 300, 0.111, 400, 0.094, 500, 0.084)},
	{ID: "maraging", Name: "Maraging Steel", Cat: "M", Rho: 8.10, Color: "#FB923C",
		Data: pts(30, 10.220, 50, 2.448, 80, 0.714, 100, 0.427, 150, 0.213, 200, 0.153, 300, 0.112, 400, 0.095, 500, 0.085)},
	{ID: "h13", Name: "H13 Tool Steel", Cat: "M", Rho: 7.80, Color: "#FB923C",
		Data: pts(30, 9.385, 50, 2.244, 80, 0.656, 100, 0.393, 150, 0.201, 200, 0.146, 300, 0.108, 400, 0.092, 500, 0.082)},
	{ID: "bronze", Name: "Bronze", Cat: "M", Rho: 8.80, Color: "#F97316",
		Data: pts(30, 12.168, 50, 2.897, 80, 0.835, 100, 0.494, 150, 0.237, 200, 0.166, 300, 0.120, 400, 0.101, 500, 0.090)},

	// ── AM: Composites ──
	{ID: "cfrnylon", Name: "CFR Nylon", Cat: "N", Rho: 1.20, Color: "#60A5FA",
		Data: pts(30, 0.283, 50, 0.203, 80, 0.174, 100, 0.163, 150, 0.145, 200, 0.132, 300, 0.115, 400, 0.103, 500, 0.094)},
}

// filterMats is the filter material database (Cu, Zn).
var filterMats = map[string]Material{
	"cu": {ID: "cu", Name: "Copper", Rho: 8.96,
		Data: pts(30, 7.18, 50, 1.65, 80, .470, 100, .308, 150, .163, 200, .118, 300, .083, 400, .067, 500, .060)},
	"zn": {ID: "zn", Name: "Zinc", Rho: 7.13,
		Data: pts(30, 8.30, 50, 1.90, 80, .528, 100, .340, 150, .172, 200, .121, 300, .085, 400, .068, 500, .060)},
}

// filters is the beam pre-filter preset list.
var filters = []Filter{
	{ID: "none", Name: "No filter", Icon: "O", Desc: "Unfiltered beam", Layers: nil},
	{ID: "cu05", Name: "Cu 0.5 mm", Icon: "Cu", Desc: "Soft artefact reduction", Layers: []FilterLayer{{Mat: "cu", MM: 0.5}}},
	{ID: "cu10", Name: "Cu 1.0 mm", Icon: "Cu", Desc: "Strong hardening", Layers: []FilterLayer{{Mat: "cu", MM: 1.0}}},
	{ID: "zn05", Name: "Zn 0.5 mm", Icon: "Zn", Desc: "K-edge 9.7 keV", Layers: []FilterLayer{{Mat: "zn", MM: 0.5}}},
	{ID: "zn10", Name: "Zn 1.0 mm", Icon: "Zn", Desc: "Moderate hardening", Layers: []FilterLayer{{Mat: "zn", MM: 1.0}}},
	{ID: "cu05zn05", Name: "Cu+Zn 0.5+0.5", Icon: "Cu+Zn", Desc: "Compound filter", Layers: []FilterLayer{{Mat: "cu", MM: 0.5}, {Mat: "zn", MM: 0.5}}},
	{ID: "cu10zn05", Name: "Cu+Zn 1.0+0.5", Icon: "Cu+Zn", Desc: "Max hardening", Layers: []FilterLayer{{Mat: "cu", MM: 1.0}, {Mat: "zn", MM: 0.5}}},
	{ID: "cu10zn10", Name: "Cu+Zn 1.0+1.0", Icon: "Cu+Zn", Desc: "Extreme filter", Layers: []FilterLayer{{Mat: "cu", MM: 1.0}, {Mat: "zn", MM: 1.0}}},
}

// pts is a helper to build []MuRhoPoint from alternating (energy, muRho) pairs.
func pts(pairs ...float64) []MuRhoPoint {
	n := len(pairs) / 2
	out := make([]MuRhoPoint, n)
	for i := range n {
		out[i] = MuRhoPoint{Energy: pairs[2*i], MuRho: pairs[2*i+1]}
	}
	return out
}
