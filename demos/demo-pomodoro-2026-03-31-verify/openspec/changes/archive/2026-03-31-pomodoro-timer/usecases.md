# Use Cases: pomodoro-timer

Generated: 2026-03-31

## Overview

This document captures the use cases for the pomodoro-timer change, following Cockburn's use case methodology. Two capabilities are being introduced: `timer-core` (countdown logic and session transitions) and `timer-ui` (the user-facing interface and controls).

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | Run a focused 25-minute work session |
| User | Take a 5-minute rest break |
| User | Pause and resume the timer mid-session |
| User | Reset the timer to start over |

---

## Use Cases

### UC1: Run a Work Session

**Primary Actor**: User
**Goal**: Complete a timed 25-minute focused work session

#### Stakeholders & Interests
- User: Wants to work in a focused, time-boxed block without manually watching the clock
- System: Must count down accurately and signal when the session ends

#### Preconditions
- The timer application is open
- No session is currently running (timer is idle or reset)

#### Trigger
User initiates the timer to begin a work session.

#### Main Success Scenario
1. User starts the timer.
2. System begins a 25-minute countdown in work mode.
3. System displays the remaining time, updating every second.
4. User works until the countdown completes.
5. System detects that the 25-minute session has ended.
6. System signals the end of the work session (visual and/or audio cue).
7. System transitions automatically to rest mode, showing a 5-minute rest timer ready to start.

#### Extensions
1a. Timer application is already in work mode with time remaining:
  1a1. System ignores the start action (timer is already running).

5a. User pauses the timer before it completes:
  5a1. System stops the countdown and preserves the remaining time.
  5a2. User resumes the timer.
  5a3. System continues the countdown from the preserved time. Resume at step 3.

5b. User resets the timer before it completes:
  5b1. System stops the countdown and returns to idle state with 25 minutes.
  5b2. Use case ends (goal not achieved).

#### Postconditions
- The work session is complete.
- System is in rest mode, showing a 5-minute timer ready to start.

---

### UC2: Take a Rest Break

**Primary Actor**: User
**Goal**: Complete a timed 5-minute rest break after a work session

#### Stakeholders & Interests
- User: Wants a short, defined break before the next work session
- System: Must count down the rest period and signal when it ends

#### Preconditions
- System is in rest mode (either transitioned automatically from UC1, or user manually switched to rest mode)
- Rest timer has not yet started

#### Trigger
User starts the rest timer.

#### Main Success Scenario
1. User starts the rest timer.
2. System begins a 5-minute countdown in rest mode.
3. System displays the remaining rest time, updating every second.
4. User rests until the countdown completes.
5. System detects that the 5-minute rest period has ended.
6. System signals the end of the rest break (visual and/or audio cue).
7. System transitions automatically to work mode, showing a 25-minute work timer ready to start.

#### Extensions
5a. User pauses the rest timer before it completes:
  5a1. System stops the countdown and preserves the remaining rest time.
  5a2. User resumes the rest timer.
  5a3. System continues the countdown from the preserved time. Resume at step 3.

5b. User resets the timer during rest:
  5b1. System stops the countdown and returns to idle state in rest mode with 5 minutes.
  5b2. Use case ends.

#### Postconditions
- The rest break is complete.
- System is in work mode, showing a 25-minute timer ready to start.

---

### UC3: Pause and Resume the Timer

**Primary Actor**: User
**Goal**: Temporarily suspend the current countdown and resume it later

#### Stakeholders & Interests
- User: Needs to step away briefly without losing progress on the current session
- System: Must preserve the remaining time accurately while paused

#### Preconditions
- A work or rest session is currently counting down

#### Trigger
User pauses the timer.

#### Main Success Scenario
1. User pauses the timer.
2. System stops the countdown and preserves the remaining time.
3. System displays the paused state visually (e.g., a "paused" indicator).
4. User is ready to resume.
5. User resumes the timer.
6. System resumes the countdown from the preserved remaining time.
7. System removes the paused indicator and continues normal countdown display.

#### Extensions
4a. User resets instead of resuming:
  4a1. System discards the preserved time and returns to the default duration for the current mode.
  4a2. Timer returns to idle state. Use case ends.

#### Postconditions
- The countdown continues from where it was paused.

---

### UC4: Reset the Timer

**Primary Actor**: User
**Goal**: Abandon the current session and return the timer to its initial state

#### Stakeholders & Interests
- User: Wants a clean slate to start fresh (e.g., after an interruption)
- System: Must restore the timer to the default duration for the current mode

#### Preconditions
- The timer is in any state: running, paused, or ended

#### Trigger
User resets the timer.

#### Main Success Scenario
1. User resets the timer.
2. System stops any active countdown.
3. System restores the timer to the default duration for the current mode (25 min for work, 5 min for rest).
4. System returns to the idle state, ready to start.

#### Extensions
_(none — reset always succeeds)_

#### Postconditions
- Timer is idle, showing the full default duration for the current mode.
- No session is in progress.

---

## Notes
- Use cases focus on intent, not UI mechanics (e.g., "User starts the timer" not "User clicks the Start button")
- Each use case maps directly to a testable scenario
- UC1 and UC2 are the primary sea-level goals; UC3 and UC4 are supporting subfunctions

---

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User starts the timer |
| UC1-S2 | System begins a 25-minute countdown in work mode |
| UC1-S3 | System displays remaining time, updating every second |
| UC1-S4 | User works until the countdown completes |
| UC1-S5 | System detects that the 25-minute session has ended |
| UC1-S6 | System signals end of work session (visual/audio cue) |
| UC1-S7 | System transitions automatically to rest mode with 5-minute timer ready |
| UC1-E1a1 | System ignores start action when timer is already running |
| UC1-E5a1 | System stops countdown and preserves remaining time (pause) |
| UC1-E5a2 | User resumes the timer |
| UC1-E5a3 | System continues countdown from preserved time |
| UC1-E5b1 | System stops countdown and resets to 25 minutes (reset during work) |
| UC2-S1 | User starts the rest timer |
| UC2-S2 | System begins a 5-minute countdown in rest mode |
| UC2-S3 | System displays remaining rest time, updating every second |
| UC2-S4 | User rests until the countdown completes |
| UC2-S5 | System detects that the 5-minute rest period has ended |
| UC2-S6 | System signals end of rest break (visual/audio cue) |
| UC2-S7 | System transitions automatically to work mode with 25-minute timer ready |
| UC2-E5a1 | System stops countdown and preserves remaining rest time (pause) |
| UC2-E5a2 | User resumes the rest timer |
| UC2-E5a3 | System continues rest countdown from preserved time |
| UC2-E5b1 | System stops countdown and resets to 5 minutes (reset during rest) |
| UC3-S1 | User pauses the timer |
| UC3-S2 | System stops countdown and preserves remaining time |
| UC3-S3 | System displays paused state visually |
| UC3-S4 | User is ready to resume |
| UC3-S5 | User resumes the timer |
| UC3-S6 | System resumes countdown from preserved remaining time |
| UC3-S7 | System removes paused indicator and continues countdown display |
| UC3-E4a1 | System discards preserved time and restores default duration |
| UC3-E4a2 | Timer returns to idle state |
| UC4-S1 | User resets the timer |
| UC4-S2 | System stops any active countdown |
| UC4-S3 | System restores default duration for current mode (25 min work / 5 min rest) |
| UC4-S4 | System returns to idle state, ready to start |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
