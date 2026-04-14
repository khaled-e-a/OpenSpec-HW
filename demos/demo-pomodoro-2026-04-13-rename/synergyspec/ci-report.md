# CI Report

Generated: 2026-04-14T14:24:00

**Verdict: ✅ PASS**

## Changes Covered

| Change | spec-tests.md | test-report.md | test-plan.md |
|--------|---------------|----------------|--------------|
| pomodoro-timer | ✅ | ✅ | ❌ no plan (not needed — 100% auto coverage) |

## Unit/Integration Test Results

| Suite | Tests | Pass | Fail | Skip |
|-------|-------|------|------|------|
| Full project suite (Vitest 2.1.9) | 46 | 46 | 0 | 0 |

**Duration:** 31.49s

**Breakdown:**
- `src/state/timerState.test.ts` — 13 passed
- `src/state/timerState.property.test.ts` — 11 passed (PBT)
- `src/state/usePomodoroTimer.test.ts` — 8 passed
- `src/state/usePomodoroTimer.property.test.ts` — 1 passed (PBT)
- `src/components/Display.test.tsx` — 6 passed
- `src/components/Display.property.test.tsx` — 1 passed (PBT)
- `src/components/Controls.test.tsx` — 4 passed
- `src/components/PomodoroTimer.test.tsx` — 2 passed (integration)

## Code Coverage (Full Project)

Reporter: `@vitest/coverage-v8`

| Metric | Coverage |
|--------|----------|
| Statements | 84.72% |
| Branches | 93.87% |
| Functions | 81.81% |
| Lines | 84.72% |

### By directory

| Path | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| `src/components/` | 100% | 100% | 100% | 100% |
| `src/state/` | 100% | 100% | 100% | 100% |
| `src/utils/notify.ts` | 35% | 33.33% | 50% | 35% |
| `src/main.tsx` | 0% | 0% | 0% | 0% |

**Uncovered analysis:**
- `src/main.tsx` — React entry point (`ReactDOM.createRoot(...).render(...)`). Not reachable from Vitest's jsdom environment. Excluded by design.
- `src/utils/notify.ts:9-22` — Web Audio beep (`AudioContext` + `OscillatorNode`). jsdom does not implement `AudioContext`, so the early-return fallback at line 8 executes and the oscillator branch is never taken. Would require Playwright (real browser) to cover.

All code exercised by the spec (state machine, hook, UI components) is at 100%.

## Spec Blast Radius Coverage

`synergyspec/specs/` is empty (no existing specs) → `synergyspec/changes/pomodoro-timer/spec-blast-radius.md` reports "No existing specs impacted by this change." No cross-reference needed.

✅ No blast-radius coverage gaps.

## E2E Test Plan Results

No `test-plan.md` files found across any change — skipping e2e phase.

All 17 use case steps and 13 WHEN/THEN scenarios are covered by automated Vitest tests (unit + component + integration + PBT). No manual/browser steps were required.

## PBT & Regression Tests

| Change | PBT Tests | Counterexamples Found | Regression Tests | Status |
|--------|-----------|----------------------|------------------|--------|
| pomodoro-timer | 13 | 0 (this run) | 0 | ✅ |

Note: a prior run during `/synspec:gen-tests` surfaced one counterexample (`formatTime(6000) → "100:00"` violating the `\d{2}:\d{2}` regex in `Display.property.test.tsx`). It was resolved by tightening the generator to the spec's `[0, WORK_SECONDS]` bounds rather than modifying production code, so no regression test was promoted. `pbt-regressions.md` was not created because there are no open regressions.

## Screenshot Comparison

No `e2e-results/` directory exists → no current or previous screenshots to compare. Skipped.

## Regressions

None.

## Artifacts

- Coverage report: `coverage/` (run `open coverage/index.html` to view)
- Test report (per-change): `synergyspec/changes/pomodoro-timer/test-report.md`
- Spec-test mapping: `synergyspec/changes/pomodoro-timer/spec-tests.md`
- Spec blast radius: `synergyspec/changes/pomodoro-timer/spec-blast-radius.md`
- Screenshots: _(none — no e2e configured for this change)_

## Summary

- **Unit/integration/PBT:** 46/46 pass
- **Coverage of spec-relevant code:** 100%
- **Overall code coverage:** 84.72% (uncovered = React entry + Web Audio branch not reachable in jsdom)
- **E2E:** not required; spec is fully automatable
- **Visual regressions:** none
- **Open PBT counterexamples:** none

**Overall verdict: ✅ PASS.** The `pomodoro-timer` change is ready to archive via `/synspec:archive`.
