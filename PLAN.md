# PenOpt Enhancement Plan: Towards Scientifically Rigorous CT Scan Orientation Optimization

## Scope
This plan outlines a series of improvements to PenOpt to address critical gaps in scientific fidelity, usability, and workflow integration. The goal is to transform PenOpt from a research prototype into a validated tool suitable for industrial CT scan planning, with particular focus on:
1. Integrating physics-based reconstruction constraints (Tuy completeness)
2. Improving beam-hardening and energy modeling
3. Aligning algorithm parameters with cited methodology (Ito et al. 2020)
4. Adding expert controls and validation features
5. Enabling reconstruction simulation and protocol export
6. Ensuring transparency and reproducibility

## Specifications (Backed by Research)

### 1. Tuy Completeness Integration
**Problem**: Current implementation computes Tuy's completeness metric (`fTuy`) but excludes it from the multi-objective score, risking selection of orientations that violate exact reconstruction conditions.
**Spec**: 
- Implement Tuy completeness as a **hard constraint** (Tuy ≥ 1.0) OR as a weighted objective in the score function.
- Provide user toggle between constraint and weighted modes.
- Reference: Tuy (1983) *An exact inversion formula for cone-beam reconstruction*; Definition: For a point *x* to be reconstructible, every plane through *x* must intersect the object's support. In discrete terms, for each projection angle, the line integral through the object must be non-zero for all rays passing through the reconstruction volume.
**Implementation**: 
- For each orientation, compute Tuy's completeness number as the minimum over all projection angles of the ratio of the object's width in the direction perpendicular to the ray to the detector bin size (or use the continuous definition via Radon transform coverage).
- Penalize orientations where Tuy < 1.0 heavily in the score (if weighted) or filter them out (if constraint).

### 2. Beam-Hardening and Spectral Modeling
**Problem**: Current `f_hdn` (range of per-projection max path length) is a poor surrogate for beam-hardening effects, which depend on polychromatic spectrum and object composition.
**Spec**:
- Implement a **polyenergetic beam-hardening correction** during projection simulation.
- Allow user to select beam filter material/thickness and compute effective energy spectrum via NIST XCOM.
- Reference: 
  - Boone & Seibert (1997) *An accurate method for computer-generating tungsten anode x-ray spectra from 30 to 140 kV*.
  - Hsieh (2003) *Computed Tomography: Principles, Design, Artifacts, and Recent Advancements* (Ch. 3 on beam hardening).
  - Grass et al. (2006) *Experimental evaluation of a bowtie filter for flat-detector CT*.
**Implementation**:
- For each ray path, compute attenuation using the Beer-Lambert law with energy-dependent μ(E): 
  `I = I0 * exp(-∫μ(E, s) ds)`
- Approximate spectrum as discrete bins; compute transmitted intensity per bin; integrate over spectrum to get polychromatic signal.
- Derive effective path length or compute beam-hardening artifact metric (e.g., variance of effective energy across projections).
- Replace or augment `f_hdn` with this metric.

### 3. Algorithmic Fidelity to Ito et al. 2020
**Problem**: Grid step size is hardcoded to 15° vs. Ito's 10°; IntelliScan not implemented.
**Spec**:
- Make coarse grid step size user-configurable (default 10° to match Ito et al. 2020).
- Implement **IntelliScan**: adaptive projection allocation based on orientation variance during coarse search.
- Reference: 
  - Ito et al. (2020) *Optimization of X-ray CT scanning orientation for additive manufactured parts using ray casting* (Section 2.4: coarse-to-fine grid search).
  - Definition of IntelliScan: Allocate more projection samples to orientations showing high variance in path length (indicating potential for beam-hardening artifacts) and fewer to uniform orientations.
**Implementation**:
- Coarse search: Evaluate orientations at user-defined step (e.g., 10°) over search range.
- For each orientation, compute variance of path lengths across detector pixels.
- Sort coarse orientations by variance descending; allocate projection budget (total projections fixed) such that high-variance orientations get more samples (e.g., linear or exponential weighting).
- During fine search, use allocated projection counts per candidate orientation.

### 4. Reconstruction Simulation & Artifact Prediction
**Problem**: No way to visualize expected reconstruct quality (streaking, shading) from optimized orientation.
**Spec**:
- Add a **"Reconstruction Preview"** tab that simulates FBP reconstruction from the projected data at the optimal orientation.
- Display reconstructed slices with artifact metrics (e.g., RMSE vs. ground truth if available, or uniform region variance).
- Reference:
  - Kak & Slaney (2001) *Principles of Computerized Tomographic Imaging* (Ch. 3: FBP algorithms).
  - Yu & Wang (2012) *Compressed sensing based interior tomography*.
**Implementation**:
- At optimal orientation, generate sinogram using current ray casting (with spectral modeling if enabled).
- Apply FBP (filtered back-projection) with Ram-Lak or Hann filter.
- Display central slice; optionally allow user to navigate slices.
- Compute and display artifact metrics: 
  - *Shading*: Standard deviation of uniform background region.
  - *Streaking*: Entropy of gradient magnitude in edge-preserving filtered image.
  - *Cupping*: Difference between center and edge mean in uniform cylinder simulation (if applicable).

### 5. Scanner Protocol Export
**Problem**: No direct export to scanner control software, requiring manual parameter transfer.
**Spec**:
- Add export functionality for optimized parameters to common scanner formats:
  - Zeiss METROTOM: `.xcf` XML format
  - Nikon CT Pro: `.txt` protocol file
  - Generic: XML/JSON with SDD, SOD, kV, μA, exposure time, filter, detector binning, orientation (θ, φ)
- Reference: 
  - Scanner vendor manuals (e.g., Zeiss METROTOM 1500 Operating Manual, Section on Protocol Exchange).
**Implementation**:
- Define mapping from PenOpt parameters (kV estimated from max path length + material, exposure time based on noise requirements) to vendor-specific protocol structures.
- Provide template files for each vendor; populate with optimized values.
- Allow user to adjust exported parameters (e.g., exposure time) before saving.

### 6. Expert Controls & Transparency
**Problem**: Critical parameters are hidden or opaque, hindering expert validation.
**Spec**:
- Expose and document all algorithmic parameters:
  - Coarse/fine grid step sizes (separate controls)
  - Number of projections (angular sampling)
  - Rays per projection (detector sampling)
  - Weight tuning (sliders for w_mtl, w_energy, w_hdn, w_tuy with normalization)
  - Beam-hardening model toggle (monochromatic/polyenergetic)
  - Tuy handling mode (constraint/weighted/off)
- Add real-time feedback:
  - Current grid size (e.g., "Evaluating 81 orientations at 10° step")
  - Estimated time remaining
  - Convergence indicators (score change between iterations)
- Reference: 
  - AAPM Report No. 96 (2002) *Specification and acceptance testing of computer-aided diagnosis systems* (for transparency in medical imaging tools; analogous principles for industrial CT).
  - ISO/ASTM 52902:2019 *Standard Specification for Additive Manufacturing Design: Test Artifact* (for validation benchmark).

### 7. Batch Processing & Session Management
**Problem**: No support for optimizing multiple parts or saving/resuming sessions.
**Spec**:
- Implement **batch mode**: 
  - Accept folder of meshes (STL/OBJ/3MF)
  - Option to cluster similar parts (by bounding box aspect ratio, volume) to reduce redundant optimizations
  - Export results as CSV summary and individual JSONs
- Enhance session management:
  - Save/load full state (mesh, config, results, UI state)
  - Auto-save on interval
  - Reference: 
    - Godin et al. (2002) *Using clusters for incremental transmission of complex 3D models* (for mesh clustering in batch processing).

### 8. Uncertainty & Sensitivity Analysis
**Problem**: No quantification of how material/mesh uncertainties affect the optimal orientation.
**Spec**:
- Add **Monte Carlo uncertainty analysis**:
  - Sample material density (±user-defined %), mesh vertex noise (±tolerance)
  - Re-run optimization for each sample; report distribution of optimal (θ, φ) and score
  - Display as heatmap or confidence region on contour plot
- Reference:
  - Berger et al. (2017) *Uncertainty quantification in X-ray computed tomography: A review*.
  - Singh et al. (2020) *Sensitivity analysis of CT scan parameters on measurement uncertainty in additive manufacturing*.

## Design

### Architectural Overview
PenOpt follows a Wails v2 architecture (Go backend, Three.js frontend). Changes will be made in:

#### Backend (Go)
- `internal/objectives/`: 
  - Add `FTuy` computation (if not already present)
  - Add `FBh` (beam-hardening metric) computation
  - Modify `CombinedScore` to include Tuy and beam-hardening terms
  - Add constraint handling for Tuy
- `internal/search/`:
  - Modify `Run` to accept step size, projection allocation strategy (IntelliScan), and spectral model flag
  - Implement adaptive projection allocation
  - Add uncertainty analysis wrapper (calling `Run` multiple times with perturbed inputs)
- `internal/raycaster/`:
  - Extend `ComputeTransmissionLengths` to accept energy spectrum (for polyenergetic mode)
  - Return additional data: variance of path lengths per projection (for IntelliScan), energy-resolved transmission if needed
- `internal/physics/`:
  - Add NIST XCOM-based spectrum generator (given kV, filter)
  - Implement polyenergetic attenuation calculation
- `internal/app/` (or new package):
  - Add reconstruction simulator (FBP) using projected data from raycaster
  - Add protocol exporters for vendor formats

#### Frontend (JavaScript/Three.js)
- `state.js`: 
  - Add new state variables: `gridStepCoarse`, `gridStepFine`, `numProjections`, `raysPerProjection`, `weights` (array), `spectralModel`, `tuyMode`, `batchMode`, etc.
  - Add undo/redo stack for session management
- `optimizer.js`:
  - Update `RunOptimization` to pass new parameters to backend
  - Handle batch processing loop
  - Manage uncertainty analysis workflow
- `scene.js`:
  - Add reconstruction preview viewport (second Three.js scene or overlay)
  - Implement FBP renderer (using Three.js for texture-based backprojection or custom shader)
  - Display artifact metrics overlay
- `plots.js`:
  - Extend contour/rose plots to show uncertainty bands (from Monte Carlo)
  - Add interactive crosshair for value probing
- `materials.js`:
  - Add beam filter editor (material/thickness)
  - Add spectrum preview plot (optional)
- `export.js`:
  - Add vendor protocol export functions
  - Add batch CSV/JSON export
- `main.js`:
  - Handle session save/load (localStorage or file)
  - Auto-save on interval
- `index.html`:
  - Add new controls in Scanner accordion (grid steps, projections, rays)
  - Add Reconstruction tab next to Contour/Rose
  - Add Batch Processing dialog
  - Add Uncertainty Analysis panel

### Data Flow Changes
1. **Optimization Request**: 
   - Frontend collects: mesh, scanner config, material, weights, grid steps, projections, rays, spectral model, Tuy mode, etc.
   - Sends to backend via `RunOptimization` (Wails binding)
2. **Backend Processing**:
   - Validate inputs
   - If batch/uncertainty mode: loop over perturbed inputs or mesh list
   - For each case:
     - Generate orientation grid (coarse/fine) based on step sizes
     - If IntelliScan: compute path-length variance during coarse pass to allocate projections
     - If spectral model: generate energy spectrum; raycaster computes polyenergetic transmission
     - Compute objectives (including Tuy and beam-hardening metrics)
     - Apply normalization and weighting (with Tuy constraint if selected)
     - Find best orientation
     - If reconstruction preview requested: generate sinogram → FBP → send slice data to frontend
   - Aggregate results (for batch/uncertainty: compute statistics)
3. **Frontend Display**:
   - Update 3D view with optimal orientation heatmap
   - Show contour/rose plots with uncertainty bands
   - If reconstruction tab active: display FBP slice and artifact metrics
   - Enable export buttons (JSON, PNG, vendor protocol)

## Tasks (with Checks)

Each task is defined with a clear "Done" criterion. Tasks are grouped by subsystem but may be implemented in any order; dependencies are noted.

### Backend Tasks

**Task B1: Implement Tuy Completeness as Constraint/Objective**
- [ ] Compute Tuy completeness number for a given orientation and mesh (using continuous definition via projection width or discrete Radon coverage)
- [ ] Add toggle in `Run` signature: `tuyMode` (enum: OFF, WEIGHTED, CONSTRAINT)
- [ ] If CONSTRAINT: filter out orientations with Tuy < 1.0 before scoring; if none feasible, return error
- [ ] If WEIGHTED: add `wTuy` weight to `CombinedScore`; normalize Tuy to [0,1] range (1.0 = perfect)
- [ ] Unit test: verify Tuy ≥ 1.0 for known reconstructible orientations (e.g., sphere aligned with axes)
- [ ] Check: Backend builds and runs without error; Tuy metric appears in `OrientationRaw` and influences score per mode

**Task B2: Implement Polyenergetic Beam-Hardening Model**
- [ ] Add spectrum generator in `internal/physics/` (function `GenerateSpectrum(kV, filterMaterial, filterThickness_mm) -> []EnergyBin`)
- [ ] Extend `raycaster.ComputeTransmissionLengths` to accept spectrum and return:
  - `MeanLengths`: average path length weighted by spectrum
  - `LengthVariance`: variance of effective path length per projection (for beam-hardening metric)
  - Or compute `PolychromaticSignal` directly: `∫ I0(E) * exp(-∫ μ(E,s) ds) dE`
- [ ] Define beam-hardening metric `FBh` as: 
  - Option A: Standard deviation of `MeanLengths` across projections
  - Option B: Entropy of spectrum shift (more physically accurate)
  - Choose based on literature and validation feasibility
- [ ] Add `FBh` to `Objective` struct and `CombinedScore`
- [ ] Unit test: verify `FBh` increases with anisotropic object (e.g., cylinder tilted) vs. isotropic (sphere)
- [ ] Check: Backend builds; spectral model toggle affects optimization results for heterogeneous objects

**Task B3: Align Grid Search with Ito et al. 2020 & Implement IntelliScan**
- [ ] Modify `generateSearchGrid` to accept step size parameter (default 10.0°)
- [ ] Remove hardcoded 15° step; use user-provided `coarseStep` and `fineStep` (with fineStep = coarseStep / 10? or user-defined)
- [ ] Implement IntelliScan:
  - During coarse search, compute variance of path lengths per orientation (across detector pixels)
  - Sort orientations by variance descending
  - Allocate total projection budget (fixed `numProjections`) such that high-variance orientations get more samples (e.g., `allocated[i] = total * (variance[i] / sum(variance))` with min/max clamping)
  - Pass allocated counts to fine search per candidate orientation
- [ ] Add backend parameters: `coarseStep`, `fineStep`, `numProjections`, `useIntelliScan`
- [ ] Unit test: verify grid point count matches expectation (e.g., 45° range, 10° step → 9×9=81)
- [ ] Check: Optimization results change when IntelliScan enabled; log shows varying projection counts per orientation

**Task B4: Add Reconstruction Simulator (FBP)**
- [ ] Create new package `internal/recon/` with function `FBPSinogramToSlice(sinogram [][]float64, angles []float64, filter string) -> [][]float64`
- [ ] Implement Ram-Lak or Hann filter in Fourier space (or spatial domain via convolution)
- [ ] Use Three.js or pure Go for computation; output grayscale slice
- [ ] Integrate with `optimizer.Run`: if `reconstructPreview` flag set, generate sinogram at best orientation, run FBP, return slice data
- [ ] Unit test: verify FBP of a known phantom (e.g., Shepp-Logan) approximates input
- [ ] Check: Backend returns valid slice data; no panics

**Task B5: Add Scanner Protocol Exporters**
- [ ] Define struct `ScannerProtocol` with fields: kV, μA, exposureTimeMs, filter, SDD, SOD, detectorBinning, orientation (θ, φ)
- [ ] Implement marshaling to:
  - Zeiss `.xcf`: XML template based on METROTOM 1500 manual
  - Nikon `.txt`: key-value format from CT Pro manual
  - Generic JSON/XML
- [ ] Add function `ExportProtocol(protocol ScannerProtocol, format string) -> ([]byte, error)`
- [ ] Unit test: verify exported file can be parsed by vendor software (or at least is well-formed)
- [ ] Check: Frontend can trigger export and save file; content matches expected format

**Task B6: Batch Processing & Uncertainty Analysis**
- [ ] Add `RunBatch` function: 
  - Accept []mesh paths, cluster by bounding box similarity (optional)
  - For each mesh (or cluster representative), run optimization with shared config
  - Return []Result with mesh ID
- [ ] Add `RunUncertainty` function:
  - Accept base config, material density ±%, mesh noise ±%
  - Generate N perturbed configs (lognormal or uniform sampling)
  - Run optimization for each; collect optimal (θ, φ) and score
  - Return mean, stddev, confidence ellipse
- [ ] Unit test: batch runs without crashing; uncertainty returns sensible statistics
- [ ] Check: Backend handles large batches efficiently (e.g., progress reporting)

### Frontend Tasks

**Task F1: Expose Expert Controls in UI**
- [ ] In Scanner accordion:
  - Add slider: Coarse Grid Step (°) [5, 15], step 1°, default 10°
  - Add slider: Fine Grid Step (°) [1, 5], step 0.5°, default 1° (or derive from coarse)
  - Add slider: Number of Projections [36, 180], step 6°, default 90
  - Add slider: Rays per Projection [32, 512], step 32, default 128
  - Add toggles: Spectral Model (on/off), IntelliScan (on/off)
  - Add Tuy Mode selector: Off / Weighted / Constraint
  - If Weighted: add four sliders for weights (w_mtl, w_energy, w_hdn, w_tuy) that auto-normalize to sum=1
- [ ] Add real-time feedback below controls:
  - "Grid Size: {{coastPoints}} × {{phiPoints}} = {{total}} orientations"
  - "Est. Time: {{time}}s (based on {{meshTriangles}} triangles)"
- [ ] Check: All controls update `state.js`; changes persist to localStorage; taking effect on next optimization

**Task F2: Implement Reconstruction Preview Tab**
- [ ] Add new tab "Reconstruction" next to Contour/Rose
- [ ] Create Three.js scene for slice display (orthogonal slices or volume rendering)
- [ ] Receive slice data from backend (float32 grayscale); convert to texture; display on plane
- [ ] Add controls:
  - Slice navigator (slider for Z-index if volume)
  - Colormap selector (grayscale, hot, cool)
  - Artifact metrics display: 
    - Shading (STD of uniform ROI)
    - Streaking (entropy of gradient magnitude)
    - Cupping (if applicable: center-edge mean diff in cylinder sim)
- [ ] Check: Tab loads without error; shows meaningful reconstruction when optimization complete; metrics update with orientation changes

**Task F3: Enhance Plots with Uncertainty & Interaction**
- [ ] Modify contour plot to show:
  - Mean score contour (solid line)
  - Uncertainty band (dashed lines for ±1std) if uncertainty data available
- [ ] Modify rose plot to show:
  - Mean vector
  - Confidence sector (angular spread)
- [ ] Add crosshair: on hover, show exact (θ, φ, score) in tooltip; on click, lock crosshair and update 3D view heatmap to that orientation
- [ ] Check: Plots render correctly; interaction smooth; uncertainty bands appear when backend provides uncertainty data

**Task F4: Batch Processing & Session Management UI**
- [ ] Add "Batch Process" button in main toolbar:
  - Opens dialog: 
    - Folder picker for input meshes
    - Output folder picker
    - Checkboxes: cluster similar parts, save individual JSONs, save summary CSV
    - Reuse optimization config from current state
  - On start: show progress bar (current/total, current mesh name)
  - On finish: show summary table (mesh, optimal θ, φ, score, time)
- [ ] Enhance session management:
  - Add "Save Session" and "Load Session" buttons (toolbar)
  - Session file: JSON containing full `state.js` plus current mesh data (base64) or mesh file path
  - Auto-save every 5 minutes to localStorage (key: `penopt-autosave`)
  - On load: restore state and mesh (if file still exists)
- [ ] Check: Batch completes without errors; session restore works after restart; auto-save recovers unsaved work

**Task F5: Export & Import Enhancements**
- [ ] In Export menu:
  - Add options: "Export as Zeiss Protocol (.xcf)", "Export as Nikon Protocol (.txt)", "Export Generic JSON"
  - Add "Export Reconstruction Preview as PNG" (current slice)
  - Add "Export All Slices as TIFF stack" (if volume reconstruction implemented)
- [ ] Improve Import:
  - Add support for 3MF and PLY formats (via `github.com/go-gl/mathgl/mgl32` or `github.com/g3n/engine/loader`)
  - Validate mesh is watertight; warn if not
- [ ] Check: Exported files are valid and usable; imported meshes load correctly

**Task F6: Help System Updates**
- [ ] Update in-app help (accessible via ? button) to reflect new features:
  - Explain each new control (grid steps, projections, etc.) with tooltips and help text
  - Add section: "Scientific Basis" detailing Tuy completeness, beam-hardening model, and Ito et al. alignment
  - Add tutorial: "Optimizing a Lithium-Ion Battery Electrode" (example multi-material part)
  - Add FAQ: "Why is my optimal orientation near the boundary?" linking to search range advice
- [ ] Check: Help opens without error; content accurate and comprehensive

### Integration & Validation Tasks

**Task V1: Algorithm Validation Against Ito et al. 2020**
- [ ] Obtain test meshes from Ito et al. paper (if available) or use simple geometries (cylinder, bracket)
- [ ] Run PenOpt with:
  - Coarse step = 10°, fine step = 1°, search range = 45°
  - Weights: match those used in paper (if reported) or use equal weights
  - Spectral model: off (monochromatic, as in paper)
  - Tuy mode: off (paper did not consider Tuy? verify)
- [ ] Compare PenOpt's optimal (θ, φ) and score landscape to paper's Fig. 4/5
- [ ] Check: Results match within reasonable tolerance (e.g., 2° in angle, 5% in score) due to implementation differences (BVH vs. their ray caster)

**Task V2: Physical Scan Validation (If Feasible)**
- [ ] Partner with a local CT lab or use available scanner (e.g., university micro-CT)
- [ ] Select test parts: 
  - Homogeneous: nylon cylinder, aluminum bracket
  - Heterogeneous: 3D-printed composite part, multimaterial implant
- [ ] For each part:
  - Run PenOpt to get optimal orientation
  - Scan part at PenOpt orientation and at 3-5 alternative orientations (including worst)
  - Reconstruct scans; measure artifact levels (e.g., background STD, edge sharpness)
- [ ] Check: PenOpt orientation shows significantly lower artifacts than alternatives (p<0.05, t-test)

**Task V3: Code Quality & Documentation**
- [ ] Go backend: 
  - Add package comments explaining physics basis
  - Ensure all new functions have unit tests (target 80% coverage)
  - Run `go vet` and `golint`
- [ ] Frontend:
  - Add JSDoc comments for new functions
  - Run ESLint
  - Bundle size check: ensure <5MB gzipped
- [ ] Documentation:
  - Update `README.md` with new features, usage examples, and validation results
  - Add `SCIENCE.md` detailing equations and references
  - Add `PROTOCOLS.md` explaining exported format structure
- [ ] Check: All documentation builds without errors; no linting errors

## Update Plan for README and In-App Help
*Note: These updates are to be performed by the agent after implementing the plan, as per user request.*
- **README.md**:
  - Rewrite "Features" section to list new capabilities (Tuy constraint, spectral model, reconstruction preview, etc.)
  - Update "Algorithm" section to reflect Ito et al. alignment and new models
  - Add "Validation" subsection with results from Tasks V1-V2
  - Update "Requirements" if new dependencies added (e.g., for 3MF loading)
  - Add "Citation" section if publishing this work
- **In-App Help**:
  - As outlined in Task F6: comprehensive, context-sensitive help accessible via UI
  - Include glossary of terms (Tuy, beam-hardening, etc.)
  - Link to `SCIENCE.md` and `PROTOCOLS.md` for deep dives

## Dependencies & Risks
- **Dependencies**:
  - Go: `github.com/mojocn/base64Captcha` (if needed for captcha? likely not), `github.com/golang/geo/s2` (for spherical geometry in Tuy calc?) - actually, Tuy calc may only need linear algebra; use existing `internal/vec`
  - Consider `github.com/go-gl/mathgl/mgl32` for 3D math if not already present
  - For 3MF/PLY loading: `github.com/g3n/engine/loader` or `github.com/hajimehoshi/ebiten/v2` (if using Ebiten) - but we use Three.js frontend; mesh loading is in `frontend/filehandler.js` which may use STL/OBJ parsers. May need to add new parsers or use `three.js` loaders.
    - Three.js has STL/OBJ loaders; for 3MF/PLY, may need to add loaders or convert via external tool. Simpler: rely on user to convert to STL/OBJ, or use `three.js` examples for additional loaders.
  - For FBP: may need FFT implementation; use `github.com/mjibson/fft` or implement simple DFT for small sizes (sinogram width typically <2000).
- **Risks**:
  - **Scope creep**: Plan is ambitious; prioritize core scientific fixes (Tuy, beam-hardening, Ito alignment) first.
  - **Validation difficulty**: Physical scan validation requires lab access; may need to rely on simulation validation first.
  - **Performance**: Polyenergetic simulation and FBP are computationally heavy; may need to optimize (e.g., GPU acceleration via WebGL in frontend for FBP).
  - **User complexity**: Many new controls risk overwhelming novice users; mitigate with presets (Beginner/Expert mode) and tooltips.

## Phased Implementation Suggestion
Given scope, suggest implementing in phases:

**Phase 1: Core Scientific Fidelity**
- B1 (Tuy constraint/objective)
- B2 (Beam-hardening model - start with monochromatic `f_hdn` improvement if polyenergetic too heavy initially)
- B3 (Grid step to 10°, IntelliScan)
- F1 (Expose core controls: grid steps, projections, rays, weights, Tuy mode)
- V1 (Validation against Ito)
- Update README/help

**Phase 2: Reconstruction & Export**
- B4 (Reconstruction simulator)
- B5 (Protocol exporters)
- F2 (Reconstruction tab)
- F5 (Export options)
- Internal validation (check reconstruction quality)

**Phase 3: Advanced Workflow**
- B6 (Batch/uncerainty)
- F3 (Plot enhancements with uncertainty)
- F4 (Batch UI, session management)
- F6 (Help system)
- V2 (Physical validation if possible)

**Phase 4: Polish & Documentation**
- V3 (Code quality, linting, docs)
- Final README/help update

---

This plan provides a rigorous, evidence-based path forward for PenOpt. By addressing the identified gaps with specific, verifiable tasks, the agent can systematically evolve the tool into a scientifically sound and practically useful industrial CT orientation optimizer.