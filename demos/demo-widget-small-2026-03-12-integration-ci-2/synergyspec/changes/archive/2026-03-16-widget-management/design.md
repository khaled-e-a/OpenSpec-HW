## Context

The dashboard currently renders a fixed set of widgets defined in `WIDGET_REGISTRY` (`src/constants.ts`). The layout is persisted in `localStorage` via `useDashboardLayout`, but there is no way to add or remove widgets at runtime — the layout is only mutated by drag-and-drop repositioning and resize.

This design extends the existing architecture minimally: reusing the existing `useDashboardLayout` hook, `WIDGET_REGISTRY` constant, `isValidPlacement` utility, and `localStorage` persistence contract — adding only the two new runtime actions (`addWidget`, `removeWidget`) and the UI surface area to trigger them.

## Use Case Coverage

See `usecases.md` "Use Case Traceability Mapping" for the complete list of use case steps.
This design addresses the following use case steps:

- UC1-S1: User opens the widget catalogue → Decision 1 (Catalogue UI)
- UC1-S2: System displays available widgets not currently on the grid → Decision 2 (Available widget filtering)
- UC1-S3: User selects a widget from the catalogue → Decision 1 (Catalogue UI)
- UC1-S4: System finds the first available grid position for the new widget → Decision 3 (Auto-placement)
- UC1-S5: System places the widget at that position with a default size → Decision 3 (Auto-placement)
- UC1-S6: System closes the catalogue → Decision 1 (Catalogue UI)
- UC1-S7: System persists the updated layout to local storage → Decision 4 (State & persistence)
- UC1-E2a1: System displays an empty catalogue when all widgets are already on the grid → Decision 2 (Available widget filtering)
- UC1-E4a1: System displays an error when no grid space is available → Decision 3 (Auto-placement)
- UC1-E4a2: System does not add the widget when no space is available → Decision 3 (Auto-placement)
- UC2-S1: User hovers over a widget; remove control becomes visible → Decision 5 (Remove control)
- UC2-S2: User clicks the remove control on the target widget → Decision 5 (Remove control)
- UC2-S3: System removes the widget from the grid → Decision 4 (State & persistence)
- UC2-S4: System leaves remaining widgets in their current positions → Decision 4 (State & persistence)
- UC2-S5: System persists the updated layout to local storage → Decision 4 (State & persistence)
- UC2-E2a1: System removes the widget immediately without a confirmation dialog → Decision 5 (Remove control)
- UC2-E2a2: Removed widget becomes available again in the catalogue → Decision 2 (Available widget filtering)
- UC2-E3a1: System removes the last widget, leaving an empty grid → Decision 4 (State & persistence)
- UC2-E3a2: System persists the empty layout → Decision 4 (State & persistence)

### Unaddressed Use Case Steps
None — all 19 use case steps are addressed by a design decision below.

## Goals / Non-Goals

**Goals:**
- Allow users to add any widget from `WIDGET_REGISTRY` that is not currently on the grid
- Allow users to remove any widget currently on the grid
- Auto-place newly added widgets at the first available grid position
- Persist add/remove changes to `localStorage` using the existing storage key
- Keep the implementation additive — no breaking changes to existing drag/resize behaviour

**Non-Goals:**
- Undo/redo for add or remove actions (future change)
- Confirmation dialogs before removing a widget (MVP decision — immediate removal only)
- Drag-to-add from catalogue (future change — catalogue click-to-add only for now)
- Re-ordering or auto-reflow of remaining widgets after removal
- Multi-select or bulk add/remove

## Decisions

### Decision 1: Widget Catalogue as an inline popover/panel in DashboardGrid

**Addresses**: UC1-S1 - User opens the widget catalogue; UC1-S3 - User selects a widget from the catalogue; UC1-S6 - System closes the catalogue

**Rationale**: A simple inline panel toggled by an "Add widget" button in the grid header is the lowest-friction implementation — no new routing, no modal library, no portal. `DashboardGrid` already manages all layout state; keeping the catalogue as local UI state in the same component avoids prop-drilling.

**Alternative Considered**: Full-screen modal — rejected because it introduces unnecessary complexity and a new dependency for MVP.

---

### Decision 2: Available widget list derived by filtering WIDGET_REGISTRY against current layout

**Addresses**: UC1-S2 - System displays available widgets not currently on the grid; UC1-E2a1 - System displays an empty catalogue when all widgets are already on the grid; UC2-E2a2 - Removed widget becomes available again in the catalogue

**Rationale**: `WIDGET_REGISTRY` is the authoritative list of all widgets. The catalogue computes `available = WIDGET_REGISTRY.filter(w => !layout.some(l => l.id === w.id))`. This is a pure derivation — no extra state, always consistent. When a widget is removed it disappears from `layout`, so it automatically reappears in the catalogue.

**Alternative Considered**: A separate "available widgets" state array — rejected because it would duplicate source-of-truth and require manual sync on every add/remove.

---

### Decision 3: Auto-placement using a first-fit scan over grid rows

**Addresses**: UC1-S4 - System finds the first available grid position for the new widget; UC1-S5 - System places the widget at that position with a default size; UC1-E4a1 - System displays an error when no grid space is available; UC1-E4a2 - System does not add the widget when no space is available

**Rationale**: Scan `col=0..GRID_COLS-defaultW, row=0..MAX_ROW` in row-major order; use the existing `isValidPlacement` utility (`src/utils/placement.ts`) to check each candidate. The first passing position is used. This is O(rows × cols) but grids are small (12 × N) so performance is not a concern.

Default size for newly added widgets: `w=4, h=2` (matches the smallest existing widget size).

If no position is found, `addWidget` returns `false` and `DashboardGrid` renders an inline error message below the catalogue list. No widget is added.

**Alternative Considered**: Always append at the bottom of the grid — simpler, but produces a poor UX when large gaps exist above due to prior removals.

---

### Decision 4: Extend useDashboardLayout with addWidget and removeWidget actions

**Addresses**: UC1-S7 - System persists the updated layout to local storage; UC2-S3 - System removes the widget from the grid; UC2-S4 - System leaves remaining widgets in their current positions; UC2-S5 - System persists the updated layout to local storage; UC2-E3a1 - System removes the last widget, leaving an empty grid; UC2-E3a2 - System persists the empty layout

**Rationale**: All layout mutations already flow through `useDashboardLayout`. Adding `addWidget(widgetId: string): boolean` and `removeWidget(widgetId: string): void` alongside the existing `commitLayout` keeps persistence logic in one place. Both actions call `localStorage.setItem` immediately after mutating state (same pattern as `commitLayout`).

`removeWidget` simply filters the layout array; remaining widgets keep their positions unchanged — no reflow logic needed.

`addWidget` calls the auto-placement scan (Decision 3), appends the new `WidgetLayout` entry, saves, and returns `true`. Returns `false` (without mutating) if no space found.

---

### Decision 5: Remove control as a hover-revealed × button on Widget

**Addresses**: UC2-S1 - User hovers over a widget; remove control becomes visible; UC2-S2 - User clicks the remove control on the target widget; UC2-E2a1 - System removes the widget immediately without a confirmation dialog

**Rationale**: The resize handle already uses an `opacity: 0 → 1` CSS transition on hover (`Widget.tsx`). The remove button follows the same pattern — positioned at the top-right corner, `opacity: 0` at rest, revealed on `:hover` or focus. Reusing the existing hover pattern keeps the widget UI consistent with no new CSS mechanism.

No confirmation dialog for MVP — consistent with the use case decision. The widget can be re-added immediately from the catalogue (UC2-E2a2).

**Alternative Considered**: Always-visible remove icon — rejected because it clutters the widget header when not needed.

---

## Risks / Trade-offs

- **Accidental removal with no undo** → Mitigation: The removed widget is immediately available in the catalogue; re-adding takes two clicks. A future change can add an undo toast.
- **Auto-placement may produce a non-optimal layout** → Mitigation: First-fit is predictable and deterministic. Users can reposition using drag-and-drop after adding.
- **Grid-full scenario UX is minimal (inline error text)** → Acceptable for MVP; revisit if user testing shows confusion.
- **`useDashboardLayout` grows in responsibility** → This is acceptable; the hook is already the single layout owner. If it grows further, it can be refactored to a reducer pattern in a future change.

## Migration Plan

- No data migration required. The `localStorage` layout format (array of `WidgetLayout`) is unchanged; `addWidget` appends entries and `removeWidget` filters them — both round-trip cleanly.
- Existing saved layouts continue to work without modification on first load.
- No breaking changes to component props consumed by callers outside `App.tsx`.

## Open Questions

- Should the catalogue be a popover anchored to the "Add widget" button, or a side-drawer? (Design detail — either works with this architecture; left to implementation.)
- Should `addWidget` accept a preferred position (e.g., from a future drag-to-add)? For now: no — the auto-placement scan is the only placement path.
