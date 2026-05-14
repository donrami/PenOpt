# Changelog

All notable changes to PenOpt will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-05-15

### Added

- **MCP server** (`penopt-mcp`): headless binary for AI assistant integration
  - `load_mesh` — load STL/OBJ files, parse, center, build BVH, return metadata
  - `get_mesh_info` — return mesh metadata without reloading
  - `evaluate_orientation` — score a single (θ, φ) orientation
  - `run_optimization` — full coarse→fine grid search with progress notifications
  - Context cancellation: search stops cleanly if client disconnects
  - Progress sent via MCP notifications and stderr
  - Input validation with LLM-friendly error messages
- GitHub Actions CI/CD for MCP server:
  - `ci.yml` — build + test + vet on every push and PR
  - `release.yml` — cross-compile MCP binaries for linux, windows, darwin (amd64 + arm64)
  - 8 binaries per release: 4 GUI + 4 MCP

### Changed

- Bumped minimum Go version from 1.23 to 1.25 (required by go-sdk dependency)
- `search.Run()` now accepts `context.Context` for cancellation support

## [0.2.0] - 2026-05-14

### Changed

- Redesigned design system: migrated from hex/rgba to OKLCH colors
  with unified 275° hue cast for consistent cool-blue palette
- Swapped Inter + JetBrains Mono fonts for Geist + Geist Mono
- Rewrote help modal with practical CT technician guidance
  (Quick Start, Reading the Results, When to Worry)
- Applied humanizer pass to remove AI writing patterns from help text

### Added

- 57 science-grounded tooltips across results panel, sidebar controls,
  scanner geometry with physics explanations and citations
- Dynamic data-tip attributes for material grid, filter items, preset buttons
- Beam-hardening shift and HVL Cu display to filter stats

### Fixed

- Tooltip text wrapping: now uses white-space:normal with 11px/1.5 line-height
- Build errors in plots.js: duplicate var/const declarations and exports
- Removed self-explanatory tooltips that duplicated visible UI labels

## [0.1.0] - 2026-05-10

### Added

- BVH-accelerated ray casting for X-ray path simulation through triangle meshes
- Multi-objective search with three objective functions:
  - f_mtl: generalized-mean penetration (cube-root mean)
  - f_energy: maximum path length across all rays
  - f_hdn: projection non-uniformity (range of max path lengths)
- Coarse-to-fine grid search: 10° initial grid over (θ, φ), top-3 refinement at 1°
- NIST XCOM material database with energy-dependent attenuation coefficients
- Beam filter presets (Cu, Al, Sn, Ti) with effective energy computation
- CT scanner presets for industrial and medical scanners (Nikon, GE, Zeiss, Siemens, Philips, dental CBCT)
- IntelliScan: adaptive projection allocation for high-variance orientations
- 3D viewport with mesh inspection, rotation, and per-face penetration heatmaps
- Contour plots and penetration roses for objective landscape visualization
- Energy recommendation from max path length and material properties
- JSON result export and PNG screenshot export with summary overlay
- STL and OBJ mesh parser with watertight validation
- Wails v2 desktop application with Go backend and Three.js/WebGL frontend

[0.1.0]: https://github.com/donrami/PenOpt/releases/tag/v0.1.0
