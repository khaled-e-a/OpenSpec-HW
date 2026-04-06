# Use Cases: simple-pomodoro-timer

Generated: 2026-04-02

## Overview

This document captures the use cases for the simple-pomodoro-timer change, following Cockburn's use case methodology. The timer supports three session types: work (25 min), short rest (5 min), and long rest (10 min), cycling automatically through a Pomodoro sequence.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | Run a focused work session using the Pomodoro technique |
| User | Pause and resume an active timer when interrupted |
| User | Reset the timer to start fresh |
| User | Follow the Pomodoro cycle through work and rest intervals |

---

## Use Cases

### UC1: Run a Pomodoro Work Session

**Primary Actor**: User
**Goal**: Complete a 25-minute focused work session with timer guidance

#### Stakeholders & Interests
- User: Wants to track focused work time with clear visual feedback and automatic session transitions
- System: Must accurately count down 25 minutes and signal completion

#### Preconditions
- The application is loaded and showing the initial timer state
- No session is currently running

#### Trigger
User initiates a work session by starting the timer

#### Main Success Scenario
1. User starts the timer to begin a 25-minute work session
2. System begins countdown from 25:00, updating the display each second
3. System shows the current session type as "Work"
4. User works uninterrupted while the timer counts down
5. System reaches 00:00 and signals session completion (e.g., sound/visual alert)
6. System records the completed Pomodoro and advances to the next session in the cycle

#### Extensions
5a. Timer reaches 00:00 while user is away:
  5a1. System continues to show the completion state until the user acknowledges

#### Postconditions
- One Pomodoro is recorded as complete
- System is ready to start the next session (short rest or long rest)

---

### UC2: Pause and Resume the Timer

**Primary Actor**: User
**Goal**: Temporarily halt the countdown and resume it from the same point

#### Stakeholders & Interests
- User: Wants to handle an unexpected interruption without losing progress
- System: Must preserve exact elapsed time so the remaining countdown is accurate on resume

#### Preconditions
- A session (work, short rest, or long rest) is actively counting down

#### Trigger
User pauses the timer due to an interruption

#### Main Success Scenario
1. User pauses the running timer
2. System halts the countdown and preserves the remaining time
3. System displays a "Paused" indicator alongside the frozen countdown
4. User handles the interruption
5. User resumes the timer
6. System restarts the countdown from the preserved remaining time
7. System removes the "Paused" indicator and resumes normal display

#### Extensions
2a. User pauses immediately after starting:
  2a1. System halts at near-full time; behavior is identical to any other pause

#### Postconditions
- Timer is running again from the remaining time at the point of pause
- No time has been lost or added due to the pause

---

### UC3: Reset the Timer

**Primary Actor**: User
**Goal**: Abandon the current session and return the timer to its initial state

#### Stakeholders & Interests
- User: Wants to start over cleanly without accumulated state from previous attempts
- System: Must fully reset countdown, session type, and Pomodoro count to defaults

#### Preconditions
- The application is loaded (timer may be running, paused, or idle)

#### Trigger
User decides to abandon the current session and start fresh

#### Main Success Scenario
1. User resets the timer
2. System stops any active countdown
3. System resets the display to the initial work session duration (25:00)
4. System resets the session type to "Work"
5. System resets the completed Pomodoro count to zero

#### Extensions
1a. User resets while the timer is already idle:
  1a1. System performs the reset with no visible change (idempotent)

#### Postconditions
- Timer shows 25:00, session type is "Work", Pomodoro count is 0
- System is ready for a fresh start

---

### UC4: Progress Through the Pomodoro Cycle

**Primary Actor**: User
**Goal**: Complete a full Pomodoro cycle (4 work sessions with rests) with automatic session transitions

#### Stakeholders & Interests
- User: Wants the system to guide them through the cycle without manual configuration between sessions
- System: Must correctly sequence work → short rest → work → short rest → work → short rest → work → long rest

#### Preconditions
- Application is in its initial state (or reset)
- User is beginning a new Pomodoro cycle

#### Trigger
User starts the first work session of a new cycle

#### Main Success Scenario
1. User completes Pomodoro #1 (25-min work session) — system advances to short rest
2. System starts a 5-minute short rest countdown and shows "Short Rest"
3. User completes the short rest — system advances to Pomodoro #2
4. User completes Pomodoros #2 and #3, each followed by a 5-minute short rest
5. User completes Pomodoro #4 — system advances to long rest
6. System starts a 10-minute long rest countdown and shows "Long Rest"
7. User completes the long rest — system resets the Pomodoro counter and is ready for a new cycle

#### Extensions
3a. User skips a rest session:
  3a1. User manually starts the next work session early; system advances the cycle accordingly

#### Postconditions
- All 4 Pomodoros and their associated rests are complete
- System is ready to begin the next full cycle from Pomodoro #1

---

## Notes
- Use cases focus on user intent, not specific button labels or UI layout
- Each use case maps to testable scenarios
- The cycle in UC4 is: Work → ShortRest → Work → ShortRest → Work → ShortRest → Work → LongRest (repeating)

---

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User starts the timer to begin a 25-minute work session |
| UC1-S2 | System begins countdown from 25:00, updating the display each second |
| UC1-S3 | System shows the current session type as "Work" |
| UC1-S4 | User works uninterrupted while the timer counts down |
| UC1-S5 | System reaches 00:00 and signals session completion |
| UC1-S6 | System records the completed Pomodoro and advances to the next session |
| UC1-E5a | Timer reaches 00:00 while user is away; system holds completion state |
| UC2-S1 | User pauses the running timer |
| UC2-S2 | System halts the countdown and preserves the remaining time |
| UC2-S3 | System displays a "Paused" indicator alongside the frozen countdown |
| UC2-S4 | User handles the interruption |
| UC2-S5 | User resumes the timer |
| UC2-S6 | System restarts the countdown from the preserved remaining time |
| UC2-S7 | System removes the "Paused" indicator and resumes normal display |
| UC2-E2a | User pauses immediately after starting; system halts at near-full time |
| UC3-S1 | User resets the timer |
| UC3-S2 | System stops any active countdown |
| UC3-S3 | System resets the display to the initial work session duration (25:00) |
| UC3-S4 | System resets the session type to "Work" |
| UC3-S5 | System resets the completed Pomodoro count to zero |
| UC3-E1a | User resets while the timer is already idle; system performs idempotent reset |
| UC4-S1 | User completes Pomodoro #1; system advances to short rest |
| UC4-S2 | System starts a 5-minute short rest countdown and shows "Short Rest" |
| UC4-S3 | User completes the short rest; system advances to Pomodoro #2 |
| UC4-S4 | User completes Pomodoros #2 and #3, each followed by a 5-minute short rest |
| UC4-S5 | User completes Pomodoro #4; system advances to long rest |
| UC4-S6 | System starts a 10-minute long rest countdown and shows "Long Rest" |
| UC4-S7 | User completes the long rest; system resets counter and readies new cycle |
| UC4-E3a | User skips a rest session; system advances the cycle accordingly |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
