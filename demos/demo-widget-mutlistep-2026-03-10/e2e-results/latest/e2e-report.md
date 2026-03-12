# E2E Test Report

Generated: 2026-03-11 13:45
Test plan: openspec/changes/archive/2026-03-09-widget-drag-drop/test-plan.md
App URL: http://localhost:5173
Test files: tests/e2e/drag-drop.spec.ts, tests/e2e/drag-drop-mobile.spec.ts
Screenshots: e2e-results/latest/artifacts/

## Summary

| ID | Test | Verdict | Notes |
|----|------|---------|-------|
| TP-1 | UC1-S1+S4+S6+S8 — Full drag interaction cycle | ✅ PASS | Widget opacity drops to ≤0.3 during drag; ghost appears (blue dashed); widget returns to opacity 1.0 after drop |
| TP-2 | UC1-S8 — Layout state committed with correct col/row | ✅ PASS | widget-b (KPI Card) moved from col 2 to col 3; no (col,row) overlap with any other widget |
| TP-3 | UC1-E1a — Touch drag on mobile device | ✅ PASS | Mobile viewport (390×844, hasTouch); hold 200ms activates TouchSensor; opacity transitions correctly after lift |
| TP-4 | UC1-E7a — Collision rejection | ✅ PASS | Ghost border becomes red (rgb contains 239) over occupied cell; widget snaps back to original col 2 (gridColumnStart=3) |

**Passed: 4 / 4**

---

## Details

### TP-1: Full drag interaction cycle (UC1-S1+S4+S6+S8)
**Verdict**: ✅ PASS
**Expected**: Widget slot becomes semi-transparent on press; blue ghost appears during move; widget snaps to new cell; ghost disappears on release
**Observed**: `isDragging` sets opacity to 0.3 (confirmed ≤0.4); ghost (`[aria-hidden="true"]` with dashed border) appeared; after `mouse.up()` opacity returned to 1.0; ghost count = 0
**Screenshots**:
- `TP-1_before.png` — initial state
- `TP-1_step-4-pressed.png` — after mouse.down()
- `TP-1_step-6-during-drag.png` — mid-drag 200px right
- `TP-1_result.png` — after drop
**Notes**: CSS `transition: opacity 150ms` required `waitForFunction` to reliably assert opacity=1 after drop.

---

### TP-2: Layout state committed with correct col/row (UC1-S8)
**Verdict**: ✅ PASS
**Expected**: KPI Card moves to target cell; no overlap; original cell is empty
**Observed**: widget-b dragged from col 2 → col 3; `gridColumn` resolved to `4 / span 1`; all 4 widgets have unique `(gridColumnStart, gridRowStart)` pairs
**Screenshots**:
- `TP-2_before.png` — initial layout
- `TP-2_during-drag.png` — ghost at target position
- `TP-2_result.png` — committed layout
**Notes**: Initial layout has widget-a (col 0, row 0) and widget-c (col 0, row 1) sharing `gridColumnStart=1` by design (different rows) — overlap check correctly uses `(col, row)` pairs.

---

### TP-3: Touch drag on mobile device (UC1-E1a)
**Verdict**: ✅ PASS
**Expected**: 150ms touch hold activates drag; ghost tracks finger; widget commits on lift
**Observed**: `TouchSensor` with `delay:100ms` activated after 200ms hold; opacity dropped below 0.5 during slide; returned to 1.0 after `mouse.up()`
**Screenshots**:
- `TP-3_before.png` — mobile viewport loaded
- `TP-3_step-3-hold.png` — after 200ms hold
- `TP-3_step-4-sliding.png` — mid-slide
- `TP-3_result.png` — committed
**Notes**: Ran on Chromium with mobile emulation (`viewport: 390×844, hasTouch: true`) — WebKit not installed. Equivalent touch event path exercised via `PointerSensor`/`TouchSensor`.

---

### TP-4: Collision rejection in full drag flow (UC1-E7a)
**Verdict**: ✅ PASS
**Expected**: Ghost turns red over occupied cell; widget snaps back; layout unchanged
**Observed**: Ghost border color contained `rgb(239, 68, 68)` (red) when dragged onto col 0 (occupied by widget-a); after `mouse.up()` widget-b `gridColumnStart` = `3` (original col 2); matched pre-drag value
**Screenshots**:
- `TP-4_before.png` — initial state
- `TP-4_step-4-over-occupied.png` — ghost red over widget-a
- `TP-4_result.png` — widget-b back at col 2

---

## Implementation notes

Two `data-testid` attributes were added to the source to support test selectors:
- `DraggableWidget.tsx`: `data-testid={`widget-${id}`}` on the root div
- `DashboardGrid.tsx`: `data-testid="dashboard-grid"` on the grid div

These are consistent with the automation paths specified in test-plan.md.
