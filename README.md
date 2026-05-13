# PenOpt - CT Scan Orientation Optimizer

A desktop application that finds the optimal orientation for industrial X-ray CT scanning. Load a mesh (STL/OBJ), configure beam energy and scanner geometry, and search over tilt/rotation angles to minimize penetration, energy requirements, and cone-beam artifacts.

<!-- Screenshot: add `./docs/screenshot.png` and remove this comment -->
<!-- ![PenOpt UI](./docs/screenshot.png) -->

[![Go 1.23+](https://img.shields.io/badge/Go-1.23+-00ADD8?style=flat-square&logo=go)](https://go.dev/dl/)
[![Wails v2](https://img.shields.io/badge/Wails-v2-2.12-6e48d9?style=flat-square&logo=wails)](https://wails.io/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

## What This Does

PenOpt solves a concrete problem in industrial CT scanning: **which orientation should you scan a part in?** Given a 3D mesh, it casts X-rays through the geometry, evaluates five image-quality objectives over hundreds of orientations, and returns the optimal tilt (θ) and rotation (φ) angles. It also generates IntelliScan projection schedules (Butzhammer 2026) and tells you what kV you'll need.

Built with [Wails v2](https://wails.io/) - Go backend with BVH-accelerated ray casting, Three.js/WebGL frontend.

## Quick Start

```bash
# Install dependencies
cd frontend && npm install && cd ..

# Run with live hot-reload
wails dev

# Build a production binary
wails build
```

Open http://localhost:34115 after `wails dev` starts. On Linux, install Wails system dependencies first (`libgtk-3-dev`, `libwebkit2gtk-4.0-dev`).

## Features

### At a Glance

| Capability | Details |
|---|---|
| **Ray casting** | BVH-accelerated (median-split BVH, Möller-Trumbore), parallel goroutines |
| **Search** | Coarse-to-fine grid: 15° to 1° refinement, global normalization |
| **Objectives** | f_mtl (generalized-mean penetration), f_energy (max path), f_hdn (projection range) |
| **Scoring** | Minimax or weighted combination, 3 weight presets |
| **Tuy-Smith tracking** | Completeness fraction per orientation, warning < 90% |
| **Materials** | 40+ NIST XCOM entries with energy-dependent μ/ρ, log-log interpolation |
| **Beam filters** | Cu, Al, Sn, Ti presets with polyenergetic effective energy (120-point spectrum) |
| **Scanner presets** | 13 industrial/medical presets (Nikon, GE, Zeiss, Siemens, Philips, dental CBCT) |
| **IntelliScan** | Tangent-ray projection selection (Butzhammer 2026), scan time vs. 360° |
| **3D viewport** | Three.js, smooth animated rotation, per-face heatmap, beam geometry viz |
| **Analysis plots** | Score contour (bilinear-interpolated heatmap), penetration rose (polar) |
| **Export** | JSON (full result set) and PNG (viewport + summary overlay) |
| **Ray sampling** | Adjustable grid: 4×4 (fast preview) to 32×32 (high accuracy) |
| **Search range** | ±30° to ±75° with boundary-edge warnings |

### In Depth

- **Materials & Physics** - NIST XCOM attenuation database for 40+ materials, polyenergetic effective energy using 120-point spectrum integration, pre-filter presets with flux ratio and HVL-Cu computation, kV recommendation with qualitative guidance (Low / Medium / High)
- **Scanner Configuration** - 13 industrial and medical CT presets, full manual control of SDD, SOD, detector dimensions, and pixel count
- **Visualization** - Per-face penetration heatmap, score contour plot with search boundary overlay, penetration rose (optimal vs. worst orientation), optional 3D cone-beam diagram, compare mode with ghost overlay
- **IntelliScan** - Computes unique tangent-ray projection angles from rotated face normals. Reports reduction vs. full 360° coverage with scan time estimate. Copy angles or export as JSON.
- **UI** - Dark theme (Inter + JetBrains Mono), material filter tabs with live search, real-time progress ring with orientation HUD, keyboard shortcuts, session persistence across restarts

## Usage

### 1. Load a mesh
Drag-and-drop or click the drop zone to open the native file dialog. Supports STL (binary and ASCII) and OBJ. The mesh is centered at origin and a BVH is built on load. Watertight status and boundary edge count are shown.

> **Non-watertight meshes**: Penetration values will be underestimated. A warning banner appears when open edges are detected.

### 2. Configure material
Pick a material from the NIST XCOM database using the category tabs (All / Metallic / Non-Metallic) or the search field. Set beam energy (keV) and minimum transmission (Tmin) - the effective energy after filtering is computed live.

### 3. Configure scan
Choose a scanner preset or set SDD, SOD, detector dimensions, and pixels manually. Optionally add a beam pre-filter and see effective energy shift, HVL-Cu, and flux ratio.

### 4. Set optimization parameters
- **Quality / Balanced / Energy presets** - choose how to combine objectives (minimax or weighted)
- **Ray Sampling slider** - lower values (4×4) for fast preview, higher (32×32) for accurate results
- **Search Range slider** - narrow (±30°) for focused search, wide (±75°) for comprehensive coverage

### 5. Run optimization
Click **Optimize** in the sidebar or viewport header. The search runs asynchronously - progress is shown as a ring overlay, percentage, and live orientation label (θ, φ). Stop the search at any time.

### 6. Review results
- Optimal orientation (θ, φ) with per-metric comparison to worst orientation
- kV recommendation with qualitative guidance
- Tuy completeness warning if below 90%
- Boundary warning if optimum is near search range edge
- IntelliScan angles card with copy/export actions
- Analysis plots: score contour and penetration rose

### 7. Export
Save results as JSON for programmatic use, or as a PNG screenshot with summary overlay.

## Objective Functions

| Function | Description | Target |
|----------|-------------|--------|
| **f_mtl** | Generalized mean of X-ray path lengths (m=3, cube-root). Penalizes orientations with long penetration paths. | Minimize |
| **f_energy** | Maximum path length across all rays. Determines the X-ray tube voltage needed. | Minimize |
| **f_hdn** | Range of max path lengths across projections. Low values mean more isotropic ray coverage. | Minimize |
| **f_tuy** | Fraction of faces with at least one tangent ray (Tuy-Smith completeness). Warning shown below 90%. | Track (warning) |

## How It Works

PenOpt searches over two angles - tilt θ (rotation around X) and rotation φ (rotation around Y) - evaluating ray casting results at each candidate orientation:

1. **Rotate** the mesh by θ and φ.
2. **Cast rays** from the X-ray source through a ray grid at N projection angles, traversing the BVH to find all intersections and measure path length through solid material.
3. **Evaluate objectives** from the path length array.
4. **Coarse phase**: 15° grid over the configured range (±45° default).
5. **Refinement phase**: top-3 coarse candidates refined at 1° in ±5° neighborhoods.
6. **Global normalization** across all coarse + fine results (avoids batch-local bias).
7. **Score**: minimax or weighted combination across objectives.
8. **IntelliScan**: tangent angles from rotated face normals (Butzhammer 2026).

## Requirements

- [Go](https://go.dev/dl/) 1.23+
- [Node.js](https://nodejs.org/) 18+
- [Wails v2](https://wails.io/docs/gettingstarted/installation) CLI

On Linux, install Wails system dependencies (`libgtk-3-dev`, `libwebkit2gtk-4.0-dev`) per the [Linux setup guide](https://wails.io/docs/gettingstarted/installation#platform-specific-dependencies).

## Project Structure

```
penopt/
├── main.go                    # Wails v2 entry point
├── app.go                     # Thin composition layer - Go packages to frontend bindings
├── go.mod / go.sum            # Go 1.23, Wails v2.12
├── wails.json                 # Wails configuration
├── frontend/
│   ├── index.html             # Single-page app shell
│   ├── package.json           # Vite 5, Three.js r170
│   └── src/
│       ├── main.js            # Bootstrap, keyboard shortcuts, event wiring
│       ├── state.js           # Shared state, weight presets, DOM helpers
│       ├── scene.js           # Three.js scene, mesh, heatmap, beam viz
│       ├── filehandler.js     # File upload, drag-drop, mesh loading
│       ├── optimizer.js       # Search lifecycle, progress, results rendering
│       ├── materials.js       # Material/filter picker, beam energy
│       ├── export.js          # JSON and PNG export
│       ├── plots.js           # Contour plot and penetration rose
│       └── style.css          # Dark-theme design system (CSS variables)
├── internal/
│   ├── app/                   # Wails adapters: MeshLoader, Optimizer, PhysicsAPI, ScannerAPI
│   ├── bvh/                   # Bounding volume hierarchy (median-split, Möller-Trumbore)
│   ├── mesh/                  # Mesh type, STL/OBJ parsers, watertight validation
│   ├── objectives/            # f_mtl, f_energy, f_hdn, normalization, CombinedScore
│   ├── physics/               # NIST XCOM database, Beer-Lambert, filter effects
│   ├── raycaster/             # BVH ray casting, ray grid, transmission lengths, heatmap
│   ├── search/                # Coarse to fine grid, global normalization
│   │   ├── search.go          # Search orchestration
│   │   ├── intelliscan.go     # Tangent-ray angles (Butzhammer 2026)
│   │   └── tuy.go             # Tuy-Smith completeness
│   └── vec/                   # 3D vector math
└── build/                     # Icons, installer config
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Open file dialog |
| `Ctrl+Enter` | Start optimization |
| `Esc` | Dismiss error / help overlay |
| `1` | 3D view mode |
| `2` | Heatmap view mode |
| `3` | Compare view mode |
| `R` | Reset camera |
| `F` | Toggle fullscreen |

## References

- **Ito, T. et al. (2020)** - "Optimization of X-ray CT scanning orientation for additive manufactured parts using ray casting." *Precision Engineering*, 64, 232–240.
- **Butzhammer, L. et al. (2026)** - Tangent-ray selection for cone-beam CT. *Internal research reference.*
- **Lifton, J. & Poon, E. (2023)** - IntelliScan adaptive projection allocation.
- **NIST XCOM** - Photon Cross Sections Database.

## Roadmap

- [ ] **f_bh implementation** - polyenergetic beam-hardening objective replacing the current placeholder
- [ ] **NSGA-II multi-objective optimization** - Pareto-front exploration instead of scalarized weights
- [ ] **Adaptive ray grid** - projection count dynamically allocated based on orientation variance
- [ ] **Results history** - persist and compare multiple optimization runs

## Contributing

Contributions are welcome. Please open an issue to discuss changes before submitting PRs.

## Acknowledgments

- **Möller-Trumbore algorithm** (Möller & Trumbore 1997) for ray-triangle intersection (https://doi.org/10.1080/10867651.1997.10487468)
- **NIST XCOM** (Berger et al., NISTIR 6537) photon cross-section material database (https://dx.doi.org/10.18434/T48G6X)
- **Garland & Heckbert 1997** Surface Simplification Using Quadric Error Metrics, used by fogleman/simplify (https://mgarland.org/files/papers/quadrics.pdf)
- **fogleman/simplify** Go implementation of quadric error metric mesh simplification (https://github.com/fogleman/simplify)
- **Ito et al. (2020)** orientation optimization framework using ray casting (https://doi.org/10.58286/25108)
- **Heinzl et al. (2011)** ray casting methodology for CT specimen placement (https://www.ndt.net/article/dir2011/papers/p6.pdf)
- **Butzhammer et al. (2026)** automated tangent-ray projection selection (https://doi.org/10.58286/32560)
- **Lifton & Poon (2023)** IntelliScan adaptive projection allocation (https://doi.org/10.3233/XST-221280)
- **Tucker et al. (1991)** tungsten anode X-ray spectrum model (https://doi.org/10.1118/1.596709)
- **Boone & Seibert (1997)** accurate tungsten spectrum generation (https://doi.org/10.1118/1.597953)
- **Deb et al. (2002)** NSGA-II multiobjective optimization, planned (https://doi.org/10.1109/4235.996017)
- **Wails v2** Go + web frontend desktop application framework (https://github.com/wailsapp/wails)
- **Three.js** r170 JavaScript 3D library for viewport rendering (https://github.com/mrdoob/three.js/)

## License

MIT © [Rami Abu-Hamad](mailto:rami@abu-hamad.de)