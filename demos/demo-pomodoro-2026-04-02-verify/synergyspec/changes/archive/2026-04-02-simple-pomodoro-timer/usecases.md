# Use Cases: simple-pomodoro-timer

Generated: 2026-04-02

## Overview

This document captures the use cases for the simple-pomodoro-timer change, following Cockburn's use case methodology. The timer supports work sessions (25 min), short rests (5 min), and long rests (10 min), cycling through sessions automatically and tracking completed pomodoro counts.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | Run a focused work session using the Pomodoro Technique |
| User | Take a short rest between work sessions |
| User | Take a long rest after completing four work sessions |
| User | Pause and resume the timer mid-session |
| User | Reset the timer to start over |

---

## Use Cases

### UC1: Run a Pomodoro Work Session

**Primary Actor**: User
**Goal**: Complete a focused 25-minute work session with timer feedback

#### Stakeholders & Interests
- User: Wants to focus for a defined period and be notified when time is up
- System: Must count down accurately and track completed sessions

#### Preconditions
- The application is loaded and idle (no session in progress)
- Session type is set to "Work" (25 minutes)

#### Trigger
User starts the timer to begin a work session.

#### Main Success Scenario
1. User starts the timer.
2. System begins counting down from 25:00, displaying elapsed seconds.
3. System shows the current session label ("Work Session") and remaining time.
4. User works while the timer counts down.
5. System reaches 00:00 and notifies the user that the work session is complete.
6. System increments the completed pomodoro count by 1.
7. System determines the next session type based on the pomodoro count and transitions to the appropriate rest.

#### Extensions
1a. User pauses the timer mid-session:
  1a1. System pauses the countdown and holds the current time.
  1a2. User resumes; System continues counting down from the paused time.

1b. User resets the timer mid-session:
  1b1. System stops the countdown and resets time to 25:00.
  1b2. Pomodoro count is not incremented.

7a. Pomodoro count is a multiple of 4 (4th, 8th, …):
  7a1. System transitions to "Long Rest" (10 minutes) instead of "Short Rest".

#### Postconditions
- Pomodoro count has been incremented
- System is in rest mode (short or long) awaiting next user action

---

### UC2: Take a Short Rest

**Primary Actor**: User
**Goal**: Take a 5-minute break after a work session

#### Stakeholders & Interests
- User: Wants a brief, timed break before the next work session
- System: Must count down 5 minutes and signal return to work

#### Preconditions
- A work session has just completed (or user manually selects short rest)
- Completed pomodoro count is NOT a multiple of 4

#### Trigger
System transitions to short rest mode after a work session completes, or user manually initiates a short rest.

#### Main Success Scenario
1. System displays "Short Rest" label and starts countdown from 05:00.
2. User rests while the timer counts down.
3. System reaches 00:00 and notifies the user that the short rest is over.
4. System transitions back to "Work Session" mode, ready to start a new pomodoro.

#### Extensions
2a. User skips the rest early:
  2a1. User resets the timer.
  2a2. System transitions to the next work session without completing the rest countdown.

#### Postconditions
- System is in "Work Session" mode, idle and ready to start

---

### UC3: Take a Long Rest

**Primary Actor**: User
**Goal**: Take a 10-minute break after completing four consecutive work sessions

#### Stakeholders & Interests
- User: Wants a longer recovery break after a full cycle of 4 pomodoros
- System: Must count down 10 minutes and reset the cycle counter

#### Preconditions
- The 4th (or Nth multiple of 4) work session has just completed

#### Trigger
System automatically transitions to long rest mode after every 4th completed pomodoro.

#### Main Success Scenario
1. System displays "Long Rest" label and starts countdown from 10:00.
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

### UC4: Pause and Resume the Timer

**Primary Actor**: User
**Goal**: Temporarily pause an active countdown and resume from the same point

#### Stakeholders & Interests
- User: Wants to handle an interruption without losing session progress
- System: Must preserve the remaining time accurately across pause/resume

#### Preconditions
- A timer session is actively counting down

#### Trigger
User presses the Pause button during an active session.

#### Main Success Scenario
1. User presses Pause.
2. System stops the countdown and retains the remaining time.
3. System displays the paused state visually (e.g., "Paused" indicator).
4. User presses Resume when ready.
5. System resumes counting down from the retained time.

#### Extensions
4a. User resets instead of resuming:
  4a1. System discards the paused state and returns to the session's initial time.

#### Postconditions
- Timer is running again from the same point it was paused, OR timer has been reset

---

### UC5: Reset the Timer

**Primary Actor**: User
**Goal**: Abandon the current session and return the timer to its initial state

#### Stakeholders & Interests
- User: Wants to start fresh without completing the current session
- System: Must not count an incomplete session as a completed pomodoro

#### Preconditions
- A timer is in any state: running, paused, or at session end

#### Trigger
User presses the Reset button.

#### Main Success Scenario
1. User presses Reset.
2. System stops any active countdown.
3. System returns the displayed time to the full duration of the current session type.
4. Completed pomodoro count remains unchanged.
5. System enters idle state, ready to start again.

#### Postconditions
- Timer displays the full duration for the current session type
- No new pomodoro was counted

---

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User starts the timer |
| UC1-S2 | System begins countdown from 25:00, displaying remaining time |
| UC1-S3 | System shows current session label ("Work Session") and remaining time |
| UC1-S4 | User works while the timer counts down |
| UC1-S5 | System reaches 00:00 and notifies user that work session is complete |
| UC1-S6 | System increments the completed pomodoro count by 1 |
| UC1-S7 | System determines next session type and transitions to appropriate rest |
| UC1-E1a | User pauses the timer mid-session |
| UC1-E1a1 | System pauses countdown and holds current time |
| UC1-E1a2 | User resumes; System continues countdown from paused time |
| UC1-E1b | User resets the timer mid-session |
| UC1-E1b1 | System stops countdown and resets time to 25:00; count not incremented |
| UC1-E7a | Pomodoro count is a multiple of 4 |
| UC1-E7a1 | System transitions to Long Rest (10 min) instead of Short Rest |
| UC2-S1 | System displays "Short Rest" label and starts countdown from 05:00 |
| UC2-S2 | User rests while the timer counts down |
| UC2-S3 | System reaches 00:00 and notifies user that short rest is over |
| UC2-S4 | System transitions back to "Work Session" mode, ready to start |
| UC2-E2a | User skips the rest early by resetting |
| UC2-E2a1 | System transitions to next work session without completing rest countdown |
| UC3-S1 | System displays "Long Rest" label and starts countdown from 10:00 |
| UC3-S2 | User takes extended break while the timer counts down |
| UC3-S3 | System reaches 00:00 and notifies user that long rest is over |
| UC3-S4 | System transitions back to "Work Session" mode for next cycle |
| UC3-E2a | User skips the long rest early by resetting |
| UC3-E2a1 | System transitions to next work session immediately |
| UC4-S1 | User presses Pause during active session |
| UC4-S2 | System stops countdown and retains remaining time |
| UC4-S3 | System displays paused state visually |
| UC4-S4 | User presses Resume |
| UC4-S5 | System resumes counting down from retained time |
| UC4-E4a | User resets instead of resuming |
| UC4-E4a1 | System discards paused state and returns to session initial time |
| UC5-S1 | User presses Reset |
| UC5-S2 | System stops any active countdown |
| UC5-S3 | System returns displayed time to full duration of current session type |
| UC5-S4 | Completed pomodoro count remains unchanged |
| UC5-S5 | System enters idle state, ready to start again |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
