## Implementation Overview

This task list implements the widget-drag-drop change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability

| UC Step | Description |
|---------|-------------|
| UC1-S1 | User initiates a drag gesture on a widget |
| UC1-S2 | System lifts the widget visually and displays a drag preview following the pointer |
| UC1-S3 | User moves the pointer across the grid |
| UC1-S4 | System highlights the nearest valid grid cell(s) as a drop target as the pointer moves |
| UC1-S5 | User releases the pointer over the desired grid position |
| UC1-S6 | System snaps the widget to the nearest valid grid cell |
| UC1-S7 | System updates and persists the widget's grid position in the dashboard state |
| UC1-E4a | Pointer moves over an occupied cell — system indicates cell is unavailable |
| UC1-E5a | User releases pointer outside grid bounds — system cancels drag and restores original position |
| UC1-E5b | User releases pointer over occupied cell — system cancels drop and restores original position |
| UC2-S1 | User's pointer enters an empty grid area during a drag |
| UC2-S2 | System computes the grid cell(s) the widget would occupy at the pointer position |
| UC2-S3 | System highlights the target cell(s) to show the snap preview |
| UC2-S4 | User releases the pointer |
| UC2-S5 | System places the widget snapped to the computed cell(s) |
| UC2-S6 | System removes the drag preview and shows the widget in its final position |
| UC2-E2a | Widget would extend beyond grid boundary — system clamps position to keep widget within bounds |

## 1. Project Setup & Dependencies

- [x] 1.1 Install `@dnd-kit/core` and `@dnd-kit/utilities` packages (Addresses: UC1-S1)
- [x] 1.2 Define `WidgetLayout` TypeScript type: `{ id: string; col: number; row: number; colSpan: number; rowSpan: number }` (Addresses: UC1-S7)
- [x] 1.3 Define `DashboardGridProps`: `widgets`, `cols`, `cellWidth`, `cellHeight`, `gap`, `onLayoutChange` (Addresses: UC1-S7)

## 2. Grid Coordinate & Snapping Utilities

- [x] 2.1 Implement `pointerToCell(x, y, cellWidth, cellHeight, gap)` — converts pointer coordinates to `(col, row)` (Addresses: UC2-S2, UC1-S6)
- [x] 2.2 Implement `clampPosition(col, row, colSpan, rowSpan, totalCols, totalRows)` — clamps position to grid bounds (Addresses: UC2-E2a)
- [x] 2.3 Implement `hasCollision(layout, id, col, row, colSpan, rowSpan)` — checks if target cells are occupied by another widget (Addresses: UC1-E4a, UC1-E5b)
- [x] 2.4 Write unit tests for `pointerToCell`, `clampPosition`, and `hasCollision` (Addresses: UC2-S2, UC2-E2a, UC1-E4a)

## 3. DashboardGrid Component

- [x] 3.1 Create `DashboardGrid` component wrapping `@dnd-kit`'s `DndContext` (Addresses: UC1-S1, UC1-S3)
- [x] 3.2 Render grid container with CSS grid layout using `cols`, `cellWidth`, `cellHeight`, `gap` props (Addresses: UC2-S1)
- [x] 3.3 Track active drag item and computed drop target in component state (Addresses: UC1-S3, UC2-S2)
- [x] 3.4 Implement `onDragStart` handler — record dragged widget ID and capture grab offset (Addresses: UC1-S1)
- [x] 3.5 Implement `onDragOver` handler — compute target cell via `pointerToCell` + `clampPosition`, update drop target state (Addresses: UC1-S4, UC2-S2, UC2-S3)
- [x] 3.6 Implement `onDragEnd` handler — validate drop target via `hasCollision`, commit or cancel, call `onLayoutChange` (Addresses: UC1-S5, UC1-S6, UC1-S7, UC1-E5a, UC1-E5b, UC2-S4, UC2-S5)
- [x] 3.7 Render `DragOverlay` with a clone of the active widget during drag (Addresses: UC1-S2)
- [x] 3.8 Unmount `DragOverlay` and restore widget render at final position after drag ends (Addresses: UC2-S6)

## 4. GridWidget Component

- [x] 4.1 Create `GridWidget` component wrapping `@dnd-kit`'s `useDraggable` hook (Addresses: UC1-S1)
- [x] 4.2 Apply CSS grid `gridColumn` and `gridRow` placement from `col`, `row`, `colSpan`, `rowSpan` props (Addresses: UC2-S5)
- [x] 4.3 Apply dimmed style to original slot while drag is active (Addresses: UC1-S2)

## 5. Drop Target Cell Highlighting

- [x] 5.1 Register each grid cell as a `useDroppable` zone with `id` encoding `(col, row)` (Addresses: UC1-S4, UC2-S3)
- [x] 5.2 Apply highlight style to target cell(s) when drop target matches and cells are empty (Addresses: UC1-S4, UC2-S3)
- [x] 5.3 Apply blocked/unavailable style to cell(s) when target is occupied (Addresses: UC1-E4a)
- [x] 5.4 Clear all highlights when drag ends or pointer leaves the grid (Addresses: UC1-S5, UC2-S4)

## 6. Boundary & Cancellation Handling

- [x] 6.1 Detect out-of-bounds drop (pointer released outside grid) and cancel drag (Addresses: UC1-E5a)
- [x] 6.2 Ensure widget position is unchanged in state after a cancelled drag (Addresses: UC1-E5a, UC1-E5b)
- [x] 6.3 Verify boundary clamping during `onDragOver` prevents widget from previewing out-of-bounds position (Addresses: UC2-E2a)

## 7. Integration & Testing

- [x] 7.1 Write integration test: drag widget from cell (0,0) to empty cell (2,1) — verify `onLayoutChange` called with updated position (Addresses: UC1-S5, UC1-S6, UC1-S7, UC2-S5)
- [x] 7.2 Write integration test: drag widget over occupied cell — verify drop is cancelled and original position preserved (Addresses: UC1-E5b)
- [x] 7.3 Write integration test: drag widget outside grid bounds — verify drag cancels and position is unchanged (Addresses: UC1-E5a)
- [x] 7.4 Write integration test: drag widget to grid edge — verify boundary clamping keeps widget fully within bounds (Addresses: UC2-E2a)
- [x] 7.5 Visual smoke test: drag preview appears on drag start and disappears after drop or cancel (Addresses: UC1-S2, UC2-S6)
