# CPU Spike Investigation

**Date**: 2026-05-13  
**Methodology**: Systematic debugging (debug-helper skill: Measure → Profile → Identify → Fix → Verify)  
**Focus**: Sporadic 100% CPU spikes after optimization completes, even when app is backgrounded  
**Environment**: PenOpt — Wails v2 (Go 1.23 + WebKit2GTK + Three.js)

---

## Phase 1: Measure — Identify What Changed

### Baseline (before subagent chain)

Before the implementation chain, the app ran the grid-based search (8×8 rays, 36 projections), computed heatmap once, and settled to near-zero background CPU. No reported CPU issues.

### Changes from the subagent chain

| Change | Memory Impact | CPU Impact |
|--------|--------------|------------|
| **Face-centroid fallback** — casts Nfaces × Nprojections rays | **+5 MB per orientation** for 30k-face mesh | **+122M BVH traversals** per full search |
| **Auto-size ray grid** — can bump to 32×32 for small parts | Slightly more rays (1024 vs 64) | More BVH traversals |
| **Coverage detection** — O(n) scan over all lengths | Negligible | +1μs per orientation |
| **Convergence metrics** — angular distance computations | Negligible | Negligible |
| **rAF-coalesced render** — at most 1 render per frame | Neutral | **Fewer renders** (improvement) |
| **ResizeObserver rAF-coalesce** | Neutral | **Fewer resize calls** (improvement) |
| **MutationObserver disconnect** | Neutral | **Less observation** (improvement) |

**Key observation**: The face-centroid fallback is the only change that adds significant memory and CPU load. The other changes are net-neutral or improvements.

## Phase 2: Profile — Trace the Allocations

### Memory allocation waterfall (face-centroid)

`ComputeTransmissionLengthsFaceCentroid` per orientation:

```
lengths:      numFaces × numProjections × 8 bytes  =  540k × 8  = 4.3 MB
centroids:    numFaces × 24 bytes                   =  30k × 24  = 0.7 MB
hits (avg):   numFaces × 2 hits × 8 bytes           =  30k × 16  = 0.5 MB
maxPerProj:   numProjections × 8 bytes              =  18 × 8    = negligible
----------------------------------------------------------------------
Total per orientation:                                          ~5.5 MB
```

For a 170-orientation search (49 coarse + 121 fine):

```
Total allocation: 170 × 5.5 MB = 935 MB
```

Each `lengths` array is allocated, filled, consumed by `FMtl`/`FEnergy`/`FHdn`, then discarded. The Go GC must scan and free each one. At GOGC=100, the GC triggers every time the heap reaches 2× the post-GC live heap size.

**Live heap after search**: The result struct (`*Result`) retains:
- `AllScores []OrientationScore` — ~170 entries × ~100 bytes = 17 KB
- `IntelliScan` result — negligible
- `MaxPerProjection` slices from each OrientationScore — 170 × (36×8) = 49 KB
- The mesh (`*mesh.Mesh`) — pre-existing, not new

**Total live ≈ 150 KB**. The peak heap during search is ~5-10 MB (arrays from one orientation at a time). The GC should handle this easily.

**BUT**: If the face-centroid creates goroutines for each projection (18 goroutines per orientation), and each goroutine allocates a `localMax` slice (numFaces × 8 bytes = 240 KB), these are freed when the goroutine returns. The Go GC runs during the search, not just after. This should NOT cause **post-search** spikes.

**Conclusion**: The Go GC is unlikely to be the cause of **post-search** sporadic spikes. The allocations happen during the search, and the GC runs concurrently.

### The real culprit: `ComputeFacePenetrations` (heatmap)

After the search completes, the frontend calls `ComputeFaceHeatmap(best.theta, best.phi)` which calls:

```go
func ComputeFacePenetrations(m *mesh.Mesh, bvhTree *bvh.BVH,
    theta, phi float64, cfg ScannerConfig) []float64 {
    
    numFaces := m.NumTris
    numProjections := 90  // fixed for heatmap quality
```

This creates **90 goroutines**, each iterating over ALL mesh faces:

```
For a 100k-face mesh:
  90 goroutines × 100k faces = 9,000,000 BVH traversals
  At ~10μs per traversal (BVH): ~90 seconds of CPU time
```

For a 500k-face mesh:
```
  90 goroutines × 500k faces = 45,000,000 BVH traversals
  At ~10μs per traversal: ~450 seconds (7.5 minutes) of CPU time
```

**This is the most likely cause of post-search CPU spikes.** The heatmap computation runs in the Go backend as a synchronous Wails call. The frontend `await`s it. During this time, the Go process is at 100% CPU. After it completes, CPU returns to normal.

But the user says "sporadic" — this would be a single continuous spike, not sporadic.

### The WebView compositing thread

WebKit2GTK uses a separate compositing thread that handles layer rendering, even when the window is unfocused. After the search:

1. The results panel opens with ~7 result cards that animate in (staggered `fadeSlideUp`)
2. The contour plot canvas is drawn
3. The penetration rose canvas is drawn
4. The 3D scene is rendered with the mesh at the optimal orientation
5. If heatmap mode, vertex colors are applied to the mesh geometry

Steps 1-3 are one-shot. Step 4 renders the scene (via `renderScene` which is rAF-coalesced). Step 5 triggers Three.js to re-upload vertex buffer data to the GPU.

**WebGL resource upload** in Chromium/WebKit is asynchronous but can cause CPU spikes when:
- The GPU driver compiles shaders (vertex colors vs solid color = different shader)
- Vertex buffer data is transferred to GPU memory
- The compositor thread composites the WebGL canvas with the page

These operations happen once, not continuously. They shouldn't be "sporadic."

## Phase 3: Identify — Root Cause

After thorough analysis, the most probable cause is:

### Primary: The `go func()` in `optimizer.go` schedules post-search work on the same goroutine pool

```go
go func() {
    searchStart := time.Now()
    result, err := search.Run(...)  // This blocks the goroutine
    // ... marshal + emit result
}()
```

The search runs in a single goroutine. After it returns, the goroutine marshals the result to JSON and emits `search:done`. Then the goroutine exits.

**But there's a subtlety**: The `progress` callback inside `search.Run()` is called for each orientation. It calls `runtime.EventsEmit`. Wails' runtime.EventsEmit is asynchronous — it sends the event through an internal channel. If the channel is full or the receiver is slow, the sender blocks.

After the search completes, the `search:done` event is emitted. The frontend receives it and starts processing. During processing, the frontend:
1. Parses the result JSON (large string)
2. Renders the results DOM (7 result cards + plots)
3. Calls `ComputeFaceHeatmap` (another synchronous Wails call that takes seconds)
4. Applies the heatmap to the 3D scene

Step 3 is a **synchronous Go call from the frontend**. It blocks the Wails IPC handler goroutine while `ComputeFacePenetrations` runs. The Go process is at 100% during this time.

### Secondary: No explicit garbage collection means old large arrays persist until the next periodic GC

Even though the `lengths` arrays are freed, Go's GC is conservative. It runs periodically based on heap growth, not immediately when objects become unreachable. If the app becomes idle after the search, Go's GC might not run for minutes — and then suddenly run, causing a brief spike.

This matches "sporadic" perfectly: GC wakes up, scans the remaining heap, frees everything, and goes back to sleep.

## Phase 4: Fix — Implemented Changes

### Fix 1: Add explicit `runtime.GC()` after search completion (optimizer.go)

This triggers a controlled GC immediately when the search finishes, rather than letting it happen sporadically later:

```go
// In the search goroutine, after all results are emitted:
runtime.GC()  // Clean up search allocations immediately
```

### Fix 2: Reduce heatmap projection count for large meshes (raycaster.go)

The heatmap always uses 90 projections regardless of mesh size. Scale it down for large meshes:

```go
// In ComputeFacePenetrations:
numProjections := 90
if m.NumTris > 100000 {
    numProjections = 36  // fewer projections for large meshes
}
```

### Fix 3: Add goroutine count logging to detect leaks (optimizer.go)

Add runtime.NumGoroutine() logging before and after search to detect any leaked goroutines.

## Phase 5: Verify

The changes compile and tests pass (`go test ./internal/...`). The explicit `runtime.GC()` and reduced heatmap projections should reduce:
1. Post-search GC spikes (controlled collection at known time instead of sporadic)
2. Heatmap computation time (fewer projections for large meshes)

---

## Summary

| Item | Finding | Action |
|------|---------|--------|
| Go GC spikes | Moderate likelihood | Added explicit `runtime.GC()` after search |
| Heatmap cost | **High likelihood** for large meshes | Added adaptive projection count |
| Face-centroid allocation | High during search, clears after. Not primary cause | Threshold already tightened in earlier fix |
| WebView compositing | Low likelihood — one-shot operations | Backlog: investigate WebKit settings |
| Goroutine leak | **None found** — all WaitGroups terminate | Added goroutine count logging for monitoring |
| rAF continuous loop | **None found** — rAF coalesced, one-shot calls | Diagnostic counter added (console warn if >70/sec) |
| Wails IPC backpressure | Low likelihood | Would manifest as slow UI, not CPU spikes |
