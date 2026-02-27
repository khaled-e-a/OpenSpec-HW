# Spec–Test Mapping: 2026-02-23-drag-drop-dashboard-grid
Generated: Thursday, February 26, 2026

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC-02 | Snap Widget to Grid Cell | Flow | Component | `src/__tests__/DashboardGrid.test.tsx` | ⚠️ |
| UC-02-S1 | Calculate nearest cell | Step | Unit | `src/__tests__/snapCalculation.test.ts` | ✅ |
| UC-02-S2 | Check unoccupied/bounds | Step | Unit | `src/__tests__/layoutUtils.test.ts` | ✅ |
| UC-02-S3 | Place flush to corner | Step | Unit | `src/__tests__/snapCalculation.test.ts` | ✅ |
| UC-02-S4 | Remove preview/render snapped | Step | Component | - | ⚠️ |
| UC-02-A1 | Nearest cell occupied | Alt | Unit | `src/__tests__/layoutReducer.test.ts` | ✅ |
| UC-02-E1 | No available cell | Exc | Unit | `src/__tests__/layoutReducer.test.ts` | ✅ |
| UC-04 | Add Widget to Dashboard | Flow | Component | - | ❌ |
| UC-04-S1 | Select widget type | Step | Component | - | ❌ |
| UC-04-S2 | Place at first available | Step | Unit | `src/__tests__/layoutUtils.test.ts` | ✅ |
| UC-04-S3 | Render with animation | Step | Component | - | ⚠️ |
| UC-04-A1 | Expand vertically | Alt | Unit | `src/__tests__/layoutUtils.test.ts` | ✅ |
| UC-04-E1 | Unknown widget type ID | Exc | Unit | `src/__tests__/layoutReducer.test.ts` | ✅ |
| UC-05 | Remove Widget from Dashboard | Flow | Component | `src/__tests__/DashboardGrid.test.tsx` | ✅ |
| UC-05-S1 | Confirmation/Undo toast | Step | Component | `src/__tests__/DashboardGrid.test.tsx` | ✅ |
| UC-05-S2 | User confirms/timeout | Step | Component | `src/__tests__/DashboardGrid.test.tsx` | ✅ |
| UC-05-S3 | Remove from grid/free cells | Step | Unit | `src/__tests__/layoutReducer.test.ts` | ✅ |
| UC-05-S4 | Update layout state | Step | Unit | `src/__tests__/layoutReducer.test.ts` | ✅ |
| UC-05-A1 | Undo clicked restoration | Alt | Component | `src/__tests__/DashboardGrid.test.tsx` | ✅ |
| UC-05-E1 | Persistence failure | Exc | Integration | `src/__tests__/persistence.test.ts` | ✅ |

## Use Case Details: Snap Widget to Grid Cell (ID: UC-02)

### Main Scenario
- **UC-02-S1**: Calculate nearest cell -> `src/__tests__/snapCalculation.test.ts` (Unit)
- **UC-02-S2**: Check unoccupied/bounds -> `src/__tests__/layoutUtils.test.ts:hasCollision` (Unit)
- **UC-02-S3**: Place flush to corner -> `src/__tests__/snapCalculation.test.ts` (Unit)
- **UC-02-S4**: Remove preview/render snapped -> MISSING (Component)

### Extensions
- **UC-02-A1**: Nearest cell occupied -> `src/__tests__/layoutReducer.test.ts:UC-01 Alt A2` (Unit)
- **UC-02-E1**: No available cell -> `src/__tests__/layoutReducer.test.ts:UC-01 Alt A3` (Unit)

---

## Use Case Details: Add Widget to Dashboard (ID: UC-04)

### Main Scenario
- **UC-04-S1**: Select widget type -> MISSING (Component)
- **UC-04-S2**: Place at first available -> `src/__tests__/layoutUtils.test.ts:findFirstAvailable` (Unit)
- **UC-04-S3**: Render with animation -> Implemented in `WidgetWrapper.tsx` (Visual)

### Extensions
- **UC-04-A1**: Expand vertically -> `src/__tests__/layoutUtils.test.ts:findFirstAvailable` (Unit)
- **UC-04-E1**: Unknown widget type ID -> `src/__tests__/layoutReducer.test.ts:UC-04 Exc E1` (Unit)

---

## Use Case Details: Remove Widget from Dashboard (ID: UC-05)

### Main Scenario
- **UC-05-S1**: Confirmation/Undo toast -> `src/__tests__/DashboardGrid.test.tsx` (Component)
- **UC-05-S2**: User confirms/timeout -> `src/__tests__/DashboardGrid.test.tsx` (Component)
- **UC-05-S3**: Remove from grid/free cells -> `src/__tests__/layoutReducer.test.ts:UC-05 Happy` (Unit)
- **UC-05-S4**: Update layout state -> `src/__tests__/layoutReducer.test.ts:UC-05 Happy` (Unit)

### Extensions
- **UC-05-A1**: Undo clicked restoration -> `src/__tests__/DashboardGrid.test.tsx` (Component)
- **UC-05-E1**: Persistence failure -> `src/__tests__/persistence.test.ts` (Integration)
