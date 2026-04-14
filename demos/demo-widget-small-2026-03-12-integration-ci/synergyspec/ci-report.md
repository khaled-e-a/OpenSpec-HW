## CI Report
Generated: 2026-03-12T11:50:50Z

### Overall Verdict: ✅ PASS
> Unit/integration suite: ✅ 29/29 passed
> E2E (Playwright/Chromium): ✅ 5/5 passed
> Screenshot comparison: ✅ Baseline established (first run)
> No regressions detected.

---

### Changes Covered

| Change | spec-tests.md | test-report.md | test-plan.md |
|--------|--------------|----------------|--------------|
| widget-drag-drop | ✅ | ✅ | ✅ |

---

### Unit/Integration Test Results

| Suite | Tests | Pass | Fail | Skip |
|-------|-------|------|------|------|
| `src/__tests__/dashboard.test.tsx` | 12 | 12 | 0 | 0 |
| `src/__tests__/grid.test.ts` | 9 | 9 | 0 | 0 |
| `src/__tests__/collision.test.ts` | 8 | 8 | 0 | 0 |
| **Total** | **29** | **29** | **0** | **0** |

---

### Code Coverage (Full Project — unit/integration only)

| Metric | Coverage |
|--------|----------|
| Statements | 63.8% |
| Branches | 46.15% |
| Functions | 63.33% |
| Lines | 65.13% |

**Coverage by file:**

| File | Stmts | Branch | Funcs | Lines | Uncovered Lines |
|------|-------|--------|-------|-------|-----------------|
| `components/Dashboard.tsx` | 78.57% | 37.5% | 50% | 78.57% | 28–31 |
| `components/DashboardGrid.tsx` | 31.57% | 3.57% | 20% | 33.96% | 43, 50–51, 59–107, 156–159 |
| `components/DraggableWidget.tsx` | 68.75% | 61.53% | 50% | 71.42% | 41–48 |
| `components/ResizeHandle.tsx` | 78.18% | 73.68% | 100% | 78.43% | 70–77, 90–95 |
| `utils/collision.ts` | **100%** | **100%** | **100%** | **100%** | — |
| `utils/grid.ts` | **100%** | **100%** | **100%** | **100%** | — |

> **Note:** Low coverage in `DashboardGrid.tsx` is structural — drag event handlers require @dnd-kit pointer sensor activation, which is not available in jsdom. These code paths are verified by the Playwright e2e suite (TP-1, TP-3). E2E tests do not contribute to line coverage.

---

### E2E Test Plan Results (Playwright/Chromium)

| Change | ID | Description | Verdict |
|--------|----|-------------|---------|
| widget-drag-drop | TP-1 | Drag widget-A to empty cell → position updates | ✅ PASS |
| widget-drag-drop | TP-2 | Ghost placeholder visible during drag (UC1-S2) | ✅ PASS |
| widget-drag-drop | TP-3 | Drop zone valid/invalid highlight during drag (UC1-S4) | ✅ PASS |
| widget-drag-drop | TP-4 | Resize widget-A → layout state updated (UC2-S2,S4,S7) | ✅ PASS |
| widget-drag-drop | TP-5 | Resize preview outline visible during drag (UC2-S3) | ✅ PASS |

---

### Screenshot Comparison

| Screenshot | Previous Run | Result |
|------------|-------------|--------|
| `TP-1-after-drag.png` | — (first run) | ✅ Baseline saved |
| `TP-2-ghost-during-drag.png` | — (first run) | ✅ Baseline saved |
| `TP-3-drop-zone-valid.png` | — (first run) | ✅ Baseline saved |
| `TP-3-drop-zone-invalid.png` | — (first run) | ✅ Baseline saved |
| `TP-4-after-resize.png` | — (first run) | ✅ Baseline saved |
| `TP-5-resize-preview.png` | — (first run) | ✅ Baseline saved |

No previous run found — screenshots saved as baseline for future comparisons.

---

### Regressions

None.

---

### Artifacts

- Coverage HTML: `coverage/lcov-report/index.html`
- E2E screenshots (current): `e2e-results/latest/artifacts/`
- E2E screenshots (archived): `e2e-results/2026-03-12_11-50-50/`
- Playwright results JSON: `e2e-results/latest/playwright-results.json`
- Playwright HTML report: `e2e-results/latest/html-report/`
