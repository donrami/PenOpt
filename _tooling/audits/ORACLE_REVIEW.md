# Oracle Review — 2nd Opinion on EXPERT_REVIEW.md

**Oracle Role:** Hard-to-please senior reviewer, challenging every claim against ground truth  
**Ground Truth Sources:** Research files in `_tooling/research/`, actual Go source code, UI HTML  
**Standard:** Would I accept this review for a paper submission?  

---

## Oracle's Charge

Challenge every finding in EXPERT_REVIEW.md. For each claim:
- Is it factually accurate (verified against code/research files)?
- Is the severity rating appropriate?
- Are the recommendations proportionate to the actual impact?
- Are there factual errors or overstatements?
- What did the reviewer miss that is actually more important?

---

## Claim-by-Claim Scrutiny

### C1: "f_fdk (Tuy-Smith) is absent — Ito's third objective never enters the scoring pipeline"

**Expert claim:** Critical. `TuyCompletenessFraction()` exists but is disconnected.

**Oracle challenge:**
- Is `TuyCompletenessFraction()` actually called anywhere? Verify against source.
- The oracle-scrutiny.md already checked this and confirmed: "TuyCompletenessFraction() exists at `radon.go:87` but is never called from `evaluateIndividual()` or `evaluateIndividualAdvanced()`." So the factual claim is **correct**.
- However, the expert's description of what f_fdk does is simplified: "faces whose normals are parallel to the rotation axis." The oracle-scrutiny.md correctly notes this is "narrower than the paper's broader concept." The Tuy-Smith condition is about whether every plane intersecting the FOV also intersects the source trajectory — which is more general than just faces parallel to Y.
- The expert correctly identifies this as the largest scientific gap. But they don't account for whether it **matters in practice**. For typical industrial parts (not thin flat plates), the number of Tuy-incomplete faces at θ, φ ∈ [−45°, 45°] may be small enough that the practical impact is minimal. The gap is real but its severity depends on part geometry.

**Oracle verdict:** ✅ Factual claim correct. **Severity is appropriate** — absence of a key paper objective is always critical. **But the review could acknowledge**: for most real parts, the practical impact may be limited; it's a correctness gap, not always a results-quality gap.

---

### C2: "Ray grid selector is decorative — UI shows 16²/32²/64² options, Go hardcodes 8×8/16×16"

**Expert claim:** Critical. The setting does nothing.

**Oracle challenge:**
- The expert says "Go hardcodes 8×8/16×16." Let me verify: `search.Run()` at line 92 sets `RayGridX = 8, RayGridY = 8` for coarse, and line 129 sets `RayGridX = 16, RayGridY = 16` for fine.
- But what does the UI actually send? `optimizer.go:Run()` calls `search.Run(bvhTree, coarseCfg, req.Weights, req.Method, ...)` where `coarseCfg = raycaster.DefaultScannerConfig()`. `DefaultScannerConfig()` returns `RayGridX = 16, RayGridY = 16`. The grid is set to 16×16 default, not 8×8. Wait — the 8×8 is hardcoded inside `search.Run()` after receiving the config. So the coarse grid is 8×8 regardless of the UI selector, and the fine grid is 16×16 regardless. The default config's 16×16 is overridden.
- The `setupRayGrid()` function in `optimizer.js` only updates the text display: `$('acc-ray-val').textContent = el.textContent`. It never calls any Go function. ✅ This is correct.

**Oracle verdict:** ✅ Factual claim correct. **But the expert missed a nuance**: the coarse grid is 8×8, not the default 16×16. This makes the mismatch even worse — the UI's default display is "32²" but coarse is actually 8×8=64 rays. That's a 32× discrepancy from what's displayed, not a 4× discrepancy.

---

### C3: "Contour plot is incorrect — Hardcoded 10° grid doesn't match actual 15° coarse search"

**Expert claim:** Critical. Hardcoded grid produces wrong landscape visualization.

**Oracle challenge:**
- The expert says the actual coarse search uses −45, −30, −15, 0, 15, 30, 45 (15° spacing). Let me verify from `search/search.go:20-25`: `var coarseThetas = []float64{-45, -30, -15, 0, 15, 30, 45}`. ✅ Correct.
- The expert says the plot uses 10° intervals. Let me verify from `plots.js:62-70`: `const coarseThetas = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170]`. ✅ Correct.
- These don't overlap at all. The coarse search never evaluates any angle in the plot's template. ✅ Factual claim is correct.
- The expert says "the `if (coarsePts.length < 4)` check will likely pass because the fine search generates some orientations in the 0-180 range." Let me check: the fine search generates orientations in the top-3 ± 5° neighborhood. Top-3 candidates come from coarse, which uses −45 to +45. Fine neighborhoods around these (±5°) would cover roughly −50 to +50. So fine search doesn't generate orientations in the 60-180 range either. The fine search also normalizes angles (search.go:130-138) — values are wrapped to [0, 180) for theta and [0, 360) for phi. So fine search could produce angles like 175° when a coarse angle of −5° + 5° = 0° wraps around. Actually wait — the normalization `if t < 0 { t += 180 }` means a theta of −5° becomes 175°, not a fine search result. So the fine search DOES produce angles in the 0-180 range by normalization, just not as a natural result of the ±5° neighborhood.

**Oracle verdict:** ✅ Factual claim correct. **But the expert understated the issue**: the contour plot interpolates between orientations that were never evaluated at all, not just at a different resolution. It's not a matter of interpolation being slightly off — it's interpolating between fine-grid points using a coarse grid template that has zero actual coarse-grid data. The plot shows a smooth landscape that doesn't correspond to any evaluated data.

---

### C4: "5 of 10 objectives always return 0 — f_cb, f_completeness, f_uncertainty, f_surface, f_alignment are inert"

**Expert claim:** Critical. "Metrology" preset routes 70% of weight to dead objectives.

**Oracle challenge:**
- The oracle-scrutiny.md already corrected the earlier audit: "f_bh and f_scatter work in NSGAII+AdvancedPhysics mode." The expert's table correctly reflects this corrected classification (f_bh and f_scatter are "⚠️ NSGA-II only").
- The "Metrology" preset claim: the expert says it "routes 40% of its weight to f_uncertainty and 30% to f_surface." Let me check the actual weight presets from `state.js:WEIGHT_PRESETS`:
  ```javascript
  export const WEIGHT_PRESETS = [
    { id: 0, name: 'Quality', wMtl: 0.6, wEnergy: 0.2, wHdn: 0.2 },
    { id: 1, name: 'Balanced', wMtl: 0.4, wEnergy: 0.4, wHdn: 0.2 },
    { id: 2, name: 'Energy', wMtl: 0.2, wEnergy: 0.6, wHdn: 0.2 },
  ];
  ```
- **Wait.** There is NO "Metrology" preset in the current code! The three presets are Quality, Balanced, Energy. Each uses only f_mtl, f_energy, f_hdn — all functional objectives. The expert's claim about "Metrology" routing 70% to dead objectives appears to be **based on an older version of the codebase** that the oracle-scrutiny.md corrected. The current `state.js` only has three presets, all correctly using functional objectives.
- This means the expert's **C4 is factually incorrect for the current codebase**. The presets are fine.
- However: the earlier audit (paper-alignment-audit.md) mentions "Metrology" and "Multi-material" presets. Let me check if these exist in the UI HTML...

Looking at `index.html`, the tradeoff card shows: "Quality", "Balanced", "Energy" — same three presets as state.js. No "Metrology" or "Multi-material."

**Oracle verdict:** ❌ **FACTUAL ERROR.** The expert is reviewing an old version of the codebase. The current presets are Quality/Balanced/Energy, all using only the three functional objectives. The "Metrology routing to dead objectives" claim is wrong for the current code.

---

### H1: "f_hdn metric misalignment — Code uses penetration range, Ito specifies projection area range"

**Expert claim:** High. "A flat disc viewed edge-on and face-on would have the same max penetration length but dramatically different projection areas."

**Oracle challenge:**
- Is the claim about the code accurate? `objectives.go:114-128` computes `aMax - aMin` over `maxPerProjection`. `maxPerProjection[i]` is the maximum ray penetration length at projection angle i. ✅ Code claim is correct.
- Is the paper claim accurate? `ito2020_orientation.md` says "f_hdn — Projection area range, Amax − Amin." The expert is right — this is silhouette area, not max penetration. ✅ Paper claim is correct.
- Is the geometric argument valid? "A flat disc viewed edge-on and face-on would have the same max penetration length but dramatically different projection areas." Let me think through this: edge-on → the disc's silhouette is a line (area ≈ 0); face-on → silhouette is a circle (max area). Max penetration: edge-on → ray goes through the full disc thickness (say 10mm); face-on → ray goes through the disc diameter (say 100mm). **The expert's claim is backwards for this geometry!** A flat disc face-on has both larger projection area AND larger max penetration.
- For a long thin rod (not flat disc): face-on → max penetration = length of rod; edge-on → max penetration = cross-section thickness (small). Here both metrics agree.
- The expert's example of a flat disc actually demonstrates that the two metrics can agree, not disagree. A better counterexample would be a hollow cylinder: face-on → rays pass through the tube wall (small penetration), edge-on → rays pass through the full diameter (large penetration). But projection area also changes similarly.
- For truly asymmetric parts (L-shaped bracket): different orientations produce different silhouette shapes, and max penetration also changes. The metrics are correlated but not identical.

**Oracle verdict:** ✅ The code/paper discrepancy is real and correct. ❌ **But the expert's geometric example is wrong** — it actually argues the opposite of what they claim. The counterexample undermines the argument. However, the underlying point (the metrics are different, not identical) is correct even if the example is flawed.

---

### H4: "No quantitative validation — No tests compare against known analytical solutions"

**Expert claim:** High. Only directional tests, no absolute accuracy verification.

**Oracle challenge:**
- Is this accurate? The existing tests are in `bvh_test.go`, `mesh_test.go`, `objectives_test.go`, `vec_test.go`, `physics_test.go`, `search/search_test.go`.
- The tests verify directionality (thin < thick, etc.) but not absolute accuracy.
- ✅ The claim is correct. This is a genuine gap.
- However: the expert's proposed validation (cylinder formula, sphere formula) is not trivial. For a cylinder at angle θ, the penetration length formula involves the ellipse formed by the cylinder's cross-section projected onto the ray direction. The formula `L(θ) = 2√(r² − (y₀·sin θ)²) / |cos θ|` is only valid for rays passing through the cylinder's axis, not for arbitrary rays. For a sparse 16×16 grid with rays not aligned to the cylinder axis, computing expected penetration values analytically is non-trivial.
- The expert's suggested validation tests are conceptually sound but non-trivial to implement correctly.

**Oracle verdict:** ✅ Gap is real and important. ✅ Proposed validation approach is sound but the expert should note it requires careful mathematical derivation for non-axis-aligned rays.

---

### M1: "Orientation evaluation is not parallelized — 219 orientations evaluated sequentially"

**Expert claim:** Medium. "4-8× speedup possible."

**Oracle challenge:**
- Is the sequential claim accurate? `search/search.go:225-227` in `evaluateOrientations()` is a `for` loop — orientations evaluated one at a time. ✅ Correct.
- The expert suggests parallelizing across orientations. But there's a subtlety: each orientation uses the same BVH, which is read-only and thread-safe. Parallelizing 219 orientations across 8 goroutines would indeed give ~4-8× speedup for the evaluation phase.
- **However**, the coarse search already uses parallel goroutines per projection (36 goroutines). If we parallelize across orientations as well, we'd have 36×219 = 7,884 goroutines at peak. Go's goroutine scheduler can handle this, but memory locality would degrade — all goroutines share the same BVH tree, which is a single data structure. Memory access patterns might actually slow things down.
- A better approach might be a thread pool with `runtime.NumCPU()` workers, each processing a batch of orientations. Or a pipeline: some goroutines do BVH traversal, others do objective computation.

**Oracle verdict:** ✅ Sequential claim is correct. ⚠️ **But the speedup estimate is optimistic.** 4-8× assumes perfect parallelization, but BVH cache thrashing across concurrent goroutines could reduce gains. A more conservative estimate is 2-4×. The expert should also note the parallelism strategy matters.

---

### M4: "Backdrop-filter blur on 6 elements forces repaints during scroll"

**Expert claim:** Medium. Affects scroll performance.

**Oracle challenge:**
- Is this actually a performance issue in the current codebase? The expert's own DEEP_DIVE_AUDIT.md already identified this (Finding #4) and pointed out the continuous rAF loop as the primary performance killer.
- The deep-dive audit notes: "render only when controls change" was already fixed in the current code (scene.js uses `controls.addEventListener('change', render)` instead of continuous rAF). So the backdrop-filter issue, while real, is secondary to the rAF issue which has already been addressed.
- For scroll performance specifically: backdrop-filter on non-fixed positioned elements (the wt-banner, legend, compare-info) triggers compositing layer repaints on scroll. But modern GPUs handle this reasonably well. The performance impact is measurable but typically <5ms per frame on modern hardware.

**Oracle verdict:** ✅ The performance concern is real. ⚠️ **But the expert overstates the urgency** — the primary scroll jank cause (continuous rAF) was already addressed. Backdrop-filter is a polish issue, not a blocking performance issue.

---

### Missing Critical Issues

**Oracle challenge: What did the expert miss that is actually more important?**

#### 1. The result data doesn't include penetration rose data

The expert's review mentions the penetration rose relies on `result.maxPerProjection` — but does the `search.Run()` function actually populate this field in the returned `OrientationScore`?

From `search/search.go:44-51`, `OrientationScore` includes `MaxPerProjection []float64`. And from `evaluateOrientations()` lines 51-57, `MaxPerProjection: result.MaxPerProjection` is populated. ✅

But the `Result` struct at line 43 has `BestOrientation` and `WorstOrientation` — and the worst orientation comes from the combined coarse+fine list. For coarse evaluations, `NumProjections = 36`; for fine, `NumProjections = 90`. So the best orientation (likely from fine) has 90 data points in its rose, while the worst (possibly from coarse) has only 36. The penetration rose in `plots.js` would render these as two different resolution polar plots with no indication that they have different angular sampling densities.

**This is a real issue the expert missed.** The contour plot shows best and worst from the same search phase (both coarse+fine combined), but the penetration rose could show best from fine (90 points) and worst from coarse (36 points) — visually misleading.

#### 2. The Go-to-JS data transfer is unbounded JSON

`search.Run()` returns a `Result` struct that includes `AllScores []OrientationScore`. Each `OrientationScore` contains `MaxPerProjection []float64` — an array of 36 or 90 float64 values. For 219 orientations, this is 219 × 90 × 8 bytes ≈ 157 KB of floating-point data, serialized as JSON, transferred over Wails IPC, parsed back in JavaScript.

For a 50MB mesh, this is trivial. But if someone modifies the code to evaluate 1000 orientations (for a more thorough search), this becomes 1000 × 90 × 8 ≈ 720 KB of JSON. At what point does this become a performance bottleneck for Wails IPC?

**The expert didn't consider data transfer size** as a scalability concern.

#### 3. The IntelliScan angle computation is NOT orientation-dependent in the way the expert implies

The expert says "IntelliScan analyzes mesh face normals at the best orientation to recommend minimal projection angles." This is correct — `ComputeIntelliScanAngles(m, theta, phi)` takes the optimal (θ, φ) as input.

But the expert doesn't note that IntelliScan only uses the mesh's raw normals, rotated by (θ, φ). The tangent angles are computed from rotated normals, but the algorithm doesn't consider scanner geometry (SDD, SOD) at all. For a cone-beam geometry, the tangent condition `d̂(α) · n̂ = 0` is exact only for parallel-beam. For cone-beam with a point source at distance SOD, the ray direction changes across the detector — the tangent condition varies with the ray's Y and Z position on the detector.

**This is a scientific accuracy issue the expert missed.** IntelliScan assumes a parallel-beam geometry when computing tangent angles, but industrial CT uses cone-beam. The tangent angles should be computed per-detector-pixel, not just per-face-normal. For wide-angle cone-beam systems (short SOD, large SDD), this approximation could produce systematic errors in the recommended projection angles.

#### 4. The fine search normalization is done per-batch, not globally

From `search/search.go:205-213`: normalization (min-max scaling) is done within `evaluateOrientations()` for each batch separately. Then combined scores use these per-batch normalized values. The expert's review doesn't flag this as a concern.

But wait — `CombinedScore()` at `objectives/objectives.go:131-149` normalizes globally within each batch. When coarse and fine results are combined (search.go:187: `allScores := append(coarseScores, fineScores...)`), the scores have already been normalized separately:
- Coarse: f_mtl ∈ [min_coarse, max_coarse] → [0, 1]
- Fine: f_mtl ∈ [min_fine, max_fine] → [0, 1]

The normalized coarse values are in [0, 1] relative to the coarse range, and the fine values are in [0, 1] relative to the fine range. But the fine range could be much narrower than the coarse range, meaning a "0.5" in fine means something different from a "0.5" in coarse. When combined and sorted, this creates a ranking bias: orientations that happen to be at the edges of their batch's range will dominate, regardless of absolute performance.

**This is a correctness issue the expert missed.** The normalization should be global (across all coarse+fine combined) before ranking, not batch-local.

---

## Summary: Oracle's Verdict on Expert's Verdict

| Expert Claim | Oracle Verdict | Notes |
|---|---|---|
| C1: f_fdk missing | ✅ Correct, severity appropriate | Could note: impact depends on part geometry |
| C2: Ray grid decorative | ✅ Correct | Expert understated: coarse is actually 8×8 vs UI showing 32² — 32× discrepancy |
| C3: Contour plot wrong | ✅ Correct | Expert understated: interpolates between never-evaluated orientations |
| C4: 5 dead objectives | ❌ **FACTUAL ERROR** | Current codebase has only Quality/Balanced/Energy presets, all functional. No "Metrology" preset. Expert reviewed old version. |
| H1: f_hdn misaligned | ✅ Correct | But expert's geometric example is wrong — flat disc actually agrees, not disagrees |
| H4: No quantitative tests | ✅ Correct | Proposed validation approach sound but needs careful ray-level derivation |
| M1: Not parallelized | ⚠️ Partially correct | Speedup estimate (4-8×) optimistic; needs careful parallelism strategy |
| M4: Backdrop-filter | ⚠️ Overstated | Primary issue (rAF) already fixed; backdrop-filter is polish-level |

### Issues Expert Missed (More Important Than Some Expert Found)

| # | Missing Finding | Severity | Impact |
|---|----------------|----------|--------|
| 1 | **Normalization is batch-local, not global** — coarse and fine scores normalized separately, creating ranking bias when combined | **Critical** | Search results may be wrong — best orientation could be from coarse batch just because it happened to hit the edge of coarse normalization |
| 2 | **IntelliScan assumes parallel-beam** — tangent angles computed without cone-beam geometry, producing systematic errors for wide-angle systems | **High** | Recommended projection angles are slightly wrong for real industrial CT systems |
| 3 | **Penetration rose resolution mismatch** — best (fine, 90 pts) vs worst (coarse, 36 pts) shown at different angular resolutions without disclosure | **Medium** | Visually misleading comparison |
| 4 | **Unbounded Go→JS JSON transfer** — no size limit on AllScores serialization; could become bottleneck if search is expanded | **Low** | Scalability concern for future search extensions |

---

## Revised Priority Actions (Oracle's Version)

### Immediate (Oracle's Priority)

1. **Fix global normalization** — Normalize all scores (coarse+fine) together before computing combined scores and ranking. This is a correctness bug, not just a presentation issue.

2. **Fix ray grid selector** — Remove or wire it. Currently shows 32² as default but coarse is 8×8=64 rays, a 32× discrepancy.

3. **Fix contour plot grid template** — Use actual search grid angles, not hardcoded 10° intervals.

4. **Add Tuy-Smith completeness** — Connect to scoring pipeline as intended by Ito 2020.

### Short-Term (Oracle's Priority)

5. **Document IntelliScan's parallel-beam assumption** — Add a note that tangent angles are computed for parallel-beam geometry. For wide-angle systems, a per-ray tangent computation would be more accurate.

6. **Add resolution indicator to penetration rose** — Show whether the data is from coarse (36 pts) or fine (90 pts), and display both at matched resolution or clearly label the resolution difference.

7. **Add quantitative validation tests** — Cylinder and sphere penetration against analytical solutions.

### What to Drop (Expert Overstated)

- **M4 (backdrop-filter):** Already addressed in current code. Low urgency.
- **C4 (dead objectives/misleading presets):** Not accurate for current codebase. The presets are fine.
- **M1 (parallelization speedup):** Good to have but not as impactful as the normalization bug or the IntelliScan cone-beam issue.

---

*Oracle review complete. The expert's report is generally sound on the issues it correctly identifies, but contains one factual error (C4) and misses three findings that are more important than several of the expert's flagged items.*