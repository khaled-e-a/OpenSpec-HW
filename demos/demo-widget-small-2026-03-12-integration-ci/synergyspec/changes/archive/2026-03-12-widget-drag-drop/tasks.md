## Implementation Overview
This task list implements the widget-drag-drop change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability
This implementation addresses the following use case steps:
- UC1-S1: User initiates drag on a widget
- UC1-S2: System shows drag preview at original position
- UC1-S3: User moves pointer across the grid
- UC1-S4: System highlights valid drop zones
- UC1-S5: User releases widget over a target grid cell
- UC1-S6: System snaps widget to nearest valid grid position
- UC1-S7: System updates layout state with new position
- UC1-E5a: Target cell is occupied — system prevents drop with feedback
- UC1-E5b: User cancels drag — system returns widget to original position
- UC2-S1: User locates resize handle on widget
- UC2-S2: User begins dragging resize handle
- UC2-S3: System shows live resize preview
- UC2-S4: User releases handle at desired size
- UC2-S5: System snaps widget size to whole grid cell dimensions
- UC2-S6: System checks for overlap with adjacent widgets
- UC2-S7: System updates layout state with new size
- UC2-E4a: Resize would overlap adjacent widget — system caps at boundary
- UC2-E4b: Resize would exceed grid boundary — system constrains to grid edge
- UC2-E4c: User cancels resize — system restores original size

## 1. Project Setup & Dependencies

- [x] 1.1 Add `@dnd-kit/core` and `@dnd-kit/utilities` to project dependencies
- [x] 1.2 Define `LayoutItem` TypeScript type `{ id: string; x: number; y: number; w: number; h: number }`
- [x] 1.3 Define `DashboardProps` interface including `layout`, `initialLayout`, `onLayoutChange`, `cols`, `cellSize`

## 2. Grid Coordinate System

- [x] 2.1 Implement `pixelToCell(px, py, cellSize)` helper that rounds pixel offsets to integer grid coordinates (Addresses: UC1-S3, UC1-S6)
- [x] 2.2 Implement `cellToPixel(x, y, cellSize)` helper for rendering widget positions (Addresses: UC1-S3)
- [x] 2.3 Implement `clampToGrid(x, y, w, h, cols, rows)` to enforce grid boundary constraints (Addresses: UC2-E4b)

## 3. Collision Detection

- [x] 3.1 Implement `detectOverlap(candidate: LayoutItem, layout: LayoutItem[], excludeId: string)` using AABB test (Addresses: UC1-E5a, UC2-S6)
- [x] 3.2 Implement `capResizeAtBoundary(candidate, layout, excludeId)` to find largest non-overlapping (w, h) (Addresses: UC2-E4a)
- [x] 3.3 Write unit tests for overlap detection covering: no overlap, partial overlap, exact adjacency, self-exclusion

## 4. DashboardGrid Component

- [x] 4.1 Create `DashboardGrid` component that renders a CSS grid using `cols` and `cellSize` props
- [x] 4.2 Render each `LayoutItem` at computed pixel position using absolute positioning
- [x] 4.3 Set up `DndContext` from `@dnd-kit/core` wrapping the grid (Addresses: UC1-S1)
- [x] 4.4 Implement `onDragStart` handler to record pre-drag position for cancel restore (Addresses: UC1-S1, UC1-E5b)
- [x] 4.5 Implement `onDragMove` handler: compute candidate cell, run collision check, update drop-zone highlight state (Addresses: UC1-S3, UC1-S4, UC1-E5a)
- [x] 4.6 Implement `onDragEnd` handler: if valid position snap and call `onLayoutChange`; if cancelled restore original (Addresses: UC1-S5, UC1-S6, UC1-S7, UC1-E5b)
- [x] 4.7 Render drop zone overlay with "valid" / "invalid" CSS class driven by collision check result (Addresses: UC1-S4, UC1-E5a)

## 5. DraggableWidget Component

- [x] 5.1 Create `DraggableWidget` component wrapping children with `useDraggable` from `@dnd-kit/core` (Addresses: UC1-S1)
- [x] 5.2 Render ghost/placeholder at original position while drag is in progress (Addresses: UC1-S2)
- [x] 5.3 Add keyboard listener for Escape key to cancel active drag and restore original position (Addresses: UC1-E5b)

## 6. Resize Handle

- [x] 6.1 Create `ResizeHandle` component rendered at bottom-right corner of each `DraggableWidget` (Addresses: UC2-S1)
- [x] 6.2 Show/hide resize handle on widget hover via CSS (Addresses: UC2-S1)
- [x] 6.3 Wire `ResizeHandle` drag start to record pre-resize dimensions (Addresses: UC2-S2, UC2-E4c)
- [x] 6.4 On resize drag move: compute candidate (w, h) from pointer delta, run `capResizeAtBoundary` and `clampToGrid`, update live preview (Addresses: UC2-S3, UC2-E4a, UC2-E4b)
- [x] 6.5 On resize drag end: apply snapped (w, h) and call `onLayoutChange` (Addresses: UC2-S4, UC2-S5, UC2-S7)
- [x] 6.6 Add Escape key listener during resize to cancel and restore original dimensions (Addresses: UC2-E4c)
- [x] 6.7 Render live resize preview outline showing candidate widget dimensions during resize drag (Addresses: UC2-S3)

## 7. Dashboard Component (Public API)

- [x] 7.1 Create `Dashboard` component that owns layout state (controlled via `layout` + `onLayoutChange`, or uncontrolled via `initialLayout`)
- [x] 7.2 Pass layout, cols, cellSize, and change handlers down to `DashboardGrid`
- [x] 7.3 Export `Dashboard`, `DashboardGrid`, `DraggableWidget`, and `LayoutItem` from package index

## 8. Tests

- [x] 8.1 Unit test `pixelToCell` and `cellToPixel` round-trip (Addresses: UC1-S3, UC1-S6)
- [x] 8.2 Unit test `clampToGrid` boundary cases (Addresses: UC2-E4b)
- [x] 8.3 Integration test: drag widget to empty cell → layout state updated (Addresses: UC1-S5, UC1-S6, UC1-S7)
- [x] 8.4 Integration test: drag widget to occupied cell → drop rejected, widget returns to origin (Addresses: UC1-E5a)
- [x] 8.5 Integration test: press Escape during drag → widget returns to original position (Addresses: UC1-E5b)
- [x] 8.6 Integration test: resize widget to larger size → layout state updated with new (w, h) (Addresses: UC2-S4, UC2-S5, UC2-S7)
- [x] 8.7 Integration test: resize to overlap adjacent widget → capped at boundary (Addresses: UC2-E4a)
- [x] 8.8 Integration test: resize to exceed grid edge → constrained to grid boundary (Addresses: UC2-E4b)
- [x] 8.9 Integration test: press Escape during resize → original size restored (Addresses: UC2-E4c)
