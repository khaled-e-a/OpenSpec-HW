## Context

The project needs a dashboard grid where users can drag variable-sized widgets and reposition them freely. There is no existing drag-and-drop infrastructure in the codebase. This design introduces two new React components (`DashboardGrid`, `DraggableWidget`), a grid geometry utility module, and a dependency on `@dnd-kit/core`. No backend or API changes are required. Layout state lives in the React component tree.

---

## Use Case Coverage

See `usecases.md` "Use Case Traceability Mapping" for the complete step list. This design addresses each step as follows:

| Use Case Step | Description | Design Section |
|---------------|-------------|----------------|
| UC1-S1 | User initiates drag by pressing and holding a widget | Decision 2: Drag Library Choice |
| UC1-S2 | System lifts widget visually, shows drag preview at original size, highlights grid | Decision 3: Drag Overlay & Visual Feedback |
| UC1-S3 | User moves pointer across the grid canvas | Decision 2: Drag Library Choice |
| UC1-S4 | System continuously snaps drag preview to nearest valid grid cell(s) as pointer moves | Decision 4: Snap-to-Grid Algorithm |
| UC1-S5 | User releases widget over a target grid area | Decision 2: Drag Library Choice |
| UC1-S6 | System validates target cells are unoccupied and within grid bounds | Decision 5: Collision & Bounds Detection |
| UC1-S7 | System places widget at snapped target position and updates layout state | Decision 1: Layout State Model |
| UC1-S8 | User sees widget settled in new position; all others remain in place | Decision 1: Layout State Model |
| UC1-E5a | User releases widget outside grid canvas boundary | Decision 5: Collision & Bounds Detection |
| UC1-E5a1 | System returns widget to original position with smooth animation; layout unchanged | Decision 3: Drag Overlay & Visual Feedback |
| UC1-E6a | Target cells partially or fully occupied by another widget | Decision 5: Collision & Bounds Detection |
| UC1-E6a1 | System rejects drop and returns dragged widget to original position | Decision 5: Collision & Bounds Detection |
| UC1-E6a2 | System shows visual cue (red highlight) on blocked cells during drag | Decision 3: Drag Overlay & Visual Feedback |
| UC1-E6a3 | Layout state unchanged after rejected drop | Decision 1: Layout State Model |
| UC1-E6b | Target cells would place widget partially outside grid bounds | Decision 5: Collision & Bounds Detection |
| UC1-E6b1 | System treats position as invalid and returns widget to original position | Decision 5: Collision & Bounds Detection |
| UC2-S1 | System receives initial layout configuration with widget sizes and grid coordinates | Decision 1: Layout State Model |
| UC2-S2 | System renders DashboardGrid canvas divided into equal-sized cells | Decision 6: Grid Rendering |
| UC2-S3 | System renders each DraggableWidget occupying its specified cell span at correct grid position | Decision 6: Grid Rendering |
| UC2-S4 | User sees all widgets displayed without overlap, each proportional to declared size | Decision 6: Grid Rendering |
| UC2-E3a | Two widgets in initial config overlap — first rendered in conflict position, second moved to nearest available | Decision 1: Layout State Model |
| UC2-E3b | Widget declared outside grid bounds — system clamps it to fit within boundary | Decision 5: Collision & Bounds Detection |

### Unaddressed Use Case Steps
None — all 22 steps are covered by the decisions below.

---

## Goals / Non-Goals

**Goals:**
- Provide a `DashboardGrid` component accepting an initial layout configuration
- Provide a `DraggableWidget` component supporting configurable column/row spans (e.g. 1×1, 2×1, 2×2, 3×2)
- Snap dragged widgets to the nearest valid grid cell on drop
- Prevent widget overlap and out-of-bounds placement; return widget to origin on invalid drop
- Show live visual feedback during drag: ghost overlay, grid cell highlights, conflict indicators
- Keep layout state in React (local or lifted); no persistence layer required

**Non-Goals:**
- Server-side persistence of layouts
- Widget resizing (size is fixed at configuration time)
- Animated reflow of other widgets when a gap is left (no auto-compact)
- Touch/mobile support in the initial implementation
- Undo/redo history

---

## Decisions

### Decision 1: Layout State Model
**Addresses**: UC1-S7 - System places widget at snapped target position and updates layout state; UC1-S8 - User sees widget settled in new position; UC2-S1 - System receives initial layout configuration; UC2-E3a - Overlap in initial config resolved to nearest available position

**Rationale**: Layout is modelled as an array of `WidgetLayout` objects:
```ts
type WidgetLayout = {
  id: string;
  x: number;   // grid column (0-indexed)
  y: number;   // grid row (0-indexed)
  w: number;   // column span
  h: number;   // row span
};
```
`DashboardGrid` owns this state via `useState` (or accepts it as a controlled prop with `onLayoutChange`). On drop, the state array is updated immutably. On invalid drop, state is left untouched. On initial mount with overlapping configs, the layout resolver places the conflicting widget at the nearest free position.

**Alternative Considered**: Using a 2D occupancy matrix as primary state — rejected because the array model is easier to serialize and diff; the occupancy matrix is derived on-the-fly for lookups.

---

### Decision 2: Drag Library Choice — `@dnd-kit/core`
**Addresses**: UC1-S1 - User initiates drag by pressing and holding; UC1-S3 - User moves pointer across grid canvas; UC1-S5 - User releases widget over target grid area

**Rationale**: `@dnd-kit/core` is chosen over `react-grid-layout` and `react-beautiful-dnd` for the following reasons:
- Lightweight and modular — only the primitives needed are imported
- Fully accessible (keyboard and pointer events handled correctly)
- Does not prescribe a layout model, giving us freedom to implement custom snapping and collision logic
- Active maintenance and TypeScript-first API

`useDraggable` is applied to each `DraggableWidget`; `useDroppable` is applied to individual grid cells (or the grid container with pointer-position math). The `DndContext` wraps `DashboardGrid`.

**Alternative Considered**: `react-grid-layout` — provides snap/collision out of the box but imposes its own layout model, making it harder to customise visual feedback and collision behaviour to our spec.

---

### Decision 3: Drag Overlay & Visual Feedback
**Addresses**: UC1-S2 - System lifts widget visually, shows drag preview at original size, highlights grid; UC1-E5a1 - System returns widget to original position with smooth animation; UC1-E6a2 - System shows red highlight on blocked cells during drag

**Rationale**:
- `@dnd-kit`'s `DragOverlay` renders a portal-based clone of the dragged widget at cursor position — this produces the "lifted" visual without affecting DOM layout.
- During drag, the `onDragMove` event recalculates the snapped target cell. The grid renders a highlight overlay on the projected cell(s): green if free, red if occupied or out-of-bounds.
- On invalid drop (`onDragEnd` with no valid target), the `DragOverlay` animate-returns via a CSS transition (`transform` with `transition: transform 200ms ease`). The original cell retains its widget throughout the drag, so no flicker occurs.

---

### Decision 4: Snap-to-Grid Algorithm
**Addresses**: UC1-S4 - System continuously snaps drag preview to nearest valid grid cell(s) as pointer moves

**Rationale**: During `onDragMove`, the pointer offset relative to the grid container is converted to a cell coordinate:
```
cellX = Math.round((pointerX - gridOriginX) / cellWidth)
cellY = Math.round((pointerY - gridOriginY) / cellHeight)
```
The snapped position is then clamped to `[0, cols - w]` × `[0, rows - h]` to prevent out-of-bounds previews. This pure calculation lives in `gridGeometry.ts` and is decoupled from React, making it trivially testable. The result is stored in a `dragState` ref (not state) to avoid re-renders on every pointer move — the grid highlight overlay reads from this ref via a separate render tick using `requestAnimationFrame`.

---

### Decision 5: Collision & Bounds Detection
**Addresses**: UC1-S6 - System validates target cells unoccupied and within bounds; UC1-E5a - Drop outside grid boundary; UC1-E6a/6a1 - Occupied cells → reject drop; UC1-E6b/6b1 - Out-of-bounds placement → reject; UC2-E3b - Initial config clamps to boundary

**Rationale**: A derived occupancy set is computed from the layout array:
```ts
function buildOccupancySet(layout: WidgetLayout[], excludeId?: string): Set<string> {
  // returns Set of "x,y" strings for all occupied cells, optionally skipping one widget
}
```
On drop attempt, `isValidPlacement(layout, candidate, gridCols, gridRows)` checks:
1. `candidate.x >= 0 && candidate.x + candidate.w <= gridCols`
2. `candidate.y >= 0 && candidate.y + candidate.h <= gridRows`
3. None of the candidate's cells appear in the occupancy set (excluding the widget being dragged)

If any check fails, the drop is rejected and the layout is unchanged. This function also lives in `gridGeometry.ts`.

For the initial config overlap case (UC2-E3a), a `resolveLayout` function iterates widgets in order, placing each at its declared position if valid, or scanning for the nearest free top-left cell otherwise. A console warning is emitted.

---

### Decision 6: Grid Rendering
**Addresses**: UC2-S2 - System renders DashboardGrid canvas divided into equal-sized cells; UC2-S3 - System renders each DraggableWidget at correct span and position; UC2-S4 - User sees widgets without overlap

**Rationale**: `DashboardGrid` renders as a CSS Grid container:
```css
display: grid;
grid-template-columns: repeat(var(--cols), var(--cell-size));
grid-template-rows: repeat(var(--rows), var(--cell-size));
```
Each `DraggableWidget` is positioned using `grid-column` and `grid-row` shorthand:
```css
grid-column: <x+1> / span <w>;
grid-row:    <y+1> / span <h>;
```
This approach is purely declarative and requires no absolute positioning math. Cell size defaults to `100px` but is configurable via a `cellSize` prop. Background grid lines are rendered via a separate `GridLines` SVG overlay (or CSS `background-image` repeating gradient) — purely visual, not interactive.

---

## Risks / Trade-offs

- **Performance on large grids** → Occupancy set is rebuilt on each drag move event. For grids larger than ~50×50 with 100+ widgets, this may be slow. Mitigation: memoize with `useMemo`; only recompute when layout changes, not on pointer move.
- **`@dnd-kit` accessibility defaults** → Screen readers will announce drag interactions. Ensure `aria-label` props are set on each widget. Mitigation: document required props in the component API.
- **CSS Grid browser support** → All modern browsers; IE11 is not supported. Acceptable given the project's browser matrix.
- **No touch support initially** → `@dnd-kit` supports touch via `TouchSensor` but it requires additional UX consideration (long-press delay to distinguish scroll vs. drag). Mitigation: add a `TODO` comment in `DashboardGrid` for a follow-up.

---

## Migration Plan

1. Install dependency: `npm install @dnd-kit/core @dnd-kit/utilities`
2. Create `src/utils/gridGeometry.ts` with pure geometry/collision functions
3. Create `src/components/DashboardGrid.tsx` and `src/components/DraggableWidget.tsx`
4. Add a demo/story page rendering a sample layout (3-4 widgets of mixed sizes)
5. No changes to existing routes or components — this is additive only
6. Rollback: remove the two new components and uninstall the dependency; no existing code is touched

---

## Open Questions

- **Grid dimensions**: Should `cols` and `rows` be fixed props or dynamically sized to the container? Initial implementation uses fixed props; responsive sizing is a follow-up.
- **Controlled vs. uncontrolled**: Should `DashboardGrid` be fully controlled (parent owns layout state) or support uncontrolled mode (internal state only)? Initial implementation supports both via optional `layout` + `onLayoutChange` props (similar to React controlled/uncontrolled input pattern).
