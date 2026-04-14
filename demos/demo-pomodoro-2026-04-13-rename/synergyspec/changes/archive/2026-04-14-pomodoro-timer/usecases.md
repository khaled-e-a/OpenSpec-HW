# Use Cases: pomodoro-timer

Generated: 2026-04-14

## Overview

This document captures the use cases for the pomodoro-timer change, following Cockburn's use case methodology. The system is a lightweight React-based Pomodoro timer supporting 25-minute work phases alternating with 5-minute rest phases.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | Complete a focused 25-minute work session followed by a 5-minute rest |
| User | Pause and resume an in-progress timer |
| User | Reset the timer back to the start of the current phase |

## Use Cases

### Use Case 1: Run a Pomodoro cycle
**Primary Actor**: User
**Goal**: Complete a work session followed by a rest break using the Pomodoro technique

#### Stakeholders & Interests
- User: Wants a reliable, distraction-free countdown that signals phase transitions
- System: Must accurately track elapsed time and transition phases without user intervention

#### Preconditions
- The application is loaded and the timer is in its initial idle state (work phase, 25:00 remaining)

#### Trigger
The user decides to begin a focused work session.

#### Main Success Scenario
1. User requests to start the timer.
2. System begins counting down the 25-minute work phase and displays remaining time.
3. System reaches zero on the work phase and notifies the user that work is complete.
4. System transitions to the 5-minute rest phase and begins counting down.
5. System reaches zero on the rest phase and notifies the user that rest is complete.
6. System returns to the idle work phase, ready for the next cycle.

#### Extensions
2a. User requests to pause the timer.
  2a1. System halts the countdown and retains the remaining time.
  2a2. User requests to resume; system continues counting from the retained time.
3a. User dismisses the end-of-work notification before rest begins.
  3a1. System proceeds to the rest phase regardless of dismissal.
5a. User dismisses the end-of-rest notification.
  5a1. System returns to idle work phase regardless of dismissal.

#### Postconditions
- One full Pomodoro cycle (work + rest) has been completed and the system is ready for another cycle.

---

### Use Case 2: Reset the current phase
**Primary Actor**: User
**Goal**: Return the timer to the beginning of the current phase without completing it

#### Stakeholders & Interests
- User: Wants the ability to restart a phase after an interruption

#### Preconditions
- The timer is running or paused in some phase (work or rest)

#### Trigger
The user decides the current session was interrupted and wants to start over.

#### Main Success Scenario
1. User requests to reset the timer.
2. System stops any active countdown.
3. System restores the remaining time to the full duration of the current phase.
4. System enters the idle state, awaiting a new start request.

#### Extensions
(none)

#### Postconditions
- The timer shows the full duration of the current phase and is not counting down.

---

## Notes
- Each use case focuses on a single, coherent goal
- UI details (buttons, layout) are deliberately omitted
- Extensions cover pause/resume and notification handling
- Use cases are testable — each scenario maps to verifiable behavior

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User requests to start the timer |
| UC1-S2 | System begins counting down the 25-minute work phase and displays remaining time |
| UC1-S3 | System reaches zero on the work phase and notifies the user that work is complete |
| UC1-S4 | System transitions to the 5-minute rest phase and begins counting down |
| UC1-S5 | System reaches zero on the rest phase and notifies the user that rest is complete |
| UC1-S6 | System returns to the idle work phase, ready for the next cycle |
| UC1-E2a | User requests to pause the timer |
| UC1-E2a1 | System halts the countdown and retains the remaining time |
| UC1-E2a2 | User requests to resume; system continues counting from the retained time |
| UC1-E3a | User dismisses the end-of-work notification before rest begins |
| UC1-E3a1 | System proceeds to the rest phase regardless of dismissal |
| UC1-E5a | User dismisses the end-of-rest notification |
| UC1-E5a1 | System returns to idle work phase regardless of dismissal |
| UC2-S1 | User requests to reset the timer |
| UC2-S2 | System stops any active countdown |
| UC2-S3 | System restores the remaining time to the full duration of the current phase |
| UC2-S4 | System enters the idle state, awaiting a new start request |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
