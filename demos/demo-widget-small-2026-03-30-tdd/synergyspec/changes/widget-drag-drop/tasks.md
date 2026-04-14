## Implementation Overview

This task list implements the `widget-drag-drop` change.
See `usecases.md` "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

---

## Use Case Traceability

This implementation addresses all 19 use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User presses and holds a widget to initiate a drag |
| UC1-S2 | System lifts widget visually and displays ghost preview at current position |
| UC1-S3 | User moves the pointer across the grid |
| UC1-S4 | System snaps ghost preview to nearest valid grid cell(s) in real time |
| UC1-S5 | User releases pointer over a target cell |
| UC1-S6 | System validates target position is within bounds and unoccupied |
| UC1-S7 | System places widget at snapped position and removes drag preview |
| UC1-S8 | System persists updated layout to localStorage |
| UC1-E3a | User moves pointer outside grid boundary — preview stays at last valid position |
| UC1-E6a | Target position is occupied — system shows conflict highlight and snaps widget back |
| UC1-E6b | Target position is out of bounds — treated as invalid, widget snaps back |
| UC1-E1a | User cancels drag (Escape) — preview discarded, widget returns to original position |
| UC2-S1 | System reads serialised layout from localStorage on page init |
| UC2-S2 | System validates stored layout (IDs and positions) |
| UC2-S3 | System renders each widget at its stored grid position |
| UC2-S4 | User sees dashboard exactly as they left it |
| UC2-E1a | No stored layout — system renders default layout from props/config |
| UC2-E2a | Stored layout contains unknown widget ID — stale entry discarded, rest restored |
| UC2-E2b | Widget position out of current grid bounds — falls back to default layout for affected widget |

---

## 1. Project Setup & Dependencies

- [x] 1.1 Install `@dnd-kit/core` and `@dnd-kit/utilities` packages (Addresses: UC1-S1, UC1-S3, UC1-S5)
- [x] 1.2 Define the `WidgetLayout` TypeScript type `{ widgetId: string; col: number; row: number; w: number; h: number }` in a shared types file (Addresses: UC1-S8, UC2-S1)
- [x] 1.3 Define the `WidgetDefinition` TypeScript type `{ id: string; w: number; h: number; defaultCol: number; defaultRow: number }` (Addresses: UC2-S2, UC2-E2a)

---

## 2. Layout Persistence Hook

- [x] 2.1 Create `useLayoutPersistence(storageKey, defaultLayout, widgetDefs, gridCols, gridRows)` custom hook (Addresses: UC2-S1, UC2-S2, UC2-S3, UC2-S4)
- [x] 2.2 Implement `localStorage` read on mount with JSON parse; fall back to `defaultLayout` on missing key or parse error (Addresses: UC2-S1, UC2-E1a)
- [x] 2.3 Implement validation: filter out entries whose `widgetId` is not in `widgetDefs` and discard stale IDs (Addresses: UC2-S2, UC2-E2a)
- [x] 2.4 Implement validation: replace positions exceeding current grid bounds with default layout positions for affected widgets (Addresses: UC2-S2, UC2-E2b)
- [x] 2.5 Write cleaned/validated layout back to `localStorage` if modifications were made during validation (Addresses: UC2-E2a, UC2-E2b)
- [x] 2.6 Implement `saveLayout(layout)` function that serialises and writes to `localStorage`, with try/catch logging a warning on failure (Addresses: UC1-S8)

---

## 3. Collision & Bounds Detection

- [x] 3.1 Implement pure function `isValidPlacement(layout, widgetId, col, row, w, h, gridCols, gridRows): boolean` (Addresses: UC1-S6, UC1-E6a, UC1-E6b)
- [x] 3.2 Add bounds check: `col >= 0 && row >= 0 && col + w <= gridCols && row + h <= gridRows` (Addresses: UC1-S6, UC1-E6b)
- [x] 3.3 Add collision check: no other widget in layout occupies any cell in the target bounding box (Addresses: UC1-S6, UC1-E6a)
- [x] 3.4 Implement snap coordinate calculation `pointerToCell(pointerX, pointerY, gridRect, cellSize): { col, row }` using `floor((pointer - gridOrigin) / cellSize)` (Addresses: UC1-S4)
- [x] 3.5 Clamp snap result to `[0, gridCols - w]` × `[0, gridRows - h]` to prevent out-of-bounds preview tracking (Addresses: UC1-E3a)

---

## 4. DashboardGrid Component

- [x] 4.1 Create `DashboardGrid` component accepting props: `widgets: WidgetDefinition[]`, `defaultLayout: WidgetLayout[]`, `cols: number`, `rows: number`, `cellSize: number`, `storageKey: string` (Addresses: UC2-S3, UC2-S4)
- [x] 4.2 Integrate `useLayoutPersistence` hook to initialise and manage layout state (Addresses: UC2-S1, UC2-S2, UC2-S3, UC2-S4, UC2-E1a, UC2-E2a, UC2-E2b)
- [x] 4.3 Set up `DndContext` from `@dnd-kit/core` with `onDragStart`, `onDragMove`, `onDragEnd`, and `onDragCancel` handlers (Addresses: UC1-S1, UC1-S3, UC1-S5, UC1-E1a)
- [x] 4.4 Track `activeDragId` state; set on `onDragStart`, clear on `onDragEnd` and `onDragCancel` (Addresses: UC1-S2, UC1-S7)
- [x] 4.5 Track `snapTarget: { col, row } | null` state; compute on each `onDragMove` using `pointerToCell` with clamping (Addresses: UC1-S4, UC1-E3a)
- [x] 4.6 Track `isConflict: boolean` state; compute via `isValidPlacement` on each `onDragMove` (Addresses: UC1-E6a, UC1-E6b)
- [x] 4.7 Implement `onDragEnd`: if `snapTarget` is valid per `isValidPlacement`, update layout state and call `saveLayout`; otherwise discard (Addresses: UC1-S5, UC1-S6, UC1-S7, UC1-S8, UC1-E6a, UC1-E6b)
- [x] 4.8 Implement `onDragCancel`: clear `activeDragId` and `snapTarget` without modifying layout (Addresses: UC1-E1a)
- [x] 4.9 Render `DragOverlay` containing a clone of the active widget, passing `isConflict` for visual styling (Addresses: UC1-S2, UC1-S7, UC1-E6a)

---

## 5. GridDropZone Component

- [x] 5.1 Create `GridDropZone` component wrapping the grid container with `useDroppable` from `@dnd-kit/core` (Addresses: UC1-S5, UC1-S6)
- [x] 5.2 Apply CSS grid layout using `cols`, `rows`, and `cellSize` props to define cell dimensions (Addresses: UC1-S4, UC2-S3)
- [x] 5.3 Expose grid container `ref` so `DashboardGrid` can read its bounding rect for snap coordinate calculations (Addresses: UC1-S4)

---

## 6. DraggableWidget Component

- [x] 6.1 Create `DraggableWidget` component wrapping a widget with `useDraggable` from `@dnd-kit/core`, passing `widgetId` as the draggable `id` (Addresses: UC1-S1, UC1-S3)
- [x] 6.2 When `isDragging` is true, render a dimmed placeholder in the original cell instead of the widget content (Addresses: UC1-S2)
- [x] 6.3 Position each `DraggableWidget` within the grid at its `(col, row)` from layout state using CSS grid `grid-column` / `grid-row` properties (Addresses: UC2-S3)
- [x] 6.4 Apply `grid-column: span w` and `grid-row: span h` for variable-sized widgets (Addresses: UC1-S4, UC2-S3)

---

## 7. Drag Preview Styling

- [x] 7.1 Style the `DragOverlay` clone to appear elevated (e.g., box shadow, slight scale transform) (Addresses: UC1-S2)
- [x] 7.2 Apply a conflict indicator style (e.g., red tint / border) to the `DragOverlay` when `isConflict` is true (Addresses: UC1-E6a, UC1-E6b)
- [x] 7.3 Style the placeholder cell (shown when a widget is being dragged) with a dashed border or dimmed appearance (Addresses: UC1-S2)

---

## 8. Integration & Wiring

- [x] 8.1 Replace the existing static widget render in the dashboard page with `<DashboardGrid>`, supplying `widgets`, `defaultLayout`, `cols`, `rows`, `cellSize`, and `storageKey` props (Addresses: UC2-S3, UC2-S4)
- [x] 8.2 Verify that layout persists correctly across page reloads in the browser (Addresses: UC2-S4, UC2-E1a)
- [x] 8.3 Verify Escape key cancels drag and restores widget to original position (Addresses: UC1-E1a)
- [x] 8.4 Verify conflict highlight appears when dragging over an occupied cell (Addresses: UC1-E6a)
- [x] 8.5 Verify widget snaps back when dropped on an occupied or out-of-bounds target (Addresses: UC1-E6a, UC1-E6b)
- [x] 8.6 Verify stale widget IDs and out-of-bounds positions are cleaned from `localStorage` on load (Addresses: UC2-E2a, UC2-E2b)
