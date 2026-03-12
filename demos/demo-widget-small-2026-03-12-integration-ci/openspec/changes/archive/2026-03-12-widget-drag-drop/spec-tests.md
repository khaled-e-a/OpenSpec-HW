# Spec-Test Mapping: widget-drag-drop
Generated: 2026-03-12

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC1 | Reposition Widget on Grid — Full Flow | Flow | Integration | `src/__tests__/dashboard.test.tsx` | ⚠️ |
| UC1-S1 | User initiates drag on a widget | Step | Unit | `src/__tests__/dashboard.test.tsx:40` "drag widget to empty cell updates layout state" | ⚠️ |
| UC1-S2 | System shows drag preview at original position | Step | Unit | `src/__tests__/dashboard.test.tsx` "ghost placeholder rendered at original position while dragging" | ⚠️ |
| UC1-S3 | User moves pointer across the grid | Step | Unit | `src/__tests__/grid.test.ts:5` "converts pixel offset to cell coordinates" | ✅ |
| UC1-S3 | User moves pointer across the grid | Step | Unit | `src/__tests__/grid.test.ts:20` "round-trips integer cell positions losslessly" | ✅ |
| UC1-S4 | System highlights valid drop zones | Step | Component | `src/__tests__/dashboard.test.tsx` "drop zone overlay rendered with valid/invalid class during drag" | ⚠️ |
| UC1-S5 | User releases widget over a target grid cell | Step | Integration | `src/__tests__/dashboard.test.tsx:40` "drag widget to empty cell updates layout state" | ⚠️ |
| UC1-S6 | System snaps widget to nearest valid grid position | Step | Unit | `src/__tests__/grid.test.ts:9` "rounds to nearest cell" | ✅ |
| UC1-S6 | System snaps widget to nearest valid grid position | Step | Integration | `src/__tests__/dashboard.test.tsx:40` "drag widget to empty cell updates layout state" | ⚠️ |
| UC1-S7 | System updates layout state with new position | Step | Integration | `src/__tests__/dashboard.test.tsx:40` "drag widget to empty cell updates layout state" | ⚠️ |
| UC1-E5a | Target cell is occupied — system prevents drop with feedback | Extension | Unit | `src/__tests__/collision.test.ts:13` "returns true when candidate overlaps another item" | ✅ |
| UC1-E5a | Target cell is occupied — system prevents drop with feedback | Extension | Integration | `src/__tests__/dashboard.test.tsx:62` "drag widget to occupied cell is rejected" | ⚠️ |
| UC1-E5b | User cancels drag — system returns widget to original position | Extension | Integration | `src/__tests__/dashboard.test.tsx:95` "pressing Escape during drag restores widget" | ✅ |
| UC2 | Resize Widget on Grid — Full Flow | Flow | Integration | `src/__tests__/dashboard.test.tsx` | ⚠️ |
| UC2-S1 | User locates resize handle on widget | Step | Component | `src/__tests__/dashboard.test.tsx` "resize handle rendered for each widget in the dashboard" | ✅ |
| UC2-S2 | User begins dragging resize handle | Step | Integration | `src/__tests__/dashboard.test.tsx:112` "resizing widget to larger size updates layout state" | ⚠️ |
| UC2-S3 | System shows live resize preview | Step | Component | `src/__tests__/dashboard.test.tsx` "resize preview outline visible while resize drag is in progress" | ⚠️ |
| UC2-S4 | User releases handle at desired size | Step | Integration | `src/__tests__/dashboard.test.tsx:112` "resizing widget to larger size updates layout state" | ⚠️ |
| UC2-S5 | System snaps widget size to whole grid cell dimensions | Step | Unit | `src/__tests__/grid.test.ts:35` "does not alter a widget fully within bounds" | ⚠️ |
| UC2-S6 | System checks for overlap with adjacent widgets | Step | Unit | `src/__tests__/collision.test.ts:32` "returns original size when no overlap" | ✅ |
| UC2-S7 | System updates layout state with new size | Step | Integration | `src/__tests__/dashboard.test.tsx:112` "resizing widget to larger size updates layout state" | ⚠️ |
| UC2-E4a | Resize would overlap adjacent widget — system caps at boundary | Extension | Unit | `src/__tests__/collision.test.ts:38` "caps width when resize would overlap adjacent widget" | ✅ |
| UC2-E4a | Resize would overlap adjacent widget — system caps at boundary | Extension | Integration | `src/__tests__/dashboard.test.tsx:134` "resize capped when adjacent widget would be overlapped" | ⚠️ |
| UC2-E4b | Resize would exceed grid boundary — system constrains to grid edge | Extension | Unit | `src/__tests__/grid.test.ts:40` "clamps x so widget does not exceed right edge" | ✅ |
| UC2-E4b | Resize would exceed grid boundary — system constrains to grid edge | Extension | Integration | `src/__tests__/dashboard.test.tsx:160` "resize constrained to grid boundary" | ⚠️ |
| UC2-E4c | User cancels resize — system restores original size | Extension | Integration | `src/__tests__/dashboard.test.tsx:181` "pressing Escape during resize restores original size" | ✅ |

---

## Use Case Details: Reposition Widget on Grid (ID: UC1)

### Main Scenario
- **UC1-S1**: User initiates drag on a widget
  - `src/__tests__/dashboard.test.tsx:40` "drag widget to empty cell updates layout state" (Integration) ⚠️ partial — drag initiation verified indirectly via onChange call
- **UC1-S2**: System shows drag preview at original position
  - `src/__tests__/dashboard.test.tsx` "ghost placeholder rendered at original position while dragging" (Unit) ⚠️ best-effort — full verification needs e2e
- **UC1-S3**: User moves pointer across the grid
  - `src/__tests__/grid.test.ts:5` "converts pixel offset to cell coordinates" (Unit) ✅
  - `src/__tests__/grid.test.ts:20` "round-trips integer cell positions losslessly" (Unit) ✅
- **UC1-S4**: System highlights valid drop zones
  - `src/__tests__/dashboard.test.tsx` "drop zone overlay rendered with valid/invalid class during drag" (Component) ⚠️ best-effort — full verification needs e2e
- **UC1-S5**: User releases widget over a target grid cell
  - `src/__tests__/dashboard.test.tsx:40` "drag widget to empty cell updates layout state" (Integration) ⚠️
- **UC1-S6**: System snaps widget to nearest valid grid position
  - `src/__tests__/grid.test.ts:9` "rounds to nearest cell" (Unit) ✅
  - `src/__tests__/dashboard.test.tsx:40` "drag widget to empty cell updates layout state" (Integration) ⚠️
- **UC1-S7**: System updates layout state with new position
  - `src/__tests__/dashboard.test.tsx:40` "drag widget to empty cell updates layout state" (Integration) ⚠️

### Extensions
- **UC1-E5a**: Target cell is occupied — system prevents drop with feedback
  - `src/__tests__/collision.test.ts:13` "returns true when candidate overlaps another item" (Unit) ✅
  - `src/__tests__/dashboard.test.tsx:62` "drag widget to occupied cell is rejected and layout unchanged" (Integration) ⚠️
- **UC1-E5b**: User cancels drag — system returns widget to original position
  - `src/__tests__/dashboard.test.tsx:95` "pressing Escape during drag restores widget to original position" (Integration) ✅

### Full Flow Tests
- `UC1` — "Reposition Widget on Grid" → `src/__tests__/dashboard.test.tsx` (Integration) ⚠️ — multiple steps covered but S2 and S4 not verified

---

## Use Case Details: Resize Widget on Grid (ID: UC2)

### Main Scenario
- **UC2-S1**: User locates resize handle on widget
  - `src/__tests__/dashboard.test.tsx` "resize handle rendered for each widget in the dashboard" (Component) ✅
- **UC2-S2**: User begins dragging resize handle
  - `src/__tests__/dashboard.test.tsx:112` "resizing widget to larger size updates layout state" (Integration) ⚠️ — handle may not render in jsdom
- **UC2-S3**: System shows live resize preview
  - `src/__tests__/dashboard.test.tsx` "resize preview outline visible while resize drag is in progress" (Component) ⚠️ best-effort — full verification needs e2e
- **UC2-S4**: User releases handle at desired size
  - `src/__tests__/dashboard.test.tsx:112` "resizing widget to larger size updates layout state" (Integration) ⚠️
- **UC2-S5**: System snaps widget size to whole grid cell dimensions
  - `src/__tests__/grid.test.ts:35` "does not alter a widget fully within bounds" (Unit) ⚠️ — indirectly covers integer dimensions
- **UC2-S6**: System checks for overlap with adjacent widgets
  - `src/__tests__/collision.test.ts:32` "returns original size when no overlap" (Unit) ✅
  - `src/__tests__/collision.test.ts:38` "caps width when resize would overlap adjacent widget" (Unit) ✅
- **UC2-S7**: System updates layout state with new size
  - `src/__tests__/dashboard.test.tsx:112` "resizing widget to larger size updates layout state" (Integration) ⚠️

### Extensions
- **UC2-E4a**: Resize would overlap adjacent widget — system caps at boundary
  - `src/__tests__/collision.test.ts:38` "caps width when resize would overlap adjacent widget" (Unit) ✅
  - `src/__tests__/dashboard.test.tsx:134` "resize capped when adjacent widget would be overlapped" (Integration) ⚠️
- **UC2-E4b**: Resize would exceed grid boundary — system constrains to grid edge
  - `src/__tests__/grid.test.ts:40` "clamps x so widget does not exceed right edge" (Unit) ✅
  - `src/__tests__/dashboard.test.tsx:160` "resize constrained to grid boundary" (Integration) ⚠️
- **UC2-E4c**: User cancels resize — system restores original size
  - `src/__tests__/dashboard.test.tsx:181` "pressing Escape during resize restores original size" (Integration) ✅

### Full Flow Tests
- `UC2` — "Resize Widget on Grid" → `src/__tests__/dashboard.test.tsx` (Integration) ⚠️ — S1 and S3 not verified
