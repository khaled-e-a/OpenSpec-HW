# Spec-Test Mapping: widget-drag-drop
Generated: 2026-03-09

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| R1-UC1 | Drag Widget to New Grid Position — Full Flow | Flow | Integration | `src/components/DashboardGrid.integration.test.tsx` | ⚠️ |
| R2-UC2 | Drop Widget onto Empty Grid Area — Full Flow | Flow | Integration | `src/components/DashboardGrid.integration.test.tsx` | ⚠️ |
| R1-UC1-S1 | User initiates a drag gesture on a widget | Step | Unit | `src/components/GridWidget.test.tsx:22` — widget is draggable | ✅ |
| R1-UC1-S1 | User initiates a drag gesture on a widget | Step | Unit | `src/components/GridWidget.test.tsx:28` — exposes drag attributes | ✅ |
| R1-UC1-S1 | User initiates a drag gesture on a widget | Step | Component | `src/components/DashboardGrid.test.tsx:86` — renders background cells | ✅ |
| R1-UC1-S2 | System lifts the widget visually and displays a drag preview following the pointer | Step | Unit | `src/components/GridWidget.test.tsx:35` — full opacity when not dragging | ✅ |
| R1-UC1-S2 | System lifts the widget visually and displays a drag preview following the pointer | Step | Unit | `src/components/GridWidget.test.tsx:41` — reduced opacity when isDragging=true | ✅ |
| R1-UC1-S2 | System lifts the widget visually and displays a drag preview following the pointer | Step | Component | `src/components/DashboardGrid.test.tsx:74` — drag overlay not visible initially | ⚠️ |
| R1-UC1-S3 | User moves the pointer across the grid | Step | Integration | `src/components/DashboardGrid.integration.test.tsx` — stub (pointer events required) | ⚠️ |
| R1-UC1-S4 | System highlights the nearest valid grid cell(s) as a drop target as the pointer moves | Step | Unit | `src/components/GridCell.test.tsx:21` — transparent border when no state | ✅ |
| R1-UC1-S4 | System highlights the nearest valid grid cell(s) as a drop target as the pointer moves | Step | Unit | `src/components/GridCell.test.tsx:27` — highlight border when isHighlighted=true | ✅ |
| R1-UC1-S5 | User releases the pointer over the desired grid position | Step | Integration | `src/components/DashboardGrid.integration.test.tsx` — stub (pointer events required) | ⚠️ |
| R1-UC1-S6 | System snaps the widget to the nearest valid grid cell | Step | Unit | `src/utils/grid.test.ts:6` — pointerToCell 5 cases | ✅ |
| R1-UC1-S7 | System updates and persists the widget's grid position in the dashboard state | Step | Component | `src/components/DashboardGrid.test.tsx:93` — valid layout produced on drop | ✅ |
| R1-UC1-S7 | System updates and persists the widget's grid position in the dashboard state | Step | Component | `src/components/DashboardGrid.test.tsx:48` — does not call onLayoutChange without drag | ✅ |
| R1-UC1-E4a | Pointer moves over an occupied cell — system indicates cell is unavailable | Extension | Unit | `src/utils/grid.test.ts:73,78` — hasCollision returns true | ✅ |
| R1-UC1-E4a | Pointer moves over an occupied cell — system indicates cell is unavailable | Extension | Unit | `src/components/GridCell.test.tsx:33` — blocked indicator when isBlocked=true | ✅ |
| R1-UC1-E5a | User releases pointer outside grid bounds — system cancels drag and restores original position | Extension | Component | `src/components/DashboardGrid.test.tsx:104` — layout unchanged when no valid drop target | ✅ |
| R1-UC1-E5b | User releases pointer over occupied cell — system cancels drop and restores original position | Extension | Unit | `src/utils/grid.test.ts:73` — hasCollision returns true | ✅ |
| R1-UC1-E5b | User releases pointer over occupied cell — system cancels drop and restores original position | Extension | Component | `src/components/DashboardGrid.test.tsx:54` — hasCollision prevents drop | ✅ |
| R2-UC2-S1 | User's pointer enters an empty grid area during a drag | Step | Component | `src/components/DashboardGrid.test.tsx:86` — renders background cells for all grid positions | ✅ |
| R2-UC2-S2 | System computes the grid cell(s) the widget would occupy at the pointer position | Step | Unit | `src/utils/grid.test.ts:6` — pointerToCell 5 cases | ✅ |
| R2-UC2-S3 | System highlights the target cell(s) to show the snap preview | Step | Unit | `src/components/GridCell.test.tsx:27` — highlight border when isHighlighted=true | ✅ |
| R2-UC2-S3 | System highlights the target cell(s) to show the snap preview | Step | Unit | `src/components/GridCell.test.tsx:44` — correct grid position | ✅ |
| R2-UC2-S4 | User releases the pointer | Step | Component | `src/components/DashboardGrid.test.tsx:110` — no onLayoutChange on unmount | ✅ |
| R2-UC2-S4 | User releases the pointer | Step | Integration | `src/components/DashboardGrid.integration.test.tsx` — stub (pointer events required) | ⚠️ |
| R2-UC2-S5 | System places the widget snapped to the computed cell(s) | Step | Unit | `src/components/GridWidget.test.tsx:58` — gridColumn/gridRow from layout | ✅ |
| R2-UC2-S5 | System places the widget snapped to the computed cell(s) | Step | Unit | `src/components/GridWidget.test.tsx:67` — spans multiple columns | ✅ |
| R2-UC2-S6 | System removes the drag preview and shows the widget in its final position | Step | Component | `src/components/DashboardGrid.test.tsx:74` — overlay absent initially | ⚠️ |
| R2-UC2-E2a | Widget would extend beyond grid boundary — system clamps position to keep widget within bounds | Extension | Unit | `src/utils/grid.test.ts:31` — clampPosition 6 cases | ✅ |
| R2-UC2-E2a | Widget would extend beyond grid boundary — system clamps position to keep widget within bounds | Extension | Component | `src/components/DashboardGrid.test.tsx:61,68` — boundary checks | ✅ |

## Use Case Details: Drag Widget to New Grid Position (ID: UC1)

### Main Scenario

- **R1-UC1-S1**: User initiates a drag gesture on a widget
  - `src/components/GridWidget.test.tsx:22` — widget is draggable (cursor:grab) (Unit) ✅
  - `src/components/GridWidget.test.tsx:28` — exposes drag attributes (role=button) (Unit) ✅
  - `src/components/DashboardGrid.test.tsx:86` — background cells cover grid (Component) ✅
- **R1-UC1-S2**: System lifts the widget visually and displays a drag preview following the pointer
  - `src/components/GridWidget.test.tsx:35` — full opacity when not dragging (Unit) ✅
  - `src/components/GridWidget.test.tsx:41` — reduced opacity when isDragging=true (Unit) ✅
  - `src/components/DashboardGrid.test.tsx:74` — overlay absent at rest (Component) ⚠️ negative only
- **R1-UC1-S3**: User moves the pointer across the grid
  - `src/components/DashboardGrid.integration.test.tsx` — pointer move stub (Integration) ⚠️
- **R1-UC1-S4**: System highlights the nearest valid grid cell(s) as a drop target as the pointer moves
  - `src/components/GridCell.test.tsx:21` — transparent when no state (Unit) ✅
  - `src/components/GridCell.test.tsx:27` — highlight when isHighlighted=true (Unit) ✅
- **R1-UC1-S5**: User releases the pointer over the desired grid position
  - `src/components/DashboardGrid.integration.test.tsx` — pointer release stub (Integration) ⚠️
- **R1-UC1-S6**: System snaps the widget to the nearest valid grid cell
  - `src/utils/grid.test.ts:7` — maps origin to (0,0) (Unit) ✅
  - `src/utils/grid.test.ts:11` — within first cell → (0,0) (Unit) ✅
  - `src/utils/grid.test.ts:15` — second column (Unit) ✅
  - `src/utils/grid.test.ts:20` — second row (Unit) ✅
  - `src/utils/grid.test.ts:24` — 3-column grid (Unit) ✅
- **R1-UC1-S7**: System updates and persists the widget's grid position in the dashboard state
  - `src/components/DashboardGrid.test.tsx:93` — valid layout produced after drop (Component) ✅
  - `src/components/DashboardGrid.test.tsx:48` — no call without drag (Component) ✅

### Extensions

- **R1-UC1-E4a**: Pointer moves over an occupied cell — system indicates cell is unavailable
  - `src/utils/grid.test.ts:73` — hasCollision true on overlap (Unit) ✅
  - `src/utils/grid.test.ts:78` — hasCollision true for widget-b (Unit) ✅
  - `src/components/GridCell.test.tsx:33` — blocked style when isBlocked=true (Unit) ✅
- **R1-UC1-E5a**: User releases pointer outside grid bounds — system cancels drag and restores original position
  - `src/components/DashboardGrid.test.tsx:104` — layout unchanged when no drop target (Component) ✅
- **R1-UC1-E5b**: User releases pointer over occupied cell — system cancels drop and restores original position
  - `src/utils/grid.test.ts:73` — hasCollision true (Unit) ✅
  - `src/components/DashboardGrid.test.tsx:54` — hasCollision prevents drop (Component) ✅

### Full Flow Tests

- `R1-UC1` — "Drag widget from (0,0) to empty cell (2,1)" → `src/components/DashboardGrid.integration.test.tsx` — stub ⚠️

## Use Case Details: Drop Widget onto Empty Grid Area (ID: UC2)

### Main Scenario

- **R2-UC2-S1**: User's pointer enters an empty grid area during a drag
  - `src/components/DashboardGrid.test.tsx:86` — background cells cover all positions (Component) ✅
- **R2-UC2-S2**: System computes the grid cell(s) the widget would occupy at the pointer position
  - `src/utils/grid.test.ts:6` — pointerToCell 5 cases (Unit) ✅
- **R2-UC2-S3**: System highlights the target cell(s) to show the snap preview
  - `src/components/GridCell.test.tsx:27` — highlight border when isHighlighted=true (Unit) ✅
  - `src/components/GridCell.test.tsx:44` — correct grid position (Unit) ✅
- **R2-UC2-S4**: User releases the pointer
  - `src/components/DashboardGrid.test.tsx:110` — no side effects on unmount (Component) ✅
  - `src/components/DashboardGrid.integration.test.tsx` — pointer release stub ⚠️
- **R2-UC2-S5**: System places the widget snapped to the computed cell(s)
  - `src/components/GridWidget.test.tsx:58` — gridColumn/gridRow from layout (Unit) ✅
  - `src/components/GridWidget.test.tsx:67` — colSpan reflected in grid span (Unit) ✅
- **R2-UC2-S6**: System removes the drag preview and shows the widget in its final position
  - `src/components/DashboardGrid.test.tsx:74` — overlay absent at rest (Component) ⚠️ negative only

### Extensions

- **R2-UC2-E2a**: Widget would extend beyond grid boundary — system clamps position to keep widget within bounds
  - `src/utils/grid.test.ts:31` — clampPosition 6 cases (Unit) ✅
  - `src/components/DashboardGrid.test.tsx:61,68` — boundary checks (Component) ✅

### Full Flow Tests

- `R2-UC2` — "Drop widget on empty grid area with snap preview" → `src/components/DashboardGrid.integration.test.tsx` — stub ⚠️
