## Implementation Overview
This task list implements the `widget-drag-drop` change.
See `usecases.md` "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability
This implementation addresses the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User presses down on a widget and begins dragging it |
| UC1-S2 | System detects drag start and renders a drag ghost/preview at pointer position |
| UC1-S3 | System highlights grid cells the widget would occupy (snap preview) |
| UC1-S4 | User moves the pointer to the desired grid area |
| UC1-S5 | System continuously updates snap preview to nearest valid grid position |
| UC1-S6 | User releases the pointer to drop the widget |
| UC1-S7 | System snaps widget to nearest valid grid position and updates layout state |
| UC1-S8 | System persists updated layout to local storage |
| UC1-E3a1 | System shows snap preview in invalid/blocked state (target occupied) |
| UC1-E3a2 | System does not allow drop at occupied position |
| UC1-E6a1 | System cancels drag when pointer released outside grid boundary |
| UC1-E6a2 | Layout state remains unchanged after out-of-bounds drop |
| UC1-E6b1 | System cancels drag immediately on Escape key press |
| UC1-E6b2 | Widget animates back to its original position on cancel |
| UC1-E6b3 | Layout state remains unchanged after Escape cancel |
| UC2-S1 | User hovers resize handle; handle becomes visible/highlighted |
| UC2-S2 | User presses down on handle and drags to resize |
| UC2-S3 | System renders live size preview showing new grid span |
| UC2-S4 | User drags to desired size |
| UC2-S5 | User releases pointer to confirm new size |
| UC2-S6 | System updates widget grid span and reflows surrounding widgets if needed |
| UC2-S7 | System persists updated layout to local storage |
| UC2-E4a1 | System caps resize at last valid non-overlapping size |
| UC2-E4a2 | Preview reflects the capped size |
| UC2-E4b1 | System enforces minimum size constraint (1×1 grid units) |
| UC2-E4b2 | Widget cannot be resized below minimum |
| UC2-E5a1 | System reverts widget to original size on out-of-bounds release |
| UC2-E5a2 | Layout state remains unchanged after invalid resize |
| UC3-S1 | System reads saved layout from local storage on mount |
| UC3-S2 | System validates saved layout against current available widgets |
| UC3-S3 | System renders each widget at its saved grid position and size |
| UC3-S4 | User sees their previously arranged dashboard |
| UC3-E1a1 | System renders default layout when no saved layout exists |
| UC3-E2a1 | System discards stale widget entries from saved layout |
| UC3-E2a2 | System renders remaining widgets at saved positions |
| UC3-E2b1 | System logs warning and discards corrupt layout data |
| UC3-E2b2 | System renders default layout when saved data is corrupt |

---

## 1. Project Setup and Dependencies

- [x] 1.1 Install `@dnd-kit/core` and `@dnd-kit/utilities` as production dependencies (Addresses: UC1-S1)
- [x] 1.2 Define the `WidgetLayout` and `DashboardLayout` TypeScript types (`{ id, col, row, w, h }`) (Addresses: UC1-S7, UC2-S6)
- [x] 1.3 Define the `DEFAULT_LAYOUT` constant with initial widget positions and sizes (Addresses: UC3-E1a1)
- [x] 1.4 Define grid configuration constants: `GRID_COLS`, `CELL_WIDTH_PX`, `CELL_HEIGHT_PX` (Addresses: UC1-S3, UC1-S7)

---

## 2. Layout State and Persistence Hook

- [x] 2.1 Implement `useDashboardLayout` hook that initialises state from `localStorage` on mount (Addresses: UC3-S1)
- [x] 2.2 Add saved layout validation in `useDashboardLayout`: filter entries whose `id` is not in the current widget registry (Addresses: UC3-S2, UC3-E2a1, UC3-E2a2)
- [x] 2.3 Add JSON parse error handling in `useDashboardLayout`: log `console.warn` and fall back to `DEFAULT_LAYOUT` on corrupt data (Addresses: UC3-E2b1, UC3-E2b2)
- [x] 2.4 Fall back to `DEFAULT_LAYOUT` in `useDashboardLayout` when no saved entry exists in `localStorage` (Addresses: UC3-E1a1)
- [x] 2.5 Implement `commitLayout` function in `useDashboardLayout` that updates state and writes serialised layout to `localStorage` (Addresses: UC1-S8, UC2-S7)

---

## 3. Collision Detection Engine

- [x] 3.1 Implement pure `isValidPlacement(layout, candidate, excludeId?)` function with AABB rectangle intersection test (Addresses: UC1-E3a2, UC2-E4a1)
- [x] 3.2 Add grid boundary checks to `isValidPlacement` (`col >= 0`, `col + w <= GRID_COLS`, `row >= 0`) (Addresses: UC1-E6a1, UC2-E5a1)
- [x] 3.3 Add minimum size enforcement to `isValidPlacement` (`w >= 1 && h >= 1`) (Addresses: UC2-E4b1, UC2-E4b2)
- [x] 3.4 Write unit tests for `isValidPlacement` covering: valid placement, collision, boundary violations, and minimum size (Addresses: UC1-E3a1, UC1-E3a2, UC2-E4a1, UC2-E4b1)

---

## 4. Snap-to-Grid Coordinate Utility

- [x] 4.1 Implement `pointerToGridCoords(pointerX, pointerY, gridRect)` utility that converts pointer document coordinates to clamped grid `{ col, row }` (Addresses: UC1-S3, UC1-S5)
- [x] 4.2 Throttle snap coordinate computation to one call per `requestAnimationFrame` in drag move handlers (Addresses: UC1-S5, UC2-S3)

---

## 5. DashboardGrid Component

- [x] 5.1 Create `DashboardGrid` component that renders a CSS grid container with `GRID_COLS` columns (Addresses: UC3-S3, UC3-S4)
- [x] 5.2 Wrap `DashboardGrid` with `@dnd-kit/core` `<DndContext>` providing `onDragStart`, `onDragMove`, `onDragEnd`, and `onDragCancel` handlers (Addresses: UC1-S1, UC1-S6)
- [x] 5.3 Render each widget in `DashboardGrid` at its layout position using CSS `grid-column` and `grid-row` inline styles derived from `{ col, row, w, h }` (Addresses: UC3-S3)
- [x] 5.4 Render `<DropPreview>` overlay inside `DashboardGrid` that receives the current snap target and validity flag (Addresses: UC1-S3, UC1-E3a1)

---

## 6. Widget Component and Drag Handle

- [x] 6.1 Create `Widget` component that wraps its content and exposes a drag handle area activating `@dnd-kit` `useDraggable` (Addresses: UC1-S1, UC1-S2)
- [x] 6.2 Apply reduced opacity to the original widget slot while a drag is active (Addresses: UC1-S2)
- [x] 6.3 Add CSS `transition: transform 200ms ease-out` to `Widget` for cancel animation (Addresses: UC1-E6b2)

---

## 7. Drag Ghost Overlay

- [x] 7.1 Implement `<DragOverlay>` configuration in `DashboardGrid` that renders a ghost copy of the active dragged widget at the pointer position (Addresses: UC1-S2)
- [x] 7.2 Ensure the ghost is removed from the DOM when `onDragEnd` or `onDragCancel` fires (Addresses: UC1-S2)

---

## 8. Drop Preview Overlay Component

- [x] 8.1 Create `DropPreview` component that absolutely-positions highlighted cells over the grid based on the snap target `{ col, row, w, h }` (Addresses: UC1-S3, UC1-S5, UC2-S3)
- [x] 8.2 Style `DropPreview` with a blue highlight when `isValid === true` (Addresses: UC1-S3)
- [x] 8.3 Style `DropPreview` with a red highlight when `isValid === false` (collision or out-of-bounds) (Addresses: UC1-E3a1, UC2-E4a2)
- [x] 8.4 Update `DropPreview` on every `onDragMove` event using the throttled snap coordinate utility (Addresses: UC1-S5)

---

## 9. Drag Repositioning Logic

- [x] 9.1 Implement `onDragMove` handler: compute snap target from pointer coordinates, call `isValidPlacement`, update preview state (Addresses: UC1-S3, UC1-S4, UC1-S5, UC1-E3a1)
- [x] 9.2 Implement `onDragEnd` handler: if placement is valid, call `commitLayout` with the new position; if invalid or `over === null`, do nothing (Addresses: UC1-S6, UC1-S7, UC1-E3a2, UC1-E6a1, UC1-E6a2)
- [x] 9.3 Implement `onDragCancel` handler (Escape key): reset preview state without mutating layout (Addresses: UC1-E6b1, UC1-E6b3)
- [x] 9.4 Verify cancel animation fires via `@dnd-kit` drop animation config on `onDragCancel` (Addresses: UC1-E6b2)

---

## 10. Resize Handle and Resize Interaction

- [x] 10.1 Add a `<div className="resize-handle">` absolutely positioned at the bottom-right corner of each `Widget` (Addresses: UC2-S1)
- [x] 10.2 Show/hide the resize handle via CSS `:hover` on the parent widget (`opacity: 0` → `opacity: 1` on hover) (Addresses: UC2-S1)
- [x] 10.3 Implement pointer-capture resize interaction on `pointerdown` of the resize handle: capture pointer, track `pointermove` delta, compute new `{ w, h }` per frame (Addresses: UC2-S2, UC2-S4)
- [x] 10.4 Compute new grid span from pointer delta: `newW = Math.max(1, Math.round((startW * cellW + deltaX) / cellW))`, clamp by `isValidPlacement` cap logic (Addresses: UC2-S3, UC2-E4a1, UC2-E4b1, UC2-E4b2)
- [x] 10.5 Update `DropPreview` (or equivalent resize preview) each frame during resize drag to show the new span; show red when capped (Addresses: UC2-S3, UC2-E4a2)
- [x] 10.6 On `pointerup` within valid bounds: call `commitLayout` with the new `{ w, h }` (Addresses: UC2-S5, UC2-S6, UC2-S7)
- [x] 10.7 On `pointerup` outside valid bounds or cancel: restore `resizeOriginal` snapshot without mutating layout (Addresses: UC2-E5a1, UC2-E5a2)

---

## 11. Integration and End-to-End Wiring

- [x] 11.1 Mount `DashboardGrid` in the main dashboard page, passing the widget registry and `useDashboardLayout` state (Addresses: UC3-S3, UC3-S4)
- [x] 11.2 Verify full drag-reposition flow end-to-end: drag → preview → drop → layout update → localStorage write (Addresses: UC1-S1 through UC1-S8)
- [x] 11.3 Verify full resize flow end-to-end: hover handle → drag → preview → confirm → layout update → localStorage write (Addresses: UC2-S1 through UC2-S7)
- [x] 11.4 Verify layout restore flow: write layout to localStorage, reload page, confirm widgets render at saved positions (Addresses: UC3-S1 through UC3-S4)

---

## 12. Edge Cases and Error Handling

- [x] 12.1 Test and fix: drop rejected when target cells are occupied by another widget (Addresses: UC1-E3a1, UC1-E3a2)
- [x] 12.2 Test and fix: drag cancelled and layout unchanged when pointer released outside grid (Addresses: UC1-E6a1, UC1-E6a2)
- [x] 12.3 Test and fix: drag cancelled and widget animates back on Escape key press (Addresses: UC1-E6b1, UC1-E6b2, UC1-E6b3)
- [x] 12.4 Test and fix: resize capped at collision boundary (Addresses: UC2-E4a1, UC2-E4a2)
- [x] 12.5 Test and fix: resize cannot go below 1×1 grid units (Addresses: UC2-E4b1, UC2-E4b2)
- [x] 12.6 Test and fix: resize reverted on out-of-bounds pointer release (Addresses: UC2-E5a1, UC2-E5a2)
- [x] 12.7 Test and fix: stale widget entries discarded from saved layout on mount (Addresses: UC3-E2a1, UC3-E2a2)
- [x] 12.8 Test and fix: corrupt localStorage data logs warning and falls back to DEFAULT_LAYOUT (Addresses: UC3-E2b1, UC3-E2b2)
- [x] 12.9 Test and fix: missing localStorage entry falls back to DEFAULT_LAYOUT (Addresses: UC3-E1a1)
