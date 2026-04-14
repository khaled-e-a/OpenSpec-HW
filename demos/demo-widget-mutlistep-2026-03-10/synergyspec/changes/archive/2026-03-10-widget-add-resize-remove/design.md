## Context

The dashboard is a React + TypeScript app built on `@dnd-kit/core` for drag-and-drop. The grid is rendered as a CSS `display: grid` element inside `DashboardGrid`. Each widget occupies one or more cells via `gridColumn`/`gridRow` spans. `WidgetLayout` already carries `w` and `h` fields (they were added with drag-drop). The `isValidDrop` utility handles collision and bounds checking using those fields. Three new capabilities are added: add, resize, and remove.

Current file structure:
- `types.ts` — `WidgetLayout` (already has `col`, `row`, `w`, `h`, `id`)
- `DashboardGrid.tsx` — drag orchestrator; owns ghost/drag state
- `DraggableWidget.tsx` — single widget with drag handle; positioned via CSS grid
- `GhostWidget.tsx` — ghost overlay rendered inside the grid during drag
- `utils/collision.ts` — `isValidDrop` for collision + bounds
- `utils/gridCoords.ts` — `pointerToCell`, `isPointerInsideGrid`
- `App.tsx` — owns layout state, wires `onLayoutChange`

---

## Use Case Coverage

| Use Case Step | Description | Design Section |
|---------------|-------------|----------------|
| UC1-S1 | User activates the Add Widget control | Decision 1: Add Widget Placement |
| UC1-S2 | System finds the first available grid cell (left-to-right, top-to-bottom) | Decision 1: Add Widget Placement |
| UC1-S3 | System creates a new widget entry with default size (1×1) at the found cell | Decision 1: Add Widget Placement |
| UC1-S4 | System updates layout state and re-renders the grid with the new widget | Decision 1: Add Widget Placement |
| UC1-S5 | New widget is visible and available for interaction | Decision 1: Add Widget Placement |
| UC1-E1a | No unoccupied cell exists — Add Widget control is disabled/unavailable | Decision 1: Add Widget Placement |
| UC2-S1 | User presses down on the resize handle of a widget | Decision 2: Resize Mechanism |
| UC2-S2 | System enters resize mode — ghost overlay shows current size at current position | Decision 2: Resize Mechanism |
| UC2-S3 | User drags the handle to change the widget's span | Decision 2: Resize Mechanism |
| UC2-S4 | System continuously updates ghost to reflect candidate new size, snapped to whole cells | Decision 2: Resize Mechanism |
| UC2-S5 | System validates candidate size: bounds check and collision check | Decision 3: Resize Validation |
| UC2-S6 | Ghost reflects validity — valid normal, invalid shows "cannot resize" indicator | Decision 3: Resize Validation |
| UC2-S7 | User releases handle at the desired size | Decision 2: Resize Mechanism |
| UC2-S8 | System performs final validation of candidate size | Decision 3: Resize Validation |
| UC2-S9 | System commits new size — updates `w` and `h` in layout, re-renders widget | Decision 2: Resize Mechanism |
| UC2-S10 | Ghost is removed; widget renders at new size | Decision 2: Resize Mechanism |
| UC2-E3a | Candidate span would be zero — system clamps to 1×1 minimum | Decision 3: Resize Validation |
| UC2-E5a | Candidate size overlaps widget or exceeds bounds — ghost shows "cannot resize" | Decision 3: Resize Validation |
| UC2-E7a | User releases at invalid size — resize cancelled, original size retained | Decision 3: Resize Validation |
| UC2-E7b | User presses Escape during resize — resize cancelled immediately, ghost removed | Decision 2: Resize Mechanism |
| UC3-S1 | User activates the Remove control on a widget | Decision 4: Remove Button |
| UC3-S2 | System removes the widget from layout state | Decision 4: Remove Button |
| UC3-S3 | System re-renders the grid; occupied cells are now empty | Decision 4: Remove Button |
| UC3-S4 | `onLayoutChange` called with updated array without the removed widget | Decision 4: Remove Button |
| UC3-E1a | User removes the last remaining widget — grid renders as empty, `onLayoutChange` called with empty array | Decision 4: Remove Button |

### Unaddressed Use Case Steps
None — all 25 steps are covered.

---

## Goals / Non-Goals

**Goals:**
- Add Widget button that places a new 1×1 widget at the first open cell
- Resize handles on each widget for span adjustment, with ghost preview and validation
- Remove (×) button on each widget
- Reuse existing `GhostWidget`, `isValidDrop`, and pointer-to-cell utilities where possible

**Non-Goals:**
- Undo/redo of add, resize, or remove actions
- Persisting layout to storage
- Animated widget removal transitions
- Multi-select or batch removal
- Adding widgets of pre-chosen size (default 1×1 only)

---

## Decisions

### Decision 1: Add Widget Placement

**Addresses**: UC1-S1 - User activates the Add Widget control
**Addresses**: UC1-S2 - System finds the first available grid cell (left-to-right, top-to-bottom)
**Addresses**: UC1-S3 - System creates a new widget entry with default size (1×1) at the found cell
**Addresses**: UC1-S4 - System updates layout state and re-renders the grid with the new widget
**Addresses**: UC1-S5 - New widget is visible and available for interaction
**Addresses**: UC1-E1a - No unoccupied cell exists — Add Widget control is disabled/unavailable

The "Add Widget" button lives in `App.tsx` (outside the grid), not inside `DashboardGrid`. This keeps the grid component focused on layout management.

On click, a helper `findFirstOpenCell(layout, cols, rows): { col, row } | null` scans all cells row-by-row, column-by-column and returns the first unoccupied 1×1 position. If it returns `null`, the button is disabled. A new `WidgetLayout` entry is created with a generated ID (e.g., `widget-<timestamp>`), `w: 1`, `h: 1`, and the found `col`/`row`. `setLayout` is called with the updated array.

**Alternative Considered**: Adding an `onAddWidget` prop to `DashboardGrid` — rejected because the scanning logic depends on the full layout and grid dimensions which are already managed by `App`.

---

### Decision 2: Resize Mechanism — Raw Pointer Events, Not @dnd-kit

**Addresses**: UC2-S1 - User presses down on the resize handle of a widget
**Addresses**: UC2-S2 - System enters resize mode — ghost overlay shows current size at current position
**Addresses**: UC2-S3 - User drags the handle to change the widget's span
**Addresses**: UC2-S4 - System continuously updates ghost to reflect candidate new size, snapped to whole cells
**Addresses**: UC2-S7 - User releases handle at the desired size
**Addresses**: UC2-S9 - System commits new size — updates `w` and `h` in layout, re-renders widget
**Addresses**: UC2-S10 - Ghost is removed; widget renders at new size
**Addresses**: UC2-E7b - User presses Escape during resize — resize cancelled immediately, ghost removed

Resize is implemented with raw `pointerdown`/`pointermove`/`pointerup` events on a `ResizeHandle` component, **not** via `@dnd-kit`. Reasons:
- @dnd-kit sensors are designed to move items between positions; a resize operation changes an item's size in-place, which doesn't fit the droppable/draggable model
- Raw pointer events give fine-grained control over the resize delta without fighting @dnd-kit's transform system
- The resize handle calls `event.stopPropagation()` on `pointerdown` to prevent @dnd-kit's `PointerSensor` from also initiating a drag

`DashboardGrid` gains a `resizeState` (mirroring `ghost` for drag) holding `{ widgetId, startW, startH, startCol, startRow }` plus ghost position/size/validity. On `pointermove`, the grid computes a candidate `(w, h)` from the delta between the initial and current pointer position, updates the ghost, and validates. On `pointerup`, if valid, commits to layout via `onLayoutChange`.

`Escape` during resize is handled by a `keydown` listener attached when resize mode is entered and removed when it exits.

**Alternative Considered**: Using a second @dnd-kit `DragOverlay` for resize — rejected because it conflates two conceptually distinct operations and makes `DragEndEvent` disambiguation complex.

---

### Decision 3: Resize Validation — Reuse `isValidDrop`

**Addresses**: UC2-S5 - System validates candidate size: bounds check and collision check
**Addresses**: UC2-S6 - Ghost reflects validity — valid normal, invalid shows "cannot resize" indicator
**Addresses**: UC2-E3a - Candidate span would be zero — system clamps to 1×1 minimum
**Addresses**: UC2-E5a - Candidate size overlaps widget or exceeds bounds — ghost shows "cannot resize"
**Addresses**: UC2-E7a - User releases at invalid size — resize cancelled, original size retained
**Addresses**: UC2-S8 - System performs final validation of candidate size

The existing `isValidDrop(candidate, layout, cols, rows, excludeId)` already checks bounds and collision. It is reused verbatim by passing the candidate `{ col, row, w, h }` (position stays fixed; only `w`/`h` change) with `excludeId` set to the widget being resized. No changes to `collision.ts` are needed.

Minimum size clamping (`w >= 1`, `h >= 1`) is applied before calling `isValidDrop`.

The existing `GhostWidget` component's `isValid` prop already drives the "cannot place" visual style; this same prop is reused to communicate "cannot resize" during resize mode.

---

### Decision 4: Remove Button — Prop-Callback Pattern

**Addresses**: UC3-S1 - User activates the Remove control on a widget
**Addresses**: UC3-S2 - System removes the widget from layout state
**Addresses**: UC3-S3 - System re-renders the grid; occupied cells are now empty
**Addresses**: UC3-S4 - `onLayoutChange` called with updated array without the removed widget
**Addresses**: UC3-E1a - User removes the last remaining widget — grid renders as empty, `onLayoutChange` called with empty array

Each `DraggableWidget` receives an optional `onRemove?: () => void` prop. When provided, a small × button is rendered absolutely positioned in the widget's top-right corner. The button calls `event.stopPropagation()` to prevent triggering a drag, then calls `onRemove`.

`App.tsx` wires this as:
```
onRemove={() => setLayout(prev => prev.filter(w => w.id !== item.id))}
```

This keeps removal logic in `App` (where layout state lives) and `DraggableWidget` stays purely presentational about it.

**Alternative Considered**: Adding `onRemove` directly to `DashboardGrid` and threading it through — rejected as unnecessary indirection given that `App` already owns layout state.

---

## Risks / Trade-offs

- **Pointer event conflicts (resize vs drag)**: The resize handle's `stopPropagation` prevents @dnd-kit from seeing the event. If the handle placement overlaps with the drag listener area, there could be edge cases on some browsers. Mitigation: keep the resize handle small (16×16 px) and confined to the bottom-right corner, well inside the widget border.

- **Ghost state coupling**: `DashboardGrid` now manages two ghost-like states (drag ghost + resize ghost). If both were active simultaneously (shouldn't happen, but guarded), they could interfere. Mitigation: entering resize mode is blocked if `activeId` (drag) is set, and vice versa.

- **`findFirstOpenCell` performance**: O(cols × rows × |layout|) — negligible for typical dashboard sizes (≤ 20 widgets, ≤ 12×8 grid).

---

## Migration Plan

1. Add `findFirstOpenCell` utility to `utils/` (or inline in `App.tsx`).
2. Extend `DraggableWidget` with `onRemove?: () => void` prop and × button.
3. Add `ResizeHandle` component (self-contained with pointer event logic or wired via callback to `DashboardGrid`).
4. Add resize state management to `DashboardGrid` (mirrors drag ghost pattern).
5. Update `App.tsx` with Add Widget button and remove callbacks.
6. Update existing tests; add new tests for add/resize/remove.

No breaking changes to the public API beyond the new optional props. The `WidgetLayout` type is unchanged (already has `w`/`h`).

---

## Open Questions

- Should the resize handle be on all four edges/corners, or only the bottom-right? (Bottom-right only is simplest for a first iteration.)
- Should the Add Widget button show a picker for widget type/content, or always create a blank placeholder? (Design assumes blank placeholder for now.)
