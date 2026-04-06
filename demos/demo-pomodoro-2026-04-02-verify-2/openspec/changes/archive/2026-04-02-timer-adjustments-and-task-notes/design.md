## Context

This design covers two distinct concerns in one change:

1. **Duration constants update** — `WORK_DURATION` changes from 1500 s (25 min) to 1800 s (30 min); `LONG_REST_DURATION` changes from 600 s (10 min) to 1500 s (25 min). These are single-file constant changes in `src/types/timer.ts` that ripple through specs, tests, and display copy.

2. **New task-notes capability** — A free-text note panel that appears during work sessions, lets the user type and edit a note, persists the note for the session, and clears it when the session ends or the timer is reset.

The existing architecture (React + `usePomodoro` hook + `useState`/`useRef`) is unchanged. This change extends it minimally: one new constant update, one new hook or state slice, and one new presentational component.

---

## Use Case Coverage

See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
This design addresses the following use case steps:

- UC1-S1: User starts the timer to begin a work session → Decision 1 (duration constants)
- UC1-S2: System begins countdown from 30:00, updating each second → Decision 1 (WORK_DURATION = 1800)
- UC1-S3: System shows session type label as "Work" → unchanged from prior change; no new design needed
- UC1-S4: User works for the full 30 minutes without interruption → Decision 1 (longer countdown)
- UC1-S5: System reaches 00:00 and signals session completion → unchanged; Decision 1 ensures correct target
- UC1-S6: System records completed Pomodoro and advances session → unchanged; cycle logic unaffected
- UC1-E5a: Timer completes while user is away; system holds completion state → unchanged behaviour
- UC2-S1: System transitions to long rest (25 min) and shows "Long Rest" → Decision 1 (LONG_REST_DURATION = 1500)
- UC2-S2: User starts the long rest countdown → unchanged behaviour
- UC2-S3: System counts down from 25:00, updating each second → Decision 1 (1500 s constant)
- UC2-S4: System reaches 00:00 and signals long rest completion → unchanged behaviour
- UC2-S5: System resets Pomodoro counter and readies next work cycle → unchanged cycle logic
- UC2-E3a: User triggers skip; system advances to next work session immediately → unchanged skip logic
- UC3-S1: System displays the task-notes panel during the work session → Decision 2 (conditional render)
- UC3-S2: User focuses the note area and begins typing → Decision 3 (controlled textarea)
- UC3-S3: System captures input and reflects note content immediately → Decision 3 (onChange handler)
- UC3-S4: User finishes typing and returns focus to their work → Decision 3 (no-op; state persists)
- UC3-S5: Note content remains visible and intact for the rest of the session → Decision 4 (state ownership in App)
- UC3-E2a: User edits existing note; system updates display with each change → Decision 3 (controlled textarea)
- UC3-E4a: User manually clears the note; system empties content, panel stays visible → Decision 3 (clear button sets note to "")
- UC4-S1: User completes a work session or resets the timer → Decision 4 (clear on session transition + reset)
- UC4-S2: System clears the note content from the task-notes panel → Decision 4 (note state reset)
- UC4-S3: System readies the panel for a new note in the next work session → Decision 4 (empty string after clear)
- UC4-E1a: User resets the timer mid-session; system clears the note immediately on reset → Decision 4 (resetTimer clears note)

### Unaddressed Use Case Steps
- None — all 24 steps are addressed by the decisions below.

---

## Goals / Non-Goals

**Goals:**
- Update `WORK_DURATION` and `LONG_REST_DURATION` constants and fix all downstream references (specs, tests, display)
- Add a task-notes text panel visible only during work sessions
- Auto-clear the note when starting a new work session or resetting
- Allow the user to manually clear their note

**Non-Goals:**
- Persisting notes across page reloads (no localStorage for MVP)
- Saving notes per-Pomodoro or displaying note history
- Rich-text formatting in the notes panel
- Syncing notes to any external service

---

## Decisions

### Decision 1: Update Duration Constants in `src/types/timer.ts`
**Addresses**:
- UC1-S1, UC1-S2, UC1-S4 — User starts and runs a 30-minute work session
- UC2-S1, UC2-S3 — System transitions to and counts down a 25-minute long rest

**Rationale**: Both durations are defined as named constants in one file. Changing them there propagates correctly to `sessionUtils.ts`, `usePomodoro.ts`, and all tests that import them. No logic changes are required — only the constant values change.

**Impact on tests**: All tests asserting `WORK_DURATION === 1500` or `LONG_REST_DURATION === 600` must be updated to 1800 and 1500 respectively. Tests that use these constants by reference (e.g., `vi.advanceTimersByTime(WORK_DURATION * 1000)`) need no change beyond re-importing the updated value.

**Alternative Considered**: Hard-coding new values everywhere — rejected as fragile and inconsistent with the existing pattern.

---

### Decision 2: Conditional Render of `TaskNotes` Component
**Addresses**:
- UC3-S1 — System displays the task-notes panel during the work session

**Rationale**: The notes panel is only relevant during work sessions (not during short rest or long rest). It is rendered in `App.tsx` conditionally: `{state.sessionType === 'work' && <TaskNotes ... />}`. This keeps the display clean during rest periods and avoids confusing users about whether their note persists across session types.

**Alternative Considered**: Always rendering the panel but hiding it via CSS — rejected because it would require additional state management to prevent accidental edits during rest.

---

### Decision 3: `TaskNotes` as a Controlled Textarea Component
**Addresses**:
- UC3-S2 — User focuses note area and begins typing
- UC3-S3 — System captures input and reflects note content immediately
- UC3-E2a — User edits existing note; system updates display with each change
- UC3-E4a — User manually clears the note

**Rationale**: A standard React controlled `<textarea>` bound to a `note` state string is the simplest reliable approach. `value={note}` + `onChange` keeps the display in sync with state on every keystroke. A "Clear" button triggers `setNote("")` to satisfy UC3-E4a.

**Component interface**:
```tsx
<TaskNotes note={note} onChange={setNote} />
```

`TaskNotes` is a purely presentational component — it receives `note` and `onChange` as props and owns no state of its own.

**Alternative Considered**: An uncontrolled textarea with a ref — rejected because it makes clearing and reading note content from parent state more complex.

---

### Decision 4: Note State Owned in `App` / `usePomodoro` Hook, Cleared on Session Boundary
**Addresses**:
- UC3-S5 — Note content remains visible and intact for the rest of the session
- UC4-S1, UC4-S2, UC4-S3 — Note cleared when work session ends or timer is reset
- UC4-E1a — Note cleared immediately on reset mid-session

**Rationale**: Note state (`note: string`, `setNote`) is held in `App` (via `useState`) or in a thin `useTaskNotes` hook. It must be cleared at two points:
1. **On timer reset** — `resetTimer()` in `usePomodoro` triggers a side-effect or callback that clears the note.
2. **On session advance** — when `startTimer()` is called from a `completed` state and `advanceSession()` produces a new work session, the note is cleared.

The simplest implementation: `App` passes a `clearNote` callback to `usePomodoro`, which calls it inside `resetTimer` and inside the `startTimer` completed→new-session transition. Alternatively, `App` can use a `useEffect` watching `state.sessionType` and `state.status` to clear the note reactively.

**Chosen approach**: `useEffect` in `App` watching `[state.sessionType, state.status]` — clears the note when a new work session becomes `idle` (after advance) or when status resets to `idle` via reset. This keeps `usePomodoro` free of knowledge about notes.

```tsx
useEffect(() => {
  if (state.sessionType === 'work' && state.status === 'idle') {
    setNote('');
  }
}, [state.sessionType, state.status]);
```

**Alternative Considered**: Passing a note-clearing callback into `usePomodoro` — rejected because it couples the timer hook to note-management concerns.

---

## Risks / Trade-offs

- **Test constant drift**: Many existing tests hardcode 1500 and 600 (from `WORK_DURATION` and `LONG_REST_DURATION`). Tests using the imported constants will auto-update; tests with inline literals will fail and need a manual find-and-replace. Mitigation: grep for literal `1500` and `600` in test files before committing.
- **useEffect timing**: The `useEffect` clearing the note fires after render, not synchronously with the state transition. In practice this is imperceptible to the user (≤ one frame). Mitigation: acceptable for MVP; if needed, the clear can be moved inline into the event handlers.
- **No note history**: The user cannot retrieve a note from a previous session. This is an accepted MVP limitation documented in Non-Goals.

---

## Migration Plan

No backend or data migration required. Steps to ship:
1. Update constants in `src/types/timer.ts`
2. Add `TaskNotes` component and `useTaskNotes` (or inline state in `App`)
3. Wire conditional render in `App`
4. Add note-clearing `useEffect` in `App`
5. Update all tests that assert on literal `1500`/`600` constant values
6. Update the `timer-display` spec scenario "Full-duration display at start" copy from `25:00` to `30:00`
7. Smoke-test in browser to confirm 30:00 / 25:00 displays and note panel appears/clears correctly

Rollback: revert the constant values and remove the `TaskNotes` component — no data to migrate.

---

## Open Questions

- Should the note panel have a character limit? (Recommendation: no limit for MVP — keep it simple)
- Should the "Clear" button require confirmation? (Recommendation: no — the note is ephemeral; accidental clears are low-risk)
- Should the note panel be visible when the timer is paused during a work session? (Recommendation: yes — it is still a work session; the panel remains visible while paused)
