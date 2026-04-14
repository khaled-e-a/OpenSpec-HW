## Context

This design covers the implementation of a simple, self-contained Pomodoro timer application. The application has no existing codebase — it is built from scratch. The timer must support three session types (work: 25 min, short rest: 5 min, long rest: 10 min) and cycle through them automatically following the classic Pomodoro technique (4 work sessions before a long rest).

The primary constraint is simplicity: no backend, no database, no external APIs. All state is in-memory for the MVP. A UI framework (React) is used for reactive countdown rendering.

---

## Use Case Coverage

See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
This design addresses the following use case steps:

- UC1-S1: User starts the timer → Decision 1 (Timer Controls), Decision 3 (Timer Engine)
- UC1-S2: System begins countdown from 25:00, updating each second → Decision 3 (Timer Engine — interval tick)
- UC1-S3: System shows current session type as "Work" → Decision 4 (Session State Model)
- UC1-S4: User works uninterrupted while timer counts down → Decision 3 (background interval)
- UC1-S5: System reaches 00:00 and signals session completion → Decision 3 (completion detection), Decision 5 (completion signal)
- UC1-S6: System records completed Pomodoro and advances to next session → Decision 4 (session sequencing)
- UC1-E5a: Timer reaches 00:00 while user is away; system holds completion state → Decision 5 (idle completion state)
- UC2-S1: User pauses the running timer → Decision 1 (pause control)
- UC2-S2: System halts the countdown and preserves the remaining time → Decision 3 (pause: clear interval, store remaining)
- UC2-S3: System displays "Paused" indicator → Decision 2 (TimerDisplay component)
- UC2-S4: User handles the interruption → (user behaviour, no system design needed)
- UC2-S5: User resumes the timer → Decision 1 (resume control)
- UC2-S6: System restarts countdown from preserved remaining time → Decision 3 (resume: restart interval from stored value)
- UC2-S7: System removes "Paused" indicator → Decision 2 (TimerDisplay — conditional rendering)
- UC2-E2a: User pauses immediately after starting → Decision 3 (interval cleared immediately; no special case needed)
- UC3-S1: User resets the timer → Decision 1 (reset control)
- UC3-S2: System stops any active countdown → Decision 3 (reset: clear interval)
- UC3-S3: System resets display to 25:00 → Decision 3 (reset state to initial values)
- UC3-S4: System resets session type to "Work" → Decision 4 (reset session to Work)
- UC3-S5: System resets Pomodoro count to zero → Decision 4 (reset pomodoroCount to 0)
- UC3-E1a: User resets while timer is already idle → Decision 3 (setState is idempotent)
- UC4-S1: User completes Pomodoro #1; system advances to short rest → Decision 4 (advanceSession logic)
- UC4-S2: System starts 5-minute short rest and shows "Short Rest" → Decision 4 (SHORT_REST duration constant)
- UC4-S3: User completes short rest; system advances to Pomodoro #2 → Decision 4 (cycle progression)
- UC4-S4: Pomodoros #2 and #3 each followed by a 5-minute short rest → Decision 4 (loop: work → short rest × 3)
- UC4-S5: User completes Pomodoro #4; system advances to long rest → Decision 4 (every 4th Pomodoro triggers long rest)
- UC4-S6: System starts 10-minute long rest and shows "Long Rest" → Decision 4 (LONG_REST duration constant)
- UC4-S7: User completes long rest; system resets counter and readies new cycle → Decision 4 (pomodoroCount reset after long rest)
- UC4-E3a: User skips a rest session; system advances cycle accordingly → Decision 1 (skip/start button available during rest)

### Unaddressed Use Case Steps
- None — all 28 use case steps are addressed by the decisions below.

---

## Goals / Non-Goals

**Goals:**
- Implement an accurate 1-second countdown timer in the browser
- Support three session types with correct durations (Work: 25 min, Short Rest: 5 min, Long Rest: 10 min)
- Automatically advance through the Pomodoro cycle (4 work sessions before long rest)
- Provide start, pause/resume, and reset controls
- Display current session type, remaining time, and Pomodoro count
- Signal timer completion visually (and optionally audibly)
- Allow the user to skip rest sessions manually

**Non-Goals:**
- Persistence across page reloads (no localStorage or backend for MVP)
- User-configurable durations (fixed values for MVP)
- Task list or to-do integration
- Push notifications or background timer (browser tab must remain active)
- Multi-user or sync features

---

## Decisions

### Decision 1: Timer Controls — Start / Pause / Resume / Reset / Skip
**Addresses**:
- UC1-S1 - User starts the timer to begin a 25-minute work session
- UC2-S1 - User pauses the running timer
- UC2-S5 - User resumes the timer
- UC3-S1 - User resets the timer
- UC4-E3a - User skips a rest session; system advances the cycle accordingly

**Rationale**: A single control bar with context-sensitive buttons covers all user control goals. The Start button transitions to a Pause button while running. A separate Reset button is always visible. A Skip button appears during rest sessions to allow voluntary early advancement.

**Alternative Considered**: Separate Start and Pause buttons always visible — rejected because it creates ambiguous state (both visible during run).

---

### Decision 2: UI Component Structure — React with useState/useRef
**Addresses**:
- UC2-S3 - System displays a "Paused" indicator alongside the frozen countdown
- UC2-S7 - System removes the "Paused" indicator and resumes normal display
- UC1-S3 - System shows the current session type as "Work"

**Rationale**: React's `useState` hook drives reactive re-renders on every timer tick and state change. `useRef` holds the interval ID so it can be cleared on pause/reset without triggering re-renders. This keeps the component tree simple: one `App` component owns all state; a `TimerDisplay` presentational component renders it.

**Alternative Considered**: Vanilla JS DOM manipulation — rejected because managing conditional rendering and state synchronisation manually adds fragility.

---

### Decision 3: Timer Engine — setInterval at 1-second tick
**Addresses**:
- UC1-S2 - System begins countdown from 25:00, updating the display each second
- UC1-S4 - User works uninterrupted while the timer counts down
- UC1-S5 - System reaches 00:00 and signals session completion
- UC1-E5a - Timer reaches 00:00 while user is away; system holds completion state
- UC2-S2 - System halts the countdown and preserves the remaining time
- UC2-S6 - System restarts countdown from the preserved remaining time
- UC2-E2a - User pauses immediately after starting; halts at near-full time
- UC3-S2 - System stops any active countdown
- UC3-S3 - System resets the display to the initial work session duration (25:00)
- UC3-E1a - User resets while the timer is already idle (idempotent)

**Rationale**: `setInterval` with a 1000 ms period decrements `remainingSeconds` by 1 on each tick. When `remainingSeconds` reaches 0, the interval is cleared and `onComplete()` is called.
- **Pause**: clear the interval, store `remainingSeconds` in state.
- **Resume**: start a new interval using stored `remainingSeconds`.
- **Reset**: clear the interval, set `remainingSeconds` back to the current session's full duration, set `pomodoroCount` to 0.
- **Completion hold**: when the timer reaches 0, state transitions to "completed" — the display freezes at 00:00 and shows a completion indicator until the user starts the next session.

**Alternative Considered**: `setTimeout` recursion — more precise under heavy CPU load but adds complexity with no meaningful benefit for a simple timer.

---

### Decision 4: Session State Model — Enum + Cycle Counter
**Addresses**:
- UC1-S3 - System shows the current session type as "Work"
- UC1-S6 - System records the completed Pomodoro and advances to the next session
- UC3-S4 - System resets the session type to "Work"
- UC3-S5 - System resets the completed Pomodoro count to zero
- UC4-S1 - User completes Pomodoro #1; system advances to short rest
- UC4-S2 - System starts a 5-minute short rest countdown and shows "Short Rest"
- UC4-S3 - User completes the short rest; system advances to Pomodoro #2
- UC4-S4 - Pomodoros #2 and #3 each followed by a 5-minute short rest
- UC4-S5 - User completes Pomodoro #4; system advances to long rest
- UC4-S6 - System starts a 10-minute long rest and shows "Long Rest"
- UC4-S7 - User completes the long rest; system resets counter and readies new cycle

**Rationale**: State shape:
```
{
  sessionType: 'work' | 'shortRest' | 'longRest',
  remainingSeconds: number,
  pomodoroCount: number,   // 0–3 within a cycle
  status: 'idle' | 'running' | 'paused' | 'completed'
}
```
Duration constants:
```
WORK_DURATION      = 25 * 60  // 1500 s
SHORT_REST_DURATION =  5 * 60  //  300 s
LONG_REST_DURATION  = 10 * 60  //  600 s
```
`advanceSession()` logic:
- If current session is `work`:
  - Increment `pomodoroCount`
  - If `pomodoroCount === 4`: transition to `longRest`, reset `pomodoroCount` to 0
  - Else: transition to `shortRest`
- If current session is `shortRest` or `longRest`: transition to `work`

**Alternative Considered**: Storing session as a numeric index into an ordered array — less readable and harder to extend.

---

### Decision 5: Completion Signal — Visual Alert + Optional Audio
**Addresses**:
- UC1-S5 - System reaches 00:00 and signals session completion
- UC1-E5a - Timer reaches 00:00 while user is away; system holds completion state

**Rationale**: On completion the UI renders a prominent banner ("Session Complete! 🎉") and the display freezes at 00:00 with `status: 'completed'`. An optional short audio tone is played via the Web Audio API (no external asset required). The completed state persists until the user triggers the next session start, satisfying the "user away" extension.

**Alternative Considered**: Auto-advancing to the next session immediately — rejected because it removes user agency and can confuse users who were away.

---

## Risks / Trade-offs

- **setInterval drift**: Browser `setInterval` is not perfectly precise under CPU load; over a 25-minute session the displayed time could drift by a few seconds. Mitigation: record the `startTime` timestamp and compute remaining time from wall-clock difference on each tick for higher accuracy.
- **Tab backgrounding**: Browsers throttle `setInterval` in background tabs (to ~1 Hz or less). Mitigation: same wall-clock approach above ensures accuracy when the tab is foregrounded again; document this known limitation in the UI.
- **No persistence**: A page reload loses all timer state. Mitigation: acceptable for MVP; `localStorage` can be added in a follow-on change.

---

## Migration Plan

New application — no migration required. Deploy by opening `index.html` in a browser or serving with any static file server.

---

## Open Questions

- Should the completion audio tone be opt-in (muted by default)? Recommendation: play by default; add a mute toggle as a follow-on.
- Should the cycle length (currently hardcoded to 4 Pomodoros) be configurable? Deferred to a future change.
