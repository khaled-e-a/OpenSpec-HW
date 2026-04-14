## Context

This design covers the `widget-drag-drop` feature: a React dashboard where widgets of varying sizes can be dragged and repositioned/resized, snapping to a configurable grid. There is no prior dashboard implementation — this is net-new. The key constraints are preventing widget overlap, enforcing grid boundaries, and maintaining a serialisable layout state.

## Use Case Coverage

See usecases.md "Use Case Traceability Mapping" for the complete list of use case steps.
This design addresses the following use case steps:

- UC1-S1: User initiates drag on a widget → Drag Library Integration
- UC1-S2: System shows drag preview at original position → Drag Library Integration
- UC1-S3: User moves pointer across the grid → Grid Coordinate System
- UC1-S4: System highlights valid drop zones → Drop Zone Highlighting
- UC1-S5: User releases widget over a target grid cell → Snap-to-Grid Algorithm
- UC1-S6: System snaps widget to nearest valid grid position → Snap-to-Grid Algorithm
- UC1-S7: System updates layout state with new position → Layout State Model
- UC1-E5a: Target cell is occupied — system prevents drop with feedback → Collision Detection
- UC1-E5b: User cancels drag — system returns widget to original position → Drag Library Integration
- UC2-S1: User locates resize handle on widget → Resize Handle UI
- UC2-S2: User begins dragging resize handle → Resize Handle UI
- UC2-S3: System shows live resize preview → Resize Handle UI
- UC2-S4: User releases handle at desired size → Snap-to-Grid Algorithm
- UC2-S5: System snaps widget size to whole grid cell dimensions → Snap-to-Grid Algorithm
- UC2-S6: System checks for overlap with adjacent widgets → Collision Detection
- UC2-S7: System updates layout state with new size → Layout State Model
- UC2-E4a: Resize would overlap adjacent widget — system caps at boundary → Collision Detection
- UC2-E4b: Resize would exceed grid boundary — system constrains to grid edge → Grid Coordinate System
- UC2-E4c: User cancels resize — system restores original size → Drag Library Integration

### Unaddressed Use Case Steps
None — all 19 steps are covered by design decisions below.

## Goals / Non-Goals

**Goals:**
- Drag to reposition widgets on a grid with snap behaviour
- Resize widgets via drag handles with snap behaviour
- Prevent overlapping widgets and out-of-bounds positions
- Maintain serialisable layout state (array of `{ id, x, y, w, h }`)
- Show visual drag preview and valid/invalid drop zone feedback

**Non-Goals:**
- Persisting layout to a backend — state is in-memory (caller responsibility)
- Animated reflow of surrounding widgets when a new position is taken
- Touch / mobile support in the initial implementation
- Undo/redo history

## Decisions

### Decision 1: Drag Library — use `@dnd-kit/core`
**Addresses**: UC1-S1, UC1-S2, UC1-E5b, UC2-S2, UC2-E4c — drag initiation, preview, and cancellation
**Rationale**: `@dnd-kit/core` is headless and accessibility-friendly, gives full control over rendering, and has first-class pointer/touch sensors. It does not impose its own grid model, letting us own snap logic.
**Alternative Considered**: `react-grid-layout` — rejected because it bundles its own grid/snap model which conflicts with our requirement to own collision detection and layout state shape.

### Decision 2: Grid Coordinate System — integer cell coordinates
**Addresses**: UC1-S3, UC1-S6, UC2-E4b — pointer-to-cell mapping and boundary enforcement
**Rationale**: Each widget position is stored as `(x, y, w, h)` in grid-cell units (integers). Pixel coordinates are derived at render time from `cellSize` (configurable prop). Converting pointer offset to cell coordinates on every `dragMove` event gives the live snapping feel.
**Alternative Considered**: Pixel coordinates — rejected because floating-point positions make collision detection and serialisation harder.

### Decision 3: Snap-to-Grid Algorithm — round to nearest cell during drag
**Addresses**: UC1-S5, UC1-S6, UC2-S4, UC2-S5 — widget snaps on release and shows preview during drag
**Rationale**: On each drag delta, compute `candidateX = Math.round(pixelOffset.x / cellSize)`. Apply the same logic to width/height during resize. Show a ghost element at the candidate position during drag so the user sees the final snapped position before releasing.

### Decision 4: Collision Detection — AABB overlap check against layout array
**Addresses**: UC1-E5a, UC2-S6, UC2-E4a — prevent overlap on drop and during resize
**Rationale**: For each candidate `(x, y, w, h)`, iterate the layout array and check if any other widget's bounding box intersects using axis-aligned bounding box (AABB) test. If overlap detected: block drop (reposition) or cap size (resize). O(n) per drag event — acceptable for typical dashboard widget counts (< 50).
**Alternative Considered**: Spatial hash / quadtree — rejected as premature optimisation for the expected widget count.

### Decision 5: Drop Zone Highlighting — CSS class driven by collision result
**Addresses**: UC1-S4 — valid drop zones highlighted during drag
**Rationale**: During drag, the candidate cell is computed continuously. If no collision, highlight the candidate zone with a "valid" CSS class (green tint). If collision, apply "invalid" class (red tint). No separate hit-testing pass needed — reuse the collision detection result from Decision 4.

### Decision 6: Layout State Model — flat array of widget descriptors
**Addresses**: UC1-S7, UC2-S7 — state updated after successful drop or resize
**Rationale**: Layout state shape: `LayoutItem[] = { id: string; x: number; y: number; w: number; h: number }[]`. The `Dashboard` component owns this state and passes it down; the caller receives updates via an `onLayoutChange` callback. This keeps the component controllable (works as both controlled and uncontrolled).

### Decision 7: Resize Handle UI — absolutely positioned corner handle
**Addresses**: UC2-S1, UC2-S2, UC2-S3 — user locates and drags resize handle with live preview
**Rationale**: A small drag handle rendered at the bottom-right corner of each widget. Using `@dnd-kit`'s `useDraggable` on the handle with a separate drag context (or a modifier) isolates resize events from move events. The handle emits `onResizeDelta` which the grid converts to a new `(w, h)` candidate.

## Risks / Trade-offs

- **Performance during drag** — Collision detection runs on every pointer move. For very large layouts (> 100 widgets) this could jank. → Mitigation: debounce candidate computation to animation frames using `requestAnimationFrame`.
- **Resize handle discoverability** — A small corner handle may be missed by users. → Mitigation: Show handle on hover; add ARIA label for accessibility.
- **State divergence if caller ignores `onLayoutChange`** — Component behaves incorrectly if used uncontrolled without initial state. → Mitigation: Provide sensible default state and document controlled/uncontrolled usage in props.

## Migration Plan

Net-new feature — no migration required. Add `@dnd-kit/core` and `@dnd-kit/utilities` to dependencies. Export `Dashboard`, `DashboardGrid`, and `DraggableWidget` from the package index.

## Open Questions

- Should the grid column count and cell size be runtime props or compile-time constants? (Assume runtime props for flexibility.)
- Should the `Dashboard` component support an `initialLayout` prop for uncontrolled usage? (Assume yes.)
