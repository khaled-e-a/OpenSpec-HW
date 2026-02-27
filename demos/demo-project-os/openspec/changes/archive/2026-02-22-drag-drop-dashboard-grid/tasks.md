## 1. Foundation — Types and Constants

- [x] 1.1 Create `src/components/dashboard/types.ts` — define `WidgetLayout` (`id`, `col`, `row`, `colSpan`, `rowSpan`) and `GridLayout` (array of `WidgetLayout`) TypeScript types
- [x] 1.2 Export `WIDGET_SIZES` constant from `types.ts` with `SMALL` (1×1), `WIDE` (2×1), `TALL` (1×2), and `LARGE` (2×2) presets

## 2. useGridLayout Hook

- [x] 2.1 Create `src/hooks/useGridLayout.ts` — accept `initialLayout`, optional `onLayoutChange`, and grid `columns`/`rows`
- [x] 2.2 Implement internal `useState` for layout; wire up controlled mode when `onLayoutChange` is provided
- [x] 2.3 Implement `buildOccupancyMap(layout, excludeId?)` — returns `Set<"col,row">` for all occupied cells, optionally excluding one widget by id
- [x] 2.4 Implement `moveWidget(id, col, row)` — updates the widget's position in layout state and calls `onLayoutChange` if provided
- [x] 2.5 Add `isOccupied(col, row, colSpan, rowSpan, excludeId)` helper — checks if any cell in the bounding box appears in the occupancy map
- [x] 2.6 Add widget size validation — return null (skip rendering) and emit `console.warn` for widgets whose `colSpan > columns` or `rowSpan > rows`

## 3. useDragDrop Hook

- [x] 3.1 Create `src/hooks/useDragDrop.ts` — accept `gridRef`, layout, `columns`, `rows`, `gap`, and an `onDrop(id, col, row)` callback
- [x] 3.2 Define drag state interface: `{ draggingId, originCol, originRow, targetCol, targetRow } | null`
- [x] 3.3 Implement `onPointerDown` handler on widgets — set `draggingId` + `originCol`/`originRow`, call `setPointerCapture` on the grid element
- [x] 3.4 Implement `onPointerMove` handler on the document — compute target cell using `getBoundingClientRect` and the cell-width formula from design.md; clamp to grid boundaries accounting for widget `colSpan`/`rowSpan`
- [x] 3.5 Implement `onPointerUp` handler — if pointer is inside the grid, validate collision via `isOccupied`; call `onDrop` on success or revert to origin on failure/outside-grid drop
- [x] 3.6 Implement Escape key `keydown` listener — cancel active drag and reset state to origin
- [x] 3.7 Clean up all event listeners on hook unmount

## 4. DashboardGrid Component

- [x] 4.1 Create `src/components/dashboard/DashboardGrid.tsx` — accept `columns` (default 12), `rows` (default 8), `gap` (default 8), `initialLayout`, `onLayoutChange`, and `children`
- [x] 4.2 Apply CSS grid styles: `display: grid`, `grid-template-columns: repeat(columns, 1fr)`, `grid-template-rows: repeat(rows, 1fr)`, `gap`
- [x] 4.3 Compose `useGridLayout` and `useDragDrop` hooks; pass `gridRef` to the container div
- [x] 4.4 Create `DashboardGridContext` — provide `dragState`, `onWidgetPointerDown`, and the resolved `layout` to child `Widget` components
- [x] 4.5 Render ghost placeholder div inside the grid when a drag is active — position using `grid-column` / `grid-row` matching `targetCol`/`targetRow` and the dragging widget's `colSpan`/`rowSpan`; style with semi-transparent background
- [x] 4.6 Filter out widgets whose size exceeds grid bounds (per `useGridLayout` validation) before rendering

## 5. Widget Component

- [x] 5.1 Create `src/components/dashboard/Widget.tsx` — accept `id`, `colSpan` (default 1), `rowSpan` (default 1), `draggable` (default true), and `children`
- [x] 5.2 Validate `colSpan` and `rowSpan` are positive integers; warn and default to 1 if not
- [x] 5.3 Read position from `DashboardGridContext` layout by `id`; apply `grid-column: col / span colSpan` and `grid-row: row / span rowSpan` as inline styles
- [x] 5.4 Attach `onPointerDown` from context to the widget div when `draggable` is true; do nothing when `draggable={false}`
- [x] 5.5 Apply `opacity: 0.5` when this widget's `id` matches the `draggingId` in context; restore to `opacity: 1` otherwise

## 6. Demo App

- [x] 6.1 Create `src/components/dashboard/DashboardDemo.tsx` — render a `DashboardGrid` with columns=6, rows=4
- [x] 6.2 Add four demo widgets using `WIDGET_SIZES`: one SMALL, one WIDE, one TALL, one LARGE with distinct background colors and labels
- [x] 6.3 Wire `onLayoutChange` in the demo to log the updated layout to console

## 7. Tests

- [x] 7.1 Unit test `buildOccupancyMap` — verify correct cell strings for single and multi-cell widgets, and correct exclusion of `excludeId`
- [x] 7.2 Unit test `isOccupied` — verify blocked and clear scenarios including self-overlap (excludeId)
- [x] 7.3 Unit test target cell computation logic — verify clamping at boundaries and correct cell mapping for mid-cell pointer positions
- [x] 7.4 Component test `DashboardGrid` — verify CSS grid styles applied with correct column/row counts and gap; verify default props
- [x] 7.5 Component test `Widget` — verify grid-column/grid-row placement for 1×1 and 2×2 widgets; verify opacity change when dragging
- [x] 7.6 Integration test drop success — simulate pointerdown, pointermove to valid cell, pointerup; verify layout updates and `onLayoutChange` called
- [x] 7.7 Integration test drop cancellation — simulate Escape during drag; verify widget reverts to original position
- [x] 7.8 Integration test collision — simulate drop onto occupied cell; verify widget reverts to original position
