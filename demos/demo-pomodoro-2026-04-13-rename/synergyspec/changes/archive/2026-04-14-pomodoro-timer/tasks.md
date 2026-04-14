# Tasks: pomodoro-timer

## Implementation Overview

This task list implements the `pomodoro-timer` change — a React application providing a 25-minute work / 5-minute rest Pomodoro timer with start/pause/reset controls and end-of-phase notifications.

See `usecases.md` "Use Case Traceability Mapping" section for the complete list of use case steps. Each task below indicates which use case step(s) it implements.

## 1. Project Scaffolding

- [x] 1.1 Initialize a React project with Vite (`npm create vite@latest pomodoro -- --template react-ts`)
- [x] 1.2 Install dependencies and verify dev server runs
- [x] 1.3 Clean out Vite boilerplate (default logo, counter, CSS)
- [x] 1.4 Set up basic file structure: `src/components/`, `src/state/`, `src/assets/`

## 2. Timer State Machine

- [x] 2.1 Define `TimerState` type: `{ phase: 'work' | 'rest', status: 'idle' | 'running' | 'paused', remainingSeconds: number }` in `src/state/timerState.ts`
- [x] 2.2 Define action types: `START`, `PAUSE`, `RESUME`, `RESET`, `TICK`, `PHASE_END`
- [x] 2.3 Implement the reducer with `START` transitioning idle/paused → running (Addresses: UC1-S1)
- [x] 2.4 Implement `TICK` action decrementing `remainingSeconds` by 1 while running (Addresses: UC1-S2)
- [x] 2.5 Implement `PHASE_END` action: when work phase reaches 0, switch to rest phase with 5:00 remaining (Addresses: UC1-S3, UC1-S4)
- [x] 2.6 Implement `PHASE_END` action: when rest phase reaches 0, switch to work phase with 25:00 remaining and status `idle` (Addresses: UC1-S5, UC1-S6)
- [x] 2.7 Implement `PAUSE` action: running → paused, retaining `remainingSeconds` and `phase` (Addresses: UC1-E2a, UC1-E2a1)
- [x] 2.8 Implement `RESUME` action: paused → running, from retained `remainingSeconds` (Addresses: UC1-E2a2)
- [x] 2.9 Implement `RESET` action: stop countdown, restore `remainingSeconds` to full duration of current phase, status → idle (Addresses: UC2-S1, UC2-S2, UC2-S3, UC2-S4)
- [x] 2.10 Write unit tests for the reducer covering each action and phase transition

## 3. Tick Loop (useEffect + setInterval)

- [x] 3.1 Create `usePomodoroTimer` custom hook in `src/state/usePomodoroTimer.ts` wrapping `useReducer`
- [x] 3.2 Inside the hook, install a `setInterval` in `useEffect` when `status === 'running'` that dispatches `TICK` every 1000ms (Addresses: UC1-S2)
- [x] 3.3 Ensure cleanup clears the interval on unmount, pause, or reset (Addresses: UC1-E2a, UC1-E2a1, UC2-S2)
- [x] 3.4 When `TICK` would bring `remainingSeconds` below 0, dispatch `PHASE_END` instead (Addresses: UC1-S3, UC1-S5)

## 4. UI Components

- [x] 4.1 Create `<PomodoroTimer />` container in `src/components/PomodoroTimer.tsx` that uses the `usePomodoroTimer` hook and renders `<Display />` + `<Controls />`
- [x] 4.2 Create `<Display />` presentational component rendering `mm:ss` remaining time and phase label ("Work" or "Rest") (Addresses: UC1-S2)
- [x] 4.3 Add phase-specific styling (e.g., work = red/focus, rest = green/calm) to visually indicate current phase (Addresses: UC1-S3, UC1-S5)
- [x] 4.4 Create `<Controls />` presentational component with Start/Pause/Resume button and Reset button
- [x] 4.5 Wire Start/Pause/Resume button to dispatch `START`/`PAUSE`/`RESUME` based on current status (Addresses: UC1-S1, UC1-E2a, UC1-E2a2)
- [x] 4.6 Wire Reset button to dispatch `RESET` (Addresses: UC2-S1)
- [x] 4.7 Mount `<PomodoroTimer />` in `src/App.tsx`

## 5. End-of-Phase Notification

- [x] 5.1 Add a short beep audio asset to `src/assets/beep.mp3` (or generate via Web Audio API)
- [x] 5.2 Create `playBeep()` utility in `src/utils/notify.ts` that plays the sound without blocking (Addresses: UC1-S3, UC1-S5)
- [x] 5.3 Invoke `playBeep()` from the hook on `PHASE_END` — ensure it runs after the first user interaction so autoplay policies are satisfied (Addresses: UC1-S3, UC1-S5)
- [x] 5.4 Confirm phase transitions occur immediately and do not block on any dismissal (Addresses: UC1-E3a, UC1-E3a1, UC1-E5a, UC1-E5a1)

## 6. Testing

- [x] 6.1 Unit test reducer: all state transitions covered (Addresses: UC1-S1 through UC2-S4)
- [x] 6.2 Component test for `<Display />` rendering `mm:ss` format correctly for various remaining values
- [x] 6.3 Component test for `<Controls />` button behavior across idle/running/paused states
- [x] 6.4 Integration test for `<PomodoroTimer />` using fake timers: start → tick → pause → resume → reset
- [x] 6.5 Integration test for full work → rest → idle cycle using fake timers

## 7. Finalization

- [x] 7.1 Run `npm run build` and verify a clean production build
- [x] 7.2 Manual smoke test in the browser: start, pause, resume, reset, full work/rest cycle
- [x] 7.3 Update `README.md` with run instructions
