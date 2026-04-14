## Context

The widget-drag-drop feature introduces a fully interactive dashboard grid to the React application. Currently the application has no configurable layout capability — all panels are statically positioned. This design document describes the architectural decisions required to support drag-to-move, resize, grid-snap, persistence, widget lifecycle (add/remove), and undo, as derived from the five use cases in usecases.md.

**Constraints:**
- React 18+ function components with hooks
- No pre-existing layout framework in the codebase
- Must work on both mouse and touch devices
- No backend persistence required — `localStorage` is sufficient for v1
- Minimal external dependencies preferred; `dnd-kit` chosen over heavier alternatives

---

## Use Case Coverage

See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
This design addresses the following use case steps:

| Use Case Step | Description | Design Section |
|---------------|-------------|----------------|
| UC1-S1 | User presses and holds on a widget to initiate a drag | Decision 1 — Drag Library |
| UC1-S2 | System lifts the widget visually and displays a drag preview following the pointer | Decision 2 — Drag Overlay |
| UC1-S3 | System highlights valid drop zones on the grid as the user moves the pointer | Decision 3 — Drop Zone Highlighting |
| UC1-S4 | User moves the pointer to the desired grid location and releases | Decision 1 — Drag Library |
| UC1-S5 | System snaps the widget to the nearest valid grid cell at the drop position | Decision 4 — Grid Snap Algorithm |
| UC1-S6 | System reflows any displaced widgets to avoid overlap | Decision 5 — Collision & Reflow |
| UC1-S7 | System saves the updated layout to persistent state | Decision 6 — Layout State & Persistence |
| UC1-E4a | User releases the pointer outside the grid bounds — drag cancelled, widget returns to origin | Decision 1 — Drag Library (cancel on out-of-bounds) |
| UC1-E4b | Target cell is occupied — widget snaps to nearest available adjacent cell | Decision 4 — Grid Snap Algorithm |
| UC1-E6a | No valid cell available near drop point — drop cancelled, widget returns to origin | Decision 5 — Collision & Reflow |
| UC1-E6a2 | System highlights the conflict to indicate why the drop failed | Decision 3 — Drop Zone Highlighting |
| UC2-S1 | User hovers over a widget; system reveals resize handles on edges/corners | Decision 7 — Resize Handles |
| UC2-S2 | User clicks and drags a resize handle | Decision 7 — Resize Handles |
| UC2-S3 | System shows a live preview of the new widget size snapped to grid units | Decision 7 — Resize Handles |
| UC2-S4 | User releases the handle at the desired size | Decision 7 — Resize Handles |
| UC2-S5 | System applies the new grid-unit dimensions to the widget | Decision 4 — Grid Snap Algorithm |
| UC2-S6 | System reflows neighbouring widgets if the enlarged widget overlaps them | Decision 5 — Collision & Reflow |
| UC2-S7 | System saves the updated layout | Decision 6 — Layout State & Persistence |
| UC2-E3a | User drags below minimum size (1×1) — system clamps and shows indicator | Decision 7 — Resize Handles |
| UC2-E3b | User drags beyond grid boundary — system clamps at grid edge | Decision 4 — Grid Snap Algorithm |
| UC2-E6a | No room for reflow — system reverts to pre-resize dimensions and shows feedback | Decision 5 — Collision & Reflow |
| UC3-S1 | User navigates to or reloads the dashboard | Decision 6 — Layout State & Persistence |
| UC3-S2 | System reads the serialised layout from localStorage | Decision 6 — Layout State & Persistence |
| UC3-S3 | System validates that all widget IDs in the stored layout still exist | Decision 6 — Layout State & Persistence |
| UC3-S4 | System renders each widget at its stored position and size | Decision 8 — Component Architecture |
| UC3-S5 | Dashboard appears identical to how the user last left it | Decision 6 — Layout State & Persistence |
| UC3-E2a | No stored layout found — system renders the default layout | Decision 6 — Layout State & Persistence |
| UC3-E3a | Stored layout has stale widget IDs — system renders only existing widgets | Decision 6 — Layout State & Persistence |
| UC3-E3b | Stored layout data is corrupt — system falls back to default layout | Decision 6 — Layout State & Persistence |
| UC4-S1 | User opens the widget picker | Decision 9 — Widget Picker |
| UC4-S2 | System displays available widget types with size previews | Decision 9 — Widget Picker |
| UC4-S3 | User selects a widget type and initiates placement | Decision 9 — Widget Picker |
| UC4-S4 | System finds the first available grid region that fits the widget's default size | Decision 5 — Collision & Reflow |
| UC4-S5 | System places the widget at that position and renders it | Decision 8 — Component Architecture |
| UC4-S6 | System saves the updated layout | Decision 6 — Layout State & Persistence |
| UC4-E4a | No available region fits the widget — system informs user and suggests freeing space | Decision 5 — Collision & Reflow |
| UC5-S1 | User activates the remove action on a widget | Decision 10 — Widget Toolbar & Undo |
| UC5-S2 | System removes the widget from the grid | Decision 8 — Component Architecture |
| UC5-S3 | System frees the grid cells previously occupied by the widget | Decision 5 — Collision & Reflow |
| UC5-S4 | System saves the updated layout | Decision 6 — Layout State & Persistence |
| UC5-E1a | User activates undo within timeout — system restores the widget at its previous position | Decision 10 — Widget Toolbar & Undo |

### Unaddressed Use Case Steps
None — all 44 use case steps are addressed by one or more decisions above.

---

## Goals / Non-Goals

**Goals:**
- Pointer and touch drag-to-move for widgets on a fixed-column CSS grid
- Resize via draggable edge/corner handles with live grid-unit snapping
- Collision detection and automatic reflow of displaced neighbours
- Persist layout to `localStorage`; restore on mount with graceful degradation
- Add widgets via a picker panel; remove with a per-widget toolbar + undo toast
- Works in modern desktop and mobile browsers (Chrome, Firefox, Safari, Edge)

**Non-Goals:**
- Server-side layout persistence (deferred to a future change)
- Multi-user collaborative layout editing
- Animated reflow transitions beyond CSS `transition` on `grid-column` / `grid-row`
- Widget content implementation (sample stubs only in this change)
- Accessibility (keyboard navigation for drag) — tracked as a follow-up

---

## Decisions

### Decision 1: Drag Library — `dnd-kit`
**Addresses**: UC1-S1 - User presses and holds on a widget to initiate a drag; UC1-S4 - User releases; UC1-E4a - Out-of-bounds cancel
**Rationale**: `dnd-kit` is a modern, modular drag-and-drop toolkit for React. It supports pointer and touch sensors, provides first-class collision detection hooks, and has no DOM mutation side-effects (unlike `react-beautiful-dnd`). The `@dnd-kit/core` package alone is sufficient for our free-placement use case — we do not need the sortable preset.

Drag lifecycle:
- `DndContext` wraps the entire dashboard; provides `onDragStart`, `onDragMove`, `onDragEnd`, `onDragCancel` callbacks
- Each widget is wrapped in a `useDraggable` hook; drag handle activates on `pointerdown` with a 5px movement threshold to prevent accidental drags
- On `onDragCancel` or release outside a `useDroppable` zone → widget returns to original layout position (no state mutation)

**Alternative Considered**: `react-dnd` — rejected because it requires a backend abstraction layer that adds unnecessary complexity for our use case.

---

### Decision 2: Drag Overlay for Visual Lift
**Addresses**: UC1-S2 - System lifts the widget visually and displays a drag preview following the pointer
**Rationale**: `dnd-kit`'s `<DragOverlay>` renders a portal-based clone of the dragged widget that follows the pointer at full fidelity. The original widget slot becomes a semi-transparent ghost, preserving its position on the grid so the user can see where it came from. CSS `transform` drives the overlay position — no layout reflow during drag, keeping performance smooth at 60fps.

**Alternative Considered**: CSS `opacity` + absolute positioning of the original element — rejected because it causes layout shifts and z-index conflicts with other widgets.

---

### Decision 3: Drop Zone Highlighting
**Addresses**: UC1-S3 - System highlights valid drop zones as the user moves the pointer; UC1-E6a2 - System highlights the conflict
**Rationale**: During a drag, the `DashboardGrid` subscribes to the active drag's current over-cell (computed in `onDragMove` via pixel-to-grid coordinate conversion). Each grid cell renders a `DropCell` component that reads this state and applies a highlight class:
- **Green tint** — cell is empty and within bounds (valid)
- **Red tint** — cell is occupied or would cause the widget to exceed grid bounds (invalid)
- **No tint** — drag is not in progress

This gives immediate visual feedback without requiring a formal droppable on every cell.

---

### Decision 4: Grid Snap Algorithm
**Addresses**: UC1-S5 - Snap to nearest valid grid cell; UC1-E4b - Snap to nearest available adjacent cell; UC2-S5 - Apply new grid-unit dimensions; UC2-E3b - Clamp at grid edge
**Rationale**: Grid coordinates are integer `(col, row)` pairs. The snap function converts a pixel offset (from `dnd-kit`'s `delta`) to grid units using:

```
snapCol = clamp(round(pixelX / cellWidth),  0, totalCols - widget.w)
snapRow = clamp(round(pixelY / cellHeight), 0, totalRows - widget.h)
```

- `clamp` ensures the widget never exceeds grid bounds (addresses UC2-E3b)
- After snapping, collision detection checks the candidate position; if occupied, a BFS sweep finds the nearest unoccupied region (addresses UC1-E4b)
- Resize snapping uses the same `round()` logic applied to the drag delta on the resize handle axis

Grid configuration (columns, rows, cell size in px) is passed as props to `DashboardGrid` and defaults to a 12-column × 8-row grid with 80px cells.

---

### Decision 5: Collision Detection & Reflow Strategy
**Addresses**: UC1-S6 - Reflow displaced widgets; UC1-E6a - Cancel when no valid cell; UC2-S6 - Reflow neighbours; UC2-E6a - Revert on no-room; UC4-S4 - Find first available region; UC4-E4a - Inform user when no space; UC5-S3 - Free grid cells
**Rationale**: Collision detection uses a 2D boolean occupancy grid (`boolean[][]`) built from the current layout state on every candidate position evaluation.

Reflow strategy:
1. Remove the dragged/resized widget from the occupancy grid
2. Place it at the candidate position
3. For each widget that now overlaps, attempt to push it down by one row (gravity-down reflow, similar to `react-grid-layout`)
4. If a displaced widget cannot be placed within the grid bounds, the entire operation is rejected and the layout reverts to its pre-operation snapshot

Auto-placement for UC4 uses a top-left first-fit scan: iterate rows then columns, find the first cell where the widget's bounding box fits without conflict.

Removal (UC5) simply deletes the widget entry from state — no reflow needed as freed cells become available immediately.

---

### Decision 6: Layout State & Persistence
**Addresses**: UC1-S7, UC2-S7, UC3-S1–S5, UC3-E2a–E3b, UC4-S6, UC5-S4 - All layout save/restore steps
**Rationale**: Layout state is a `Record<widgetId, WidgetLayout>` where `WidgetLayout = { col, row, w, h }`. It lives in a `useDashboardLayout` custom hook that:

1. **Initialises** by reading `localStorage.getItem('dashboard-layout')` and JSON-parsing it
2. **Validates** parsed data against the registered widget registry — stale IDs are silently dropped (UC3-E3a); parse errors fall back to `defaultLayout` and log a console warning (UC3-E3b); missing key falls back to `defaultLayout` (UC3-E2a)
3. **Persists** by calling `localStorage.setItem` inside a `useEffect` that fires whenever layout state changes — debounced by 300ms to avoid thrashing on rapid drag moves

Layout mutations (move, resize, add, remove) are pure functions that return new layout objects, making state transitions predictable and easy to test.

---

### Decision 7: Resize Handles
**Addresses**: UC2-S1–S4 - Reveal handles, drag, preview, release; UC2-E3a - Clamp to minimum; UC2-E3b - Clamp at boundary
**Rationale**: Resize handles are implemented as small `<div>` elements anchored to the SE corner (and optionally E and S edges) of each widget using absolute positioning within the widget's CSS grid cell. They use a separate `useResizeDrag` custom hook (not `dnd-kit`) that:

- Listens for `pointerdown` on the handle element
- Tracks `pointermove` to compute a delta in pixels, converts to grid units via the snap algorithm
- Shows a live CSS-Grid-based size preview by temporarily updating a `previewLayout` state (separate from committed layout)
- On `pointerup`, commits the new size to layout state if valid; reverts `previewLayout` on cancel or constraint violation

Minimum size: 1×1 grid unit (clamped — shows a visual pulse on the handle to indicate the floor was hit).

**Alternative Considered**: Using `dnd-kit` for resize too — rejected because resize is axis-constrained and benefit from custom pixel-level control not easily achieved with dnd-kit's free-move semantics.

---

### Decision 8: Component Architecture
**Addresses**: UC3-S4 - Render each widget at stored position; UC4-S5 - Place and render new widget; UC5-S2 - Remove widget from grid
**Rationale**: Component tree:

```
<DashboardGrid>           — CSS Grid container, DndContext, layout state owner
  <WidgetSlot>            — positioned via grid-column / grid-row CSS props
    <Widget>              — draggable wrapper, resize handle host
      <WidgetToolbar>     — add/remove actions, drag handle affordance
      {children}          — widget content (text, chart stub, metric card)
    </Widget>
  </WidgetSlot>
  <DragOverlay>           — portal-rendered drag clone
  <DropCellGrid>          — highlight overlay (rendered during active drag only)
</DashboardGrid>
```

`DashboardGrid` owns the `useDashboardLayout` hook and passes layout positions down as props. Widget content is registered via a `WIDGET_REGISTRY` map (`widgetType → { defaultSize, component }`) so new widget types can be added without modifying grid logic.

---

### Decision 9: Widget Picker
**Addresses**: UC4-S1–S3 - Open picker, display types with size previews, select and place
**Rationale**: A slide-in panel (`<WidgetPicker>`) is toggled by an "Add Widget" button in the dashboard toolbar. It renders one card per registered widget type showing its name and default grid size (e.g., "2 × 2"). Clicking a card calls `addWidget(type)` on the layout hook, which triggers the auto-placement algorithm (Decision 5). The panel closes on successful addition or on Escape/outside click.

**Alternative Considered**: Drag-from-palette (drag a widget from the picker into the grid) — deferred as a UX enhancement; adds significant complexity for v1.

---

### Decision 10: Widget Toolbar & Undo
**Addresses**: UC5-S1 - Activate remove action; UC5-E1a - Undo within timeout
**Rationale**: Each widget renders a `<WidgetToolbar>` that appears on hover (CSS `:hover` + `opacity` transition). The toolbar contains a drag-handle icon and a ✕ remove button.

Undo strategy:
- On remove, the previous layout snapshot is saved to a `useRef` (`lastRemovedRef`)
- A toast notification renders with an "Undo" button and a 5-second countdown
- If the user activates undo within 5 seconds, the snapshot is restored to layout state
- After 5 seconds (or on any other layout mutation), the snapshot is discarded
- Only the most recent removal is undoable (no undo stack in v1)

**Alternative Considered**: A full undo/redo history stack — deferred to a future change to keep v1 scope manageable.

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Reflow algorithm causes unexpected widget movement | Show a visual diff of affected widgets before committing; add comprehensive unit tests for the occupancy grid logic |
| `localStorage` quota exceeded for very large layouts | Cap widget count at 20 per dashboard; handle `QuotaExceededError` gracefully by skipping persistence and warning the user |
| Touch drag conflicts with native scroll on mobile | Configure `dnd-kit` pointer sensor with a distance threshold (8px) to distinguish scroll intent from drag intent |
| Resize handles too small on touch screens | Increase handle hit area to 24×24px on touch devices via media query |
| Stale `defaultLayout` after widget registry changes | Version the stored layout with a schema version key; bump on registry changes to force a fresh default |

---

## Migration Plan

This is a net-new feature with no breaking changes to existing code.

1. Install dependencies: `npm install @dnd-kit/core @dnd-kit/utilities`
2. Add `DashboardGrid` and related components under `src/components/dashboard/`
3. Add `useDashboardLayout` hook under `src/hooks/`
4. Register sample widgets in `src/widgets/registry.ts`
5. Render `<DashboardGrid>` in the target route/page component
6. No database migrations, API changes, or feature flags required

**Rollback**: Remove the `<DashboardGrid>` render call and delete the components — the rest of the application is unaffected.

---

## Open Questions

1. **Column count**: Default is 12 columns — should this be configurable per-user or fixed? Current design passes it as a prop; a future change could expose a settings UI.
2. **Row overflow**: Should the grid grow vertically as more widgets are added, or enforce a fixed row count? Current design defaults to 8 rows with a fixed boundary; vertical scroll is an alternative.
3. **Widget content API**: How will real data-backed widgets inject their data? The registry stub pattern leaves this open — a context/prop injection pattern should be defined before the first real widget is built.
4. **Multi-dashboard support**: The `localStorage` key is currently a single string (`'dashboard-layout'`). If multiple dashboard pages are needed, the key should include a dashboard ID.
