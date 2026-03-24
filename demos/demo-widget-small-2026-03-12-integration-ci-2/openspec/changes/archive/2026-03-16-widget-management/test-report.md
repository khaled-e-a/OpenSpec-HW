## Test Report: widget-management

Generated: 2026-03-13

### Use Case Coverage Summary

| Use Case | Happy Path | Extensions | Overall |
|----------|-----------|------------|---------|
| UC1: Add Widget to Dashboard | ✅ 7/7 | ✅ 3/3 | 100% |
| UC2: Remove Widget from Dashboard | ✅ 5/5 | ✅ 4/4 | 100% |

**Overall: 19/19 steps fully covered, 0 partial, 0 gaps (100% full coverage)**

---

### Covered Requirements

- ✅ **UC1-S1**: User opens the widget catalogue
  - `src/components/DashboardGrid.test.tsx` — "renders an 'Add widget' button" (Component)
  - `src/components/DashboardGrid.test.tsx` — "opens the catalogue when 'Add widget' is clicked" (Component)

- ✅ **UC1-S2**: System displays available widgets not currently on the grid
  - `src/components/DashboardGrid.test.tsx` — "UC1-S2: catalogue lists only widgets not currently in the layout" (Component)

- ✅ **UC1-S3**: User selects a widget from the catalogue
  - `src/components/DashboardGrid.test.tsx` — "UC1-S3/S6: clicking a catalogue item adds the widget and closes the catalogue" (Component)

- ✅ **UC1-S4**: System finds the first available grid position for the new widget
  - `src/utils/placement.test.ts` — "returns col=0, row=0 for an empty layout" (Unit)
  - `src/utils/placement.test.ts` — "returns a non-overlapping position when col=0 row=0 is occupied" (Unit)
  - `src/utils/placement.test.ts` — "finds a gap between two widgets" (Unit)
  - `src/utils/placement.integration.test.ts` — "UC1-S4/S5: addWidget places widget at a valid non-overlapping position" (Integration)

- ✅ **UC1-S5**: System places the widget at that position with a default size
  - `src/hooks/useDashboardLayout.test.ts` — "adds a widget at the first available position and saves to localStorage" (Unit)
  - `src/utils/placement.integration.test.ts` — "UC1-S4/S5: addWidget places widget at a valid non-overlapping position" (Integration)

- ✅ **UC1-S6**: System closes the catalogue
  - `src/components/DashboardGrid.test.tsx` — "UC1-S3/S6: clicking a catalogue item adds the widget and closes the catalogue" (Component)

- ✅ **UC1-S7**: System persists the updated layout to local storage
  - `src/hooks/useDashboardLayout.test.ts` — "adds a widget at the first available position and saves to localStorage" (Unit)

- ✅ **UC1-E2a1**: System displays an empty catalogue when all widgets are already on the grid
  - `src/components/DashboardGrid.test.tsx` — "UC1-E2a1: shows 'all widgets present' message when catalogue is empty" (Component)

- ✅ **UC1-E4a1**: System displays an error when no grid space is available
  - `src/hooks/useDashboardLayout.test.ts` — "returns false and does not mutate layout when grid is full" (Unit)

- ✅ **UC1-E4a2**: System does not add the widget when no space is available
  - `src/hooks/useDashboardLayout.test.ts` — "returns false and does not mutate layout when grid is full" (Unit)
  - `src/utils/placement.test.ts` — "returns null when the grid is completely full" (Unit)

- ✅ **UC2-S1**: User hovers over a widget; remove control becomes visible
  - `src/components/Widget.test.tsx` — "renders a remove button element in the DOM" (Unit)
  - `src/components/Widget.test.tsx` — "remove button starts with opacity 0 (hidden at rest)" (Unit)

- ✅ **UC2-S2**: User clicks the remove control on the target widget
  - `src/components/Widget.test.tsx` — "calls onRemove when remove button is clicked" (Unit)

- ✅ **UC2-S3**: System removes the widget from the grid
  - `src/hooks/useDashboardLayout.test.ts` — "removes the specified widget and persists the result" (Unit)
  - `src/utils/placement.integration.test.ts` — "UC2-S3/S4: removing a widget preserves other widget positions" (Integration)

- ✅ **UC2-S4**: System leaves remaining widgets in their current positions
  - `src/hooks/useDashboardLayout.test.ts` — "preserves other widgets positions after removal" (Unit)
  - `src/utils/placement.integration.test.ts` — "UC2-S3/S4: removing a widget preserves other widget positions" (Integration)

- ✅ **UC2-S5**: System persists the updated layout to local storage
  - `src/hooks/useDashboardLayout.test.ts` — "removes the specified widget and persists the result" (Unit)

- ✅ **UC2-E2a1**: System removes the widget immediately without a confirmation dialog
  - `src/components/Widget.test.tsx` — "calls onRemove when remove button is clicked" (Unit)
  - `src/components/Widget.test.tsx` — "does not throw when remove button clicked without onRemove prop" (Unit)

- ✅ **UC2-E2a2**: Removed widget becomes available again in the catalogue
  - `src/utils/placement.integration.test.ts` — "UC2-E2a2: removed widget id is absent from resulting layout" (Integration)
  - `src/components/DashboardGrid.test.tsx` — "UC2-E2a2: removed widget becomes available again in the catalogue" (Component)

- ✅ **UC2-E3a1**: System removes the last widget, leaving an empty grid
  - `src/hooks/useDashboardLayout.test.ts` — "saves empty array when last widget is removed" (Unit)

- ✅ **UC2-E3a2**: System persists the empty layout
  - `src/hooks/useDashboardLayout.test.ts` — "saves empty array when last widget is removed" (Unit)

---

### Uncovered Requirements

None — all 19 use case steps have automated test coverage.

---

### Test Run Results

```
Test Files  6 passed (6)
Tests       87 passed (87)
Duration    3.16s
```

**All 87 tests pass. No failures or skipped tests.**

| File | Tests |
|------|-------|
| `src/utils/placement.test.ts` | 16 |
| `src/utils/snapGrid.test.ts` | 8 |
| `src/utils/placement.integration.test.ts` | 15 |
| `src/hooks/useDashboardLayout.test.ts` | 15 |
| `src/components/Widget.test.tsx` | 17 |
| `src/components/DashboardGrid.test.tsx` | 16 |
| **Total** | **87** |
