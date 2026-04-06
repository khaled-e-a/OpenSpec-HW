## Implementation Overview
This task list implements the update-timer-durations-and-notes change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability
This implementation addresses the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User starts the timer |
| UC1-S2 | System begins countdown from 30:00, displaying remaining time |
| UC1-S3 | System shows the "Work Session" label |
| UC1-S4 | User works while the timer counts down for 30 minutes |
| UC1-S5 | System reaches 00:00 and notifies user that work session is complete |
| UC1-S6 | System increments the completed pomodoro count by 1 |
| UC1-S7 | System transitions to the appropriate rest session |
| UC1-E4a | User pauses the timer mid 30-minute session |
| UC1-E4a1 | System pauses countdown and holds current time within the 30-minute session |
| UC1-E4a2 | User resumes; System continues from the paused time |
| UC1-E4b | User resets the timer mid 30-minute session |
| UC1-E4b1 | System stops countdown and resets to 30:00; pomodoro count not incremented |
| UC2-S1 | System displays "Long Rest" label and starts countdown from 25:00 |
| UC2-S2 | User takes extended break while the timer counts down |
| UC2-S3 | System reaches 00:00 and notifies user that long rest is over |
| UC2-S4 | System transitions back to "Work Session" mode for next cycle |
| UC2-E2a | User skips the long rest early by resetting |
| UC2-E2a1 | System transitions to next work session immediately |
| UC3-S1 | User clicks the notes area |
| UC3-S2 | System activates the text input, allowing free-form typing |
| UC3-S3 | User types notes about the current task |
| UC3-S4 | System retains the notes content as the user types |
| UC3-S5 | Session transitions occur; System preserves notes content throughout |
| UC3-S6 | User continues to view or edit notes in subsequent sessions |
| UC3-E3a | User wants to clear notes manually |
| UC3-E3a1 | User clears the notes area manually |
| UC3-E3a2 | System removes the content |
| UC3-E5a | User resets the timer |
| UC3-E5a1 | System resets timer state but does NOT clear the notes |
| UC3-E5a2 | Notes content remains intact after a reset |
| UC4-S1 | User selects all content in notes and deletes it (or uses clear action) |
| UC4-S2 | System removes the notes content |
| UC4-S3 | Notes area is now empty and ready for new input |
| UC4-S4 | Timer state and pomodoro count are unaffected |

---

## 1. Update Timer Duration Constants

- [x] 1.1 Update `DURATIONS.WORK` in `src/timer.js` from 1500 to 1800 (Addresses: UC1-S2, UC1-S4, UC1-E4b1)
- [x] 1.2 Update `DURATIONS.LONG_REST` in `src/timer.js` from 600 to 1500 (Addresses: UC2-S1, UC2-S2)
- [x] 1.3 Add a comment in `src/timer.js` noting that LONG_REST (1500 s) coincidentally equals the old WORK duration (Addresses: UC2-S1)

---

## 2. Update UI Duration References

- [x] 2.1 Verify that the countdown display in `index.html` reads from `DURATIONS` via the timer snapshot — no hardcoded "25:00" strings needing update (Addresses: UC1-S2, UC2-S1)
- [x] 2.2 Update any hardcoded duration strings in session-end banner messages or placeholder text in `index.html` if they reference old values (e.g., "10:00" for Long Rest) (Addresses: UC2-S1, UC2-S3)

---

## 3. Add Notes Textarea to UI

- [x] 3.1 Add a `<textarea>` element below the timer card in `index.html` with a placeholder of "Notes about your current task…" (Addresses: UC3-S1, UC3-S2, UC3-S6)
- [x] 3.2 Style the notes textarea: readable width, adequate height (min 4 rows), consistent with the dark card theme (Addresses: UC3-S1, UC3-S2)
- [x] 3.3 Add a visible label or heading above the textarea (e.g., "Task Notes") for discoverability (Addresses: UC3-S1)

---

## 4. Ensure Notes Independence from Timer State

- [x] 4.1 Confirm that `resetTimer()` in `src/timer.js` makes no reference to the notes textarea — notes preservation is automatic since reset only modifies timer state variables (Addresses: UC3-E5a1, UC3-E5a2)
- [x] 4.2 Confirm that the `render(snapshot)` function in `index.html` does not assign to or clear the notes textarea value on any timer tick or state change (Addresses: UC3-S5, UC3-S5)
- [x] 4.3 Confirm that the `onComplete` handler in `index.html` does not touch the notes textarea (Addresses: UC3-S5)

---

## 5. Integration & Verification

- [x] 5.1 Verify work session starts at 30:00 and counts down accurately (Addresses: UC1-S1, UC1-S2, UC1-S4)
- [x] 5.2 Verify Long Rest starts at 25:00 after the 4th pomodoro (Addresses: UC2-S1, UC2-S2)
- [x] 5.3 Verify Short Rest is unchanged at 05:00 (Addresses: UC1-S7)
- [x] 5.4 Verify reset during work session restores to 30:00, not the old 25:00 (Addresses: UC1-E4b1)
- [x] 5.5 Verify reset during Long Rest restores to 25:00, not the old 10:00 (Addresses: UC2-E2a, UC2-E2a1)
- [x] 5.6 Type notes and verify they are retained through a session transition (work → short rest → work) (Addresses: UC3-S4, UC3-S5, UC3-S6)
- [x] 5.7 Type notes, reset the timer, and verify notes are unchanged (Addresses: UC3-E5a1, UC3-E5a2)
- [x] 5.8 Clear the notes textarea manually and verify it is empty; confirm timer state and pomodoro count are unaffected (Addresses: UC4-S1, UC4-S2, UC4-S3, UC4-S4)
