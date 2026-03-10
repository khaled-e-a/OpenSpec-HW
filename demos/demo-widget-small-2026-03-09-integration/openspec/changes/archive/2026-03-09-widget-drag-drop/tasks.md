## Implementation Overview

This task list implements the `widget-drag-drop` change.
See `usecases.md` "Use Case Traceability Mapping" for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability

| Step | Description |
|------|-------------|
| UC1-S1 | User presses down on a widget to start dragging |
| UC1-S2 | System lifts the widget visually (raises z-index, applies drag styling) and attaches it to the pointer |
| UC1-S3 | System displays a ghost/shadow overlay at the nearest valid snap-to-grid position as the user moves the pointer |
| UC1-S4 | User moves the pointer across the grid toward the desired target cell |
| UC1-S5 | System continuously updates the ghost to the nearest valid snap position, keeping the preview within grid bounds |
| UC1-S6 | User releases the pointer over the target position |
| UC1-S7 | System validates that the target position is unoccupied and within grid bounds |
| UC1-S8 | System commits the new position — updates layout state and re-renders the widget at the target cell |
| UC1-S9 | System removes the drag overlay and restores normal widget appearance |
| UC1-E1a | User drags by touch — system handles touch events equivalently |
| UC1-E3a | No valid snap position near pointer — system shows no ghost or a "cannot drop" indicator |
| UC1-E6a | User releases outside grid — system cancels, widget returns to original position |
| UC1-E7a | Target position is occupied — collision detected, drop rejected, widget returns |
| UC1-E7b | Target position is partially out of bounds — drop rejected, widget returns |
| UC1-Ea | User presses Escape — drag cancelled immediately, widget returns, layout unchanged |

---

## 1. Project Setup & Dependencies

- [x] 1.1 Install `@dnd-kit/core` and `@dnd-kit/utilities` as production dependencies (Addresses: UC1-S1)
- [x] 1.2 Create component directory `src/components/dashboard/` (Addresses: UC1-S1)
- [x] 1.3 Define `WidgetLayout` TypeScript type (`id`, `col`, `row`, `w`, `h`) in `src/components/dashboard/types.ts` (Addresses: UC1-S8)

---

## 2. DashboardGrid Container

- [x] 2.1 Create `DashboardGrid` component accepting `layout: WidgetLayout[]`, `cols`, `rows`, `rowHeight`, and `onLayoutChange` props (Addresses: UC1-S8)
- [x] 2.2 Set up `<DndContext>` with `PointerSensor` and `TouchSensor` inside `DashboardGrid` (Addresses: UC1-S1, UC1-E1a)
- [x] 2.3 Configure `TouchSensor` with activation constraints (delay + tolerance) to avoid conflict with scroll (Addresses: UC1-E1a)
- [x] 2.4 Render an absolutely-positioned grid canvas using CSS Grid with `cols` columns and fixed `rowHeight` rows (Addresses: UC1-S3)
- [x] 2.5 Attach a `ref` to the grid container and expose its bounding rect for coordinate calculations (Addresses: UC1-S3, UC1-S5)

---

## 3. DraggableWidget Wrapper

- [x] 3.1 Create `DraggableWidget` component wrapping any child widget; accepts `id`, `col`, `row`, `w`, `h` props (Addresses: UC1-S1)
- [x] 3.2 Use `useDraggable` from `@dnd-kit/core` to attach drag listeners and attributes to the widget DOM node (Addresses: UC1-S1, UC1-S2)
- [x] 3.3 Apply visual lift styles (reduced opacity, elevated `z-index`) to the widget slot while dragging (Addresses: UC1-S2)
- [x] 3.4 Position the widget slot on the grid using CSS `grid-column` / `grid-row` derived from `col`, `row`, `w`, `h` (Addresses: UC1-S8)

---

## 4. Drag Overlay

- [x] 4.1 Add `<DragOverlay>` portal inside `DashboardGrid`; render a clone of the active widget when a drag is in progress (Addresses: UC1-S2, UC1-S4)
- [x] 4.2 Style the overlay clone to match the widget's dimensions and apply a "dragging" visual treatment (shadow/opacity) (Addresses: UC1-S2)
- [x] 4.3 Unmount the overlay and restore the widget slot appearance on `onDragEnd` and `onDragCancel` (Addresses: UC1-S9)

---

## 5. Snap-to-Grid Coordinate Mapping

- [x] 5.1 Implement `pointerToCell(pointerX, pointerY, gridRect, cellWidth, cellHeight)` utility that converts pointer page coordinates to grid `{col, row}` (Addresses: UC1-S3, UC1-S5)
- [x] 5.2 Clamp computed cell to `[0, cols - widgetCols]` × `[0, rows - widgetRows]` to enforce grid bounds during preview (Addresses: UC1-S5)
- [x] 5.3 Subscribe to `onDragMove` in `DashboardGrid` and update `ghostPosition` state on every event (Addresses: UC1-S3, UC1-S4, UC1-S5)

---

## 6. Ghost Preview Component

- [x] 6.1 Create `GhostWidget` component that renders an absolutely-positioned placeholder at the current `ghostPosition` grid cell (Addresses: UC1-S3, UC1-S5)
- [x] 6.2 Pass `isValid` boolean prop to `GhostWidget`; render with "valid" (blue) styling when `true`, "invalid" (red/hidden) when `false` (Addresses: UC1-E3a)
- [x] 6.3 Hide `GhostWidget` when pointer is outside the grid boundary (Addresses: UC1-E3a)

---

## 7. Collision Detection & Bounds Validation

- [x] 7.1 Implement `getOccupiedCells(layout: WidgetLayout[], excludeId: string)` utility that returns a `Set` of occupied `"col,row"` strings (Addresses: UC1-S7)
- [x] 7.2 Implement `isValidDrop(candidate, layout, cols, rows, excludeId)` that checks both collision and bounds in O(w×h) time (Addresses: UC1-S7, UC1-E7a, UC1-E7b)
- [x] 7.3 Call `isValidDrop` on every `onDragMove` event and pass result to `GhostWidget` as `isValid` (Addresses: UC1-E3a)
- [x] 7.4 On `onDragEnd`, reject the drop (call `onDragCancel`) when `isValidDrop` returns false; animate widget back to origin via CSS transition (Addresses: UC1-E6a, UC1-E7a, UC1-E7b)

---

## 8. Layout State Commitment

- [x] 8.1 On `onDragEnd` with a valid drop, compute the new `WidgetLayout[]` by replacing the dragged widget's `col`/`row` with `ghostPosition` (Addresses: UC1-S8)
- [x] 8.2 Call `onLayoutChange(newLayout)` with the updated layout array (immutable update) (Addresses: UC1-S8)
- [x] 8.3 Clear `ghostPosition` and active-drag state after every `onDragEnd` and `onDragCancel` (Addresses: UC1-S9)

---

## 9. Keyboard Cancel (Escape)

- [x] 9.1 Confirm that `@dnd-kit/core`'s `KeyboardSensor` (or built-in behaviour) fires `onDragCancel` on Escape key press — add explicit handler if not automatic (Addresses: UC1-Ea)
- [x] 9.2 On `onDragCancel`, restore original widget position and clear all drag state without modifying layout (Addresses: UC1-Ea)

---

## 10. Integration & Wiring

- [x] 10.1 Replace existing static widget rendering in the dashboard page with `DashboardGrid` + `DraggableWidget` wrappers (Addresses: UC1-S1)
- [x] 10.2 Initialise `layout` state in the dashboard page from existing static positions converted to `WidgetLayout[]` (Addresses: UC1-S8)
- [x] 10.3 Wire `onLayoutChange` to update dashboard page state (and optionally persist to `localStorage`) (Addresses: UC1-S8)

---

## 11. Tests

- [x] 11.1 Unit test `pointerToCell` with boundary and mid-cell inputs (Addresses: UC1-S3, UC1-S5)
- [x] 11.2 Unit test `isValidDrop` for: valid move, collision, out-of-bounds left/right/top/bottom, and partial overlap (Addresses: UC1-S7, UC1-E7a, UC1-E7b)
- [x] 11.3 Integration test: render `DashboardGrid` with two widgets; simulate drag of one to valid position; assert `onLayoutChange` called with correct layout (Addresses: UC1-S8)
- [x] 11.4 Integration test: simulate drag to occupied cell; assert `onLayoutChange` NOT called and widget returns to origin (Addresses: UC1-E7a)
- [x] 11.5 Integration test: simulate Escape key during drag; assert layout unchanged (Addresses: UC1-Ea)
- [x] 11.6 Integration test: simulate touch drag from start to valid drop; assert same outcome as pointer drag (Addresses: UC1-E1a)
