# Use Cases: update-timer-durations-and-notes

Generated: 2026-04-02

## Overview

This document captures the use cases for the update-timer-durations-and-notes change, following Cockburn's use case methodology. This change updates work session duration to 30 minutes, long rest to 25 minutes, and introduces a task notes section for users to capture free-form notes during a session.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | Run a 30-minute focused work session |
| User | Take a 25-minute long rest after completing four work sessions |
| User | Write notes about the current task during a session |
| User | Clear notes when starting a new topic |

---

## Use Cases

### UC1: Run a 30-Minute Work Session

**Primary Actor**: User
**Goal**: Complete a focused 30-minute work session with the updated duration

#### Stakeholders & Interests
- User: Wants a longer focus block that fits their working style
- System: Must count down accurately from the new 30-minute duration

#### Preconditions
- The application is loaded with the updated work session duration (30 minutes)
- Timer is in idle state with session type "Work"

#### Trigger
User starts the timer to begin a work session.

#### Main Success Scenario
1. User starts the timer.
2. System begins counting down from 30:00, displaying remaining time.
3. System shows the "Work Session" label.
4. User works while the timer counts down for 30 minutes.
5. System reaches 00:00 and notifies the user that the work session is complete.
6. System increments the completed pomodoro count by 1.
7. System transitions to the appropriate rest session.

#### Extensions
4a. User pauses the timer:
  4a1. System pauses the countdown and holds the current time within the 30-minute session.
  4a2. User resumes; System continues from the paused time.

4b. User resets the timer:
  4b1. System stops the countdown and resets to 30:00.
  4b2. Pomodoro count is not incremented.

#### Postconditions
- Pomodoro count has been incremented
- System is in rest mode (short or long) awaiting next user action

---

### UC2: Take a 25-Minute Long Rest

**Primary Actor**: User
**Goal**: Take a 25-minute long break after completing four work sessions

#### Stakeholders & Interests
- User: Wants a substantial recovery period that matches the longer work sessions
- System: Must count down accurately from the new 25-minute long rest duration

#### Preconditions
- The 4th (or Nth multiple of 4) work session has just completed
- Application uses the updated long rest duration of 25 minutes

#### Trigger
System automatically transitions to long rest mode after every 4th completed pomodoro.

#### Main Success Scenario
1. System displays "Long Rest" label and starts countdown from 25:00.
2. User takes an extended break while the timer counts down.
3. System reaches 00:00 and notifies the user that the long rest is over.
4. System transitions back to "Work Session" mode, ready for the next cycle.

#### Extensions
2a. User skips the long rest early:
  2a1. User resets the timer.
  2a2. System transitions to the next work session immediately.

#### Postconditions
- System is in "Work Session" mode, idle and ready to start a new cycle

---

### UC3: Write Notes About the Current Task

**Primary Actor**: User
**Goal**: Capture free-form notes about what they are working on during a session

#### Stakeholders & Interests
- User: Wants to record thoughts, context, or progress without leaving the timer
- System: Must display a notes area and preserve the content across session transitions

#### Preconditions
- The application is loaded and the notes section is visible
- Timer may be in any state (idle, running, or paused)

#### Trigger
User clicks into the notes area and begins typing.

#### Main Success Scenario
1. User clicks the notes area.
2. System activates the text input, allowing free-form typing.
3. User types notes about the current task.
4. System retains the notes content as the user types.
5. Session transitions (work → rest → work) occur; System preserves the notes content throughout.
6. User continues to view or edit notes in subsequent sessions.

#### Extensions
3a. User wants to clear notes:
  3a1. User clears the notes area manually (selects all, deletes).
  3a2. System removes the content.

5a. User resets the timer:
  5a1. System resets the timer state but does NOT clear the notes.
  5a2. Notes content remains intact after a reset.

#### Postconditions
- Notes content is visible and matches what the user typed
- Notes are preserved until explicitly cleared by the user

---

### UC4: Clear Task Notes

**Primary Actor**: User
**Goal**: Remove notes from a previous task to start fresh for a new topic

#### Stakeholders & Interests
- User: Wants to discard old notes without affecting the timer state
- System: Must clear only the notes content without touching timer or pomodoro count

#### Preconditions
- The notes area contains text
- Timer may be in any state

#### Trigger
User explicitly clears the notes area (e.g., selects all and deletes, or uses a clear button if provided).

#### Main Success Scenario
1. User selects all content in the notes area and deletes it (or uses a clear action).
2. System removes the notes content.
3. Notes area is now empty and ready for new input.
4. Timer state and pomodoro count are unaffected.

#### Postconditions
- Notes area is empty
- Timer state is unchanged

---

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
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

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
