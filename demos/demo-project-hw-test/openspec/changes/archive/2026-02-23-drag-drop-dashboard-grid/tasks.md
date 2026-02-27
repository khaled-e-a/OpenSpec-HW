## 1. Project Setup

- [x] 1.1 Create directory structure: `src/components/DashboardGrid/`, `src/components/Widget/`, `src/hooks/`, `src/types/`, `src/registry/`
- [x] 1.2 Add `@dnd-kit/core` and `@dnd-kit/utilities` to `package.json` and install
- [x] 1.3 Define TypeScript interfaces in `src/types/layout.ts`: `WidgetLayout`, `WidgetDefinition`, `GridConfig`

## 2. Widget Registry

- [x] 2.1 Implement `src/registry/widgetRegistry.ts` — a `Map<string, WidgetDefinition>` singleton
- [x] 2.2 Implement `src/registry/registerWidget.ts` — `registerWidget(id, definition)` that upserts into the registry
- [x] 2.3 Write unit tests: registration, duplicate overwrite, lookup by ID

## 3. Layout Engine

- [x] 3.1 Implement `useLayout` hook in `src/hooks/useLayout.ts` with `useReducer` — actions: `ADD_WIDGET`, `MOVE_WIDGET`, `RESIZE_WIDGET`, `REMOVE_WIDGET`
- [x] 3.2 Implement collision detection utility: given a `WidgetLayout[]` and a candidate `{x, y, w, h}`, return `true` if it overlaps any existing entry (excluding the widget being moved)
- [x] 3.3 Implement "first available position" algorithm: scan left-to-right, top-to-bottom for the first unoccupied region that fits `{w, h}`; append a new row if no gap exists
- [x] 3.4 Wire `ADD_WIDGET` to use the first-available-position algorithm and registry `defaultW`/`defaultH`; reject with console error if type is not registered
- [x] 3.5 Write unit tests: `addWidget` placement, `moveWidget` collision rejection, `removeWidget` frees cells, `resizeWidget` clamping

## 4. Persistence Hook

- [x] 4.1 Implement `useDashboardPersistence(key: string)` in `src/hooks/useDashboardPersistence.ts` — reads `WidgetLayout[]` from `localStorage` on mount, writes on every change
- [x] 4.2 Write unit test: rehydration on mount, serialisation round-trip

## 5. Grid Container Component

- [x] 5.1 Implement `LayoutContext` (React Context) in `src/components/DashboardGrid/DashboardGrid.tsx` — provides layout array and dispatch
- [x] 5.2 Implement `DashboardGrid` component: accepts `columns` (default 12), `rowHeight` (default 80), optional `layout` + `onLayoutChange` for controlled mode; falls back to internal `useLayout` for uncontrolled mode
- [x] 5.3 Implement `GridBackground` component in `src/components/DashboardGrid/GridBackground.tsx` — renders visual column/row lines using CSS or SVG (visual only, not interactive)
- [x] 5.4 Wrap `DashboardGrid` children with `DndContext` from `@dnd-kit/core`; attach `onDragEnd` and `onDragMove` handlers

## 6. Widget Shell Component

- [x] 6.1 Implement `Widget` component in `src/components/Widget/Widget.tsx` — renders a header with drag handle area and × remove button, plus a content area below
- [x] 6.2 Wire the × remove button to call `removeWidget(id)` from `LayoutContext`; show a brief undo toast (3-second timeout) before committing removal
- [x] 6.3 Implement error placeholder: if `type` is not found in registry, render a `<div>` displaying `Unknown widget type: <type>` without crashing surrounding widgets

## 7. Widget Positioning (WidgetWrapper)

- [x] 7.1 Implement `WidgetWrapper` in `src/components/DashboardGrid/WidgetWrapper.tsx` — positions each widget absolutely using `left/top/width/height` computed from `{x, y, w, h}`, `columns`, `rowHeight`, and container width
- [x] 7.2 Attach `useDraggable` from `@dnd-kit/core` to `WidgetWrapper`; pass widget `id` as the drag data payload
- [x] 7.3 Verify that `WidgetWrapper` renders the registered component for the widget `type` inside the `Widget` shell content area

## 8. Drag-and-Drop Interaction

- [x] 8.1 Implement snap calculation in `src/hooks/useDragWidget.ts`: on `onDragMove`, compute `col = clamp(round(pointerX / cellWidth), 0, columns - w)` and `row = clamp(round(pointerY / rowHeight), 0, maxRow)`
- [x] 8.2 Implement live drop-target highlight: pass the snapped `{col, row}` to `GridBackground` as `dropTarget`; render valid cells in green and invalid (occupied / out-of-bounds) cells in red
- [x] 8.3 Implement `DragPreview` component in `src/components/DashboardGrid/DragPreview.tsx` using `DragOverlay` from `@dnd-kit`; render a semi-transparent ghost matching the widget's pixel dimensions
- [x] 8.4 Implement `onDragEnd` handler: run collision check on the snapped position; if valid, call `moveWidget(id, col, row)`; if invalid, do nothing (widget returns to original position)
- [x] 8.5 Add keyboard sensor to `DndContext` so drag can be initiated and cancelled via keyboard; confirm Escape key restores original position
- [x] 8.6 Write unit tests: snap calculation for edge columns/rows, collision check on drop, Escape cancellation

## 9. Widget Resize

- [x] 9.1 Implement `useResizeWidget` hook in `src/hooks/useResizeWidget.ts` using `pointerdown` / `pointermove` / `pointerup` with `element.setPointerCapture`
- [x] 9.2 Add resize handle element to `WidgetWrapper` (bottom-right corner, min 44×44 px touch target); hide / disable handle when a drag is active
- [x] 9.3 On `pointermove` during resize, compute snapped new `{w, h}` and enforce: `w ≥ minW`, `h ≥ minH`, `x + w ≤ columns`, capped by occupied right/bottom neighbours
- [x] 9.4 Render a live resize preview overlay (dashed border) showing the snapped new dimensions during handle drag
- [x] 9.5 On `pointerup`, call `resizeWidget(id, newW, newH)` if valid; handle spring-back if at minimum size boundary
- [x] 9.6 Handle Escape key during resize to cancel and restore original size
- [x] 9.7 Write unit tests: min-size clamping, max-size clamping, neighbour boundary clamping

## 10. Sample Widget Types & Demo

- [x] 10.1 Register a `metric-card` widget (`defaultW: 2, defaultH: 2, minW: 1, minH: 1`) with a simple stat-display component
- [x] 10.2 Register a `bar-chart` widget (`defaultW: 4, defaultH: 3, minW: 2, minH: 2`) with a placeholder chart component
- [x] 10.3 Register a `data-table` widget (`defaultW: 6, defaultH: 4, minW: 3, minH: 2`) with a placeholder table component
- [x] 10.4 Create `src/demo/DashboardDemo.tsx` that renders `<DashboardGrid>` with a widget picker button for each registered type and 2–3 pre-placed widgets

## 11. End-to-End Verification

- [x] 11.1 Manually verify UC-01: drag a widget to a new position and confirm layout updates
- [x] 11.2 Manually verify UC-02: confirm widget snaps exactly to grid cells (no fractional positions)
- [x] 11.3 Manually verify UC-03: resize a widget and confirm min/max constraints and neighbour blocking
- [x] 11.4 Manually verify UC-04: add a widget via the picker; confirm placement at first available position
- [x] 11.5 Manually verify UC-05: remove a widget via ×; confirm undo toast; confirm cells are freed
- [x] 11.6 Verify persistence: reload the page and confirm layout is restored from localStorage
- [x] 11.7 Verify error placeholder: add a widget with an unregistered type and confirm other widgets are unaffected
