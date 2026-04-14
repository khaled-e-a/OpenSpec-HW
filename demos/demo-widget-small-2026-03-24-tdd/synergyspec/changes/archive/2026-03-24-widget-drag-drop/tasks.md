## Implementation Overview
This task list implements the `widget-drag-drop` change.
See `usecases.md` "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

---

## Use Case Traceability
This implementation addresses the following use case steps:

| UC Step | Description |
|---------|-------------|
| UC1-S1 | User initiates a drag on a widget by pressing and holding it |
| UC1-S2 | System lifts the widget visually, shows a drag preview at original size, highlights the grid |
| UC1-S3 | User moves the pointer across the grid canvas |
| UC1-S4 | System continuously snaps the drag preview to the nearest valid grid cell(s) as pointer moves |
| UC1-S5 | User releases the widget over a target grid area |
| UC1-S6 | System validates that target cells are unoccupied and within grid bounds |
| UC1-S7 | System places the widget at the snapped target position and updates layout state |
| UC1-S8 | User sees the widget settled in its new position; all other widgets remain in place |
| UC1-E5a | User releases widget outside the grid canvas boundary |
| UC1-E5a1 | System returns widget to original position with smooth animation; layout unchanged |
| UC1-E6a | Target cells are partially or fully occupied by another widget |
| UC1-E6a1 | System rejects drop and returns dragged widget to original position |
| UC1-E6a2 | System shows visual cue (red highlight) on blocked cells during drag |
| UC1-E6a3 | Layout state is unchanged after rejected drop |
| UC1-E6b | Target cells would place widget partially outside grid bounds |
| UC1-E6b1 | System treats position as invalid and returns widget to original position |
| UC2-S1 | System receives initial layout configuration with widget sizes and grid coordinates |
| UC2-S2 | System renders DashboardGrid canvas divided into equal-sized cells |
| UC2-S3 | System renders each DraggableWidget occupying its specified cell span at correct grid position |
| UC2-S4 | User sees all widgets displayed without overlap, each proportional to declared size |
| UC2-E3a | Two widgets in initial config overlap — first rendered in conflict position, second moved to nearest available |
| UC2-E3b | Widget declared outside grid bounds — system clamps it to fit within boundary |

---

## 1. Project Setup & Dependencies

- [x] 1.1 Install `@dnd-kit/core` and `@dnd-kit/utilities` packages (Addresses: UC1-S1, UC1-S3, UC1-S5)
- [x] 1.2 Create `src/utils/gridGeometry.ts` module with exported pure functions: `snapToCell`, `buildOccupancySet`, `isValidPlacement`, `resolveLayout` (Addresses: UC1-S4, UC1-S6, UC2-E3a, UC2-E3b)
- [x] 1.3 Write unit tests for all `gridGeometry.ts` functions covering valid placements, collisions, out-of-bounds, and clamping (Addresses: UC1-S6, UC1-E6a, UC1-E6b, UC2-E3a, UC2-E3b)

---

## 2. Grid Rendering — DashboardGrid Component

- [x] 2.1 Create `src/components/DashboardGrid.tsx` rendering a CSS Grid container with `cols`, `rows`, and `cellSize` props (Addresses: UC2-S2)
- [x] 2.2 Accept `initialLayout` prop (array of `WidgetLayout`) and initialise internal layout state via `useState`; support optional controlled mode with `layout` + `onLayoutChange` props (Addresses: UC2-S1)
- [x] 2.3 On mount, run `resolveLayout` to detect and resolve any overlapping or out-of-bounds widgets in `initialLayout`, emitting a console warning if conflicts are found (Addresses: UC2-E3a, UC2-E3b)
- [x] 2.4 Render background grid lines overlay (CSS repeating gradient or SVG) to visually divide the canvas into cells (Addresses: UC2-S2)
- [x] 2.5 Render each widget as a `DraggableWidget` child positioned using `grid-column` / `grid-row` CSS shorthand derived from its layout entry (Addresses: UC2-S3, UC2-S4)

---

## 3. Widget Rendering — DraggableWidget Component

- [x] 3.1 Create `src/components/DraggableWidget.tsx` accepting `id`, `w`, `h`, and `children` props; apply `grid-column: x+1 / span w` and `grid-row: y+1 / span h` styles (Addresses: UC2-S3, UC2-S4)
- [x] 3.2 Integrate `useDraggable` from `@dnd-kit/core` to make the widget draggable via pointer interaction (Addresses: UC1-S1)
- [x] 3.3 While a drag is active on this widget, apply a visual "dimmed placeholder" style to the original cell to indicate the widget is being moved (Addresses: UC1-S2)

---

## 4. Drag Overlay & Live Visual Feedback

- [x] 4.1 Wrap `DashboardGrid` in a `DndContext`; add a `DragOverlay` that renders a clone of the dragged widget at its original `w × h` dimensions, following the pointer during drag (Addresses: UC1-S2)
- [x] 4.2 Apply a grid-canvas highlight style (e.g. subtle border or background tint) when any drag is in progress to signal the grid is an active drop target (Addresses: UC1-S2)
- [x] 4.3 During `onDragMove`, compute the snapped target cell using `snapToCell` and store it in a ref; render a cell-highlight overlay on the projected drop zone — green if `isValidPlacement` returns true, red if false (Addresses: UC1-S4, UC1-E6a2)
- [x] 4.4 Throttle cell-highlight re-renders via `requestAnimationFrame` to avoid performance degradation on fast pointer moves (Addresses: UC1-S3, UC1-S4)

---

## 5. Drop Handling & Layout State Update

- [x] 5.1 In `onDragEnd`, retrieve the last snapped target cell from the ref; call `isValidPlacement` to validate the drop (Addresses: UC1-S5, UC1-S6)
- [x] 5.2 If valid, update the layout state immutably — replace the dragged widget's `x` and `y` with the snapped target coordinates; all other widgets remain unchanged (Addresses: UC1-S7, UC1-S8)
- [x] 5.3 If invalid (out-of-bounds, outside canvas, or cells occupied), leave layout state unchanged; the `DragOverlay` dismisses and the original widget renders in place — no state mutation (Addresses: UC1-E5a, UC1-E5a1, UC1-E6a1, UC1-E6a3, UC1-E6b1)
- [x] 5.4 Apply a CSS transition (`transform 200ms ease`) to the `DragOverlay` dismissal so the widget animates smoothly back to its origin on an invalid drop (Addresses: UC1-E5a1, UC1-E6a1)

---

## 6. Integration & Demo

- [x] 6.1 Create a demo page / Storybook story mounting `DashboardGrid` with 4–5 widgets of mixed sizes (1×1, 2×1, 2×2, 3×2) to exercise all interaction paths (Addresses: UC1-S1, UC2-S1, UC2-S2, UC2-S3, UC2-S4)
- [x] 6.2 Verify in the demo that a valid drag-and-drop repositions the widget correctly and updates the layout (Addresses: UC1-S7, UC1-S8)
- [x] 6.3 Verify in the demo that dropping onto an occupied cell shows the red highlight and returns the widget to its origin (Addresses: UC1-E6a, UC1-E6a2, UC1-E6a1)
- [x] 6.4 Verify in the demo that releasing outside the grid boundary returns the widget with a smooth animation (Addresses: UC1-E5a, UC1-E5a1)
- [x] 6.5 Add `aria-label` props to each `DraggableWidget` to satisfy `@dnd-kit` accessibility requirements (Addresses: UC1-S1)
