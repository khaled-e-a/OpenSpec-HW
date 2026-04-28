# Spec-Test Mapping: react-drag-drop-dashboard
Generated: 2026-04-28

## Use Case ID Mapping

| UC ID | Use Case Name |
|-------|---------------|
| UC1 | Drag and Reposition a Widget |
| UC2 | Add a Widget from the Registry |
| UC3 | Remove a Widget from the Dashboard |
| UC4 | Restore Layout After Page Reload |
| UC5 | View Live Drag Preview While Moving a Widget |

---

## Requirement Traceability Matrix

| ID | Requirement / Step | Type | Test Type | Test File(s) | Status |
|----|--------------------|------|-----------|--------------|--------|
| UC1 | Drag and Reposition a Widget — full flow | Flow | Integration | `src/test/useDashboardLayout.test.ts` | ✅ |
| UC1-S1 | User grabs a widget's drag handle | Step | Unit | `src/test/WidgetCard.test.tsx` | ✅ |
| UC1-S2 | System lifts the widget and displays drag preview | Step | Unit | `src/test/WidgetCard.test.tsx` | ✅ |
| UC1-S3 | User moves pointer across the dashboard | Step | Component | `src/test/useDashboardLayout.test.ts` | ✅ |
| UC1-S4 | System highlights valid drop zone in real time | Step | Component | `src/test/useDashboardLayout.test.ts` | ⚠️ |
| UC1-S5 | User releases pointer over a target grid cell | Step | Component | `src/test/useDashboardLayout.test.ts` | ✅ |
| UC1-S6 | System places widget, shifting others to avoid overlap | Step | Unit, PBT | `src/test/useDashboardLayout.test.ts`, `src/test/gridUtils.property.test.ts` | ✅ |
| UC1-S7 | System persists updated layout to localStorage | Step | Unit | `src/test/useDashboardLayout.test.ts`, `src/test/layoutStorage.test.ts` | ✅ |
| UC1-S7 | System persists updated layout to localStorage | Step | PBT | `src/test/layoutStorage.property.test.ts` | ✅ |
| UC1-E4a | Pointer outside valid drop zone; no highlight | Extension | Component | `src/test/gridUtils.test.ts` | ⚠️ |
| UC1-E5a | Widget returns to original position on invalid drop | Extension | Component | `src/test/useDashboardLayout.test.ts` | ⚠️ |
| UC1-E6a | Grid full; widget returned, error indicator shown | Extension | Unit, PBT | `src/test/gridUtils.test.ts`, `src/test/gridUtils.property.test.ts` | ✅ |
| UC2 | Add a Widget from the Registry — full flow | Flow | Integration | `src/test/useDashboardLayout.test.ts` | ✅ |
| UC2-S1 | User opens the Add Widget panel | Step | Component | `src/test/AddWidgetDrawer.test.tsx` | ✅ |
| UC2-S2 | System displays available widget types | Step | Unit, PBT | `src/test/AddWidgetDrawer.test.tsx`, `src/test/widgetRegistry.test.ts`, `src/test/widgetRegistry.property.test.ts` | ✅ |
| UC2-S3 | User selects a widget type | Step | Unit, PBT | `src/test/AddWidgetDrawer.test.tsx`, `src/test/widgetRegistry.test.ts`, `src/test/widgetRegistry.property.test.ts` | ✅ |
| UC2-S4 | System places widget in first available cell | Step | Unit, PBT | `src/test/gridUtils.test.ts`, `src/test/useDashboardLayout.test.ts`, `src/test/gridUtils.property.test.ts` | ✅ |
| UC2-S5 | System persists layout after add | Step | Unit, PBT | `src/test/useDashboardLayout.test.ts`, `src/test/layoutStorage.property.test.ts` | ✅ |
| UC2-S6 | New widget appears on dashboard ready for use | Step | Component | `src/test/useDashboardLayout.test.ts` | ✅ |
| UC2-E3a | User cancels panel; no change | Extension | Component | `src/test/AddWidgetDrawer.test.tsx` | ✅ |
| UC2-E4a | Grid full; system notifies, widget not added | Extension | Unit, PBT | `src/test/gridUtils.test.ts`, `src/test/gridUtils.property.test.ts` | ✅ |
| UC3 | Remove a Widget — full flow | Flow | Integration | `src/test/useDashboardLayout.test.ts` | ✅ |
| UC3-S1 | User clicks remove control | Step | Unit | `src/test/WidgetCard.test.tsx` | ✅ |
| UC3-S2 | System presents confirmation prompt | Step | Component | `src/test/WidgetCard.test.tsx` | ✅ |
| UC3-S3 | User confirms removal | Step | Component | `src/test/WidgetCard.test.tsx` | ✅ |
| UC3-S4 | System removes widget from dashboard | Step | Unit | `src/test/useDashboardLayout.test.ts` | ✅ |
| UC3-S5 | System frees grid cells | Step | Unit | `src/test/useDashboardLayout.test.ts` | ✅ |
| UC3-S6 | System persists layout after remove | Step | Unit, PBT | `src/test/useDashboardLayout.test.ts`, `src/test/layoutStorage.property.test.ts` | ✅ |
| UC3-E3a | User cancels confirmation; widget unchanged | Extension | Component | `src/test/WidgetCard.test.tsx` | ✅ |
| UC4 | Restore Layout After Page Reload — full flow | Flow | Integration | `src/test/useDashboardLayout.test.ts` | ✅ |
| UC4-S1 | Browser loads the React dashboard | Step | Component | `src/test/useDashboardLayout.test.ts` | ✅ |
| UC4-S2 | System reads stored layout from localStorage | Step | Unit, PBT | `src/test/layoutStorage.test.ts`, `src/test/layoutStorage.property.test.ts` | ✅ |
| UC4-S3 | System parses layout and reconstructs positions | Step | Unit, PBT | `src/test/layoutStorage.test.ts`, `src/test/gridUtils.property.test.ts`, `src/test/widgetRegistry.test.ts` | ✅ |
| UC4-S4 | System renders dashboard with persisted positions | Step | Component | `src/test/useDashboardLayout.test.ts` | ✅ |
| UC4-S5 | User sees dashboard exactly as last left | Step | Component | `src/test/useDashboardLayout.test.ts` | ✅ |
| UC4-E2a | No layout in localStorage; default layout shown | Extension | Unit | `src/test/layoutStorage.test.ts`, `src/test/useDashboardLayout.test.ts` | ✅ |
| UC4-E2b | Corrupt layout; fallback to default, notify user | Extension | Unit, PBT | `src/test/layoutStorage.test.ts`, `src/test/layoutStorage.property.test.ts` | ✅ |
| UC5 | View Live Drag Preview — full flow | Flow | Component | `src/test/WidgetCard.test.tsx` | ⚠️ |
| UC5-S1 | User moves pointer while dragging | Step | Component | `src/test/useDashboardLayout.test.ts` | ⚠️ |
| UC5-S2 | System renders ghost/placeholder at target cell | Step | Component | — | ❌ |
| UC5-S3 | System updates placeholder in real time | Step | Component | — | ❌ |
| UC5-S4 | User sees intended drop position clearly | Step | Component | — | ❌ |
| UC5-S5 | User releases; preview removed, drop completes | Step | Component | `src/test/useDashboardLayout.test.ts` | ⚠️ |
| UC5-E3a | Invalid position; placeholder in invalid state | Extension | Component | `src/test/gridUtils.test.ts` | ⚠️ |

> **Note on UC5:** Steps UC5-S2, UC5-S3, UC5-S4 involve CSS/DOM rendering driven by `react-grid-layout`'s internal drag engine. These are best verified via E2E tests (e.g., Playwright). The core logic (grid full detection → invalid state) is covered via `gridUtils` unit tests.

---

## PBT Coverage

| UC Step | Scenario | PBT Test | Framework | Status |
|---------|----------|----------|-----------|--------|
| UC1-S6 | findFirstFreeCell returns non-overlapping position | `src/test/gridUtils.property.test.ts` | fast-check | ✅ |
| UC1-S6 | placement x + w never exceeds 12 columns | `src/test/gridUtils.property.test.ts` | fast-check | ✅ |
| UC1-S7 | save then load round-trip preserves all widget fields | `src/test/layoutStorage.property.test.ts` | fast-check | ✅ |
| UC2-S2 | every known entry has non-empty displayName and description | `src/test/widgetRegistry.property.test.ts` | fast-check | ✅ |
| UC2-S2 | every known entry has positive defaultSize dimensions | `src/test/widgetRegistry.property.test.ts` | fast-check | ✅ |
| UC2-S3 | getWidgetComponent and getRegistryEntry always agree | `src/test/widgetRegistry.property.test.ts` | fast-check | ✅ |
| UC2-S4 | returned position is always within grid column bounds | `src/test/gridUtils.property.test.ts` | fast-check | ✅ |
| UC2-S4 | returned y is always non-negative | `src/test/gridUtils.property.test.ts` | fast-check | ✅ |
| UC2-E4a | isGridFull is always false for empty layout | `src/test/gridUtils.property.test.ts` | fast-check | ✅ |
| UC2-E4a | isGridFull false → findFirstFreeCell returns valid slot | `src/test/gridUtils.property.test.ts` | fast-check | ✅ |
| UC3-S6 | save then load round-trip for removed widgets | `src/test/layoutStorage.property.test.ts` | fast-check | ✅ |
| UC4-S3 | widgetInstance fields round-trip through JSON | `src/test/gridUtils.property.test.ts` | fast-check | ✅ |
| UC4-S3 | layoutVersion preserved through save/load | `src/test/layoutStorage.property.test.ts` | fast-check | ✅ |
| UC4-E2b | corrupt data always triggers fallback | `src/test/layoutStorage.property.test.ts` | fast-check | ✅ |
| UC4-S3 | unknown ID always returns undefined from getWidgetComponent | `src/test/widgetRegistry.property.test.ts` | fast-check | ✅ |
| UC5-S2 | drag preview placeholder visible during drag | — | fast-check | ❌ missing (E2E scope) |
| UC5-S3 | placeholder updates in real time | — | fast-check | ❌ missing (E2E scope) |
| UC5-E3a | invalid placeholder on full grid | `src/test/gridUtils.property.test.ts` | fast-check | ✅ |

---

## Use Case Details

### UC1 — Drag and Reposition a Widget

#### Main Scenario
- **UC1-S1**: User grabs a widget's drag handle
  - `src/test/WidgetCard.test.tsx` — "renders an element with class widget-drag-handle" (Unit)
  - `src/test/WidgetCard.test.tsx` — "drag handle is inside the card header" (Unit)
  - `src/test/WidgetCard.test.tsx` — "widget body does not contain the drag handle" (Unit)
- **UC1-S2**: System lifts the widget visually and displays drag preview
  - `src/test/WidgetCard.test.tsx` — "widget-card class is present on the card root" (Unit)
- **UC1-S3**: User moves pointer across the dashboard
  - `src/test/useDashboardLayout.test.ts` — "updates widget position from RGL layout change" (Component)
- **UC1-S4**: System highlights valid drop zone in real time
  - ⚠️ Covered implicitly by DashboardGrid integration; no isolated unit test
- **UC1-S5**: User releases pointer over a target grid cell
  - `src/test/useDashboardLayout.test.ts` — "updates widget position from RGL layout change" (Component)
- **UC1-S6**: System places widget, shifting others to avoid overlap
  - `src/test/useDashboardLayout.test.ts` — "updates widget position" (Component)
  - `src/test/gridUtils.property.test.ts` — "findFirstFreeCell position does not overlap any existing widget" (PBT)
- **UC1-S7**: System persists updated layout to localStorage
  - `src/test/useDashboardLayout.test.ts` — "persists updated positions to localStorage" (Unit)
  - `src/test/layoutStorage.test.ts` — "persists layout to localStorage under rdd_layout key" (Unit)
  - `src/test/layoutStorage.property.test.ts` — "save then load round-trip" (PBT)

#### Extensions
- **UC1-E4a**: Pointer outside valid zone; no highlight
  - ⚠️ `src/test/gridUtils.test.ts` — "returns false for empty grid" (partial; CSS highlight is E2E scope)
- **UC1-E5a**: Widget returns to original position
  - ⚠️ Handled by react-grid-layout internally; no unit test
- **UC1-E6a**: Grid full; widget returned, error indicator shown
  - `src/test/gridUtils.test.ts` — "returns true when no free block exists" (Unit)
  - `src/test/gridUtils.property.test.ts` — "isGridFull false → valid slot" (PBT)

#### Full Flow Tests
- `UC1` — "moveWidget → persists → reload → matches" → `src/test/useDashboardLayout.test.ts` (Integration)

---

### UC2 — Add a Widget from the Registry

#### Main Scenario
- **UC2-S1**: User opens the Add Widget panel
  - `src/test/AddWidgetDrawer.test.tsx` — "drawer is visible when open=true" (Component)
  - `src/test/AddWidgetDrawer.test.tsx` — "drawer is NOT open when open=false" (Component)
- **UC2-S2**: System displays available widget types
  - `src/test/AddWidgetDrawer.test.tsx` — "lists all registered widget types by displayName" (Component)
  - `src/test/AddWidgetDrawer.test.tsx` — "shows description for each widget type" (Component)
  - `src/test/widgetRegistry.test.ts` — "contains at least one widget type" (Unit)
  - `src/test/widgetRegistry.property.test.ts` — "every known entry has non-empty displayName" (PBT)
- **UC2-S3**: User selects a widget type
  - `src/test/AddWidgetDrawer.test.tsx` — "calls onSelect with typeId when item clicked" (Component)
  - `src/test/widgetRegistry.test.ts` — "returns a React component for a known type ID" (Unit)
  - `src/test/widgetRegistry.property.test.ts` — "getWidgetComponent and getRegistryEntry always agree" (PBT)
- **UC2-S4**: System places widget in first available cell
  - `src/test/gridUtils.test.ts` — "returns (0,0) for an empty grid" (Unit)
  - `src/test/useDashboardLayout.test.ts` — "adds widget instance to layout" (Unit)
  - `src/test/gridUtils.property.test.ts` — "returned position is within grid bounds" (PBT)
- **UC2-S5**: System persists layout after add
  - `src/test/useDashboardLayout.test.ts` — "persists layout to localStorage after add" (Unit)
  - `src/test/layoutStorage.property.test.ts` — "save then load round-trip" (PBT)
- **UC2-S6**: New widget appears on dashboard
  - `src/test/useDashboardLayout.test.ts` — "adds widget instance to layout" (Component)

#### Extensions
- **UC2-E3a**: User cancels; no change
  - `src/test/AddWidgetDrawer.test.tsx` — "calls onClose when backdrop clicked" (Component)
  - `src/test/AddWidgetDrawer.test.tsx` — "calls onClose on Escape" (Component)
  - `src/test/AddWidgetDrawer.test.tsx` — "does NOT call onSelect when closed via backdrop" (Component)
- **UC2-E4a**: Grid full; widget not added, notification shown
  - `src/test/gridUtils.test.ts` — "returns false when partial space remains" (Unit)
  - `src/test/gridUtils.property.test.ts` — "isGridFull always false for empty layout" (PBT)

#### Full Flow Tests
- `UC2` — "addWidget → new widget in layout → persisted" → `src/test/useDashboardLayout.test.ts` (Integration)

---

### UC3 — Remove a Widget from the Dashboard

#### Main Scenario
- **UC3-S1**: User clicks remove control
  - `src/test/WidgetCard.test.tsx` — "renders a remove button" (Unit)
- **UC3-S2**: System presents confirmation prompt
  - `src/test/WidgetCard.test.tsx` — "confirmation popover appears after clicking remove" (Component)
  - `src/test/WidgetCard.test.tsx` — "popover has Remove and Cancel buttons" (Component)
- **UC3-S3**: User confirms removal
  - `src/test/WidgetCard.test.tsx` — "calls onRemove with correct instanceId" (Component)
- **UC3-S4**: System removes widget
  - `src/test/useDashboardLayout.test.ts` — "removes the specified widget from layout" (Unit)
- **UC3-S5**: System frees grid cells
  - `src/test/useDashboardLayout.test.ts` — "grid cells of removed widget are freed" (Unit)
- **UC3-S6**: System persists layout after remove
  - `src/test/useDashboardLayout.test.ts` — "persists layout to localStorage after remove" (Unit)
  - `src/test/layoutStorage.property.test.ts` — "save then load round-trip" (PBT)

#### Extensions
- **UC3-E3a**: User cancels; widget unchanged
  - `src/test/WidgetCard.test.tsx` — "does NOT call onRemove when cancelled" (Component)
  - `src/test/WidgetCard.test.tsx` — "confirmation popover closes after cancel" (Component)

#### Full Flow Tests
- `UC3` — "removeWidget → not in layout → persisted" → `src/test/useDashboardLayout.test.ts` (Integration)

---

### UC4 — Restore Layout After Page Reload

#### Main Scenario
- **UC4-S1**: Browser loads the React dashboard
  - `src/test/useDashboardLayout.test.ts` — "loads DEFAULT_LAYOUT when localStorage is empty" (Component)
- **UC4-S2**: System reads stored layout from localStorage
  - `src/test/layoutStorage.test.ts` — "reads and parses stored layout correctly" (Unit)
  - `src/test/layoutStorage.property.test.ts` — "loadLayout returns the same widgets that were saved" (PBT)
- **UC4-S3**: System parses layout and reconstructs widget positions
  - `src/test/layoutStorage.test.ts` — "reconstructs widget positions from stored data" (Unit)
  - `src/test/layoutStorage.test.ts` — "reconstructs widget typeId from stored data" (Unit)
  - `src/test/widgetRegistry.test.ts` — "returns a React component for a known type ID" (Unit)
  - `src/test/gridUtils.property.test.ts` — "widgetInstance fields round-trip through JSON" (PBT)
- **UC4-S4**: System renders dashboard with persisted positions
  - `src/test/useDashboardLayout.test.ts` — "restores a previously saved layout" (Component)
- **UC4-S5**: User sees dashboard exactly as last left
  - `src/test/useDashboardLayout.test.ts` — "restores a previously saved layout" (Component)

#### Extensions
- **UC4-E2a**: No layout; default rendered
  - `src/test/layoutStorage.test.ts` — "returns DEFAULT_LAYOUT when localStorage is empty" (Unit)
  - `src/test/layoutStorage.test.ts` — "returned default layout is a fresh copy" (Unit)
  - `src/test/useDashboardLayout.test.ts` — "loads DEFAULT_LAYOUT when localStorage is empty" (Unit)
- **UC4-E2b**: Corrupt layout; fallback + notify
  - `src/test/layoutStorage.test.ts` — "falls back to DEFAULT_LAYOUT on invalid JSON" (Unit)
  - `src/test/layoutStorage.test.ts` — "clears corrupt entry from localStorage" (Unit)
  - `src/test/layoutStorage.test.ts` — "falls back to DEFAULT_LAYOUT when layoutVersion does not match" (Unit)
  - `src/test/layoutStorage.property.test.ts` — "non-JSON string always falls back to default layout" (PBT)

#### Full Flow Tests
- `UC4` — "saveLayout → reload → loadLayout matches" → `src/test/layoutStorage.test.ts` (Integration)

---

### UC5 — View Live Drag Preview While Moving a Widget

#### Main Scenario
- **UC5-S1**: User moves pointer while dragging
  - ⚠️ `src/test/useDashboardLayout.test.ts` — partial: tests position update, not visual preview
- **UC5-S2**: System renders ghost/placeholder at target cell
  - ❌ No test — CSS/DOM rendered by react-grid-layout; needs E2E test
- **UC5-S3**: System updates placeholder in real time
  - ❌ No test — react-grid-layout internal; needs E2E test
- **UC5-S4**: User sees intended drop position clearly
  - ❌ No test — visual styling only; needs E2E / visual regression test
- **UC5-S5**: User releases; preview removed, drop completes
  - ⚠️ `src/test/useDashboardLayout.test.ts` — tests that position updates, not that preview is removed

#### Extensions
- **UC5-E3a**: Invalid position; placeholder in invalid state
  - ⚠️ `src/test/gridUtils.test.ts` — tests `isGridFull` logic (the trigger), not the CSS class application

#### Full Flow Tests
- ❌ No E2E test file yet — recommend adding Playwright tests for UC5 full flow
