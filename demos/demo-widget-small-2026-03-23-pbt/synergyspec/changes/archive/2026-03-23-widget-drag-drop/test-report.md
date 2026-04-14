## Test Report: widget-drag-drop

Generated: 2026-03-23
Source: spec-tests.md + npm test (Jest + fast-check v3)

---

### Test Run Results

| Metric | Value |
|--------|-------|
| Test suites | 5 passed, 5 total |
| Tests | **52 passed, 52 total** |
| Snapshots | 0 |
| Time | 6.5s |
| Failures | **None** |
| PBT counterexamples | **None** |

Test files run:
- `src/App.test.tsx` ✅
- `src/utils/gridUtils.test.ts` ✅
- `src/utils/gridUtils.property.test.ts` ✅
- `src/hooks/useDashboardLayout.test.ts` ✅
- `src/hooks/useDashboardLayout.property.test.ts` ✅

> Note: `console.warn` messages during `useDashboardLayout.test.ts` and `useDashboardLayout.property.test.ts` are **expected** — they are the correct system behavior for UC3-E3b (corrupt localStorage → warn + fallback to default layout).

---

### Use Case Coverage Summary

| Use Case | Happy Path | Extensions | Overall |
|----------|-----------|------------|---------|
| UC1: Move Widget | ⚠️ 5/7 (S2,S3 ❌) | ⚠️ 3/4 (E4a example ❌, E6a2 ❌) | 67% |
| UC2: Resize Widget | ⚠️ 3/7 (S1–S4 ❌, S5 partial) | ✅ 3/3 | 57% |
| UC3: Persist & Restore | ⚠️ 5/5 (S4,S5 partial) | ✅ 3/3 | 87% |
| UC4: Add Widget | ⚠️ 4/6 (S1,S2 ❌) | ✅ 1/1 | 77% |
| UC5: Remove Widget | ✅ 4/4 | ✅ 1/1 | 100% |

**Overall: 32/44 steps covered (73%) — 28 with example-based tests, 25 PBT tests covering 21 additional invariants**

---

### Covered Requirements

- ✅ **UC1-S5**: System snaps the widget to the nearest valid grid cell (`src/utils/gridUtils.test.ts`, PBT `gridUtils.property.test.ts`)
- ✅ **UC1-S6**: System reflows any displaced widgets to avoid overlap (`src/utils/gridUtils.test.ts:128`, PBT)
- ✅ **UC1-S7**: System saves the updated layout to persistent state (`src/hooks/useDashboardLayout.test.ts:47`, PBT)
- ✅ **UC1-E4a**: Drop outside grid — hasConflict detects out-of-bounds (PBT `gridUtils.property.test.ts`)
- ✅ **UC1-E4b**: Target cell occupied — snaps to adjacent (`src/utils/gridUtils.test.ts:83`, PBT)
- ✅ **UC1-E6a**: No valid cell — drop cancelled (`src/utils/gridUtils.test.ts:88`, PBT)
- ✅ **UC2-S5**: System applies new grid-unit dimensions (`src/hooks/useDashboardLayout.test.ts` resizeWidget)
- ✅ **UC2-S6**: System reflows neighbouring widgets (`src/utils/gridUtils.test.ts:128`, PBT)
- ✅ **UC2-S7**: System saves the updated layout (`src/hooks/useDashboardLayout.test.ts:47`, PBT)
- ✅ **UC2-E3b**: Resize clamped at grid edge (`src/utils/gridUtils.test.ts:30`, PBT)
- ✅ **UC2-E6a**: No room for reflow — reverts (`src/utils/gridUtils.test.ts:140`, PBT)
- ✅ **UC3-S1**: User navigates to dashboard (`src/hooks/useDashboardLayout.test.ts:14`)
- ✅ **UC3-S2**: System reads layout from localStorage (`src/hooks/useDashboardLayout.test.ts:14`, PBT)
- ✅ **UC3-S3**: System validates widget IDs (`src/hooks/useDashboardLayout.test.ts:36`)
- ✅ **UC3-E2a**: Default layout when no storage (`src/hooks/useDashboardLayout.test.ts:23`, PBT)
- ✅ **UC3-E3a**: Stale widget IDs discarded (`src/hooks/useDashboardLayout.test.ts:36`, PBT)
- ✅ **UC3-E3b**: Corrupt data falls back to default (`src/hooks/useDashboardLayout.test.ts:29`, PBT)
- ✅ **UC4-S3**: User selects widget type — addWidget (`src/hooks/useDashboardLayout.test.ts:57`)
- ✅ **UC4-S4**: First available grid region found (`src/utils/gridUtils.test.ts:99`, PBT ×2)
- ✅ **UC4-S5**: Widget placed and added to layout (`src/hooks/useDashboardLayout.test.ts:57`)
- ✅ **UC4-S6**: Layout saved after add (PBT `useDashboardLayout.property.test.ts`)
- ✅ **UC4-E4a**: Grid full — returns null (`src/utils/gridUtils.test.ts:108`, PBT)
- ✅ **UC5-S1**: User activates remove action (`src/hooks/useDashboardLayout.test.ts:67`)
- ✅ **UC5-S2**: Widget removed from grid (`src/hooks/useDashboardLayout.test.ts:67`, PBT)
- ✅ **UC5-S3**: Grid cells freed (`src/hooks/useDashboardLayout.test.ts:67`)
- ✅ **UC5-S4**: Layout saved after remove (PBT `useDashboardLayout.property.test.ts`)
- ✅ **UC5-E1a**: Undo restores widget at previous position (`src/hooks/useDashboardLayout.test.ts:74,83`, PBT ×3)

---

### Uncovered / Partial Requirements

- ⚠️ **UC1-S1**: User presses and holds to initiate drag — `moveWidget` unit test covers state mutation but not pointer event initiation
- ❌ **UC1-S2**: System lifts widget visually and displays drag preview — no test for DragOverlay render
- ❌ **UC1-S3**: System highlights valid drop zones — no test for DropCellGrid highlight logic
- ⚠️ **UC1-S4**: User releases at desired location — partial (moveWidget unit test covers outcome, not interaction)
- ❌ **UC1-E4a**: Example-based cancel test — only PBT covers out-of-bounds detection; no onDragCancel handler test
- ❌ **UC1-E6a2**: System highlights conflict on failed drop — no conflictFlash test
- ❌ **UC2-S1**: Resize handles revealed on hover — no CSS hover/visibility test
- ❌ **UC2-S2**: User drags resize handle — no useResizeDrag pointerdown test
- ❌ **UC2-S3**: Live preview of new size — no previewW/H state test
- ❌ **UC2-S4**: User releases handle at desired size — no pointerup commit test
- ⚠️ **UC2-S5**: System applies new dimensions — tested via hook mutation but not via resize drag flow
- ❌ **UC2-E3a**: Minimum 1×1 clamp and indicator — no useResizeDrag floor test
- ⚠️ **UC3-S4**: System renders widget at stored position — App.test.tsx checks title only, not widget positions
- ⚠️ **UC3-S5**: Dashboard identical to last state — partial; App.test.tsx checks render only
- ❌ **UC4-S1**: User opens widget picker — no WidgetPicker open/close test
- ❌ **UC4-S2**: System displays available widget types — no WidgetPicker list render test
- ❌ **UC1 Flow**: Full drag integration test (drag → snap → reflow → persist)
- ❌ **UC2 Flow**: Full resize integration test (hover → drag handle → preview → commit → persist)
- ❌ **UC4 Flow**: Full add integration test (open picker → select → auto-place → render)
- ❌ **UC5 Flow**: Full remove integration test (click ✕ → remove → undo toast → undo/expire)

---

### PBT Results

| UC Step | Scenario | Outcome | Counterexample | Regression Test |
|---------|----------|---------|----------------|-----------------|
| UC1-S5 | snapAndClamp always returns integer coords within bounds | ✅ passed (100 runs) | — | — |
| UC1-S5 | snapAndClamp result is closest integer cell to raw input | ✅ passed (100 runs) | — | — |
| UC1-S6 | buildOccupancyGrid marks exactly w×h cells per widget | ✅ passed (100 runs) | — | — |
| UC1-S6/UC2-S6 | gravityReflow result never has overlapping widgets | ✅ passed (100 runs) | — | — |
| UC1-S7 | localStorage reflects new position after moveWidget + debounce | ✅ passed (15 runs) | — | — |
| UC1-E4a | hasConflict always detects out-of-bounds placements | ✅ passed (100 runs) | — | — |
| UC1-E4b | findNearestFreeCell result is always valid (no conflict, in bounds) | ✅ passed (100 runs) | — | — |
| UC1-E6a | hasConflict correctly identifies any overlapping occupied cell | ✅ passed (100 runs) | — | — |
| UC2-E3b | snapAndClamp never places widget outside grid boundary | ✅ passed (100 runs) | — | — |
| UC2-E6a | gravityReflow preserves the authoritative moved widget position | ✅ passed (100 runs) | — | — |
| UC3-S2 | any valid stored layout is fully restored on mount | ✅ passed (20 runs) | — | — |
| UC3-E2a | hook returns non-empty default layout when localStorage is empty | ✅ passed (5 runs) | — | — |
| UC3-E3a | stale widget type IDs are always discarded on load | ✅ passed (15 runs) | — | — |
| UC3-E3b | corrupt localStorage always falls back to non-empty default layout | ✅ passed (20 runs) | — | — |
| UC4-S4 | autoPlace result is always conflict-free and in bounds | ✅ passed (100 runs) | — | — |
| UC4-S4 | addWidget places new widget without overlapping existing ones | ✅ passed (20 runs) | — | — |
| UC4-S6 | localStorage contains new widget after addWidget + debounce | ✅ passed (10 runs) | — | — |
| UC4-E4a | autoPlace returns null when entire grid is occupied | ✅ passed (100 runs) | — | — |
| UC5-S2 | removeWidget always removes the specified widget from layout | ✅ passed (5 runs) | — | — |
| UC5-S4 | localStorage does not contain removed widget after debounce | ✅ passed (5 runs) | — | — |
| UC5-E1a | undoRemove always restores the widget at its previous position | ✅ passed (5 runs) | — | — |
| UC5-E1a | showUndoToast is always false after 5s timeout | ✅ passed (10 runs) | — | — |
| UC5-E1a | only the most recently removed widget is undoable | ✅ passed (5 runs) | — | — |

**No PBT counterexamples found.** All 25 properties held for all generated inputs.

---

### PBT Regression Log

No counterexamples found — no regression tests needed.
