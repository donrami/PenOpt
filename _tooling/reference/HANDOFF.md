# PenOpt — Handoff Document

**Date**: 2026-05-10  
**Binary**: `build/bin/penopt` (9.0 MB)  
**Build time**: ~3s  
**Tech**: Go 1.26 + Wails v2.12 + Three.js + Vite

---

## Overview

PenOpt is a desktop application that calculates the optimal CT scan orientation for 3D CAD/mesh files (STL/OBJ). It minimizes X-ray penetration depth and energy consumption by searching over tilt angles (θ, φ) using BVH-accelerated ray casting.

---

## Background: Why This Was Rebuilt from Scratch

### The Old System (Tauri + Rust WASM)

The original PenOpt app (`/home/mainuser/Desktop/ct/`) used:
- **Tauri v2** — Rust-based desktop framework with a custom frameless titlebar, resize edges, and native file associations
- **Rust WASM module** (`ct_ray_core.wasm`) — A 20 KB WebAssembly binary compiled from Rust, containing the BVH ray casting engine, embedded as base64 in the JS bundle
- **Custom build script** — A 140-line Node.js script that concatenated 27 JS modules into a single HTML file
- **Three.js + mesh BVH** — CDN-loaded for 3D rendering

### Why It Was Abandoned

After extensive development effort, two fundamental problems proved insurmountable:

**1. WASM loading was unreliable**
The WASM module (`ct_ray_core.wasm`) was loaded either via:
- `fetch()` from the filesystem — failed in Tauri's WebView due to CSP restrictions and MIME type issues
- Base64 decode from an inline string — worked intermittently, especially for larger binaries, with cryptic WebAssembly instantiation errors

Tauri v2's security model (CSP, custom protocol) made WASM loading fragile. The same code worked perfectly in a standalone browser but failed unpredictably inside Tauri's WebView. Debugging required navigating Rust stack traces + WebView console + WASM instantiation errors simultaneously.

**2. Tauri GUI was broken and unmaintainable**
- The custom frameless titlebar (minimize/maximize/close buttons, drag region, resize edges) required `@tauri-apps/api/window` with complex permission configurations in `capabilities.json`
- Window management code was split across a custom `titlebar.js` module, a vendor shim (`tauri-window.js`), and Rust IPC handlers — creating a fragile three-way dependency
- Tauri v2's rapid API changes (especially around permissions, window creation, and event system) broke the build repeatedly
- The Rust compile-test-debug cycle was slow: Rust compilation (~30s) + Tauri bundling + WebView launch

### The New System (Wails + Go)

The decision was made to **rebuild from scratch** with:
- **Wails v2** — Go-based desktop framework. Simpler API, no custom titlebar needed (uses native OS decorations), no complex permission system, standard Go toolchain
- **Go native ray casting** — The entire BVH building, ray-triangle intersection, and penetration computation was ported from Rust WASM to pure Go. This eliminated the WASM dependency entirely — no more loading failures, no MIME type issues, no WebAssembly instantiation quirks
- **Vite build** — Standard frontend tooling instead of the custom build script
- **Single main.js** — Instead of 27 modules with a global `CT.*` namespace, the app uses a clean ES module architecture with an explicit state object

### What Was Preserved

The algorithms and research foundations are identical:
- Möller-Trumbore ray-triangle intersection
- BVH acceleration structure (median-split)
- f_mtl / f_energy / f_hdn objective functions (Ito et al. 2020)
- Coarse→fine grid search strategy
- NIST XCOM material database (40+ materials, ported byte-for-byte)
- Beer-Lambert physics engine
- Three.js 3D rendering (same library, same approach)
- All canvas 2D plotting (contour, rose)

The reference implementation is preserved at `/home/mainuser/Desktop/ct/ct-orientation-optimizer-reference.html` (7,500-line monolith) and the original modular source remains in `/home/mainuser/Desktop/ct/src/`.

---

## Quick Start

```bash
cd penopt
wails dev        # Development mode with hot reload
wails build      # Production build → build/bin/penopt
```

**Prerequisites**: Go 1.21+, Node/NPM, webkit2gtk (Linux)

---

## Architecture

```
                    ┌─────────────────────────────────┐
                    │        Wails v2 Desktop          │
                    │  (Go runtime + WebView window)   │
                    └────────────┬────────────────────┘
                                 │ IPC via auto-generated bindings
                    ┌────────────▼────────────────────┐
                    │         Go Backend (9 files)      │
                    │  ┌──────────┐  ┌──────────────┐  │
                    │  │  mesh/   │  │   bvh/       │  │
                    │  │ parsing  │  │ acceleration │  │
                    │  └──────────┘  └──────────────┘  │
                    │  ┌──────────┐  ┌──────────────┐  │
                    │  │raycaster/│  │ objectives/  │  │
                    │  │intersect │  │  f_mtl etc   │  │
                    │  └──────────┘  └──────────────┘  │
                    │  ┌──────────┐  ┌──────────────┐  │
                    │  │ search/  │  │  physics/    │  │
                    │  │ grid srch│  │ NIST XCOM DB │  │
                    │  └──────────┘  └──────────────┘  │
                    │  ┌──────────────────────────┐    │
                    │  │ app.go (Wails bindings)   │    │
                    │  └──────────────────────────┘    │
                    └────────────┬────────────────────┘
                                 │ Events + Bindings
                    ┌────────────▼────────────────────┐
                    │    Frontend (Vite + Three.js)     │
                    │  ┌──────────┐  ┌──────────────┐  │
                    │  │ main.js  │  │   plots.js   │  │
                    │  │ init + UI│  │  canvas 2D   │  │
                    │  └──────────┘  └──────────────┘  │
                    │  ┌──────────┐  ┌──────────────┐  │
                    │  │export.js │  │  style.css   │  │
                    │  │ JSON/PNG │  │   dark theme │  │
                    │  └──────────┘  └──────────────┘  │
                    │  ┌──────────────────────────┐    │
                    │  │   index.html (SPA)        │    │
                    │  └──────────────────────────┘    │
                    └─────────────────────────────────┘
```

### Key Architectural Decisions

1. **No WASM** — The original app used Rust compiled to WASM for ray casting, which caused intermittent loading failures in Tauri's WebView. All ray casting is now native Go code using Möller-Trumbore intersection with a BVH.

2. **Wails (not Tauri)** — Tauri's frameless window, permissions system, and Rust backend caused persistent GUI issues. Wails v2 uses Go backend + system WebView with simpler API. No custom titlebar required.

3. **Async optimization via Wails Events** — The grid search runs in a Go goroutine to keep the UI responsive. Progress is emitted via `runtime.EventsEmit`, results returned via `search:done` event. The function returns `"started"` immediately.

4. **Parallel ray casting** — Projection angles run in parallel goroutines with `sync.WaitGroup`. The heatmap uses per-goroutine local buffers + mutex merge to avoid race conditions.

---

## File Map

### Go Backend (`internal/`)

| File | Lines | What |
|------|-------|------|
| `mesh/mesh.go` | ~130 | `Vec3`, `Triangle`, `Mesh` types. Bounding box, vertex/index buffers, **watertightness check** (edge boundary detection). |
| `mesh/parser_stl.go` | ~120 | Binary STL parser (reads 50-byte triangle records) + ASCII STL parser |
| `mesh/parser_obj.go` | ~100 | Wavefront OBJ parser (`v`, `f` records, fan triangulation, handles v/vt/vn format) |
| `bvh/bvh.go` | ~300 | Median-split BVH along longest axis (leaf size: 8). Ray-AABB slab test, Möller-Trumbore triangle intersection, BVH traversal for nearest + all hits. |
| `raycaster/raycaster.go` | ~370 | `ComputeTransmissionLengths()` (grid of detector rays, per-projection-angle) + `ComputeFacePenetrations()` (per-face heatmap, centroid rays). **Both parallelized with goroutines.** |
| `objectives/objectives.go` | ~80 | `f_mtl` (cube-root mean, m=3), `f_energy` (max), `f_hdn` (range), `Normalize`, `CombinedScore` (minimax + weighted). |
| `search/search.go` | ~230 | `EvaluateSingle()`, `Run()` (coarse→fine grid search: 49 orientations at 15° spacing, top 3 candidates refined at ±5°). |
| `search/intelliscan.go` | ~100 | Tangent-ray angle selection: for each face normal, solve d̂(α)·n̂=0 → α = atan2(nx, nz). |
| `physics/material.go` | ~170 | `LogLogInterp`, `CalcMu`, `CalcTransmission`, `CalcTMm`, `FilterTrans`, `ComputeEffectiveEnergy`, `HVLCu`, `RecommendKV`. |
| `physics/mats_data.go` | ~100 | 40+ NIST XCOM materials, 2 filter materials (Cu/Zn), 8 filter presets. |

### Wails Bindings (`app.go`)

| Method | Input | Returns | Async? |
|--------|-------|---------|--------|
| `LoadMeshFromBytes` | name, data[] | meshInfo | No |
| `GetVertexBuffer` | — | float64[] | No |
| `GetMeshInfo` | — | meshInfo | No |
| `RunOptimization` | {weights, method} | "started" (results via events) | **Yes** |
| `EvaluateOrientation` | theta, phi | JSON string | No |
| `GetMaterials` | — | JSON string | No |
| `GetFilters` | — | JSON string | No |
| `GetScannerPresets` | — | JSON string | No |
| `CalcBeamParams` | energy, tPct, filterID, materialID | JSON string | No |
| `CalcEnergyRecommendation` | materialID, maxPen, tPct | JSON string | No |
| `ComputeFaceHeatmap` | theta, phi | JSON string | No |

### Frontend (`frontend/src/`)

| File | Lines | What |
|------|-------|------|
| `main.js` | ~670 | App init, Three.js scene, file upload, material picker, beam controls, optimization workflow (event-driven), view modes (3D/heatmap/compare), beam visualization, layout modes, keyboard shortcuts, IntelliScan rendering, restore banner |
| `plots.js` | ~320 | Canvas setup helper, contour plot (bilinear interpolation, color scale, markers, color bar), rose plot (polar, concentric circles, best/worst overlay, IntelliScan ticks) |
| `export.js` | ~90 | JSON blob download, PNG composite (viewport screenshot + summary text overlay) |
| `style.css` | ~710 | Dark theme design system (CSS custom properties), sidebar cards, accordion, material grid, filter buttons, progress ring, results grid, plot tabs, tooltip-ready, compare overlay, heatmap legend, IntelliScan card |

---

## Data Flow

### Optimization Pipeline

```
1. User drops .stl/.obj file
   └─ frontend reads via FileReader → sends bytes to Go via LoadMeshFromBytes()
       └─ Go parses mesh (STL/OBJ) → builds BVH → returns meshInfo (tris, bounds, watertight)

2. User adjusts beam energy, Tmin, filter, material
   └─ frontend calls CalcBeamParams() → Go computes μ/ρ, μ, t_max, Eeff → returns JSON

3. User clicks "Optimize"
   └─ frontend calls RunOptimization() → Go returns "started" immediately
       └─ Go goroutine runs search.Run()
           ├─ evaluateOrientations() × 49 coarse orientations
           │   └─ raycaster.ComputeTransmissionLengths() per orientation
           │       └─ for each of 36 projection angles (goroutine):
           │           └─ pixelToRay() → transform to mesh-local → BVH.IntersectAll() → penetration sum
           ├─ evaluateOrientations() × ~70 fine orientations (16²×90 rays)
           └─ IntelliScan: ComputeIntelliScanAngles() from mesh normals
       └─ Go emits "search:done" event with JSON result

4. Frontend receives "search:done" event
   ├─ showResults(): fills summary bar, optimal orientation card, energy card
   ├─ drawContourPlot(): canvas 2D heatmap over (θ, φ)
   ├─ drawPenetrationRose(): polar plot of max penetration per angle
   ├─ renderIntelliScan(): angle list, savings %, copy/export buttons
   └─ loadHeatmap(): calls ComputeFaceHeatmap() → Go returns per-face data → vertexColors on mesh
```

### Event Flow (Async Optimization)

```
Frontend                          Go Backend
   │                                  │
   ├─ RunOptimization({...}) ─────────┤
   │                                  ├─ returns "started"
   │<── promise resolves ─────────────┘
   │                                  │
   │   runtime.EventsOn("search:progress")
   │   runtime.EventsOn("search:done")
   │                                  ├─ goroutine runs search
   │                                  ├─ EventsEmit("search:progress", {pct, label})
   │<── progress callback ────────────┤  (repeated for each orientation)
   │                                  │
   │                                  ├─ EventsEmit("search:done", {result})
   │<── done callback ────────────────┤
   │   EventsOff("search:progress")
   │   EventsOff("search:done")
   │   parse JSON → show results
```

---

## Implemented Features

### By Sprint

| Sprint | Features |
|--------|----------|
| **P1** | Material DB (40+ NIST XCOM), Beer-Lambert physics, beam energy/Tmin/filter controls, material picker (category tabs + search), progress ring/bar, stop button, error banner, file metadata |
| **P2** | Watertightness check with boundary edge detection, complete viewport controls bar (view modes, layout modes, camera reset, fullscreen, labels toggle, beam toggle), keyboard shortcuts (Ctrl+O, Ctrl+Enter, Esc, 1/2/3, R, F) |
| **P3** | Per-face heatmap (Go backend + Three.js vertex colors + gradient legend), contour plot (canvas 2D, bilinear interpolation, color bar), rose plot (polar, best/worst overlay), energy recommendation (kV + qualitative label + savings), export (JSON + PNG), weight presets (Quality/Balanced/Energy) + minimax/weighted method toggle, scanner presets (13 industrial/medical), async optimization with progress events |
| **P4** | Compare mode (ghost mesh overlay, default vs optimal), beam visualization (3D X-ray source, detector, cone, turntable, floor), heatmap legend with gradient, proper cleanup on mesh removal |
| **P5** | IntelliScan tangent-ray angles (Go backend, frontend card, rose plot ticks, copy/export) |
| **P6** | Restore banner (localStorage), help modal (full documentation), tooltips on key controls |
| **P7** | Parallel ray casting (goroutines per projection angle, waitgroup, mutex merge for heatmap) |

### GUI Layout

```
┌──────────────────────────────────────────────────────┐
│ [CT] PenOpt — CT Scan Orientation Optimizer          │
│                     76 keV | 0.10% Tmin | 150 Eeff [?]│
├──────────────┬───────────────────────────────────────┤
│ Upload       │ [▶ Optimize] [████████░░] 72% [■ Stop]│
│ [Drop STL]  │             θ: 30° φ: 45°             │
│ material.stl │ [3D][Heat][Cmp] [D][V][R] [↺][LBL][B][]|
│ 12k tris     │                                        │
│ ● watertight │  ┌──────────────────────────────────┐  │
│ 0..200 mm    │  │  3D mesh (Three.js + orbit)      │  │
│ [Remove]     │  │                                  │  │
│              │  │  [↺ Reset camera]                │  │
│ Material     │  │                                  │  │
│ [All][Metal] │  └──────────────────────────────────┘  │
│ [🔍 Filter]  │  ═══ Results ════════════════════════ │
│ [Al] [Ti] .. │  θ=30° φ=45° | 120 kV | f_mtl -15%   │
│              │  ┌─────────┐ ┌─────────┐              │
│ Optimize     │  │Optimal  │ │Energy   │              │
│ ● Ready      │  │θ=30°... │ │120 kV   │              │
│              │  │f_mtl... │ │▼ Lower  │              │
│ Advanced     │  └─────────┘ └─────────┘              │
│ [∨] Beam En. │  ┌─────────┐ ┌─────────┐              │
│ [∨] Pre-Filt │  │Intelli. │ │Plots    │              │
│ [∨] Scanner  │  │12 angles│ │[Contour]│[Rose]        │
│ [∨] Ray Grid │  └─────────┘ └─────────┘              │
├──────────────┴───────────────────────────────────────┤
│ Ready — drop a mesh file     12k tris                │
└──────────────────────────────────────────────────────┘
```

---

## Deferred Items

### Multi-Material Support (Sprint 5, ~1 day)

**What**: Per-triangle-group material assignment with weighted penetration (Baraka 2024).

**Implementation sketch**:
1. **Mesh parsing**: In `mesh/parser_obj.go`, detect OBJ groups (`g` records) and STL solids. Store group boundaries in `Mesh.Groups []GroupInfo`.
2. **Go raycaster**: Modify `ComputeTransmissionLengths` to accept `materialMuRatios map[int]float64`. For each ray segment, multiply by `muRatio[groupID]` instead of raw mm (see `src/js/raycaster.js` line 99-103).
3. **Frontend**: After mesh loads, if groups > 1, show a group-to-material assignment UI in the sidebar (dropdown per group with material picker). Compute μ_ratio = μ_group / μ_ref.
4. **App.go**: Expose `GetMeshGroups()`, `SetMaterialAssignments()`.

### Auto-Decimation (Sprint 7, ~1 day)

**What**: Simplify meshes > 500k triangles to prevent OOM.

**Implementation sketch**:
1. After mesh parse in `mesh/parser_*.go`, check `m.NumTris > 500000`.
2. Implement vertex clustering: quantize vertices to a grid, merge nearby vertices, rebuild triangles.
3. Or use half-edge collapse with quadric error metric (complex — consider porting `SimplifyModifier` from Three.js).
4. Frontend: show "Mesh decimated from X to Y tris" notice.

### App Icon & Packaging (Sprint 7, ~2 hrs)

**What**: Professional icon + distributable package.

- Replace `build/appicon.png` with a proper SVG-derived icon (CT scan iconography).
- `wails build -package` for Debian package / AppImage.

### Remaining Polish

- **Layout mode transitions** — Sidebar collapse animation could be smoother.
- **Error recovery** — Retry button after optimization failure.
- **Full test coverage** — Table-driven Go tests for BVH, raycaster, objectives.

---

## Known Issues

1. **Coarse grid limited to ±45°** — Matches original (Ito 2020), but some parts may have optimal orientation outside this range. The range can be expanded by modifying `CoarseThetas`/`CoarsePhis` in `search/search.go`.

2. **Fine search doesn't check cancellation** — The Go goroutine doesn't check `ctx.Done()` during evaluation. The cancel button sets a frontend flag that discards results, but the Go computation continues to completion. To fix: pass a `context.Context` with cancel through `search.Run()` and check `ctx.Err()` in the evaluation loop.

3. **Heatmap slow on large meshes** — `ComputeFacePenetrations` casts N_faces × 90 rays. For a 100k-face mesh, that's 9M rays. Takes ~30s even with parallelization. Consider reducing to 36 projection angles for heatmap.

4. **No memory limits** — Large meshes (>1M tris) may cause OOM during BVH build. The `Mesh` stores all triangles in memory. Consider streaming BVH build or memory-mapped storage for very large meshes.

5. **Single-material only** — Multi-material support is not implemented. All rays use raw penetration length with no per-group μ weighting.

---

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Desktop framework | Wails | v2.12.0 |
| Backend language | Go | 1.26 |
| Frontend build | Vite | 3.x |
| 3D rendering | Three.js | via npm (latest) |
| Orbit controls | Three.js addon | via npm |
| Canvas 2D plotting | Native Canvas API | — |
| IPC | Wails auto-generated bindings + Events | — |
| Physics data | NIST XCOM | 30-500 keV range |
| Target platform | Linux (WebKit2GTK) | macOS/Win via Wails |
| Binary size | 9.0 MB | (vs ~150 MB for Electron) |

## Go Dependencies

All from `go.mod`:
- `github.com/wailsapp/wails/v2` — Desktop framework, runtime, events
- `github.com/wailsapp/go-webview2` — WebView backend
- Standard library: `encoding/json`, `fmt`, `math`, `sort`, `sync`, `time`

## Frontend Dependencies

From `frontend/package.json`:
- `three` — 3D rendering engine
- `vite` — Build tool (dev dependency)

---

## How to Extend

### Adding a new Go binding

1. Add method to `App` struct in `app.go`
2. Run `wails dev` or `wails build` to auto-generate bindings
3. Add export to `frontend/wailsjs/go/main/App.js`
4. Import and call from `frontend/src/main.js`

### Adding a new frontend module

1. Create file in `frontend/src/`
2. Import in `main.js`
3. Vite will tree-shake unused exports

### Adding a new material

1. Add entry to `mats_data.go` materials array
2. Include energy-μ/ρ points from NIST XCOM
3. Rebuild — no frontend changes needed

### Changing the search grid

Modify `CoarseThetas` / `CoarsePhis` in `search/search.go`. Current: 7×7=49 at 15° spacing over [−45, 45].
