# Sprint 3 Spec: Analysis & Visualization

**Source:** Final Audit Report — Sprint 3 items 10-12  
**Methodology:** Spec-Driven Development (Requirements → Design → Tasks)  
**Duration:** 7 days estimated  
**Goal:** Add Radon space visualization, critical face identification, and Pareto front visualization

---

## Phase 1: Requirements

### User Story

As a PenOpt user analyzing CT scan quality, I want to:
1. **See a Radon space representation** of my mesh to understand which surface features will be well or poorly reconstructed
2. **Identify critical faces** that are never perpendicular to any X-ray path and will produce reconstruction artifacts
3. **Visualize the Pareto front** of multiobjective tradeoffs so I can choose an orientation that best balances f_mtl, f_energy, and f_hdn

### Acceptance Criteria

#### R1 — Radon Space Visualization
1. WHEN the user clicks "View Radon Space" THEN a 2D plot SHALL display each face as a line in Radon space (angle α vs. impact parameter p).
2. The Radon space plot SHALL show all face normals projected onto the 2D plane perpendicular to the rotation axis.
3. Gaps in Radon coverage SHALL be visually apparent (empty regions indicate poorly-reconstructed surfaces).
4. The plot SHALL use the current (θ, φ) orientation.
5. The plot SHALL be interactive: hovering over a Radon line SHALL highlight the corresponding face on the 3D mesh.
6. WHEN the mesh has more than 10,000 faces THEN the plot SHALL use a sampled subset to avoid overplotting.

#### R2 — Critical Face Identification
1. A face SHALL be flagged as "critical" when its normal is never perpendicular to any ray direction across all projection angles (i.e., it has no valid IntelliScan tangent angle).
2. Critical faces SHALL be highlighted in red on the 3D mesh.
3. A count of critical vs total faces SHALL be displayed in the results panel.
4. WHEN critical faces exceed 10% of total faces THEN a warning SHALL be displayed.
5. The critical face set SHALL update when the orientation (θ, φ) changes.

#### R3 — Pareto Front Visualization
1. WHEN multiple orientations are evaluated THEN a 2D scatter plot SHALL show each orientation as a point in (f_mtl, f_energy) space.
2. Non-dominated solutions (Pareto-optimal) SHALL be highlighted with a distinct marker.
3. The user SHALL be able to select a Pareto-optimal point to preview that orientation.
4. A third objective (f_hdn) SHALL be shown via color coding or a toggle.
5. The current best orientation SHALL be marked on the Pareto plot.

---

## Phase 2: Design

### Architecture

All three features are primarily **frontend visualizations**:
- **Radon space**: Canvas 2D plot (similar to contour/rose) + Go backend for Radon data computation
- **Critical faces**: Go backend computes per-face criticality → Three.js vertex colors (reuses heatmap rendering path)
- **Pareto front**: Canvas 2D scatter plot + data already available from `result.allScores`

### Go Backend Changes

New function in `internal/search/radon.go`:
```go
// RadonLine represents one face in Radon space.
type RadonLine struct {
    FaceIndex  int     `json:"faceIndex"`
    Alpha      float64 `json:"alpha"`      // angle in Radon space (degrees)
    P          float64 `json:"p"`           // impact parameter (mm)
    IsCritical bool    `json:"isCritical"`  // no tangent ray exists
}

// ComputeRadonSpace computes the Radon space representation of the mesh
// at orientation (theta, phi). Returns a RadonLine per face.
func ComputeRadonSpace(m *mesh.Mesh, theta, phi float64) []RadonLine
```

New function in `internal/search/intelliscan.go` (already exists — just promote the critical-face logic):
The `IsCritical` flag is derived from the existing face-computation logic: if `math.Abs(nx) < 0.01 && math.Abs(nz) < 0.01` after rotation, the face is critical.

### Frontend Components

#### Radon Plot (`frontend/src/radon.js`)
- Canvas 2D with lines from (α, 0) to (α, p_max) for each face
- α on x-axis (0-360°), p on y-axis (normalized to [0, 1])
- Color coding: non-critical faces blue, critical faces red
- Hover: show face index and (α, p) tooltip

#### Critical Face Highlighting (in `frontend/src/main.js`)
- Reuses the heatmap `applyHeatmap()` rendering path
- Instead of per-face penetration, colors critical faces red and non-critical faces blue
- Toggle between "Heatmap" and "Critical Faces" view modes

#### Pareto Plot (`frontend/src/pareto.js`)
- Canvas 2D scatter plot
- Each point = one evaluated orientation
- x-axis: f_mtl (normalized), y-axis: f_energy (normalized)
- Color: f_hdn (normalized) via a blue→red gradient
- Pareto front: line connecting non-dominated points
- Click on a Pareto-optimal point → preview that orientation on the 3D mesh

---

## Phase 3: Tasks

### Task 3.1 — Implement Radon space computation (Go backend)

**Files:** `internal/search/radon.go` (new)

**Estimate:** 1 day
**Requirements:** R1

### Task 3.2 — Implement Radon plot (frontend)

**Files:** `frontend/src/radon.js` (new), `frontend/index.html` (new tab)

**Estimate:** 1 day
**Requirements:** R1

### Task 3.3 — Implement critical face detection

**Files:** `internal/search/intelliscan.go`, `app.go`

**Estimate:** 1 day
**Requirements:** R2

### Task 3.4 — Implement critical face 3D rendering

**Files:** `frontend/src/main.js`, `frontend/src/style.css`

**Estimate:** 1 day
**Requirements:** R2

### Task 3.5 — Implement Pareto front computation and plot

**Files:** `frontend/src/pareto.js` (new), `frontend/src/main.js`, `frontend/index.html`

**Estimate:** 2 days
**Requirements:** R3

### Task 3.6 — Tests for Radon, critical faces, Pareto

**Files:** `internal/search/radon_test.go`, `internal/search/intelliscan_test.go`

**Estimate:** 1 day
**Requirements:** R1, R2, R3
