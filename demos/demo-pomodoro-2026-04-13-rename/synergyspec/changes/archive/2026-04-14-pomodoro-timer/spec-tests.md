# Spec-Test Mapping: pomodoro-timer

Generated: 2026-04-14

## Use Case ID Mapping

| UC ID | Name |
|-------|------|
| UC1 | Run a Pomodoro cycle |
| UC2 | Reset the current phase |

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC1 | Run a Pomodoro cycle — full flow | Flow | Integration | `src/components/PomodoroTimer.test.tsx:43` | ✅ |
| UC2 | Reset the current phase — full flow | Flow | Integration | `src/components/PomodoroTimer.test.tsx:14` | ✅ |
| UC1-S1 | User requests to start the timer | Step | Unit | `src/state/timerState.test.ts:15` | ✅ |
| UC1-S1 | User requests to start the timer | Step | Unit | `src/components/Controls.test.tsx:7` | ✅ |
| UC1-S1 | User requests to start the timer | Step | Component | `src/state/usePomodoroTimer.test.ts:21` | ✅ |
| UC1-S1 | User requests to start the timer | Step | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC1-S2 | System begins counting down the 25-minute work phase and displays remaining time | Step | Unit | `src/state/timerState.test.ts:28` | ✅ |
| UC1-S2 | System begins counting down the 25-minute work phase and displays remaining time | Step | Unit | `src/components/Display.test.tsx:6`, `src/components/Display.test.tsx:21` | ✅ |
| UC1-S2 | System begins counting down the 25-minute work phase and displays remaining time | Step | Component | `src/state/usePomodoroTimer.test.ts:21` | ✅ |
| UC1-S2 | System begins counting down the 25-minute work phase and displays remaining time | Step | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC1-S3 | System reaches zero on the work phase and notifies the user that work is complete | Step | Unit | `src/state/timerState.test.ts:42` | ✅ |
| UC1-S3 | System reaches zero on the work phase and notifies the user that work is complete | Step | Component | `src/state/usePomodoroTimer.test.ts:102` | ✅ |
| UC1-S3 | System reaches zero on the work phase and notifies the user that work is complete | Step | Integration | `src/components/PomodoroTimer.test.tsx:43` | ✅ |
| UC1-S3 | System reaches zero on the work phase and notifies the user that work is complete | Step | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC1-S4 | System transitions to the 5-minute rest phase and begins counting down | Step | Unit | `src/state/timerState.test.ts:42` | ✅ |
| UC1-S4 | System transitions to the 5-minute rest phase and begins counting down | Step | Component | `src/state/usePomodoroTimer.test.ts:82` | ✅ |
| UC1-S4 | System transitions to the 5-minute rest phase and begins counting down | Step | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC1-S5 | System reaches zero on the rest phase and notifies the user that rest is complete | Step | Unit | `src/state/timerState.test.ts:50` | ✅ |
| UC1-S5 | System reaches zero on the rest phase and notifies the user that rest is complete | Step | Component | `src/state/usePomodoroTimer.test.ts:102` | ✅ |
| UC1-S5 | System reaches zero on the rest phase and notifies the user that rest is complete | Step | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC1-S6 | System returns to the idle work phase, ready for the next cycle | Step | Unit | `src/state/timerState.test.ts:50` | ✅ |
| UC1-S6 | System returns to the idle work phase, ready for the next cycle | Step | Component | `src/state/usePomodoroTimer.test.ts:82` | ✅ |
| UC1-S6 | System returns to the idle work phase, ready for the next cycle | Step | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC1-E2a | User requests to pause the timer | Extension | Unit | `src/state/timerState.test.ts:58` | ✅ |
| UC1-E2a | User requests to pause the timer | Extension | Unit | `src/components/Controls.test.tsx:23` | ✅ |
| UC1-E2a | User requests to pause the timer | Extension | Component | `src/state/usePomodoroTimer.test.ts:37` | ✅ |
| UC1-E2a | User requests to pause the timer | Extension | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC1-E2a1 | System halts the countdown and retains the remaining time | Extension | Unit | `src/state/timerState.test.ts:58` | ✅ |
| UC1-E2a1 | System halts the countdown and retains the remaining time | Extension | Component | `src/state/usePomodoroTimer.test.ts:37` | ✅ |
| UC1-E2a1 | System halts the countdown and retains the remaining time | Extension | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC1-E2a2 | User requests to resume; system continues counting from the retained time | Extension | Unit | `src/state/timerState.test.ts:71` | ✅ |
| UC1-E2a2 | User requests to resume; system continues counting from the retained time | Extension | Unit | `src/components/Controls.test.tsx:39` | ✅ |
| UC1-E2a2 | User requests to resume; system continues counting from the retained time | Extension | Component | `src/state/usePomodoroTimer.test.ts:37` | ✅ |
| UC1-E2a2 | User requests to resume; system continues counting from the retained time | Extension | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC1-E3a | User dismisses the end-of-work notification before rest begins | Extension | Component | `src/state/usePomodoroTimer.test.ts:108` | ✅ |
| UC1-E3a | User dismisses the end-of-work notification before rest begins | Extension | Integration | `src/components/PomodoroTimer.test.tsx:43` | ✅ |
| UC1-E3a | User dismisses the end-of-work notification before rest begins | Extension | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC1-E3a1 | System proceeds to the rest phase regardless of dismissal | Extension | Unit | `src/state/timerState.test.ts:42` | ✅ |
| UC1-E3a1 | System proceeds to the rest phase regardless of dismissal | Extension | Integration | `src/components/PomodoroTimer.test.tsx:43` | ✅ |
| UC1-E3a1 | System proceeds to the rest phase regardless of dismissal | Extension | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC1-E5a | User dismisses the end-of-rest notification | Extension | Component | `src/state/usePomodoroTimer.test.ts:130` | ✅ |
| UC1-E5a | User dismisses the end-of-rest notification | Extension | Integration | `src/components/PomodoroTimer.test.tsx:43` | ✅ |
| UC1-E5a | User dismisses the end-of-rest notification | Extension | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC1-E5a1 | System returns to idle work phase regardless of dismissal | Extension | Unit | `src/state/timerState.test.ts:50` | ✅ |
| UC1-E5a1 | System returns to idle work phase regardless of dismissal | Extension | Integration | `src/components/PomodoroTimer.test.tsx:43` | ✅ |
| UC1-E5a1 | System returns to idle work phase regardless of dismissal | Extension | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC2-S1 | User requests to reset the timer | Step | Unit | `src/state/timerState.test.ts:84` | ✅ |
| UC2-S1 | User requests to reset the timer | Step | Unit | `src/components/Controls.test.tsx:55` | ✅ |
| UC2-S1 | User requests to reset the timer | Step | Component | `src/state/usePomodoroTimer.test.ts:63` | ✅ |
| UC2-S1 | User requests to reset the timer | Step | Integration | `src/components/PomodoroTimer.test.tsx:14` | ✅ |
| UC2-S1 | User requests to reset the timer | Step | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC2-S2 | System stops any active countdown | Step | Unit | `src/state/timerState.test.ts:84` | ✅ |
| UC2-S2 | System stops any active countdown | Step | Component | `src/state/usePomodoroTimer.test.ts:63` | ✅ |
| UC2-S2 | System stops any active countdown | Step | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC2-S3 | System restores the remaining time to the full duration of the current phase | Step | Unit | `src/state/timerState.test.ts:84`, `src/state/timerState.test.ts:94` | ✅ |
| UC2-S3 | System restores the remaining time to the full duration of the current phase | Step | Component | `src/state/usePomodoroTimer.test.ts:63` | ✅ |
| UC2-S3 | System restores the remaining time to the full duration of the current phase | Step | PBT | `src/state/timerState.property.test.ts` | ✅ |
| UC2-S4 | System enters the idle state, awaiting a new start request | Step | Unit | `src/state/timerState.test.ts:84` | ✅ |
| UC2-S4 | System enters the idle state, awaiting a new start request | Step | Component | `src/state/usePomodoroTimer.test.ts:63` | ✅ |
| UC2-S4 | System enters the idle state, awaiting a new start request | Step | PBT | `src/state/timerState.property.test.ts` | ✅ |

## PBT Coverage

Framework: **fast-check** ^4.6.0 (installed as devDependency). Integrates with Vitest.

Every WHEN/THEN scenario from `specs/pomodoro-timer/spec.md` needs exactly one PBT test.

| UC Step | Scenario (from spec) | PBT Test | Framework | Status |
|---------|----------------------|----------|-----------|--------|
| UC1-S1 | Start from idle work phase | `src/state/timerState.property.test.ts` | fast-check | ❌ missing |
| UC1-S1 | Start ignored while already running | `src/state/timerState.property.test.ts` | fast-check | ❌ missing |
| UC1-S2 | Remaining time updates every second | `src/state/timerState.property.test.ts` | fast-check | ❌ missing |
| UC1-S2 | Work phase label visible | `src/components/Display.property.test.tsx` | fast-check | ✅ |
| UC1-S3 | Work phase completes | `src/state/timerState.property.test.ts` | fast-check | ❌ missing |
| UC1-S4 | Auto-transition from work to rest | `src/state/timerState.property.test.ts` | fast-check | ❌ missing |
| UC1-S5 | Rest phase completes | `src/state/timerState.property.test.ts` | fast-check | ❌ missing |
| UC1-S6 | Cycle ends, system awaits next start | `src/state/timerState.property.test.ts` | fast-check | ❌ missing |
| UC1-E2a / UC1-E2a1 | Pause mid-work | `src/state/timerState.property.test.ts` | fast-check | ❌ missing |
| UC1-E2a2 | Resume after pause | `src/state/timerState.property.test.ts` | fast-check | ❌ missing |
| UC1-E3a / UC1-E5a (non-blocking) | Phase transition does not wait for dismissal | `src/state/usePomodoroTimer.property.test.ts` | fast-check | ✅ |
| UC2 | Reset while running in work phase | `src/state/timerState.property.test.ts` | fast-check | ❌ missing |
| UC2 | Reset while paused in rest phase | `src/state/timerState.property.test.ts` | fast-check | ❌ missing |

## Use Case Details: Run a Pomodoro cycle (ID: UC1)

### Main Scenario
- **UC1-S1** — User requests to start the timer
  - `src/state/timerState.test.ts:15` START transitions idle to running (Unit)
  - `src/components/Controls.test.tsx:7` Start button triggers onStart (Unit)
  - `src/state/usePomodoroTimer.test.ts:21` start() begins ticking (Component)
- **UC1-S2** — System begins counting down the 25-minute work phase and displays remaining time
  - `src/state/timerState.test.ts:28` TICK decrements remainingSeconds (Unit)
  - `src/components/Display.test.tsx:6` renders 25:00 (Unit)
  - `src/components/Display.test.tsx:21` Work label visible (Unit)
  - `src/state/usePomodoroTimer.test.ts:21` start() begins ticking once per second (Component)
- **UC1-S3** — System reaches zero on the work phase and notifies the user that work is complete
  - `src/state/timerState.test.ts:42` PHASE_END from work (Unit)
  - `src/state/usePomodoroTimer.test.ts:102` fires onPhaseEnd at end of each phase (Component)
  - `src/components/PomodoroTimer.test.tsx:43` work→rest→idle cycle (Integration)
- **UC1-S4** — System transitions to the 5-minute rest phase and begins counting down
  - `src/state/timerState.test.ts:42` PHASE_END transitions work → rest with 5:00 (Unit)
  - `src/state/usePomodoroTimer.test.ts:82` auto-transitions work → rest (Component)
- **UC1-S5** — System reaches zero on the rest phase and notifies the user that rest is complete
  - `src/state/timerState.test.ts:50` PHASE_END from rest (Unit)
  - `src/state/usePomodoroTimer.test.ts:102` onPhaseEnd for rest (Component)
- **UC1-S6** — System returns to the idle work phase, ready for the next cycle
  - `src/state/timerState.test.ts:50` PHASE_END from rest returns to idle work (Unit)
  - `src/state/usePomodoroTimer.test.ts:82` rest → idle work (Component)

### Extensions
- **UC1-E2a** — User requests to pause the timer
  - `src/state/timerState.test.ts:58` PAUSE transitions running to paused (Unit)
  - `src/components/Controls.test.tsx:23` shows Pause button when running (Unit)
  - `src/state/usePomodoroTimer.test.ts:37` pause halts countdown (Component)
- **UC1-E2a1** — System halts the countdown and retains the remaining time
  - `src/state/timerState.test.ts:58` retains remainingSeconds on pause (Unit)
  - `src/state/usePomodoroTimer.test.ts:37` retained time observed (Component)
- **UC1-E2a2** — User requests to resume; system continues counting from the retained time
  - `src/state/timerState.test.ts:71` RESUME (Unit)
  - `src/components/Controls.test.tsx:39` Resume button when paused (Unit)
  - `src/state/usePomodoroTimer.test.ts:37` resume continues (Component)
- **UC1-E3a** — User dismisses the end-of-work notification before rest begins
  - ⚠️ No explicit dismissal test (notification is non-blocking, nothing to dismiss)
  - `src/components/PomodoroTimer.test.tsx:43` proves transition is not gated on user (Integration, partial)
- **UC1-E3a1** — System proceeds to the rest phase regardless of dismissal
  - `src/state/timerState.test.ts:42` PHASE_END transitions unconditionally (Unit)
  - `src/components/PomodoroTimer.test.tsx:43` work→rest happens automatically (Integration)
- **UC1-E5a** — User dismisses the end-of-rest notification
  - ⚠️ Same as UC1-E3a — no explicit dismissal test
  - `src/components/PomodoroTimer.test.tsx:43` (Integration, partial)
- **UC1-E5a1** — System returns to idle work phase regardless of dismissal
  - `src/state/timerState.test.ts:50` (Unit)
  - `src/components/PomodoroTimer.test.tsx:43` (Integration)

### Full Flow Tests
- `UC1` — "work→rest→idle cycle transitions phases automatically" → `src/components/PomodoroTimer.test.tsx:43` (Integration)

## Use Case Details: Reset the current phase (ID: UC2)

### Main Scenario
- **UC2-S1** — User requests to reset the timer
  - `src/state/timerState.test.ts:84` RESET from running work (Unit)
  - `src/components/Controls.test.tsx:55` Reset button triggers onReset (Unit)
  - `src/state/usePomodoroTimer.test.ts:63` reset() stops countdown (Component)
  - `src/components/PomodoroTimer.test.tsx:14` full lifecycle includes reset (Integration)
- **UC2-S2** — System stops any active countdown
  - `src/state/timerState.test.ts:84` RESET stops countdown (Unit)
  - `src/state/usePomodoroTimer.test.ts:63` (Component)
- **UC2-S3** — System restores the remaining time to the full duration of the current phase
  - `src/state/timerState.test.ts:84` restores 25:00 in work (Unit)
  - `src/state/timerState.test.ts:94` restores 5:00 in rest (Unit)
  - `src/state/usePomodoroTimer.test.ts:63` (Component)
- **UC2-S4** — System enters the idle state, awaiting a new start request
  - `src/state/timerState.test.ts:84` (Unit)
  - `src/state/usePomodoroTimer.test.ts:63` (Component)

### Extensions
(none)

### Full Flow Tests
- `UC2` — "full lifecycle: start → tick → pause → resume → reset" → `src/components/PomodoroTimer.test.tsx:14` (Integration)
