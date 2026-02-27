## 1. Project Setup

- [x] 1.1 Install `@dnd-kit/core` and pin to a minor version in `package.json`
- [x] 1.2 Create the `src/dashboard/` directory structure: `components/`, `hooks/`, `utils/`, `registry/`
- [x] 1.3 Add a barrel export at `src/dashboard/index.ts` exporting public API (`DashboardGrid`, `WidgetRegistry`, `useDashboardLayout`)

## 2. Types & Shared Utilities

- [x] 2.1 Define `LayoutItem` interface in `src/dashboard/types.ts` with fields `id`, `type`, `x`, `y`, `w`, `h`, `minW`, `minH`, `maxW`, `maxH`, `resizable`
- [x] 2.2 Define `RegistryEntry` interface and `WidgetProps` type in `src/dashboard/types.ts`
- [x] 2.3 Implement `snapToGrid(px, py, colWidth, rowHeight, item, columns)` in `src/dashboard/utils/snap.ts` — rounds to nearest cell and clamps to grid bounds
- [x] 2.4 Implement `overlaps(a: LayoutItem, b: LayoutItem): boolean` AABB function in `src/dashboard/utils/collision.ts`
- [x] 2.5 Implement `hasAnyOverlap(candidate, others: LayoutItem[]): boolean` using `overlaps` in `src/dashboard/utils/collision.ts`
- [x] 2.6 Implement `computeContainerHeight(layout, rowHeight): number` returning `maxOccupiedRow * rowHeight` with minimum of `1 * rowHeight` in `src/dashboard/utils/geometry.ts`
- [x] 2.7 Implement `itemToPixelRect(item, colWidth, rowHeight)` returning `{ left, top, width, height }` in `src/dashboard/utils/geometry.ts`
- [x] 2.8 Implement `findFirstAvailablePosition(layout, size, columns): { x, y } | null` scanning left-to-right, top-to-bottom in `src/dashboard/utils/layout.ts`
- [x] 2.9 Implement `pushDown(layout, resizedItem, maxDepth = 10): LayoutItem[] | null` recursive re-flow algorithm in `src/dashboard/utils/layout.ts` — returns `null` if re-flow is impossible within bounds or depth limit

## 3. Widget Registry

- [x] 3.1 Create `src/dashboard/registry/WidgetRegistry.ts` as a module-level singleton backed by a `Map<string, RegistryEntry>`
- [x] 3.2 Implement `WidgetRegistry.register(key, entry)` — validate `key`, `component`, `displayName`, and `defaultSize`; throw `RegistrationError` on any violation or duplicate key
- [x] 3.3 Implement `WidgetRegistry.get(key)` — return the `RegistryEntry` or `undefined`
- [x] 3.4 Implement `WidgetRegistry.list()` — return all registered entries as an array
- [x] 3.5 Define and export `RegistrationError` class extending `Error` in `src/dashboard/registry/RegistrationError.ts`
- [x] 3.6 Export `WidgetRegistry.__reset()` for test environments only (clears the internal map)

## 4. Grid Canvas

- [x] 4.1 Create `GridCanvas` component in `src/dashboard/components/GridCanvas.tsx` with `position: relative`, measured width, and computed height from `computeContainerHeight`
- [x] 4.2 Attach `ResizeObserver` to `GridCanvas` container ref to recompute `colWidth` on width changes; fall back to `window.resize` event if `ResizeObserver` is unavailable
- [x] 4.3 Derive and memoize `colWidth = containerWidth / columns` in `GridCanvas`
- [x] 4.4 Expose `colWidth` and `rowHeight` to child components via a `GridContext` (React context)

## 5. Dashboard Grid Component

- [x] 5.1 Create `DashboardGrid` component in `src/dashboard/components/DashboardGrid.tsx` accepting props: `layout`, `columns`, `rowHeight`, `onLayoutChange`
- [x] 5.2 Wrap `DashboardGrid` children in `@dnd-kit/core` `DndContext` with `onDragEnd` handler
- [x] 5.3 Render `GridCanvas` inside `DashboardGrid`, passing `columns`, `rowHeight`, and measured width
- [x] 5.4 Render one `WidgetWrapper` per `LayoutItem` inside `GridCanvas`
- [x] 5.5 Add prop-type validation for `columns` (positive integer) and `rowHeight` (positive number); log warnings and apply fallback defaults on invalid values

## 6. Widget Wrapper & Drag Handle

- [x] 6.1 Create `WidgetWrapper` component in `src/dashboard/components/WidgetWrapper.tsx` rendering with `position: absolute` at pixel rect from `itemToPixelRect`
- [x] 6.2 Call `useDraggable` from `@dnd-kit/core` in `WidgetWrapper`, attaching the drag sensor to a drag handle child element
- [x] 6.3 Render a visually distinct drag handle element inside `WidgetWrapper` (e.g., a grip icon in the widget header)
- [x] 6.4 Look up the widget's React component from `WidgetRegistry.get(item.type)` and render it inside `WidgetWrapper`; render an error boundary fallback if the type is unregistered

## 7. Drag Ghost & Drop Zone Feedback

- [x] 7.1 Create `DragGhost` component in `src/dashboard/components/DragGhost.tsx` using `DragOverlay` from `@dnd-kit/core`
- [x] 7.2 Compute the ghost's snapped `{ x, y }` from the current drag delta using `snapToGrid` and render the ghost at the corresponding pixel position
- [x] 7.3 Run `hasAnyOverlap` on the ghost's candidate position against all other layout items (excluding the dragged item) on every drag move
- [x] 7.4 Apply a green highlight class to the ghost cell range when the position is valid and a red highlight class when it is invalid

## 8. Drag-and-Drop Commit & Cancel

- [x] 8.1 In `DndContext.onDragEnd`, if the final snapped position is valid (no overlap), update the layout item's `{ x, y }` and call `onLayoutChange` with the new layout array
- [x] 8.2 In `DndContext.onDragEnd`, if the final position is invalid (overlap), restore the item to its original `{ x, y }` without calling `onLayoutChange`
- [x] 8.3 Handle `DndContext.onDragCancel` (triggered by Escape or pointer loss) by restoring the item to its original position without calling `onLayoutChange`
- [x] 8.4 Apply `opacity: 0.5` to the source `WidgetWrapper` while a drag is active and restore to full opacity on drag end or cancel

## 9. Widget Palette & Add/Remove

- [x] 9.1 Create `WidgetPalette` component in `src/dashboard/components/WidgetPalette.tsx` listing all entries from `WidgetRegistry.list()`
- [x] 9.2 On palette item selection, call `findFirstAvailablePosition` with the selected type's `defaultSize`; show a "dashboard full" notification if `null` is returned
- [x] 9.3 On successful position found, generate a unique instance `id` (e.g., `crypto.randomUUID()`), create a new `LayoutItem`, and call `onLayoutChange` with the appended layout
- [x] 9.4 If the selected widget type is not found in the registry, show an error notification and make no layout change
- [x] 9.5 Render a remove (close) button on each `WidgetWrapper`
- [x] 9.6 On remove button click, show a confirmation dialog displaying the widget's `displayName`
- [x] 9.7 On confirmation, filter the item from the layout and call `onLayoutChange` with the updated array; on cancel, close the dialog without changes

## 10. Resize Handle & Preview

- [x] 10.1 Create `ResizeHandle` component in `src/dashboard/components/ResizeHandle.tsx` positioned at the bottom-right corner of its parent `WidgetWrapper`
- [x] 10.2 Call `useDraggable` in `ResizeHandle` with a distinct drag id (`resize-<item.id>`) to separate resize drag events from move drag events
- [x] 10.3 Do not render `ResizeHandle` when `item.resizable === false`
- [x] 10.4 Create `ResizeGhost` component in `src/dashboard/components/ResizeGhost.tsx` rendering an inline border overlay on the widget during an active resize drag
- [x] 10.5 Compute the candidate `{ w, h }` from the resize drag delta using `snapToGrid` (pointer offset from widget top-left), clamped to `minW`/`minH`/`maxW`/`maxH` and grid boundary
- [x] 10.6 Update `ResizeGhost` dimensions in real time as the candidate `{ w, h }` changes during drag

## 11. Resize Commit & Cancel

- [x] 11.1 On resize drag end, call `pushDown` with the candidate layout; if it returns a valid layout, call `onLayoutChange` with the result
- [x] 11.2 If `pushDown` returns `null` (re-flow impossible), revert to the pre-resize layout and display a user-facing notification that the resize was refused
- [x] 11.3 On resize drag cancel (Escape or pointer loss), restore the widget to its original `{ w, h }` without calling `onLayoutChange`

## 12. `useDashboardLayout` Hook

- [x] 12.1 Create `useDashboardLayout(initialLayout?: LayoutItem[])` hook in `src/dashboard/hooks/useDashboardLayout.ts` managing layout state internally with `useState`
- [x] 12.2 Return `{ layout, onLayoutChange, addWidget, removeWidget }` from the hook so hosts can use it without wiring state manually

## 13. Tests

- [x] 13.1 Unit-test `snapToGrid` — cover rounding, left clamp, right clamp, and cancellation revert
- [x] 13.2 Unit-test `overlaps` — cover overlap, adjacency (no overlap), and containment cases
- [x] 13.3 Unit-test `hasAnyOverlap` — verify dragged item is excluded from comparison
- [x] 13.4 Unit-test `findFirstAvailablePosition` — cover empty grid, partially filled grid, and full grid (`null` result)
- [x] 13.5 Unit-test `pushDown` — cover single displacement, cascade displacement, depth-limit refusal, and boundary refusal
- [x] 13.6 Unit-test `WidgetRegistry.register` — cover valid registration, duplicate key error, empty key error, invalid component error, and non-positive size error
- [x] 13.7 Unit-test `WidgetRegistry.get` — cover hit and miss cases
- [x] 13.8 Component-test `DashboardGrid` — verify widgets render at correct pixel positions for a given layout
- [x] 13.9 Component-test drag-to-move — simulate drag to a valid cell and verify `onLayoutChange` is called with correct coordinates
- [x] 13.10 Component-test drag cancel — simulate Escape during drag and verify `onLayoutChange` is not called
- [x] 13.11 Component-test resize — simulate resize drag to a valid size and verify `onLayoutChange` is called with updated `w` and `h`
- [x] 13.12 Component-test add widget — simulate palette selection and verify a new layout entry appears in `onLayoutChange` output
- [x] 13.13 Component-test remove widget — simulate remove button + confirm and verify the item is absent from `onLayoutChange` output
