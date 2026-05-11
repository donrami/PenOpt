# Sprint 2 Spec: Completeness — Butzhammer Method B + Surface-Fraction Coverage

**Source:** Final Audit Report — Sprint 2 items 5-6  
**Methodology:** Spec-Driven Development (Requirements → Design → Tasks)  
**Duration:** 4 days estimated  
**Goal:** Implement Butzhammer 2026 Method B (complex geometry variant) with configurable surface-fraction coverage

---

## Phase 1: Requirements

### User Story

As a PenOpt user scanning geometrically complex parts (internal cavities, deep undercuts, thin walls), I want to select a subset of IntelliScan angles that cover a configurable percentage of the surface, so that I can trade off coverage completeness against scan time. The algorithm should identify which surface features are poorly covered and prioritize angles that cover the most surface first.

### Acceptance Criteria (EARS Format)

#### B1 — Surface-Fraction Coverage Parameter
1. WHEN the user specifies a coverage fraction f (0 < f ≤ 1) THEN `ComputeIntelliScanAngles()` SHALL select a subset of angles that covers at least f × 100% of the mesh surface.
2. WHEN f = 1.0 THEN the behavior SHALL be identical to Method A (100% coverage).
3. WHEN f < 0.01 THEN the result SHALL be a warning that such low coverage produces unreliable results.
4. WHEN f > 1.0 THEN the function SHALL clamp to 1.0.

#### B2 — Greedy Angle Selection (Method B Core)
1. WHEN selecting angles for fractional coverage THEN the algorithm SHALL use a greedy approach: iteratively pick the angle that covers the most uncovered faces, then deduplicate.
2. WHEN multiple angles cover the same number of new faces THEN the algorithm SHALL prefer the one closest to the already-selected set (to minimize angular gaps).
3. WHEN all faces can be covered with fewer angles than the target fraction THEN the algorithm SHALL return only those angles (no redundant angles).

#### B3 — Adaptive Tolerance
1. WHEN a face's tangent angle falls within ε degrees of an already-selected angle AND the face is not yet covered THEN the face SHALL be considered covered if the remaining angular gap is within tolerance.
2. The tolerance ε SHALL default to 1.5° (matching current dedup) but accept a wider range for fractional coverage mode (up to 5°).

#### B4 — Coverage Report
1. The IntelliScanResult SHALL include a `CoveragePercent` field showing the actual surface fraction covered.
2. The result SHALL include a `CoveredFaces` count and `UncoveredFaces` count.
3. WHEN significant surface features are uncovered (more than 5% of faces) THEN a warning SHALL be included.
4. The result SHALL include a `CoverageByAngle` array showing how many faces each angle covers (newly added, not cumulative).

#### B5 — Backward Compatibility
1. WHEN Method B is NOT explicitly requested THEN the function SHALL default to Method A behavior (complete coverage, existing signature).
2. ALL existing tests SHALL continue to pass without modification.

---

## Phase 2: Design

### Architecture Overview

The current `ComputeIntelliScanAngles()` implements Method A: compute all tangent angles for all faces → deduplicate → return. Method B adds a **greedy selection layer** on top.

```
Method A flow:
  Face normals → compute α per face → dedup → return sorted list

Method B flow:
  Face normals → compute α per face → group by angle (tolerance buckets)
  → greedy selection: pick angle covering most uncovered faces
  → repeat until coverage ≥ target_fraction
  → report coverage statistics
```

### New Types

```go
// IntelliScanConfig controls the IntelliScan algorithm behavior.
// When not provided, Method A is used (backward compatible).
type IntelliScanConfig struct {
    CoverageFraction float64 // target surface coverage (0, 1]; 1.0 = Method A
    AngleTolerance   float64 // dedup tolerance in degrees (default: 1.5)
    MethodB          bool    // true = Method B (greedy), false = Method A
}

// CoverageInfo provides per-angle and aggregate coverage statistics.
type CoverageInfo struct {
    CoveragePercent float64            `json:"coveragePercent"`
    TotalFaces      int                `json:"totalFaces"`
    CoveredFaces    int                `json:"coveredFaces"`
    UncoveredFaces  int                `json:"uncoveredFaces"`
    CoverageByAngle []AngleCoverage    `json:"coverageByAngle,omitempty"`
}

// AngleCoverage describes how many new faces an angle covers.
type AngleCoverage struct {
    Angle       float64 `json:"angle"`
    NewFaces    int     `json:"newFaces"`
    Cumulative  int     `json:"cumulative"`
}
```

### Modified Result

The `IntelliScanResult` struct gains:

```go
type IntelliScanResult struct {
    // ... existing fields ...
    
    // Method B / coverage fields (populated when config.MethodB is true)
    Config          *IntelliScanConfig `json:"config,omitempty"`
    Coverage        *CoverageInfo      `json:"coverage,omitempty"`
}
```

### Algorithm Design: Greedy Selection (Method B)

```go
func computeIntelliScanAnglesMethodB(m *mesh.Mesh, theta, phi float64, config IntelliScanConfig) IntelliScanResult {
    // Step 1: Compute tangent angles for all faces (same as Method A)
    // Returns: for each face, its two tangent angles (α1, α2)
    faceAngles := computeFaceTangentAngles(m, theta, phi)
    
    // Step 2: Bucket faces by their tangent angles
    // Tolerance = config.AngleTolerance (default 1.5°)
    // For each unique angle bucket, track which faces it covers
    buckets := make(map[float64][]int) // angle → face indices
    
    // Step 3: Greedy selection
    selected := []float64{}
    coveredFaces := make(map[int]bool)
    coverageByAngle := []AngleCoverage{}
    
    targetCoverage := int(config.CoverageFraction * float64(numFaces))
    
    for len(coveredFaces) < targetCoverage && len(buckets) > 0 {
        // Find the angle bucket that covers the most NEW (uncovered) faces
        bestAngle := 0.0
        bestNewCount := -1
        
        for angle, faces := range buckets {
            newCount := countUncovered(faces, coveredFaces)
            if newCount > bestNewCount {
                bestNewCount = newCount
                bestAngle = angle
            } else if newCount == bestNewCount && newCount > 0 {
                // Tie-breaker: prefer angle closer to already-selected set
                if isCloserToSelected(angle, bestAngle, selected) {
                    bestAngle = angle
                }
            }
        }
        
        if bestNewCount <= 0 {
            break // No more faces can be covered
        }
        
        // Mark faces as covered
        for _, fi := range buckets[bestAngle] {
            coveredFaces[fi] = true
        }
        
        selected = append(selected, bestAngle)
        delete(buckets, bestAngle) // Remove selected bucket
        
        coverageByAngle = append(coverageByAngle, AngleCoverage{
            Angle:      bestAngle,
            NewFaces:   bestNewCount,
            Cumulative: len(coveredFaces),
        })
    }
    
    // Step 4: Build result
    sort.Float64s(selected)
    
    return IntelliScanResult{
        Angles:         selected,
        Count:          len(selected),
        // ... other fields ...
        Coverage: &CoverageInfo{
            CoveragePercent: float64(len(coveredFaces)) / float64(numFaces) * 100,
            TotalFaces:      numFaces,
            CoveredFaces:    len(coveredFaces),
            UncoveredFaces:  numFaces - len(coveredFaces),
            CoverageByAngle: coverageByAngle,
        },
    }
}
```

### Angle Bucketing

The key data structure: a map from angle → list of face indices.

```go
// computeFaceTangentAngles computes α for every face and buckets them.
func computeFaceTangentAngles(m *mesh.Mesh, theta, phi float64) map[float64][]int {
    buckets := make(map[float64][]int)
    
    for fi, tri := range m.Triangles {
        // Compute normal (same as current code)
        nx, ny, nz := computeRotatedNormal(tri, theta, phi)
        
        // Skip degenerate and Y-aligned faces
        if math.Abs(nx) < 0.01 && math.Abs(nz) < 0.01 {
            continue
        }
        
        // α = atan2(nx, nz), normalized to [0, 360)
        alpha1 := math.Atan2(nx, nz) * 180 / math.Pi
        if alpha1 < 0 { alpha1 += 360 }
        
        // Round to nearest 0.5° for bucketing
        rounded := math.Round(alpha1*2) / 2
        buckets[rounded] = append(buckets[rounded], fi)
        
        // Add α + 180° too
        alpha2 := alpha1 + 180
        if alpha2 >= 360 { alpha2 -= 360 }
        rounded2 := math.Round(alpha2*2) / 2
        buckets[rounded2] = append(buckets[rounded2], fi)
    }
    
    return buckets
}
```

### Integration with Existing Code

The existing `ComputeIntelliScanAngles()` will get a new optional parameter:

```go
// ComputeIntelliScanAngles finds tangent-ray projection angles.
// If config is nil, Method A is used (existing behavior).
func ComputeIntelliScanAngles(m *mesh.Mesh, theta, phi float64, config *IntelliScanConfig) IntelliScanResult
```

To maintain backward compatibility:
- **Go callers** passing nil → Method A (unchanged behavior, all tests pass)
- **Frontend** can optionally pass config for Method B
- **Existing tests** use nil → no changes needed

### Frontend Integration

The frontend card (`renderIntelliScan`) displays the coverage info when available:

```js
if (result.intelliScan.coverage) {
    html += '<div class="is-coverage">';
    html += `<span>Coverage: ${result.intelliScan.coverage.coveragePercent.toFixed(1)}%</span>`;
    html += `<span>(${result.intelliScan.coverage.coveredFaces} / ${result.intelliScan.coverage.totalFaces} faces)</span>`;
    if (result.intelliScan.coverage.uncoveredFaces > 0) {
        html += `<span class="is-warning">⚠ ${result.intelliScan.coverage.uncoveredFaces} faces uncovered</span>`;
    }
    html += '</div>';
}
```

A new "Coverage" slider (0.5–1.0) in the IntelliScan card lets users select the target fraction.

---

## Phase 3: Tasks

### Task 2.1 — Define IntelliScanConfig and CoverageInfo types

**Files:** `internal/search/intelliscan.go`

**Sub-tasks:**
- [ ] 2.1.1 Add `IntelliScanConfig` struct with `CoverageFraction`, `AngleTolerance`, `MethodB` fields
- [ ] 2.1.2 Add `CoverageInfo` and `AngleCoverage` structs
- [ ] 2.1.3 Add `Config` and `Coverage` fields to `IntelliScanResult`
- [ ] 2.1.4 Update `IntelliScanResult` JSON tags

**Requirements:** B1, B4  
**Estimate:** 30 min

### Task 2.2 — Extract face tangent angle computation

**Files:** `internal/search/intelliscan.go`

**Sub-tasks:**
- [ ] 2.2.1 Create `computeFaceTangentAngles()` that returns `map[float64][]int` (angle → face indices)
- [ ] 2.2.2 Factor out normal rotation logic from `ComputeIntelliScanAngles()` into `computeRotatedNormal()`
- [ ] 2.2.3 Verify existing Method A path still produces identical results with refactored code

**Requirements:** B5  
**Estimate:** 1 hour

### Task 2.3 — Implement greedy angle selection (Method B)

**Files:** `internal/search/intelliscan.go`

**Sub-tasks:**
- [ ] 2.3.1 Implement `computeIntelliScanAnglesMethodB()` using greedy selection from angle buckets
- [ ] 2.3.2 Implement tie-breaking: prefer angles closer to already-selected set
- [ ] 2.3.3 Implement stop condition: return when coverage ≥ target or no more new faces can be covered
- [ ] 2.3.4 Handle edge case: coverage fraction = 1.0 on a mesh where some faces have no valid tangent angle

**Requirements:** B2  
**Estimate:** 2 hours

### Task 2.4 — Update ComputeIntelliScanAngles signature

**Files:** `internal/search/intelliscan.go`, `internal/search/search.go`, `app.go`

**Sub-tasks:**
- [ ] 2.4.1 Change `ComputeIntelliScanAngles(m, theta, phi)` to `ComputeIntelliScanAngles(m, theta, phi, config *IntelliScanConfig)`
- [ ] 2.4.2 Add nil check: if config is nil OR !config.MethodB → run Method A; if config.MethodB → run Method B
- [ ] 2.4.3 Update all callers: `search.Run()` and `app.go` (pass nil for now — Method A default)
- [ ] 2.4.4 Verify all existing tests pass

**Requirements:** B5  
**Estimate:** 30 min

### Task 2.5 — Add configurable coverage UI

**Files:** `frontend/src/main.js`, `frontend/src/index.html`

**Sub-tasks:**
- [ ] 2.5.1 Add coverage fraction slider (range 0.5–1.0, step 0.05) to IntelliScan card in HTML
- [ ] 2.5.2 Add "Method B" toggle in IntelliScan section
- [ ] 2.5.3 Wire slider/toggle to re-run `ComputeIntelliScanAngles` with new config
- [ ] 2.5.4 Display coverage report (percentage, covered/uncovered counts, per-angle breakdown)
- [ ] 2.5.5 Show warning when significant features remain uncovered

**Requirements:** B1, B4  
**Estimate:** 2 hours

### Task 2.6 — Add tests for Method B

**Files:** `internal/search/intelliscan_test.go`

**Sub-tasks:**
- [ ] 2.6.1 Test: Method B with f=1.0 produces same result as Method A
- [ ] 2.6.2 Test: Method B with f=0.5 produces fewer angles than f=1.0 on unit cube
- [ ] 2.6.3 Test: Coverage percent correctly reflects covered/uncovered faces
- [ ] 2.6.4 Test: Method B on flat mesh (single triangle) — should return 2 angles even at f=1.0
- [ ] 2.6.5 Test: Method B on degenerate mesh — should return warning
- [ ] 2.6.6 Test: Nil config → Method A (backward compatibility)

**Requirements:** B1, B2, B4, B5  
**Estimate:** 1.5 hours

### Task 2.7 — Document/remove effective energy 0.8 clamping

**Files:** `internal/physics/material.go`

**Sub-tasks:**
- [ ] 2.7.1 Add a comment explaining the `if eEff < EInput*0.8` clamping heuristic
- [ ] 2.7.2 Reference: this prevents unrealistically low effective energies for heavily filtered beams
- [ ] 2.7.3 Consider making the clamp factor configurable (optional)

**Requirements:** Audit gap #8  
**Estimate:** 30 min

### Task 2.8 — NIST XCOM spot-check

**Files:** `internal/physics/material_test.go`

**Sub-tasks:**
- [ ] 2.8.1 Add test: Al at 30 keV → μ/ρ = 0.600, at 100 keV → μ/ρ ≈ 0.170
- [ ] 2.8.2 Add test: Fe at 30 keV → μ/ρ = 4.59, at 100 keV → μ/ρ ≈ 0.232
- [ ] 2.8.3 Add test: Pb at 88 keV (below K-edge) → μ/ρ = 1.94, at 89 keV (above K-edge) → μ/ρ = 9.47
- [ ] 2.8.4 Cross-check these values against NIST XCOM online tool and document results

**Requirements:** Audit gap #9  
**Estimate:** 1 day (mostly research/documentation)

---

## Task Dependency Graph

```
2.1 (types) ──→ 2.2 (refactor) ──→ 2.3 (Method B algorithm) ──→ 2.4 (signature update) ──→ 2.6 (tests)
                                                        │
                                                        └──→ 2.5 (frontend UI)
2.7 (clamping doc) ──┐ (independent)
2.8 (NIST spot)   ──┘ (independent)
```

Tasks 2.7 and 2.8 are independent and can be done in parallel. Tasks 2.1-2.6 form a chain.
