## Implementation Overview
This task list implements the simple-pomodoro-timer change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability
This implementation addresses the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User starts the timer |
| UC1-S2 | System begins countdown from 25:00, displaying remaining time |
| UC1-S3 | System shows current session label ("Work Session") and remaining time |
| UC1-S4 | User works while the timer counts down |
| UC1-S5 | System reaches 00:00 and notifies user that work session is complete |
| UC1-S6 | System increments the completed pomodoro count by 1 |
| UC1-S7 | System determines next session type and transitions to appropriate rest |
| UC1-E1a | User pauses the timer mid-session |
| UC1-E1a1 | System pauses countdown and holds current time |
| UC1-E1a2 | User resumes; System continues countdown from paused time |
| UC1-E1b | User resets the timer mid-session |
| UC1-E1b1 | System stops countdown and resets time to 25:00; count not incremented |
| UC1-E7a | Pomodoro count is a multiple of 4 |
| UC1-E7a1 | System transitions to Long Rest (10 min) instead of Short Rest |
| UC2-S1 | System displays "Short Rest" label and starts countdown from 05:00 |
| UC2-S2 | User rests while the timer counts down |
| UC2-S3 | System reaches 00:00 and notifies user that short rest is over |
| UC2-S4 | System transitions back to "Work Session" mode, ready to start |
| UC2-E2a | User skips the rest early by resetting |
| UC2-E2a1 | System transitions to next work session without completing rest countdown |
| UC3-S1 | System displays "Long Rest" label and starts countdown from 10:00 |
| UC3-S2 | User takes extended break while the timer counts down |
| UC3-S3 | System reaches 00:00 and notifies user that long rest is over |
| UC3-S4 | System transitions back to "Work Session" mode for next cycle |
| UC3-E2a | User skips the long rest early by resetting |
| UC3-E2a1 | System transitions to next work session immediately |
| UC4-S1 | User presses Pause during active session |
| UC4-S2 | System stops countdown and retains remaining time |
| UC4-S3 | System displays paused state visually |
| UC4-S4 | User presses Resume |
| UC4-S5 | System resumes counting down from retained time |
| UC4-E4a | User resets instead of resuming |
| UC4-E4a1 | System discards paused state and returns to session initial time |
| UC5-S1 | User presses Reset |
| UC5-S2 | System stops any active countdown |
| UC5-S3 | System returns displayed time to full duration of current session type |
| UC5-S4 | Completed pomodoro count remains unchanged on reset |
| UC5-S5 | System enters idle state, ready to start again |

---

## 1. Project Setup

- [x] 1.1 Create project directory structure with `src/`, `index.html`, and entry point files (Addresses: UC1-S1)
- [x] 1.2 Define session duration constants: WORK=1500s, SHORT_REST=300s, LONG_REST=600s (Addresses: UC1-S2, UC2-S1, UC3-S1)

---

## 2. Timer Core Engine

- [x] 2.1 Implement `startTimer(initialSeconds)` function that sets `startedAt = Date.now()` and starts a `setInterval` firing every 1000ms (Addresses: UC1-S1, UC1-S2)
- [x] 2.2 Implement per-tick drift-corrected remaining time: `remaining = initialSeconds - floor((now - startedAt) / 1000)` (Addresses: UC1-S2, UC1-S4, UC2-S2, UC3-S2)
- [x] 2.3 Implement session-complete handler: clear interval when remaining ≤ 0 and emit a "session-complete" event with session type (Addresses: UC1-S5, UC2-S3, UC3-S3)
- [x] 2.4 Implement `pauseTimer()`: clear interval, save current `remainingSeconds` (Addresses: UC1-E1a, UC1-E1a1, UC4-S1, UC4-S2)
- [x] 2.5 Implement `resumeTimer()`: restart interval using saved `remainingSeconds` as `initialSeconds`, reset `startedAt = Date.now()` (Addresses: UC1-E1a2, UC4-S4, UC4-S5)
- [x] 2.6 Implement `resetTimer()`: clear interval, restore `remainingSeconds` to current session's full duration, do NOT change pomodoro count (Addresses: UC1-E1b, UC1-E1b1, UC4-E4a, UC4-E4a1, UC5-S1, UC5-S2, UC5-S3, UC5-S5)
- [x] 2.7 Add guard: pause is idempotent when already paused; resume is idempotent when already running (Addresses: UC4-S2, UC4-S5)

---

## 3. Session State Machine

- [x] 3.1 Define timer states: `IDLE`, `RUNNING`, `PAUSED` per session type; initialise to `WORK_IDLE` on app load (Addresses: UC1-S1, UC5-S5)
- [x] 3.2 Implement pomodoro count increment on natural work session completion (Addresses: UC1-S6)
- [x] 3.3 Implement next-session routing after work completion: if `pomodoroCount % 4 === 0` → Long Rest, else → Short Rest (Addresses: UC1-S7, UC1-E7a, UC1-E7a1)
- [x] 3.4 Implement transition back to Work Session after Short Rest completes naturally (Addresses: UC2-S4)
- [x] 3.5 Implement transition back to Work Session after Long Rest completes naturally (Addresses: UC3-S4)
- [x] 3.6 Implement reset-during-rest behaviour: set session type to Work Session, enter IDLE, leave pomodoro count unchanged (Addresses: UC2-E2a, UC2-E2a1, UC3-E2a, UC3-E2a1, UC5-S4)

---

## 4. User Interface

- [x] 4.1 Build single-page HTML layout: session label, MM:SS countdown display, pomodoro count, paused indicator, and three control buttons (Start/Resume, Pause, Reset) (Addresses: UC1-S3, UC2-S1, UC3-S1)
- [x] 4.2 Implement countdown display that updates each second in zero-padded MM:SS format (e.g., "04:07") (Addresses: UC1-S2, UC1-S3)
- [x] 4.3 Implement session label rendering: display "Work Session", "Short Rest", or "Long Rest" based on current session type (Addresses: UC1-S3, UC2-S1, UC3-S1)
- [x] 4.4 Implement completed pomodoro count display ("Pomodoros completed: N"), updating immediately after each work session completes (Addresses: UC1-S6)
- [x] 4.5 Implement paused state visual indicator: show "Paused" label when state is PAUSED, hide otherwise (Addresses: UC4-S3)
- [x] 4.6 Implement Start/Resume button: label "Start" in IDLE, "Resume" in PAUSED; disabled when RUNNING (Addresses: UC1-S1, UC4-S4)
- [x] 4.7 Implement Pause button: enabled only when RUNNING; disabled in IDLE or PAUSED (Addresses: UC4-S1, UC1-E1a)
- [x] 4.8 Implement Reset button: always enabled in all states (Addresses: UC5-S1, UC1-E1b, UC4-E4a)
- [x] 4.9 Wire button click handlers to timer core functions: Start → `startTimer`, Pause → `pauseTimer`, Resume → `resumeTimer`, Reset → `resetTimer` (Addresses: UC1-S1, UC4-S1, UC4-S4, UC5-S1)

---

## 5. Session-End Notifications

- [x] 5.1 On app load, request browser Notification permission via `Notification.requestPermission()` (Addresses: UC1-S5, UC2-S3, UC3-S3)
- [x] 5.2 On "session-complete" event, always display an in-page banner with a descriptive message (e.g., "Work session complete! Time for a break.") (Addresses: UC1-S5, UC2-S3, UC3-S3)
- [x] 5.3 On "session-complete" event, fire a browser `Notification` if permission is "granted"; skip silently if denied or unavailable (Addresses: UC1-S5, UC2-S3, UC3-S3)
- [x] 5.4 Auto-dismiss the in-page banner after a few seconds or on next user interaction (Addresses: UC1-S5, UC2-S3, UC3-S3)

---

## 6. Integration & Verification

- [x] 6.1 Verify full work cycle: start → 25 min countdown → complete notification → Short Rest auto-queued (Addresses: UC1-S1, UC1-S2, UC1-S5, UC1-S7, UC2-S1)
- [x] 6.2 Verify Long Rest triggers after every 4th completed pomodoro (Addresses: UC1-E7a, UC1-E7a1, UC3-S1)
- [x] 6.3 Verify pause/resume preserves exact remaining time (Addresses: UC4-S2, UC4-S5)
- [x] 6.4 Verify reset restores full duration and does not increment count (Addresses: UC5-S3, UC5-S4)
- [x] 6.5 Verify reset during Short Rest or Long Rest transitions back to Work Session IDLE (Addresses: UC2-E2a1, UC3-E2a1)
- [x] 6.6 Verify notification fallback: in-page banner appears even when browser notifications are denied (Addresses: UC1-S5, UC2-S3, UC3-S3)
- [x] 6.7 Test drift correction: run timer with browser DevTools throttling and confirm countdown stays accurate (Addresses: UC1-S2, UC1-S4)
