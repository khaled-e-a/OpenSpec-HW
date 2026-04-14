# Spec-Test Mapping: widget-management

Generated: 2026-03-13

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC1 | Add Widget to Dashboard — Full Flow | Flow | Integration | `src/utils/placement.integration.test.ts` — "UC1-S4/S5: addWidget places widget at a valid non-overlapping position" | ✅ |
| UC1-S1 | User opens the widget catalogue | Step | Component | `src/components/DashboardGrid.test.tsx` — "renders an 'Add widget' button", "opens the catalogue when 'Add widget' is clicked" | ✅ |
| UC1-S2 | System displays available widgets not currently on the grid | Step | Component | `src/components/DashboardGrid.test.tsx` — "UC1-S2: catalogue lists only widgets not currently in the layout" | ✅ |
| UC1-S3 | User selects a widget from the catalogue | Step | Component | `src/components/DashboardGrid.test.tsx` — "UC1-S3/S6: clicking a catalogue item adds the widget and closes the catalogue" | ✅ |
| UC1-S4 | System finds the first available grid position for the new widget | Step | Unit | `src/utils/placement.test.ts` — "findFirstAvailablePosition" suite (4 tests) | ✅ |
| UC1-S4 | System finds the first available grid position for the new widget | Step | Integration | `src/utils/placement.integration.test.ts` — "addWidget integration" | ✅ |
| UC1-S5 | System places the widget at that position with a default size | Step | Unit | `src/hooks/useDashboardLayout.test.ts` — "adds a widget at the first available position and saves to localStorage" | ✅ |
| UC1-S5 | System places the widget at that position with a default size | Step | Integration | `src/utils/placement.integration.test.ts` — "addWidget integration" | ✅ |
| UC1-S6 | System closes the catalogue | Step | Component | `src/components/DashboardGrid.test.tsx` — "UC1-S3/S6: clicking a catalogue item adds the widget and closes the catalogue" | ✅ |
| UC1-S7 | System persists the updated layout to local storage | Step | Unit | `src/hooks/useDashboardLayout.test.ts` — "adds a widget at the first available position and saves to localStorage" | ✅ |
| UC1-E2a1 | System displays an empty catalogue when all widgets are already on the grid | Extension | Component | `src/components/DashboardGrid.test.tsx` — "UC1-E2a1: shows 'all widgets present' message when catalogue is empty" | ✅ |
| UC1-E4a1 | System displays an error when no grid space is available | Extension | Unit | `src/hooks/useDashboardLayout.test.ts` — "returns false and does not mutate layout when grid is full" | ✅ |
| UC1-E4a2 | System does not add the widget when no space is available | Extension | Unit | `src/hooks/useDashboardLayout.test.ts` — "returns false and does not mutate layout when grid is full" | ✅ |
| UC1-E4a2 | System does not add the widget when no space is available | Extension | Unit | `src/utils/placement.test.ts` — "returns null when the grid is completely full" | ✅ |
| UC2 | Remove Widget from Dashboard — Full Flow | Flow | Integration | `src/utils/placement.integration.test.ts` — "removeWidget integration" (2 tests) | ✅ |
| UC2-S1 | User hovers over a widget; remove control becomes visible | Step | Unit | `src/components/Widget.test.tsx` — "remove button starts with opacity 0 (hidden at rest)" | ✅ |
| UC2-S2 | User clicks the remove control on the target widget | Step | Unit | `src/components/Widget.test.tsx` — "calls onRemove when remove button is clicked" | ✅ |
| UC2-S3 | System removes the widget from the grid | Step | Unit | `src/hooks/useDashboardLayout.test.ts` — "removes the specified widget and persists the result" | ✅ |
| UC2-S3 | System removes the widget from the grid | Step | Integration | `src/utils/placement.integration.test.ts` — "UC2-S3/S4: removing a widget preserves other widget positions" | ✅ |
| UC2-S4 | System leaves remaining widgets in their current positions | Step | Unit | `src/hooks/useDashboardLayout.test.ts` — "preserves other widgets positions after removal" | ✅ |
| UC2-S4 | System leaves remaining widgets in their current positions | Step | Integration | `src/utils/placement.integration.test.ts` — "UC2-S3/S4: removing a widget preserves other widget positions" | ✅ |
| UC2-S5 | System persists the updated layout to local storage | Step | Unit | `src/hooks/useDashboardLayout.test.ts` — "removes the specified widget and persists the result" | ✅ |
| UC2-E2a1 | System removes the widget immediately without a confirmation dialog | Extension | Unit | `src/components/Widget.test.tsx` — "calls onRemove when remove button is clicked" | ✅ |
| UC2-E2a2 | Removed widget becomes available again in the catalogue | Extension | Integration | `src/utils/placement.integration.test.ts` — "UC2-E2a2: removed widget id is absent from resulting layout" | ✅ |
| UC2-E2a2 | Removed widget becomes available again in the catalogue | Extension | Component | `src/components/DashboardGrid.test.tsx` — "UC2-E2a2: removed widget becomes available again in the catalogue" | ✅ |
| UC2-E3a1 | System removes the last widget, leaving an empty grid | Extension | Unit | `src/hooks/useDashboardLayout.test.ts` — "saves empty array when last widget is removed" | ✅ |
| UC2-E3a2 | System persists the empty layout | Extension | Unit | `src/hooks/useDashboardLayout.test.ts` — "saves empty array when last widget is removed" | ✅ |

---

## Use Case Details: Add Widget to Dashboard (ID: UC1)

### Main Scenario

- **UC1-S1**: User opens the widget catalogue
  - `src/components/DashboardGrid.test.tsx` "renders an 'Add widget' button" (Component)
  - `src/components/DashboardGrid.test.tsx` "opens the catalogue when 'Add widget' is clicked" (Component)

- **UC1-S2**: System displays available widgets not currently on the grid
  - `src/components/DashboardGrid.test.tsx` "UC1-S2: catalogue lists only widgets not currently in the layout" (Component) ✅

- **UC1-S3**: User selects a widget from the catalogue
  - `src/components/DashboardGrid.test.tsx` "UC1-S3/S6: clicking a catalogue item adds the widget and closes the catalogue" (Component) ✅

- **UC1-S4**: System finds the first available grid position for the new widget
  - `src/utils/placement.test.ts` — `findFirstAvailablePosition` suite: "returns col=0, row=0 for an empty layout", "returns a non-overlapping position when col=0 row=0 is occupied", "finds a gap between two widgets" (Unit)
  - `src/utils/placement.integration.test.ts` — "UC1-S4/S5: addWidget places widget at a valid non-overlapping position" (Integration)

- **UC1-S5**: System places the widget at that position with a default size
  - `src/hooks/useDashboardLayout.test.ts` — "adds a widget at the first available position and saves to localStorage" (Unit)
  - `src/utils/placement.integration.test.ts` — "UC1-S4/S5: addWidget places widget at a valid non-overlapping position" (Integration)

- **UC1-S6**: System closes the catalogue
  - `src/components/DashboardGrid.test.tsx` "UC1-S3/S6: clicking a catalogue item adds the widget and closes the catalogue" (Component) ✅

- **UC1-S7**: System persists the updated layout to local storage
  - `src/hooks/useDashboardLayout.test.ts` — "adds a widget at the first available position and saves to localStorage" (Unit)

### Extensions

- **UC1-E2a1**: System displays an empty catalogue when all widgets are already on the grid
  - `src/components/DashboardGrid.test.tsx` "UC1-E2a1: shows 'all widgets present' message when catalogue is empty" (Component) ✅

- **UC1-E4a1**: System displays an error when no grid space is available
  - `src/hooks/useDashboardLayout.test.ts` — "returns false and does not mutate layout when grid is full" (Unit)

- **UC1-E4a2**: System does not add the widget when no space is available
  - `src/hooks/useDashboardLayout.test.ts` — "returns false and does not mutate layout when grid is full" (Unit)
  - `src/utils/placement.test.ts` — "returns null when the grid is completely full" (Unit)

### Full Flow Tests

- `UC1` — "Add Widget to Dashboard" → `src/utils/placement.integration.test.ts` "addWidget integration: UC1-S4/S5" (Integration)

---

## Use Case Details: Remove Widget from Dashboard (ID: UC2)

### Main Scenario

- **UC2-S1**: User hovers over a widget; remove control becomes visible
  - `src/components/Widget.test.tsx` — "renders a remove button element in the DOM", "remove button starts with opacity 0 (hidden at rest)" (Unit)

- **UC2-S2**: User clicks the remove control on the target widget
  - `src/components/Widget.test.tsx` — "calls onRemove when remove button is clicked" (Unit)

- **UC2-S3**: System removes the widget from the grid
  - `src/hooks/useDashboardLayout.test.ts` — "removes the specified widget and persists the result" (Unit)
  - `src/utils/placement.integration.test.ts` — "UC2-S3/S4: removing a widget preserves other widget positions" (Integration)

- **UC2-S4**: System leaves remaining widgets in their current positions
  - `src/hooks/useDashboardLayout.test.ts` — "preserves other widgets positions after removal" (Unit)
  - `src/utils/placement.integration.test.ts` — "UC2-S3/S4: removing a widget preserves other widget positions" (Integration)

- **UC2-S5**: System persists the updated layout to local storage
  - `src/hooks/useDashboardLayout.test.ts` — "removes the specified widget and persists the result" (Unit)

### Extensions

- **UC2-E2a1**: System removes the widget immediately without a confirmation dialog
  - `src/components/Widget.test.tsx` — "calls onRemove when remove button is clicked" (Unit) — onRemove fires immediately on click with no confirmation step
  - `src/components/Widget.test.tsx` — "does not throw when remove button clicked without onRemove prop" (Unit)

- **UC2-E2a2**: Removed widget becomes available again in the catalogue
  - `src/utils/placement.integration.test.ts` — "UC2-E2a2: removed widget id is absent from resulting layout" (Integration) ✅
  - `src/components/DashboardGrid.test.tsx` — "UC2-E2a2: removed widget becomes available again in the catalogue" (Component) ✅

- **UC2-E3a1**: System removes the last widget, leaving an empty grid
  - `src/hooks/useDashboardLayout.test.ts` — "saves empty array when last widget is removed" (Unit)

- **UC2-E3a2**: System persists the empty layout
  - `src/hooks/useDashboardLayout.test.ts` — "saves empty array when last widget is removed" (Unit)

### Full Flow Tests

- `UC2` — "Remove Widget from Dashboard" → `src/utils/placement.integration.test.ts` "removeWidget integration" (Integration)
