## Context

The dashboard grid is a greenfield React component system. There is no existing layout infrastructure to migrate from. The system must support variable-size widgets that users can freely drag and resize within a structured grid, with snap-to-cell behaviour and live ghost feedback. The design must avoid mandatory third-party drag libraries to keep the dependency footprint small, while remaining open to adopting one if native pointer events prove limiting.

All state is local to the dashboard component (no global store assumed). Layout persistence (e.g., localStorage or API) is out of scope for this change but must not be precluded by the architecture — the layout state shape must be serialisable.

---

## Goals / Non-Goals

**Goals:**
- Define the component tree, state shape, and data flow for the four capabilities
- Specify the coordinate model used for grid placement, drag, and resize
- Make key technical decisions (drag strategy, rendering approach, registry shape) with rationale
- Identify risks and open questions before implementation begins

**Non-Goals:**
- Line-by-line implementation (that belongs in tasks)
- Layout persistence / remote sync
- Undo/redo history
- Touch gesture support (pointer events cover touch, but gesture-specific UX is out of scope)
- Server-side rendering compatibility

---

## Decisions

### D-1: Absolute Positioning Inside a Relative Grid Container (not CSS Grid for widget placement)

**Decision**: The grid container is `position: relative`. Each widget is `position: absolute`, with pixel coordinates computed from grid cell coordinates at render time. Background grid lines are rendered separately with CSS Grid or SVG.

**Rationale**: CSS Grid auto-placement cannot be animated or overridden during drag without reflow artifacts. Absolute positioning allows widgets to move freely while dragging, then snap back to computed grid-aligned pixel positions on drop. Pixel coordinates are derived from `(col * cellWidth, row * cellHeight)` deterministically, keeping grid coordinates as the source of truth.

**Alternatives considered**:
- *CSS Grid for widget placement*: Natural fit for static layouts, but drag-during-reflow causes jitter. Cannot render a ghost at an arbitrary position while the real widget stays in its CSS Grid slot without duplicating DOM nodes.
- *Third-party layout library (react-grid-layout)*: Full-featured but large (>50 kB gzip), opinionated API, and would own the layout state shape — reducing our flexibility for the registry and resize UX.

---

### D-2: Native Pointer Events for Drag and Resize (no react-dnd or @dnd-kit)

**Decision**: Drag and resize both use `pointer events` (`pointerdown`, `pointermove`, `pointerup`) with `element.setPointerCapture(event.pointerId)` to track movement outside the element's bounds.

**Rationale**: Pointer events work for mouse, touch, and stylus without extra adapters. `setPointerCapture` eliminates the need for document-level listeners, avoiding memory leak risk. The dashboard grid is a contained surface, so the complexities that motivate `react-dnd` (cross-component drag, custom backends) do not apply here. Removes one runtime dependency entirely.

**Alternatives considered**:
- *@dnd-kit*: Excellent API, ~10 kB gzip, supports keyboard accessibility. Would be the right choice if drag behaviour needed to cross component or page boundaries, or if keyboard-nav drag becomes a requirement (see Open Questions).
- *HTML5 Drag API*: Does not support `setPointerCapture`, produces ghost images the browser controls, and has cross-browser inconsistencies on mobile.

---

### D-3: Layout State Shape

**Decision**: Layout state is an array of `WidgetDescriptor` objects managed by a `useDashboard` hook:

```ts
type WidgetDescriptor = {
  id: string;         // stable, unique widget instance ID
  type: string;       // registry key → resolves to a React component
  x: number;         // column index (0-based)
  y: number;         // row index (0-based)
  w: number;         // column span (≥ 1)
  h: number;         // row span (≥ 1)
  config?: unknown;  // widget-type-specific configuration, passed as props
};
```

Grid configuration is separate and stable:

```ts
type GridConfig = {
  columns: number;
  rowHeight: number;   // pixels
  gap: number;         // pixels between cells
};
```

**Rationale**: Flat, serialisable array is easy to persist, diff, and validate. Separating `GridConfig` from per-widget descriptors means the grid can be reconfigured without touching widget data. `config` is typed as `unknown` to avoid coupling the core layout to widget-specific schemas.

**Alternatives considered**:
- *Map<id, descriptor>*: Simpler lookup by id but breaks natural render order and requires ID-to-index bookkeeping for collision detection.
- *2D occupancy matrix as primary state*: Efficient for collision queries but redundant with descriptor positions, complex to serialise, and hard to iterate for rendering.

---

### D-4: Occupancy Map for Collision Detection

**Decision**: A 2D occupancy map (`Map<string, string>` where key is `"x,y"` and value is widget `id`) is derived from layout state on every render. Collision queries during drag/resize check this map in O(w×h) time per widget.

**Rationale**: Grid sizes in dashboard UIs are small (typically ≤ 24 columns, ≤ 50 rows). O(w×h) collision checks are negligible. A derived map avoids keeping a second piece of mutable state in sync. Computing it fresh on each layout change ensures correctness without cache invalidation logic.

---

### D-5: Widget Registry as Module Singleton

**Decision**: `WidgetRegistry` is a module-level `Map<string, React.ComponentType>` with `register(key, Component)` and `resolve(key)` functions, exported from a single module. No React Context is used for the registry itself.

**Rationale**: Widget types are registered once at application bootstrap and never change during a session. Using a module singleton avoids prop-drilling or provider nesting just to access the registry. Components that need to resolve a type call `resolve(key)` directly in their render path (or via a `useWidget(key)` hook that wraps it).

**Alternatives considered**:
- *React Context provider*: Adds indirection and a required `<WidgetRegistryProvider>` wrapper in every app. No benefit if the registry is write-once at startup.
- *Redux / Zustand slice*: Overkill for a static map of component references.

---

### D-6: Ghost as In-Grid Sibling Element

**Decision**: During drag and resize, a `GhostWidget` component is rendered as a sibling of the real widget inside the grid container. The ghost shows the snapped target position at a lower opacity. The real widget stays in its original position (opacity lowered) until drop.

**Rationale**: Keeping the ghost inside the grid container means it automatically clips to the grid boundary and inherits the same coordinate system. No `ReactDOM.createPortal` needed. The real widget remaining visible (dimmed) gives users a clear reference for where the widget came from.

**Alternatives considered**:
- *Portal ghost at document level*: Allows the ghost to float over any element, but requires translating pointer coordinates to grid-relative coordinates separately, and the ghost can escape the grid visually.
- *Move the real widget during drag*: Simpler, but causes layout reflow at every pointermove, which is expensive when other widgets must reflow around the moving one.

---

## Component Architecture

```
<DashboardGrid config={gridConfig} layout={layout} onLayoutChange={setLayout}>
  ├── <GridLines />                  // decorative column/row guides (CSS Grid or SVG)
  ├── <Widget id="w1" descriptor={…} onDragStart onResizeStart />
  │     ├── <DragHandle />
  │     ├── {resolvedComponent}      // from WidgetRegistry.resolve(type)
  │     └── <ResizeHandle />
  ├── <Widget id="w2" … />
  └── <GhostWidget />               // rendered only during drag or resize
```

**Data flow**: `DashboardGrid` owns layout state via `useDashboard`. Drag/resize interactions in child `Widget` components call callbacks that update the layout state in the parent. No state lives in individual `Widget` instances.

---

## Risks / Trade-offs

- **Pointer capture on mobile Safari** → `setPointerCapture` has historically had inconsistencies on iOS Safari < 16. Mitigation: test on Safari and fall back to document-level `pointermove` listener if capture is unreliable.

- **Performance at high widget count** → Absolute positioning and occupancy map recomputation on every `pointermove` may cause dropped frames if widget count exceeds ~50. Mitigation: debounce occupancy map recomputation; memoize non-moving widgets with `React.memo`.

- **No keyboard drag support** → Users who cannot use a pointer device cannot reposition widgets. This is a known accessibility gap (see Open Questions). Mitigation: ensure widgets are focusable and labeled so screen readers can at least read their content.

- **Layout state owned by consumer** → If the consumer forgets to persist layout state, the grid resets on page reload. Mitigation: document clearly that `onLayoutChange` must be wired to persistence. Optionally provide a `usePersistedLayout` convenience hook in a follow-up.

---

## Migration Plan

This is a greenfield addition with no existing code to migrate. Deployment steps:

1. Merge the new components and hooks behind no feature flag (no existing behaviour is modified)
2. Consumer apps integrate `<DashboardGrid>` by providing `layout` and `onLayoutChange` props
3. Widget types are registered at app bootstrap via `WidgetRegistry.register`
4. No rollback strategy required — the component is additive and isolated

---

## Open Questions

1. **Keyboard drag accessibility**: Should widgets support keyboard-driven repositioning (Tab to widget, arrow keys to move)? If yes, `@dnd-kit` becomes more attractive (it has built-in keyboard sensor). Decision needed before tasks are finalised.

2. **Auto-scroll during drag**: If the grid is taller than the viewport, should the page scroll when the ghost is dragged near the bottom edge? Not specified in the proposal — assume no for now.

3. **Widget minimum size constraint**: The spec says minimum 1×1. Should individual widget types be able to declare a larger minimum (e.g., a chart widget that needs at least 2×2)? The registry registration API should accommodate this if so.

4. **`widget-registery` spelling**: The capability is named `widget-registery` in the proposal. Confirm whether this is intentional or a typo of `widget-registry` before generating spec file paths.
