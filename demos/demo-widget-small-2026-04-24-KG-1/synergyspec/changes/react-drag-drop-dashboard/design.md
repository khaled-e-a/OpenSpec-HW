## Context

The project currently has no dashboard page. Users access data through separate, fixed-layout views with no ability to customise which widgets appear or where. This design introduces a `/dashboard` route built on a drag-and-drop grid, a widget registry, and `localStorage`-backed persistence — collectively implementing the three capabilities defined in the proposal: `drag-drop-dashboard`, `widget-registry`, and `dashboard-persistence`.

Key constraints:
- React functional components with hooks only (no class components)
- No backend changes — persistence is client-side only (`localStorage`)
- New route must integrate with the existing app router without disrupting existing routes
- Must work on both desktop (mouse) and mobile (touch)

---

## Use Case Coverage

See `usecases.md` "Use Case Traceability Mapping" for the full step list.

| Use Case Step | Description | Design Section |
|---------------|-------------|----------------|
| UC1-S1 | User views dashboard with widgets in current positions | Decision 3: Grid Layout Engine |
| UC1-S2 | User picks up a widget | Decision 1: Drag-and-Drop Library |
| UC1-S3 | System shows drag preview following pointer | Decision 1: Drag-and-Drop Library |
| UC1-S4 | User drags widget over an empty target area | Decision 3: Grid Layout Engine |
| UC1-S5 | System highlights valid drop zone | Decision 1 + Decision 3 |
| UC1-S6 | User releases widget over target zone | Decision 1: Drag-and-Drop Library |
| UC1-S7 | System moves widget, closing gaps | Decision 3: Grid Layout Engine |
| UC1-S8 | System persists updated layout | Decision 4: Persistence Strategy |
| UC1-E2a | Cancel drag — widget returns to original position | Decision 1: onDragCancel handler |
| UC1-E4a | Invalid drop zone — show no-drop indicator | Decision 3: Collision detection |
| UC1-E6a | Drop in same position — no-op, no persistence write | Decision 4: Dirty-check before write |
| UC2-S1 | User opens widget picker | Decision 2: Widget Registry |
| UC2-S2 | System displays available widget types | Decision 2: Widget Registry |
| UC2-S3 | User selects a widget type | Decision 2: Widget Registry |
| UC2-S4 | System instantiates widget at next available position | Decision 3: Grid Layout Engine |
| UC2-S5 | System persists updated layout | Decision 4: Persistence Strategy |
| UC2-E3a | No empty grid position — system notifies user | Decision 3: Grid capacity check |
| UC2-E3b | User closes picker without selecting | Decision 2: picker close handler |
| UC3-S1 | System reads saved layout from `localStorage` on mount | Decision 4: Persistence Strategy |
| UC3-S2 | System validates widget IDs against registry | Decision 2 + Decision 4 |
| UC3-S3 | System renders widgets at saved positions | Decision 3 + Decision 4 |
| UC3-S4 | User sees dashboard as they left it | Decision 4: Persistence Strategy |
| UC3-E1a | `localStorage` missing — render default layout | Decision 4: Fallback to defaults |
| UC3-E2a | Saved widget IDs no longer in registry — prune and save | Decision 4: Pruning logic |
| UC3-E1b | `localStorage` data malformed — fallback + console warning | Decision 4: Parse error handling |

### Unaddressed Use Case Steps
None — all 25 steps are covered by the decisions below.

---

## Goals / Non-Goals

**Goals:**
- Drag-and-drop widget reordering on a responsive grid
- Widget picker to add widgets from a registry
- `localStorage`-backed layout persistence with graceful fallback
- Touch and mouse support
- No-overlap, no-out-of-bounds grid constraint enforcement

**Non-Goals:**
- Server-side layout persistence (out of scope; `localStorage` only for now)
- Widget resizing (layout supports it architecturally via `react-grid-layout` but the UI controls are not in scope)
- Authentication or per-user layouts
- Widget content customisation (widgets render fixed content in v1)

---

## Decisions

### Decision 1: Drag-and-Drop Library — `@dnd-kit/core` + `@dnd-kit/sortable`
**Addresses**:
- UC1-S2 - User picks up a widget by pressing and holding it
- UC1-S3 - System highlights the widget as active and shows a drag preview following the pointer
- UC1-S5 - System highlights the target drop zone to indicate a valid placement
- UC1-S6 - User releases the widget over the target zone
- UC1-E2a - User cancels drag — widget returns to its original position

**Rationale**: `@dnd-kit` is modular, accessibility-first, supports both mouse and touch natively, and provides a `DragOverlay` component for the follow-cursor preview (UC1-S3). Its `useSortable` hook integrates directly with sorted lists. The `onDragCancel` callback cleanly handles UC1-E2a without extra state.

**Alternative Considered**: `react-beautiful-dnd` — archived/unmaintained, no touch support without polyfill. `react-dnd` — lower-level, requires more boilerplate for the same result.

---

### Decision 2: Widget Registry — Static Map + `WidgetRegistry` module
**Addresses**:
- UC2-S1 - User opens the widget picker
- UC2-S2 - System displays available widget types with names and descriptions
- UC2-S3 - User selects a widget type to add
- UC3-S2 - System validates widget IDs against the registry
- UC2-E3b - User closes picker without selecting

**Rationale**: A static `Record<string, WidgetDefinition>` map in `src/registry/widgetRegistry.ts` is sufficient for v1. Each `WidgetDefinition` holds: `{ id, displayName, description, defaultSize, component }`. The picker renders entries from this map. Validation (UC3-S2) is a simple `id in registry` check.

**Widget Picker UX**: A side-drawer triggered by an "Add Widget" button; closes on selection or Escape.

**Alternative Considered**: Dynamic registry loaded from config file — adds complexity with no benefit in v1.

---

### Decision 3: Grid Layout Engine — `react-grid-layout`
**Addresses**:
- UC1-S1 - User views the dashboard with widgets in their current grid positions
- UC1-S4 - User drags the widget over an empty target area on the grid
- UC1-S5 - System highlights the target drop zone (built-in placeholder)
- UC1-S7 - System moves the widget to the new grid position, closing any gap left behind
- UC2-S4 - System instantiates the widget at the next available grid position
- UC2-E3a - No empty grid position — system notifies user
- UC1-E4a - User drags over occupied/invalid zone — system shows no-drop indicator

**Rationale**: `react-grid-layout` provides a 12-column responsive grid with built-in drag, drop-placeholder highlighting (UC1-S5), and automatic reflow (UC1-S7). The `layout` prop is a serialisable array, making persistence straightforward. `@dnd-kit` handles the drag gesture; `react-grid-layout` owns the grid math.

**Integration**: `@dnd-kit` will be used only for the "add from picker" drag-onto-grid flow. Within the grid, `react-grid-layout`'s native drag handles the reorder flow to avoid conflicting drag contexts.

**Grid capacity check (UC2-E3a)**: Before adding a widget, check if a `{w, h}` slot can be found using `react-grid-layout`'s `compactType` + a free-slot scan. If none found, show a `Toast` notification.

**Collision detection / no-drop indicator (UC1-E4a)**: `react-grid-layout` renders a built-in grey placeholder; when a drop is invalid it simply snaps back — no custom indicator required beyond the placeholder.

---

### Decision 4: Persistence Strategy — `localStorage` with JSON serialisation
**Addresses**:
- UC1-S8 - System persists the updated layout automatically
- UC1-E6a - Drop in same position — no-op, no persistence write
- UC3-S1 - System reads saved layout from `localStorage` on dashboard mount
- UC3-S2 - System validates widget IDs against the registry
- UC3-S3 - System renders each widget at its saved grid position and size
- UC3-S4 - User sees the dashboard exactly as they left it
- UC3-E1a - `localStorage` missing — system renders default layout
- UC3-E2a - Saved widget IDs not in registry — unrecognised widgets discarded
- UC3-E1b - `localStorage` data malformed — fall back to default, log warning
- UC2-S5 - System persists updated layout after adding a widget

**Rationale**:
- **Save**: `useDashboardLayout` hook calls `localStorage.setItem('dashboard-layout', JSON.stringify(layout))` inside an `onLayoutChange` callback from `react-grid-layout`. A deep-equality check against the previous layout (UC1-E6a) prevents spurious writes.
- **Load**: On mount, read and `JSON.parse` the key. Wrap in try/catch — on `SyntaxError` fall back to `DEFAULT_LAYOUT` and `console.warn` (UC3-E1b). On missing key, fall back silently (UC3-E1a).
- **Pruning** (UC3-E2a): Filter loaded layout entries to those whose `i` (widget ID) exists in the registry. Save the pruned layout back immediately.
- **Default layout**: Defined as a constant in `src/registry/widgetRegistry.ts`; shows a 2×2 grid of representative widgets.

**Alternative Considered**: `sessionStorage` — doesn't survive tab close. IndexedDB — overkill for a flat JSON object.

---

### Decision 5: Component Architecture
```
src/
  components/
    Dashboard/
      DashboardPage.tsx        ← route component, owns layout state
      DashboardGrid.tsx        ← wraps react-grid-layout, renders WidgetCard[]
      WidgetCard.tsx           ← drag handle + widget content shell
      WidgetPicker.tsx         ← side drawer, lists registry entries
  widgets/
    StatsCard/index.tsx
    ChartWidget/index.tsx
    TableWidget/index.tsx
  registry/
    widgetRegistry.ts          ← WidgetDefinition map + DEFAULT_LAYOUT
  hooks/
    useDashboardLayout.ts      ← load/save/prune logic
```

**Routing**: Add `<Route path="/dashboard" element={<DashboardPage />} />` to the existing router file.

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `react-grid-layout` + `@dnd-kit` drag conflicts in the "add widget" flow | Confine `@dnd-kit` to the picker drop target; grid reordering uses RGL's native drag exclusively |
| `localStorage` quota exceeded (rare, but possible if many widgets are added) | Catch `QuotaExceededError` on `setItem`, notify user, leave existing layout intact |
| Layout state diverges from registry on widget type removal | Prune-on-load logic (UC3-E2a) prevents stale IDs from crashing renders |
| Mobile touch events conflicting between RGL and browser scroll | Set `draggableCancel=".no-drag"` on scroll-heavy widget internals; test on iOS Safari |

---

## Migration Plan

1. Install dependencies: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-grid-layout`
2. Add `react-grid-layout` CSS import to the app entry point
3. Add `/dashboard` route to the router
4. No data migration required (new feature, no existing storage)
5. **Rollback**: Remove the route entry and uninstall packages — zero impact on existing routes

---

## Open Questions

1. **Grid columns on mobile**: Default 12-column grid collapses to fewer columns on small screens via RGL's `breakpoints` prop — confirm target breakpoints with design.
2. **Widget types for v1**: Three placeholder widgets (StatsCard, ChartWidget, TableWidget) are assumed. Confirm the full list before implementation.
3. **Drag handle vs. full-card drag**: Should only a header "handle" be draggable, or the entire card? Impacts `draggableHandle` prop on RGL.
