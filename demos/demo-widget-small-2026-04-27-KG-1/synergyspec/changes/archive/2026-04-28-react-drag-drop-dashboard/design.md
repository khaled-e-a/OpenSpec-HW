## Context

This is a greenfield React application to be bootstrapped in the current directory. There is no existing codebase to integrate with. The application requires no backend — all state lives in the browser via `localStorage`. The primary technical challenge is building a robust drag-and-drop grid that renders a live preview, handles collision/overlap, and serialises layout correctly on every change.

---

## Use Case Coverage

See `usecases.md` "Use Case Traceability Mapping" for the complete step list. This design addresses each step as follows:

| Use Case Step | Description | Design Section |
|---------------|-------------|----------------|
| UC1-S1 | User grabs a widget's drag handle | Decision 2: Drag Handle Design |
| UC1-S2 | System lifts the widget and displays drag preview | Decision 3: Drag Preview Strategy |
| UC1-S3 | User moves pointer across the dashboard | Decision 1: Grid Layout Engine |
| UC1-S4 | System highlights valid drop zone in real time | Decision 3: Drag Preview Strategy |
| UC1-S5 | User releases pointer over a target grid cell | Decision 1: Grid Layout Engine |
| UC1-S6 | System places widget, shifts others to avoid overlap | Decision 1: Grid Layout Engine |
| UC1-S7 | System persists updated layout to localStorage | Decision 5: Layout Persistence |
| UC1-E4a | Pointer outside valid drop zone; no highlight shown | Decision 3: Drag Preview Strategy |
| UC1-E5a | Pointer released outside valid zone; widget returns | Decision 3: Drag Preview Strategy |
| UC1-E6a | Target occupied and grid full; error indicator shown | Decision 4: Collision Detection |
| UC2-S1 | User opens the Add Widget panel | Decision 6: Widget Registry & Add Panel |
| UC2-S2 | System displays available widget types with previews | Decision 6: Widget Registry & Add Panel |
| UC2-S3 | User selects a widget type | Decision 6: Widget Registry & Add Panel |
| UC2-S4 | System places widget in first available cell | Decision 4: Collision Detection |
| UC2-S5 | System persists updated layout | Decision 5: Layout Persistence |
| UC2-S6 | New widget appears on dashboard | Decision 1: Grid Layout Engine |
| UC2-E3a | User cancels panel; no change | Decision 6: Widget Registry & Add Panel |
| UC2-E4a | Grid full; user notified, widget not added | Decision 4: Collision Detection |
| UC3-S1 | User clicks remove control on a widget | Decision 7: Widget Remove Control |
| UC3-S2 | System presents confirmation prompt | Decision 7: Widget Remove Control |
| UC3-S3 | User confirms removal | Decision 7: Widget Remove Control |
| UC3-S4 | System removes widget from dashboard | Decision 1: Grid Layout Engine |
| UC3-S5 | System frees occupied grid cells | Decision 1: Grid Layout Engine |
| UC3-S6 | System persists updated layout | Decision 5: Layout Persistence |
| UC3-E3a | User cancels confirmation; widget unchanged | Decision 7: Widget Remove Control |
| UC4-S1 | Browser loads React dashboard | Decision 8: App Bootstrap |
| UC4-S2 | System reads stored layout from localStorage | Decision 5: Layout Persistence |
| UC4-S3 | System parses layout and reconstructs positions | Decision 5: Layout Persistence |
| UC4-S4 | System renders dashboard with persisted positions | Decision 1: Grid Layout Engine |
| UC4-S5 | User sees dashboard as last left | Decision 5: Layout Persistence |
| UC4-E2a | No layout in localStorage; default layout rendered | Decision 5: Layout Persistence |
| UC4-E2b | Corrupt layout; fallback to default, notify user | Decision 5: Layout Persistence |
| UC5-S1 | User moves pointer while dragging | Decision 3: Drag Preview Strategy |
| UC5-S2 | System renders ghost/placeholder at hovered cell | Decision 3: Drag Preview Strategy |
| UC5-S3 | System updates placeholder position in real time | Decision 3: Drag Preview Strategy |
| UC5-S4 | User sees intended drop position clearly | Decision 3: Drag Preview Strategy |
| UC5-S5 | User releases; preview removed, drop completes | Decision 3: Drag Preview Strategy |
| UC5-E3a | Invalid position; placeholder shown in invalid state | Decision 3 + Decision 4 |

### Unaddressed Use Case Steps
None — all 38 mapped steps are covered by one or more decisions below.

---

## Goals / Non-Goals

**Goals:**
- Implement a fully functional drag-and-drop grid dashboard in React
- Support adding, removing, repositioning, and live-previewing widget moves
- Persist layout in `localStorage` with graceful fallback
- Be self-contained: no backend, no external storage, no authentication

**Non-Goals:**
- Widget resize (out of scope for this change; can be added later)
- Multi-user or shared layouts
- Undo/redo history for layout changes
- Accessibility (keyboard drag-and-drop) — deferred to a follow-up

---

## Decisions

### Decision 1: Grid Layout Engine — Use `react-grid-layout`
**Addresses**:
- UC1-S3 to UC1-S6 — pointer movement, cell targeting, widget placement with reflow
- UC2-S4, UC2-S6 — place new widget in first available cell and render it
- UC3-S4, UC3-S5 — remove widget and free its cells
- UC4-S4 — render dashboard with persisted positions

**Rationale**: `react-grid-layout` provides a battle-tested, responsive grid with built-in drag/drop, collision avoidance, and layout serialisation. It handles cell overlap prevention, widget reflowing, and grid coordinate management out of the box, matching exactly what UC1-S6 and UC2-E4a require. Its layout format (array of `{i, x, y, w, h}` objects) is trivially serialisable to JSON for `localStorage`.

**Alternative Considered**: Building a custom CSS grid + pointer-events system — rejected because collision detection and reflow logic would be significant custom work with high risk of edge-case bugs.

---

### Decision 2: Drag Handle Design — Dedicated Handle Region per Widget
**Addresses**:
- UC1-S1 — user grabs a widget's drag handle

**Rationale**: Each widget card will have a visible drag handle (grip icon in the card header). Using `react-grid-layout`'s `draggableHandle` prop restricts drag initiation to this region only, preventing accidental drags when clicking interactive widget content (buttons, inputs, charts). This gives users precise control.

**Alternative Considered**: Making the entire card draggable — rejected because widgets with interactive content (e.g., a chart with tooltips) would have conflicting pointer events.

---

### Decision 3: Drag Preview Strategy — `react-grid-layout` Built-in Placeholder
**Addresses**:
- UC1-S2, UC1-E4a, UC1-E5a — visual lift, drop zone highlight, snap-back on invalid drop
- UC5-S1 to UC5-S5, UC5-E3a — real-time ghost preview, invalid state rendering

**Rationale**: `react-grid-layout` renders a built-in CSS-styled placeholder (`react-grid-layout__placeholder`) at the target drop position during a drag. This placeholder updates in real time as the pointer moves between cells (UC5-S3). For invalid positions outside the grid bounds, the library suppresses the drop and snaps the item back (UC1-E5a). We will style the placeholder with a dashed border + shaded background to make it clearly visible (UC5-S4), and apply a red tint class when hovering over a fully-occupied grid with no reflow room (UC5-E3a).

**Alternative Considered**: Custom HTML5 drag-and-drop API with a detached drag image — rejected because it lacks the grid-snapping and real-time placeholder update behaviour needed for UC5.

---

### Decision 4: Collision Detection — Delegate to `react-grid-layout` + Custom "grid full" Guard
**Addresses**:
- UC1-E6a — target occupied and grid full; error indicator shown
- UC2-E4a — no free cell; user notified, widget not added
- UC2-S4 — place in first available cell

**Rationale**: `react-grid-layout` prevents two items from permanently overlapping (it shifts others). However it does not enforce a maximum widget count. We will add a lightweight guard: before adding a new widget (UC2-S3), compute whether a free cell exists within the configured grid columns and row limit. If none exists, show a toast notification ("Dashboard is full — remove a widget to add a new one") and abort the add. For UC1-E6a during drag, `react-grid-layout` handles snap-back automatically when there is truly no valid position.

---

### Decision 5: Layout Persistence — JSON serialisation to `localStorage`
**Addresses**:
- UC1-S7, UC2-S5, UC3-S6 — persist on every layout mutation
- UC4-S2 to UC4-S5 — restore on load
- UC4-E2a — default layout on first visit
- UC4-E2b — corrupt data fallback

**Rationale**: On every `onLayoutChange` callback from `react-grid-layout`, the updated layout array (plus widget type metadata) is serialised to `JSON.stringify` and written to `localStorage` under the key `rdd_layout`. On app boot, the stored value is read and parsed. A try/catch wraps the parse step: on any error (corrupt JSON, missing fields, schema mismatch detected via a version field), the app logs a warning, clears the corrupt entry, and falls back to `DEFAULT_LAYOUT` (a hard-coded starter layout). A `layoutVersion` field in the stored object allows future migrations without silent corruption.

**Alternative Considered**: IndexedDB — overkill for a layout config of a few KB; `localStorage` is synchronous and sufficient.

---

### Decision 6: Widget Registry & Add Panel — Static Registry + Slide-in Drawer
**Addresses**:
- UC2-S1, UC2-S2, UC2-S3, UC2-E3a — open panel, show registry, select, cancel

**Rationale**: Widget types are declared in a static `WIDGET_REGISTRY` array, each entry containing `{ id, displayName, description, defaultSize: { w, h }, component }`. A slide-in drawer (triggered by an "Add Widget +" button in the toolbar) lists all registered types with their name and a small icon/thumbnail. Selecting one dispatches an `addWidget` action. Clicking outside the drawer or pressing Escape closes it without change (UC2-E3a). This pattern keeps the registry decoupled from the grid — adding new widget types requires only a new registry entry, no grid logic changes.

**Alternative Considered**: A modal dialog — functionally equivalent, but a drawer feels more natural for a "palette" browsing interaction and does not obscure the dashboard.

---

### Decision 7: Widget Remove Control — "×" Button with Inline Confirmation
**Addresses**:
- UC3-S1 to UC3-S3, UC3-E3a — remove button, confirmation, cancel

**Rationale**: Each widget card header shows a small "×" remove icon (visible on hover or always visible). Clicking it renders an inline confirmation tooltip/popover ("Remove this widget? [Remove] [Cancel]") rather than a full modal, keeping the interaction lightweight. Confirming fires a `removeWidget(id)` action; cancelling dismisses the popover with no side effects (UC3-E3a). The inline approach avoids context switches for a destructive-but-recoverable action.

**Alternative Considered**: A global confirmation modal — rejected as too heavy for a single-widget removal.

---

### Decision 8: App Bootstrap — Vite + React 18, `localStorage` hydration on mount
**Addresses**:
- UC4-S1 — browser loads the React dashboard

**Rationale**: Bootstrapped with `npm create vite@latest` (React + TypeScript template) for fast HMR and a minimal build config. Layout state is hydrated from `localStorage` inside a `useDashboardLayout` custom hook called at the top-level `<App>` component, before the first render (using a lazy `useState` initialiser), so the dashboard renders immediately with the correct layout and avoids a layout flash.

---

## Risks / Trade-offs

- **`react-grid-layout` bundle size (~45 KB gzipped)**: Acceptable for a dashboard app, but worth noting if this component is later embedded in a larger app → Mitigation: lazy-load the dashboard route if needed.
- **`localStorage` size limit (~5 MB)**: Widget layout metadata is tiny; risk is negligible for expected usage → Mitigation: log a warning if serialised size exceeds 50 KB.
- **No undo/redo**: Users who accidentally remove a widget cannot recover it without a page reload to previous state (and only if persistence was written before the mistake) → Mitigation: the confirmation step in UC3-S2 mitigates accidental removals; undo is listed as a future capability.
- **No accessibility for drag-and-drop**: Keyboard-driven reordering is not implemented in this version → Mitigation: `react-grid-layout` supports keyboard interaction in newer versions; this can be enabled in a follow-up change.

---

## Migration Plan

This is a greenfield app — no migration is needed.

Deployment steps:
1. `npm install` in the project root
2. `npm run dev` for development
3. `npm run build` → serve `dist/` from any static host

Rollback: not applicable (no existing system is modified).

---

## Open Questions

- **Default widget set**: What widgets should appear on first load (the `DEFAULT_LAYOUT`)? Options: one of each registered type, or a curated starter set. → Decision deferred to implementation; will default to one of each registered type.
- **Grid dimensions**: How many columns and what maximum row count should the grid support? → Default to 12 columns, unlimited rows (standard `react-grid-layout` default).
- **Widget multi-instancing**: Should users be allowed to place two instances of the same widget type? → Assume yes for this change; the registry does not restrict it.
