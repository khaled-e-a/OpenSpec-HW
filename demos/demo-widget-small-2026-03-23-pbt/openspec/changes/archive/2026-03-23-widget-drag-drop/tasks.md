## Implementation Overview
This task list implements the widget-drag-drop change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability
This implementation addresses the following use case steps:

| UC Step | Description |
|---------|-------------|
| UC1-S1 | User presses and holds on a widget to initiate a drag |
| UC1-S2 | System lifts the widget visually and displays a drag preview following the pointer |
| UC1-S3 | System highlights valid drop zones on the grid as the user moves the pointer |
| UC1-S4 | User moves the pointer to the desired grid location and releases |
| UC1-S5 | System snaps the widget to the nearest valid grid cell at the drop position |
| UC1-S6 | System reflows any displaced widgets to avoid overlap |
| UC1-S7 | System saves the updated layout to persistent state |
| UC1-E4a | User releases the pointer outside the grid bounds — drag cancelled, widget returns to origin |
| UC1-E4b | Target cell is occupied — widget snaps to nearest available adjacent cell |
| UC1-E6a | No valid cell available near drop point — drop cancelled, widget returns to origin |
| UC1-E6a2 | System highlights the conflict to indicate why the drop failed |
| UC2-S1 | User hovers over a widget; system reveals resize handles on edges/corners |
| UC2-S2 | User clicks and drags a resize handle |
| UC2-S3 | System shows a live preview of the new widget size snapped to grid units |
| UC2-S4 | User releases the handle at the desired size |
| UC2-S5 | System applies the new grid-unit dimensions to the widget |
| UC2-S6 | System reflows neighbouring widgets if the enlarged widget overlaps them |
| UC2-S7 | System saves the updated layout |
| UC2-E3a | User drags below minimum size (1×1) — system clamps and shows indicator |
| UC2-E3b | User drags beyond grid boundary — system clamps at grid edge |
| UC2-E6a | No room for reflow — system reverts to pre-resize dimensions and shows feedback |
| UC3-S1 | User navigates to or reloads the dashboard |
| UC3-S2 | System reads the serialised layout from localStorage |
| UC3-S3 | System validates that all widget IDs in the stored layout still exist |
| UC3-S4 | System renders each widget at its stored position and size |
| UC3-S5 | Dashboard appears identical to how the user last left it |
| UC3-E2a | No stored layout found — system renders the default layout |
| UC3-E3a | Stored layout has stale widget IDs — system renders only existing widgets |
| UC3-E3b | Stored layout data is corrupt — system falls back to default layout |
| UC4-S1 | User opens the widget picker |
| UC4-S2 | System displays available widget types with size previews |
| UC4-S3 | User selects a widget type and initiates placement |
| UC4-S4 | System finds the first available grid region that fits the widget's default size |
| UC4-S5 | System places the widget at that position and renders it |
| UC4-S6 | System saves the updated layout |
| UC4-E4a | No available region fits the widget — system informs user and suggests freeing space |
| UC5-S1 | User activates the remove action on a widget |
| UC5-S2 | System removes the widget from the grid |
| UC5-S3 | System frees the grid cells previously occupied by the widget |
| UC5-S4 | System saves the updated layout |
| UC5-E1a | User activates undo within timeout — system restores the widget at its previous position |

---

## 1. Project Setup & Dependencies

- [x] 1.1 Install `@dnd-kit/core` and `@dnd-kit/utilities` packages (Addresses: UC1-S1)
- [x] 1.2 Create directory structure: `src/components/dashboard/`, `src/hooks/`, `src/widgets/` (Addresses: UC3-S4)
- [x] 1.3 Define `WidgetLayout` TypeScript type `{ id, col, row, w, h }` and `LayoutMap` (`Record<string, WidgetLayout>`) (Addresses: UC1-S5, UC2-S5)
- [x] 1.4 Define `WidgetDefinition` type and create `WIDGET_REGISTRY` map in `src/widgets/registry.ts` with three sample entries: `text-card` (2×1), `metric-card` (1×1), `chart-placeholder` (4×2) (Addresses: UC4-S2, UC4-S3)
- [x] 1.5 Define a `DEFAULT_LAYOUT` constant using the three sample widgets (Addresses: UC3-E2a)

---

## 2. Grid Utilities

- [x] 2.1 Implement `pixelToCell(pixelX, pixelY, cellW, cellH): {col, row}` conversion helper (Addresses: UC1-S5)
- [x] 2.2 Implement `snapAndClamp(col, row, widgetW, widgetH, gridCols, gridRows): {col, row}` that rounds and clamps within grid bounds (Addresses: UC1-S5, UC2-E3b)
- [x] 2.3 Implement `buildOccupancyGrid(layout: LayoutMap, gridCols, gridRows): boolean[][]` that produces a 2D grid of occupied cells (Addresses: UC1-S6, UC2-S6)
- [x] 2.4 Implement `hasConflict(occupancy, col, row, w, h): boolean` to check if a placement overlaps any occupied cell (Addresses: UC1-E4b, UC1-E6a)
- [x] 2.5 Implement `findNearestFreeCell(occupancy, col, row, w, h, gridCols, gridRows): {col, row} | null` using BFS from the target cell (Addresses: UC1-E4b)
- [x] 2.6 Implement `autoPlace(occupancy, w, h, gridCols, gridRows): {col, row} | null` first-fit top-left scan for widget addition (Addresses: UC4-S4, UC4-E4a)
- [x] 2.7 Implement `gravityReflow(layout, movedId, gridCols, gridRows): LayoutMap | null` that pushes displaced widgets downward, returning `null` if reflow is impossible (Addresses: UC1-S6, UC2-S6, UC2-E6a)
- [x] 2.8 Write unit tests for all grid utility functions covering normal, boundary, and conflict cases (Addresses: UC1-S5, UC1-S6, UC1-E4a, UC1-E4b, UC1-E6a, UC2-E3b, UC2-E6a)

---

## 3. Layout State & Persistence Hook

- [x] 3.1 Create `useDashboardLayout` hook with state initialiser that reads `localStorage.getItem('dashboard-layout')` on mount (Addresses: UC3-S1, UC3-S2)
- [x] 3.2 Implement JSON parse with try/catch fallback to `DEFAULT_LAYOUT` and `console.warn` on parse failure (Addresses: UC3-E3b)
- [x] 3.3 Implement widget ID validation against `WIDGET_REGISTRY` — drop stale IDs silently (Addresses: UC3-S3, UC3-E3a)
- [x] 3.4 Implement empty/null localStorage fallback to `DEFAULT_LAYOUT` (Addresses: UC3-E2a)
- [x] 3.5 Implement debounced `localStorage.setItem` (300ms) in a `useEffect` that fires on every layout state change (Addresses: UC1-S7, UC2-S7, UC3-S5, UC4-S6, UC5-S4)
- [x] 3.6 Expose `moveWidget(id, col, row)`, `resizeWidget(id, w, h)`, `addWidget(type)`, `removeWidget(id)` mutation functions from the hook (Addresses: UC1-S5, UC2-S5, UC4-S5, UC5-S2)
- [x] 3.7 Write unit tests for hook initialisation, persistence, fallback paths, and all mutation functions (Addresses: UC3-S2, UC3-E2a, UC3-E3a, UC3-E3b)

---

## 4. DashboardGrid Component

- [x] 4.1 Create `DashboardGrid` component that renders a CSS Grid container with configurable `columns`, `rows`, and `cellSize` props (Addresses: UC3-S4, UC4-S5)
- [x] 4.2 Integrate `<DndContext>` from `@dnd-kit/core` wrapping the grid, wiring `onDragStart`, `onDragMove`, `onDragEnd`, `onDragCancel` handlers (Addresses: UC1-S1, UC1-S4)
- [x] 4.3 Implement `onDragStart` handler: record the dragged widget ID and its original position to `dragOriginRef` (Addresses: UC1-S1)
- [x] 4.4 Implement `onDragMove` handler: compute the hovered cell from pointer delta + origin and store in `hoverCellState` for drop-zone highlighting (Addresses: UC1-S3)
- [x] 4.5 Implement `onDragEnd` handler: call `snapAndClamp` → `findNearestFreeCell` → `gravityReflow`; commit via `moveWidget` if reflow succeeds, otherwise restore origin (Addresses: UC1-S5, UC1-S6, UC1-E4b, UC1-E6a)
- [x] 4.6 Implement `onDragCancel` handler: restore widget to `dragOriginRef` position without any layout change (Addresses: UC1-E4a)
- [x] 4.7 Render `<DropCellGrid>` overlay (see task 5) only when a drag is active, passing `hoverCellState` and dragged widget dimensions (Addresses: UC1-S3, UC1-E6a2)
- [x] 4.8 Render `<DragOverlay>` portal from `@dnd-kit/core` displaying a clone of the currently dragged widget (Addresses: UC1-S2)
- [x] 4.9 Render each widget in a `<WidgetSlot>` positioned with `grid-column` and `grid-row` CSS properties from layout state (Addresses: UC3-S4, UC3-S5)

---

## 5. Drop Zone Highlight Overlay

- [x] 5.1 Create `DropCellGrid` component that renders one `<DropCell>` per grid cell during active drag (Addresses: UC1-S3)
- [x] 5.2 Implement per-cell validity check: green tint if the dragged widget placed at that cell would have no conflict, red tint if it would conflict or exceed bounds (Addresses: UC1-S3, UC1-E6a2)
- [x] 5.3 Implement brief red-flash animation on the conflicting cells when a drop is cancelled due to `onDragEnd` finding no valid placement (Addresses: UC1-E6a2)
- [x] 5.4 Ensure `DropCellGrid` is not rendered when no drag is active (zero performance cost at rest) (Addresses: UC1-S3)

---

## 6. Widget & WidgetSlot Components

- [x] 6.1 Create `WidgetSlot` component that wraps a child with CSS grid positioning (`grid-column: col / span w`, `grid-row: row / span h`) (Addresses: UC3-S4)
- [x] 6.2 Create `Widget` component that applies `useDraggable` from `@dnd-kit/core` and renders `<WidgetToolbar>` + registry-resolved content (Addresses: UC1-S1, UC1-S2)
- [x] 6.3 Apply semi-transparent ghost style (`opacity: 0.35`) to the original `Widget` slot while its drag overlay is active (Addresses: UC1-S2)
- [x] 6.4 Create `WidgetToolbar` component that appears on widget hover (CSS `:hover` + opacity transition) with a drag-handle icon and ✕ remove button (Addresses: UC5-S1)
- [x] 6.5 Wire ✕ button in `WidgetToolbar` to call `removeWidget(id)` from the layout hook (Addresses: UC5-S1, UC5-S2, UC5-S3)

---

## 7. Resize Handles

- [x] 7.1 Create `ResizeHandle` component positioned absolutely at the SE corner (and E / S edges) of each `Widget` using absolute CSS positioning (Addresses: UC2-S1)
- [x] 7.2 Show `ResizeHandle` elements only when the parent `Widget` is hovered; on touch devices show persistently (Addresses: UC2-S1)
- [x] 7.3 Implement `useResizeDrag` hook: on `pointerdown` attach `pointermove` and `pointerup` listeners to `window`; compute pixel delta and convert to grid-unit delta via `snapAndClamp` (Addresses: UC2-S2, UC2-S4)
- [x] 7.4 During resize drag, write computed preview dimensions to `previewLayout` state (separate from committed layout) and render the widget at preview dimensions (Addresses: UC2-S3)
- [x] 7.5 Clamp preview width/height to minimum 1×1 during drag; apply a brief pulse CSS animation on the handle when the floor is hit (Addresses: UC2-E3a)
- [x] 7.6 Clamp preview dimensions at the grid boundary during drag (Addresses: UC2-E3b)
- [x] 7.7 On `pointerup`: call `gravityReflow` with new dimensions; if successful call `resizeWidget`; if not, revert `previewLayout` and show inline "Not enough space" feedback for 2s (Addresses: UC2-S5, UC2-S6, UC2-E6a)
- [x] 7.8 Clear `previewLayout` on drag cancel or on component unmount (Addresses: UC2-S4)

---

## 8. Widget Picker

- [x] 8.1 Create `WidgetPicker` slide-in panel component toggled by an "Add Widget" button in the dashboard toolbar (Addresses: UC4-S1)
- [x] 8.2 Render one card per `WIDGET_REGISTRY` entry showing widget name and default grid size (e.g., "2 × 1 cells") (Addresses: UC4-S2)
- [x] 8.3 On card click, call `addWidget(type)` which runs `autoPlace` — if a cell is found, add the widget and close the picker (Addresses: UC4-S3, UC4-S4, UC4-S5)
- [x] 8.4 If `autoPlace` returns `null`, display "Not enough space — try removing or resizing a widget" message inside the picker instead of adding (Addresses: UC4-E4a)
- [x] 8.5 Close the picker on Escape key or outside-click (Addresses: UC4-S1)

---

## 9. Removal Undo

- [x] 9.1 In `useDashboardLayout`, store the most recent removed widget's layout entry in a `lastRemovedRef` on every `removeWidget` call (Addresses: UC5-E1a)
- [x] 9.2 Create `UndoToast` component that renders a "Widget removed — Undo" notification with a 5-second countdown progress bar (Addresses: UC5-E1a)
- [x] 9.3 Wire the "Undo" action in `UndoToast` to restore `lastRemovedRef` into layout state and dismiss the toast (Addresses: UC5-E1a)
- [x] 9.4 Auto-dismiss `UndoToast` and clear `lastRemovedRef` after 5 seconds (Addresses: UC5-E1a)
- [x] 9.5 Clear `lastRemovedRef` on any subsequent layout mutation (move, resize, add, remove) to ensure only the most recent removal is undoable (Addresses: UC5-E1a)

---

## 10. Sample Widgets & Integration

- [x] 10.1 Implement `TextCardWidget` component (renders a static text block, default size 2×1) (Addresses: UC4-S2, UC4-S5)
- [x] 10.2 Implement `MetricCardWidget` component (renders a label + numeric value, default size 1×1) (Addresses: UC4-S2, UC4-S5)
- [x] 10.3 Implement `ChartPlaceholderWidget` component (renders a grey placeholder area, default size 4×2) (Addresses: UC4-S2, UC4-S5)
- [x] 10.4 Register all three widgets in `WIDGET_REGISTRY` with their `defaultSize` and component reference (Addresses: UC4-S2)
- [x] 10.5 Define `DEFAULT_LAYOUT` placing one of each sample widget at non-overlapping positions (Addresses: UC3-E2a)
- [x] 10.6 Render `<DashboardGrid>` in the target page/route component and verify end-to-end flow: load → drag → resize → persist → reload (Addresses: UC3-S1, UC3-S4, UC3-S5)

---

## 11. Styling & Polish

- [x] 11.1 Add CSS for the grid container, cell sizing, drag overlay, and ghost widget opacity (Addresses: UC1-S2, UC1-S3)
- [x] 11.2 Add CSS transitions (`transition: grid-column 150ms, grid-row 150ms`) on `WidgetSlot` for smooth reflow animations (Addresses: UC1-S6, UC2-S6)
- [x] 11.3 Add media query to increase resize handle hit area to 24×24px on touch devices (Addresses: UC2-S1)
- [x] 11.4 Style the `WidgetPicker` slide-in panel with open/close transition (Addresses: UC4-S1)
- [x] 11.5 Style `UndoToast` with countdown progress bar and dismiss animation (Addresses: UC5-E1a)
