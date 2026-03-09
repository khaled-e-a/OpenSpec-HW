## Context

The dashboard currently renders widgets in a static layout. This design introduces an interactive drag-and-drop layer using a React DnD library, a grid coordinate system, and collision detection — enabling users to rearrange widgets by dragging them to any valid grid position. Widget positions are managed in frontend state and snapped to a discrete grid on drop.

## Use Case Coverage

See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
This design addresses the following use case steps:

- UC1-S1: User initiates a drag gesture on a widget → Decision 1: DnD Library Selection
- UC1-S2: System lifts the widget visually and displays a drag preview following the pointer → Decision 2: Drag Preview Strategy
- UC1-S3: User moves the pointer across the grid → Decision 1: DnD Library Selection
- UC1-S4: System highlights the nearest valid grid cell(s) as a drop target as the pointer moves → Decision 3: Drop Target Highlighting
- UC1-S5: User releases the pointer over the desired grid position → Decision 4: Drop Resolution
- UC1-S6: System snaps the widget to the nearest valid grid cell → Decision 5: Grid Snapping Algorithm
- UC1-S7: System updates and persists the widget's grid position in the dashboard state → Decision 6: State Management
- UC1-E4a: Pointer moves over an occupied cell — system indicates cell is unavailable → Decision 3: Drop Target Highlighting
- UC1-E5a: User releases pointer outside grid bounds — system cancels drag and restores original position → Decision 4: Drop Resolution
- UC1-E5b: User releases pointer over occupied cell — system cancels drop and restores original position → Decision 4: Drop Resolution
- UC2-S1: User's pointer enters an empty grid area during a drag → Decision 1: DnD Library Selection
- UC2-S2: System computes the grid cell(s) the widget would occupy at the pointer position → Decision 5: Grid Snapping Algorithm
- UC2-S3: System highlights the target cell(s) to show the snap preview → Decision 3: Drop Target Highlighting
- UC2-S4: User releases the pointer → Decision 4: Drop Resolution
- UC2-S5: System places the widget snapped to the computed cell(s) → Decision 5: Grid Snapping Algorithm
- UC2-S6: System removes the drag preview and shows the widget in its final position → Decision 2: Drag Preview Strategy
- UC2-E2a: Widget would extend beyond grid boundary — system clamps position to keep widget within bounds → Decision 5: Grid Snapping Algorithm

### Unaddressed Use Case Steps
None — all 17 use case steps are covered by the decisions below.

## Goals / Non-Goals

**Goals:**
- Enable drag-and-drop reordering of widgets on a fixed-column grid
- Snap widgets to discrete grid cells on drop
- Prevent widget overlap and out-of-bounds placement
- Provide real-time visual feedback (drag preview + drop target highlight) during drag
- Manage widget positions in React component state

**Non-Goals:**
- Widget resizing (changing column/row span) — out of scope for this change
- Persisting layout to a backend or localStorage
- Touch/mobile drag support (mouse/pointer events only for this iteration)
- Undo/redo of layout changes

## Decisions

### Decision 1: DnD Library Selection — `@dnd-kit/core`
**Addresses**: UC1-S1 - User initiates a drag gesture on a widget; UC1-S3 - User moves the pointer across the grid; UC2-S1 - User's pointer enters an empty grid area during a drag

**Rationale**: `@dnd-kit/core` provides accessible, modular drag-and-drop primitives for React. It supports custom sensors (pointer events), does not manipulate the DOM directly (making snapping logic easy to own), and has no peer dependency on a specific grid library. The `useDraggable` and `useDroppable` hooks integrate cleanly with React state.

**Alternative Considered**: `react-dnd` — rejected because it requires wrapping the app in a `DndProvider` with a backend and has more complex type definitions; `@dnd-kit` is lighter and more composable.

---

### Decision 2: Drag Preview Strategy — Custom Drag Overlay
**Addresses**: UC1-S2 - System lifts the widget visually and displays a drag preview following the pointer; UC2-S6 - System removes the drag preview and shows the widget in its final position

**Rationale**: Use `@dnd-kit`'s `DragOverlay` component to render a floating clone of the dragged widget that follows the pointer. The original widget slot is kept visible but dimmed to indicate its original position. On drop (or cancel), the overlay is unmounted and the widget renders in its final position.

**Alternative Considered**: CSS `opacity` on the dragged element only — rejected because it doesn't provide a clean visual separation between "widget being dragged" and "where it will land".

---

### Decision 3: Drop Target Highlighting
**Addresses**: UC1-S4 - System highlights the nearest valid grid cell(s) as a drop target as the pointer moves; UC1-E4a - Pointer moves over an occupied cell — system indicates cell is unavailable; UC2-S3 - System highlights the target cell(s) to show the snap preview

**Rationale**: Each grid cell is registered as a `useDroppable` zone. During drag, the active droppable ID is tracked via `onDragOver`. Valid (empty) targets render a highlight border; occupied targets render a "blocked" indicator (e.g., red tint). Highlighting is driven by React state, not CSS hover, to ensure correctness when a widget spans multiple cells.

**Alternative Considered**: CSS `:hover` on cells — rejected because it cannot distinguish occupied vs. empty cells during a drag and cannot account for multi-cell widgets.

---

### Decision 4: Drop Resolution
**Addresses**: UC1-S5 - User releases the pointer over the desired grid position; UC1-E5a - User releases pointer outside grid bounds — system cancels drag and restores original position; UC1-E5b - User releases pointer over occupied cell — system cancels drop and restores original position; UC2-S4 - User releases the pointer

**Rationale**: The `onDragEnd` handler from `@dnd-kit` receives the active item and the over target. If `over` is null (out-of-bounds) or the target cell is occupied, the operation is cancelled and the widget's position is unchanged. If the drop is valid, the position is updated in state. This single handler owns all drop outcomes.

---

### Decision 5: Grid Snapping Algorithm
**Addresses**: UC1-S6 - System snaps the widget to the nearest valid grid cell; UC2-S2 - System computes the grid cell(s) the widget would occupy at the pointer position; UC2-S5 - System places the widget snapped to the computed cell(s); UC2-E2a - Widget would extend beyond grid boundary — system clamps position to keep widget within bounds

**Rationale**: Grid cells have fixed pixel dimensions (configurable via props: `cellWidth`, `cellHeight`, `gap`). During drag, pointer coordinates are translated to `(col, row)` by dividing by `(cellWidth + gap)` and flooring. For multi-cell widgets, the top-left anchor cell is computed and remaining cells are derived from widget size. Boundary clamping: `col = clamp(col, 0, totalCols - widget.colSpan)`, `row = clamp(row, 0, totalRows - widget.rowSpan)`. Collision detection checks if any of the widget's cells overlap an occupied cell (excluding the widget being dragged itself).

---

### Decision 6: State Management — Lifted State via Props/Callback
**Addresses**: UC1-S7 - System updates and persists the widget's grid position in the dashboard state

**Rationale**: Widget positions are stored as `{ id, col, row, colSpan, rowSpan }[]` in the parent component that renders `DashboardGrid`. The grid accepts `widgets` and `onLayoutChange` props, keeping it a controlled component. This makes the grid reusable and testable without requiring a global store. Consumers can connect their own state management (Redux, Zustand, etc.) via `onLayoutChange`.

**Alternative Considered**: Internal grid state — rejected because it makes the grid uncontrolled and prevents consumers from persisting or reacting to layout changes.

---

## Risks / Trade-offs

- **Performance with many widgets**: `useDroppable` on every cell can be expensive at large grid sizes. → Mitigation: virtualise or limit grid size (e.g., max 12×12); evaluate with profiling if needed.
- **Multi-cell drag accuracy**: Computing the snap anchor relative to where the user grabbed the widget (not just the top-left corner) requires tracking the grab offset. → Mitigation: capture pointer offset on `dragStart` and subtract from snap calculation.
- **Accessibility**: Drag-and-drop is inherently pointer-centric. → Mitigation: `@dnd-kit` provides keyboard sensor support; add keyboard drag as a follow-up.

## Migration Plan

1. Install `@dnd-kit/core` and `@dnd-kit/utilities` as new dependencies
2. Add `DashboardGrid` and `GridWidget` components alongside existing dashboard code (no removal of existing components)
3. Parent component switches from static layout to `DashboardGrid` with `onLayoutChange` wired to local state
4. No backend migration required; rollback is reverting to static layout rendering

## Open Questions

- Should the grid column count be fixed (e.g., 12 columns) or configurable per-dashboard? → Recommend configurable via `cols` prop, default 12.
- What visual style should the "blocked" drop target indicator use — red tint, strikethrough overlay, or icon? → To be decided with design review before implementation.
