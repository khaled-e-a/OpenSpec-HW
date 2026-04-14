# Spec–Test Mapping: drag-drop-dashboard-grid
Generated: 2026-02-26

## Requirement Traceability Matrix

| ID | Requirement / Scenario | Type | Test Type | Test File | Status |
|----|------------------------|------|-----------|-----------|--------|
| **grid-layout** | | | | | |
| GL-R1 | Grid renders with configurable columns and row height | Requirement | — | — | — |
| GL-R1-S1 | Grid mounts with valid props | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| GL-R1-S2 | Grid receives invalid columns prop | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| GL-R1-S3 | Grid receives invalid rowHeight prop | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| GL-R2 | Widget pixel positions derive from grid coordinates | Requirement | — | — | — |
| GL-R2-S1 | Widget renders at correct pixel position | Scenario | Unit | `utils/__tests__/geometry.test.ts` | ✅ |
| GL-R3 | Grid container height auto-expands to fit widgets | Requirement | — | — | — |
| GL-R3-S1 | Container height matches tallest widget stack | Scenario | Unit | `utils/__tests__/geometry.test.ts` | ✅ |
| GL-R3-S2 | Empty grid has minimum height | Scenario | Unit | `utils/__tests__/geometry.test.ts` | ✅ |
| GL-R4 | Grid recomputes geometry on container resize | Requirement | — | — | — |
| GL-R4-S1 | ResizeObserver triggers on width change | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ |
| GL-R4-S2 | ResizeObserver unavailable fallback | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ |
| GL-R5 | Widget positions snap to nearest grid cell | Requirement | — | — | — |
| GL-R5-S1 | Snap Widget to Grid Cell — happy path | Scenario | Unit | `utils/__tests__/snap.test.ts` | ✅ |
| GL-R5-S2 | Snap clamps to left boundary | Scenario | Unit | `utils/__tests__/snap.test.ts` | ✅ |
| GL-R5-S3 | Snap clamps to right boundary | Scenario | Unit | `utils/__tests__/snap.test.ts` | ✅ |
| GL-R5-S4 | Interaction cancelled during snap (revert) | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ |
| GL-R6 | Layout managed via controlled component pattern | Requirement | — | — | — |
| GL-R6-S1 | onLayoutChange called after position update | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| GL-R6-S2 | Layout does not update without onLayoutChange wiring | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ |
| **widget-drag-drop** | | | | | |
| DD-R1 | Drag is initiated by press-and-hold on a drag handle | Requirement | — | — | — |
| DD-R1-S1 | Drag initiated on drag handle (mode enters, ghost appears) | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ stub |
| DD-R1-S2 | Drag not initiated outside handle | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ stub |
| DD-R2 | Ghost preview tracks pointer position snapped to grid | Requirement | — | — | — |
| DD-R2-S1 | Ghost updates on pointer move | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ stub |
| DD-R2-S2 | Ghost stays within grid on boundary exit | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ stub |
| DD-R3 | Drop zone validity indicated visually | Requirement | — | — | — |
| DD-R3-S1 | Valid drop zone highlighted green | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ stub |
| DD-R3-S2 | Invalid drop zone highlighted red | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ stub |
| DD-R4 | Drag Widget to a New Position — successful drop | Requirement | — | — | — |
| DD-R4-S1 | Drag Widget to a New Position — happy path | Scenario | Integration | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ stub |
| DD-R4-S2 | No two widgets overlap after drop | Scenario | Unit | `utils/__tests__/collision.test.ts` | ✅ |
| DD-R5 | Drop over invalid zone cancels the drag | Requirement | — | — | — |
| DD-R5-S1 | Drop on occupied zone reverts position | Scenario | Integration | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ stub |
| DD-R6 | Escape key cancels an active drag | Requirement | — | — | — |
| DD-R6-S1 | Escape cancels drag | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ stub |
| DD-R7 | Collision detection uses AABB in grid units | Requirement | — | — | — |
| DD-R7-S1 | Overlap detected between two items | Scenario | Unit | `utils/__tests__/collision.test.ts` | ✅ |
| DD-R7-S2 | Adjacent items do not overlap | Scenario | Unit | `utils/__tests__/collision.test.ts` | ✅ |
| **widget-registry** | | | | | |
| WR-R1 | Widget types registered via module-level singleton | Requirement | — | — | — |
| WR-R1-S1 | Registry is available as a module import (singleton) | Scenario | Unit | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| WR-R2 | Register validates and stores a widget type | Requirement | — | — | — |
| WR-R2-S1 | Valid widget type is registered | Scenario | Unit | `registry/__tests__/WidgetRegistry.test.ts` | ✅ |
| WR-R2-S2 | Duplicate key rejected | Scenario | Unit | `registry/__tests__/WidgetRegistry.test.ts` | ✅ |
| WR-R2-S3 | Empty key rejected | Scenario | Unit | `registry/__tests__/WidgetRegistry.test.ts` | ✅ |
| WR-R2-S4 | Invalid component rejected | Scenario | Unit | `registry/__tests__/WidgetRegistry.test.ts` | ✅ |
| WR-R2-S5 | Non-positive defaultSize rejected | Scenario | Unit | `registry/__tests__/WidgetRegistry.test.ts` | ✅ |
| WR-R3 | Registry lookup returns entry or undefined | Requirement | — | — | — |
| WR-R3-S1 | Lookup returns registered entry | Scenario | Unit | `registry/__tests__/WidgetRegistry.test.ts` | ✅ |
| WR-R3-S2 | Lookup returns undefined for unknown key | Scenario | Unit | `registry/__tests__/WidgetRegistry.test.ts` | ✅ |
| WR-R4 | Add Widget to Dashboard | Requirement | — | — | — |
| WR-R4-S1 | Add Widget to Dashboard — happy path | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| WR-R4-S1 | findFirstAvailablePosition — empty grid | Scenario | Unit | `utils/__tests__/layout.test.ts` | ✅ |
| WR-R4-S1 | findFirstAvailablePosition — partial grid | Scenario | Unit | `utils/__tests__/layout.test.ts` | ✅ |
| WR-R4-S2 | Unregistered type selected → error notification | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| WR-R4-S3 | Dashboard full (widget too wide) → notification | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| WR-R4-S4 | New widget gets unique instance ID | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| WR-R5 | Remove Widget from Dashboard | Requirement | — | — | — |
| WR-R5-S1 | Remove Widget from Dashboard — happy path | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| WR-R5-S2 | Remove cancelled at confirmation | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| WR-R5-S3 | Widget type remains in registry after removal | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| WR-R5-S4 | Widget already absent from layout on remove | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| **widget-resize** | | | | | |
| WRS-R1 | Each widget exposes a resize handle | Requirement | — | — | — |
| WRS-R1-S1 | Resize handle rendered by default | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| WRS-R1-S2 | Resize handle not rendered when disabled | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ✅ |
| WRS-R2 | Resize drag maps to snapped grid size | Requirement | — | — | — |
| WRS-R2-S1 | Resize preview snaps to cell boundary | Scenario | Unit | `utils/__tests__/snap.test.ts` | ✅ |
| WRS-R2-S2 | Resize preview updates continuously | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ stub |
| WRS-R3 | Widget size constraints enforced during resize | Requirement | — | — | — |
| WRS-R3-S1 | Candidate size below minimum clamped | Scenario | Unit | `utils/__tests__/snap.test.ts` | ✅ |
| WRS-R3-S2 | Candidate size above maximum clamped | Scenario | Unit | `utils/__tests__/snap.test.ts` | ✅ |
| WRS-R3-S3 | Pointer outside grid boundary clamped | Scenario | Unit | `utils/__tests__/snap.test.ts` | ✅ |
| WRS-R4 | Resize Widget — successful resize commits layout change | Requirement | — | — | — |
| WRS-R4-S1 | Resize Widget — happy path | Scenario | Integration | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ stub |
| WRS-R4-S2 | No two widgets overlap after resize | Scenario | Unit | `utils/__tests__/layout.test.ts` | ✅ |
| WRS-R5 | Displaced widgets pushed downward on resize | Requirement | — | — | — |
| WRS-R5-S1 | Overlapping widget pushed down | Scenario | Unit | `utils/__tests__/layout.test.ts` | ✅ |
| WRS-R5-S2 | Cascade push resolves secondary overlaps | Scenario | Unit | `utils/__tests__/layout.test.ts` | ✅ |
| WRS-R5-S3 | Resize refused when push exceeds grid boundary | Scenario | Integration | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ stub |
| WRS-R5-S4 | Resize refused when recursion depth exceeded | Scenario | Unit | `utils/__tests__/layout.test.ts` | ⚠️ |
| WRS-R6 | Escape key cancels an active resize | Requirement | — | — | — |
| WRS-R6-S1 | Escape cancels resize | Scenario | Component | `components/__tests__/DashboardGrid.test.tsx` | ⚠️ stub |

---

## Coverage Summary

| Category | Total Scenarios | ✅ Covered | ⚠️ Partial / Stub | ❌ Missing |
|---|---|---|---|---|
| grid-layout | 12 | 8 | 4 | 0 |
| widget-drag-drop | 11 | 3 | 8 | 0 |
| widget-registry | 13 | 13 | 0 | 0 |
| widget-resize | 11 | 8 | 3 | 0 |
| **Total** | **47** | **32** | **15** | **0** |

> ⚠️ 14 stub tests in `describe.skip` blocks require pointer-event simulation (drag initiation, ghost tracking, drop commit, escape-cancel, resize drag). These need either `@dnd-kit/testing`, Playwright, or Cypress to fully exercise.

---

## Detailed Mappings

### grid-layout

**GL-R1: Grid renders with configurable columns and row height**
- **GL-R1-S1** Grid mounts with valid props
  - `components/__tests__/DashboardGrid.test.tsx` — "renders one wrapper per layout item" (Component)
- **GL-R1-S2** Grid receives invalid columns prop
  - `components/__tests__/DashboardGrid.test.tsx:~65` — "renders without crash when columns is 0" (Component)
- **GL-R1-S3** Grid receives invalid rowHeight prop
  - `components/__tests__/DashboardGrid.test.tsx:~73` — "renders without crash when rowHeight is negative" (Component)

**GL-R2: Widget pixel positions derive from grid coordinates**
- **GL-R2-S1** Widget renders at correct pixel position
  - `utils/__tests__/geometry.test.ts:~28` — "converts grid coordinates to absolute pixel rect" (Unit)

**GL-R3: Grid container height auto-expands**
- **GL-R3-S1** Container height matches tallest widget stack
  - `utils/__tests__/geometry.test.ts:~15` — "returns max occupied row * rowHeight" (Unit)
- **GL-R3-S2** Empty grid has minimum height
  - `utils/__tests__/geometry.test.ts:~11` — "returns 1 * rowHeight for empty layout" (Unit)

**GL-R4: Grid recomputes geometry on container resize**
- **GL-R4-S1** ResizeObserver triggers on width change → ⚠️ no test (requires jsdom ResizeObserver mock)
- **GL-R4-S2** ResizeObserver unavailable fallback → ⚠️ no test

**GL-R5: Widget positions snap to nearest grid cell**
- **GL-R5-S1** Snap — happy path
  - `utils/__tests__/snap.test.ts:7` — "rounds to nearest column" (Unit)
  - `utils/__tests__/snap.test.ts:12` — "rounds down when below 0.5" (Unit)
- **GL-R5-S2** Snap clamps to left boundary
  - `utils/__tests__/snap.test.ts:16` — "clamps x to left boundary (0)" (Unit)
  - `utils/__tests__/snap.test.ts:25` — "clamps y to 0 (never negative)" (Unit)
- **GL-R5-S3** Snap clamps to right boundary
  - `utils/__tests__/snap.test.ts:20` — "clamps x to right boundary (columns - w)" (Unit)
- **GL-R5-S4** Interaction cancelled → ⚠️ stub (pointer-event needed)

**GL-R6: Controlled component pattern**
- **GL-R6-S1** onLayoutChange called after position update
  - `components/__tests__/DashboardGrid.test.tsx:~83` — "calls onLayoutChange with a new entry" (Component)
  - `components/__tests__/DashboardGrid.test.tsx:~99` — "calls onLayoutChange without the removed item" (Component)
- **GL-R6-S2** No update without onLayoutChange wiring → ⚠️ no test

---

### widget-drag-drop

**DD-R1: Drag initiated by press-and-hold on drag handle**
- **DD-R1-S1** Drag mode enters, ghost appears → ⚠️ stub (`describe.skip`)
- **DD-R1-S2** Drag not initiated outside handle → ⚠️ stub (`describe.skip`)

**DD-R2: Ghost tracks pointer snapped to grid**
- **DD-R2-S1** Ghost updates on pointer move → ⚠️ stub (`describe.skip`)
- **DD-R2-S2** Ghost stays at boundary → ⚠️ stub (`describe.skip`)

**DD-R3: Drop zone validity indicated visually**
- **DD-R3-S1** Valid zone → green → ⚠️ stub (`describe.skip`)
- **DD-R3-S2** Invalid zone → red → ⚠️ stub (`describe.skip`)

**DD-R4: Successful drop commits layout change**
- **DD-R4-S1** Drag happy path → ⚠️ stub (`describe.skip`)
- **DD-R4-S2** No overlap after drop
  - `utils/__tests__/collision.test.ts:9` — "returns true when items overlap" (Unit — verifies the guard used at drop time)

**DD-R5: Drop over invalid zone cancels drag**
- **DD-R5-S1** Drop on occupied zone reverts → ⚠️ stub (`describe.skip`)

**DD-R6: Escape cancels drag**
- **DD-R6-S1** Escape cancels → ⚠️ stub (`describe.skip`)

**DD-R7: Collision detection uses AABB**
- **DD-R7-S1** Overlap detected
  - `utils/__tests__/collision.test.ts:10` — "returns true when items overlap" (Unit)
  - `utils/__tests__/collision.test.ts:22` — "returns true when one item is fully contained" (Unit)
- **DD-R7-S2** Adjacent items do not overlap
  - `utils/__tests__/collision.test.ts:14` — "returns false for horizontally adjacent" (Unit)
  - `utils/__tests__/collision.test.ts:18` — "returns false for vertically adjacent" (Unit)

---

### widget-registry

**WR-R1: Module-level singleton**
- **WR-R1-S1** Same instance on multiple imports
  - `components/__tests__/DashboardGrid.test.tsx:~80` — "returns the same instance on multiple imports" (Unit)

**WR-R2: Register validates and stores**
- **WR-R2-S1** Valid registration → `registry/__tests__/WidgetRegistry.test.ts:19` ✅
- **WR-R2-S2** Duplicate key → `registry/__tests__/WidgetRegistry.test.ts:24` ✅
- **WR-R2-S3** Empty / non-string key → `registry/__tests__/WidgetRegistry.test.ts:30,35` ✅
- **WR-R2-S4** Invalid component → `registry/__tests__/WidgetRegistry.test.ts:39` ✅
- **WR-R2-S5** Non-positive size → `registry/__tests__/WidgetRegistry.test.ts:45,51` ✅

**WR-R3: Lookup**
- **WR-R3-S1** Returns registered entry → `registry/__tests__/WidgetRegistry.test.ts:59` ✅
- **WR-R3-S2** Returns undefined for unknown → `registry/__tests__/WidgetRegistry.test.ts:64` ✅

**WR-R4: Add Widget to Dashboard**
- **WR-R4-S1** Happy path → `components/__tests__/DashboardGrid.test.tsx:~83` ✅
- **WR-R4-S1** findFirstAvailablePosition variants → `utils/__tests__/layout.test.ts:12,16,22` ✅
- **WR-R4-S2** Unregistered type → `components/__tests__/DashboardGrid.test.tsx:~128` ✅
- **WR-R4-S3** Dashboard full → `components/__tests__/DashboardGrid.test.tsx:~139` ✅
- **WR-R4-S4** Unique IDs → `components/__tests__/DashboardGrid.test.tsx:~155` ✅

**WR-R5: Remove Widget from Dashboard**
- **WR-R5-S1** Happy path → `components/__tests__/DashboardGrid.test.tsx:~196` ✅
- **WR-R5-S2** Cancelled → `components/__tests__/DashboardGrid.test.tsx:~209` ✅
- **WR-R5-S3** Type stays in registry → `components/__tests__/DashboardGrid.test.tsx:~176` ✅
- **WR-R5-S4** Widget already absent → `components/__tests__/DashboardGrid.test.tsx:~184` ✅

---

### widget-resize

**WRS-R1: Each widget exposes a resize handle**
- **WRS-R1-S1** Handle rendered by default → `components/__tests__/DashboardGrid.test.tsx:~55` ✅
- **WRS-R1-S2** Handle not rendered when disabled → `components/__tests__/DashboardGrid.test.tsx:~63` ✅

**WRS-R2: Resize drag maps to snapped grid size**
- **WRS-R2-S1** Preview snaps to cell boundary
  - `utils/__tests__/snap.test.ts:~31` — "rounds offset to nearest column for width" (Unit)
- **WRS-R2-S2** Preview updates continuously → ⚠️ stub (`describe.skip`)

**WRS-R3: Size constraints enforced**
- **WRS-R3-S1** Below minimum clamped → `utils/__tests__/snap.test.ts:~37` ✅
- **WRS-R3-S2** Above maximum clamped → `utils/__tests__/snap.test.ts:~43` ✅
- **WRS-R3-S3** Pointer outside grid clamped → `utils/__tests__/snap.test.ts:~49` ✅

**WRS-R4: Successful resize commits layout change**
- **WRS-R4-S1** Happy path → ⚠️ stub (`describe.skip`)
- **WRS-R4-S2** No overlap after resize
  - `utils/__tests__/layout.test.ts:35` — "pushes a single displaced widget down" (Unit)

**WRS-R5: Displaced widgets pushed downward**
- **WRS-R5-S1** Single push → `utils/__tests__/layout.test.ts:35` ✅
- **WRS-R5-S2** Cascade push → `utils/__tests__/layout.test.ts:44` ✅
- **WRS-R5-S3** Refused when impossible → ⚠️ stub (`describe.skip`)
- **WRS-R5-S4** Refused at depth limit → `utils/__tests__/layout.test.ts:56` ⚠️ (weak assertion — `null || Array` accepted)

**WRS-R6: Escape cancels resize**
- **WRS-R6-S1** Escape cancels → ⚠️ stub (`describe.skip`)

---

## Stub Locations (pointer-event stubs requiring future integration tests)

All 14 stubs are in `src/dashboard/components/__tests__/DashboardGrid.test.tsx` inside `describe.skip` blocks:

- `describe.skip('drag-to-move — pointer interaction')` — 9 stubs (DD-R1 through DD-R6)
- `describe.skip('resize — pointer interaction')` — 5 stubs (WRS-R2-S2, WRS-R4-S1/S2, WRS-R5-S3, WRS-R6-S1)

**Recommended path to cover stubs**: Add `@playwright/test` or `cypress` and drive the dashboard in a real browser, or use `@dnd-kit/testing` utilities once they support jsdom pointer simulation.
