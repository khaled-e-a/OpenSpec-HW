## CI Report

Generated: 2026-03-16T14:06:11Z

---

### Changes Covered

| Change | spec-tests.md | test-report.md | test-plan.md |
|--------|--------------|----------------|--------------|
| widget-management | ✅ | ✅ | ❌ no plan |
| archive/2026-03-13-widget-drag-drop | ✅ | ✅ | ✅ |

> ⚠️ **widget-management** has no `test-plan.md`. The archived change `2026-03-13-widget-drag-drop` supplies the e2e test plan (TP-1, TP-2, TP-3) used for this run.

---

### Unit/Integration Test Results

| Suite | Tests | Pass | Fail | Skip |
|-------|-------|------|------|------|
| Full project suite (Vitest) | 87 | 87 | 0 | 0 |

**Test files:**
| File | Tests |
|------|-------|
| `src/utils/placement.test.ts` | 16 |
| `src/utils/snapGrid.test.ts` | 8 |
| `src/utils/placement.integration.test.ts` | 15 |
| `src/hooks/useDashboardLayout.test.ts` | 15 |
| `src/components/Widget.test.tsx` | 17 |
| `src/components/DashboardGrid.test.tsx` | 16 |
| **Total** | **87** |

> ℹ️ Two `act(...)` warnings emitted by Widget resize tests — non-fatal, all tests pass.

---

### Code Coverage (Full Project)

> Coverage measured by `@vitest/coverage-v8` — v8 native coverage

| Metric | Coverage |
|--------|----------|
| Statements | 74.5% |
| Branches | 81.35% |
| Functions | 77.77% |
| Lines | 74.5% |

**Notable gaps:**
- `src/components/DropPreview.tsx` — 11.76% statements (lines 23–38; covered by e2e only)
- `src/components/DashboardGrid.tsx` — 65.76% (lines 343–354, 360–382 are drag/drop paths requiring real browser)
- `App.tsx`, `main.tsx` — 0% (entry points, not under test)

> ℹ️ E2E tests (Playwright) do not contribute to line coverage metrics.

---

### E2E Test Plan Results

| Change | ID | Description | Verdict |
|--------|----|-------------|---------|
| archive/2026-03-13-widget-drag-drop | TP-1 | UC1-S1 — Dragging a widget dims original slot to opacity 0.3 | ✅ PASS |
| archive/2026-03-13-widget-drag-drop | TP-2 | UC1-E3a1 — DropPreview shows red highlight over occupied cell | ✅ PASS |
| archive/2026-03-13-widget-drag-drop | TP-3 | UC2-S3/S4 — Resize handle drag shows live DropPreview overlay | ✅ PASS |

**E2E tool:** Playwright 1.58.2 | **Browser:** Chromium (headless)
**Duration:** 6.0s (3 tests, 1 worker)

---

### Screenshot Comparison

Compared against previous run: `2026-03-13_13-26-14`

| Screenshot | percent_diff | Result |
|------------|-------------|--------|
| `TP-1_before.png` | 2.01% | 🔴 REGRESSION |
| `TP-1_during_drag.png` | 5.00% | 🔴 REGRESSION |
| `TP-2_drag_invalid.png` | 4.73% | 🔴 REGRESSION |
| `TP-2_drag_valid.png` | 5.76% | 🔴 REGRESSION |
| `TP-3_after_resize.png` | 1.75% | 🔴 REGRESSION |
| `TP-3_before_resize.png` | 1.76% | 🔴 REGRESSION |
| `TP-3_during_resize.png` | 5.38% | 🔴 REGRESSION |

---

### Regressions

**7 visual regression(s) detected** — all screenshots differ from the 2026-03-13 baseline by more than 1.0%.

| Screenshot | percent_diff | Notes |
|------------|-------------|-------|
| `TP-1_before.png` | 2.01% | App idle state differs — possible style/layout shift since 2026-03-13 |
| `TP-1_during_drag.png` | 5.00% | Drag ghost / dimming differs — check DragOverlay or opacity animation |
| `TP-2_drag_invalid.png` | 4.73% | Red DropPreview highlight area differs — collision zone or colour shifted |
| `TP-2_drag_valid.png` | 5.76% | Blue DropPreview highlight area differs — snap target rendering changed |
| `TP-3_after_resize.png` | 1.75% | Post-resize widget dimensions differ slightly from baseline |
| `TP-3_before_resize.png` | 1.76% | App idle state (before resize) differs — same root cause as TP-1_before |
| `TP-3_during_resize.png` | 5.38% | Live resize DropPreview differs — rafThrottle timing or overlay geometry changed |

> **Likely root cause**: Screenshots were captured on 2026-03-16 with Playwright 1.58.2; the baseline was captured on 2026-03-13. Differences may reflect intentional UI changes introduced by the `widget-management` change (add/remove widget features). If the new visuals are correct, the current run is now the new baseline.

---

### Artifacts

- Coverage HTML: `coverage/lcov-report/index.html`
- E2E screenshots (current): `e2e-results/latest/artifacts/`
- E2E JSON results: `e2e-results/latest/playwright-results.json`
- Archived to: `e2e-results/2026-03-16_14-06-11/`
- Previous baseline: `e2e-results/2026-03-13_13-26-14/`

---

### Overall Verdict: ⚠️ FAIL

| Check | Status |
|-------|--------|
| Unit/integration: 87/87 | ✅ PASS |
| E2E functional: 3/3 | ✅ PASS |
| Visual regressions: 7/7 screenshots > 1.0% diff | 🔴 FAIL |
| widget-management has no test-plan.md | ⚠️ PARTIAL |

**Suggested actions:**
1. Review `e2e-results/latest/artifacts/` to determine if visual changes are intentional (likely due to new add/remove widget UI from `widget-management`)
2. If changes are expected: re-run `/opsx-hw:ci` to accept current screenshots as the new baseline
3. If changes are unexpected: investigate CSS/layout regressions since 2026-03-13
4. Add a `test-plan.md` for **widget-management**: run `/opsx-hw:gen-tests` then `/opsx-hw:run-tests`
5. Once regressions are resolved: run `/opsx-hw:archive` to close `widget-management`
