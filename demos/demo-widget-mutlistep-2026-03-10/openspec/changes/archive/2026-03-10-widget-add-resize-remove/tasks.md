## Implementation Overview

This task list implements the widget-add-resize-remove change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability

This implementation addresses the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User activates the Add Widget control |
| UC1-S2 | System finds the first available grid cell (left-to-right, top-to-bottom) |
| UC1-S3 | System creates a new widget entry with default size (1×1) at the found cell |
| UC1-S4 | System updates layout state and re-renders the grid with the new widget |
| UC1-S5 | New widget is visible and available for interaction |
| UC1-E1a | No unoccupied cell exists — Add Widget control is disabled/unavailable |
| UC2-S1 | User presses down on the resize handle of a widget |
| UC2-S2 | System enters resize mode — ghost overlay shows current size at current position |
| UC2-S3 | User drags the handle to change the widget's span |
| UC2-S4 | System continuously updates ghost to reflect candidate new size, snapped to whole cells |
| UC2-S5 | System validates candidate size: bounds check and collision check |
| UC2-S6 | Ghost reflects validity — valid normal, invalid shows "cannot resize" indicator |
| UC2-S7 | User releases handle at the desired size |
| UC2-S8 | System performs final validation of candidate size |
| UC2-S9 | System commits new size — updates `w` and `h` in layout, re-renders widget |
| UC2-S10 | Ghost is removed; widget renders at new size |
| UC2-E3a | Candidate span would be zero — system clamps to 1×1 minimum |
| UC2-E5a | Candidate size overlaps widget or exceeds bounds — ghost shows "cannot resize" |
| UC2-E7a | User releases at invalid size — resize cancelled, original size retained |
| UC2-E7b | User presses Escape during resize — resize cancelled immediately, ghost removed |
| UC3-S1 | User activates the Remove control on a widget |
| UC3-S2 | System removes the widget from layout state |
| UC3-S3 | System re-renders the grid; occupied cells are now empty |
| UC3-S4 | `onLayoutChange` called with updated array without the removed widget |
| UC3-E1a | User removes the last remaining widget — grid renders as empty, `onLayoutChange` called with empty array |

---

## 1. Utilities

- [x] 1.1 Add `findFirstOpenCell(layout, cols, rows): { col: number; row: number } | null` to `src/components/dashboard/utils/` — scans cells left-to-right, top-to-bottom and returns the first unoccupied 1×1 position (Addresses: UC1-S2)

---

## 2. Widget Remove

- [x] 2.1 Add optional `onRemove?: () => void` prop to `DraggableWidget` (Addresses: UC3-S1)
- [x] 2.2 Render a × button (absolutely positioned, top-right) inside `DraggableWidget` when `onRemove` is provided; call `event.stopPropagation()` before invoking `onRemove` to prevent drag activation (Addresses: UC3-S1)
- [x] 2.3 Wire `onRemove` in `App.tsx`: filter the removed widget id from layout and call `setLayout` (Addresses: UC3-S2, UC3-S3, UC3-S4, UC3-E1a)

---

## 3. Widget Add

- [x] 3.1 Add an "Add Widget" button to `App.tsx` above (or alongside) the grid (Addresses: UC1-S1)
- [x] 3.2 On button click, call `findFirstOpenCell`; if a cell is found, append a new `WidgetLayout` entry (`w: 1`, `h: 1`, generated unique id) and call `setLayout` (Addresses: UC1-S2, UC1-S3, UC1-S4, UC1-S5)
- [x] 3.3 Disable the "Add Widget" button when `findFirstOpenCell` returns `null` (Addresses: UC1-E1a)

---

## 4. Resize Handle Component

- [x] 4.1 Create `ResizeHandle` component (`src/components/dashboard/ResizeHandle.tsx`): a small (16×16 px) absolutely-positioned element at the widget's bottom-right corner; calls `onPointerDown` prop on press (Addresses: UC2-S1)
- [x] 4.2 On `pointerdown`, call `event.stopPropagation()` to prevent @dnd-kit's `PointerSensor` from initiating a drag, then call `onResizeStart` callback with the initial pointer position (Addresses: UC2-S1)

---

## 5. Resize State in DashboardGrid

- [x] 5.1 Add `resizeState` to `DashboardGrid` tracking `{ widgetId, originCol, originRow, originW, originH, startX, startY }` (Addresses: UC2-S2)
- [x] 5.2 On resize start, initialise `resizeState` and show ghost at the widget's current `(col, row, w, h)` with `isValid: true` (Addresses: UC2-S2)
- [x] 5.3 On `pointermove` (attached to `window` while resize is active), compute candidate `(w, h)` from pointer delta, snap to whole grid cells, clamp minimum to 1×1, validate with `isValidDrop`, and update ghost (Addresses: UC2-S3, UC2-S4, UC2-E3a)
- [x] 5.4 Set ghost `isValid` based on `isValidDrop` result; reuse existing valid/invalid visual styles from `GhostWidget` (Addresses: UC2-S5, UC2-S6, UC2-E5a)
- [x] 5.5 On `pointerup`, if candidate is valid call `onLayoutChange` with updated `w`/`h`, clear resize state and ghost (Addresses: UC2-S7, UC2-S8, UC2-S9, UC2-S10)
- [x] 5.6 On `pointerup` with invalid candidate, clear resize state and ghost without calling `onLayoutChange` (Addresses: UC2-E7a)
- [x] 5.7 Attach `keydown` listener while resize is active; on Escape, clear resize state and ghost without calling `onLayoutChange` (Addresses: UC2-E7b)
- [x] 5.8 Guard: do not enter resize mode if a drag is already active (`activeId !== null`) (Addresses: UC2-S1)

---

## 6. Wire Resize into DraggableWidget

- [x] 6.1 Add optional `onResizeStart?: (pointerId: number, startX: number, startY: number) => void` prop to `DraggableWidget` (Addresses: UC2-S1)
- [x] 6.2 Render `<ResizeHandle>` inside `DraggableWidget` when `onResizeStart` is provided, passing through the callback (Addresses: UC2-S1)
- [x] 6.3 Wire `onResizeStart` in `DashboardGrid`'s render of `DraggableWidget` children — or expose a new `DashboardGrid` prop `onResizeStart` that `App.tsx` forwards (Addresses: UC2-S1, UC2-S2)

---

## 7. Tests

- [x] 7.1 Unit test `findFirstOpenCell`: empty grid, partially filled grid, full grid (Addresses: UC1-S2, UC1-E1a)
- [x] 7.2 Integration test for Add Widget: clicking button adds a widget at the correct cell; button disables when grid is full (Addresses: UC1-S1, UC1-S3, UC1-S4, UC1-S5, UC1-E1a)
- [x] 7.3 Integration test for Remove Widget: clicking × removes the widget; removing the last widget results in an empty layout (Addresses: UC3-S1, UC3-S2, UC3-S4, UC3-E1a)
- [x] 7.4 Unit test resize ghost update logic: valid candidate, out-of-bounds candidate, colliding candidate, zero-size clamp (Addresses: UC2-S4, UC2-S5, UC2-E3a, UC2-E5a)
- [x] 7.5 Integration test for resize commit: valid drag commits new `w`/`h`; invalid release retains original; Escape cancels (Addresses: UC2-S9, UC2-E7a, UC2-E7b)
