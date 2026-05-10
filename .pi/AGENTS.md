# PenOpt — Project Context

## Agent Rules

- **Never estimate completion times.** When creating software implementation plans (task breakdowns, timelines, milestones, or any form of planning), do NOT include estimated durations, time estimates, point estimates, or completion deadlines. Plans must describe what needs to be done and in what order, but without any time-based projections.

## Stack

- **Backend**: Go 1.23 + Wails v2.12
- **Frontend**: Vanilla JavaScript + Three.js (r184) + three-mesh-bvh
- **Build tool**: Vite 3 (frontend), Wails CLI (full app)
- **Platform**: Desktop (cross-platform via Wails/WebView2)

## Project Structure

```
penopt/
├── main.go                          # Wails entry point, asset embedding
├── app.go                           # App bindings (13 methods + types)
├── wails.json                       # Wails project config
├── go.mod / go.sum                  # Go module
├── internal/
│   ├── mesh/                        # Vec3, Triangle, Mesh, STL/OBJ parsers
│   ├── bvh/                         # Median-split BVH, ray-AABB, Möller-Trumbore
│   ├── raycaster/                   # Ray casting routines
│   ├── physics/                     # Material data & physics constants
│   ├── objectives/                  # Objective functions for optimization
│   └── search/                      # Optimization search algorithms (intelliscan)
├── frontend/
│   ├── src/main.js                  # Main frontend logic
│   ├── src/plots.js                 # Plotting utilities
│   ├── src/export.js                # Export functionality
│   ├── src/style.css                # Styles
│   ├── index.html                   # Entry HTML
│   └── vite.config.js               # Vite configuration
├── build/                           # Build artifacts & app icon
├── _tooling/                        # Project documentation & audit files
└── _research/                       # Academic paper references & alignment docs
```

## Commands

| Command | Description |
|---|---|
| `wails dev` | Run in live development mode (hot reload) |
| `wails build` | Build production binary → `build/bin/penopt` |
| `cd frontend && npm run dev` | Start Vite dev server only |
| `cd frontend && npm run build` | Build frontend assets |
| `cd frontend && npm run preview` | Preview frontend build |

## Code Conventions

- **Go**: Standard Go conventions (gofmt), `internal/` package layout
- **Frontend**: Vanilla JS (no framework), ES modules via Vite
- **No tests, no linters currently configured**
- App icon: `build/appicon.png`
- Frontend assets embedded into Go binary via `//go:embed`

## Research Alignment

PenOpt implements algorithms from several academic papers and standards. The `_research/` directory documents each reference and tracks implementation alignment with checklists.

**Always ensure new or modified code aligns with the referenced papers.** Before making changes to any of the following packages, consult the corresponding research document:

| Package | Reference | Document |
|---|---|---|
| `internal/objectives/` | **Ito et al. 2020** — f_mtl, f_hdn, f_fdk objective functions | `_research/ito2020_orientation.md` |
| `internal/search/` (core) | **Ito et al. 2020** — coarse→fine grid search strategy | `_research/ito2020_orientation.md` |
| `internal/search/intelliscan.go` | **Lifton & Poon 2023** — IntelliScan tangent-ray theory | `_research/lifton2023_intelliscan.md` |
| `internal/search/intelliscan.go` | **Butzhammer et al. 2026** — automated 3D angle selection | `_research/butzhammer2026_angles.md` |
| `internal/raycaster/` | **Heinzl et al. 2011** — ray casting methodology | `_research/heinzl2011_placement.md` |
| `internal/bvh/` | **Heinzl et al. 2011** — BVH-accelerated traversal | `_research/heinzl2011_placement.md` |
| `internal/physics/` | **NIST XCOM** — mass attenuation coefficients & Beer-Lambert physics | `_research/nist_xcom.md` |

**Key constraints to maintain:**

1. **f_mtl** uses generalized mean with m=3 (cube-root mean, per Ito 2020 eq. 1). Do not change the exponent without justification.
2. **Coarse→fine search** (§2.4 of Ito 2020): 15° coarse spacing, top-3 candidates, ±5° refinement at 1° steps.
3. **IntelliScan** (Lifton 2023, Butzhammer 2026): projection angles where ray direction · face normal = 0, two solutions per face.
4. **Ray casting** (Heinzl 2011): entry/exit segment pairs, sum path lengths, filter noise segments below MIN_SEGMENT=0.01mm.
5. **NIST XCOM physics**: log-log interpolation, Beer-Lambert transmission, correct μ/ρ values.
6. **θ rotation first** (around X-axis), **then φ rotation** (around Y-axis) — matches the Ito 2020 convention.
7. When adding new objective functions or search strategies, document the paper source and update the alignment checklist in `_research/`.
