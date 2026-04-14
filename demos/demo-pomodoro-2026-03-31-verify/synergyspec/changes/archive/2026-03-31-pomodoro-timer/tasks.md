## Implementation Overview
This task list implements the pomodoro-timer change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability
This implementation addresses the following use case steps:

- UC1-S1: User starts the timer
- UC1-S2: System begins a 25-minute countdown in work mode
- UC1-S3: System displays remaining time, updating every second
- UC1-S5: System detects that the 25-minute session has ended
- UC1-S6: System signals end of work session (visual/audio cue)
- UC1-S7: System transitions automatically to rest mode with 5-minute timer ready
- UC1-E1a1: System ignores start action when timer is already running
- UC1-E5a1: System stops countdown and preserves remaining time (pause)
- UC1-E5a3: System continues countdown from preserved time
- UC1-E5b1: System stops countdown and resets to 25 minutes (reset during work)
- UC2-S1: User starts the rest timer
- UC2-S2: System begins a 5-minute countdown in rest mode
- UC2-S3: System displays remaining rest time, updating every second
- UC2-S5: System detects that the 5-minute rest period has ended
- UC2-S6: System signals end of rest break (visual/audio cue)
- UC2-S7: System transitions automatically to work mode with 25-minute timer ready
- UC2-E5a1: System stops countdown and preserves remaining rest time (pause)
- UC2-E5a3: System continues rest countdown from preserved time
- UC2-E5b1: System stops countdown and resets to 5 minutes (reset during rest)
- UC3-S1: User pauses the timer
- UC3-S2: System stops countdown and preserves remaining time
- UC3-S3: System displays paused state visually
- UC3-S5: User resumes the timer
- UC3-S6: System resumes countdown from preserved remaining time
- UC3-S7: System removes paused indicator and continues countdown display
- UC3-E4a1: System discards preserved time and restores default duration
- UC3-E4a2: Timer returns to idle state
- UC4-S1: User resets the timer
- UC4-S2: System stops any active countdown
- UC4-S3: System restores default duration for current mode (25 min work / 5 min rest)
- UC4-S4: System returns to idle state, ready to start

---

## 1. Project Setup

- [x] 1.1 Create `index.html` in the project root with HTML boilerplate (head, body, title "Pomodoro Timer") (Addresses: UC1-S1, UC2-S1)
- [x] 1.2 Add a `<style>` block in `index.html` for all CSS — layout, timer display, mode label, buttons, paused indicator, flash animation (Addresses: UC3-S3, UC1-S6, UC2-S6)
- [x] 1.3 Add a `<script>` block at the bottom of `<body>` for all JavaScript logic (Addresses: UC1-S2, UC2-S2)

---

## 2. Timer State Machine (timer-core)

- [x] 2.1 Define the `state` object with fields: `mode` ("work"/"rest"), `status` ("idle"/"running"/"paused"/"ended"), `remainingSeconds`, `intervalId` (Addresses: UC1-S2, UC2-S2)
- [x] 2.2 Implement `DURATIONS` constants: `work: 1500`, `rest: 300` (Addresses: UC1-S2, UC2-S2)
- [x] 2.3 Implement `startTimer()` — transitions IDLE→RUNNING, starts `setInterval` tick; guards against starting when already RUNNING (Addresses: UC1-S1, UC1-E1a1, UC2-S1)
- [x] 2.4 Implement `tick()` — decrements `remainingSeconds` by 1 each second; calls `render()`; detects zero and calls `onSessionEnd()` (Addresses: UC1-S3, UC1-S5, UC2-S3, UC2-S5)
- [x] 2.5 Implement `pauseTimer()` — transitions RUNNING→PAUSED, calls `clearInterval`, preserves `remainingSeconds` (Addresses: UC1-E5a1, UC2-E5a1, UC3-S1, UC3-S2)
- [x] 2.6 Implement `resumeTimer()` — transitions PAUSED→RUNNING, restarts `setInterval` from preserved `remainingSeconds` (Addresses: UC1-E5a3, UC2-E5a3, UC3-S5, UC3-S6)
- [x] 2.7 Implement `resetTimer()` — calls `clearInterval`, restores `remainingSeconds` to current mode's default, sets status to IDLE (Addresses: UC1-E5b1, UC2-E5b1, UC3-E4a1, UC3-E4a2, UC4-S1, UC4-S2, UC4-S3, UC4-S4)
- [x] 2.8 Implement `onSessionEnd()` — sets status to ENDED, calls `render()` to show completion signal, schedules auto-transition after 1500ms (Addresses: UC1-S5, UC1-S6, UC2-S5, UC2-S6)
- [x] 2.9 Implement `autoTransition()` — switches `mode` to opposite, resets `remainingSeconds` to new mode's default, sets status to IDLE, calls `render()` (Addresses: UC1-S7, UC2-S7)

---

## 3. UI Rendering (timer-ui)

- [x] 3.1 Implement `formatTime(seconds)` helper — returns zero-padded `MM:SS` string (e.g., 1500 → "25:00", 61 → "01:01") (Addresses: UC1-S3, UC2-S3)
- [x] 3.2 Implement `render()` — reads state and updates all DOM elements: time display, mode label, button states, paused indicator (Addresses: UC1-S3, UC2-S3, UC3-S3, UC3-S7)
- [x] 3.3 In `render()`: update the mode label to "🍅 Work" or "☕ Rest" based on `state.mode` (Addresses: UC1-S2, UC2-S2)
- [x] 3.4 In `render()`: show "Start" button when IDLE, "Pause" when RUNNING, "Resume" when PAUSED (Addresses: UC1-S1, UC2-S1, UC3-S1, UC3-S5)
- [x] 3.5 In `render()`: show Reset button only when status is RUNNING or PAUSED; hide when IDLE (Addresses: UC4-S1)
- [x] 3.6 In `render()`: add CSS `paused` class to timer display when PAUSED; remove when RUNNING or IDLE (Addresses: UC3-S3, UC3-S7)
- [x] 3.7 In `render()`: when status is ENDED, show completion message ("Work Complete! → Rest" or "Rest Complete! → Work") and trigger CSS flash animation on the timer display (Addresses: UC1-S6, UC2-S6)
- [x] 3.8 Wire up button click handlers to `startTimer()`, `pauseTimer()`/`resumeTimer()` (toggle based on status), and `resetTimer()` (Addresses: UC1-S1, UC2-S1, UC3-S1, UC3-S5, UC4-S1)

---

## 4. Styling

- [x] 4.1 Style the timer display — large, centered, monospace font for the `MM:SS` countdown (Addresses: UC1-S3, UC2-S3)
- [x] 4.2 Style the mode label with distinct colors for work (warm red/tomato) and rest (calm blue/teal) modes (Addresses: UC1-S2, UC2-S2)
- [x] 4.3 Style the `.paused` CSS class — reduced opacity or muted appearance to indicate paused state (Addresses: UC3-S3)
- [x] 4.4 Implement CSS `@keyframes flash` animation — 3 cycles of opacity pulse used on session completion (Addresses: UC1-S6, UC2-S6)
- [x] 4.5 Style the Start/Pause/Resume and Reset buttons — clear, accessible, appropriately sized (Addresses: UC1-S1, UC2-S1, UC3-S1, UC3-S5, UC4-S1)

---

## 5. Verification

- [x] 5.1 Open `index.html` in a browser; verify the timer shows "25:00" in work mode on load (Addresses: UC1-S2)
- [ ] 5.2 Click Start; verify countdown decrements every second (Addresses: UC1-S3)
- [ ] 5.3 Click Pause; verify countdown stops and paused indicator appears; verify remaining time is preserved (Addresses: UC3-S1, UC3-S2, UC3-S3)
- [ ] 5.4 Click Resume; verify countdown continues from preserved time and paused indicator disappears (Addresses: UC3-S5, UC3-S6, UC3-S7)
- [ ] 5.5 Click Reset; verify timer returns to "25:00" idle state (Addresses: UC4-S1, UC4-S3, UC4-S4)
- [ ] 5.6 Let a short test session expire (temporarily reduce duration to 5 seconds); verify flash animation fires, completion message appears, and timer auto-transitions to rest mode (Addresses: UC1-S5, UC1-S6, UC1-S7)
- [x] 5.7 Verify clicking Start while timer is already running has no effect (Addresses: UC1-E1a1)
- [x] 5.8 Restore full durations (25 min / 5 min) and verify both are correct on load (Addresses: UC1-S2, UC2-S2)
