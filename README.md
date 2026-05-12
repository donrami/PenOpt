# PenOpt - CT Scan Orientation Optimizer

A desktop tool that finds the optimal orientation for CT scanning a given part. Load a mesh (STL/OBJ), simulate X-ray projections with BVH-accelerated ray casting, and search over orientations to minimize penetration, energy requirements, and beam-hardening artifacts.

Built with [Wails v2](https://wails.io/) (Go backend, Three.js/WebGL frontend). The optimization extends the coarse-to-fine grid search from **Ito et al. 2020**.[^1] with additional objectives for Tuy completeness and beam-hardening approximation.

## Features

- Simulates X-ray paths through arbitrary triangle meshes at interactive speeds using **BVH-accelerated ray casting**.
- **Multi-objective search** — five objectives from the literature and extensions (generalized-mean penetration f_mtl, max path length f_energy, projection uniformity f_hdn, Tuy completeness f_tuy, and beam-hardening approximation f_bh) combined into a weighted score.
- **Coarse-to-fine grid search:** 15° initial grid over (θ, φ), top-3 refinement at 1° (configurable in code; future UI control planned).
- **Search range control** — user-adjustable angular range for optimization (default ±45°, range ±30° to ±75°).
- NIST XCOM attenuation coefficients for common materials (Al, Ti, Fe, Cu, W, PMMA…), with energy-dependent lookup.
- CT scanner presets for industrial and medical systems (Nikon, GE, Zeiss, Siemens, Philips, dental CBCT) plus beam filter presets (Cu, Al, Sn, Ti) with effective energy computation.
- **IntelliScan:** tangent-angle computation for cone-beam geometry (adaptive projection allocation planned).
- **3D viewport** with free rotation and per-face penetration heatmaps.
- Contour plots and penetration roses to visualize the objective landscape.
- Estimates required kV from max path length and material — removes the guesswork from scan setup.
- JSON and PNG export with summary overlay.

## Requirements

- [Go](https://go.dev/dl/) 1.23+
- [Node.js](https://nodejs.org/) 18+ (for frontend build)
- [Wails v2](https://wails.io/docs/gettingstarted/installation) CLI

On Linux, you'll also need the Wails system dependencies (`libgtk-3-dev`, `libwebkit2gtk-4.0-dev`, etc.). See the [Wails Linux setup guide](https://wails.io/docs/gettingstarted/installation#platform-specific-dependencies).

## Development

```bash
# Clone and enter the project directory
git clone <repo-url> penopt
cd penopt

# Install frontend deps
cd frontend && npm install && cd ..

# Run with live hot-reload
wails dev

# Build a production binary
wails build
```

`wails dev` starts a Vite dev server for the frontend and connects it to the Go backend. Open http://localhost:34115 for browser-based development with full Go method access.

## Usage

1. **Load a mesh.** Drag-and-drop or use the file dialog (STL/OBJ). The mesh is centered at origin and a BVH is built on load.
2. **Configure the scan.** Pick a scanner preset or set geometry manually (SDD, SOD, detector size, pixels). Select a material and optional beam filter.
3. **Set weights.** Adjust the balance between the five objectives using the preset buttons (Quality, Balanced, Energy) or custom weights (future UI control planned). Current presets:
   - Quality: w_mtl=0.5, w_energy=0.2, w_hdn=0.2, w_tuy=0.05, w_bh=0.05
   - Balanced: w_mtl=0.3, w_energy=0.3, w_hdn=0.2, w_tuy=0.1, w_bh=0.1
   - Energy: w_mtl=0.2, w_energy=0.5, w_hdn=0.2, w_tuy=0.05, w_bh=0.05
4. **Set search range.** Use the slider in the Scanner accordion to adjust the angular range (default ±45°).
5. **Run optimization.** The search runs asynchronously. Progress is shown in the viewport overlay and sidebar.
6. **Review results.** The best orientation (θ, φ) is shown with its scores. Switch between 3D, contour, and rose views. Toggle heatmap to see per-face penetration at any orientation.
7. **Export.** Save results as JSON or take a PNG screenshot with summary overlay.

## Algorithm

At each candidate orientation (θ, φ), the tool:

1. Rotates the mesh by θ around X and φ around Y.
2. Casts a grid of rays from the X-ray source through the BVH, recording the path length through material for each ray.
3. Computes five objectives:
   - **f_mtl:** generalized mean of path lengths (m=3, cube-root mean). Penalizes orientations with long penetration paths.
   - **f_energy:** maximum path length across all rays. Determines the X-ray energy needed.
   - **f_hdn:** range of per-projection maximum path lengths. Penalizes orientations where different projections see very different max thicknesses (drives beam-hardening variation).
   - **f_tuy:** Tuy-Smith completeness (fraction of mesh faces satisfying Tuy's condition for exact cone-beam reconstruction). Higher is better.
   - **f_bh:** beam-hardening approximation (currently a placeholder; future implementation will use polyenergetic spectrum).
4. Combines them into a weighted score.

The search starts with a coarse 15° grid over θ ∈ [-range°, range°] and φ ∈ [-range°, range°] (where range° is the user-set search range, default 45°). The top 3 are refined at 1° resolution within ±5° neighborhoods. The IntelliScan variant computes tangent angles for cone-beam geometry (future work will adapt projection allocation during coarse search based on orientation variance).

## Scanner Presets

| Preset | SDD (mm) | SOD (mm) | Detector (mm) | Pixels |
|--------|----------|----------|---------------|--------|
| Custom | 1000 | 700 | 400×400 | 1024 |
| Nikon XT H 225 | 800 | 500 | 400×400 | 1024 |
| Nikon XT H 320 | 1200 | 800 | 400×400 | 1024 |
| GE Phoenix v\|tome\|x S240 | 600 | 400 | 300×300 | 1024 |
| GE Phoenix v\|tome\|x M300 | 1000 | 700 | 400×400 | 2048 |
| Zeiss METROTOM 800 | 700 | 450 | 300×300 | 1024 |
| Zeiss METROTOM 1500 | 1200 | 800 | 400×400 | 2048 |
| Nikon VOXLS 20 | 500 | 300 | 200×200 | 1024 |
| Nikon VOXLS 30 | 700 | 450 | 300×300 | 1024 |
| Siemens Somatom Go.Up | 1040 | 595 | 500×500 | 736 |
| GE LightSpeed VCT | 949 | 541 | 400×400 | 888 |
| Philips Brilliance 64 | 1040 | 570 | 500×500 | 672 |
| Dental CBCT (small) | 300 | 200 | 100×80 | 640 |

## Project Structure

```
penopt/
├── main.go                # Wails app entry point
├── app.go                 # Thin composition layer for Wails bindings
├── CONTEXT.md             # Domain glossary (architecture decisions & language)
├── frontend/
│   └── src/
│       ├── main.js        # Bootstrap & keyboard shortcuts
│       ├── state.js       # Shared state object & DOM helpers
│       ├── scene.js       # Three.js scene, mesh rendering, heatmap, beam viz
│       ├── filehandler.js # File upload, drag-drop, mesh loading
│       ├── optimizer.js   # Search lifecycle, results, IntelliScan
│       ├── materials.js   # Material/filter picker, beam energy
│       ├── export.js      # JSON / PNG export
│       ├── plots.js       # Contour & rose canvas plots
│       └── style.css      # Design system (dark theme)
├── internal/
│   ├── app/               # Focused adapters: MeshLoader, Optimizer, PhysicsAPI, ScannerAPI
│   ├── bvh/               # Bounding volume hierarchy construction & traversal
│   ├── mesh/              # STL/OBJ parsers, watertight check, Vec3 type
│   ├── objectives/        # f_mtl, f_energy, f_hdn, f_tuy, f_bh objective functions
│   ├── physics/           # NIST XCOM materials, beam filters, effective energy
│   ├── raycaster/         # BVH-accelerated ray casting & transmission lengths
│   ├── search/            # Coarse→fine grid search, IntelliScan
│   └── vec/               # Shared 3D vector math (Dot, Cross, Sub, Normalize, Rotate)
└── build/                 # Platform-specific build assets & icons
```

## License

MIT © [Rami Abu-Hamad](mailto:rami@abu-hamad.de)

---

[^1]: Ito, T. et al. (2020). "Optimization of X-ray CT scanning orientation for additive manufactured parts using ray casting." *Precision Engineering*, 64, 232–240.