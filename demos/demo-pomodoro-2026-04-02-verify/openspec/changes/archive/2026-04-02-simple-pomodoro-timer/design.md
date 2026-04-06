## Context

A simple, self-contained Pomodoro timer application is being built from scratch. There are no existing dependencies to integrate with. The app runs entirely client-side (browser or standalone runtime) with no backend. The design must support three session types (Work: 25 min, Short Rest: 5 min, Long Rest: 10 min), a pause/resume/reset control model, and a session cycle counter that triggers long rests every 4 completed pomodoros.

---

## Use Case Coverage

See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
This design addresses the following use case steps:

| Use Case Step | Description | Design Section |
|---------------|-------------|----------------|
| UC1-S1 | User starts the timer | Decision 3: Timer Control Model |
| UC1-S2 | System begins countdown from 25:00, displaying remaining time | Decision 1: Timer Engine |
| UC1-S3 | System shows current session label and remaining time | Decision 4: UI Layout |
| UC1-S4 | User works while the timer counts down | Decision 1: Timer Engine |
| UC1-S5 | System reaches 00:00 and notifies user that work session is complete | Decision 1: Timer Engine + Decision 5: Notifications |
| UC1-S6 | System increments the completed pomodoro count by 1 | Decision 2: Session State Machine |
| UC1-S7 | System determines next session type and transitions to appropriate rest | Decision 2: Session State Machine |
| UC1-E1a | User pauses the timer mid-session | Decision 3: Timer Control Model |
| UC1-E1a1 | System pauses countdown and holds current time | Decision 3: Timer Control Model |
| UC1-E1a2 | User resumes; System continues countdown from paused time | Decision 3: Timer Control Model |
| UC1-E1b | User resets the timer mid-session | Decision 3: Timer Control Model |
| UC1-E1b1 | System stops countdown and resets time to 25:00; count not incremented | Decision 3: Timer Control Model |
| UC1-E7a | Pomodoro count is a multiple of 4 | Decision 2: Session State Machine |
| UC1-E7a1 | System transitions to Long Rest (10 min) instead of Short Rest | Decision 2: Session State Machine |
| UC2-S1 | System displays "Short Rest" label and starts countdown from 05:00 | Decision 2 + Decision 4 |
| UC2-S2 | User rests while timer counts down | Decision 1: Timer Engine |
| UC2-S3 | System reaches 00:00 and notifies user that short rest is over | Decision 1 + Decision 5 |
| UC2-S4 | System transitions back to "Work Session" mode | Decision 2: Session State Machine |
| UC2-E2a | User skips the rest early by resetting | Decision 3: Timer Control Model |
| UC2-E2a1 | System transitions to next work session without completing rest | Decision 2 + Decision 3 |
| UC3-S1 | System displays "Long Rest" label and starts countdown from 10:00 | Decision 2 + Decision 4 |
| UC3-S2 | User takes extended break while timer counts down | Decision 1: Timer Engine |
| UC3-S3 | System reaches 00:00 and notifies user that long rest is over | Decision 1 + Decision 5 |
| UC3-S4 | System transitions back to "Work Session" mode for next cycle | Decision 2: Session State Machine |
| UC3-E2a | User skips the long rest early by resetting | Decision 3: Timer Control Model |
| UC3-E2a1 | System transitions to next work session immediately | Decision 2 + Decision 3 |
| UC4-S1 | User presses Pause during active session | Decision 3: Timer Control Model |
| UC4-S2 | System stops countdown and retains remaining time | Decision 3: Timer Control Model |
| UC4-S3 | System displays paused state visually | Decision 4: UI Layout |
| UC4-S4 | User presses Resume | Decision 3: Timer Control Model |
| UC4-S5 | System resumes counting down from retained time | Decision 3: Timer Control Model |
| UC4-E4a | User resets instead of resuming | Decision 3: Timer Control Model |
| UC4-E4a1 | System discards paused state and returns to session initial time | Decision 3: Timer Control Model |
| UC5-S1 | User presses Reset | Decision 3: Timer Control Model |
| UC5-S2 | System stops any active countdown | Decision 3: Timer Control Model |
| UC5-S3 | System returns displayed time to full duration of current session type | Decision 3: Timer Control Model |
| UC5-S4 | Completed pomodoro count remains unchanged | Decision 2: Session State Machine |
| UC5-S5 | System enters idle state, ready to start again | Decision 2 + Decision 3 |

### Unaddressed Use Case Steps
None — all 38 use case steps are addressed by one or more decisions below.

---

## Goals / Non-Goals

**Goals:**
- Accurate per-second countdown for all three session types
- Deterministic session cycle logic: work → short rest → work → ... → long rest after 4 pomodoros
- Start, pause, resume, and reset controls available at all times
- Visual indication of: remaining time, session type, paused state, completed pomodoro count
- In-browser notification when a session ends

**Non-Goals:**
- User accounts, data persistence beyond the current page session
- Task labeling or todo management
- Sound effects or custom notification tones
- Configuration UI for changing session durations (durations are fixed as per spec)
- Native mobile application packaging

---

## Decisions

### Decision 1: Timer Engine — `setInterval`-based countdown with drift compensation
**Addresses**:
- UC1-S2 - System begins countdown from 25:00, displaying remaining time
- UC1-S4 - User works while the timer counts down
- UC1-S5 - System reaches 00:00 and notifies user that work session is complete
- UC2-S2, UC2-S3, UC3-S2, UC3-S3 - Rest countdowns behave identically

**Rationale**: Use `setInterval` firing every 1000ms to decrement a `remainingSeconds` counter. On each tick, calculate elapsed wall-clock time since start to correct for timer drift (store `startedAt` epoch and recompute remaining = `initialSeconds - Math.floor((now - startedAt) / 1000)`). When `remainingSeconds` reaches 0, clear the interval, fire the completion handler.

**Alternative Considered**: `setTimeout` recursive scheduling — rejected because drift compounds over time; the wall-clock correction approach is simpler to reason about and more accurate.

---

### Decision 2: Session State Machine
**Addresses**:
- UC1-S6 - System increments the completed pomodoro count by 1
- UC1-S7 - System determines next session type and transitions to appropriate rest
- UC1-E7a/E7a1 - Pomodoro count is a multiple of 4 → Long Rest
- UC2-S4, UC3-S4 - System transitions back to Work Session mode
- UC5-S4 - Pomodoro count remains unchanged on reset

**Rationale**: Model sessions as an explicit state machine with states: `IDLE`, `WORK_RUNNING`, `WORK_PAUSED`, `SHORT_REST_RUNNING`, `SHORT_REST_PAUSED`, `LONG_REST_RUNNING`, `LONG_REST_PAUSED`. Transitions are deterministic:
- `WORK_RUNNING → complete` → increment count → if `count % 4 === 0`: `LONG_REST_IDLE` else `SHORT_REST_IDLE`
- `SHORT_REST_RUNNING / LONG_REST_RUNNING → complete` → `WORK_IDLE`
- Any running/paused state → `reset` → same session type, `IDLE`, count unchanged

Keep `pomodoroCount` as a simple integer in module-level state. Session durations are constants:
```
WORK_DURATION     = 25 * 60  // 1500 seconds
SHORT_REST_DURATION =  5 * 60  //  300 seconds
LONG_REST_DURATION  = 10 * 60  //  600 seconds
```

**Alternative Considered**: Boolean flags (`isRunning`, `isPaused`, `isRest`) — rejected because combined flag state is harder to reason about and prone to illegal combinations.

---

### Decision 3: Timer Control Model — Three controls: Start/Resume, Pause, Reset
**Addresses**:
- UC1-S1 - User starts the timer
- UC1-E1a, UC1-E1a1, UC1-E1a2 - Pause and resume mid-session
- UC1-E1b, UC1-E1b1 - Reset mid-session
- UC4-S1 through UC4-E4a1 - Full pause/resume lifecycle
- UC5-S1 through UC5-S5 - Full reset lifecycle

**Rationale**: Expose three controls:
1. **Start / Resume** — transitions from `IDLE` or `PAUSED` → `RUNNING`. Disabled when already running or at session end.
2. **Pause** — transitions from `RUNNING` → `PAUSED`. Saves `remainingSeconds` at pause time. Disabled when not running.
3. **Reset** — transitions any state → `IDLE` for the current session type, restoring `remainingSeconds` to the session's full duration. Does NOT change `pomodoroCount`.

On pause: clear the interval, record `remainingSeconds`. On resume: restart the interval using the saved `remainingSeconds` as `initialSeconds` and reset `startedAt`.

**Alternative Considered**: Toggle Start/Pause as a single button — rejected because it complicates the visual state and makes the disabled state less clear to users.

---

### Decision 4: UI Layout — Single-screen layout with session label, countdown, count, and controls
**Addresses**:
- UC1-S3 - System shows current session label and remaining time
- UC2-S1, UC3-S1 - Short/Long Rest labels are shown with correct countdown
- UC4-S3 - System displays paused state visually

**Rationale**: Single page, no routing. Layout:
```
┌──────────────────────────────────┐
│  [Session Label]                 │
│  Work Session / Short Rest / ... │
│                                  │
│        MM:SS  (large display)    │
│                                  │
│  Pomodoros completed: N          │
│                                  │
│  [Start]  [Pause]  [Reset]       │
└──────────────────────────────────┘
```
- Session label changes color/text based on current session type
- "Paused" sub-label appears beneath the countdown when in a paused state
- Control buttons are enabled/disabled based on current state machine state
- Countdown display updates every second

**Alternative Considered**: Tabs or separate views per session type — rejected because it adds navigation complexity to what should be an always-on-screen timer.

---

### Decision 5: Session-End Notifications — Web Notifications API with in-page fallback
**Addresses**:
- UC1-S5 - System notifies user that work session is complete
- UC2-S3 - System notifies user that short rest is over
- UC3-S3 - System notifies user that long rest is over

**Rationale**: When a session completes, attempt to fire a browser notification (`Notification` API) if permission is granted. On first load, request notification permission. If permission is denied or the API is unavailable, fall back to an in-page visual banner (e.g., a highlighted message: "Work session complete! Starting Short Rest…"). The in-page banner is always shown regardless of notification permission.

**Alternative Considered**: Audio beep — out of scope for this change; deferred as a future enhancement.

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `setInterval` is throttled in background tabs (browsers slow timers to ~1s or more) | Wall-clock drift correction (Decision 1) compensates; documented as a known limitation |
| Notification permission denied silently fails | In-page fallback banner always fires (Decision 5) |
| State is lost on page refresh | Out of scope (no persistence goal); session simply resets |
| Long-running sessions accumulate JS memory from interval references | Always `clearInterval` before starting a new one or resetting |

---

## Migration Plan

- Greenfield application, no migration needed.
- Deployment: serve as a static HTML/JS/CSS bundle.
- Rollback: revert to previous static bundle version.

---

## Open Questions

- Should the timer auto-start the next session (rest or work) after a session completes, or wait for explicit user action? (Current design: auto-transition to next session type in IDLE state — user must press Start manually. This prevents unwanted sessions running in the background.)
- Should completed pomodoro count persist across page reloads via `localStorage`? (Current scope: no. Deferred.)
