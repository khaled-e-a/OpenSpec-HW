## Context

The dashboard currently renders widgets in a static, fixed layout. Users have no way to rearrange or resize widgets without modifying source code. This design introduces a drag-and-drop interaction layer built on top of a CSS grid, backed by a layout state model that persists to `localStorage`. The implementation is entirely frontend — no backend, API, or database changes are needed.

Key constraints:
- React (functional components + hooks) is the rendering layer
- Layout must survive full page refreshes via `localStorage`
- Widgets can have variable sizes (e.g., 1×1, 2×1, 2×2, 3×2 grid columns × rows)
- The grid is finite (e.g., 12 columns × N rows); positions are expressed as `{ col, row, w, h }`
- No two widgets may overlap at any time

---

## Use Case Coverage

See `usecases.md` "Use Case Traceability Mapping" for the full step list.

| Use Case Step | Description | Design Section |
|---------------|-------------|----------------|
| UC1-S1 | User presses down on a widget and begins dragging it | Decision 1: DnD Library |
| UC1-S2 | System detects drag start and renders a drag ghost/preview at pointer position | Decision 2: Drag Overlay |
| UC1-S3 | System highlights grid cells the widget would occupy (snap preview) | Decision 3: Snap Preview |
| UC1-S4 | User moves the pointer to the desired grid area | Decision 1: DnD Library |
| UC1-S5 | System continuously updates snap preview to nearest valid grid position | Decision 3: Snap Preview |
| UC1-S6 | User releases the pointer to drop the widget | Decision 1: DnD Library |
| UC1-S7 | System snaps widget to nearest valid grid position and updates layout state | Decision 4: Layout State Model |
| UC1-S8 | System persists updated layout to local storage | Decision 5: Persistence |
| UC1-E3a1 | System shows snap preview in invalid/blocked state (target occupied) | Decision 6: Collision Detection |
| UC1-E3a2 | System does not allow drop at occupied position | Decision 6: Collision Detection |
| UC1-E6a1 | System cancels drag when pointer released outside grid boundary | Decision 7: Cancel / Escape Handling |
| UC1-E6a2 | Layout state remains unchanged after out-of-bounds drop | Decision 7: Cancel / Escape Handling |
| UC1-E6b1 | System cancels drag immediately on Escape key press | Decision 7: Cancel / Escape Handling |
| UC1-E6b2 | Widget animates back to its original position on cancel | Decision 8: Animation |
| UC1-E6b3 | Layout state remains unchanged after Escape cancel | Decision 7: Cancel / Escape Handling |
| UC2-S1 | User hovers resize handle; handle becomes visible/highlighted | Decision 9: Resize Handle |
| UC2-S2 | User presses down on handle and drags to resize | Decision 9: Resize Handle |
| UC2-S3 | System renders live size preview showing new grid span | Decision 3: Snap Preview |
| UC2-S4 | User drags to desired size | Decision 9: Resize Handle |
| UC2-S5 | User releases pointer to confirm new size | Decision 4: Layout State Model |
| UC2-S6 | System updates widget grid span and reflows surrounding widgets if needed | Decision 4: Layout State Model |
| UC2-S7 | System persists updated layout to local storage | Decision 5: Persistence |
| UC2-E4a1 | System caps resize at last valid non-overlapping size | Decision 6: Collision Detection |
| UC2-E4a2 | Preview reflects the capped size | Decision 3: Snap Preview |
| UC2-E4b1 | System enforces minimum size constraint (1×1 grid units) | Decision 6: Collision Detection |
| UC2-E4b2 | Widget cannot be resized below minimum | Decision 6: Collision Detection |
| UC2-E5a1 | System reverts widget to original size on out-of-bounds release | Decision 7: Cancel / Escape Handling |
| UC2-E5a2 | Layout state remains unchanged after invalid resize | Decision 7: Cancel / Escape Handling |
| UC3-S1 | System reads saved layout from local storage on mount | Decision 5: Persistence |
| UC3-S2 | System validates saved layout against current available widgets | Decision 5: Persistence |
| UC3-S3 | System renders each widget at its saved grid position and size | Decision 4: Layout State Model |
| UC3-S4 | User sees their previously arranged dashboard | Decision 4: Layout State Model |
| UC3-E1a1 | System renders default layout when no saved layout exists | Decision 5: Persistence |
| UC3-E2a1 | System discards stale widget entries from saved layout | Decision 5: Persistence |
| UC3-E2a2 | System renders remaining widgets at saved positions | Decision 5: Persistence |
| UC3-E2b1 | System logs warning and discards corrupt layout data | Decision 5: Persistence |
| UC3-E2b2 | System renders default layout when saved data is corrupt | Decision 5: Persistence |

### Unaddressed Use Case Steps
None — all 38 use case steps are covered by the decisions below.

---

## Goals / Non-Goals

**Goals:**
- Enable pointer-device drag-and-drop repositioning of widgets on a finite grid
- Enable drag-to-resize of widgets with live snap previews
- Enforce grid validity (no overlaps, respect boundaries and min/max sizes) at all times
- Persist and restore layout across page sessions via `localStorage`
- Provide clear visual feedback: drag ghost, snap highlight (valid/invalid), resize preview, cancel animation

**Non-Goals:**
- Touch/mobile-first gestures (touch events are a best-effort bonus, not a requirement)
- Server-side layout persistence or multi-user shared layouts
- Undo/redo history of layout changes
- Automated layout compaction (filling gaps automatically)
- Responsive breakpoints for the grid (fixed grid columns only)

---

## Decisions

### Decision 1: DnD Library — Use `@dnd-kit/core`
**Addresses**: UC1-S1 - User presses down on a widget and begins dragging it; UC1-S4 - User moves the pointer to the desired grid area; UC1-S6 - User releases the pointer to drop the widget

**Rationale**: `@dnd-kit/core` is a modern, accessible, headless drag-and-drop toolkit for React. It uses pointer events (not HTML5 drag API), which gives precise control over drag position at every frame — essential for computing snap targets. It is tree-shakeable, has no required CSS, and supports keyboard accessibility out of the box.

**Alternative Considered**: `react-dnd` — rejected because it relies on the HTML5 Drag API, which does not expose real-time pointer coordinates during drag (only `dragover` events on elements), making continuous snap-preview updates difficult. `react-beautiful-dnd` — rejected because it targets list reordering, not free 2D grid placement.

---

### Decision 2: Drag Overlay (Ghost)
**Addresses**: UC1-S2 - System detects drag start and renders a drag ghost/preview at pointer position

**Rationale**: Use `@dnd-kit`'s `<DragOverlay>` component to render a ghost copy of the dragged widget at the pointer position. The original widget slot on the grid is kept visible (greyed out) so the user can see where the widget came from. The ghost follows the pointer freely; snap quantisation happens only in the preview highlight layer (Decision 3), not in the ghost itself.

**Alternative Considered**: Hiding the original and moving it live — rejected because it causes layout reflow on every pointer move, harming performance.

---

### Decision 3: Snap Preview — Cell Highlight Computed from Pointer Position
**Addresses**: UC1-S3 - System highlights grid cells the widget would occupy (snap preview); UC1-S5 - System continuously updates snap preview to nearest valid grid position; UC2-S3 - System renders live size preview showing new grid span; UC2-E4a2 - Preview reflects the capped size

**Rationale**: During a drag, the pointer's document coordinates are converted to grid coordinates using the grid container's bounding rect:
```
snapCol = Math.round((pointerX - gridLeft) / cellWidth)
snapRow = Math.round((pointerY - gridTop) / cellHeight)
```
Clamped to grid bounds. The computed `{ col, row, w, h }` is passed to a `DropPreview` overlay component that absolutely-positions coloured highlight cells. Highlight colour:
- **Blue** = valid (no collision, within bounds)
- **Red** = invalid (collision detected or out of bounds)

This computation runs inside `onDragMove` (throttled with `requestAnimationFrame` to avoid jank).

---

### Decision 4: Layout State Model
**Addresses**: UC1-S7 - System snaps widget to nearest valid grid position and updates layout state; UC2-S5 - User releases pointer to confirm new size; UC2-S6 - System updates widget grid span and reflows surrounding widgets if needed; UC3-S3 - System renders each widget at its saved grid position and size; UC3-S4 - User sees their previously arranged dashboard

**Rationale**: Layout is modelled as a flat array:
```ts
type WidgetLayout = {
  id: string;       // matches widget id
  col: number;      // 0-indexed column (left edge)
  row: number;      // 0-indexed row (top edge)
  w: number;        // width in grid units (min 1)
  h: number;        // height in grid units (min 1)
};

type DashboardLayout = WidgetLayout[];
```
A `useDashboardLayout` hook owns this state. On `onDragEnd` / resize confirm, the hook computes the new layout entry, validates via the collision engine (Decision 6), and commits the update with `setState`. The grid renders widgets by mapping layout entries to CSS `grid-column` / `grid-row` inline styles (`grid-column: col+1 / span w`).

**Why flat array, not a 2D matrix**: The 2D matrix approach wastes memory and makes moves O(n²). The flat array is simpler to serialise, diff, and validate.

---

### Decision 5: Persistence — `localStorage` with Schema Validation
**Addresses**: UC1-S8 - System persists updated layout to local storage; UC2-S7 - System persists updated layout to local storage; UC3-S1 - System reads saved layout from local storage on mount; UC3-S2 - System validates saved layout against current available widgets; UC3-E1a1 - System renders default layout when no saved layout exists; UC3-E2a1 - System discards stale widget entries from saved layout; UC3-E2a2 - System renders remaining widgets at saved positions; UC3-E2b1 - System logs warning and discards corrupt layout data; UC3-E2b2 - System renders default layout when saved data is corrupt

**Rationale**: On every committed layout change, `useDashboardLayout` writes `JSON.stringify(layout)` to `localStorage` under a fixed key (e.g., `dashboard-layout-v1`). On mount, it reads and parses the stored value, then:
1. If missing → use `DEFAULT_LAYOUT` constant
2. If JSON parse fails → `console.warn(...)` + use `DEFAULT_LAYOUT`
3. If parse succeeds → filter to only entries whose `id` exists in the current widget registry (drops stale entries), then use the filtered result

A version suffix (`-v1`) in the key allows future breaking schema migrations without corrupting existing users' data.

**Alternative Considered**: `sessionStorage` — rejected because it does not persist across page refreshes, defeating the purpose.

---

### Decision 6: Collision Detection Engine
**Addresses**: UC1-E3a1 - System shows snap preview in invalid/blocked state (target occupied); UC1-E3a2 - System does not allow drop at occupied position; UC2-E4a1 - System caps resize at last valid non-overlapping size; UC2-E4b1 - System enforces minimum size constraint (1×1 grid units); UC2-E4b2 - Widget cannot be resized below minimum

**Rationale**: A pure function `isValidPlacement(layout, candidate, excludeId?)` checks:
1. `candidate.col >= 0 && candidate.col + candidate.w <= GRID_COLS` (within horizontal bounds)
2. `candidate.row >= 0` (within vertical origin; rows can grow downward)
3. `candidate.w >= 1 && candidate.h >= 1` (minimum size)
4. No overlap with any other widget in `layout` (excluding `excludeId` for the dragged widget itself):
   ```
   overlap = !(a.col+a.w <= b.col || b.col+b.w <= a.col ||
               a.row+a.h <= b.row || b.row+b.h <= a.row)
   ```
   AABB rectangle intersection test — O(n) per call.

This function is called:
- On every `onDragMove` frame to colour the snap preview
- In `onDragEnd` before committing the layout update (if invalid, drop is ignored)
- During resize drag to cap at the last valid size computed each frame

---

### Decision 7: Cancel and Escape Handling
**Addresses**: UC1-E6a1 - System cancels drag when pointer released outside grid boundary; UC1-E6a2 - Layout state remains unchanged after out-of-bounds drop; UC1-E6b1 - System cancels drag immediately on Escape key press; UC1-E6b3 - Layout state remains unchanged after Escape cancel; UC2-E5a1 - System reverts widget to original size on out-of-bounds release; UC2-E5a2 - Layout state remains unchanged after invalid resize

**Rationale**: `@dnd-kit` fires `onDragCancel` when the Escape key is pressed or when the drag ends without a valid droppable target. The `onDragEnd` handler receives a `delta` and an `over` target; if `over` is `null` or the computed position fails `isValidPlacement`, the layout is not mutated — the hook simply discards the pending update. No special cancellation state is needed; the layout remains at its pre-drag snapshot.

For resize: the hook tracks `resizeOriginal` (snapshot of the widget's `{ w, h }` at resize start). If the pointer releases outside valid bounds, `resizeOriginal` is restored.

---

### Decision 8: Cancel Animation
**Addresses**: UC1-E6b2 - Widget animates back to its original position on cancel

**Rationale**: Use CSS `transition: transform 200ms ease-out` on the widget element. During an active drag the widget's original grid slot is rendered as a placeholder (opacity 0.3). On cancel, `@dnd-kit`'s built-in drop animation runs the ghost back to the placeholder position using a `@dnd-kit/sortable`-compatible drop animation config. This requires no manual animation code.

---

### Decision 9: Resize Handle
**Addresses**: UC2-S1 - User hovers resize handle; handle becomes visible/highlighted; UC2-S2 - User presses down on handle and drags to resize; UC2-S4 - User drags to desired size

**Rationale**: Each `Widget` renders a `<div className="resize-handle">` absolutely positioned at the bottom-right corner. It is hidden by default (`opacity: 0`) and shown on widget hover via CSS (`:hover .resize-handle { opacity: 1 }`). Resize drag is handled as a separate pointer-capture interaction (independent of `@dnd-kit`): `pointerdown` on the handle → `setPointerCapture` → `pointermove` computes new `{ w, h }` from delta / cell size → `pointerup` commits or cancels. This keeps resize logic cleanly separated from reposition logic.

---

## Risks / Trade-offs

- **Performance on large grids**: Calling `isValidPlacement` on every `pointermove` frame is O(n) per widget. For dashboards with ≤ 50 widgets this is negligible. If grids grow larger, consider a 2D occupancy bitmap for O(1) lookups. → **Mitigation**: Throttle `pointermove` updates to one per `requestAnimationFrame`.

- **`localStorage` size limit (~5MB)**: Serialised layout for 100 widgets is ~10KB. Well within limits. → **Mitigation**: None needed now; future versions could compress with `lz-string` if needed.

- **Touch support**: `@dnd-kit` uses pointer events which work on touch screens, but the resize handle is small and may be hard to activate on mobile. → **Mitigation**: Increase touch target size via CSS padding; scope as known limitation for v1.

- **Stale layout on widget registry change**: If a developer removes a widget ID from the registry, the stored layout entry is silently dropped on next load. → **Mitigation**: Logged to console via the validation step (UC3-E2a1). Future: show a notification to the user.

---

## Migration Plan

This is a greenfield addition — no existing code paths are modified.

1. Install `@dnd-kit/core` and `@dnd-kit/utilities` as production dependencies
2. Add `DashboardGrid`, `Widget`, `DropPreview`, and `useDashboardLayout` to the component tree
3. Define `DEFAULT_LAYOUT` constant alongside widget registry
4. Ship behind a feature flag if needed; flag can be removed once stable

Rollback: remove the feature flag or revert the component additions. `localStorage` keys are namespaced (`dashboard-layout-v1`) and do not conflict with any existing data.

---

## Open Questions

1. **Grid dimensions**: How many columns and what cell pixel size should the default grid use? (12 columns × 80px cells is proposed; confirm with design team)
2. **Widget minimum/maximum sizes**: Are there per-widget min/max overrides, or a single global minimum of 1×1? (Spec should enumerate any widget-specific constraints)
3. **Row auto-growth**: Should the grid auto-add rows when a widget is dragged below the last row, or is the row count fixed? (Proposed: fixed rows for v1)
4. **Multi-dashboard support**: Is there one dashboard layout or multiple (e.g., per tab/page)? (Proposed: single layout with a single `localStorage` key for v1)
