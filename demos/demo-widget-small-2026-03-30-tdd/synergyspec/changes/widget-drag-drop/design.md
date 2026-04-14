## Context

The dashboard currently renders widgets in fixed positions with no interactivity. Users cannot rearrange them, which forces a one-size-fits-all layout regardless of workflow. This design introduces a drag-and-drop grid system built in React that gives users full control over widget placement, with positions persisted automatically to `localStorage`.

The implementation is entirely client-side — no backend changes are required. The main complexity lies in (a) real-time snap-to-grid during drag, (b) collision/bounds detection at drop time, and (c) reliable serialisation/deserialisation of layout state.

---

## Use Case Coverage

See `usecases.md` "Use Case Traceability Mapping" for the complete step list. This design addresses all 19 steps:

| Use Case Step | Description | Design Section |
|---------------|-------------|----------------|
| UC1-S1 | User presses and holds a widget to initiate a drag | Decision 1: Drag Library |
| UC1-S2 | System lifts widget visually and displays ghost preview at current position | Decision 2: Drag Overlay & Preview |
| UC1-S3 | User moves the pointer across the grid | Decision 1: Drag Library |
| UC1-S4 | System snaps ghost preview to nearest valid grid cell(s) in real time | Decision 3: Snap-to-Grid Algorithm |
| UC1-S5 | User releases pointer over a target cell | Decision 1: Drag Library |
| UC1-S6 | System validates target position is within bounds and unoccupied | Decision 4: Collision & Bounds Detection |
| UC1-S7 | System places widget at snapped position and removes drag preview | Decision 2: Drag Overlay & Preview |
| UC1-S8 | System persists updated layout to localStorage | Decision 5: Layout Persistence |
| UC1-E3a | User moves pointer outside grid boundary — preview stays at last valid position | Decision 4: Collision & Bounds Detection |
| UC1-E6a | Target position is occupied — system shows conflict highlight and snaps widget back | Decision 4: Collision & Bounds Detection |
| UC1-E6b | Target position is out of bounds — treated as invalid, widget snaps back | Decision 4: Collision & Bounds Detection |
| UC1-E1a | User cancels drag (Escape) — preview discarded, widget returns to original position | Decision 1: Drag Library |
| UC2-S1 | System reads serialised layout from localStorage on page init | Decision 5: Layout Persistence |
| UC2-S2 | System validates stored layout (IDs and positions) | Decision 5: Layout Persistence |
| UC2-S3 | System renders each widget at its stored grid position | Decision 6: Component Architecture |
| UC2-S4 | User sees dashboard exactly as they left it | Decision 5: Layout Persistence |
| UC2-E1a | No stored layout — system renders default layout from props/config | Decision 5: Layout Persistence |
| UC2-E2a | Stored layout contains unknown widget ID — stale entry discarded, rest restored | Decision 5: Layout Persistence |
| UC2-E2b | Widget position out of current grid bounds — falls back to default layout for affected widget | Decision 5: Layout Persistence |

### Unaddressed Use Case Steps
None — all 19 steps are covered by the decisions below.

---

## Goals / Non-Goals

**Goals:**
- Enable pointer-based drag initiation on any widget
- Provide a real-time ghost/preview that snaps to valid grid cells during drag
- Detect and reject drops on occupied cells or out-of-bounds positions with visual feedback
- Commit widget to new position on successful drop; restore to origin on invalid/cancelled drop
- Serialise and restore full layout to/from `localStorage` automatically

**Non-Goals:**
- Server-side layout persistence (deferred to a future change)
- Touch/mobile drag support (pointer events only in this iteration)
- Widget resizing by drag (layout sizes are fixed per widget definition)
- Animated widget swap/reorder (snap-back only; no swap animation)
- Undo/redo history

---

## Decisions

### Decision 1: Drag Library — Use `@dnd-kit/core`
**Addresses**:
- UC1-S1 - User presses and holds a widget to initiate a drag
- UC1-S3 - User moves the pointer across the grid
- UC1-S5 - User releases pointer over a target cell
- UC1-E1a - User cancels drag (Escape) — preview discarded, widget returns to original position

**Rationale**: `@dnd-kit` is a modern, accessible, tree-shaken React drag-and-drop toolkit. It exposes `useDraggable` and `useDroppable` hooks that integrate cleanly with React state, handles pointer events natively, and fires an `onDragCancel` event for Escape-key cancellation — satisfying UC1-E1a without custom keyboard listeners. It also provides a `DragOverlay` portal for rendering the ghost outside the DOM flow (Decision 2).

**Alternative Considered**: `react-dnd` — Rejected because it requires a backend abstraction layer and has larger bundle weight; also less actively maintained.

**Alternative Considered**: Custom pointer-event handlers — Rejected because it would require reimplementing hit testing, cancel handling, and accessibility, all of which `@dnd-kit` provides out of the box.

---

### Decision 2: Drag Overlay & Preview
**Addresses**:
- UC1-S2 - System lifts widget visually and displays ghost preview at current position
- UC1-S7 - System places widget at snapped position and removes drag preview

**Rationale**: `@dnd-kit`'s `<DragOverlay>` renders the dragging widget into a portal at the root of the document. This avoids z-index stacking context issues and gives the appearance of the widget "lifting" above peers. The original cell is kept visible (dimmed or with a placeholder outline) so the user always knows where the widget started. On drop (valid or invalid), the overlay unmounts automatically.

**Implementation note**: The active drag widget is tracked in React state (`activeDragId`). When `activeDragId` is set, the original widget cell renders a placeholder; `DragOverlay` renders a clone of the widget. On `onDragEnd`, `activeDragId` is cleared regardless of outcome.

---

### Decision 3: Snap-to-Grid Algorithm
**Addresses**:
- UC1-S4 - System snaps ghost preview to nearest valid grid cell(s) in real time

**Rationale**: During drag, the pointer position (in pixels) is translated to a `(col, row)` grid coordinate using the grid container's bounding rect and cell size:

```
col = floor((pointerX - gridLeft) / cellWidth)
row = floor((pointerY - gridTop) / cellHeight)
```

This gives a discrete cell index that is then clamped to grid bounds and checked for collision (Decision 4). The `onDragMove` callback from `@dnd-kit` provides continuous pointer deltas; the snap target is derived on every move event and stored in `snapTarget` state, which drives the preview position.

**Cell size**: Configurable via a `cellSize` prop (default `100px`). Grid dimensions come from `cols` and `rows` props.

---

### Decision 4: Collision & Bounds Detection
**Addresses**:
- UC1-S6 - System validates target position is within bounds and unoccupied
- UC1-E3a - User moves pointer outside grid boundary — preview stays at last valid position
- UC1-E6a - Target position is occupied — system shows conflict highlight and snaps widget back
- UC1-E6b - Target position is out of bounds — treated as invalid, widget snaps back

**Rationale**: A pure-function `isValidPlacement(layout, widgetId, col, row, widgetW, widgetH, gridCols, gridRows)` checks two conditions:
1. **Bounds**: `col + widgetW <= gridCols && row + widgetH <= gridRows && col >= 0 && row >= 0`
2. **Collision**: No other widget in `layout` occupies any cell in the target bounding box

This function is called on every `onDragMove` to classify the current snap target as `valid` or `invalid`. The `DragOverlay` receives a `isConflict` prop that applies a red tint (UC1-E6a visual feedback).

On `onDragEnd`:
- If `isValidPlacement` returns `true` → commit new position to layout state.
- If `false` (or pointer released outside grid) → discard; widget stays at origin.

Out-of-bounds during move (UC1-E3a): when snap coordinates fall outside grid bounds, the last valid `snapTarget` is retained — the preview does not follow the cursor outside the grid.

---

### Decision 5: Layout Persistence
**Addresses**:
- UC1-S8 - System persists updated layout to localStorage
- UC2-S1 - System reads serialised layout from localStorage on page init
- UC2-S2 - System validates stored layout (IDs and positions)
- UC2-S3 - System renders each widget at its stored grid position
- UC2-S4 - User sees dashboard exactly as they left it
- UC2-E1a - No stored layout — system renders default layout from props/config
- UC2-E2a - Stored layout contains unknown widget ID — stale entry discarded, rest restored
- UC2-E2b - Widget position out of current grid bounds — falls back to default layout for affected widget

**Rationale**: Layout is stored as JSON in `localStorage` under a key derived from the dashboard instance (e.g., `dashboard-layout-v1`). A `useLayoutPersistence(storageKey, defaultLayout, widgetDefs, gridCols, gridRows)` custom hook handles the full lifecycle:

- **Read** (on mount): parse JSON; if missing/corrupt → use `defaultLayout`.
- **Validate**: filter out entries whose `widgetId` is not in `widgetDefs` (UC2-E2a); filter out entries whose position+size exceeds current grid bounds (UC2-E2b); save cleaned layout back.
- **Write** (after each drop): serialise and write synchronously (layout objects are small).

**Layout schema**:
```json
[
  { "widgetId": "string", "col": 0, "row": 0, "w": 2, "h": 1 }
]
```

Version field (`v1` in the key) enables safe schema migrations in future.

---

### Decision 6: Component Architecture
**Addresses**:
- UC2-S3 - System renders each widget at its stored grid position

**Rationale**: Three components with clear responsibilities:

| Component | Responsibility |
|-----------|----------------|
| `DashboardGrid` | Owns layout state, grid config props, persistence hook; renders the grid container and each `DraggableWidget`; hosts `DragOverlay` |
| `DraggableWidget` | Wraps a widget with `useDraggable`; renders placeholder when actively dragged |
| `GridDropZone` | Wraps the grid container with `useDroppable`; supplies bounding rect for snap calculations |

Layout state lives entirely in `DashboardGrid` and flows down as props — no external state manager required.

---

## Risks / Trade-offs

- **`localStorage` unavailable** (private browsing, storage quota exceeded) → The persistence hook wraps all `localStorage` calls in try/catch; on error, the in-memory layout is used and a console warning is emitted. No user-visible failure.
- **Performance on large grids** → Collision detection is O(n) per move event (n = number of widgets). For typical dashboards (< 20 widgets) this is negligible. If grids scale to hundreds of widgets, a sparse cell-occupancy bitmap would be needed.
- **Pointer events only** → Touch devices are not supported in this iteration. A future change should add touch sensor support via `@dnd-kit`'s `TouchSensor`.
- **No widget-swap on collision** → Widgets snap back on collision rather than swapping. This is simpler to implement and reason about, but some users may expect swap behaviour. Documented as a known limitation.

---

## Migration Plan

1. Install `@dnd-kit/core` and `@dnd-kit/utilities` (`npm install @dnd-kit/core @dnd-kit/utilities`).
2. Add `DashboardGrid`, `DraggableWidget`, `GridDropZone` components.
3. Replace existing static widget render with `<DashboardGrid>`.
4. Existing static layouts are provided as `defaultLayout` prop — no data migration needed.
5. `localStorage` key is versioned (`dashboard-layout-v1`); stale keys from any previous experiments are ignored.
6. Rollback: remove the new components and restore the static render — no persistent state is affected on the server.

---

## Open Questions

- Should `cellSize` be responsive (recalculate on window resize)? If so, layout positions need re-validation on resize — deferred to a follow-up.
- Should widget definitions (including `w`/`h`) be editable by the user in the future? If yes, layout schema should version widget sizes separately from positions.
