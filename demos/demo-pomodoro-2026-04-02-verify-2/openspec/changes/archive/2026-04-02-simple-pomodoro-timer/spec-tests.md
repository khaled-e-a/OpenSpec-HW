# Spec-Test Mapping: simple-pomodoro-timer

Generated: 2026-04-02

## Use Case ID Mapping

| Use Case ID | Name |
|-------------|------|
| UC1 | Run a Pomodoro Work Session |
| UC2 | Pause and Resume the Timer |
| UC3 | Reset the Timer |
| UC4 | Progress Through the Pomodoro Cycle |

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC1 | Run a Pomodoro Work Session — Full Flow | Flow | Integration | `src/test/usePomodoro.test.tsx` | ✅ |
| UC1-S1 | User starts the timer to begin a 25-minute work session | Step | Unit | `src/test/usePomodoro.test.tsx` | ✅ |
| UC1-S1 | User starts the timer to begin a 25-minute work session | Step | PBT | `src/test/timerEngine.property.test.ts` | ✅ |
| UC1-S1 | Start button visible in idle/completed states | Step | Component | `src/test/timerDisplay.test.tsx` | ✅ |
| UC1-S2 | System begins countdown from 25:00, updating each second | Step | Unit | `src/test/usePomodoro.test.tsx` | ✅ |
| UC1-S2 | MM:SS display format | Step | Unit | `src/test/timerDisplay.test.tsx` | ✅ |
| UC1-S2 | MM:SS display format | Step | PBT | `src/test/timerDisplay.property.test.tsx` | ✅ |
| UC1-S3 | System shows the current session type as "Work" | Step | Unit | `src/test/timerDisplay.test.tsx` | ✅ |
| UC1-S3 | System shows the current session type as "Work" | Step | PBT | `src/test/sessionManager.property.test.ts` | ✅ |
| UC1-S4 | User works uninterrupted while the timer counts down | Step | Integration | `src/test/usePomodoro.test.tsx` | ✅ |
| UC1-S5 | System reaches 00:00 and signals session completion | Step | Integration | `src/test/usePomodoro.test.tsx` | ✅ |
| UC1-S5 | Completion banner shown at 00:00 | Step | Component | `src/test/timerDisplay.test.tsx` | ✅ |
| UC1-S5 | Completion banner shown at 00:00 | Step | PBT | `src/test/timerEngine.property.test.ts` | ✅ |
| UC1-S6 | System records completed Pomodoro and advances session | Step | Unit | `src/test/sessionUtils.test.ts` | ✅ |
| UC1-S6 | Pomodoro count increments in display | Step | Component | `src/test/timerDisplay.test.tsx` | ✅ |
| UC1-S6 | Pomodoro count increments in display | Step | PBT | `src/test/sessionManager.property.test.ts` | ✅ |
| UC1-E5a | Timer holds completion state until acknowledged | Extension | Integration | `src/test/usePomodoro.test.tsx` | ✅ |
| UC1-E5a | Completion state persists | Extension | Component | `src/test/timerDisplay.test.tsx` | ✅ |
| UC1-E5a | Completion state persists | Extension | PBT | `src/test/timerEngine.property.test.ts` | ✅ |
| UC2 | Pause and Resume the Timer — Full Flow | Flow | Integration | `src/test/usePomodoro.test.tsx` | ✅ |
| UC2-S1 | User pauses the running timer | Step | Unit | `src/test/usePomodoro.test.tsx` | ✅ |
| UC2-S1 | Pause button visible when running | Step | Component | `src/test/timerDisplay.test.tsx` | ✅ |
| UC2-S1 | Pause button visible when running | Step | PBT | `src/test/timerEngine.property.test.ts` | ✅ |
| UC2-S2 | System halts countdown and preserves remaining time | Step | Unit | `src/test/usePomodoro.test.tsx` | ✅ |
| UC2-S2 | System halts countdown and preserves remaining time | Step | PBT | `src/test/timerEngine.property.test.ts` | ✅ |
| UC2-S3 | System displays "Paused" indicator | Step | Component | `src/test/timerDisplay.test.tsx` | ✅ |
| UC2-S3 | System displays "Paused" indicator | Step | PBT | `src/test/timerDisplay.property.test.tsx` | ✅ |
| UC2-S4 | User handles interruption (user behaviour) | Step | — | — | — |
| UC2-S5 | User resumes the timer | Step | Unit | `src/test/usePomodoro.test.tsx` | ✅ |
| UC2-S5 | Resume button visible when paused | Step | Component | `src/test/timerDisplay.test.tsx` | ✅ |
| UC2-S5 | Resume button visible when paused | Step | PBT | `src/test/timerDisplay.property.test.tsx` | ✅ |
| UC2-S6 | System restarts countdown from preserved time | Step | Unit | `src/test/usePomodoro.test.tsx` | ✅ |
| UC2-S6 | System restarts countdown from preserved time | Step | PBT | `src/test/timerEngine.property.test.ts` | ✅ |
| UC2-S7 | System removes "Paused" indicator on resume | Step | Component | `src/test/timerDisplay.test.tsx` | ✅ |
| UC2-S7 | System removes "Paused" indicator on resume | Step | PBT | `src/test/timerDisplay.property.test.tsx` | ✅ |
| UC2-E2a | Pause immediately after start halts at near-full time | Extension | Unit | `src/test/usePomodoro.test.tsx` | ✅ |
| UC2-E2a | Pause immediately after start halts at near-full time | Extension | PBT | `src/test/timerEngine.property.test.ts` | ✅ |
| UC3 | Reset the Timer — Full Flow | Flow | Integration | `src/test/usePomodoro.test.tsx` | ✅ |
| UC3-S1 | User resets the timer | Step | Unit | `src/test/usePomodoro.test.tsx` | ✅ |
| UC3-S1 | Reset button always visible | Step | Component | `src/test/timerDisplay.test.tsx` | ✅ |
| UC3-S1 | Reset button always visible | Step | PBT | `src/test/timerDisplay.property.test.tsx` | ✅ |
| UC3-S2 | System stops any active countdown | Step | Unit | `src/test/usePomodoro.test.tsx` | ✅ |
| UC3-S3 | System resets display to 25:00 | Step | Unit | `src/test/usePomodoro.test.tsx` | ✅ |
| UC3-S3 | Display shows defaults after reset | Step | Component | `src/test/timerDisplay.test.tsx` | ✅ |
| UC3-S4 | System resets session type to "Work" | Step | Unit | `src/test/sessionUtils.test.ts` | ✅ |
| UC3-S5 | System resets Pomodoro count to zero | Step | Unit | `src/test/sessionUtils.test.ts` | ✅ |
| UC3-S5 | System resets Pomodoro count to zero | Step | PBT | `src/test/sessionManager.property.test.ts` | ✅ |
| UC3-E1a | Reset while idle is idempotent | Extension | Unit | `src/test/sessionUtils.test.ts` | ✅ |
| UC3-E1a | Reset while idle is idempotent | Extension | Unit | `src/test/usePomodoro.test.tsx` | ✅ |
| UC3-E1a | Reset while idle is idempotent | Extension | PBT | `src/test/sessionManager.property.test.ts` | ✅ |
| UC4 | Progress Through Pomodoro Cycle — Full Flow | Flow | Integration | `src/test/usePomodoro.test.tsx` | ✅ |
| UC4-S1 | System advances to short rest after Pomodoro #1 | Step | Unit | `src/test/sessionUtils.test.ts` | ✅ |
| UC4-S1 | System advances to short rest after Pomodoro #1 | Step | PBT | `src/test/sessionManager.property.test.ts` | ✅ |
| UC4-S2 | System starts 5-minute short rest and shows "Short Rest" | Step | Unit | `src/test/sessionUtils.test.ts` | ✅ |
| UC4-S2 | Short rest label in display | Step | Component | `src/test/timerDisplay.test.tsx` | ✅ |
| UC4-S2 | Short rest label in display | Step | PBT | `src/test/sessionManager.property.test.ts` | ✅ |
| UC4-S3 | User completes short rest; system advances to next work | Step | Unit | `src/test/sessionUtils.test.ts` | ✅ |
| UC4-S3 | User completes short rest; system advances to next work | Step | PBT | `src/test/sessionManager.property.test.ts` | ✅ |
| UC4-S4 | Pomodoros 2 and 3 each followed by short rest | Step | Unit | `src/test/sessionUtils.test.ts` | ✅ |
| UC4-S5 | Pomodoro #4 triggers long rest | Step | Unit | `src/test/sessionUtils.test.ts` | ✅ |
| UC4-S5 | Pomodoro #4 triggers long rest | Step | Integration | `src/test/usePomodoro.test.tsx` | ✅ |
| UC4-S5 | Pomodoro #4 triggers long rest | Step | PBT | `src/test/sessionManager.property.test.ts` | ✅ |
| UC4-S6 | System starts 10-minute long rest and shows "Long Rest" | Step | Unit | `src/test/sessionUtils.test.ts` | ✅ |
| UC4-S6 | Long rest label in display | Step | Component | `src/test/timerDisplay.test.tsx` | ✅ |
| UC4-S6 | Long rest label in display | Step | PBT | `src/test/sessionManager.property.test.ts` | ✅ |
| UC4-S7 | Long rest completes; system resets counter | Step | Unit | `src/test/sessionUtils.test.ts` | ✅ |
| UC4-S7 | Long rest completes; system resets counter | Step | PBT | `src/test/sessionManager.property.test.ts` | ✅ |
| UC4-E3a | User skips rest session; system advances cycle | Extension | Unit | `src/test/sessionUtils.test.ts` | ✅ |
| UC4-E3a | Skip button visible during rest only | Extension | Component | `src/test/timerDisplay.test.tsx` | ✅ |
| UC4-E3a | User skips rest session; system advances cycle | Extension | PBT | `src/test/sessionManager.property.test.ts` | ✅ |

## PBT Coverage

| UC Step | Scenario | PBT Test | Framework | Status |
|---------|----------|----------|-----------|--------|
| UC1-S1 | Timer starts from full duration | `src/test/timerEngine.property.test.ts` | fast-check | ✅ |
| UC1-S2 | Display updates each second | `src/test/timerEngine.property.test.ts` | fast-check | ✅ |
| UC1-S2 | Running timer shows MM:SS ticking down | `src/test/timerDisplay.property.test.tsx` | fast-check | ✅ |
| UC1-S2 | Full-duration display at start | `src/test/timerDisplay.property.test.tsx` | fast-check | ✅ |
| UC1-S3 | Initial session is Work | `src/test/sessionManager.property.test.ts` | fast-check | ✅ |
| UC1-S3 | Work session label | `src/test/timerDisplay.property.test.tsx` | fast-check | ✅ |
| UC1-S4 | Countdown runs to zero without input | `src/test/timerEngine.property.test.ts` | fast-check | ✅ |
| UC1-S5 | Completion at zero | `src/test/timerEngine.property.test.ts` | fast-check | ✅ |
| UC1-S5 | Completion banner shown at 00:00 | `src/test/timerDisplay.property.test.tsx` | fast-check | ✅ |
| UC1-S6 | Work session 1 advances to short rest | `src/test/sessionManager.property.test.ts` | fast-check | ✅ |
| UC1-S6 | Pomodoro count increments after work session | `src/test/sessionManager.property.test.ts` | fast-check | ✅ |
| UC1-E5a | Completion state persists when user is absent | `src/test/timerEngine.property.test.ts` | fast-check | ✅ |
| UC1-E5a | Completion state persists while user is absent | `src/test/timerDisplay.property.test.tsx` | fast-check | ✅ |
| UC2-S1 | Pause button visible when running | `src/test/timerDisplay.property.test.tsx` | fast-check | ✅ |
| UC2-S2 | Pause freezes remaining time | `src/test/timerEngine.property.test.ts` | fast-check | ✅ |
| UC2-S3 | Paused label shown when paused | `src/test/timerDisplay.property.test.tsx` | fast-check | ✅ |
| UC2-S5 | Resume button visible when paused | `src/test/timerDisplay.property.test.tsx` | fast-check | ✅ |
| UC2-S6 | Resume continues from pause point | `src/test/timerEngine.property.test.ts` | fast-check | ✅ |
| UC2-E2a | Pause immediately after start | `src/test/timerEngine.property.test.ts` | fast-check | ✅ |
| UC2-S7 | Paused label hidden after resume | `src/test/timerDisplay.property.test.tsx` | fast-check | ✅ |
| UC3-S1 | Reset button always visible | `src/test/timerDisplay.property.test.tsx` | fast-check | ✅ |
| UC3-S3 | Display shows defaults after reset | `src/test/timerDisplay.property.test.tsx` | fast-check | ✅ |
| UC3-S4/S5 | Reset restores Work session defaults | `src/test/sessionManager.property.test.ts` | fast-check | ✅ |
| UC3-E1a | Reset while idle is idempotent | `src/test/sessionManager.property.test.ts` | fast-check | ✅ |
| UC4-S1 | Work session 1 advances to short rest | `src/test/sessionManager.property.test.ts` | fast-check | ✅ |
| UC4-S2 | Short rest label | `src/test/timerDisplay.property.test.tsx` | fast-check | ✅ |
| UC4-S3 | Short rest completion returns to Work | `src/test/sessionManager.property.test.ts` | fast-check | ✅ |
| UC4-S4 | Work sessions 2 and 3 advance to short rest | `src/test/sessionManager.property.test.ts` | fast-check | ✅ |
| UC4-S5 | 4th work session triggers long rest | `src/test/sessionManager.property.test.ts` | fast-check | ✅ |
| UC4-S6 | Long rest label | `src/test/timerDisplay.property.test.tsx` | fast-check | ✅ |
| UC4-S7 | Long rest completion starts new cycle | `src/test/sessionManager.property.test.ts` | fast-check | ✅ |
| UC4-E3a | Skip short rest advances to work | `src/test/sessionManager.property.test.ts` | fast-check | ✅ |
| UC4-E3a | Skip long rest starts new cycle | `src/test/sessionManager.property.test.ts` | fast-check | ✅ |

## Use Case Details: Run a Pomodoro Work Session (ID: UC1)

### Main Scenario
- **UC1-S1**: User starts the timer to begin a 25-minute work session
  - `src/test/usePomodoro.test.tsx` — "UC1-S5, UC1-S6, UC4-S1: work session completion → status completed" (Integration)
  - `src/test/timerDisplay.test.tsx` — "Start button visible when idle" (Component)
  - `src/test/timerDisplay.test.tsx` — "Start button visible after completion" (Component)
  - `src/test/timerEngine.property.test.ts` — UC1-S1: timer always starts from configured duration (PBT)
- **UC1-S2**: System begins countdown from 25:00, updating the display each second
  - `src/test/usePomodoro.test.tsx` — "UC2-S2: pause preserves remaining time" (covers tick; Unit)
  - `src/test/timerDisplay.test.tsx` — "MM:SS countdown display" (Component)
  - `src/test/timerDisplay.property.test.tsx` — UC1-S2: formatTime always produces valid MM:SS (PBT)
- **UC1-S3**: System shows the current session type as "Work"
  - `src/test/timerDisplay.test.tsx` — "Work session label" (Component)
  - `src/test/sessionManager.property.test.ts` — UC1-S3: initial sessionType is always work (PBT)
- **UC1-S4**: User works uninterrupted while the timer counts down
  - `src/test/usePomodoro.test.tsx` — "work session completion" full run (Integration)
  - `src/test/timerEngine.property.test.ts` — UC1-S4: countdown runs without input (PBT)
- **UC1-S5**: System reaches 00:00 and signals session completion
  - `src/test/usePomodoro.test.tsx` — "UC1-S5, UC1-S6, UC4-S1: work session completion → status completed" (Integration)
  - `src/test/timerDisplay.test.tsx` — "Completion banner shown at 00:00" (Component)
  - `src/test/timerEngine.property.test.ts` — UC1-S5: status becomes completed at zero (PBT)
- **UC1-S6**: System records completed Pomodoro and advances to the next session
  - `src/test/sessionUtils.test.ts` — "UC4-S1: Pomodoro #1 → shortRest" (Unit)
  - `src/test/timerDisplay.test.tsx` — "Pomodoro count increments" (Component)
  - `src/test/sessionManager.property.test.ts` — UC1-S6: pomodoroCount always increments correctly (PBT)

### Extensions
- **UC1-E5a**: Timer reaches 00:00 while user is away; system holds completion state
  - `src/test/timerDisplay.test.tsx` — "Completion state persists while user is absent" (Component)
  - `src/test/timerEngine.property.test.ts` — UC1-E5a: completed state persists (PBT)

### Full Flow Tests
- `UC1` — "Run a Pomodoro Work Session" → `src/test/usePomodoro.test.tsx` "UC1-S5, UC1-S6, UC4-S1: work session completion" (Integration)

---

## Use Case Details: Pause and Resume the Timer (ID: UC2)

### Main Scenario
- **UC2-S1**: User pauses the running timer
  - `src/test/usePomodoro.test.tsx` — "UC2-S2: pause preserves remaining time" (Unit)
  - `src/test/timerDisplay.test.tsx` — "Pause button visible when running" (Component)
  - `src/test/timerDisplay.property.test.tsx` — UC2-S1: pause button visible iff running (PBT)
- **UC2-S2**: System halts countdown and preserves remaining time
  - `src/test/usePomodoro.test.tsx` — "UC2-S2: pause preserves remaining time" (Unit)
  - `src/test/timerEngine.property.test.ts` — UC2-S2: remaining time preserved on pause (PBT)
- **UC2-S3**: System displays "Paused" indicator
  - `src/test/timerDisplay.test.tsx` — "Paused label shown when paused" (Component)
  - `src/test/timerDisplay.property.test.tsx` — UC2-S3: paused indicator visible iff paused (PBT)
- **UC2-S4**: User handles interruption
  - _(user behaviour — no system test applicable)_
- **UC2-S5**: User resumes the timer
  - `src/test/usePomodoro.test.tsx` — "UC2-S6: resume continues from preserved remaining time" (Unit)
  - `src/test/timerDisplay.test.tsx` — "Resume button visible when paused" (Component)
  - `src/test/timerDisplay.property.test.tsx` — UC2-S5: resume button visible iff paused (PBT)
- **UC2-S6**: System restarts countdown from preserved remaining time
  - `src/test/usePomodoro.test.tsx` — "UC2-S6: resume continues from preserved remaining time" (Unit)
  - `src/test/timerEngine.property.test.ts` — UC2-S6: resume decrements from preserved value (PBT)
- **UC2-S7**: System removes "Paused" indicator on resume
  - `src/test/timerDisplay.test.tsx` — "Paused label hidden after resume" (Component)
  - `src/test/timerDisplay.property.test.tsx` — UC2-S7: paused indicator absent when running (PBT)

### Extensions
- **UC2-E2a**: Pause immediately after start halts at near-full time
  - `src/test/timerEngine.property.test.ts` — UC2-E2a: immediate pause halts near full duration (PBT)
  - _(example-based stub needed)_ → `src/test/usePomodoro.test.tsx` ❌

### Full Flow Tests
- `UC2` — "Pause and Resume the Timer" → `src/test/usePomodoro.test.tsx` pause/resume suite (Integration)

---

## Use Case Details: Reset the Timer (ID: UC3)

### Main Scenario
- **UC3-S1**: User resets the timer
  - `src/test/usePomodoro.test.tsx` — "UC3-S2/S3/S4/S5: reset while running returns to defaults" (Unit)
  - `src/test/timerDisplay.test.tsx` — "Reset button always visible" (Component)
  - `src/test/timerDisplay.property.test.tsx` — UC3-S1: reset button always visible (PBT)
- **UC3-S2**: System stops any active countdown
  - `src/test/usePomodoro.test.tsx` — "reset while running returns to defaults" (Unit)
- **UC3-S3**: System resets display to 25:00
  - `src/test/usePomodoro.test.tsx` — "reset while running returns to defaults" (Unit)
  - `src/test/timerDisplay.test.tsx` — "Display shows defaults after reset" (Component)
- **UC3-S4**: System resets session type to "Work"
  - `src/test/sessionUtils.test.ts` — "UC3-S3/S4/S5: returns full initial defaults" (Unit)
- **UC3-S5**: System resets Pomodoro count to zero
  - `src/test/sessionUtils.test.ts` — "UC3-S3/S4/S5: returns full initial defaults" (Unit)
  - `src/test/sessionManager.property.test.ts` — UC3-S5: pomodoroCount always 0 after reset (PBT)

### Extensions
- **UC3-E1a**: Reset while idle is idempotent
  - `src/test/sessionUtils.test.ts` — "UC3-E1a: calling twice returns same defaults" (Unit)
  - `src/test/usePomodoro.test.tsx` — "UC3-E1a: reset while idle is idempotent" (Unit)
  - `src/test/sessionManager.property.test.ts` — UC3-E1a: reset always yields same state (PBT)

### Full Flow Tests
- `UC3` — "Reset the Timer" → `src/test/usePomodoro.test.tsx` reset suite (Integration)

---

## Use Case Details: Progress Through the Pomodoro Cycle (ID: UC4)

### Main Scenario
- **UC4-S1**: User completes Pomodoro #1; system advances to short rest
  - `src/test/sessionUtils.test.ts` — "UC4-S1: Pomodoro #1 → shortRest" (Unit)
  - `src/test/usePomodoro.test.tsx` — "UC4-S1: starting after completion advances to shortRest" (Integration)
  - `src/test/sessionManager.property.test.ts` — UC4-S1/S4: work[0..2] → shortRest (PBT)
- **UC4-S2**: System starts 5-minute short rest and shows "Short Rest"
  - `src/test/sessionUtils.test.ts` — "UC4-S1: Pomodoro #1 → shortRest" duration check (Unit)
  - `src/test/timerDisplay.test.tsx` — "Short rest label" (Component)
  - `src/test/sessionManager.property.test.ts` — UC4-S2: SHORT_REST_DURATION always 300 (PBT)
- **UC4-S3**: User completes short rest; system advances to next work
  - `src/test/sessionUtils.test.ts` — "UC4-S3: shortRest completion → work" (Unit)
  - `src/test/sessionManager.property.test.ts` — UC4-S3: shortRest → work (PBT)
- **UC4-S4**: Pomodoros 2 and 3 each followed by short rest
  - `src/test/sessionUtils.test.ts` — "UC4-S4: Pomodoro #2 → shortRest", "#3 → shortRest" (Unit)
  - `src/test/sessionManager.property.test.ts` — UC4-S4: all counts 1..3 → shortRest (PBT)
- **UC4-S5**: Pomodoro #4 triggers long rest
  - `src/test/sessionUtils.test.ts` — "UC4-S5: Pomodoro #4 → longRest and resets count" (Unit)
  - `src/test/usePomodoro.test.tsx` — "UC4-S5, UC4-S6: 4th work session leads to longRest" (Integration)
  - `src/test/sessionManager.property.test.ts` — UC4-S5: count=3 → longRest (PBT)
- **UC4-S6**: System starts 10-minute long rest and shows "Long Rest"
  - `src/test/sessionUtils.test.ts` — "UC4-S5: Pomodoro #4 → longRest" duration check (Unit)
  - `src/test/timerDisplay.test.tsx` — "Long rest label" (Component)
  - `src/test/sessionManager.property.test.ts` — UC4-S6: LONG_REST_DURATION always 600 (PBT)
- **UC4-S7**: Long rest completes; system resets counter and readies new cycle
  - `src/test/sessionUtils.test.ts` — "UC4-S7: longRest completion → work, count stays 0" (Unit)
  - `src/test/sessionManager.property.test.ts` — UC4-S7: longRest → work, count 0 (PBT)

### Extensions
- **UC4-E3a**: User skips rest session; system advances cycle
  - `src/test/sessionUtils.test.ts` — "UC4-E3a: skipping shortRest/longRest → work" (Unit)
  - `src/test/timerDisplay.test.tsx` — "Skip button visible during short/long rest" (Component)
  - `src/test/sessionManager.property.test.ts` — UC4-E3a: skip always → work (PBT)

### Full Flow Tests
- `UC4` — "Progress Through the Pomodoro Cycle" → `src/test/usePomodoro.test.tsx` "UC4-S5, UC4-S6: 4th work session leads to longRest" (Integration)
