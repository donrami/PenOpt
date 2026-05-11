# PenOpt GUI Audit

## Current State: 2/10 (UX Heuristics Score)

The current Wails PenOpt app has a bare-minimum scaffolding. Comparing against the reference Tauri app reveals a massive feature gap across all 10 Nielsen heuristics.

---

## Feature Gap Analysis

### By UI Section

| Section | Reference (Tauri) | Current (Wails) | Status |
|---------|------------------|-----------------|--------|
| **Header** | Logo, title, sidebar toggle, pill indicators (keV, Tmin, Eeff), help button, window controls | Logo, title only | ❌ |
| **Sidebar: Upload** | Drop zone, file metadata (name, tris, watertightness, bbox), remove button | Drop zone, basic tris/bounds | ⚠️ |
| **Sidebar: Material** | Category tabs (All/Metal/Non-metal), search, 40+ material grid | ❌ Missing entirely | ❌ |
| **Sidebar: Optimize** | Status indicator, grid info, restore banner | ❌ Missing entirely | ❌ |
| **Sidebar: Advanced** | Accordion: Beam Energy, Pre-Filter, Scanner Geometry, Ray Grid, Engine | Basic: Scanner config + weights only | ⚠️ |
| **Viewport Controls** | Viewport header bar with results toggle, optimize button, progress, view modes, layout modes, fullscreen, labels, beam toggle | ❌ Missing entirely | ❌ |
| **Viewport Scene** | Three.js with orbit controls, grid, axes | Three.js with orbit controls, grid, axes | ✅ |
| **Viewport HUD** | Idle prompt, mesh info, rotation, optimal angle, compass, progress ring, stop button, camera reset | Loading spinner only | ❌ |
| **Heatmap** | Per-face penetration coloring + color legend | ❌ Missing entirely | ❌ |
| **Results Panel** | Collapsible right panel with summary bar, optimal orientation card, energy card, contour plot, rose plot, engine card, IntelliScan card, tradeoff card | Bottom overlay with 4 basic values | ❌ |
| **Status Bar** | Engine info, status text | Status text + mesh info | ⚠️ |
| **Export** | JSON export, PNG screenshot | ❌ Missing entirely | ❌ |
| **Help** | Full modal with documentation, research references, keyboard shortcuts, algorithm explanation | ❌ Missing entirely | ❌ |
| **Tooltips** | Comprehensive data-tip on every control | ❌ Missing entirely | ❌ |
| **Keyboard Shortcuts** | Ctrl+O, Ctrl+Enter, Esc, 1/2/3, R, Ctrl+S | ❌ Missing entirely | ❌ |
| **Error Handling** | Dismissible error banner, init error fallback | Console.error only | ❌ |
| **Watertightness** | Boundary edge detection + warning banner | ❌ Missing entirely | ❌ |
| **Multi-Material** | Group assignment + material picker per group | ❌ Missing entirely | ❌ |
| **IntelliScan** | Tangent-ray projection angle selection | ❌ Missing entirely | ❌ |

### Count: 0 ✅ full, 3 ⚠️ partial, 17 ❌ missing

---

## UX Heuristic Violations (Critical)

### 1. Visibility of System Status (Severity: 3 - Major)
- **No progress indicators** during optimization — user has no idea if search is running or stuck
- **No loading/parsing progress** for mesh processing
- No indication of which orientation is being evaluated
- **Fix:** Add progress ring, inline progress bar, and rotation HUD during search. Add status transitions.

### 2. Match Between System and Real World (Severity: 2 - Minor)
- Weight sliders have no labels showing current values
- Scanner config uses domain abbreviations (SDD, SOD) without explanation
- **Fix:** Add labels, units, and optional tooltips.

### 3. User Control and Freedom (Severity: 3 - Major)
- **No way to cancel an optimization** once started
- **No way to remove a mesh** once loaded
- **No way to reset camera view**
- **Fix:** Add stop button, remove button, camera reset. All must be visible and responsive.

### 4. Consistency and Standards (Severity: 2 - Minor)
- Layout doesn't match standard desktop app conventions
- No standard shortcuts (Ctrl+O for open, etc.)
- **Fix:** Add standard OS shortcuts, follow desktop app layout conventions.

### 5. Error Prevention (Severity: 3 - Major)
- No mesh watertightness check before optimization (produces wrong results silently)
- No file type validation in drop zone
- No SDD > SOD validation
- **Fix:** Add watertightness check, file validation, and config validation with clear error messages.

### 6. Recognition Rather Than Recall (Severity: 2 - Minor)
- No visual indication of current state (loaded, searching, done, error)
- No material category organization
- **Fix:** Add state badges, section visibility based on state, material categories.

### 7. Flexibility and Efficiency (Severity: 3 - Major)
- No keyboard shortcuts for power users
- No multiple view modes (heatmap, compare)
- No layout modes
- **Fix:** Keyboard shortcuts, view mode toggles, layout mode toggles.

### 8. Aesthetic and Minimalist Design (Severity: 2 - Minor)
- Current design is clean but sparse
- Results overlay covers the viewport
- **Fix:** Right-side results panel, proper results grid layout.

### 9. Help Users Recognize, Diagnose, Recover (Severity: 4 - Catastrophic)
- **Optimization errors only show in console** — user sees nothing
- **Mesh parse errors shown inline but not clearly**
- No error recovery suggestions
- **Fix:** Dismissible error banner with clear messages, recovery actions, visible not console-only.

### 10. Help and Documentation (Severity: 3 - Major)
- No help modal or documentation
- No tooltips on controls
- No explanation of what the scores mean
- **Fix:** Help modal with full docs, tooltips on every control, keyboard shortcut reference.

---

## Go Backend Audit

### What's Working
- STL/OBJ mesh parsing ✅
- BVH building ✅
- Möller-Trumbore ray-triangle intersection ✅
- Penetration calculation ✅
- f_mtl / f_energy / f_hdn scoring ✅
- Coarse→fine grid search ✅

### What's Missing (Go backend)
- Watertightness check (edge boundary detection) ❌
- Multi-material support (triangle groups) ❌
- Beam energy / Beer-Lambert physics engine ❌ (moved from WASM but not ported)
- NIST XCOM material database ❌ (40+ materials in JS, needs porting)
- Material μ/ρ interpolation ❌
- Pre-filter simulation (effective energy, flux ratio) ❌
- Energy/kV recommendation ❌
- Optimization cancellation (needs context-aware search) ❌
- IntelliScan angle selection ❌
- Per-face penetration heatmap data ❌

---

## Priority Matrix

| Priority | Feature | Effort | Impact | Why |
|----------|---------|--------|--------|-----|
| **P0** | Progress indicators + stop button | Small | Critical | Without this, users have no idea if search is running or stuck |
| **P0** | Error banner (visible, dismissible) | Small | Critical | Currently errors go to console only |
| **P0** | Material selection with NIST XCOM DB | Medium | High | Core physics dependency — without material, beam physics is meaningless |
| **P0** | Beam energy + Tmin controls | Medium | High | Core physics dependency |
| **P1** | Watertightness check + warning | Small | High | Wrong results on non-watertight meshes |
| **P1** | File metadata + remove button | Small | High | Users need to see what's loaded and clear it |
| **P1** | Right-side results panel with summary bar | Medium | High | Current overlay is too basic |
| **P1** | Optimal orientation card + metric table | Small | High | Core results display |
| **P1** | Viewport controls bar | Medium | High | Essential for user workflow |
| **P1** | Keyboard shortcuts | Small | High | Power user expectation |
| **P2** | Heatmap visualization + legend | Medium | Medium | Important for penetration analysis |
| **P2** | Score contour plot | Medium | Medium | Shows optimization landscape |
| **P2** | Penetration rose plot | Medium | Medium | Shows angular penetration pattern |
| **P2** | Camera reset + fullscreen | Small | Medium | Viewport ergonomics |
| **P2** | Help modal with docs | Medium | Medium | User education |
| **P2** | Tooltips everywhere | Medium | Medium | Explains domain concepts |
| **P2** | Energy recommendation | Small | Medium | Practical output value |
| **P2** | Export (JSON/PNG) | Small | Medium | Results portability |
| **P2** | Quality vs Energy tradeoff | Small | Medium | Core interaction |
| **P3** | View modes (heatmap/compare) | Medium | Low-Med | Nice to have |
| **P3** | Layout modes | Small | Low | Nice to have |
| **P3** | Labels toggle + beam visualization | Small | Low | Visualization helpers |
| **P3** | Scanner presets | Medium | Low | Convenience feature |
| **P3** | Pre-filter simulation | Medium | Low | Advanced feature |
| **P3** | IntelliScan angles | Medium | Low | Phase 8 feature |
| **P3** | Multi-material support | Large | Low | Phase 7 feature |
| **P3** | Restore banner | Small | Low | Nice to have |

---

## Recommended Build Order

### Phase 1: Foundation (P0 items)
1. NIST XCOM material database in Go (port from JS)
2. Beer-Lambert physics engine in Go (μ/ρ interpolation, Tmin, effective energy)
3. Beam energy + Tmin + pre-filter UI controls
4. Material picker UI (category tabs + search + grid)
5. Progress indicator + stop button
6. Error banner (dismissible, visible)

### Phase 2: Core Workflow (P1)
7. File metadata display + remove button
8. Watertightness check in Go + warning banner
9. Viewport controls bar (optimize button, view modes, fullscreen, etc.)
10. Right-side results panel with summary bar
11. Optimal orientation card with metric table
12. Keyboard shortcuts

### Phase 3: Analysis & Output (P2)
13. Heatmap visualization + legend
14. Score contour plot (canvas 2D)
15. Penetration rose plot (canvas polar)
16. Energy recommendation card
17. Export (JSON + PNG)
18. Help modal
19. Tooltips on every control
20. Quality vs Energy tradeoff card
21. Camera reset + fullscreen

### Phase 4: Polish (P3)
22. View modes (heatmap/compare)
23. Layout modes (default/viewport/results)
24. Labels + beam visualization toggles
25. Scanner presets
26. Pre-filter simulation
27. IntelliScan
28. Multi-material support
