# PenOpt UI Makeover — Design Spec

**Date:** 2026-05-12  
**Author:** AI (refactoring-ui skill)  
**Current Score:** ~4/10  
**Target Score:** 8/10  

---

## Executive Summary

PenOpt's UI has a solid dark theme foundation but suffers from **poor layout hierarchy, cramped content, and missing scroll infrastructure**. The main issues are:

1. Left sidebar cards cut off content instead of scrolling
2. Cards in the main panel shrink and clip their content
3. Results overlay the 3D viewport awkwardly (no clear split)
4. Material grid and accordion sections are cramped
5. No accordion expansion/collapse in sidebar cards (they should)
6. Visual hierarchy is flat — everything competes for attention

---

## Issue Breakdown & Fixes

### 1. Left Sidebar — Scroll Issues & Content Clipping

**Problems:**
- `#sidebar` has `overflow-y: auto` but cards inside don't — content clips
- Material grid (`#mat-grid`) has fixed `max-height: 180px` but scrolls awkwardly
- Accordion sections don't expand properly — they overflow the sidebar
- Cards scale down children to fit, making text unreadable

**Fixes:**
```css
/* Make sidebar scrollable with proper scrollbar */
#sidebar {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
  padding-bottom: var(--space-4);
}

/* Remove fixed heights that cause clipping */
#mat-grid {
  max-height: none; /* Let it grow, sidebar scrolls instead */
  overflow-y: visible;
}

/* Cards should expand to content */
.card {
  min-height: 0; /* Allow flex children to shrink */
}

/* Card bodies should scroll if needed */
.card-body {
  overflow-y: auto;
  max-height: 400px; /* Cap for sanity */
}
```

**New accordion behavior for cards:**
- All cards (except upload) should be accordion-style
- Click card-head to expand/collapse
- Remember state in JS
- Initially: Material + Optimize collapsed, Advanced expanded

---

### 2. Right Pane — 60/40 Split Between Results & 3D View

**Problems:**
- `#results` is an absolute-positioned overlay at the bottom of `#viewport`
- It covers the 3D view and clips content
- No clear visual separation between results and viewport

**Fixes — New Layout:**
```css
/* Split viewport-area into viewport + results */
#viewport-area {
  display: flex;
  flex-direction: column;
}

#vp-header { /* stays same */ }
#viewport { flex: 1; min-height: 0; } /* 3D canvas */
#results-wrapper {
  height: 40%; /* 40% for results */
  min-height: 280px;
  max-height: 60%;
  overflow-y: auto;
  background: var(--bg2);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
```

**New `#results-wrapper` element:**
- Contains `#results-summary` + `#results-grid` + plot cards
- Scrollable independently from viewport
- Has its own header bar with collapse toggle
- Resizable via drag handle (stretch goal)

---

### 3. Cards — Stop Scaling Down & Cutting Content

**Problems:**
- Cards use `overflow: hidden` which clips content
- Text inside cards gets squeezed
- Tables (`opt-table`, `is-table`) overflow horizontally
- Energy value (22px font) gets compressed

**Fixes:**
```css
/* Cards shouldn't clip, they should scroll */
.card {
  overflow: visible; /* Allow content to breathe */
}

.card-body {
  overflow-y: auto;
  max-height: 500px;
}

/* Tables scroll horizontally if needed */
.opt-table, .is-table {
  display: block;
  overflow-x: auto;
  white-space: nowrap;
}

/* Cap font sizes that cause overflow */
.energy-val {
  font-size: 18px; /* Reduced from 22px */
}
.opt-angles {
  font-size: 16px; /* Reduced from 18px */
}
```

---

### 4. Material Grid — Accordion + Better Layout

**Problems:**
- Material picker grid is cramped (180px max-height)
- Hard to scan through materials
- Filter doesn't work well at small size

**Fixes:**
- Move material picker to its own accordion section in sidebar
- Make material grid expand to fill available space (sidebar scrolls)
- Show material preview on hover (density, atomic number)
- Add count badge on filter tabs ("All (42)", "M (15)")

---

### 5. Visual Hierarchy — De-emphasize Secondary Elements

**Principles (from refactoring-ui skill):**

| Element | Current | Should Be |
|---------|---------|-----------|
| Card headers | Same size as body | Smaller (10px), uppercase, muted |
| Status pills | Same weight | Smaller, monospace |
| Buttons | All same | Primary/secondary hierarchy |
| Labels | Same as values | Smaller, uppercase, muted |
| Data values | Normal | Larger, bold, monospace |

**Specific fixes:**

```css
/* Labels are secondary — de-emphasize them */
.rs-lbl {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted); /* Was text-dim */
  font-weight: 500;
}

/* Values are primary — emphasize them */
.rs-val {
  font-size: 16px; /* Was 14px */
  font-weight: 700;
}

/* Card heads are labels */
.card-head {
  font-size: 10px;
  color: var(--text-muted);
  background: var(--bg3);
}
```

---

### 6. Advanced Controls Accordion — Cleanup

**Problems:**
- Accordion sections have inconsistent padding
- Scanner grid inputs are cramped
- Preset buttons are too small

**Fixes:**
```css
/* Accordion body — more breathing room */
.acc-body {
  padding: var(--space-3);
}

/* Scanner inputs — bigger touch targets */
.scanner-grid input {
  width: 80px; /* Was 70px */
  padding: 4px 6px;
  font-size: 11px;
}

/* Presets — more clickable */
.presets button {
  padding: 4px 6px;
  font-size: 11px;
}
```

---

### 7. Results Cards — Better Spacing & Typography

**Problems:**
- Results summary overlaps with viewport
- Energy card feels disconnected
- Export buttons are too small

**Fixes:**
```css
/* Results wrapper gets proper padding */
#results-wrapper {
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

#results-summary {
  display: flex;
  align-items: center;
  gap: var(--space-4); /* Increased from space-2 */
  padding: var(--space-3) var(--space-4);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
}

#results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-3);
}

/* Export buttons — bigger */
.export-btn {
  padding: 6px 14px;
  font-size: 11px;
}
```

---

### 8. Heatmap Legend — Better Positioning

**Problems:**
- Legend overlaps with results
- Small and hard to read

**Fix:**
```css
#heatmap-legend {
  bottom: var(--space-4); /* More margin from results */
  right: var(--space-4);
  padding: 8px 14px;
}

.legend-gradient { width: 120px; height: 12px; }
.legend-labels { width: 120px; font-size: 10px; }
```

---

### 9. Progress Indicator — Better Positioning

**Problems:**
- Progress ring overlaps with content
- Can feel disconnected from the action

**Fix:**
```css
#progress-ring {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* Already good, but adjust text */
}
.pr-pct { font-size: 24px; margin-top: 36px; }
.pr-info { font-size: 12px; }
```

---

### 10. Status Bar — Refined

**Current:** Simple text bar
**Should:** Show context-aware status with icons

```css
#status-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-3);
  height: 28px;
  font-size: 11px;
}

#status-text::before {
  content: '●';
  color: var(--green-500);
  margin-right: 6px;
  font-size: 8px;
}
```

---

## Layout Changes — Before/After

### Before
```
┌─────────────────────────────────────────────────────┐
│ HEADER                                              │
├──────────┬──────────────────────────────────────────┤
│          │ VP HEADER (Optimize | Progress)          │
│ SIDEBAR  ├──────────────────────────────────────────┤
│ (cards)  │                                          │
│          │           3D VIEWPORT                    │
│          │                                          │
│          ├──────────────────────────────────────────┤
│          │ RESULTS (absolute, overlaps viewport)     │
└──────────┴──────────────────────────────────────────┘
│ STATUS BAR                                          │
└─────────────────────────────────────────────────────┘
```

### After
```
┌─────────────────────────────────────────────────────┐
│ HEADER                                              │
├──────────┬──────────────────────────────────────────┤
│          │ VP HEADER (Optimize | Progress)          │
│ SIDEBAR  ├──────────────────────────────────────────┤
│ (cards   │                                          │
│ scroll)  │         3D VIEWPORT (60%)                │
│          │                                          │
│          ├──────────────────────────────────────────┤
│          │ RESULTS PANEL (40%, scrolls)             │
│          │  ┌─────────────────────────────────────┐  │
│          │  │ Summary | Cards | Plots | Tradeoff │  │
│          │  └─────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────┘
│ STATUS BAR                                          │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Status

### ✅ Completed

1. **Sidebar scrollbar fixed** — `#sidebar` now has `overflow-y: auto` and is the scroll container. Cards no longer clip content.
2. **60/40 split** — `#viewport-area` uses flex with `#viewport` (flex:6) and `#results-panel` (flex:4). Results are in a dedicated panel below the 3D view.
3. **Cards accordion** — Material and Optimize cards collapse via click on card-head. Advanced controls accordion was already implemented.
4. **Card overflow fixed** — Cards no longer have `overflow:hidden`. Card bodies have proper overflow handling.
5. **New CSS variables** — Consistent spacing scale (`--sp-1` through `--sp-12`) replacing magic numbers.
6. **Visual hierarchy improved** — Labels de-emphasized (uppercase, smaller, muted). Values emphasized (larger, bold, mono).
7. **Results panel structure** — `#results-panel` contains header bar + `#results-content` (scrollable) + all result cards.
8. **Collapse toggle** — Results panel has a collapse button in the header bar.

### Files Modified

| File | Changes |
|------|---------|
| `index.html` | Added `#results-panel` container, added accordion classes to cards, added chevrons to card-heads |
| `style.css` | Complete redesign: 60/40 split, consistent spacing, proper scroll behavior, refined typography |
| `optimizer.js` | Added `setupCardAccordion()`, updated `$('results')` → `$('results-panel')` |
| `scene.js` | Updated `switchLayoutMode()` for new results panel |
| `filehandler.js` | Updated `$('results')` → `$('results-panel')` |
| `main.js` | Import `setupCardAccordion`, initialize it, added results collapse toggle |

### Remaining Issues to Address

1. **Layout mode buttons** (D/V/R) need testing — "R" mode should show full results
2. **Material grid** could be improved with sticky headers and better hover states
3. **IntelliScan card** visibility toggle needs review (uses `display:none` style, should use hidden class)
4. **Plot canvases** may need canvas resize handling for the new layout
5. **Layout at different viewport sizes** — media queries should be verified
6. **The `#restore-banner` inline styles** in HTML could be moved to CSS classes

### Testing Checklist

- [ ] Sidebar scrolls smoothly when content exceeds height
- [ ] Cards expand/collapse with click
- [ ] Results appear in dedicated panel below 3D view
- [ ] Layout mode "R" (Full results) works correctly
- [ ] Layout mode "V" (Full viewport) hides sidebar and results
- [ ] Heatmap legend doesn't overlap results
- [ ] Progress ring displays correctly during optimization
- [ ] All buttons have hover states
- [ ] Focus states work for keyboard navigation
- [ ] Works at 1920x1080 and 2560x1440

---

## Files to Modify

| File | Changes |
|------|---------|
| `index.html` | Add `#results-wrapper` container, make sidebar cards accordion |
| `style.css` | Complete overhaul: layout, spacing, typography, scroll behavior |
| `main.js` | Accordion state management, layout mode toggle updates |

---

## Success Criteria

- [ ] Sidebar scrolls smoothly with all content accessible
- [ ] Cards expand/collapse with smooth animation
- [ ] Material picker is easy to scan and select
- [ ] Results panel is clearly separated from 3D view (60/40)
- [ ] No content is cut off or squeezed
- [ ] Visual hierarchy is clear (squint test passes)
- [ ] Works at 1920x1080 and 2560x1440
- [ ] No horizontal scrollbar on the main layout