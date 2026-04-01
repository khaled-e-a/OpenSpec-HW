## Context

A simple standalone Pomodoro timer delivered as a single HTML file with embedded CSS and JavaScript. No frameworks, no build tools, no backend. The app runs entirely in the browser. The design needs to support four core user interactions: starting a session, pausing/resuming, resetting, and automatic mode transitions between work (25 min) and rest (5 min).

## Use Case Coverage

See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
This design addresses the following use case steps:

- UC1-S1: User starts the timer → Decision 1 (Timer State Machine)
- UC1-S2: System begins a 25-minute countdown in work mode → Decision 1, Decision 2
- UC1-S3: System displays remaining time, updating every second → Decision 2 (setInterval tick)
- UC1-S4: User works until the countdown completes → Decision 1 (RUNNING state)
- UC1-S5: System detects that the 25-minute session has ended → Decision 2 (zero detection)
- UC1-S6: System signals end of work session (visual/audio cue) → Decision 3 (Completion Signal)
- UC1-S7: System transitions automatically to rest mode with 5-minute timer ready → Decision 1 (auto-transition)
- UC1-E1a1: System ignores start action when timer is already running → Decision 1 (guard on RUNNING state)
- UC1-E5a1: System stops countdown and preserves remaining time (pause) → Decision 1 (PAUSED state)
- UC1-E5a2: User resumes the timer → Decision 1 (PAUSED → RUNNING transition)
- UC1-E5a3: System continues countdown from preserved time → Decision 1 (remainingSeconds preserved in state)
- UC1-E5b1: System stops countdown and resets to 25 minutes (reset during work) → Decision 1 (IDLE transition)
- UC2-S1: User starts the rest timer → Decision 1 (same state machine, rest mode)
- UC2-S2: System begins a 5-minute countdown in rest mode → Decision 1, Decision 2
- UC2-S3: System displays remaining rest time, updating every second → Decision 2
- UC2-S4: User rests until the countdown completes → Decision 1 (RUNNING state in rest mode)
- UC2-S5: System detects that the 5-minute rest period has ended → Decision 2 (zero detection)
- UC2-S6: System signals end of rest break (visual/audio cue) → Decision 3
- UC2-S7: System transitions automatically to work mode with 25-minute timer ready → Decision 1 (auto-transition)
- UC2-E5a1: System stops countdown and preserves remaining rest time (pause) → Decision 1 (PAUSED state)
- UC2-E5a2: User resumes the rest timer → Decision 1 (PAUSED → RUNNING)
- UC2-E5a3: System continues rest countdown from preserved time → Decision 1
- UC2-E5b1: System stops countdown and resets to 5 minutes (reset during rest) → Decision 1 (IDLE, rest mode)
- UC3-S1: User pauses the timer → Decision 1 (RUNNING → PAUSED)
- UC3-S2: System stops countdown and preserves remaining time → Decision 1 + Decision 2 (clearInterval)
- UC3-S3: System displays paused state visually → Decision 4 (UI rendering from state)
- UC3-S4: User is ready to resume → (user action — no design decision needed)
- UC3-S5: User resumes the timer → Decision 1 (PAUSED → RUNNING)
- UC3-S6: System resumes countdown from preserved remaining time → Decision 1 + Decision 2
- UC3-S7: System removes paused indicator and continues countdown display → Decision 4
- UC3-E4a1: System discards preserved time and restores default duration → Decision 1 (reset action)
- UC3-E4a2: Timer returns to idle state → Decision 1 (IDLE state)
- UC4-S1: User resets the timer → Decision 1 (reset action)
- UC4-S2: System stops any active countdown → Decision 2 (clearInterval)
- UC4-S3: System restores default duration for current mode (25 min work / 5 min rest) → Decision 1
- UC4-S4: System returns to idle state, ready to start → Decision 1 (IDLE state)

### Unaddressed Use Case Steps
- UC1-S4, UC2-S4: "User works/rests until countdown completes" — these are user-side actions requiring no system design decision; the timer simply keeps running.

---

## Goals / Non-Goals

**Goals:**
- Single-file browser app (HTML + CSS + JS, no dependencies)
- Accurate per-second countdown for work (25 min) and rest (5 min) sessions
- Start, pause/resume, and reset controls
- Automatic mode transition when a session ends
- Visual session completion signal
- Clear display of current mode (work vs. rest) and remaining time

**Non-Goals:**
- Sound/audio notifications (browser autoplay restrictions make this unreliable without user interaction; visual signal is sufficient)
- Session history or statistics tracking
- Configurable durations
- Mobile-specific layout optimizations
- Persistence across page reloads

---

## Decisions

### Decision 1: Timer State Machine
**Addresses**: UC1-S1, UC1-S2, UC1-S7, UC1-E1a1, UC1-E5a1, UC1-E5b1, UC3-S1, UC3-S5, UC3-E4a1, UC4-S1 through UC4-S4

The timer is modeled as an explicit state machine with four states:

```
IDLE → RUNNING → PAUSED → RUNNING
  ↑        |         |
  └────────┴─────────┘ (reset)
RUNNING → ENDED → (auto-transition to next mode IDLE)
```

State object held in a plain JS object:
```js
{
  mode: "work" | "rest",       // current session type
  status: "idle" | "running" | "paused" | "ended",
  remainingSeconds: number,    // preserved across pause/resume
  intervalId: number | null    // setInterval handle
}
```

**Rationale**: An explicit state machine prevents illegal transitions (e.g., starting while already running — UC1-E1a1) and makes the pause/resume/reset logic self-documenting. Each user action maps directly to a transition.

**Alternative Considered**: Simple boolean `isRunning` flag — rejected because it cannot distinguish between paused and idle states, making preserve-and-resume (UC3-S2, UC3-S6) ambiguous.

---

### Decision 2: setInterval for Countdown
**Addresses**: UC1-S3, UC1-S5, UC2-S3, UC2-S5, UC3-S2, UC3-S6, UC4-S2

Use `setInterval(tick, 1000)` to decrement `remainingSeconds` once per second. On each tick:
1. Decrement `remainingSeconds` by 1
2. If `remainingSeconds <= 0`: clear the interval, set status to `"ended"`, trigger completion signal, then auto-transition
3. Otherwise: re-render the display

On pause or reset: `clearInterval(state.intervalId)` to stop the ticker.

**Rationale**: `setInterval` is the simplest browser-native mechanism for per-second ticks. For a Pomodoro timer, second-level precision is sufficient — drift of a few hundred milliseconds per minute is imperceptible.

**Alternative Considered**: `Date`-based elapsed time with `requestAnimationFrame` — more accurate but unnecessary complexity for this use case.

---

### Decision 3: Completion Signal — Flash + Mode Label Change
**Addresses**: UC1-S6, UC2-S6

When a session ends (`remainingSeconds` reaches 0):
1. The timer display briefly flashes (CSS animation, 3 cycles of opacity pulse)
2. The mode label updates to show "Work Complete! → Rest" or "Rest Complete! → Work"
3. After 1.5 seconds, auto-transition: mode switches, `remainingSeconds` resets to the new mode's duration, status returns to `"idle"`

**Rationale**: A visual flash is reliable across all browsers without permission or autoplay issues. The 1.5-second delay gives the user a moment to notice the transition.

**Alternative Considered**: `alert()` dialog — intrusive and blocks the auto-transition. Browser `Notification` API — requires permission and is overkill for a simple timer.

---

### Decision 4: DOM Rendering — Direct Manipulation, No Framework
**Addresses**: UC3-S3, UC3-S7, and all display-update steps

A single `render()` function reads the current state and updates the DOM:
- Updates the time display (`MM:SS` format)
- Updates the mode label ("🍅 Work" / "☕ Rest")
- Updates the start/pause button label ("Start" / "Pause" / "Resume")
- Adds/removes a CSS `paused` class on the timer display
- Hides/shows reset button based on whether state is non-idle

`render()` is called after every state transition and on every tick. Since the DOM is small (< 10 elements), this is efficient without a virtual DOM.

**Rationale**: A framework (React, Vue, etc.) would add unnecessary complexity and a build step. Direct DOM manipulation is appropriate for a ~100-line app.

---

## Risks / Trade-offs

- **setInterval drift**: Tabs that are backgrounded by browsers may have their intervals throttled (Chrome/Firefox throttle inactive tabs to 1Hz or less). A user backgrounding the tab will see the timer fall behind. → Mitigation: acceptable for a simple Pomodoro timer; document the limitation in a code comment.
- **Single file**: All logic, styles, and markup in one file means no separation of concerns. → Acceptable given the small size; the file will remain under ~150 lines total.
- **No persistence**: Refreshing the page resets the timer. → Out of scope per proposal; the app is intentionally stateless.

## Migration Plan

No migration needed. This is a new standalone file (`index.html`) created in the current directory. Deployment is as simple as opening the file in a browser.

## Open Questions

_(none — all decisions resolved)_
