# Phase 3 Gap Analysis

After studying the old project's implementations, here's what Phase 3 needs.

---

## 1. Heatmap — Per-Face Penetration Coloring

**Old code**: `src/js/heatmap.js` — `CT.computeFacePenetrationsAsync()`

**How it works**:
1. Pre-compute face centroids (once per mesh)
2. For each of 90 projection angles at optimal orientation:
   - For each face: cast ray from X-ray source through face centroid in mesh-local space
   - Compute penetration via BVH intersection (same algorithm as raycaster)
   - Track max penetration per face across all projection angles
3. Return `Float32Array` of per-face penetration values
4. Apply green→yellow→red colormap via vertex colors on `BufferGeometry`
5. Auto-scale color range to [min, max] of face data

**Gap**: We have no per-face heatmap computation. Options:
- **Option A**: Port to Go using `bvh.IntersectAll()` (similar code to raycaster but per-face). Needs: new Go function + app binding + face data buffer.
- **Option B**: Keep in JS (exactly as old code). Simpler but slower.

**Recommendation**: Port to Go. The BVH is already in Go, and we need 90 projections × N_faces ray casts. For a 10k-face mesh with 90 projections = 900k rays. Go handles this faster than JS for large meshes.

---

## 2. Contour Plot — 2D Score Heatmap

**Old code**: `src/js/results/contour.js` — `CT.drawContourPlot()`

**How it works**:
- Canvas 2D rendering on a 236×176 pixel canvas
- Bilinear interpolation between coarse grid points (10° steps)
- Sub-divides each coarse cell into 4×4 sub-cells for smooth gradient
- Color mapping: blue(0) → yellow(0.5) → red(1)
- White circle marker at best orientation, X at worst
- Color bar on right: min/avg/max labels
- θ axis on bottom, φ axis on left
- "Partial results" warning if search was cancelled

**Gap**: No contour rendering code. This is pure canvas 2D — no external dependencies. Needs:
- A `setupCanvas` helper function
- The contour drawing logic (bilinear interpolation, color mapping, markers, axes, color bar)

**Recommendation**: Port directly to JS (pure canvas 2D). Needs no Go backend — just `maxPerProjection` data which we already have from search results.

---

## 3. Penetration Rose — Polar Plot

**Old code**: `src/js/results/rose.js` — `CT.drawPenetrationRose()`

**How it works**:
- Canvas 2D polar plot on 236×176 canvas
- Concentric circles at 25%, 50%, 75%, 100% of max penetration
- Radial lines every 45° with angle labels
- Best orientation as blue filled polygon
- Worst orientation as dashed red outline (optional)
- IntelliScan tick marks as orange strokes (optional)
- Legend at bottom: optimal, worst, IntelliScan

**Gap**: No rose rendering code. Pure canvas 2D. Already has the data (`maxPerProjection` from search results).

**Recommendation**: Port directly to JS. Needs the `setupCanvas` helper and the polar drawing logic.

---

## 4. Energy Recommendation — Full HTML

**Old code**: `src/js/results/display.js` — `CT.renderEnergyRecommendation()`

**How it works**:
- Uses Beer-Lambert to find kV where T ≥ Tmin for max penetration
- Returns kV clamped to [50, 500]
- Qualitative labels with color coding:
  - `<100 kV`: amber "▲ Higher kV recommended"
  - `100-200 kV`: white "Medium kV suitable"
  - `>200 kV`: green "▼ Lower kV sufficient"
- Savings estimate vs worst orientation: `(1 - t_max,opt / t_max,worst) × 100%`
- Caveat text: "Qualitative estimate. Actual consumption depends on scanner hardware."
- Tooltips with detailed explanations on every element

**Gap**: Our Go `RecommendKV` is simpler. We need the full HTML rendering in the frontend.

**Recommendation**: Keep the Go kV calculation (works) but add full HTML rendering with qualitative labels, savings, and caveat to the frontend.

---

## 5. Export — JSON + PNG

**Old code**: `src/js/export.js` — `CT.exportJSON()`, `CT.exportPNG()`

**How it works**:
- **JSON**: `JSON.stringify(result)` → blob → download link → `URL.revokeObjectURL`
- **PNG**: Render Three.js scene to canvas → composite with summary text overlay → blob → download

**Gap**: No export functions at all.

**Recommendation**: Pure JS, no Go needed. JSON export is trivial. PNG export needs:
- Render the Three.js canvas
- Create composite canvas with text overlay (angles, score, energy, timestamp)
- Download via blob

---

## 6. Quality vs Energy Tradeoff

**Old code**: `src/js/ui/interaction.js` — weight presets + method toggle + Update Search

**How it works**:
- 3 weight presets: Quality (60% f_mtl), Balanced (40/40/20), Energy (60% f_energy)
- 2 combine methods: Minimax / Weighted
- HTML buttons that update `CT.weights` and `CT.optimizationMethod`
- "Update Search" button re-runs optimization with new weights

**Gap**: Our code has basic weight sliders in the sidebar but no presets and no method toggle.

**Recommendation**: Add the tradeoff card to the results panel with the three presets, method toggle, and "Update Search" button. Runs the existing Go `RunOptimization` with new weights.

---

## 7. Canvas Setup Helper

**Old code**: In the old `state.js` (before extraction), `CT.setupCanvas` is used by both contour and rose.

```js
CT.setupCanvas = function(canvasId, defaultWidth, defaultHeight, targetCanvas) {
  const cv = targetCanvas || CT.$(canvasId);
  if (!cv) return { cv: null, ctx: null, w: 0, h: 0 };
  const dpr = window.devicePixelRatio || 1;
  const rect = cv.parentElement.getBoundingClientRect();
  const w = Math.max(rect.width - 4, defaultWidth);
  const h = Math.max(defaultHeight, 100);
  cv.width = w * dpr;
  cv.height = h * dpr;
  cv.style.width = w + 'px';
  cv.style.height = h + 'px';
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  return { cv, ctx, w, h };
};
```

**Gap**: Missing this utility function.

**Recommendation**: Add as shared helper in the frontend.

---

## Implementation Priority

| # | Feature | Effort | Depends On |
|---|---------|--------|------------|
| 1 | Canvas setup helper | Trivial | Nothing |
| 2 | Export JSON | Small | Result object |
| 3 | Energy recommendation HTML | Small | Go `CalcEnergyRecommendation` |
| 4 | Weight presets + method toggle | Medium | UI + re-run optimization |
| 5 | Contour plot | Medium | `setupCanvas` + score data |
| 6 | Rose plot | Medium | `setupCanvas` + `maxPerProjection` data |
| 7 | Export PNG | Medium | Three.js renderer |
| 8 | Scanner presets | Small | Scanner config fields |
| 9 | Heatmap (Go backend) | Large | New Go raycaster function |
| 10 | State persistence | Small | localStorage |

---

## Architecture Decisions

### Heatmap: Go vs JS
The heatmap is the most compute-intensive feature (N_faces × 90 projection rays). For a 100k-face mesh, that's 9M rays.
- **JS approach** (old code): runs async with `setTimeout(0)` yields. Slow for large meshes.
- **Go approach**: runs on native Go, returns pre-computed face data via Wails binding. Faster but needs new code.

**Decision**: Port to Go. The BVH is already in Go. Add `ComputeFacePenetrations(mesh, bvh, theta, phi, cfg)` to the raycaster package, similar to `ComputeTransmissionLengths` but per-face.

### Canvas plots: JS only
Contour and rose plots are purely visual — no computation beyond rendering. Pure JS canvas 2D is appropriate.

### Export: JS only
JSON export and PNG composite are browser API operations. No Go needed.
