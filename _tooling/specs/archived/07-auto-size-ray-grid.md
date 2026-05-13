# Spec 07: Auto-Size Ray Grid by Part Extent

**Gap analysis ref**: G9 (part 2)  
**Packages**: `internal/search/`  
**Depends on**: Spec 06 (needs `CoverageFraction` to exist, though could be done independently)  
**Effort**: ~20 lines of Go

---

## 1. Paper Ground Truth

Neither Ito 2020 nor Heinzl 2011 discuss adaptive ray grid sizing. However, the principle is straightforward: the inter-ray spacing should be smaller than the smallest geometric feature of interest. For a part that occupies a small fraction of the detector, the default ray grid will undersample it.

PenOpt allows the user to manually set the ray grid (4×4 to 32×32). The problem is that **the default is 8×8 regardless of part size**. A user loading a tiny part gets unreliable results by default with no indication that the grid should be increased.

## 2. Current Code Behaviour

**File**: `internal/app/optimizer.go` line 38:

```go
coarseRayGrid := 8
if req.RayGridXY > 0 {
    coarseRayGrid = req.RayGridXY
}
```

The frontend sends `rayGridXY` from the ray sampling slider. If the user hasn't touched the slider, it uses the default (8×8). There is no automatic adjustment based on part size.

## 3. Correct Behaviour

When the search starts, the default ray grid should be automatically adjusted based on the ratio of part bounding box extent to detector size:

- **Part extent > 50% of detector**: Use 8×8 (default, adequate for large parts)
- **Part extent 25-50% of detector**: Use 12×12
- **Part extent 10-25% of detector**: Use 16×16
- **Part extent < 10% of detector**: Use 24×24
- **Part extent < 5% of detector**: Use 32×32, emit warning that part is very small

The user can still override this manually via the ray sampling slider. The auto-sizing only sets the **default**.

## 4. Implementation

### 4.1 Compute part extent ratio

**File**: `internal/app/optimizer.go`, in `Run()` before setting up the search config:

```go
// Auto-size ray grid based on part extent vs detector size
partExtent := math.Max(m.Extent().X, math.Max(m.Extent().Y, m.Extent().Z))
detectorWidth := coarseCfg.DetWidth  // mm, from scanner config
extentRatio := (partExtent * 2) / detectorWidth  // full extent / detector width

autoGrid := 8
switch {
case extentRatio > 0.50:
    autoGrid = 8
case extentRatio > 0.25:
    autoGrid = 12
case extentRatio > 0.10:
    autoGrid = 16
case extentRatio > 0.05:
    autoGrid = 24
default:
    autoGrid = 32
}

// User override takes precedence
if req.RayGridXY <= 0 {
    coarseRayGrid = autoGrid
}
// If auto-grid was high, also adjust fine grid proportionally
// (fine = 2× coarse, capped at 32, handled in search.Run)
```

### 4.2 Surface the auto-sizing decision

Add to `Result` struct so the frontend can display it:

```go
type Result struct {
    // ... existing fields ...
    AutoRayGrid     int     `json:"autoRayGrid,omitempty"`   // auto-selected grid size
    ExtentRatio     float64 `json:"extentRatio,omitempty"`   // part extent / detector
}
```

Set in `Run()` after evaluation:

```go
result.AutoRayGrid = coarseRayGrid
result.ExtentRatio = extentRatio
```

### 4.3 Edge cases

- **Mesh centered at origin**: `m.Extent()` returns half-extents. Multiply by 2 for full extent. This is correct.
- **Mesh loaded but not centered**: `CenterAtOrigin()` is called on load in `meshloader.go`, so the mesh is always centered. Extent is measured from center, so `m.Extent().X` is half-width.
- **User overrides**: If the user explicitly sets `rayGridXY > 0`, respect the user's choice. Don't override.
- **Tiny but long part**: A 2×2×200mm rod has large extent along Z. Using max extent over-estimates the projected area for orientations where the rod is edge-on. This is conservative — better to over-sample than under-sample.

## 5. Validation

### 5.1 Existing tests that must still pass

```
go test ./internal/search
```

### 5.2 Manual verification

1. Load a 200mm part → observe 8×8 default
2. Load a 50mm part → observe 16×16 default
3. Load a 10mm part → observe 32×32 default with warning
4. Change ray grid slider → observe user override takes precedence
