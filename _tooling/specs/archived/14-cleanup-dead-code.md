# Spec 14: Clean Up Dead Code & Artifacts

**Gap analysis ref**: P1, D2  
**Packages**: `internal/app/`, `internal/vec/`, `internal/raycaster/`  
**Depends on**: Nothing  
**Effort**: ~10 lines removed, comments updated

---

## 1. Background

Several pieces of dead code and refactoring artifacts exist in the codebase. None affect correctness, but they confuse maintainers.

## 2. Items to Clean

### 2.1 Remove `EmitProgress` stub

**File**: `app.go` lines ~107-111

```go
// EmitProgress sends a progress event to the frontend during optimization.
// Deprecated: progress is now emitted directly via runtime.EventsEmit in internal/app/optimizer.go.
func (a *App) EmitProgress(pct float64, label string) {
    // no-op: kept for backward compatibility with older frontend builds
}
```

**Action**: Remove this function. It's been deprecated long enough that no frontend build references it. Verify by searching `EmitProgress` in all frontend files.

### 2.2 Remove unused `Min`/`Max` from vec package

**File**: `internal/vec/vec.go` lines ~45-58

```go
// Min returns the minimum of two ints.
// Deprecated: use the builtin min() since Go 1.21.
func Min(a, b int) int { ... }
// Max returns the maximum of two ints.
// Deprecated: use the builtin max() since Go 1.21.
func Max(a, b int) int { ... }
```

**Action**: Remove both functions and their deprecation comments. Go 1.23 provides builtin `min`/`max`. Verify no callers exist with `grep -rn 'vec\.Min\|vec\.Max' internal/`.

### 2.3 Clean up "Vector helpers removed" comments

**File**: `internal/raycaster/raycaster.go` lines ~98 and similar

```go
// Vector helpers removed — use vec.Normalize, vec.Sub, vec.RotateX, vec.RotateY from penopt/internal/vec
```

**Action**: Remove these refactoring artifact comments. The inline rotation code is now self-documenting.

### 2.4 Remove `three-mesh-bvh` dependency (optional)

**File**: `frontend/package.json`

The `three-mesh-bvh` package is listed as a dependency but never imported. The BVH is implemented in Go. Removing it saves ~200KB in the bundled JS.

**Action**: Run `npm uninstall three-mesh-bvh` in the `frontend/` directory.

## 3. Validation

1. `go build ./...` passes
2. `go vet ./...` passes
3. `go test ./internal/...` passes
4. Frontend builds: `cd frontend && npm run build` passes
