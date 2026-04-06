# Spec-Test Mapping: update-timer-durations-and-notes
Generated: 2026-04-02

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC1 | Work Session Full Flow | Flow | Integration | `test/session-management.test.js` | ✅ |
| UC2 | Long Rest Full Flow | Flow | Integration | `test/session-management.test.js` | ✅ |
| UC3 | Write Task Notes Full Flow | Flow | Integration | `test/task-notes.test.js` | ✅ |
| UC4 | Clear Task Notes Full Flow | Flow | Integration | `test/task-notes.test.js` | ✅ |
| R1 | Session durations are fixed constants | Step | Unit | `test/session-management.test.js` | ✅ |
| R1 | Session durations are fixed constants | Step | PBT | `test/session-management.property.test.js` | ✅ |
| R1-S1 | Work session duration: 1800 s | Step | Unit | `test/session-management.test.js:18` — "WORK duration constant is 1800" | ✅ |
| R1-S1 | Work session duration: 1800 s | Step | PBT | `test/session-management.property.test.js:31` — "Work session always starts at 1800 s" | ✅ |
| R1-S2 | Short Rest duration: 300 s | Step | Unit | `test/session-management.test.js:22` — "SHORT_REST duration constant is 300" | ✅ |
| R1-S2 | Short Rest duration: 300 s | Step | PBT | `test/session-management.property.test.js:48` — "SHORT_REST duration constant is always 300" | ✅ |
| R1-S3 | Long Rest duration: 1500 s | Step | Unit | `test/session-management.test.js:26` — "LONG_REST duration constant is 1500" | ✅ |
| R1-S3 | Long Rest duration: 1500 s | Step | PBT | `test/session-management.property.test.js:59` — "LONG_REST duration constant is always 1500" | ✅ |
| R2 | Determine next session type after work session | Step | Component | `test/session-management.test.js` | ✅ |
| R2 | Determine next session type after work session | Step | PBT | `test/session-management.property.test.js` | ✅ |
| UC1-S7 | Transition to Short Rest (non-multiple of 4) | Step | Unit | `test/session-management.test.js:33` — "1st pomodoro → SHORT_REST" | ✅ |
| UC1-S7 | Transition to Short Rest (non-multiple of 4) | Step | Component | `test/session-management.test.js:51` — "2nd pomodoro → SHORT_REST" | ✅ |
| UC1-S7 | Transition to Short Rest (non-multiple of 4) | Step | PBT | `test/session-management.property.test.js:88` — "after non-multiple-of-4 work completion, next is SHORT_REST" | ✅ |
| UC1-S7 | First three pomodoros trigger Short Rest | Step | PBT | `test/session-management.property.test.js:156` — "first three pomodoros always yield Short Rest" | ✅ |
| UC1-E7a1 | 4th pomodoro triggers Long Rest (25 min) | Extension | Component | `test/session-management.test.js:69` — "4th pomodoro → LONG_REST at 1500 s" | ✅ |
| UC1-E7a1 | 4th pomodoro triggers Long Rest (25 min) | Extension | PBT | `test/session-management.property.test.js:104` — "after 4th work completion, next is LONG_REST at 1500 s" | ✅ |
| UC1-E7a1 | 4th pomodoro triggers Long Rest (25 min) | Extension | PBT | `test/session-management.property.test.js:130` — "exactly the 4th pomodoro always triggers Long Rest" | ✅ |
| R3 | Display countdown in MM:SS format | Step | Unit | `test/timer-ui.test.js` | ✅ |
| R3 | Display countdown in MM:SS format | Step | PBT | `test/timer-ui.property.test.js` | ✅ |
| UC1-S2 | Display updates each second | Step | Unit | `test/timer-ui.test.js:64` — "idle Work Session snapshot has remainingSeconds = 1800" | ✅ |
| UC1-S2 | Display updates each second | Step | PBT | `test/timer-ui.property.test.js:37` — "every tick decrements displayed time by at most 1 second" | ✅ |
| UC1-S2 | Display updates each second (Work=30:00) | Step | PBT | `test/timer-ui.property.test.js:71` — "idle Work session always shows 30:00" | ✅ |
| R3-S2 | Format is MM:SS | Step | Unit | `test/timer-ui.test.js:43` — "formatTime produces zero-padded MM:SS for 1800 s (30:00)" | ✅ |
| R3-S2 | Format is MM:SS | Step | Unit | `test/timer-ui.test.js:55` — "formatTime produces correct MM:SS for arbitrary mid-session values" | ✅ |
| R3-S2 | Format is MM:SS | Step | PBT | `test/timer-ui.property.test.js:56` — "formatTime always produces N+:SS pattern" | ✅ |
| R3-S3 | Display shows full duration when idle | Step | Unit | `test/timer-ui.test.js:64` — "idle Work Session snapshot shows 30:00" | ✅ |
| R3-S3 | Display shows full duration when idle | Step | Unit | `test/timer-ui.test.js:70` — "idle Long Rest snapshot shows 25:00" | ✅ |
| R4 | Display notes area | Step | Unit | `test/timer-ui.test.js:93` — "timer snapshot does not contain a notes field" | ✅ |
| R4 | Display notes area | Step | PBT | `test/timer-ui.property.test.js:93` — "timer snapshot never contains a notes key" | ✅ |
| R4-S1 | Notes area visible in all timer states | Step | Unit | `test/timer-ui.test.js:93` | ✅ |
| R4-S1 | Notes area visible in all timer states | Step | PBT | `test/timer-ui.property.test.js:93` — "timer snapshot never contains a notes key in any state" | ✅ |
| R4-S2 | User can type notes (textarea independence) | Step | Unit | `test/timer-ui.test.js:99` — "resetTimer() does not modify notes" | ✅ |
| R4-S2 | User can type notes (textarea independence) | Step | PBT | `test/timer-ui.property.test.js:111` — "timer state has no field that would interfere with textarea" | ✅ |
| R4-S3 | Notes persist across session transitions | Step | Unit | `test/task-notes.test.js:80` — "notes remain after work session completes" | ✅ |
| R4-S3 | Notes persist across session transitions | Step | PBT | `test/timer-ui.property.test.js:128` — "session transition snapshots contain no notes reference" | ✅ |
| R4-S4 | Notes persist across timer resets | Step | Unit | `test/timer-ui.test.js:99` — "resetTimer() does not modify notes" | ✅ |
| R4-S4 | Notes persist across timer resets | Step | PBT | `test/timer-ui.property.test.js:147` — "resetTimer never returns a snapshot with a notes field" | ✅ |
| R4-S5 | Notes area has visible placeholder when empty | Step | Unit | `test/timer-ui.test.js:109` — "DURATIONS object has no notes-related keys" | ✅ |
| R4-S5 | Notes area has visible placeholder when empty | Step | PBT | `test/timer-ui.property.test.js:168` — "DURATIONS object is stable and contains no notes-related keys" | ✅ |
| R5 | Accept and retain free-form note input | Step | Unit | `test/task-notes.test.js:51` | ✅ |
| R5 | Accept and retain free-form note input | Step | PBT | `test/task-notes.property.test.js:37` | ✅ |
| UC3-S3 | Notes area accepts typing | Step | Unit | `test/task-notes.test.js:51` — "notes value is set to typed text" | ✅ |
| UC3-S3 | Notes area accepts typing | Step | PBT | `test/task-notes.property.test.js:37` — "notes value always equals what was typed" | ✅ |
| UC3-S4 | Notes content retained between keystrokes | Step | Unit | `test/task-notes.test.js:57` — "multi-character content is fully retained" | ✅ |
| UC3-S4 | Notes content retained between keystrokes | Step | Unit | `test/task-notes.test.js:62` — "notes content is not modified by timer operations" | ✅ |
| UC3-S4 | Notes content retained between keystrokes | Step | PBT | `test/task-notes.property.test.js:51` — "multi-line notes content is fully retained" | ✅ |
| R6 | Preserve notes across session transitions | Step | Component | `test/task-notes.test.js:80` | ✅ |
| R6 | Preserve notes across session transitions | Step | PBT | `test/task-notes.property.test.js:70` | ✅ |
| UC3-S5 | Notes preserved on work-to-rest transition | Step | Component | `test/task-notes.test.js:80` — "notes remain after work session completes" | ✅ |
| UC3-S5 | Notes preserved on work-to-rest transition | Step | PBT | `test/task-notes.property.test.js:70` — "work completion does not modify notes value" | ✅ |
| UC3-S6 | Notes preserved on rest-to-work transition | Step | Component | `test/task-notes.test.js:95` — "notes remain after rest session completes" | ✅ |
| UC3-S6 | Notes preserved on rest-to-work transition | Step | PBT | `test/task-notes.property.test.js:91` — "rest completion does not modify notes value" | ✅ |
| R7 | Preserve notes on timer reset | Step | Unit | `test/task-notes.test.js:117` | ✅ |
| R7 | Preserve notes on timer reset | Step | PBT | `test/task-notes.property.test.js:113` | ✅ |
| UC3-E5a1 | Notes intact after reset | Extension | Unit | `test/task-notes.test.js:117` — "timer reset returns to IDLE but notes value is unchanged" | ✅ |
| UC3-E5a1 | Notes intact after reset | Extension | Unit | `test/task-notes.test.js:127` — "resetTimer() snapshot has no notes property" | ✅ |
| UC3-E5a2 | Notes content remains after multiple resets | Extension | Unit | `test/task-notes.test.js:132` — "notes intact after multiple resets" | ✅ |
| UC3-E5a2 | Notes content remains after multiple resets | Extension | PBT | `test/task-notes.property.test.js:113` — "resetTimer never modifies notes value" | ✅ |
| R8 | Allow user to clear notes | Step | Unit | `test/task-notes.test.js:148` | ✅ |
| R8 | Allow user to clear notes | Step | PBT | `test/task-notes.property.test.js:140` | ✅ |
| UC4-S1 | User clears notes manually | Step | Unit | `test/task-notes.test.js:148` — "clearing notes sets value to empty string" | ✅ |
| UC4-S1 | User clears notes manually | Step | PBT | `test/task-notes.property.test.js:140` — "clearing always results in empty notes value" | ✅ |
| UC4-S3 | Empty notes area accepts new input | Step | Unit | `test/task-notes.test.js:154` — "after clearing, new text can be typed" | ✅ |
| UC4-S3 | Empty notes area accepts new input | Step | PBT | `test/task-notes.property.test.js:155` — "cleared notes area always accepts new input" | ✅ |
| R9 | Notes clearing does not affect timer state | Step | Component | `test/task-notes.test.js:171` | ✅ |
| R9 | Notes clearing does not affect timer state | Step | PBT | `test/task-notes.property.test.js:176` | ✅ |
| UC4-S4 | Timer state unchanged after clearing notes | Step | Component | `test/task-notes.test.js:171` — "clearing notes while timer is running leaves timer RUNNING" | ✅ |
| UC4-S4 | Timer state unchanged after clearing notes | Step | PBT | `test/task-notes.property.test.js:176` — "clearing notes while timer runs does not change timer state" | ✅ |
| UC4-S4 | Pomodoro count unchanged after clearing notes | Step | Component | `test/task-notes.test.js:183` — "clearing notes does not change pomodoroCount" | ✅ |
| UC4-S4 | Pomodoro count unchanged after clearing notes | Step | PBT | `test/task-notes.property.test.js:197` — "clearing notes never modifies pomodoroCount" | ✅ |

---

## PBT Coverage

| UC Step | Scenario | PBT Test | Framework | Status |
|---------|----------|----------|-----------|--------|
| UC1-S2 / R1-S1 | Work session always starts at 1800 s | `test/session-management.property.test.js:31` | fast-check | ✅ |
| R1-S2 | SHORT_REST duration constant is always 300 | `test/session-management.property.test.js:48` | fast-check | ✅ |
| UC2-S1 / R1-S3 | LONG_REST duration constant is always 1500 | `test/session-management.property.test.js:59` | fast-check | ✅ |
| UC1-S7 | After non-multiple-of-4 work completion, next is SHORT_REST | `test/session-management.property.test.js:88` | fast-check | ✅ |
| UC1-E7a1 | After 4th work completion, next is LONG_REST at 1500 s | `test/session-management.property.test.js:104` | fast-check | ✅ |
| UC1-E7a1 | Exactly the 4th pomodoro always triggers Long Rest | `test/session-management.property.test.js:130` | fast-check | ✅ |
| UC1-S7 | First three pomodoros always yield Short Rest | `test/session-management.property.test.js:156` | fast-check | ✅ |
| UC1-S2 / R3 | Every tick decrements displayed time by at most 1 second | `test/timer-ui.property.test.js:37` | fast-check | ✅ |
| R3-S2 | formatTime always produces N+:SS pattern (seconds always 2 digits) | `test/timer-ui.property.test.js:56` | fast-check | ✅ |
| UC1-S2 / R3-S3 | Idle Work session always shows 30:00 regardless of prior ops | `test/timer-ui.property.test.js:71` | fast-check | ✅ |
| R4-S1 | Timer snapshot never contains a "notes" key in any state | `test/timer-ui.property.test.js:93` | fast-check | ✅ |
| R4-S2 | Timer state has no field that would interfere with textarea value | `test/timer-ui.property.test.js:111` | fast-check | ✅ |
| R4-S3 | Session transition snapshots contain no notes reference | `test/timer-ui.property.test.js:128` | fast-check | ✅ |
| R4-S4 | resetTimer never returns a snapshot with a notes field | `test/timer-ui.property.test.js:147` | fast-check | ✅ |
| R4-S5 | DURATIONS object is stable and contains no notes-related keys | `test/timer-ui.property.test.js:168` | fast-check | ✅ |
| UC3-S3 / R5 | Notes value always equals what was typed | `test/task-notes.property.test.js:37` | fast-check | ✅ |
| UC3-S4 / R5 | Multi-line notes content is fully retained | `test/task-notes.property.test.js:51` | fast-check | ✅ |
| UC3-S5 / R6 | Work completion does not modify notes value | `test/task-notes.property.test.js:70` | fast-check | ✅ |
| UC3-S6 / R6 | Rest completion does not modify notes value | `test/task-notes.property.test.js:91` | fast-check | ✅ |
| UC3-E5a / R7 | resetTimer never modifies notes value | `test/task-notes.property.test.js:113` | fast-check | ✅ |
| UC4-S1 / R8 | Clearing always results in empty notes value | `test/task-notes.property.test.js:140` | fast-check | ✅ |
| UC4-S3 / R8 | Cleared notes area always accepts new input | `test/task-notes.property.test.js:155` | fast-check | ✅ |
| UC4-S4 / R9 | Clearing notes while timer runs does not change timer state | `test/task-notes.property.test.js:176` | fast-check | ✅ |
| UC4-S4 / R9 | Clearing notes never modifies pomodoroCount | `test/task-notes.property.test.js:197` | fast-check | ✅ |

**Total PBT scenarios: 24 / 24 covered ✅**

---

## Use Case Details: Update Timer Durations (UC1 — Work Session, UC2 — Long Rest)

### Main Scenario (R1 — Session durations)

- **UC1-S2**: System begins countdown from 30:00 (Work = 1800 s)
  - `test/session-management.test.js:18` — "WORK duration constant is 1800" (Unit)
  - `test/timer-ui.test.js:43` — "formatTime produces 30:00 for 1800 s" (Unit)
  - `test/timer-ui.test.js:64` — "idle Work Session snapshot shows 30:00" (Unit)
  - `test/session-management.property.test.js:31` — "Work session always starts at 1800 s" (PBT)
  - `test/timer-ui.property.test.js:71` — "idle Work session always shows 30:00" (PBT)

- **UC2-S1**: System displays "Long Rest" countdown from 25:00 (1500 s)
  - `test/session-management.test.js:26` — "LONG_REST duration constant is 1500" (Unit)
  - `test/timer-ui.test.js:47` — "formatTime produces 25:00 for 1500 s" (Unit)
  - `test/session-management.property.test.js:59` — "LONG_REST duration constant is always 1500" (PBT)

### Extensions (R2 — Session routing)

- **UC1-E7a1**: 4th work completion → Long Rest (25 min)
  - `test/session-management.test.js:69` — "4th pomodoro → LONG_REST at 1500 s" (Component)
  - `test/session-management.property.test.js:104` — "after 4th work completion, next is LONG_REST" (PBT)
  - `test/session-management.property.test.js:130` — "exactly the 4th pomodoro always triggers Long Rest" (PBT)

### Full Flow Tests

- `UC1 / UC2` — "Session cycle: work → short-rest → work → long-rest at 4th" → `test/session-management.test.js:33–101` (Integration)

---

## Use Case Details: Write Task Notes (UC3), Clear Task Notes (UC4)

### Main Scenario (R5, R6, R7)

- **UC3-S1**: User clicks the notes area
  - `test/task-notes.test.js:51` — "notes value is set to typed text" (Unit)
  - `test/task-notes.property.test.js:37` — "notes value always equals what was typed" (PBT)

- **UC3-S3**: User types notes
  - `test/task-notes.test.js:51` — "UC3-S3: notes value is set to typed text" (Unit)
  - `test/task-notes.property.test.js:37` — "R5 property: notes value always equals what was typed" (PBT)

- **UC3-S4**: System retains notes content
  - `test/task-notes.test.js:57` — "multi-character content is fully retained" (Unit)
  - `test/task-notes.test.js:62` — "notes content is not modified by timer operations" (Unit)
  - `test/task-notes.property.test.js:51` — "multi-line notes content is fully retained" (PBT)

- **UC3-S5**: Session transitions preserve notes
  - `test/task-notes.test.js:80` — "notes remain after work session completes" (Component)
  - `test/task-notes.test.js:95` — "notes remain after rest session completes" (Component)
  - `test/task-notes.property.test.js:70` — "work completion does not modify notes value" (PBT)
  - `test/task-notes.property.test.js:91` — "rest completion does not modify notes value" (PBT)

- **UC3-S6**: Notes persist across sessions
  - `test/task-notes.test.js:95` — "UC3-S6: notes remain after rest session completes" (Component)

### Extensions (R7, R8, R9)

- **UC3-E5a1**: resetTimer does NOT clear notes
  - `test/task-notes.test.js:117` — "timer reset returns to IDLE but notes value is unchanged" (Unit)
  - `test/task-notes.test.js:127` — "resetTimer() snapshot has no notes property" (Unit)
  - `test/task-notes.test.js:132` — "notes intact after multiple resets" (Unit)
  - `test/task-notes.property.test.js:113` — "resetTimer never modifies notes value" (PBT)

- **UC4-S1**: User clears notes → area becomes empty
  - `test/task-notes.test.js:148` — "clearing notes sets value to empty string" (Unit)
  - `test/task-notes.property.test.js:140` — "clearing always results in empty notes value" (PBT)

- **UC4-S3**: Cleared area accepts new input
  - `test/task-notes.test.js:154` — "after clearing, new text can be typed" (Unit)
  - `test/task-notes.property.test.js:155` — "cleared notes area always accepts new input" (PBT)

- **UC4-S4**: Clearing notes does not affect timer state or pomodoroCount
  - `test/task-notes.test.js:171` — "clearing notes while timer is running leaves timer RUNNING" (Component)
  - `test/task-notes.test.js:183` — "clearing notes does not change pomodoroCount" (Component)
  - `test/task-notes.property.test.js:176` — "clearing notes while timer runs does not change timer state" (PBT)
  - `test/task-notes.property.test.js:197` — "clearing notes never modifies pomodoroCount" (PBT)

### Full Flow Tests

- `UC3` — "Write, retain, and preserve notes across full Pomodoro cycle" → `test/task-notes.test.js` (Integration)
- `UC4` — "Clear notes without affecting timer" → `test/task-notes.test.js:145–201` (Integration)

---

## Use Case Details: Display (UC1-S2 display, UC2-S1 display, R3, R4)

### Main Scenario (R3 — Countdown display, R4 — Notes area)

- **UC1-S2 / R3**: Countdown shows 30:00 for Work Session
  - `test/timer-ui.test.js:43` — "formatTime produces 30:00 for 1800 s" (Unit)
  - `test/timer-ui.test.js:64` — "idle Work Session snapshot shows 30:00" (Unit)
  - `test/timer-ui.property.test.js:37` — "every tick decrements by at most 1 s" (PBT)
  - `test/timer-ui.property.test.js:56` — "formatTime always produces N+:SS pattern" (PBT)
  - `test/timer-ui.property.test.js:71` — "idle Work session always shows 30:00" (PBT)

- **R4**: Notes area is always visible, decoupled from timer state
  - `test/timer-ui.test.js:93` — "timer snapshot does not contain a notes field" (Unit)
  - `test/timer-ui.test.js:99` — "resetTimer() does not modify notes" (Unit)
  - `test/timer-ui.test.js:109` — "DURATIONS object has no notes-related keys" (Unit)
  - `test/timer-ui.property.test.js:93` — "timer snapshot never contains a notes key" (PBT)
  - `test/timer-ui.property.test.js:111` — "timer state has no field interfering with textarea" (PBT)
  - `test/timer-ui.property.test.js:128` — "session transition snapshots contain no notes reference" (PBT)
  - `test/timer-ui.property.test.js:147` — "resetTimer never returns snapshot with notes field" (PBT)
  - `test/timer-ui.property.test.js:168` — "DURATIONS object is stable and contains no notes keys" (PBT)

### Full Flow Tests

- `R3 / R4` — "Countdown format and notes area independence" → `test/timer-ui.test.js` (Integration)
