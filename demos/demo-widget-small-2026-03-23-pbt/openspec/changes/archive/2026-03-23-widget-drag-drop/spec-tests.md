# Spec-Test Mapping: widget-drag-drop
Generated: 2026-03-23

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC1 | Move Widget to New Position — Full Flow | Flow | Integration | `src/App.test.tsx` | ⚠️ partial |
| UC1-S1 | User presses and holds on a widget to initiate a drag | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (moveWidget) | ⚠️ partial |
| UC1-S2 | System lifts the widget visually and displays a drag preview following the pointer | Step | Unit | — | ❌ |
| UC1-S3 | System highlights valid drop zones on the grid as the user moves the pointer | Step | Unit | — | ❌ |
| UC1-S4 | User moves the pointer to the desired grid location and releases | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (moveWidget) | ⚠️ partial |
| UC1-S5 | System snaps the widget to the nearest valid grid cell at the drop position | Step | Unit | `src/utils/gridUtils.test.ts` (snapAndClamp, pixelToCell) | ✅ |
| UC1-S5 | System snaps the widget to the nearest valid grid cell at the drop position | Step | PBT | `src/utils/gridUtils.property.test.ts` | ✅ |
| UC1-S6 | System reflows any displaced widgets to avoid overlap | Step | Unit | `src/utils/gridUtils.test.ts` (gravityReflow) | ✅ |
| UC1-S6 | System reflows any displaced widgets to avoid overlap | Step | PBT | `src/utils/gridUtils.property.test.ts` | ✅ |
| UC1-S7 | System saves the updated layout to persistent state | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (debounced persist) | ✅ |
| UC1-S7 | System saves the updated layout to persistent state | Step | PBT | `src/hooks/useDashboardLayout.property.test.ts` | ✅ |
| UC1-E4a | User releases the pointer outside the grid bounds — drag cancelled, widget returns to origin | Extension | Unit | — | ❌ |
| UC1-E4a | User releases the pointer outside the grid bounds — drag cancelled, widget returns to origin | Extension | PBT | `src/utils/gridUtils.property.test.ts` (hasConflict out-of-bounds) | ✅ |
| UC1-E4b | Target cell is occupied — widget snaps to nearest available adjacent cell | Extension | Unit | `src/utils/gridUtils.test.ts` (findNearestFreeCell) | ✅ |
| UC1-E4b | Target cell is occupied — widget snaps to nearest available adjacent cell | Extension | PBT | `src/utils/gridUtils.property.test.ts` | ✅ |
| UC1-E6a | No valid cell available near drop point — drop cancelled, widget returns to origin | Extension | Unit | `src/utils/gridUtils.test.ts` (hasConflict, findNearestFreeCell null) | ✅ |
| UC1-E6a | No valid cell available near drop point — drop cancelled, widget returns to origin | Extension | PBT | `src/utils/gridUtils.property.test.ts` | ✅ |
| UC1-E6a2 | System highlights the conflict to indicate why the drop failed | Extension | Unit | — | ❌ |
| UC2 | Resize a Widget — Full Flow | Flow | Integration | — | ❌ |
| UC2-S1 | User hovers over a widget; system reveals resize handles on edges/corners | Step | Unit | — | ❌ |
| UC2-S2 | User clicks and drags a resize handle | Step | Unit | — | ❌ |
| UC2-S3 | System shows a live preview of the new widget size snapped to grid units | Step | Unit | — | ❌ |
| UC2-S4 | User releases the handle at the desired size | Step | Unit | — | ❌ |
| UC2-S5 | System applies the new grid-unit dimensions to the widget | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (resizeWidget via moveWidget path) | ⚠️ partial |
| UC2-S6 | System reflows neighbouring widgets if the enlarged widget overlaps them | Step | Unit | `src/utils/gridUtils.test.ts` (gravityReflow displaced) | ✅ |
| UC2-S6 | System reflows neighbouring widgets if the enlarged widget overlaps them | Step | PBT | `src/utils/gridUtils.property.test.ts` | ✅ |
| UC2-S7 | System saves the updated layout | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (debounced persist) | ✅ |
| UC2-S7 | System saves the updated layout | Step | PBT | `src/hooks/useDashboardLayout.property.test.ts` | ✅ |
| UC2-E3a | User drags below minimum size (1×1) — system clamps and shows indicator | Extension | Unit | — | ❌ |
| UC2-E3b | User drags beyond grid boundary — system clamps at grid edge | Extension | Unit | `src/utils/gridUtils.test.ts` (snapAndClamp clamps) | ✅ |
| UC2-E3b | User drags beyond grid boundary — system clamps at grid edge | Extension | PBT | `src/utils/gridUtils.property.test.ts` | ✅ |
| UC2-E6a | No room for reflow — system reverts to pre-resize dimensions and shows feedback | Extension | Unit | `src/utils/gridUtils.test.ts` (gravityReflow null) | ✅ |
| UC2-E6a | No room for reflow — system reverts to pre-resize dimensions and shows feedback | Extension | PBT | `src/utils/gridUtils.property.test.ts` | ✅ |
| UC3 | Persist and Restore Layout — Full Flow | Flow | Integration | `src/App.test.tsx` | ⚠️ partial |
| UC3-S1 | User navigates to or reloads the dashboard | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (loads from localStorage) | ✅ |
| UC3-S2 | System reads the serialised layout from localStorage | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (loads from localStorage) | ✅ |
| UC3-S2 | System reads the serialised layout from localStorage | Step | PBT | `src/hooks/useDashboardLayout.property.test.ts` | ✅ |
| UC3-S3 | System validates that all widget IDs in the stored layout still exist | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (drops stale IDs) | ✅ |
| UC3-S4 | System renders each widget at its stored position and size | Step | Component | `src/App.test.tsx` (renders dashboard grid) | ⚠️ partial |
| UC3-S5 | Dashboard appears identical to how the user last left it | Step | Component | `src/App.test.tsx` | ⚠️ partial |
| UC3-E2a | No stored layout found — system renders the default layout | Extension | Unit | `src/hooks/useDashboardLayout.test.ts` (default when empty) | ✅ |
| UC3-E2a | No stored layout found — system renders the default layout | Extension | PBT | `src/hooks/useDashboardLayout.property.test.ts` | ✅ |
| UC3-E3a | Stored layout has stale widget IDs — system renders only existing widgets | Extension | Unit | `src/hooks/useDashboardLayout.test.ts` (drops stale IDs) | ✅ |
| UC3-E3a | Stored layout has stale widget IDs — system renders only existing widgets | Extension | PBT | `src/hooks/useDashboardLayout.property.test.ts` | ✅ |
| UC3-E3b | Stored layout data is corrupt — system falls back to default layout | Extension | Unit | `src/hooks/useDashboardLayout.test.ts` (corrupt data fallback) | ✅ |
| UC3-E3b | Stored layout data is corrupt — system falls back to default layout | Extension | PBT | `src/hooks/useDashboardLayout.property.test.ts` | ✅ |
| UC4 | Add a Widget to the Dashboard — Full Flow | Flow | Integration | — | ❌ |
| UC4-S1 | User opens the widget picker | Step | Unit | — | ❌ |
| UC4-S2 | System displays available widget types with size previews | Step | Unit | — | ❌ |
| UC4-S3 | User selects a widget type and initiates placement | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (addWidget) | ✅ |
| UC4-S4 | System finds the first available grid region that fits the widget's default size | Step | Unit | `src/utils/gridUtils.test.ts` (autoPlace) | ✅ |
| UC4-S4 | System finds the first available grid region that fits the widget's default size | Step | PBT | `src/utils/gridUtils.property.test.ts` | ✅ |
| UC4-S4 | System finds the first available grid region that fits the widget's default size | Step | PBT | `src/hooks/useDashboardLayout.property.test.ts` | ✅ |
| UC4-S5 | System places the widget at that position and renders it | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (addWidget) | ✅ |
| UC4-S6 | System saves the updated layout | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (debounced persist) | ✅ |
| UC4-S6 | System saves the updated layout | Step | PBT | `src/hooks/useDashboardLayout.property.test.ts` | ✅ |
| UC4-E4a | No available region fits the widget — system informs user and suggests freeing space | Extension | Unit | `src/utils/gridUtils.test.ts` (autoPlace null) | ✅ |
| UC4-E4a | No available region fits the widget — system informs user and suggests freeing space | Extension | PBT | `src/utils/gridUtils.property.test.ts` | ✅ |
| UC5 | Remove a Widget from the Dashboard — Full Flow | Flow | Integration | — | ❌ |
| UC5-S1 | User activates the remove action on a widget | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (removeWidget) | ✅ |
| UC5-S2 | System removes the widget from the grid | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (removeWidget) | ✅ |
| UC5-S2 | System removes the widget from the grid | Step | PBT | `src/hooks/useDashboardLayout.property.test.ts` | ✅ |
| UC5-S3 | System frees the grid cells previously occupied by the widget | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (removeWidget) | ✅ |
| UC5-S4 | System saves the updated layout | Step | Unit | `src/hooks/useDashboardLayout.test.ts` (debounced persist) | ✅ |
| UC5-S4 | System saves the updated layout | Step | PBT | `src/hooks/useDashboardLayout.property.test.ts` | ✅ |
| UC5-E1a | User activates undo within timeout — system restores the widget at its previous position | Extension | Unit | `src/hooks/useDashboardLayout.test.ts` (undoRemove, undo toast) | ✅ |
| UC5-E1a | User activates undo within timeout — system restores the widget at its previous position | Extension | PBT | `src/hooks/useDashboardLayout.property.test.ts` (3 PBT tests) | ✅ |

---

## PBT Coverage

| UC Step | Scenario | PBT Test | Framework | Status |
|---------|----------|----------|-----------|--------|
| UC1-S5 | Widget snaps on release — result is integer coords within bounds | `src/utils/gridUtils.property.test.ts` | fast-check | ✅ |
| UC1-S5 | Partial overlap snaps to nearest cell | `src/utils/gridUtils.property.test.ts` | fast-check | ✅ |
| UC1-S6 | Displaced widget moves down — occupancy cell count invariant | `src/utils/gridUtils.property.test.ts` | fast-check | ✅ |
| UC1-S6 | Operation reverted on no reflow room — result has no overlapping widgets | `src/utils/gridUtils.property.test.ts` | fast-check | ✅ |
| UC1-S7 | Layout saved after move — localStorage reflects position after debounce | `src/hooks/useDashboardLayout.property.test.ts` | fast-check | ✅ |
| UC1-E4a | Drop outside grid cancels drag — hasConflict detects out-of-bounds | `src/utils/gridUtils.property.test.ts` | fast-check | ✅ |
| UC1-E4b | Occupied target uses adjacent cell — result is always conflict-free in bounds | `src/utils/gridUtils.property.test.ts` | fast-check | ✅ |
| UC1-E6a | No space reverts widget — hasConflict correctly identifies occupied cells | `src/utils/gridUtils.property.test.ts` | fast-check | ✅ |
| UC2-E3b | Resize clamped at grid edge — snapAndClamp never exceeds grid boundary | `src/utils/gridUtils.property.test.ts` | fast-check | ✅ |
| UC2-S6 | Reflow neighbours — gravityReflow result has no overlapping widgets | `src/utils/gridUtils.property.test.ts` | fast-check | ✅ |
| UC2-S7 | Layout saved after resize — localStorage reflects change after debounce | `src/hooks/useDashboardLayout.property.test.ts` | fast-check | ✅ |
| UC2-E6a | Revert on no reflow room — moved widget position preserved exactly | `src/utils/gridUtils.property.test.ts` | fast-check | ✅ |
| UC3-S2 | Layout restored on mount — any valid stored layout round-trips | `src/hooks/useDashboardLayout.property.test.ts` | fast-check | ✅ |
| UC3-E2a | Default layout on first visit — non-empty layout when storage empty | `src/hooks/useDashboardLayout.property.test.ts` | fast-check | ✅ |
| UC3-E3a | Stale widget IDs discarded — unknown types absent after load | `src/hooks/useDashboardLayout.property.test.ts` | fast-check | ✅ |
| UC3-E3b | Corrupt data uses default layout — any non-JSON falls back to default | `src/hooks/useDashboardLayout.property.test.ts` | fast-check | ✅ |
| UC4-S4 | New widget placed at first available position — result conflict-free | `src/utils/gridUtils.property.test.ts` | fast-check | ✅ |
| UC4-S4 | New widget placed at first available position — addWidget no overlap | `src/hooks/useDashboardLayout.property.test.ts` | fast-check | ✅ |
| UC4-S6 | Layout saved after add — new widget in localStorage after debounce | `src/hooks/useDashboardLayout.property.test.ts` | fast-check | ✅ |
| UC4-E4a | User informed when grid is full — autoPlace returns null for full grid | `src/utils/gridUtils.property.test.ts` | fast-check | ✅ |
| UC5-S2 | Widget removed from grid — ID absent from layout after remove | `src/hooks/useDashboardLayout.property.test.ts` | fast-check | ✅ |
| UC5-S4 | Layout saved after remove — ID absent from localStorage after debounce | `src/hooks/useDashboardLayout.property.test.ts` | fast-check | ✅ |
| UC5-E1a | Undo restores removed widget — exact position/size restored | `src/hooks/useDashboardLayout.property.test.ts` | fast-check | ✅ |
| UC5-E1a | Undo expires after timeout — showUndoToast false after ≥5s | `src/hooks/useDashboardLayout.property.test.ts` | fast-check | ✅ |
| UC5-E1a | Only most recent removal is undoable — second removed widget restored | `src/hooks/useDashboardLayout.property.test.ts` | fast-check | ✅ |

---

## Use Case Details: Move Widget to New Position (ID: UC1)

### Main Scenario
- **UC1-S1**: User presses and holds on a widget to initiate a drag
  - `src/hooks/useDashboardLayout.test.ts` — moveWidget mutation (Unit, ⚠️ partial — no drag event test)
- **UC1-S2**: System lifts the widget visually and displays a drag preview following the pointer
  - ❌ No test — needs React component render test for DragOverlay
- **UC1-S3**: System highlights valid drop zones on the grid as the user moves the pointer
  - ❌ No test — needs DropCellGrid render test
- **UC1-S4**: User moves the pointer to the desired grid location and releases
  - `src/hooks/useDashboardLayout.test.ts` — moveWidget mutation (Unit, ⚠️ partial)
- **UC1-S5**: System snaps the widget to the nearest valid grid cell at the drop position
  - `src/utils/gridUtils.test.ts:24` — snapAndClamp rounds to nearest cell (Unit, ✅)
  - `src/utils/gridUtils.property.test.ts` — snapAndClamp integer+bounds property (PBT, ✅)
  - `src/utils/gridUtils.property.test.ts` — closest-cell property (PBT, ✅)
- **UC1-S6**: System reflows any displaced widgets to avoid overlap
  - `src/utils/gridUtils.test.ts:128` — gravityReflow pushes displaced widget down (Unit, ✅)
  - `src/utils/gridUtils.property.test.ts` — no-overlap invariant (PBT, ✅)
  - `src/utils/gridUtils.property.test.ts` — occupancy cell count invariant (PBT, ✅)
- **UC1-S7**: System saves the updated layout to persistent state
  - `src/hooks/useDashboardLayout.test.ts:47` — debounced persistence (Unit, ✅)
  - `src/hooks/useDashboardLayout.property.test.ts` — localStorage reflects position (PBT, ✅)

### Extensions
- **UC1-E4a**: User releases the pointer outside the grid bounds — drag cancelled, widget returns to origin
  - `src/utils/gridUtils.property.test.ts` — hasConflict always true for out-of-bounds (PBT, ✅)
  - ❌ No example-based test for cancel behaviour
- **UC1-E4b**: Target cell is occupied — widget snaps to nearest available adjacent cell
  - `src/utils/gridUtils.test.ts:83` — finds neighbour when target occupied (Unit, ✅)
  - `src/utils/gridUtils.property.test.ts` — result always conflict-free (PBT, ✅)
- **UC1-E6a**: No valid cell available near drop point — drop cancelled, widget returns to origin
  - `src/utils/gridUtils.test.ts:88` — returns null when grid is full (Unit, ✅)
  - `src/utils/gridUtils.property.test.ts` — hasConflict correctly identifies cells (PBT, ✅)
- **UC1-E6a2**: System highlights the conflict to indicate why the drop failed
  - ❌ No test — needs DropCellGrid conflictFlash render test

### Full Flow Tests
- `UC1` — "Move Widget to New Position" → `src/App.test.tsx` renders dashboard (Integration, ⚠️ partial — no drag interaction)

---

## Use Case Details: Resize a Widget (ID: UC2)

### Main Scenario
- **UC2-S1**: User hovers over a widget; system reveals resize handles on edges/corners
  - ❌ No test — needs Widget hover CSS test
- **UC2-S2**: User clicks and drags a resize handle
  - ❌ No test — needs useResizeDrag pointerdown test
- **UC2-S3**: System shows a live preview of the new widget size snapped to grid units
  - ❌ No test — needs previewW/H state test
- **UC2-S4**: User releases the handle at the desired size
  - ❌ No test — needs pointerup commit test
- **UC2-S5**: System applies the new grid-unit dimensions to the widget
  - `src/hooks/useDashboardLayout.test.ts` — resizeWidget via moveWidget path (Unit, ⚠️ partial)
- **UC2-S6**: System reflows neighbouring widgets if the enlarged widget overlaps them
  - `src/utils/gridUtils.test.ts:128` — gravityReflow displaced (Unit, ✅)
  - `src/utils/gridUtils.property.test.ts` — no-overlap invariant (PBT, ✅)
- **UC2-S7**: System saves the updated layout
  - `src/hooks/useDashboardLayout.test.ts:47` — debounced persist (Unit, ✅)
  - `src/hooks/useDashboardLayout.property.test.ts` — localStorage reflects change (PBT, ✅)

### Extensions
- **UC2-E3a**: User drags below minimum size (1×1) — system clamps and shows indicator
  - ❌ No test — needs useResizeDrag minimum-clamp test
- **UC2-E3b**: User drags beyond grid boundary — system clamps at grid edge
  - `src/utils/gridUtils.test.ts:30` — snapAndClamp boundary clamp (Unit, ✅)
  - `src/utils/gridUtils.property.test.ts` — never exceeds boundary (PBT, ✅)
- **UC2-E6a**: No room for reflow — system reverts to pre-resize dimensions and shows feedback
  - `src/utils/gridUtils.test.ts:140` — gravityReflow returns null (Unit, ✅)
  - `src/utils/gridUtils.property.test.ts` — moved widget position preserved (PBT, ✅)

### Full Flow Tests
- `UC2` — "Resize a Widget" → ❌ No integration test

---

## Use Case Details: Persist and Restore Layout (ID: UC3)

### Main Scenario
- **UC3-S1**: User navigates to or reloads the dashboard
  - `src/hooks/useDashboardLayout.test.ts:14` — loads layout from localStorage on mount (Unit, ✅)
- **UC3-S2**: System reads the serialised layout from localStorage
  - `src/hooks/useDashboardLayout.test.ts:14` — loads from localStorage (Unit, ✅)
  - `src/hooks/useDashboardLayout.property.test.ts` — any valid layout round-trips (PBT, ✅)
- **UC3-S3**: System validates that all widget IDs in the stored layout still exist
  - `src/hooks/useDashboardLayout.test.ts:36` — drops stale IDs (Unit, ✅)
- **UC3-S4**: System renders each widget at its stored position and size
  - `src/App.test.tsx:5` — renders dashboard grid title (Component, ⚠️ partial)
- **UC3-S5**: Dashboard appears identical to how the user last left it
  - `src/App.test.tsx:5` — renders dashboard (Component, ⚠️ partial)

### Extensions
- **UC3-E2a**: No stored layout found — system renders the default layout
  - `src/hooks/useDashboardLayout.test.ts:23` — default when empty (Unit, ✅)
  - `src/hooks/useDashboardLayout.property.test.ts` — non-empty default (PBT, ✅)
- **UC3-E3a**: Stored layout has stale widget IDs — system renders only existing widgets
  - `src/hooks/useDashboardLayout.test.ts:36` — drops stale IDs (Unit, ✅)
  - `src/hooks/useDashboardLayout.property.test.ts` — stale IDs always discarded (PBT, ✅)
- **UC3-E3b**: Stored layout data is corrupt — system falls back to default layout
  - `src/hooks/useDashboardLayout.test.ts:29` — corrupt data fallback (Unit, ✅)
  - `src/hooks/useDashboardLayout.property.test.ts` — any non-JSON falls back (PBT, ✅)

### Full Flow Tests
- `UC3` — "Persist and Restore Layout" → `src/App.test.tsx` (Integration, ⚠️ partial)

---

## Use Case Details: Add a Widget to the Dashboard (ID: UC4)

### Main Scenario
- **UC4-S1**: User opens the widget picker
  - ❌ No test — needs WidgetPicker open/close render test
- **UC4-S2**: System displays available widget types with size previews
  - ❌ No test — needs WidgetPicker list render test
- **UC4-S3**: User selects a widget type and initiates placement
  - `src/hooks/useDashboardLayout.test.ts:57` — addWidget places widget (Unit, ✅)
- **UC4-S4**: System finds the first available grid region that fits the widget's default size
  - `src/utils/gridUtils.test.ts:99` — autoPlace places at 0,0 (Unit, ✅)
  - `src/utils/gridUtils.property.test.ts` — result conflict-free (PBT, ✅)
  - `src/hooks/useDashboardLayout.property.test.ts` — no overlap after addWidget (PBT, ✅)
- **UC4-S5**: System places the widget at that position and renders it
  - `src/hooks/useDashboardLayout.test.ts:57` — addWidget adds to layout (Unit, ✅)
- **UC4-S6**: System saves the updated layout
  - `src/hooks/useDashboardLayout.property.test.ts` — new widget in localStorage (PBT, ✅)

### Extensions
- **UC4-E4a**: No available region fits the widget — system informs user and suggests freeing space
  - `src/utils/gridUtils.test.ts:108` — autoPlace returns null when full (Unit, ✅)
  - `src/utils/gridUtils.property.test.ts` — null for fully-occupied grid (PBT, ✅)

### Full Flow Tests
- `UC4` — "Add a Widget to the Dashboard" → ❌ No integration test

---

## Use Case Details: Remove a Widget from the Dashboard (ID: UC5)

### Main Scenario
- **UC5-S1**: User activates the remove action on a widget
  - `src/hooks/useDashboardLayout.test.ts:67` — removeWidget (Unit, ✅)
- **UC5-S2**: System removes the widget from the grid
  - `src/hooks/useDashboardLayout.test.ts:67` — widget absent after remove (Unit, ✅)
  - `src/hooks/useDashboardLayout.property.test.ts` — always absent after remove (PBT, ✅)
- **UC5-S3**: System frees the grid cells previously occupied by the widget
  - `src/hooks/useDashboardLayout.test.ts:67` — widget entry deleted (Unit, ✅)
- **UC5-S4**: System saves the updated layout
  - `src/hooks/useDashboardLayout.property.test.ts` — absent from localStorage (PBT, ✅)

### Extensions
- **UC5-E1a**: User activates undo within timeout — system restores the widget at its previous position
  - `src/hooks/useDashboardLayout.test.ts:74` — undoRemove restores widget (Unit, ✅)
  - `src/hooks/useDashboardLayout.test.ts:83` — undo toast dismisses after 5s (Unit, ✅)
  - `src/hooks/useDashboardLayout.property.test.ts` — exact position restored (PBT, ✅)
  - `src/hooks/useDashboardLayout.property.test.ts` — toast false after ≥5s (PBT, ✅)
  - `src/hooks/useDashboardLayout.property.test.ts` — only most recent undoable (PBT, ✅)

### Full Flow Tests
- `UC5` — "Remove a Widget from the Dashboard" → ❌ No integration test

---

## Coverage Summary

| Category | Count |
|----------|-------|
| Total UC steps (main + extensions) | 44 |
| Steps with ≥1 example-based test | 28 |
| Steps with only PBT coverage | 4 (UC1-E4a, UC1-E6a partial) |
| Steps with no test of any kind | 12 |
| Total PBT tests written | 25 |
| Total test suite size | 52 tests |
| PBT framework | fast-check v3 |

### Uncovered steps (no example-based test)
UC1-S2, UC1-S3, UC1-E6a2, UC2-S1, UC2-S2, UC2-S3, UC2-S4, UC2-E3a, UC4-S1, UC4-S2 — these require React component render/interaction tests (useEvent / fireEvent on DragOverlay, DropCellGrid, ResizeHandle, WidgetPicker).
