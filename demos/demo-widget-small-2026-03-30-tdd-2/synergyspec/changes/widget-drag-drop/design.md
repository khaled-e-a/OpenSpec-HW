## Context

The widget-drag-drop feature introduces an interactive dashboard grid to the React application. There is currently no drag-and-drop infrastructure in the project. The implementation requires selecting a DnD library, designing a grid coordinate model, implementing collision detection, and providing real-time visual feedback — all without modifying any existing components.

The target is a self-contained set of React components (`DashboardGrid`, `DraggableWidget`) that manage their own layout state and expose an `onLayoutChange` callback for persistence.

---

## Use Case Coverage

See `usecases.md` "Use Case Traceability Mapping" for the complete step list.

| Use Case Step | Description | Design Section |
|---------------|-------------|----------------|
| UC1-S1 | User clicks and holds on a widget to begin dragging it | Decision 1: DnD Library |
| UC1-S2 | System detaches widget visually and shows drag preview | Decision 3: Drag Preview |
| UC1-S3 | User moves pointer across dashboard canvas | Decision 1: DnD Library |
| UC1-S4 | System highlights grid cell(s) at current pointer position | Decision 4: Drop Zone Highlighting |
| UC1-S5 | User releases over valid, unoccupied grid region | Decision 2: Grid Coordinate Model |
| UC1-S6 | System snaps widget to nearest valid grid position | Decision 2: Grid Coordinate Model |
| UC1-S7 | System updates layout state | Decision 5: Layout State Management |
| UC1-E4a | Pointer outside canvas — no drop target highlighted | Decision 4: Drop Zone Highlighting |
| UC1-E4a1 | Widget returned to original position if released outside canvas | Decision 1: DnD Library |
| UC1-E5a | Target region occupied — invalid indicator shown | Decision 6: Collision Detection |
| UC1-E5a2 | Widget returned to original position if dropped on occupied region | Decision 6: Collision Detection |
| UC1-E5b | Escape key cancels drag, widget restored | Decision 1: DnD Library |
| UC2-S1 | User picks up new widget from source area | Decision 1: DnD Library |
| UC2-S2 | System shows drag preview of new widget | Decision 3: Drag Preview |
| UC2-S3 | User moves pointer over canvas | Decision 1: DnD Library |
| UC2-S4 | System highlights grid cell(s) new widget would occupy | Decision 4: Drop Zone Highlighting |
| UC2-S5 | User releases over valid unoccupied region | Decision 2: Grid Coordinate Model |
| UC2-S6 | System places widget at snapped grid position | Decision 2: Grid Coordinate Model |
| UC2-S7 | System updates layout state to include new widget | Decision 5: Layout State Management |
| UC2-E4a | No region large enough — no valid highlight | Decision 6: Collision Detection |
| UC2-E4a2 | Widget returned to source without placement | Decision 1: DnD Library |
| UC2-E5a | Target region partially occupied — invalid indicator | Decision 6: Collision Detection |
| UC2-E5b | User cancels drag — layout unchanged | Decision 1: DnD Library |
| UC3-S1 | User dragging a widget across canvas | Decision 1: DnD Library |
| UC3-S2 | System renders semi-transparent drag preview at pointer | Decision 3: Drag Preview |
| UC3-S3 | System computes and highlights snap target cell(s) | Decision 4: Drop Zone Highlighting |
| UC3-S4 | Highlight color indicates validity (green/red) | Decision 4: Drop Zone Highlighting |
| UC3-S5 | System continuously updates preview and highlight in real time | Decision 3 + Decision 4 |
| UC3-S6 | Widget placed or returned per drop outcome | Decision 6: Collision Detection |
| UC3-E3a | Widget over original position — neutral highlight | Decision 4: Drop Zone Highlighting |
| UC3-E5a | Drag preview lags — degrades gracefully, remains visible | Decision 3: Drag Preview |

### Unaddressed Use Case Steps
None — all 31 use case steps are covered by design decisions below.

---

## Goals / Non-Goals

**Goals:**
- Implement drag-and-drop repositioning of existing widgets (UC1)
- Implement drag-and-drop placement of new widgets (UC2)
- Provide real-time drag preview and drop-zone validity highlighting (UC3)
- Enforce snap-to-grid and collision detection
- Expose serializable layout state via `onLayoutChange` callback
- Work in all modern browsers (Chrome, Firefox, Safari, Edge)

**Non-Goals:**
- Touch/mobile drag support (out of scope for this change)
- Server-side layout persistence (consumer of `onLayoutChange` handles this)
- Widget resizing by drag handle (separate future capability)
- Undo/redo of layout changes
- Animated widget reflow when other widgets are displaced

---

## Decisions

### Decision 1: DnD Library — Use `react-dnd` with HTML5 Backend
**Addresses**:
- UC1-S1 - User clicks and holds on a widget to begin dragging it
- UC1-S3 - User moves the pointer across the dashboard canvas
- UC1-E4a1 - Widget is returned to original position if released outside canvas
- UC1-E5b - User presses Escape — drag cancelled, widget restored
- UC2-S1 - User picks up a new widget from the widget source area
- UC2-E5b - User cancels drag — layout unchanged

**Rationale**: `react-dnd` provides stable React hooks (`useDrag`, `useDrop`) that integrate cleanly with React state. The HTML5 backend gives native browser drag events including cancel-on-Escape and drop-outside-target (which fires a no-op and keeps original state). It is battle-tested, well-typed, and has no heavyweight dependencies.

**Alternative Considered**: `dnd-kit` — more modern API, but requires more manual implementation of snap and constraint logic. `react-beautiful-dnd` — optimized for list reordering, not 2D grid placement.

---

### Decision 2: Grid Coordinate Model — Integer Cell-Based Layout
**Addresses**:
- UC1-S5 - User releases the pointer over a valid, unoccupied grid region
- UC1-S6 - System snaps the widget to the nearest valid grid position
- UC2-S5 - User releases the pointer over a valid, unoccupied grid region
- UC2-S6 - System places the widget at the snapped grid position

**Rationale**: Each widget is described by `{ id, x, y, w, h }` where `x`, `y` are zero-based column/row indices and `w`, `h` are column/row span counts. During a drop, the pointer position (in pixels) is converted to grid coordinates by dividing by cell size (`Math.floor(pointerX / cellWidth)`, `Math.floor(pointerY / cellHeight)`), then clamped to the canvas boundary. This produces exact snap-to-grid behavior without floating-point rounding issues.

**Cell size**: Configurable via `cellSize` prop (default: `100px`). The grid canvas width determines the column count (`Math.floor(canvasWidth / cellSize)`).

**Alternative Considered**: CSS Grid with pixel offsets — harder to reason about collision detection and serialization.

---

### Decision 3: Drag Preview — Custom Layer via `react-dnd` Preview API
**Addresses**:
- UC1-S2 - System detaches widget visually and displays a drag preview following the pointer
- UC2-S2 - System shows a drag preview of the new widget following the pointer
- UC3-S2 - System renders a semi-transparent drag preview at current pointer position
- UC3-S5 - System continuously updates preview and highlight in real time
- UC3-E5a - Drag preview lags — system degrades gracefully, preview remains visible

**Rationale**: Use `react-dnd`'s `DragPreviewImage` (or a custom drag layer via `useDragLayer`) to render a semi-transparent ghost of the widget that follows the cursor. The custom layer approach is preferred: it renders the widget at 60% opacity in a fixed-position overlay div, updated on every `mousemove` event via `useDragLayer`. This avoids the browser's default grey-box drag image and supports graceful degradation (if `useDragLayer` updates lag, the last rendered preview remains visible rather than disappearing).

**Alternative Considered**: Browser-native drag image via `setDragImage` — limited styling control, platform-inconsistent opacity, no React re-render on move.

---

### Decision 4: Drop Zone Highlighting — Computed in `DashboardGrid` Drop Handler
**Addresses**:
- UC1-S4 - System highlights the grid cell(s) the widget would occupy at current pointer position
- UC1-E4a - Pointer outside canvas boundary — no drop target highlighted
- UC2-S4 - System highlights the grid cell(s) the new widget would occupy
- UC3-S3 - System computes and highlights the snap target grid cell(s)
- UC3-S4 - Highlight color indicates validity: green/neutral = valid, red/blocked = invalid
- UC3-E3a - Widget over its original position — neutral highlight shown

**Rationale**: `DashboardGrid` uses `useDrop` with `hover` callback to receive the current pointer position on every hover event. It computes the candidate snap position (grid x, y from pixel coordinates) and runs collision detection. The result is stored in React state as `{ candidatePos, isValid }`. A semi-transparent overlay cell is rendered at `candidatePos` with green background if valid, red if invalid, and neutral grey if the candidate equals the widget's current position. When the pointer leaves the canvas (`useDrop` fires `collect` with `isOver: false`), the overlay is hidden.

---

### Decision 5: Layout State Management — Controlled / Uncontrolled Component Pattern
**Addresses**:
- UC1-S7 - System updates the layout state to reflect the new widget position
- UC2-S7 - System updates the layout state to include the new widget

**Rationale**: `DashboardGrid` supports both controlled and uncontrolled usage:
- **Uncontrolled** (default): manages `layout` in internal `useState`. On drop, updates state and calls `onLayoutChange(newLayout)`.
- **Controlled**: consumer passes `layout` prop + `onLayoutChange`. Grid does not update internal state; consumer owns the source of truth.

Layout shape: `WidgetLayout[]` where `WidgetLayout = { id: string, x: number, y: number, w: number, h: number }`. This is serializable to JSON for persistence.

**Alternative Considered**: Redux/Context for layout state — overkill for a self-contained component; the callback pattern keeps the component portable.

---

### Decision 6: Collision Detection — Axis-Aligned Bounding Box (AABB) Check
**Addresses**:
- UC1-E5a - Target grid region is occupied — system shows invalid indicator
- UC1-E5a2 - Widget returned to original position if dropped on occupied region
- UC2-E4a - No unoccupied region large enough — no valid highlight shown
- UC2-E4a2 - Widget returned to source without placement
- UC2-E5a - Target region partially occupied — system shows invalid indicator
- UC3-S6 - User releases pointer; widget placed or returned per drop outcome

**Rationale**: For a candidate position `(cx, cy, cw, ch)`, iterate over all existing layout items (excluding the dragged widget itself). Two rectangles overlap if `cx < ox + ow && cx + cw > ox && cy < oy + oh && cy + ch > oy`. If any overlap is found, the candidate is invalid. This O(n) check is fast enough for typical dashboard widget counts (<50). Out-of-bounds check: `cx >= 0 && cy >= 0 && cx + cw <= colCount && cy + ch <= rowCount`.

On drop at an invalid position: the widget is not moved (state unchanged). The `useDrop` drop handler returns `{ didDrop: false }` which `react-dnd` uses to trigger the drag source's `endDrag` with `didDrop: false` — the widget snaps back to its original rendered position automatically.

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `react-dnd` HTML5 backend conflicts with other DnD libraries on the page | Use a single `DndProvider` at app root; document this constraint |
| Custom drag layer causes layout thrashing on slow devices | Debounce `useDragLayer` updates to max 60fps using `requestAnimationFrame` |
| Grid cell count computed from container width causes hydration mismatch (SSR) | Use `useEffect` + `ResizeObserver` to measure container width client-side; render placeholder on server |
| Large widget counts (>100) make collision detection visible | Cap at 50 widgets per grid instance; document limit in component props |
| Widget with `w > colCount` or `h > rowCount` breaks layout | Validate widget dimensions on input; clamp to grid bounds |

---

## Migration Plan

This is a net-new feature — no migration required.

**Deployment steps:**
1. Install `react-dnd` and `react-dnd-html5-backend` as production dependencies
2. Wrap the app (or dashboard page) with `<DndProvider backend={HTML5Backend}>`
3. Replace any static grid placeholders with `<DashboardGrid>` + `<DraggableWidget>` instances

**Rollback**: Remove the `DndProvider` wrapper and `DashboardGrid` usage — no existing components are modified.

---

## Open Questions

1. **Minimum row count**: Should the grid auto-expand rows when a widget is dragged below the visible canvas, or have a fixed row limit? (Proposed: fixed, configurable via `rowCount` prop, default 8)
2. **Widget source area**: Is there a widget tray/palette component in scope, or is UC2 triggered purely programmatically? (Proposed: out of scope for this change — UC2 wired via prop-controlled `layout` additions)
3. **Touch events**: Should a touch backend be added in a follow-up? (Proposed: yes, via `react-dnd-touch-backend` as a separate change)
