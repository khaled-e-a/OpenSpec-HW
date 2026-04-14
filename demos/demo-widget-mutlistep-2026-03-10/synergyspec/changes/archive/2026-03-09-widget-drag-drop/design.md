## Context

The dashboard currently renders widgets in a static grid — positions are fixed at mount time and cannot be changed by the user. This change introduces a drag-and-drop layer on top of the existing grid so users can rearrange widgets interactively. The design must handle snap-to-grid positioning, real-time collision detection, drag-preview rendering, and layout state serialisation. The implementation is purely front-end (React + TypeScript); no backend changes are required.

## Use Case Coverage

See `usecases.md` "Use Case Traceability Mapping" for the complete list of steps. This design addresses:

| Use Case Step | Description | Design Section |
|---------------|-------------|----------------|
| UC1-S1 | User presses down on a widget to start dragging | Decision 1 — DnD Library |
| UC1-S2 | System lifts the widget visually (raises z-index, applies drag styling) and attaches it to the pointer | Decision 2 — Drag Overlay |
| UC1-S3 | System displays a ghost/shadow overlay at the nearest valid snap-to-grid position as the user moves the pointer | Decision 3 — Snap-to-Grid & Ghost |
| UC1-S4 | User moves the pointer across the grid toward the desired target cell | Decision 1 — DnD Library |
| UC1-S5 | System continuously updates the ghost to the nearest valid snap position, keeping the preview within grid bounds | Decision 3 — Snap-to-Grid & Ghost |
| UC1-S6 | User releases the pointer over the target position | Decision 1 — DnD Library |
| UC1-S7 | System validates that the target position is unoccupied and within grid bounds | Decision 4 — Collision Detection |
| UC1-S8 | System commits the new position — updates layout state and re-renders the widget at the target cell | Decision 5 — Layout State |
| UC1-S9 | System removes the drag overlay and restores normal widget appearance | Decision 2 — Drag Overlay |
| UC1-E1a | User drags by touch — system handles touch events equivalently | Decision 1 — DnD Library |
| UC1-E3a | No valid snap position near pointer — system shows no ghost or a "cannot drop" indicator | Decision 3 — Snap-to-Grid & Ghost |
| UC1-E6a | User releases outside grid — system cancels, widget returns to original position | Decision 4 — Collision Detection |
| UC1-E7a | Target position is occupied — collision detected, drop rejected, widget returns | Decision 4 — Collision Detection |
| UC1-E7b | Target position is partially out of bounds — drop rejected, widget returns | Decision 4 — Collision Detection |
| UC1-Ea | User presses Escape — drag cancelled immediately, widget returns, layout unchanged | Decision 1 — DnD Library |

### Unaddressed Use Case Steps
None — all steps are covered by the decisions below.

---

## Goals / Non-Goals

**Goals:**
- Free-form drag-and-drop repositioning of widgets within a fixed-column grid
- Snap-to-grid positioning (widgets land on whole cell coordinates)
- Real-time ghost/shadow preview during drag showing the drop target
- Collision detection preventing widget overlap
- Bounds enforcement (no widget can be dragged outside the grid)
- Keyboard-accessible cancel (Escape key)
- Touch/pointer device support
- Serialisable layout state (positions + sizes as plain JSON)

**Non-Goals:**
- Widget resizing via drag handles (separate change)
- Server-side layout persistence (consumer's responsibility; we emit state)
- Animated re-flow of other widgets when a gap is created (static layout model)
- Multi-select drag of several widgets at once

---

## Decisions

### Decision 1: DnD Library — `@dnd-kit/core`

**Addresses**:
- UC1-S1 - User presses down on a widget to start dragging
- UC1-S4 - User moves the pointer across the grid toward the desired target cell
- UC1-S6 - User releases the pointer over the target position
- UC1-E1a - User drags by touch — system handles touch events equivalently
- UC1-Ea - User presses Escape — drag cancelled immediately, widget returns, layout unchanged

**Rationale**: `@dnd-kit/core` provides a headless, accessibility-aware DnD primitive that supports pointer and touch sensors out of the box. It fires `onDragStart`, `onDragMove`, `onDragEnd`, and `onDragCancel` events (Escape triggers cancel automatically), giving us full control over rendering. It does not impose an opinion on layout, which is necessary because we are managing our own grid coordinate system.

**Alternative Considered**: `react-beautiful-dnd` — Rejected because it is list-oriented and does not support free-form 2D grid positioning. `react-grid-layout` — Rejected because it bundles layout logic and rendering that conflicts with the existing grid structure.

---

### Decision 2: Drag Overlay for Visual Lift

**Addresses**:
- UC1-S2 - System lifts the widget visually (raises z-index, applies drag styling) and attaches it to the pointer
- UC1-S9 - System removes the drag overlay and restores normal widget appearance

**Rationale**: `@dnd-kit` provides a `<DragOverlay>` portal component that renders a clone of the dragged widget at the pointer position, detached from the grid flow. The original widget slot remains in the DOM (visually faded/hidden) so the layout does not reflow during the drag. On `onDragEnd` or `onDragCancel`, the overlay unmounts and the original is restored to full opacity.

**Alternative Considered**: Moving the actual DOM node with CSS `transform` — Rejected because it disrupts grid reflow and makes snap-preview harder to implement independently.

---

### Decision 3: Snap-to-Grid Positioning & Ghost Preview

**Addresses**:
- UC1-S3 - System displays a ghost/shadow overlay at the nearest valid snap-to-grid position as the user moves the pointer
- UC1-S5 - System continuously updates the ghost to the nearest valid snap position, keeping the preview within grid bounds
- UC1-E3a - No valid snap position near pointer — system shows no ghost or a "cannot drop" indicator

**Rationale**: During `onDragMove`, we convert the pointer's absolute page coordinates to grid cell coordinates using the grid container's bounding rect and cell dimensions:

```
col = clamp(floor((pointerX - gridLeft) / cellWidth),  0, cols - widgetCols)
row = clamp(floor((pointerY - gridTop)  / cellHeight), 0, rows - widgetRows)
```

A `GhostWidget` component (absolutely positioned, same size as the dragged widget) renders at `(col, row)`. Its appearance (valid = semi-transparent blue, invalid = red/hidden) is driven by the collision-detection result. The ghost updates on every `onDragMove` event — no debounce, as this must feel instantaneous.

**Alternative Considered**: CSS Grid `column`/`row` line snapping — Rejected because it couples the ghost position to CSS layout rather than our coordinate model, making collision checks harder.

---

### Decision 4: Collision Detection & Drop Validation

**Addresses**:
- UC1-S7 - System validates that the target position is unoccupied and within grid bounds
- UC1-E6a - User releases outside grid — system cancels, widget returns to original position
- UC1-E7a - Target position is occupied — collision detected, drop rejected, widget returns
- UC1-E7b - Target position is partially out of bounds — drop rejected, widget returns

**Rationale**: A widget occupies cells `{col, row}` through `{col + w - 1, row + h - 1}`. Collision detection iterates over all cells in the candidate bounding box and checks whether any cell is occupied by a different widget. Out-of-bounds is detected by checking `col + w > totalCols || row + h > totalRows || col < 0 || row < 0`. Both checks run synchronously (O(N) where N = total grid cells, typically < 200) on every `onDragMove` and `onDragEnd`.

On `onDragEnd`:
- Valid position → commit (Decision 5)
- Invalid position → call `onDragCancel`; widget returns to origin via CSS transition

**Alternative Considered**: Spatial hash map for O(1) lookup — unnecessary at the scale of a dashboard (< 20 widgets); O(N) is fine.

---

### Decision 5: Layout State Model

**Addresses**:
- UC1-S8 - System commits the new position — updates layout state and re-renders the widget at the target cell

**Rationale**: Layout is represented as a plain array of `WidgetLayout` records:

```ts
type WidgetLayout = {
  id: string;   // widget identifier
  col: number;  // 0-based left column
  row: number;  // 0-based top row
  w: number;    // width in grid units
  h: number;    // height in grid units
};
```

`DashboardGrid` accepts `layout: WidgetLayout[]` and `onLayoutChange: (layout: WidgetLayout[]) => void`. On a successful drop, it calls `onLayoutChange` with an updated layout array (immutable update — old item replaced). This keeps the component stateless with respect to persistence; the consumer decides whether to store in React state, Zustand, Redux, or localStorage.

**Alternative Considered**: Storing layout inside `DashboardGrid` local state — Rejected because consumers need to persist/restore layout; controlled-component pattern is more composable.

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Performance degradation on large grids (many `onDragMove` events) | Ghost update batched with `requestAnimationFrame`; collision check is O(N), fast enough for < 50 widgets |
| Touch event coordinate mapping differs across browsers | Delegate entirely to `@dnd-kit`'s `TouchSensor`, which normalises coordinates |
| Stale layout if consumer doesn't lift state correctly | Provide a minimal controlled-component example in the component's README |
| Widget size unknown at drag time (dynamic content) | Widget size (w, h) is declared as a prop on `DraggableWidget`, not inferred from DOM |

---

## Migration Plan

1. Install `@dnd-kit/core` and `@dnd-kit/utilities` as production dependencies.
2. Create `DashboardGrid` and `DraggableWidget` components under `src/components/dashboard/`.
3. Wrap existing widget usages with `DraggableWidget` and place inside `DashboardGrid` in the dashboard page.
4. Initial layout prop derived from existing static positions (one-time migration of hardcoded positions to `WidgetLayout[]`).
5. No rollback risk — the wrapper approach means existing widget components are untouched.

---

## Open Questions

- **Grid dimensions**: Should `cols`/`rows` be fixed or auto-sized to the viewport? (Assume fixed for now; auto-sizing is a follow-up.)
- **Row height**: Fixed pixel height or aspect-ratio-based cells? (Assume fixed `rowHeight` prop, default 120px.)
- **Drag handle vs. full-widget drag**: Should only a dedicated handle trigger drag, or the full widget surface? (Assume full surface for now; handle-only is a prop option.)
