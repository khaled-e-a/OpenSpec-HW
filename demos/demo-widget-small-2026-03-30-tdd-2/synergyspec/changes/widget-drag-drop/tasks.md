## Implementation Overview
This task list implements the widget-drag-drop change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability
This implementation addresses the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User clicks and holds on a widget to begin dragging it |
| UC1-S2 | System detaches widget visually and displays a drag preview following the pointer |
| UC1-S3 | User moves the pointer across the dashboard canvas |
| UC1-S4 | System highlights the grid cell(s) the widget would occupy at the current pointer position |
| UC1-S5 | User releases the pointer over a valid, unoccupied grid region |
| UC1-S6 | System snaps the widget to the nearest valid grid position |
| UC1-S7 | System updates the layout state to reflect the new widget position |
| UC1-E4a | Pointer moves outside canvas — no drop target highlighted |
| UC1-E4a1 | Widget returned to original position if released outside canvas |
| UC1-E5a | Target grid region is occupied — system shows invalid indicator |
| UC1-E5a2 | Widget returned to original position if dropped on occupied region |
| UC1-E5b | User presses Escape — drag cancelled, widget restored to original position |
| UC2-S1 | User picks up a new widget from the widget source area |
| UC2-S2 | System shows a drag preview of the new widget following the pointer |
| UC2-S3 | User moves the pointer over the dashboard canvas |
| UC2-S4 | System highlights the grid cell(s) the new widget would occupy |
| UC2-S5 | User releases the pointer over a valid, unoccupied grid region |
| UC2-S6 | System places the widget at the snapped grid position |
| UC2-S7 | System updates the layout state to include the new widget |
| UC2-E4a | No unoccupied region large enough — no valid highlight shown |
| UC2-E4a2 | Widget returned to source without placement |
| UC2-E5a | Target region partially occupied — system shows invalid indicator |
| UC2-E5b | User cancels drag — layout unchanged |
| UC3-S1 | User is dragging a widget across the dashboard canvas |
| UC3-S2 | System renders a semi-transparent drag preview at current pointer position |
| UC3-S3 | System computes and highlights the snap target grid cell(s) |
| UC3-S4 | Highlight color indicates validity: green/neutral = valid, red/blocked = invalid |
| UC3-S5 | User moves pointer; system continuously updates preview and highlight in real time |
| UC3-S6 | User releases pointer; widget is placed or returned per drop outcome |
| UC3-E3a | Widget is over its original position — neutral highlight shown |
| UC3-E5a | Drag preview lags — system degrades gracefully, preview remains visible |

---

## 1. Project Setup & Dependencies

- [x] 1.1 Install `react-dnd` and `react-dnd-html5-backend` as production dependencies (Addresses: UC1-S1, UC2-S1)
- [x]1.2 Wrap the app (or dashboard page) with `<DndProvider backend={HTML5Backend}>` at the appropriate root level (Addresses: UC1-S1, UC1-S3, UC2-S1, UC2-S3, UC3-S1)
- [x]1.3 Define shared TypeScript types: `WidgetLayout`, `DashboardGridProps`, `DraggableWidgetProps` (Addresses: UC1-S7, UC2-S7)

---

## 2. Grid Coordinate Model & Utilities

- [x]2.1 Implement `pixelToCell(pointerX, pointerY, cellSize)` — converts pointer pixel position to integer grid `(x, y)` coordinates (Addresses: UC1-S6, UC2-S6)
- [x]2.2 Implement `clampToGrid(x, y, w, h, colCount, rowCount)` — clamps candidate position to stay within grid bounds (Addresses: UC1-S6, UC2-S6)
- [x]2.3 Implement AABB `detectCollision(candidate, layout, excludeId?)` — returns `true` if candidate overlaps any existing widget (Addresses: UC1-E5a, UC2-E5a)
- [x]2.4 Implement `isValidDrop(candidate, layout, colCount, rowCount, excludeId?)` — combines bounds check and collision detection (Addresses: UC1-E5a, UC1-E5a2, UC2-E4a, UC2-E5a, UC3-S6)
- [x]2.5 Write unit tests for all grid utility functions covering valid positions, out-of-bounds, full overlap, partial overlap, and original-position cases (Addresses: UC1-S5, UC1-S6, UC2-S5, UC2-S6, UC1-E5a, UC2-E5a)

---

## 3. DashboardGrid Component

- [x]3.1 Create `DashboardGrid` component scaffold with props: `layout?`, `onLayoutChange`, `cellSize?`, `colCount?`, `rowCount?` (Addresses: UC1-S7, UC2-S7)
- [x]3.2 Implement uncontrolled mode — manage layout in internal `useState`; call `onLayoutChange` on each update (Addresses: UC1-S7, UC2-S7)
- [x]3.3 Implement controlled mode — render from `layout` prop; call `onLayoutChange` without modifying internal state (Addresses: UC1-S7, UC2-S7)
- [x]3.4 Measure container width via `useEffect` + `ResizeObserver` to compute `colCount` dynamically when not provided as prop (Addresses: UC1-S3, UC2-S3, UC3-S1)
- [x]3.5 Wire `useDrop` on the grid canvas — capture `hover` callback to track `pointerPosition` in state (Addresses: UC1-S3, UC1-S4, UC2-S3, UC2-S4, UC3-S1, UC3-S3)
- [x]3.6 In `useDrop` `hover`, compute candidate snap position and validity; store as `{ candidatePos, isValid }` in state (Addresses: UC1-S4, UC2-S4, UC3-S3, UC3-S4, UC3-S5)
- [x]3.7 Clear `candidatePos` when `isOver` becomes `false` (pointer leaves canvas) (Addresses: UC1-E4a, UC2-E4a)
- [x]3.8 In `useDrop` `drop`, call `isValidDrop`; if valid update layout state and call `onLayoutChange`; if invalid leave layout unchanged (Addresses: UC1-S5, UC1-S6, UC1-S7, UC2-S5, UC2-S6, UC2-S7, UC1-E5a2, UC2-E4a2, UC3-S6)
- [x]3.9 Render drop-target highlight overlay cell at `candidatePos` — green when `isValid`, red when invalid, neutral grey when over original position (Addresses: UC1-S4, UC3-S3, UC3-S4, UC3-E3a)
- [x]3.10 Render the grid canvas with correct pixel dimensions (`colCount * cellSize` × `rowCount * cellSize`) (Addresses: UC1-S3, UC2-S3, UC3-S1)

---

## 4. DraggableWidget Component

- [x]4.1 Create `DraggableWidget` component scaffold with props: `id`, `x`, `y`, `w`, `h`, `cellSize`, `children` (Addresses: UC1-S1, UC2-S1)
- [x]4.2 Wire `useDrag` — set drag item type `WIDGET`, include `{ id, x, y, w, h }` as drag item (Addresses: UC1-S1, UC2-S1, UC3-S1)
- [x]4.3 Position widget absolutely on the grid using CSS: `left: x * cellSize`, `top: y * cellSize`, `width: w * cellSize`, `height: h * cellSize` (Addresses: UC1-S6, UC2-S6)
- [x]4.4 Apply `isDragging` state from `useDrag` — reduce opacity to indicate widget is being dragged (Addresses: UC1-S2, UC2-S2)
- [x]4.5 Ensure `useDrag` `end` callback handles `didDrop: false` gracefully — widget reverts to original position automatically via React state (Addresses: UC1-E4a1, UC1-E5a2, UC1-E5b, UC2-E4a2, UC2-E5b)

---

## 5. Drag Preview (Custom Drag Layer)

- [x]5.1 Create `WidgetDragLayer` component using `useDragLayer` — renders a fixed-position overlay div (Addresses: UC1-S2, UC2-S2, UC3-S2)
- [x]5.2 Inside `WidgetDragLayer`, render a semi-transparent ghost (60% opacity) of the dragged widget at current pointer offset (Addresses: UC3-S2, UC3-S5)
- [x]5.3 Throttle `useDragLayer` updates to ~60fps using `requestAnimationFrame` to prevent layout thrashing (Addresses: UC3-S5, UC3-E5a)
- [x]5.4 Hide `WidgetDragLayer` when `isDragging` is false (Addresses: UC1-S2, UC2-S2)
- [x]5.5 Suppress the browser's default drag image via `dragPreview(getEmptyImage(), { captureDraggingState: true })` (Addresses: UC3-S2)
- [x]5.6 Mount `WidgetDragLayer` inside `DashboardGrid` or at app root alongside `DndProvider` (Addresses: UC3-S1, UC3-S2)

---

## 6. Layout State & Serialization

- [x]6.1 Validate incoming `layout` prop — clamp widget `x`, `y`, `w`, `h` values to grid bounds on mount (Addresses: UC1-S7, UC2-S7)
- [x]6.2 Ensure `onLayoutChange` receives a plain JSON-serializable `WidgetLayout[]` array (Addresses: UC1-S7, UC2-S7)
- [x]6.3 Write a round-trip test: serialize layout to JSON, parse back, pass as `layout` prop, assert widgets render at correct positions (Addresses: UC1-S7, UC2-S7)

---

## 7. Integration & End-to-End Tests

- [x]7.1 Write integration test: drag existing widget to valid empty cell — assert layout updates and widget renders at new position (Addresses: UC1-S1, UC1-S2, UC1-S3, UC1-S4, UC1-S5, UC1-S6, UC1-S7)
- [x]7.2 Write integration test: drag widget over occupied cell — assert invalid highlight shown and layout unchanged on drop (Addresses: UC1-E5a, UC1-E5a2)
- [x]7.3 Write integration test: drag widget outside canvas — assert layout unchanged and widget returns to original position (Addresses: UC1-E4a, UC1-E4a1)
- [x]7.4 Write integration test: Escape key during drag — assert drag cancelled and widget restored (Addresses: UC1-E5b)
- [x]7.5 Write integration test: place new widget from external source onto valid cell — assert widget added to layout (Addresses: UC2-S1, UC2-S2, UC2-S3, UC2-S4, UC2-S5, UC2-S6, UC2-S7)
- [x]7.6 Write integration test: drag preview visible during drag and removed after drop/cancel (Addresses: UC3-S2, UC3-S5)
- [x]7.7 Write integration test: highlight turns neutral when dragged widget is over its own original position (Addresses: UC3-E3a)
- [x]7.8 Write integration test: no valid highlight shown when grid has no space large enough for the widget (Addresses: UC2-E4a, UC2-E4a2)
