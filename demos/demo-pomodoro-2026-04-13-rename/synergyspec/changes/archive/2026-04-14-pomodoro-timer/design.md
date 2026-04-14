# Design: pomodoro-timer

## Context

This is a greenfield React application implementing a simple Pomodoro timer. There is no existing codebase to integrate with. The user needs a distraction-free tool that accurately alternates between a 25-minute work phase and a 5-minute rest phase, with controls for start, pause, and reset, and a notification at each phase boundary. The design must prioritize timing accuracy, simplicity, and minimal dependencies.

## Use Case Coverage

See `usecases.md` "Use Case Traceability Mapping" section for the complete list of use case steps. This design addresses the following use case steps:

- **UC1-S1**: User requests to start the timer → Decision 2 (Controls component with start/pause/reset actions)
- **UC1-S2**: System begins counting down the 25-minute work phase and displays remaining time → Decisions 1, 3 (state machine + setInterval tick loop)
- **UC1-S3**: System reaches zero on the work phase and notifies the user that work is complete → Decision 4 (notification on phase-end transition)
- **UC1-S4**: System transitions to the 5-minute rest phase and begins counting down → Decision 1 (phase state machine auto-advances)
- **UC1-S5**: System reaches zero on the rest phase and notifies the user that rest is complete → Decision 4 (notification on phase-end transition)
- **UC1-S6**: System returns to the idle work phase, ready for the next cycle → Decision 1 (state machine resets to idle/work)
- **UC1-E2a**: User requests to pause the timer → Decision 2 (Controls pause action)
- **UC1-E2a1**: System halts the countdown and retains the remaining time → Decision 3 (interval cleared, remaining time persists in state)
- **UC1-E2a2**: User requests to resume; system continues counting from the retained time → Decision 3 (restart interval from retained remaining value)
- **UC1-E3a**: User dismisses the end-of-work notification before rest begins → Decision 4 (notification is fire-and-forget, not blocking)
- **UC1-E3a1**: System proceeds to the rest phase regardless of dismissal → Decision 4 (phase transition is not gated on user acknowledgment)
- **UC1-E5a**: User dismisses the end-of-rest notification → Decision 4 (notification is fire-and-forget, not blocking)
- **UC1-E5a1**: System returns to idle work phase regardless of dismissal → Decision 4 (phase transition is not gated on user acknowledgment)
- **UC2-S1**: User requests to reset the timer → Decision 2 (Controls component reset action)
- **UC2-S2**: System stops any active countdown → Decision 3 (clear active interval on reset)
- **UC2-S3**: System restores the remaining time to the full duration of the current phase → Decision 1 (reset action resets remaining to phase duration)
- **UC2-S4**: System enters the idle state, awaiting a new start request → Decision 1 (state machine transitions running → idle)

### Unaddressed Use Case Steps

All main scenario and extension steps are addressed by the design.

## Goals / Non-Goals

**Goals:**
- Accurate countdown timing within ~1-second resolution
- Clear visual indication of current phase (work vs. rest) and remaining time
- Simple start/pause/reset controls
- Automatic transition between phases
- End-of-phase notification (audible beep and/or visual change)
- Minimal dependencies — React only, no state library, no timer library

**Non-Goals:**
- Persistence across page reloads
- Configurable phase durations (fixed at 25/5 minutes)
- Session history, statistics, or logging
- Multi-device sync or backend
- Custom sound uploads, themes, or settings UI

## Decisions

### Decision 1: Phase state machine with `useReducer`
**Addresses**: UC1-S2, UC1-S4, UC1-S6, UC2-S3, UC2-S4 — phase transitions and reset behavior.
**Rationale**: A small reducer keeps transitions (idle → running → phase-end → next-phase-idle → running) explicit and testable. Actions: `START`, `PAUSE`, `RESUME`, `RESET`, `TICK`, `PHASE_END`. State: `{ phase: 'work' | 'rest', status: 'idle' | 'running' | 'paused', remainingSeconds: number }`.
**Alternative Considered**: `useState` with multiple setters — rejected because transition logic becomes scattered and harder to test in isolation.

### Decision 2: Single `<PomodoroTimer />` component with child `<Controls />` and `<Display />`
**Addresses**: UC1-S1, UC2-S1 — user-triggered start/pause/reset actions.
**Rationale**: A single container owns the reducer state and passes dispatch to a `Controls` presentational component. The `Display` component renders `mm:ss` and the current phase label. This separation keeps the timing logic isolated from rendering.
**Alternative Considered**: Flat single component — rejected because it mixes concerns and makes unit testing Controls/Display independently harder.

### Decision 3: `setInterval` tick loop managed in `useEffect`
**Addresses**: UC1-S2, UC1-S5, UC1-E2a, UC1-E2a2, UC2-S2 — running countdown, pause halts it, resume restarts it, reset clears it.
**Rationale**: A `useEffect` subscribed to `status === 'running'` installs a 1-second `setInterval` that dispatches `TICK`. On pause/reset/unmount, the effect's cleanup clears the interval. Time is stored as `remainingSeconds` and decremented per tick.
**Alternative Considered**: `requestAnimationFrame` loop — rejected as overkill for 1-second granularity and introduces throttling concerns when the tab is hidden. `Date.now()` delta correction could be added later if drift is observed; initial version accepts minor drift for simplicity.

### Decision 4: End-of-phase notification via Web Audio beep and visual phase change
**Addresses**: UC1-S3, UC1-S5, UC1-E3a, UC1-E5a — user is notified at phase boundaries, but dismissal is non-blocking.
**Rationale**: When `remainingSeconds` hits 0, the reducer dispatches `PHASE_END`, which plays a short beep (HTMLAudioElement or Web Audio API) and flips `phase`. The UI re-renders with the new phase color/label. No modal or blocking dialog — the notification is ambient and the next phase begins immediately (satisfying "proceeds regardless of dismissal").
**Alternative Considered**: Browser Notifications API — rejected as requiring permission prompts and unnecessary for a foreground-only app.

## Risks / Trade-offs

- **Timing drift with `setInterval`** → Mitigation: For a 25-minute session, ±1–2 seconds of drift is acceptable. If users report issues, switch to `Date.now()` delta-based correction.
- **Browser audio autoplay policies block initial beep** → Mitigation: Audio element is initialized on first user interaction (the `START` click), satisfying autoplay requirements.
- **Tab throttling when backgrounded slows intervals** → Mitigation: Accepted limitation for v1; document it. A delta-based approach would fix this later.
- **No persistence** → Mitigation: Documented as a non-goal; adding `localStorage` is straightforward if needed.

## Migration Plan

Not applicable — greenfield project. Deployment is a static React build (Vite or CRA) served from any static host. Rollback is trivial: revert to previous build.

## Open Questions

- Should the rest phase auto-start the next work session, or return to idle? **Decision**: Returns to idle (per UC1-S6) to give the user control over cycle pacing.
- Should we use Vite or Create React App as the scaffold? **Decision**: Vite — faster dev server and smaller dependency tree. Confirm during task breakdown.
