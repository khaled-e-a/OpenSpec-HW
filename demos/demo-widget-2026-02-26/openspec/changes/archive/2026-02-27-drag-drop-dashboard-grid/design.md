## Context

The drag-and-drop dashboard grid is a new React subsystem with no existing implementation to migrate from. It introduces four tightly coupled capabilities (`grid-layout`, `widget-drag-drop`, `widget-registry`, `widget-resize`) that share a common layout state model and must interoperate seamlessly. The primary design challenges are: choosing a drag library that works on both mouse and touch without the limitations of the HTML5 DnD API, defining a layout state shape that all four capabilities can read and write consistently, and implementing overlap detection that is correct without being expensive.

## Goals / Non-Goals

**Goals:**
- Define the component structure, state model, and module boundaries for all four capabilities.
- Select a drag library and justify the choice.
- Specify how the layout state is owned, mutated, and surfaced to the host application.
- Define the collision-detection and resize re-flow algorithms.
- Establish the `WidgetRegistry` API contract.

**Non-Goals:**
- Persistence or serialisation of layout state (host application's responsibility).
- Undo/redo history.
- Multi-select or group drag.
- Server-side rendering support in the first iteration.
- Animated transitions between layout states.

## Decisions

### 1. Drag library: `@dnd-kit/core`

**Decision**: Use `@dnd-kit/core` as the pointer-event abstraction for both drag-to-move and drag-to-resize.

**Rationale**: The HTML5 Drag and Drop API has well-known limitations (no custom ghost styling without hacks, broken on iOS Safari, no pointer-offset control). `react-dnd` wraps HTML5 DnD and inherits these issues. `@dnd-kit/core` uses the Pointer Events API directly, giving us full control over ghost rendering, works on touch devices, and ships an accessible keyboard interaction model out of the box.

| Library | Touch | Custom ghost | Keyboard a11y | Bundle (min+gz) |
|---|---|---|---|---|
| HTML5 native | ✗ | ✗ | ✗ | 0 |
| react-dnd | partial | ✗ | ✗ | ~14 kB |
| **@dnd-kit/core** | **✓** | **✓** | **✓** | **~10 kB** |
| Pointer Events (custom) | ✓ | ✓ | manual | 0 |

Custom Pointer Events were rejected because the implementation cost (touch cancellation, scroll conflicts, multi-touch) exceeds the savings of removing the dependency.

---

### 2. Layout state shape

**Decision**: Layout is a flat `LayoutItem[]` array, owned by the host application via controlled-component pattern, and passed into `<DashboardGrid layout={…} onLayoutChange={…} />`.

```ts
interface LayoutItem {
  id: string;       // stable unique instance ID (host-generated)
  type: string;     // key in WidgetRegistry
  x: number;       // left edge in grid columns (0-indexed)
  y: number;       // top edge in grid rows (0-indexed)
  w: number;       // width in columns (≥ 1)
  h: number;       // height in rows (≥ 1)
  minW?: number;   // default 1
  minH?: number;   // default 1
  maxW?: number;   // default: columns
  maxH?: number;   // default: unbounded
}
```

The grid never mutates layout state internally. All changes are proposed via `onLayoutChange(newLayout: LayoutItem[])`. This makes the component fully controllable and easy to integrate with any state manager (useState, Redux, Zustand, etc.).

**Alternative rejected**: uncontrolled internal state with an `initialLayout` prop. Rejected because it makes serialisation and external manipulation (e.g., programmatic widget addition) awkward.

---

### 3. Grid geometry and rendering

**Decision**: Widgets are rendered with `position: absolute` inside a `position: relative` container div. The container's height is set to `maxOccupiedRow * rowHeight` (auto-expanding).

```
containerWidth = measured via ResizeObserver
colWidth       = containerWidth / columns
widget.left    = item.x * colWidth
widget.top     = item.y * rowHeight
widget.width   = item.w * colWidth
widget.height  = item.h * rowHeight
```

**Alternative rejected**: CSS Grid with `grid-column` / `grid-row` placement. Rejected because CSS Grid does not support overlapping ghost elements during drag and makes it harder to position the DnD ghost at an arbitrary pixel offset.

---

### 4. Snap-to-grid algorithm

**Decision**: Snap is applied at the point of pointer-to-grid mapping, not as a post-processing step.

```
snappedX = clamp(round(pointerX / colWidth),  0, columns - item.w)
snappedY = clamp(round(pointerY / rowHeight), 0, maxRows - item.h)
```

`pointerX` / `pointerY` are relative to the grid container's top-left corner, computed from the `@dnd-kit` delta plus the item's original pixel position. The ghost element tracks `snappedX * colWidth` / `snappedY * rowHeight`, creating the visible snap effect.

---

### 5. Collision detection

**Decision**: Axis-aligned bounding box (AABB) test in grid units, checked against all other layout items on every pointer-move event during drag and resize.

```ts
function overlaps(a: LayoutItem, b: LayoutItem): boolean {
  return !(
    a.x + a.w <= b.x || b.x + b.w <= a.x ||
    a.y + a.h <= b.y || b.y + b.h <= a.y
  );
}
```

This is O(n) per frame where n is the widget count. Dashboards typically have fewer than 50 widgets, so no spatial index is needed.

The ghost item is tested against every other item (excluding the dragged item itself). If any overlap is found, the drop zone is marked invalid.

---

### 6. Resize re-flow strategy

**Decision**: On resize, widgets displaced downward are pushed down by the minimum number of rows needed to eliminate overlap. If pushing any widget would exceed the grid's column boundary, the resize is refused and reverted.

**Algorithm** (runs after resize candidate `{ w, h }` is confirmed):
1. Compute the resized item's new bounding box.
2. For each other item that now overlaps the resized item, compute the required downward offset: `offset = (resizedItem.y + resizedItem.h) - overlapping.y`.
3. Apply the offset recursively (displaced items may in turn push others).
4. If any item's `y + h` would require a row beyond the last occupied row with no valid position (i.e., the item would be pushed off the right column boundary), abort and revert the resize.

**Alternative rejected**: Refuse all resizes that cause any overlap (simpler but too restrictive — users expect widgets to push aside like in react-grid-layout).

---

### 7. WidgetRegistry

**Decision**: Module-level singleton with a `Map<string, RegistryEntry>`. Exposed as a plain object with `register`, `get`, and `list` methods.

```ts
interface RegistryEntry {
  component: React.ComponentType<WidgetProps>;
  displayName: string;
  defaultSize: { w: number; h: number };
}

const WidgetRegistry = {
  register(key: string, entry: RegistryEntry): void { … },
  get(key: string): RegistryEntry | undefined { … },
  list(): RegistryEntry[] { … },
};
```

**Alternative considered**: React Context provider for the registry. Rejected for the initial iteration because it requires wrapping the application tree; the singleton is sufficient and can be tested by clearing the map between tests via an exported `__reset()` for test environments only.

---

### 8. Component tree

```
<DashboardGrid>          // owns DndContext, measures container
  <GridCanvas>           // position:relative container
    <WidgetWrapper>      // position:absolute, useDraggable, drag handle
      <ResizeHandle>     // useDraggable (resize sensor)
      <{WidgetComponent}/> // rendered from registry
    </WidgetWrapper>*
    <DragGhost>          // DragOverlay — renders snapped ghost during drag
    <ResizeGhost>        // inline preview border during resize
  </GridCanvas>
  <WidgetPalette>        // lists registry entries, triggers add
</DashboardGrid>
```

## Risks / Trade-offs

- **@dnd-kit version lock** → Pin to a minor version in package.json; the API is stable since v6.
- **Resize re-flow complexity** → The recursive push algorithm can produce surprising results for deeply nested widget stacks. Mitigation: cap recursion depth at 10 and refuse the resize if exceeded.
- **ResizeObserver not available** → Fall back to `window.resize` event at the cost of a one-frame layout delay. Acceptable for the first iteration.
- **No virtualization** → With >100 widgets, render performance may degrade. Mitigation: document a recommended maximum of 50 widgets and revisit with windowing if needed.
- **Controlled component pattern** → Host applications must wire up `onLayoutChange` correctly or the grid will appear frozen. Mitigation: provide a ready-made `useDashboardLayout` hook that manages state internally and can be used as a starting point.
