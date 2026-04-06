## Context

This is an incremental change to the existing Pomodoro timer application (`src/timer.js` + `index.html`). Two duration constants in `timer.js` need to be updated, and a new notes UI element needs to be added to `index.html`. The existing state machine, tick engine, and control model are preserved unchanged — only the `DURATIONS` values and the UI layout are affected.

Current state:
- `DURATIONS.WORK = 1500` (25 min)
- `DURATIONS.LONG_REST = 600` (10 min)
- No notes section exists in the UI

Target state:
- `DURATIONS.WORK = 1800` (30 min)
- `DURATIONS.LONG_REST = 1500` (25 min)
- Notes textarea visible at all times, independent of timer state

---

## Use Case Coverage

See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
This design addresses the following use case steps:

| Use Case Step | Description | Design Section |
|---------------|-------------|----------------|
| UC1-S1 | User starts the timer | (unchanged — existing start logic) |
| UC1-S2 | System begins countdown from 30:00 | Decision 1: Update DURATIONS.WORK |
| UC1-S3 | System shows the "Work Session" label | (unchanged — existing label logic) |
| UC1-S4 | User works while the timer counts down for 30 minutes | Decision 1: Update DURATIONS.WORK |
| UC1-S5 | System reaches 00:00 and notifies user | (unchanged — existing complete handler) |
| UC1-S6 | System increments the pomodoro count | (unchanged — existing state machine) |
| UC1-S7 | System transitions to appropriate rest session | (unchanged — existing routing) |
| UC1-E4a | User pauses mid 30-minute session | (unchanged — existing pause logic) |
| UC1-E4a1 | System pauses and holds current time | (unchanged) |
| UC1-E4a2 | User resumes from paused time | (unchanged) |
| UC1-E4b | User resets mid 30-minute session | (unchanged — existing reset logic) |
| UC1-E4b1 | System resets to 30:00; count unchanged | Decision 1: DURATIONS.WORK provides the reset target |
| UC2-S1 | System displays Long Rest from 25:00 | Decision 2: Update DURATIONS.LONG_REST |
| UC2-S2 | User rests while timer counts down | Decision 2: Update DURATIONS.LONG_REST |
| UC2-S3 | System notifies user long rest is over | (unchanged — existing complete handler) |
| UC2-S4 | System transitions back to Work Session | (unchanged — existing state machine) |
| UC2-E2a | User skips long rest early | (unchanged — existing reset logic) |
| UC2-E2a1 | System transitions to next work session | (unchanged) |
| UC3-S1 | User clicks the notes area | Decision 3: Notes textarea in UI |
| UC3-S2 | System activates text input | Decision 3: Native textarea element |
| UC3-S3 | User types notes | Decision 3: Native textarea element |
| UC3-S4 | System retains notes content as user types | Decision 3: Notes live in textarea DOM value |
| UC3-S5 | Session transitions preserve notes content | Decision 4: Notes are independent of timer state |
| UC3-S6 | User views/edits notes in subsequent sessions | Decision 3: textarea always visible |
| UC3-E3a | User wants to clear notes manually | Decision 3: Standard textarea editing |
| UC3-E3a1 | User clears notes manually | Decision 3: No system intervention needed |
| UC3-E3a2 | System removes content | Decision 3: Native textarea behaviour |
| UC3-E5a | User resets the timer | Decision 4: Notes independent of timer state |
| UC3-E5a1 | System resets timer but NOT notes | Decision 4: resetTimer() does not touch notes |
| UC3-E5a2 | Notes content remains intact after reset | Decision 4: Notes independent of timer state |
| UC4-S1 | User selects all and deletes notes | Decision 3: Standard textarea editing |
| UC4-S2 | System removes notes content | Decision 3: Native textarea behaviour |
| UC4-S3 | Notes area empty and ready | Decision 3: Native textarea behaviour |
| UC4-S4 | Timer state and count unaffected | Decision 4: Notes fully decoupled from timer |

### Unaddressed Use Case Steps
None — all 34 use case steps are addressed above.

---

## Goals / Non-Goals

**Goals:**
- Update `DURATIONS.WORK` to 1800 seconds (30 min) and `DURATIONS.LONG_REST` to 1500 seconds (25 min)
- Add a notes textarea to the UI that is always visible and independent of timer state
- Ensure timer reset does not clear notes
- Ensure session transitions (work↔rest) do not clear notes

**Non-Goals:**
- Persisting notes to `localStorage` or any external store (in-page memory only)
- A "Clear" button for notes (user uses native textarea editing; optional enhancement later)
- Any changes to the tick engine, state machine, pause/resume/reset logic, or session routing
- Changes to Short Rest duration (remains 300 s / 5 min)

---

## Decisions

### Decision 1: Update DURATIONS.WORK constant to 1800
**Addresses**:
- UC1-S2 - System begins countdown from 30:00, displaying remaining time
- UC1-S4 - User works while the timer counts down for 30 minutes
- UC1-E4b1 - System stops countdown and resets to 30:00

**Rationale**: The entire timer engine reads `DURATIONS[sessionType]` for every initial duration, reset target, and state-machine routing decision. Changing the single constant propagates correctly everywhere — no other logic changes are needed for the work session duration.

**Alternative Considered**: Making durations configurable at runtime via a settings UI — rejected as out of scope for this change; the proposal specifies fixed constants.

---

### Decision 2: Update DURATIONS.LONG_REST constant to 1500
**Addresses**:
- UC2-S1 - System displays "Long Rest" label and starts countdown from 25:00
- UC2-S2 - User takes extended break while the timer counts down

**Rationale**: Same reasoning as Decision 1 — single constant change propagates through the engine. Note that the new Long Rest (1500 s) now equals the old Work duration, which is coincidental and requires no special handling.

**Alternative Considered**: No alternatives; this is a straightforward constant update.

---

### Decision 3: Notes section — native HTML textarea, always visible
**Addresses**:
- UC3-S1 - User clicks the notes area
- UC3-S2 - System activates text input, allowing free-form typing
- UC3-S3 - User types notes about the current task
- UC3-S4 - System retains notes content as user types
- UC3-S6 - User continues to view or edit notes in subsequent sessions
- UC3-E3a1/E3a2 - User clears notes; System removes content
- UC4-S1/S2/S3 - User deletes notes; textarea becomes empty

**Rationale**: A plain `<textarea>` element below the timer card handles focus, editing, selection, copy/paste, and clearing natively without any JavaScript. The notes area is always rendered (not conditionally shown/hidden), keeping implementation minimal. A placeholder text ("Notes about your current task…") guides the user without instructions.

**Alternative Considered**: A contenteditable `<div>` — rejected because `<textarea>` has better keyboard accessibility, native undo/redo, and simpler value access.

---

### Decision 4: Notes state is fully decoupled from the timer
**Addresses**:
- UC3-S5 - Session transitions occur; System preserves notes content throughout
- UC3-E5a1 - System resets timer state but does NOT clear the notes
- UC3-E5a2 - Notes content remains intact after a reset
- UC4-S4 - Timer state and pomodoro count are unaffected by note clearing

**Rationale**: The `resetTimer()` function in `timer.js` has no knowledge of the DOM or of notes. It only manipulates timer state variables. This means notes are preserved automatically on reset and session transitions — no code needs to be added to `timer.js`. The `render(snapshot)` function in `index.html` also does not touch the textarea value, so re-renders triggered by timer ticks have no effect on notes.

**Alternative Considered**: Storing notes in the timer state object — rejected because notes are a UI concern unrelated to timer mechanics; mixing them would violate separation of concerns.

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Notes lost on page refresh | Documented as in-scope limitation (no persistence goal); users should be aware |
| New DURATIONS.LONG_REST (1500 s) equals old DURATIONS.WORK (1500 s) — may confuse future readers | Add a comment in the code clarifying the coincidence |
| Users mid-session when the change is deployed see the old duration for that session | Acceptable; new duration applies on next reset or page load |

---

## Migration Plan

1. Update `DURATIONS.WORK` and `DURATIONS.LONG_REST` in `src/timer.js`
2. Add the notes `<textarea>` section to `index.html` below the timer card
3. No data migration required — purely client-side
4. Rollback: revert the two constant values and remove the textarea

---

## Open Questions

- Should a "Clear notes" button be added alongside the textarea for discoverability? (Current design: no — users rely on native textarea editing. Can be added in a follow-up change.)
- Should notes survive page reloads via `localStorage`? (Out of scope for this change — deferred.)
