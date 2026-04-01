## Context

The Pomodoro timer currently uses a `DURATIONS` constant object in `index.html` with `work: 1500` (25 min) and `rest: 300` (5 min). This change updates those two values to `work: 1800` (30 min) and `rest: 900` (15 min). No behavioral logic changes — only the numeric durations change.

## Use Case Coverage

See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
This design addresses the following use case steps:

- UC1-S2: System begins a 30-minute countdown in work mode → Decision 1 (DURATIONS.work = 1800)
- UC1-S3: System displays remaining time starting from 30:00 → Decision 1 (initial remainingSeconds = 1800, formatTime renders "30:00")
- UC1-S5: System detects that the 30-minute session has ended → Decision 1 (tick reaches 0 after 1800 ticks)
- UC1-S7: System transitions to rest mode with 15-minute timer ready → Decision 1 (autoTransition sets remainingSeconds = DURATIONS.rest = 900)
- UC1-E1a1: System displays "30:00" on load in idle work mode → Decision 1 (state initializes from DURATIONS.work)
- UC2-S2: System begins a 15-minute countdown in rest mode → Decision 1 (DURATIONS.rest = 900)
- UC2-S3: System displays remaining rest time starting from 15:00 → Decision 1 (formatTime renders "15:00")
- UC2-S5: System detects that the 15-minute rest period has ended → Decision 1 (tick reaches 0 after 900 ticks)
- UC2-S7: System transitions to work mode with 30-minute timer ready → Decision 1 (autoTransition sets remainingSeconds = DURATIONS.work = 1800)
- UC2-E1a1: System displays "15:00" in idle rest mode after work session ends → Decision 1

### Unaddressed Use Case Steps
- UC1-S1, UC2-S1: "User starts the timer" — no design change needed; start behavior is unchanged.

---

## Goals / Non-Goals

**Goals:**
- Update `DURATIONS.work` from 1500 to 1800 seconds
- Update `DURATIONS.rest` from 300 to 900 seconds
- All dependent logic (initial display, reset, auto-transition) automatically picks up the new values since they all reference `DURATIONS`

**Non-Goals:**
- No changes to timer behavior (start, pause, resume, reset, auto-transition logic)
- No changes to styling or UI structure
- No configurability — durations remain hardcoded constants

---

## Decisions

### Decision 1: Update the `DURATIONS` constant only
**Addresses**: UC1-S2, UC1-S3, UC1-S5, UC1-S7, UC1-E1a1, UC2-S2, UC2-S3, UC2-S5, UC2-S7, UC2-E1a1

Change in `index.html`:
```js
// Before
const DURATIONS = { work: 1500, rest: 300 };

// After
const DURATIONS = { work: 1800, rest: 900 };
```

**Rationale**: All timer logic (`startTimer`, `resetTimer`, `autoTransition`, `state` initialization) already reads from `DURATIONS`. Updating the constant propagates the new durations to every dependent function automatically — no other code changes are required.

**Alternative Considered**: Updating magic numbers scattered across the code — rejected because the existing design already centralizes durations in `DURATIONS`, making this a single-line change.

---

## Risks / Trade-offs

- **Users mid-session**: If a user has the app open when the change is deployed, their in-progress timer will continue with the old duration. A page refresh is required to pick up the new values. → Acceptable; this is a static file with no server-side state.

## Migration Plan

1. Update `DURATIONS` in `index.html` (one line change)
2. Reload the page in the browser to verify "30:00" appears on load and "15:00" appears after a work session ends

## Open Questions

_(none)_
