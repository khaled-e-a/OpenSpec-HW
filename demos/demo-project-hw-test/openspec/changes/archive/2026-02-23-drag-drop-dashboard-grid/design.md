## Context

This is a greenfield React component library addition. There is no existing dashboard infrastructure to migrate. The grid must work as a self-contained set of components and hooks that a consuming application can drop in, with no assumptions about the host app's state management or styling system.

Key constraints from the proposal:
- Pointer-based drag with snap-to-grid
- No automatic widget reflow on drop (explicit placement only)
- Layout persistence across page refresh
- Four capabilities: `grid-layout`, `widget-drag-drop`, `widget-resize`, `widget-registry`

## Goals / Non-Goals

**Goals:**
- Provide a `DashboardGrid` component that renders widgets on a snap-to-cell grid
- Support drag-to-reposition and drag-to-resize with live preview
- Expose a clean data model (`WidgetLayout[]`) so the consuming app controls persistence
- Work in modern browsers (Chrome, Firefox, Safari, Edge) with mouse and touch
- Be accessible: keyboard-operable drag via `@dnd-kit` ARIA announcements

**Non-Goals:**
- Server-side persistence (out of scope; consumer owns the backend)
- Automatic reflow / compaction (widgets stay where placed)
- Mobile-first responsive breakpoints (grid is fixed-column, not fluid)
- Animation library integration (CSS transitions only)
- SSR / Next.js App Router compatibility in v1

---

## Decisions

### D1: Absolute Positioning over CSS Grid Flow

**Decision**: All widgets are positioned with `position: absolute` using computed `left / top / width / height` derived from grid coordinates.

**Rationale**: CSS Grid flow moves elements in document order, which conflicts with free drag placement. Absolute positioning decouples visual position from DOM order, letting us set any (col, row) without reflowing siblings. This is the same approach used by `react-grid-layout`.

**Alternatives considered**:
- CSS Grid with `grid-column` / `grid-row` — works for static layouts but causes layout flicker during drag because the browser recalculates flow on every pointer move.

---

### D2: @dnd-kit/core as the Drag-and-Drop Primitive

**Decision**: Use `@dnd-kit/core` for pointer/touch capture, drag overlay, and accessibility announcements. Implement snap logic ourselves on top of its `onDragMove` / `onDragEnd` callbacks.

**Rationale**: `@dnd-kit` provides pointer + touch unification, keyboard drag support (WCAG 2.1), and a `DragOverlay` portal that prevents z-index and overflow issues. It does not prescribe a layout model, so our grid math stays in our own code.

**Alternatives considered**:
- Raw `pointermove` / `pointerup` events — viable but requires reimplementing touch, keyboard, and accessibility from scratch.
- `react-beautiful-dnd` — deprecated and list-oriented; not suited for 2D grids.
- `react-grid-layout` — ships the full grid as a single opinionated library; we'd be wrapping a wrapper rather than building the capability ourselves.

---

### D3: Custom Pointer Events for Resize Handles

**Decision**: Resize handles use raw `pointerdown` / `pointermove` / `pointerup` events, not `@dnd-kit`.

**Rationale**: `@dnd-kit` models drag as "pick up item → place elsewhere"; resize is a continuous transform of a single item's bounds, which maps poorly to its sensor model. A dedicated `useResizeWidget` hook with `pointer capture` (`element.setPointerCapture`) is cleaner and avoids fighting the library.

---

### D4: React Context + useReducer for Layout State

**Decision**: A `LayoutContext` (React Context) backed by a `useReducer` holds the authoritative layout array. The `DashboardGrid` component accepts an optional `layout` / `onLayoutChange` pair for controlled usage, or manages state internally for uncontrolled usage.

**Rationale**: Avoids forcing consumers to adopt a specific state library (Zustand, Redux, etc.). The controlled/uncontrolled pattern mirrors how native React form elements work and is familiar to React developers.

**Alternatives considered**:
- Zustand store — adds a mandatory dependency; overkill for a standalone widget.
- Prop-drilling — too cumbersome once `Widget`, `DragOverlay`, and resize handles all need layout access.

---

### D5: Column-Fixed, Rows-Unlimited Grid Model

**Decision**: The grid has a fixed number of columns (e.g., 12 by default, configurable via `columns` prop) and grows vertically as needed. Row height is a fixed pixel value (`rowHeight` prop, default `80px`).

**Rationale**: A fixed column count maps directly to the familiar 12-column Bootstrap-style grid mental model. Infinite vertical scroll is natural for dashboards. Fixed row height keeps the math simple: `top = row * rowHeight`, `height = rowSpan * rowHeight`.

---

### D6: localStorage for Default Persistence

**Decision**: The `useDashboardPersistence(key)` hook serializes `WidgetLayout[]` to `localStorage` on every layout change and rehydrates on mount. Consumers can replace this with any storage backend by using controlled mode.

**Rationale**: Zero-config persistence for the common case. Consumers who need server sync simply use controlled mode (`layout` + `onLayoutChange`) and skip the hook.

---

## Architecture

```
src/
  components/
    DashboardGrid/
      DashboardGrid.tsx       # Root component; DndContext provider + absolute container
      GridBackground.tsx      # SVG or CSS grid lines (visual only)
      WidgetWrapper.tsx       # useDraggable + resize handle, positions widget absolutely
      DragPreview.tsx         # Snapped ghost shown during drag (via DragOverlay portal)
    Widget/
      Widget.tsx              # Content slot; header with drag handle + remove button
  hooks/
    useLayout.ts              # Layout CRUD: addWidget, moveWidget, resizeWidget, removeWidget
    useDragWidget.ts          # onDragMove snap math, onDragEnd commit
    useResizeWidget.ts        # Pointer-capture resize logic
    useDashboardPersistence.ts # localStorage read/write
  types/
    layout.ts                 # WidgetLayout, WidgetDefinition, GridConfig interfaces
  registry/
    widgetRegistry.ts         # Map<typeId, WidgetDefinition>
    registerWidget.ts         # registerWidget(id, definition) helper
```

**Layout data model**:
```ts
interface WidgetLayout {
  id: string;       // unique widget instance ID
  type: string;     // widget type key in registry
  x: number;        // column index (0-based)
  y: number;        // row index (0-based)
  w: number;        // column span (>= minW from definition)
  h: number;        // row span (>= minH from definition)
}
```

**Snap calculation** (in `useDragWidget`):
```
col = clamp(round((pointerX - gridLeft + scrollLeft) / cellWidth), 0, columns - widget.w)
row = clamp(round((pointerY - gridTop  + scrollTop)  / rowHeight), 0, maxRow)
```
Collision check: iterate `layout` items, reject if any item other than the dragged one overlaps `[col, row, col+w, row+h]`.

---

## Risks / Trade-offs

- **Performance with many widgets**: Each `pointermove` triggers a snap recalculation over all widgets (O(n) collision check). For n < 50 widgets this is negligible; beyond that, a spatial hash or interval tree could be added. → Mitigation: document the limit; optimize in a follow-up if needed.

- **Touch + resize conflict**: On touch devices, the resize handle is small and may be hard to hit. → Mitigation: enlarge the hit area (CSS `padding`) and document minimum touch target size (44×44 px per WCAG).

- **Controlled vs uncontrolled parity**: If `layout` prop changes externally while a drag is in progress, the in-flight drag state and the new prop can conflict. → Mitigation: freeze layout updates during active drag; apply external changes on `onDragEnd`.

- **localStorage quota**: Serialized layout for 100 widgets is ~5 KB — well within the 5 MB quota. Not a practical risk for typical dashboard use.

- **@dnd-kit version lock**: `@dnd-kit/core` v6 is stable but future major versions may have breaking API changes. → Mitigation: wrap `@dnd-kit` usage in `useDragWidget` so the surface area to update is contained.

---

## Migration Plan

This is a net-new feature with no migration needed. Deployment steps:

1. Publish `src/components/DashboardGrid` and `src/components/Widget` as part of the component library build
2. Consumer installs `@dnd-kit/core @dnd-kit/utilities` as peer dependencies
3. Consumer registers widget types via `registerWidget` and renders `<DashboardGrid>`
4. Rollback: remove the import — no other code is affected

---

## Open Questions

- **Q1**: Should the grid support nested grids (a widget that is itself a `DashboardGrid`)? → Defer to v2; not required by any UC.
- **Q2**: Should `removeWidget` require explicit confirmation UI, or should the consuming app own that? → Proposal UC-05 mentions a toast/undo; keeping that inside `Widget` for v1 to avoid requiring the consumer to wire up a notification system.
- **Q3**: What is the default column count and row height? → Proposed defaults: `columns=12`, `rowHeight=80`. Can be overridden per-instance.
