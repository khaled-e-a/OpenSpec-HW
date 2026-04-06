## Implementation Overview
This task list implements the simple-pomodoro-timer change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability
This implementation addresses the following use case steps:
- UC1-S1: User starts the timer to begin a 25-minute work session
- UC1-S2: System begins countdown from 25:00, updating the display each second
- UC1-S3: System shows the current session type as "Work"
- UC1-S4: User works uninterrupted while the timer counts down
- UC1-S5: System reaches 00:00 and signals session completion
- UC1-S6: System records the completed Pomodoro and advances to the next session
- UC1-E5a: Timer reaches 00:00 while user is away; system holds completion state
- UC2-S1: User pauses the running timer
- UC2-S2: System halts the countdown and preserves the remaining time
- UC2-S3: System displays a "Paused" indicator alongside the frozen countdown
- UC2-S4: User handles the interruption
- UC2-S5: User resumes the timer
- UC2-S6: System restarts the countdown from the preserved remaining time
- UC2-S7: System removes the "Paused" indicator and resumes normal display
- UC2-E2a: User pauses immediately after starting; system halts at near-full time
- UC3-S1: User resets the timer
- UC3-S2: System stops any active countdown
- UC3-S3: System resets the display to the initial work session duration (25:00)
- UC3-S4: System resets the session type to "Work"
- UC3-S5: System resets the completed Pomodoro count to zero
- UC3-E1a: User resets while the timer is already idle; system performs idempotent reset
- UC4-S1: User completes Pomodoro #1; system advances to short rest
- UC4-S2: System starts a 5-minute short rest countdown and shows "Short Rest"
- UC4-S3: User completes the short rest; system advances to Pomodoro #2
- UC4-S4: User completes Pomodoros #2 and #3, each followed by a 5-minute short rest
- UC4-S5: User completes Pomodoro #4; system advances to long rest
- UC4-S6: System starts a 10-minute long rest countdown and shows "Long Rest"
- UC4-S7: User completes the long rest; system resets counter and readies new cycle
- UC4-E3a: User skips a rest session; system advances the cycle accordingly

---

## 1. Project Setup

- [x] 1.1 Scaffold React application with Vite (or CRA) and set up `src/` directory structure
- [x] 1.2 Define duration constants: `WORK_DURATION = 1500`, `SHORT_REST_DURATION = 300`, `LONG_REST_DURATION = 600`
- [x] 1.3 Define `SessionType` type/enum: `work | shortRest | longRest`
- [x] 1.4 Define `TimerStatus` type/enum: `idle | running | paused | completed`

---

## 2. Timer Engine

- [x] 2.1 Implement `startTimer()` — start `setInterval` at 1-second tick, decrement `remainingSeconds` (Addresses: UC1-S1, UC1-S2)
- [x] 2.2 Implement tick logic that clears interval and emits completion when `remainingSeconds` reaches 0 (Addresses: UC1-S4, UC1-S5)
- [x] 2.3 Implement `pauseTimer()` — clear the interval and preserve `remainingSeconds` in state (Addresses: UC2-S1, UC2-S2, UC2-E2a)
- [x] 2.4 Implement `resumeTimer()` — start a new interval from preserved `remainingSeconds` (Addresses: UC2-S5, UC2-S6)
- [x] 2.5 Implement `resetTimer()` — clear interval and restore `remainingSeconds` to session's full duration; make idempotent when already idle (Addresses: UC3-S1, UC3-S2, UC3-S3, UC3-E1a)
- [x] 2.6 On completion, transition `status` to `completed` and hold that state until the user acts (Addresses: UC1-E5a)

---

## 3. Session Manager

- [x] 3.1 Implement `advanceSession()` — increment `pomodoroCount`; transition to `shortRest` if count < 4, otherwise to `longRest` and reset count to 0 (Addresses: UC1-S6, UC4-S1, UC4-S4, UC4-S5)
- [x] 3.2 Implement short-rest completion — transition `sessionType` back to `work` with `remainingSeconds = 1500` (Addresses: UC4-S2, UC4-S3)
- [x] 3.3 Implement long-rest completion — transition `sessionType` to `work`, `pomodoroCount` to 0, `remainingSeconds` to 1500 (Addresses: UC4-S6, UC4-S7)
- [x] 3.4 Implement `skipSession()` — advance cycle from `shortRest` or `longRest` to `work` without waiting for countdown to complete (Addresses: UC4-E3a)
- [x] 3.5 Implement session reset — set `sessionType` to `work`, `pomodoroCount` to 0, `remainingSeconds` to 1500 (Addresses: UC3-S4, UC3-S5)

---

## 4. State Management (App Component)

- [x] 4.1 Define top-level state shape in `App`: `{ sessionType, remainingSeconds, pomodoroCount, status }` using `useState` (Addresses: UC1-S3)
- [x] 4.2 Store interval ID in `useRef` to allow clearing without triggering re-renders
- [x] 4.3 Wire `startTimer`, `pauseTimer`, `resumeTimer`, `resetTimer`, `skipSession` handlers to state updates and pass down as props

---

## 5. Timer Display Component

- [x] 5.1 Create `TimerDisplay` presentational component that renders `MM:SS` from `remainingSeconds` (Addresses: UC1-S2)
- [x] 5.2 Render session type label: "Work", "Short Rest", or "Long Rest" based on `sessionType` (Addresses: UC1-S3, UC4-S2, UC4-S6)
- [x] 5.3 Render Pomodoro count indicator (e.g., `● ● ○ ○` showing completed vs remaining in cycle) (Addresses: UC1-S6)

---

## 6. Controls Component

- [x] 6.1 Render Start button when `status` is `idle` or `completed`; wire to `startTimer()` (Addresses: UC1-S1)
- [x] 6.2 Render Pause button (replacing Start) when `status` is `running`; wire to `pauseTimer()` (Addresses: UC2-S1)
- [x] 6.3 Render Resume button when `status` is `paused`; wire to `resumeTimer()` (Addresses: UC2-S5)
- [x] 6.4 Render Reset button in all states; wire to `resetTimer()` (Addresses: UC3-S1)
- [x] 6.5 Render Skip button only when `sessionType` is `shortRest` or `longRest`; wire to `skipSession()` (Addresses: UC4-E3a)

---

## 7. Status Indicators

- [x] 7.1 Show "Paused" label when `status === 'paused'`; hide it when `status` transitions to `running` (Addresses: UC2-S3, UC2-S7)
- [x] 7.2 Show completion banner (e.g., "Session Complete! 🎉") when `status === 'completed'`; persist until user starts next session (Addresses: UC1-S5, UC1-E5a)

---

## 8. Completion Audio Signal

- [x] 8.1 Play a short tone via Web Audio API when `status` transitions to `completed` (Addresses: UC1-S5)

---

## 9. Styling & Polish

- [x] 9.1 Style the timer display for readability (large countdown, clear session label)
- [x] 9.2 Differentiate visual appearance for each session type (e.g., colour or background change for Work vs Rest)
- [x] 9.3 Ensure controls are clearly labelled and accessible (keyboard-focusable buttons)

---

## 10. Testing

- [x] 10.1 Unit test `advanceSession()` — verify correct transitions for Pomodoros 1–4 and rest sessions (Addresses: UC4-S1, UC4-S3, UC4-S4, UC4-S5, UC4-S7)
- [x] 10.2 Unit test `pauseTimer()` / `resumeTimer()` — verify remaining time is preserved and restored (Addresses: UC2-S2, UC2-S6)
- [x] 10.3 Unit test `resetTimer()` — verify state resets to defaults including when already idle (Addresses: UC3-S2, UC3-S3, UC3-S4, UC3-S5, UC3-E1a)
- [x] 10.4 Unit test `skipSession()` — verify short rest and long rest both skip to work (Addresses: UC4-E3a)
- [x] 10.5 Integration test: start a work session → let it complete → verify session advances to short rest (Addresses: UC1-S5, UC1-S6, UC4-S1)
- [x] 10.6 Integration test: complete 4 Pomodoros → verify long rest is triggered on the 4th (Addresses: UC4-S5, UC4-S6)
