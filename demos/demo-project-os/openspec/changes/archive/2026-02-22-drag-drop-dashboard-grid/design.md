## Context

React has no built-in grid layout system with drag-and-drop. This design covers a self-contained component library (no new runtime dependencies) that gives users a grid on which they can drag, drop, and freely reposition different-sized widgets. The implementation targets React 18+, TypeScript, and modern browsers. CSS Grid is used for layout; no canvas or absolute positioning layer is required.

## Goals / Non-Goals

**Goals:**
- A `DashboardGrid` container that manages layout state and renders widgets in a CSS grid
- A `Widget` component with configurable `colSpan`/`rowSpan` that integrates with drag interactions
- Snap-to-grid on drop, with collision detection to prevent widget overlap
- Keyboard cancellation (Escape) and boundary clamping
- Controlled component API (`initialLayout` + `onLayoutChange`) so consumers own state

**Non-Goals:**
- Widget resizing (resize handles are a separate capability)
- Persisting layout to localStorage or a backend
- Touch/mobile drag support (pointer events for mouse only in v1)
- Animated transitions between grid positions
- Auto-packing / reflow of widgets when a gap is created

## Decisions

### 1. Pointer events over HTML5 Drag and Drop API

**Decision**: Implement drag interactions using `pointermove` / `pointerup` events on `document`, not the HTML5 `draggable` + `ondragover` API.

**Rationale**: The HTML5 DnD API does not expose the live pointer position during a drag — only `dragenter`/`dragover` on valid drop targets, which creates janky ghost-cell updates. `pointermove` fires continuously with exact coordinates, enabling smooth real-time target cell preview. It also avoids browser inconsistencies in drag image rendering.

**Alternative considered**: HTML5 DnD — rejected due to lack of real-time pointer position.

---

### 2. Grid occupancy map as a flat Set

**Decision**: Represent occupied cells as `Set<string>` where each entry is `"col,row"`. Recompute on every layout change.

**Rationale**: The grid is small (typically ≤ 12×8 = 96 cells). A flat Set of `"col,row"` strings is trivially fast to build and query. It avoids a 2-D array and the index math that comes with it, and it's easy to exclude the dragged widget's own cells during collision checks (filter by widget id before building the set).

**Alternative considered**: 2-D boolean array — more memory-efficient at scale but awkward to maintain with sparse layouts.

---

### 3. Controlled component with internal fallback

**Decision**: `DashboardGrid` is a controlled component when `onLayoutChange` is provided, and uncontrolled (internal `useState`) when it is not. The `initialLayout` prop seeds the internal state in uncontrolled mode.

**Rationale**: Most serious dashboard use cases (persistence, undo, server sync) need to own layout state externally. At the same time, quick demos shouldn't require the consumer to wire up state. Mirroring React's standard pattern (controlled input vs. defaultValue) is the least-surprising API.

---

### 4. `useGridLayout` + `useDragDrop` hooks, composed by `DashboardGrid`

**Decision**: Split logic into two hooks:
- `useGridLayout(initialLayout, onLayoutChange?)` — owns the layout array, occupancy map, and exposes `moveWidget(id, col, row)`
- `useDragDrop(gridRef, layout, columns, rows, onDrop)` — owns drag state, pointer event listeners, target cell computation

`DashboardGrid` composes both hooks and passes callbacks + state down to `Widget` via React context.

**Rationale**: Keeping layout state separate from drag-interaction state allows independent testing and future reuse (e.g., a keyboard-driven layout editor could use `useGridLayout` alone). Context avoids prop-drilling `onDragStart` / `onDragEnd` through every `Widget`.

---

### 5. Target cell computed from pointer position relative to grid

**Decision**: On each `pointermove`, call `gridRef.current.getBoundingClientRect()` to get the grid's current position, then compute:

```
cellWidth  = (gridRect.width  - gap * (columns - 1)) / columns
cellHeight = (gridRect.height - gap * (rows    - 1)) / rows
rawCol     = Math.floor((pointerX - gridRect.left) / (cellWidth + gap)) + 1
rawRow     = Math.floor((pointerY - gridRect.top)  / (cellHeight + gap)) + 1
col        = clamp(rawCol, 1, columns - colSpan + 1)
row        = clamp(rawRow, 1, rows    - rowSpan + 1)
```

The clamping ensures the widget can never be dropped partially outside the grid.

**Rationale**: Computing from live `getBoundingClientRect` is resilient to page scroll and dynamic layout changes (e.g., sidebar collapse). Recomputing per-event is cheap at human pointer speeds.

---

### 6. Ghost placeholder is a regular grid item

**Decision**: Render the ghost placeholder as a positioned `<div>` inside `DashboardGrid` using the same CSS grid placement as a normal widget (`grid-column`, `grid-row`). It is shown only during an active drag.

**Rationale**: Placing the ghost in the CSS grid means it inherits gap and sizing automatically — no absolute coordinate math required. It visually sits in the grid alongside real widgets with no layout shift.

## Risks / Trade-offs

- **Performance on large grids**: `pointermove` fires ~60fps. For grids with many widgets (>50), rebuilding the occupancy Set per event could be slow. Mitigation: memoize the occupancy map and only rebuild it when layout changes, not on every `pointermove`.

- **`getBoundingClientRect` during scroll**: If the page scrolls mid-drag, the cell computation will drift on the next event. Mitigation: use `pointer capture` (`setPointerCapture`) so the element continues to receive events even if the pointer leaves the grid, and recalculate `getBoundingClientRect` each event (it always reflects current position).

- **No touch support**: `pointerdown` fires on touch but `pointermove` on mobile requires careful handling of `touch-action: none`. Deferring touch to a follow-up change avoids scope creep.

- **Controlled vs. uncontrolled mismatch**: If `onLayoutChange` is added after initial render (switching from uncontrolled to controlled), layout may diverge. Mitigation: log a warning (same as React's input behavior) and document that the mode should not change.

## Migration Plan

This is a net-new addition. No migration steps are required. Consumers opt in by importing and rendering `DashboardGrid` + `Widget`. No existing code is modified.

## Open Questions

- Should widgets support a `minColSpan` / `minRowSpan` for partial-size constraints during a future resize feature? Noting here so the `Widget` prop interface is not closed prematurely.
- Should `onLayoutChange` receive a diff (what moved) or the full layout array? Current decision: full array (simpler, idiomatic with React state setters). Can add a diff overload later.
