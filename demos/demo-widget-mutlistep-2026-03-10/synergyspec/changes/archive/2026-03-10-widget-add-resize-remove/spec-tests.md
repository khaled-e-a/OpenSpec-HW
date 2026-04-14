# Spec-Test Mapping: widget-add-resize-remove
Generated: 2026-03-10

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC1 | Add Widget to Dashboard — Full Flow | Flow | Integration | `addRemoveResize.test.tsx:90` | ⚠️ |
| UC1-S1 | User activates the Add Widget control | Step | Component | `addRemoveResize.test.tsx:90` "7.2a — clicking Add Widget renders a new widget on the grid" | ✅ |
| UC1-S2 | System finds the first available grid cell (left-to-right, top-to-bottom) | Step | Unit | `findFirstOpenCell.test.ts:10` "returns {col:0,row:0} for an empty layout" | ✅ |
| UC1-S2 | System finds the first available grid cell (left-to-right, top-to-bottom) | Step | Unit | `findFirstOpenCell.test.ts:14` "scans left-to-right within a row first" | ✅ |
| UC1-S2 | System finds the first available grid cell (left-to-right, top-to-bottom) | Step | Unit | `findFirstOpenCell.test.ts:20` "moves to the next row when the current row is full" | ✅ |
| UC1-S2 | System finds the first available grid cell (left-to-right, top-to-bottom) | Step | Unit | `addRemoveResize.test.tsx:108` "7.2b — new widget placed at the first open cell" | ✅ |
| UC1-S3 | System creates a new widget entry with default size (1×1) at the found cell | Step | Unit | `addRemoveResize.test.tsx` "7.2d — new widget has default w:1 h:1" | ✅ |
| UC1-S4 | System updates layout state and re-renders the grid with the new widget | Step | Component | `addRemoveResize.test.tsx:90` "7.2a — clicking Add Widget renders a new widget on the grid" | ✅ |
| UC1-S5 | New widget is visible and available for interaction | Step | Component | `addRemoveResize.test.tsx:90` "7.2a — clicking Add Widget renders a new widget on the grid" | ⚠️ |
| UC1-E1a | No unoccupied cell exists — Add Widget control is disabled/unavailable | Extension | Unit | `findFirstOpenCell.test.ts:26` "returns null when the grid is completely full" | ✅ |
| UC1-E1a | No unoccupied cell exists — Add Widget control is disabled/unavailable | Extension | Component | `addRemoveResize.test.tsx:117` "7.2c — Add Widget button is disabled when grid is completely full" | ✅ |
| UC2 | Resize Widget — Full Flow | Flow | Integration | | ❌ |
| UC2-S1 | User presses down on the resize handle of a widget | Step | Unit | `addRemoveResize.test.tsx:237` "7.5a — resize handle is present for each widget" | ✅ |
| UC2-S1 | User presses down on the resize handle of a widget | Step | Component | `addRemoveResize.test.tsx:247` "7.5b — pressing Escape during resize does not commit layout change" | ⚠️ |
| UC2-S2 | System enters resize mode — ghost overlay shows current size at current position | Step | Component | `addRemoveResize.test.tsx` "7.5c — ghost element is rendered after pressing the resize handle" | ✅ |
| UC2-S3 | User drags the handle to change the widget's span | Step | Component | | ❌ jsdom limitation |
| UC2-S4 | System continuously updates ghost to reflect candidate new size, snapped to whole cells | Step | Unit | `addRemoveResize.test.tsx:189` "7.4a — candidate within bounds and no collision is valid" | ⚠️ |
| UC2-S5 | System validates candidate size: bounds check and collision check | Step | Unit | `addRemoveResize.test.tsx:189,197` "7.4a/b" | ✅ |
| UC2-S6 | Ghost reflects validity — valid normal, invalid shows "cannot resize" indicator | Step | Component | | ❌ jsdom limitation |
| UC2-S7 | User releases handle at the desired size | Step | Component | `addRemoveResize.test.tsx` "7.5d — pointerup after resize start calls onLayoutChange" | ✅ |
| UC2-S8 | System performs final validation of candidate size | Step | Component | `addRemoveResize.test.tsx` "7.5d — pointerup after resize start calls onLayoutChange" | ✅ |
| UC2-S9 | System commits new size — updates `w` and `h` in layout, re-renders widget | Step | Component | `addRemoveResize.test.tsx` "7.5d — pointerup after resize start calls onLayoutChange" | ✅ |
| UC2-S10 | Ghost is removed; widget renders at new size | Step | Component | `addRemoveResize.test.tsx` "7.5d — pointerup after resize start calls onLayoutChange" | ⚠️ |
| UC2-E3a | Candidate span would be zero — system clamps to 1×1 minimum | Extension | Unit | `addRemoveResize.test.tsx:213` "7.4d — clamping to minimum 1×1 produces a valid candidate" | ✅ |
| UC2-E5a | Candidate size overlaps widget or exceeds bounds — ghost shows "cannot resize" | Extension | Unit | `addRemoveResize.test.tsx:197,205` "7.4b/c" | ✅ |
| UC2-E7a | User releases at invalid size — resize cancelled, original size retained | Extension | Component | `addRemoveResize.test.tsx` "7.5e — skipped (jsdom limitation)" | ⚠️ |
| UC2-E7b | User presses Escape during resize — resize cancelled immediately, ghost removed | Extension | Component | `addRemoveResize.test.tsx:247` "7.5b — pressing Escape during resize does not commit layout change" | ✅ |
| UC3 | Remove Widget — Full Flow | Flow | Integration | `addRemoveResize.test.tsx:135` | ✅ |
| UC3-S1 | User activates the Remove control on a widget | Step | Component | `addRemoveResize.test.tsx:135` "7.3a — clicking remove button removes the widget" | ✅ |
| UC3-S2 | System removes the widget from layout state | Step | Component | `addRemoveResize.test.tsx:135` "7.3a — clicking remove button removes the widget" | ✅ |
| UC3-S3 | System re-renders the grid; occupied cells are now empty | Step | Component | `addRemoveResize.test.tsx:135` "7.3a — clicking remove button removes the widget" | ✅ |
| UC3-S4 | `onLayoutChange` called with updated array without the removed widget | Step | Component | `addRemoveResize.test.tsx:135` "7.3a — clicking remove button removes the widget" | ✅ |
| UC3-E1a | User removes the last remaining widget — grid renders as empty, `onLayoutChange` called with empty array | Extension | Component | `addRemoveResize.test.tsx:161` "7.3b — removing the last widget results in an empty layout" | ✅ |

---

## Use Case Details: Add Widget to Dashboard (ID: UC1)

### Main Scenario
- **UC1-S1**: User activates the Add Widget control
  - `addRemoveResize.test.tsx:90` "7.2a — clicking Add Widget renders a new widget on the grid" (Component)
- **UC1-S2**: System finds the first available grid cell (left-to-right, top-to-bottom)
  - `findFirstOpenCell.test.ts:10` "returns {col:0,row:0} for an empty layout" (Unit)
  - `findFirstOpenCell.test.ts:14` "scans left-to-right within a row first" (Unit)
  - `findFirstOpenCell.test.ts:20` "moves to the next row when the current row is full" (Unit)
  - `findFirstOpenCell.test.ts:37` "handles a partially filled grid with scattered widgets" (Unit)
  - `addRemoveResize.test.tsx:108` "7.2b — new widget placed at the first open cell" (Unit)
- **UC1-S3**: System creates a new widget entry with default size (1×1) at the found cell
  - ❌ Missing: "7.2d — new widget has default w:1 h:1" (Unit)
- **UC1-S4**: System updates layout state and re-renders the grid with the new widget
  - `addRemoveResize.test.tsx:90` "7.2a — clicking Add Widget renders a new widget on the grid" (Component)
- **UC1-S5**: New widget is visible and available for interaction
  - `addRemoveResize.test.tsx:90` "7.2a — clicking Add Widget renders a new widget on the grid" (Component) ⚠️ partial — verifies DOM presence but not interactivity

### Extensions
- **UC1-E1a**: No unoccupied cell exists — Add Widget control is disabled/unavailable
  - `findFirstOpenCell.test.ts:26` "returns null when the grid is completely full" (Unit)
  - `addRemoveResize.test.tsx:117` "7.2c — Add Widget button is disabled when grid is completely full" (Component)

### Full Flow Tests
- `UC1` — "Add Widget" → `addRemoveResize.test.tsx:90` "7.2a" (Component — partial flow only) ⚠️

---

## Use Case Details: Resize Widget (ID: UC2)

### Main Scenario
- **UC2-S1**: User presses down on the resize handle of a widget
  - `addRemoveResize.test.tsx:237` "7.5a — resize handle is present for each widget" (Unit)
  - `addRemoveResize.test.tsx:247` "7.5b — pressing Escape during resize does not commit layout change" (Component) ⚠️
- **UC2-S2**: System enters resize mode — ghost overlay shows current size at current position
  - ❌ Missing: "7.5c — ghost is shown after pressing resize handle" (Component)
- **UC2-S3**: User drags the handle to change the widget's span
  - ❌ Missing: no pointermove test (limited by jsdom — no layout measurements)
- **UC2-S4**: System continuously updates ghost to reflect candidate new size, snapped to whole cells
  - `addRemoveResize.test.tsx:189` "7.4a — candidate within bounds and no collision is valid" (Unit) ⚠️ tests validation, not ghost update
- **UC2-S5**: System validates candidate size: bounds check and collision check
  - `addRemoveResize.test.tsx:189` "7.4a — candidate within bounds and no collision is valid" (Unit)
  - `addRemoveResize.test.tsx:197` "7.4b — candidate exceeding grid bounds is invalid" (Unit)
  - `addRemoveResize.test.tsx:205` "7.4c — candidate colliding with another widget is invalid" (Unit)
- **UC2-S6**: Ghost reflects validity — valid normal, invalid shows "cannot resize" indicator
  - ❌ Missing: visual feedback test (limited by jsdom)
- **UC2-S7**: User releases handle at the desired size
  - ❌ Missing: "7.5d — pointerup after resize start commits layout" (Component)
- **UC2-S8**: System performs final validation of candidate size
  - ❌ Missing: covered by 7.5d
- **UC2-S9**: System commits new size — updates `w` and `h` in layout, re-renders widget
  - ❌ Missing: covered by 7.5d
- **UC2-S10**: Ghost is removed; widget renders at new size
  - ❌ Missing: covered by 7.5d

### Extensions
- **UC2-E3a**: Candidate span would be zero — system clamps to 1×1 minimum
  - `addRemoveResize.test.tsx:213` "7.4d — clamping to minimum 1×1 produces a valid candidate" (Unit)
- **UC2-E5a**: Candidate size overlaps widget or exceeds bounds — ghost shows "cannot resize"
  - `addRemoveResize.test.tsx:197` "7.4b — candidate exceeding grid bounds is invalid" (Unit)
  - `addRemoveResize.test.tsx:205` "7.4c — candidate colliding with another widget is invalid" (Unit)
- **UC2-E7a**: User releases at invalid size — resize cancelled, original size retained
  - ❌ Missing (jsdom constraint: zero bounding rect prevents forcing an invalid candidate via drag)
- **UC2-E7b**: User presses Escape during resize — resize cancelled immediately, ghost removed
  - `addRemoveResize.test.tsx:247` "7.5b — pressing Escape during resize does not commit layout change" (Component)

### Full Flow Tests
- `UC2` — "Resize Widget" → ❌ No full-flow integration test

---

## Use Case Details: Remove Widget (ID: UC3)

### Main Scenario
- **UC3-S1**: User activates the Remove control on a widget
  - `addRemoveResize.test.tsx:135` "7.3a — clicking remove button removes the widget" (Component)
  - `addRemoveResize.test.tsx:161` "7.3b — removing the last widget results in an empty layout" (Component)
- **UC3-S2**: System removes the widget from layout state
  - `addRemoveResize.test.tsx:135` "7.3a — clicking remove button removes the widget" (Component)
- **UC3-S3**: System re-renders the grid; occupied cells are now empty
  - `addRemoveResize.test.tsx:135` "7.3a — clicking remove button removes the widget" (Component)
- **UC3-S4**: `onLayoutChange` called with updated array without the removed widget
  - `addRemoveResize.test.tsx:135` "7.3a — clicking remove button removes the widget" (Component)

### Extensions
- **UC3-E1a**: User removes the last remaining widget — grid renders as empty, `onLayoutChange` called with empty array
  - `addRemoveResize.test.tsx:161` "7.3b — removing the last widget results in an empty layout" (Component)

### Full Flow Tests
- `UC3` — "Remove Widget" → `addRemoveResize.test.tsx:135` "7.3a — clicking remove button removes the widget" (Integration) ✅
