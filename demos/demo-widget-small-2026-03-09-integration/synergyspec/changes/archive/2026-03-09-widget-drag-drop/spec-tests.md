# Spec-Test Mapping: widget-drag-drop

Generated: 2026-03-09

---

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC1 | Drag Widget to New Position — Full Flow | Flow | Integration | `src/components/dashboard/__tests__/DashboardGrid.test.tsx` — "11.3 calls onLayoutChange after valid drag" | ⚠️ |
| UC1-S1 | User presses down on a widget to start dragging | Step | Component | `src/components/dashboard/__tests__/DashboardGrid.test.tsx` — "11.3 calls onLayoutChange after valid drag" | ⚠️ |
| UC1-S1 | User presses down on a widget to start dragging | Step | Component | `src/components/dashboard/__tests__/DraggableWidget.test.tsx` — "exposes draggable attributes so dnd-kit can attach listeners" | ✅ |
| UC1-S1 | User presses down on a widget to start dragging | Step | Component | `src/components/dashboard/__tests__/DraggableWidget.test.tsx` — "has touchAction none to prevent default scroll during touch drag" | ✅ |
| UC1-S2 | System lifts the widget visually (raises z-index, applies drag styling) and attaches it to the pointer | Step | Component | `src/components/dashboard/__tests__/DraggableWidget.test.tsx` — "renders at full opacity when not dragging" | ✅ |
| UC1-S2 | System lifts the widget visually (raises z-index, applies drag styling) and attaches it to the pointer | Step | Component | `src/components/dashboard/__tests__/DraggableWidget.test.tsx` — "sets gridColumn and gridRow from col/row/w/h props" | ✅ |
| UC1-S3 | System displays a ghost/shadow overlay at the nearest valid snap-to-grid position as the user moves the pointer | Step | Unit | `src/components/dashboard/__tests__/gridCoords.test.ts` — "maps mid-cell pointer to correct column and row" | ✅ |
| UC1-S3 | System displays a ghost/shadow overlay at the nearest valid snap-to-grid position as the user moves the pointer | Step | Unit | `src/components/dashboard/__tests__/gridCoords.test.ts` — "handles exact cell boundaries" | ✅ |
| UC1-S3 | System displays a ghost/shadow overlay at the nearest valid snap-to-grid position as the user moves the pointer | Step | Component | `src/components/dashboard/__tests__/GhostWidget.test.tsx` — "sets gridColumn using col and w props" | ✅ |
| UC1-S3 | System displays a ghost/shadow overlay at the nearest valid snap-to-grid position as the user moves the pointer | Step | Component | `src/components/dashboard/__tests__/GhostWidget.test.tsx` — "sets gridRow using row and h props" | ✅ |
| UC1-S4 | User moves the pointer across the grid toward the desired target cell | Step | Integration | `src/components/dashboard/__tests__/DashboardGrid.test.tsx` — "11.3 calls onLayoutChange after valid drag" | ⚠️ |
| UC1-S5 | System continuously updates the ghost to the nearest valid snap position, keeping the preview within grid bounds | Step | Unit | `src/components/dashboard/__tests__/gridCoords.test.ts` — "clamps column to 0 when pointer is left of grid" | ✅ |
| UC1-S5 | System continuously updates the ghost to the nearest valid snap position, keeping the preview within grid bounds | Step | Unit | `src/components/dashboard/__tests__/gridCoords.test.ts` — "clamps column so widget stays within right boundary" | ✅ |
| UC1-S5 | System continuously updates the ghost to the nearest valid snap position, keeping the preview within grid bounds | Step | Unit | `src/components/dashboard/__tests__/gridCoords.test.ts` — "clamps row to 0 when pointer is above grid" | ✅ |
| UC1-S5 | System continuously updates the ghost to the nearest valid snap position, keeping the preview within grid bounds | Step | Unit | `src/components/dashboard/__tests__/gridCoords.test.ts` — "clamps row so widget stays within bottom boundary" | ✅ |
| UC1-S6 | User releases the pointer over the target position | Step | Integration | `src/components/dashboard/__tests__/DashboardGrid.test.tsx` — "11.3 calls onLayoutChange after valid drag" | ⚠️ |
| UC1-S7 | System validates that the target position is unoccupied and within grid bounds | Step | Unit | `src/components/dashboard/__tests__/collision.test.ts` — "returns true for a valid move to an empty cell" | ✅ |
| UC1-S7 | System validates that the target position is unoccupied and within grid bounds | Step | Unit | `src/components/dashboard/__tests__/collision.test.ts` — "returns true when placing the widget at its own position" | ✅ |
| UC1-S7 | System validates that the target position is unoccupied and within grid bounds | Step | Unit | `src/components/dashboard/__tests__/collision.test.ts` — "getOccupiedCells returns cells except excluded one" | ✅ |
| UC1-S8 | System commits the new position — updates layout state and re-renders the widget at the target cell | Step | Integration | `src/components/dashboard/__tests__/DashboardGrid.test.tsx` — "11.3 calls onLayoutChange after valid drag" | ⚠️ |
| UC1-S9 | System removes the drag overlay and restores normal widget appearance | Step | Component | `src/components/dashboard/__tests__/DashboardGrid.test.tsx` — "UC1-S9 drag overlay is removed after a successful drop" | ✅ |
| UC1-E1a | User drags by touch — system handles touch events equivalently | Extension | Integration | `src/components/dashboard/__tests__/DashboardGrid.test.tsx` — "11.6 touch drag same callback behaviour" | ⚠️ |
| UC1-E3a | No valid snap position near pointer — system shows no ghost or a "cannot drop" indicator | Extension | Component | `src/components/dashboard/__tests__/GhostWidget.test.tsx` — "applies red border and background when isValid=false" | ✅ |
| UC1-E3a | No valid snap position near pointer — system shows no ghost or a "cannot drop" indicator | Extension | Component | `src/components/dashboard/__tests__/GhostWidget.test.tsx` — "is hidden (returns null) when visible=false regardless of isValid" | ✅ |
| UC1-E3a | No valid snap position near pointer — system shows no ghost or a "cannot drop" indicator | Extension | Component | `src/components/dashboard/__tests__/GhostWidget.test.tsx` — "has pointer-events none so it does not interfere with drag events" | ✅ |
| UC1-E6a | User releases outside grid — system cancels, widget returns to original position | Extension | Unit | `src/components/dashboard/__tests__/gridCoords.test.ts` — "returns false for pointer to the left/right/above/below" | ✅ |
| UC1-E6a | User releases outside grid — system cancels, widget returns to original position | Extension | Integration | `src/components/dashboard/__tests__/DashboardGrid.test.tsx` — "UC1-E6a releasing pointer outside grid boundary does not update layout" | ✅ |
| UC1-E7a | Target position is occupied — collision detected, drop rejected, widget returns | Extension | Unit | `src/components/dashboard/__tests__/collision.test.ts` — "returns false when drop collides with another widget" | ✅ |
| UC1-E7a | Target position is occupied — collision detected, drop rejected, widget returns | Extension | Integration | `src/components/dashboard/__tests__/DashboardGrid.test.tsx` — "11.4 does NOT call onLayoutChange on occupied cell" | ⚠️ |
| UC1-E7b | Target position is partially out of bounds — drop rejected, widget returns | Extension | Unit | `src/components/dashboard/__tests__/collision.test.ts` — "returns false for partial overlap out of bounds (right edge)" | ✅ |
| UC1-E7b | Target position is partially out of bounds — drop rejected, widget returns | Extension | Unit | `src/components/dashboard/__tests__/collision.test.ts` — "returns false for partial overlap out of bounds (bottom edge)" | ✅ |
| UC1-E7b | Target position is partially out of bounds — drop rejected, widget returns | Extension | Unit | `src/components/dashboard/__tests__/collision.test.ts` — "returns false when drop is out of bounds on left/right/top/bottom" | ✅ |
| UC1-Ea | User presses Escape — drag cancelled immediately, widget returns, layout unchanged | Extension | Integration | `src/components/dashboard/__tests__/DashboardGrid.test.tsx` — "11.5 Escape during drag leaves layout unchanged" | ✅ |

---

## Use Case Details: Drag Widget to New Position (ID: UC1)

### Main Scenario

- **UC1-S1**: User presses down on a widget to start dragging
  - `src/components/dashboard/__tests__/DashboardGrid.test.tsx:49` "11.3 — calls onLayoutChange with new position after valid drag" (Integration, ⚠️ partial — soft assertion)
  - `src/components/dashboard/__tests__/DraggableWidget.test.tsx` "exposes draggable attributes so dnd-kit can attach listeners" (Component, ✅)
  - `src/components/dashboard/__tests__/DraggableWidget.test.tsx` "has touchAction none to prevent default scroll during touch drag" (Component, ✅)

- **UC1-S2**: System lifts the widget visually (raises z-index, applies drag styling) and attaches it to the pointer
  - `src/components/dashboard/__tests__/DraggableWidget.test.tsx` "renders at full opacity when not dragging" (Component, ✅)
  - `src/components/dashboard/__tests__/DraggableWidget.test.tsx` "sets gridColumn and gridRow from col/row/w/h props" (Component, ✅)

- **UC1-S3**: System displays a ghost/shadow overlay at the nearest valid snap-to-grid position as the user moves the pointer
  - `src/components/dashboard/__tests__/gridCoords.test.ts:17` "maps mid-cell pointer to correct column and row" (Unit, ✅)
  - `src/components/dashboard/__tests__/gridCoords.test.ts:40` "handles exact cell boundaries" (Unit, ✅)
  - `src/components/dashboard/__tests__/GhostWidget.test.tsx` "sets gridColumn using col and w props" (Component, ✅)
  - `src/components/dashboard/__tests__/GhostWidget.test.tsx` "sets gridRow using row and h props" (Component, ✅)

- **UC1-S4**: User moves the pointer across the grid toward the desired target cell
  - `src/components/dashboard/__tests__/DashboardGrid.test.tsx:49` "11.3 — calls onLayoutChange after valid drag" (Integration, ⚠️ implied — no explicit move assertion)

- **UC1-S5**: System continuously updates the ghost to the nearest valid snap position, keeping the preview within grid bounds
  - `src/components/dashboard/__tests__/gridCoords.test.ts:22` "clamps column to 0 when pointer is left of grid" (Unit, ✅)
  - `src/components/dashboard/__tests__/gridCoords.test.ts:26` "clamps column so widget stays within right boundary" (Unit, ✅)
  - `src/components/dashboard/__tests__/gridCoords.test.ts:31` "clamps row to 0 when pointer is above grid" (Unit, ✅)
  - `src/components/dashboard/__tests__/gridCoords.test.ts:35` "clamps row so widget stays within bottom boundary" (Unit, ✅)

- **UC1-S6**: User releases the pointer over the target position
  - `src/components/dashboard/__tests__/DashboardGrid.test.tsx:49` "11.3 — calls onLayoutChange after valid drag" (Integration, ⚠️ implied — release is part of the flow)

- **UC1-S7**: System validates that the target position is unoccupied and within grid bounds
  - `src/components/dashboard/__tests__/collision.test.ts:28` "returns true for a valid move to an empty cell" (Unit, ✅)
  - `src/components/dashboard/__tests__/collision.test.ts:63` "returns true when placing the widget at its own position" (Unit, ✅)
  - `src/components/dashboard/__tests__/collision.test.ts:11` "getOccupiedCells returns cells except excluded one" (Unit, ✅)

- **UC1-S8**: System commits the new position — updates layout state and re-renders the widget at the target cell
  - `src/components/dashboard/__tests__/DashboardGrid.test.tsx:49` "11.3 — calls onLayoutChange with new position after valid drag" (Integration, ⚠️ partial — soft assertion; no strict col/row check)

- **UC1-S9**: System removes the drag overlay and restores normal widget appearance
  - `src/components/dashboard/__tests__/DashboardGrid.test.tsx` "UC1-S9 drag overlay is removed after a successful drop" (Component, ✅)

### Extensions

- **UC1-E1a**: User drags by touch — system handles touch events equivalently
  - `src/components/dashboard/__tests__/DashboardGrid.test.tsx:105` "11.6 — touch drag results in same callback behaviour as pointer drag" (Integration, ⚠️ partial — soft assertion)

- **UC1-E3a**: No valid snap position near pointer — system shows no ghost or a "cannot drop" indicator
  - `src/components/dashboard/__tests__/GhostWidget.test.tsx` "applies red border and background when isValid=false" (Component, ✅)
  - `src/components/dashboard/__tests__/GhostWidget.test.tsx` "is hidden (returns null) when visible=false regardless of isValid" (Component, ✅)
  - `src/components/dashboard/__tests__/GhostWidget.test.tsx` "has pointer-events none so it does not interfere with drag events" (Component, ✅)

- **UC1-E6a**: User releases outside grid — system cancels, widget returns to original position
  - `src/components/dashboard/__tests__/gridCoords.test.ts:46` "isPointerInsideGrid returns false for pointer outside grid" (Unit, ✅)
  - `src/components/dashboard/__tests__/DashboardGrid.test.tsx` "UC1-E6a releasing pointer outside grid boundary does not update layout" (Integration, ✅)

- **UC1-E7a**: Target position is occupied — collision detected, drop rejected, widget returns
  - `src/components/dashboard/__tests__/collision.test.ts:32` "returns false when drop collides with another widget" (Unit, ✅)
  - `src/components/dashboard/__tests__/DashboardGrid.test.tsx:70` "11.4 — does NOT call onLayoutChange on occupied cell" (Integration, ⚠️ partial — soft assertion)

- **UC1-E7b**: Target position is partially out of bounds — drop rejected, widget returns
  - `src/components/dashboard/__tests__/collision.test.ts:53` "returns false for partial overlap out of bounds (right edge)" (Unit, ✅)
  - `src/components/dashboard/__tests__/collision.test.ts:58` "returns false for partial overlap out of bounds (bottom edge)" (Unit, ✅)
  - `src/components/dashboard/__tests__/collision.test.ts:37–51` "returns false when drop is out of bounds on left/right/top/bottom" (Unit, ✅)

- **UC1-Ea**: User presses Escape — drag cancelled immediately, widget returns, layout unchanged
  - `src/components/dashboard/__tests__/DashboardGrid.test.tsx:92` "11.5 — Escape during drag leaves layout unchanged" (Integration, ✅)

### Full Flow Tests

- `UC1` — "Drag Widget to New Position" → `src/components/dashboard/__tests__/DashboardGrid.test.tsx:49` "11.3 — calls onLayoutChange with new position after valid drag" (Integration, ⚠️ partial)

---

## Gap Summary

| Category | Count |
|----------|-------|
| ✅ Fully covered | 27 test entries |
| ⚠️ Partial / soft assertion | 8 test entries |
| ❌ Missing | 0 |

All previously missing tests have been written. Remaining ⚠️ entries are soft-assertion integration tests whose exact assertions are limited by jsdom's lack of real layout geometry (no `getBoundingClientRect` measurements). These tests verify structural invariants (no overlaps, non-negative positions) but cannot assert exact pixel-to-cell coordinate mapping in a headless environment.
