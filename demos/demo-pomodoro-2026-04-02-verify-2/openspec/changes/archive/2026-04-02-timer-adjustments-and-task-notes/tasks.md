## Implementation Overview
This task list implements the timer-adjustments-and-task-notes change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability
This implementation addresses the following use case steps:
- UC1-S1: User starts the timer to begin a work session
- UC1-S2: System begins countdown from 30:00, updating each second
- UC1-S3: System shows session type label as "Work"
- UC1-S4: User works for the full 30 minutes without interruption
- UC1-S5: System reaches 00:00 and signals session completion
- UC1-S6: System records the completed Pomodoro and advances to the next session
- UC1-E5a: Timer completes while user is away; system holds completion state
- UC2-S1: System transitions to long rest (25 min) and shows "Long Rest"
- UC2-S2: User starts the long rest countdown
- UC2-S3: System counts down from 25:00, updating each second
- UC2-S4: System reaches 00:00 and signals long rest completion
- UC2-S5: System resets Pomodoro counter and readies the next work cycle
- UC2-E3a: User triggers skip; system advances to next work session immediately
- UC3-S1: System displays the task-notes panel during the work session
- UC3-S2: User focuses the note area and begins typing
- UC3-S3: System captures input and reflects note content immediately
- UC3-S4: User finishes typing and returns focus to their work
- UC3-S5: Note content remains visible and intact for the rest of the session
- UC3-E2a: User edits existing note; system updates display with each change
- UC3-E4a: User manually clears the note; system empties content, panel stays visible
- UC4-S1: User completes a work session or resets the timer
- UC4-S2: System clears the note content from the task-notes panel
- UC4-S3: System readies the panel for a new note in the next work session
- UC4-E1a: User resets the timer mid-session; system clears the note immediately

## 1. Update Duration Constants

- [x] 1.1 Update `WORK_DURATION` in `src/types/timer.ts` from 1500 to 1800 (Addresses: UC1-S1, UC1-S2, UC1-S4)
- [x] 1.2 Update `LONG_REST_DURATION` in `src/types/timer.ts` from 600 to 1500 (Addresses: UC2-S1, UC2-S3)
- [x] 1.3 Verify `INITIAL_STATE` and `SESSION_DURATIONS` in `src/types/timer.ts` pick up the updated constants automatically (Addresses: UC1-S1, UC2-S1)

## 2. Update Downstream References to Constants

- [x] 2.1 Update any literal `1500` references in `src/utils/sessionUtils.ts` that represent work duration to use `WORK_DURATION` (Addresses: UC1-S1, UC2-S5, UC2-E3a)
- [x] 2.2 Update any literal `600` references in `src/utils/sessionUtils.ts` that represent long-rest duration to use `LONG_REST_DURATION` (Addresses: UC2-S1)
- [x] 2.3 Grep test files for hardcoded literals `1500` (work) and `600` (long rest) and update them to match the new constants 1800 and 1500 respectively (Addresses: UC1-S2, UC2-S3)

## 3. Create the TaskNotes Component

- [x] 3.1 Create `src/components/TaskNotes.tsx` as a purely presentational controlled-textarea component accepting `note: string` and `onChange: (value: string) => void` props (Addresses: UC3-S2, UC3-S3, UC3-E2a)
- [x] 3.2 Add a "Clear" button inside `TaskNotes` that calls `onChange("")` to empty the note content (Addresses: UC3-E4a)
- [x] 3.3 Bind the textarea `value={note}` and `onChange` handler so the display updates on every keystroke (Addresses: UC3-S3, UC3-E2a)
- [x] 3.4 Ensure the `TaskNotes` panel remains visible (not hidden or unmounted) after the user activates the Clear button (Addresses: UC3-E4a)

## 4. Wire Note State in App

- [x] 4.1 Add `const [note, setNote] = useState('')` state in `App.tsx` to own the note string (Addresses: UC3-S5)
- [x] 4.2 Conditionally render `<TaskNotes note={note} onChange={setNote} />` in `App.tsx` only when `state.sessionType === 'work'` (Addresses: UC3-S1, UC3-S4)
- [x] 4.3 Add a `useEffect` in `App.tsx` watching `[state.sessionType, state.status]` that calls `setNote('')` when `state.sessionType === 'work' && state.status === 'idle'` to clear the note at session boundaries and on reset (Addresses: UC4-S1, UC4-S2, UC4-S3, UC4-E1a)

## 5. Verify Display Copy

- [x] 5.1 Confirm the timer display shows `30:00` at the start of a work session (idle state) in `TimerDisplay.tsx` — no code change required if the component reads from `remainingSeconds` and the constant update propagates correctly (Addresses: UC1-S2, UC1-S3)
- [x] 5.2 Confirm the timer display shows `25:00` when transitioning to long rest — verify `SESSION_DURATIONS.longRest` drives `remainingSeconds` correctly (Addresses: UC2-S1, UC2-S3)
- [x] 5.3 Confirm the reset action restores the display to `30:00`, label "Work", and Pomodoro count 0 (Addresses: UC4-E1a)

## 6. Manual Smoke Test

- [x] 6.1 Load the app in the browser and confirm the initial idle display shows `30:00` and label "Work" (Addresses: UC1-S1, UC1-S2)
- [x] 6.2 Start the timer and verify the countdown ticks from `30:00` every second (Addresses: UC1-S4)
- [x] 6.3 Complete or advance through 4 work sessions and confirm the long rest shows `25:00` (Addresses: UC2-S1, UC2-S3)
- [x] 6.4 Verify the task-notes panel appears during a work session, is hidden during short rest and long rest, and reappears when the next work session starts (Addresses: UC3-S1, UC3-S4)
- [x] 6.5 Type a note during a work session; confirm each keystroke is reflected immediately and the note persists while running and paused (Addresses: UC3-S2, UC3-S3, UC3-S5)
- [x] 6.6 Activate the Clear button and confirm the note empties but the panel stays visible (Addresses: UC3-E4a)
- [x] 6.7 Trigger a reset mid-session and confirm the note is cleared immediately and the display returns to `30:00` (Addresses: UC4-E1a)
