# PenOpt Performance Audit

Date: 2026-05-12
Scope: Full-stack Wails app (Go backend + WebView frontend)
Reviewer: pi agent, with 2nd opinion from `oracle` subagent

---

## Previously Applied Fixes (this session)

These were applied before the audit:

1. **rAF-coalesced Three.js render** — `S.renderScene` now queues at most one render per frame via `requestAnimationFrame`, preventing cascade re-renders from OrbitControls and programmatic changes.
2. **Debounced ResizeObserver** — Viewport resize handler is now rAF-gated, so rapid layout transitions (accordion toggle, results panel collapse) only trigger one resize+render pass per frame.
3. **rAF-batched Wails progress events** — `search:progress` DOM writes now coalesce via rAF, eliminating IPC-driven layout thrash during optimization.
4. **Layout-thrash-free accordion animation** — Replaced `void body.offsetHeight` forced-reflow pattern with double-rAF deferral.
5. **rAF-coalesced tooltip scroll reposition** — `getBoundingClientRect` reads on scroll/resize are now limited to once per frame.
6. **MutationObserver cleanup** — Scrollbar enforcement observer disconnects after first successful application.
7. **GPU-composited scroll panes** — `#sidebar` and `#results-content` now have `contain: layout paint style` and `will-change: transform` for independent compositor layers.

---

## Frontend — JavaScript/CSS Remaining Issues

### F1. 🟠 Slider → IPC thrash on every `input` event

- **File**: `frontend/src/materials.js:76`
- **Problem**: Energy and Tmin sliders fire `recalcBeam()` on every `input` event (50+ calls per full drag).
  Each call hits `CalcBeamParams` → Go IPC → JSON parse → 6+ DOM writes.
- **Impact**: High — redundant IPC during active slider interaction.
- **Fix**: Debounce slider `input` to 100ms, or use `change` event for the IPC call and `input` only for local display updates.

### F2. 🔴 `handleFile` — `Array.from(new Uint8Array(buf))` memory doubling *(upgraded by oracle)*

- **File**: `frontend/src/filehandler.js:37`
- **Problem**: Converts file bytes into a JS array via `Array.from()`. For a 100MB STL file:
  - `file.arrayBuffer()` → 100MB ArrayBuffer
  - `new Uint8Array(buf)` → 100MB view (shares buffer)
  - `Array.from(new Uint8Array(buf))` → **new JS Array of Numbers: 100M × 8 bytes = 800MB**
  - Then serialized to JSON string for Wails IPC: another ~400–600MB string
  - **Peak memory: ~1.5–2GB for a 100MB file** — can crash on memory-constrained systems
- **Impact**: **Critical** (upgraded from High by oracle) — can crash app on large files.
- **Fix**: Wails v2 bindings accept `Uint8Array` directly for `[]byte` parameters. Pass `new Uint8Array(buf)` directly, eliminating `Array.from` entirely.

### F3. 🟡 Sliding with `change` vs `input` for IPC calls

- **File**: `frontend/src/materials.js:76-86`
- **Problem**: Both energy and Tmin sliders use `input` event for beam recalculation,
  but `input` fires 50-100 times per drag. The beam parameters only matter when the
  user releases the slider (for optimization) or for the local display.
- **Fix**: Use `input` for local pill updates only, `change` for `recalcBeam()`.

### F4. 🟡 `handleFile` / `handlePickedMesh` — 80 lines of near-identical code

- **File**: `frontend/src/filehandler.js:32` and `:93`
- **Problem**: Two functions with ~90% duplicated DOM update logic.
- **Impact**: Low (maintenance, not runtime).

### F5. 🟡 `removeMesh` — synchronous querySelectorAll + accordion close thrash

- **File**: `frontend/src/filehandler.js:177`
- **Problem**: Queries `.result-warning` elements + toggles three accordion cards
  with style reads during mesh removal.
- **Impact**: Low (user-initiated action, not frequent).

### F6. 🟢 `enforceScrollbars` — persistent measurement element

- **File**: `frontend/src/main.js:31`
- **Problem**: A `<div>` created for tooltip measurement is never removed from DOM.
- **Impact**: Negligible (a few hundred bytes).

---

## Backend — Go Remaining Issues

### G1. 🔴 `FMtl` — `math.Pow` for every ray length

- **File**: `internal/objectives/objectives.go:21-23`
- **Problem**: `math.Pow(l, 3)` and `math.Pow(sum/n, 1/3)` called for every ray length.
  Oracle calculation: ~2.9M `math.Pow` calls per optimization run (not 3.6M as originally estimated,
  but still a major hot-path expense). Since `m=3` is hard-coded at all call sites, this is waste.
- **Impact**: **High** — significant CPU in the hot path.
- **Fix**: Replace `math.Pow(l, 3)` with `l * l * l`, and `math.Pow(sum/n, 1/3)` with
  `math.Cbrt(sum/n)`. Estimated 5–10% faster optimization.

### G2. 🔴 `CheckWatertight` — `fmt.Sprintf` for vertex deduplication

- **File**: `internal/mesh/mesh.go:94`
- **Problem**: `fmt.Sprintf("%.4f,%.4f,%.4f", v.X, v.Y, v.Z)` creates a heap-allocated
  string for every vertex. For 500k faces (1.5M vertices), that's **1.5M string allocs**.
- **Impact**: **High** — major GC pressure on mesh load.
- **Fix**: Use `math.Float64bits` packed into a struct key, or use `mesh.Vec3` directly
  as map key (Go supports struct keys for value types).

### G3. 🔴 `ComputeTransmissionLengths` — goroutine per projection

- **File**: `internal/raycaster/raycaster.go:83`
- **Problem**: Spawns `cfg.NumProjections` goroutines (36–90 per orientation). Each
  iterates all rays. For 200 orientations × 90 projections × 256 rays = **4.6M BVH traversals**.
  Large meshes (500k+ faces) make each traversal deep.
- **Impact**: **High** — dominates optimization runtime.
- **Note**: This is the core algorithm and not trivially avoidable, but worth noting
  that BVH optimization (below) compounds with this.

### G4. 🟠 `buildRange` — full sort at every BVH internal node

- **File**: `internal/bvh/bvh.go:85`
- **Problem**: `sort.Slice` called at every internal node during BVH construction.
  O(n log n) per node compounded across tree depth. Adds ~5–10s to mesh load for
  100k+ face meshes.
- **Impact**: Medium — noticeable during mesh load.
- **Fix**: Use quickselect / nth-element to find the median in O(n) instead of full sort.

### G5. 🟢 `IntersectAll` — redundant double sort *(corrected by oracle)*

- **File**: `internal/bvh/bvh.go:176` + `raycaster.go:157`
- **Corrected diagnosis**: The insertion sort in `IntersectAll` is O(n²) but on n < 10 items it's
  irrelevant. The real issue is that **`ComputeTransmissionLengths` calls `sort.Float64s(hits)` on
  the already-sorted result** — a redundant operation happening 4.6M times.
- **Impact**: Low (negligible), but trivial fix if touching these files anyway.
- **Fix**: Remove the insertion sort from `IntersectAll` and keep only the one `sort.Float64s` in
  the caller, or remove the caller's sort and keep the insertion sort. One or the other.

### G6. 🟠 `ComputeFacePenetrations` — no progress or cancellation

- **File**: `internal/raycaster/raycaster.go:207`
- **Problem**: 90 projection goroutines each iterating ALL faces. For 100k faces,
  that's 9M ray casts. No progress feedback, no cancellation. Can freeze UI.
- **Impact**: Medium — triggered on Heatmap button click.
- **Fix**: Add progress event emits, add cancellation channel, or reduce projection count.

### G7. 🟢 `Result.AllScores` memory growth

- **File**: `internal/search/search.go`
- **Problem**: Every orientation's `MaxPerProjection` (90-360 floats) stored in memory.
  ~864KB for 300 orientations. Fine at current scale, concern for future NSGA-II.
- **Impact**: Low.

---

## Issues the Oracle Found That I Missed

### M1. 🔴 Pre-computed Rotation Matrices — hot path waste

- **File**: `internal/raycaster/raycaster.go:129-134`
- **Problem**: Every single ray recomputes `math.Cos(angle)` and `math.Sin(angle)` for
  three rotation axes. `thetaRad`, `phiRad` are constant per orientation; `alphaRad` is
  constant per projection angle. But these trig values are **recomputed inside the ray loop**.
- **Impact**: **High** — 4.6M rays × 3 rotation calls × 2 trig calls = **27.6M `math.Cos`/`math.Sin` calls per run**.
  Fixing this alone gives an estimated **15–25% faster optimization**.
- **Fix**: Hoist trig computations outside the ray loop:

```go
// Before ray loop (per projection):
cosA, sinA := math.Cos(-alphaRad), math.Sin(-alphaRad)
// Before ray loop (per orientation — actually hoist further up):
cosP, sinP := math.Cos(-phiRad), math.Sin(-phiRad)
cosT, sinT := math.Cos(-thetaRad), math.Sin(-thetaRad)
// In the loop, apply rotations inline without trig:
x := ox*cosA + oz*sinA   // RotateY around axis
z := -ox*sinA + oz*cosA
```

### M2. 🟠 BVH build — centroid recomputed per comparison

- **File**: `internal/bvh/bvh.go:85`
- **Problem**: `sort.Slice` comparator calls `centroid(tri, axis)` on every comparison.
  For 100k faces at root level, the O(n log n) centroid recomputation (~2M centroid calls)
  each doing 3 additions + 1 division adds measurable cost.
- **Impact**: Low-Medium — contributes to the 5–10s mesh load time.
- **Fix**: Pre-compute centroids once before sorting at each node level.

### M3. 🟢 `vec.Normalize` after orthogonal rotation

- **File**: `internal/raycaster/raycaster.go:136`
- **Problem**: After rotating `localDir` through three orthogonal rotation matrices (which
  preserve vector length), `vec.Normalize` is called — an unnecessary `math.Sqrt` + 3 divisions.
- **Impact**: Low individually, but for 4.6M rays it adds up (~4.6M redundant `math.Sqrt` calls).
- **Fix**: Remove the final `vec.Normalize(localDir)` in `ComputeTransmissionLengths`
  (keep it in the heatmap path where directions aren't unit-length by construction).

---

## Oracle's Revised Priority Table

| Priority | Issue | Est. Impact | Effort |
|---|---|---|---|
| **1** | **F2** — `Array.from` to `Uint8Array` directly | 🔴 Critical — prevents OOM on large files | 2 min |
| **2** | **M1** — Pre-compute rotation trig outside ray loop | 🔴 15–25% faster optimization | 10 min |
| **3** | **G1** — `math.Pow` → `l*l*l` + `math.Cbrt` | 🔴 5–10% faster optimization | 2 min |
| **4** | **G2** — `fmt.Sprintf` → struct map key | 🔴 Faster mesh load, less GC | 5 min |
| **5** | **F1** — Slider IPC debounce | 🟠 Stops 54 redundant IPC calls/drag | 5 min |
| **6** | **G4** — BVH full sort → quickselect | 🟠 5–10s faster mesh load | 10 min |
| **7** | **M2** — Pre-compute centroids for BVH sort | 🟡 2–3s faster mesh load | 5 min |
| **8** | **G6** — Heatmap progress/cancellation | 🟠 UX improvement, no speedup | 15 min |

The top 5 items (F2, M1, G1, G2, F1) plus the redundant-sort cleanup (G5) touch only 6 files
and take ~45 min for a competent agent: `filehandler.js`, `materials.js`, `objectives.go`,
`mesh.go`, `raycaster.go`, `bvh.go`.
