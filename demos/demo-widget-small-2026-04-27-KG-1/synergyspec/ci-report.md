## CI Report
Generated: 2026-04-28T15:24:34Z

### Changes Covered
| Change | spec-tests.md | test-report.md | test-plan.md |
|--------|--------------|----------------|--------------|
| react-drag-drop-dashboard | ✅ | ✅ | ✅ |

### Unit/Integration Test Results
| Suite | Tests | Pass | Fail | Skip |
|-------|-------|------|------|------|
| Full project suite | 83 | 83 | 0 | 0 |

### Code Coverage (Full Project)
| Metric | Coverage |
|--------|----------|
| Statements | 57.14% |
| Branches | 88.00% |
| Functions | 62.96% |
| Lines | 57.14% |

> Note: Low statement/line coverage is expected — App.tsx, main.tsx, DashboardGrid.tsx, and widget components are not exercised by unit tests (covered by e2e instead). Branch coverage at 88% reflects strong logic-level coverage of hooks, persistence, and utilities.

### E2E Test Plan Results
| Change | ID | Description | Verdict |
|--------|----|-------------|---------|
| react-drag-drop-dashboard | TP-1 | UC1-S4 — drop zone placeholder visible during drag | ✅ PASS |
| react-drag-drop-dashboard | TP-2 | UC1-E4a — pointer leaves grid canvas, grid stays intact | ✅ PASS |
| react-drag-drop-dashboard | TP-3 | UC1-E5a — widget remains on grid after out-of-bounds release | ✅ PASS |
| react-drag-drop-dashboard | TP-4 | UC5-S2 — react-grid-placeholder present in DOM during drag | ✅ PASS |
| react-drag-drop-dashboard | TP-5 | UC5-S3 — placeholder moves to new cell as pointer crosses grid | ✅ PASS |
| react-drag-drop-dashboard | TP-6 | UC5-S4 — placeholder has visible dashed border (visual baseline) | ✅ PASS |
| react-drag-drop-dashboard | TP-7 | UC5-S5 — placeholder not visible after mouse release | ✅ PASS |
| react-drag-drop-dashboard | TP-8 | UC5-E3a — rgl-grid-full class applied when grid is full | ✅ PASS |

### PBT & Regression Tests
| Change | PBT Tests | Counterexamples Found | Regression Tests | Status |
|--------|-----------|----------------------|-----------------|--------|
| react-drag-drop-dashboard | 14 | 0 | 0 | ✅ |

### Screenshot Comparison
| Screenshot | Compared Against | Result |
|------------|-----------------|--------|
| TP-1-drop-zone-highlight.png | — | 📸 BASELINE (first run) |
| TP-2-no-highlight-outside-grid.png | — | 📸 BASELINE (first run) |
| TP-3-widget-snap-back.png | — | 📸 BASELINE (first run) |
| TP-4-ghost-placeholder.png | — | 📸 BASELINE (first run) |
| TP-5-placeholder-moves.png | — | 📸 BASELINE (first run) |
| TP-6-placeholder-styling.png | — | 📸 BASELINE (first run) |
| TP-7-placeholder-removed.png | — | 📸 BASELINE (first run) |
| TP-8-invalid-placeholder.png | — | 📸 BASELINE (first run) |

No previous run found — screenshots saved as baseline.

### Regressions
None.

### Artifacts
- Coverage: `coverage/lcov-report/index.html`
- Screenshots: `e2e-results/latest/artifacts/`
- Archived to: `e2e-results/2026-04-28_15-24-34/`

---

## Overall Verdict: ✅ PASS

- 83/83 unit + integration + PBT tests passing
- 8/8 e2e tests passing
- 0 visual regressions (first run = baseline)
- 0 open PBT counterexamples
- Build: clean (0 TypeScript errors)
