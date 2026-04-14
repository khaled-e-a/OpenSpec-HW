## 1. Project Setup

- [x] 1.1 Create `src/components/` directory structure: `DashboardGrid`, `Widget`, `GhostWidget`, `GridLines`, `ResizeHandle`
- [x] 1.2 Create `src/hooks/` directory for `useDashboard`, `useDrag`, `useResize`
- [x] 1.3 Create `src/registry/` directory for the `WidgetRegistry` module
- [x] 1.4 Define shared TypeScript types in `src/types.ts`: `WidgetDescriptor`, `GridConfig`, `Layout`

## 2. Widget Registry (`widget-registery`)

- [x] 2.1 Create `src/registry/WidgetRegistry.ts` with a module-level `Map<string, React.ComponentType>` as the store
- [x] 2.2 Implement `register(typeKey, Component)`: validate non-empty string key, validate React component, warn and overwrite on duplicate, throw on invalid input
- [x] 2.3 Implement `resolve(typeKey)`: return the component or `undefined` if not found
- [x] 2.4 Write unit tests for `register`: valid input, empty key throws, non-string key throws, non-component throws, duplicate key overwrites with warning
- [x] 2.5 Write unit tests for `resolve`: known key returns component, unknown key returns `undefined`

## 3. Layout State Hook (`grid-layout` foundation)

- [x] 3.1 Create `src/hooks/useDashboard.ts` accepting initial `Layout` and `GridConfig`
- [x] 3.2 Implement `buildOccupancyMap(layout)`: returns `Map<"x,y", widgetId>` covering all cells occupied by each widget
- [x] 3.3 Implement `isAreaFree(occupancyMap, x, y, w, h, excludeId?)`: returns `true` if all cells in the rectangle are unoccupied (ignoring `excludeId`)
- [x] 3.4 Implement `resolveConflicts(layout)`: detect overlapping widgets on load and shift conflicting widgets downward to the next free row
- [x] 3.5 Implement `updateWidgetPosition(id, x, y)` and `updateWidgetSpan(id, w, h)` state updaters exposed by `useDashboard`
- [x] 3.6 Write unit tests for `buildOccupancyMap`: single widget, multiple non-overlapping, verify all cells covered
- [x] 3.7 Write unit tests for `isAreaFree`: free area returns true, occupied area returns false, excludeId exemption works
- [x] 3.8 Write unit tests for `resolveConflicts`: overlapping pair shifts second widget; non-overlapping layout unchanged

## 4. Grid Container and Grid Lines (`grid-layout`)

- [x] 4.1 Create `src/components/GridLines.tsx`: render column and row guides using CSS Grid with `pointer-events: none`
- [x] 4.2 Create `src/components/DashboardGrid.tsx`: `position: relative` container; accept `config: GridConfig`, `layout: Layout`, `onLayoutChange` prop
- [x] 4.3 Implement pixel-position computation in `DashboardGrid`: derive `left`, `top`, `width`, `height` per widget from grid coords and `GridConfig`
- [x] 4.4 Render `GridLines` as first child of `DashboardGrid`
- [x] 4.5 Render each widget in `layout` as an absolutely-positioned `Widget` inside `DashboardGrid`
- [x] 4.6 Render the empty-state placeholder when `layout` is empty
- [x] 4.7 Call `resolveConflicts` on `layout` before first render and pass resolved layout to `onLayoutChange`
- [x] 4.8 Write tests: correct pixel positions for sample grid coords, empty layout renders placeholder, overlapping initial layout is auto-corrected

## 5. Widget Shell (`grid-layout` + registry rendering)

- [x] 5.1 Create `src/components/Widget.tsx`: `position: absolute`, styled with computed pixel rect, renders drag handle, resolved content component, and resize handle
- [x] 5.2 Implement error boundary inside `Widget`: catch render errors from the resolved component and display an error tile for that widget only
- [x] 5.3 Render fallback error tile (with `descriptor.type` label and console warning) when `WidgetRegistry.resolve(type)` returns `undefined`
- [x] 5.4 Pass `widgetId`, `config`, and grid-position props to the resolved component
- [x] 5.5 Write tests: registered type renders component, unregistered type renders error tile with label, component render error renders error tile without affecting siblings

## 6. Ghost Widget

- [x] 6.1 Create `src/components/GhostWidget.tsx`: absolutely-positioned semi-transparent overlay rendered as a sibling inside `DashboardGrid`
- [x] 6.2 Accept `x`, `y`, `w`, `h`, and `mode` (`"drag"` | `"resize"`) props; compute pixel rect identically to `Widget`
- [x] 6.3 Implement shake animation CSS class toggled when an invalid drop or resize is signalled
- [x] 6.4 Render `GhostWidget` only when `dragState` or `resizeState` is active in `useDashboard`

## 7. Drag and Drop (`widget-drag-drop`)

- [x] 7.1 Create `src/hooks/useDrag.ts`: accept `gridConfig`, `occupancyMap`, `onCommit`, `onCancel` callbacks
- [x] 7.2 Implement `onPointerDown` on the drag handle: record pointer offset from widget origin, call `setPointerCapture`, set drag state
- [x] 7.3 Implement `onPointerMove`: compute snapped grid cell from pointer position and drag offset; clamp to grid boundaries; update ghost position
- [x] 7.4 Implement `onPointerUp`: call `isAreaFree` for the snapped target; if free, call `onCommit(id, x, y)`; if occupied, trigger ghost shake and call `onCancel`
- [x] 7.5 Implement Escape key handler during active drag: call `onCancel`, clear drag state, remove ghost
- [x] 7.6 Reduce real widget opacity to 0.4 during active drag; restore on commit or cancel
- [x] 7.7 Write tests: ghost appears on drag start, ghost snaps to nearest cell, ghost clamps at grid edge, valid drop commits position, occupied drop triggers shake and cancels, Escape restores original position

## 8. Resize (`widget-resize`)

- [x] 8.1 Create `src/components/ResizeHandle.tsx`: small corner grip element rendered inside `Widget`, hidden when a drag is active
- [x] 8.2 Create `src/hooks/useResize.ts`: accept `gridConfig`, `occupancyMap`, `onCommit`, `onCancel`
- [x] 8.3 Implement `onPointerDown` on the resize handle: record current `w`/`h` baseline, call `setPointerCapture`, set resize state
- [x] 8.4 Implement `onPointerMove`: compute new `w`/`h` from pointer delta; snap to whole cells; clamp to min 1×1 and grid boundary; update ghost overlay size
- [x] 8.5 Implement `onPointerUp`: call `isAreaFree` for the new span; if free, call `onCommit(id, w, h)`; if occupied, trigger ghost shake and call `onCancel`
- [x] 8.6 Implement Escape key handler during active resize: call `onCancel`, restore original span, remove ghost overlay
- [x] 8.7 Write tests: ghost appears on resize start, ghost snaps to whole-cell span, span clamped at min 1×1, span clamped at grid boundary, valid resize commits new span, occupied resize triggers shake and cancels, Escape restores original span

## 9. Integration and Wiring

- [x] 9.1 Wire `useDrag` callbacks into `DashboardGrid`: pass `updateWidgetPosition` as `onCommit` and identity restore as `onCancel`
- [x] 9.2 Wire `useResize` callbacks into `DashboardGrid`: pass `updateWidgetSpan` as `onCommit`
- [x] 9.3 Ensure only one interaction (drag or resize) can be active at a time; block the other while one is in progress
- [x] 9.4 Expose `DashboardGrid`, `WidgetRegistry` (register/resolve), and `WidgetDescriptor`/`GridConfig` types as the public API from `src/index.ts`
- [x] 9.5 Write an integration test: mount `DashboardGrid` with two widgets, simulate drag of widget 1 to a free cell, verify layout state updated; simulate drag to occupied cell, verify layout unchanged

## 10. Styles

- [x] 10.1 Create `src/components/DashboardGrid.css` (or CSS module): grid container base styles, relative positioning
- [x] 10.2 Add `GridLines` styles: thin lines at column/row intervals, low opacity, `pointer-events: none`
- [x] 10.3 Add `Widget` styles: absolute positioning, border, overflow hidden, cursor grab on drag handle
- [x] 10.4 Add `GhostWidget` styles: semi-transparent fill, dashed border, `pointer-events: none`
- [x] 10.5 Add `ResizeHandle` styles: corner grip icon, `cursor: se-resize`
- [x] 10.6 Add shake keyframe animation for invalid drop/resize feedback
