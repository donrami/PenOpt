# UI Makeover — Current State Audit

**Date:** 2026-05-12  
**Auditor:** ux-redesign skill  
**Status:** Previous spec (refactoring-ui) partially implemented, ~7/10, but with critical bugs remaining

---

## ✅ What's Already Working Well

| Feature | Status | Notes |
|---------|--------|-------|
| Dark theme with proper color scale | ✅ | Good bg/bg2/bg3/surface hierarchy |
| Custom scrollbar (WebKit) | ✅ | `::-webkit-scrollbar` styled |
| Sidebar scrollable | ✅ | `overflow-y: auto` on `#sidebar` |
| Material grid scrollable via sidebar | ✅ | No `max-height`, defers to sidebar |
| 60/40 vertical split (viewport/results) | ✅ | `flex:6` / `flex:4` on viewport vs results |
| Card accordion classes + JS | ✅ | `card.accordion`, `setupCardAccordion()` |
| Results panel structure | ✅ | Header, collapsible content, summary bar, grid |
| View mode buttons (3D/Heat/Compare) | ✅ | Functional |
| Layout mode buttons (D/V/R) | ✅ | Functional |
| Spacing scale (--sp-1 through --sp-12) | ✅ | Consistent |
| Visual hierarchy — labels/values | ✅ | Labels de-emphasized, values emphasized |
| Help modal | ✅ | Functional with keyboard reference |
| Error banner | ✅ | Dismissible |
| Progress ring | ✅ | SVG ring + percentage |
| Collapse toggle on results panel | ✅ | JavaScript toggle |

---

## ❌ Remaining Issues

### Critical (content clipped or broken)

| # | Issue | File | Root Cause |
|---|-------|------|------------|
| 1 | **Cards clip accordion content** | `style.css` | `.card { overflow: hidden }` clips tall card bodies |
| 2 | **Cards shrink inside sidebar** | `style.css` | `flex-shrink: 1` (default) on flex items — cards compress to fit sidebar height instead of scrolling |
| 3 | **Tradeoff card stays hidden after re-optimize** | `optimizer.js` | `removeMesh()` sets `style.display = 'none'` on tradeoff card, but `showResults()` never clears it |
| 4 | **Advanced card initial state inconsistent** | `index.html` | Card has both `.open` and `.collapsed` on body — first click unexpectedly closes instead of opens |
| 5 | **Results collapse button titles swapped** | `main.js` | When collapsed, title says 'Expand' but code sets 'Collapse' and vice versa |

### Layout & Scroll

| # | Issue | File | Root Cause |
|---|-------|------|------------|
| 6 | **No Firefox scrollbar styling** | `style.css` | Only `::-webkit-scrollbar` — no `scrollbar-width: thin` or `scrollbar-color` |
| 7 | **Results panel plot canvases fixed height** | `style.css` | `canvas { height: 160px }` — doesn't adapt when results panel is taller/shorter |
| 8 | **Sidebar horizontal scroll possible** | `style.css` | Some grid elements could overflow 320px width |

### UX Heuristics

| # | Issue | Heuristic | Severity |
|---|-------|-----------|----------|
| 9 | **No focus-visible styles** | 4 - Consistency | Minor — keyboard users can't see focus |
| 10 | **Help modal doesn't trap focus** | 4 - Consistency | Minor — Tab escapes modal |
| 11 | **No transition on results content collapse** | 1 - System status | Minor — abrupt hide/show |
| 12 | **Upload card always visible — can't collapse** | 8 - Minimalist design | Minor — wastes space after mesh loaded |

---

## User-Reported Pain Points (mapped to code)

| User said | What's actually happening | Root Cause |
|-----------|-------------------------|------------|
| "Left pane needs a scrollbar" | Sidebar has `overflow-y: auto` but cards shrink before scrolling kicks in | `flex-shrink: 1` on cards |
| "Cards should stop scaling themselves down" | Cards shrink to fit sidebar due to flex | `flex-shrink: 1` |
| "Cards cutting content off" | `.card { overflow: hidden }` clips content | `overflow: hidden` on card |
| "Cards need accordion" | Accordion code exists but may not work if overflow clips expanded body | `overflow: hidden` defeats accordion |
| "Right pane has issues" | Multiple small bugs (tradeoff hidden, plot heights, collapse titles) | Various |
| "Results separated from 3D view in 60/40 split" | CSS is correct ✅ | — |

---

## Scoring (ux-redesign framework)

### Nielsen Heuristic Scores

| Heuristic | Score | Reasoning |
|-----------|-------|-----------|
| 1. Visibility of system status | 7/10 | Progress ring good. But collapse, accordion states not always clear |
| 2. Match system & real world | 8/10 | Scanner abbreviations could be clearer |
| 3. User control & freedom | 7/10 | Can cancel, remove, reset — good |
| 4. Consistency & standards | 6/10 | Focus styles missing, no standard OS scrollbar |
| 5. Error prevention | 7/10 | File validation, watertight check present |
| 6. Recognition vs recall | 7/10 | Material categories help, but state not always visible |
| 7. Flexibility & efficiency | 7/10 | Shortcuts, layout modes present |
| 8. Aesthetic & minimal design | 7/10 | Clean, but card overflow bugs hurt |
| 9. Error recovery | 7/10 | Error banner dismissible |
| 10. Help & documentation | 8/10 | Help modal with shortcuts + algorithm docs |

**Overall: 7.1/10** — Down from a potential 9 due to critical bugs listed above.
