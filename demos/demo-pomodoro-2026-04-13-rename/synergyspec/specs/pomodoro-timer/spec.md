# Spec: pomodoro-timer

## Overview

This spec defines requirements for the `pomodoro-timer` capability: a React application that alternates 25-minute work phases with 5-minute rest phases, with start/pause/reset controls and end-of-phase notifications.

See `usecases.md` "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability

This spec implements the following use case steps:
- UC1-S1: User requests to start the timer
- UC1-S2: System begins counting down the 25-minute work phase and displays remaining time
- UC1-S3: System reaches zero on the work phase and notifies the user that work is complete
- UC1-S4: System transitions to the 5-minute rest phase and begins counting down
- UC1-S5: System reaches zero on the rest phase and notifies the user that rest is complete
- UC1-S6: System returns to the idle work phase, ready for the next cycle
- UC1-E2a: User requests to pause the timer
- UC1-E2a1: System halts the countdown and retains the remaining time
- UC1-E2a2: User requests to resume; system continues counting from the retained time
- UC1-E3a: User dismisses the end-of-work notification before rest begins
- UC1-E3a1: System proceeds to the rest phase regardless of dismissal
- UC1-E5a: User dismisses the end-of-rest notification
- UC1-E5a1: System returns to idle work phase regardless of dismissal
- UC2-S1: User requests to reset the timer
- UC2-S2: System stops any active countdown
- UC2-S3: System restores the remaining time to the full duration of the current phase
- UC2-S4: System enters the idle state, awaiting a new start request

## Requirements

### Requirement: Start the timer
**Implements**: UC1-S1 - User requests to start the timer
The system SHALL provide a control that, when activated by the user while the timer is idle or paused, transitions the timer to a running state and begins counting down the current phase.

#### Scenario: Start from idle work phase
- **WHEN** the timer is idle in the work phase with 25:00 remaining and the user activates the start control
- **THEN** the system transitions to the running state and begins decrementing the remaining time once per second

#### Scenario: Start ignored while already running
- **WHEN** the timer is already running and the user activates the start control
- **THEN** the system makes no state change

---

### Requirement: Run the work countdown
**Implements**: UC1-S2 - System begins counting down the 25-minute work phase and displays remaining time
The system SHALL decrement the remaining work time by one second each second while in the running state, and SHALL display the remaining time in `mm:ss` format along with a label indicating the current phase is "Work".

#### Scenario: Remaining time updates every second
- **WHEN** the timer has been running in the work phase for N seconds
- **THEN** the displayed remaining time equals `25:00 - N seconds`

#### Scenario: Work phase label visible
- **WHEN** the timer is in the work phase (running, paused, or idle)
- **THEN** the display shows a label identifying the current phase as "Work"

---

### Requirement: Notify at end of work phase
**Implements**: UC1-S3 - System reaches zero on the work phase and notifies the user that work is complete
The system SHALL emit an end-of-phase notification (audible signal and visible phase indicator change) when the work phase countdown reaches zero.

#### Scenario: Work phase completes
- **WHEN** the remaining time in the work phase reaches 00:00
- **THEN** the system plays a short audible signal and updates the display to reflect the upcoming rest phase

---

### Requirement: Transition to rest phase
**Implements**: UC1-S4 - System transitions to the 5-minute rest phase and begins counting down
Upon work-phase completion, the system SHALL automatically switch the current phase to "Rest", set the remaining time to 5:00, and continue running without user intervention.

#### Scenario: Auto-transition from work to rest
- **WHEN** the work phase reaches 00:00
- **THEN** the system sets phase to "Rest", remaining time to 5:00, and continues decrementing once per second

---

### Requirement: Notify at end of rest phase
**Implements**: UC1-S5 - System reaches zero on the rest phase and notifies the user that rest is complete
The system SHALL emit an end-of-phase notification when the rest phase countdown reaches zero.

#### Scenario: Rest phase completes
- **WHEN** the remaining time in the rest phase reaches 00:00
- **THEN** the system plays a short audible signal and updates the display to reflect the next work phase

---

### Requirement: Return to idle work phase after rest
**Implements**: UC1-S6 - System returns to the idle work phase, ready for the next cycle
After the rest phase completes, the system SHALL set the phase to "Work", restore the remaining time to 25:00, and enter the idle (not-running) state awaiting a new start request.

#### Scenario: Cycle ends, system awaits next start
- **WHEN** the rest phase reaches 00:00 and the notification has fired
- **THEN** the system sets phase to "Work", remaining time to 25:00, and status to idle

---

### Requirement: Pause the timer
**Implements**: UC1-E2a - User requests to pause the timer; UC1-E2a1 - System halts the countdown and retains the remaining time
The system SHALL provide a control that, when activated while the timer is running, halts the countdown and retains the current remaining time and current phase.

#### Scenario: Pause mid-work
- **GIVEN** the timer is running in the work phase with 18:32 remaining
- **WHEN** the user activates the pause control
- **THEN** the system stops decrementing and continues to display 18:32 in the work phase

---

### Requirement: Resume the timer
**Implements**: UC1-E2a2 - User requests to resume; system continues counting from the retained time
The system SHALL provide a control that, when activated while the timer is paused, resumes the countdown from the retained remaining time in the retained phase.

#### Scenario: Resume after pause
- **GIVEN** the timer is paused in the work phase with 18:32 remaining
- **WHEN** the user activates the resume control
- **THEN** the system continues decrementing from 18:32 once per second

---

### Requirement: Non-blocking end-of-phase notification
**Implements**: UC1-E3a - User dismisses the end-of-work notification before rest begins; UC1-E3a1 - System proceeds to the rest phase regardless of dismissal; UC1-E5a - User dismisses the end-of-rest notification; UC1-E5a1 - System returns to idle work phase regardless of dismissal
The system SHALL present end-of-phase notifications in a non-blocking manner. Phase transitions SHALL occur independently of any user interaction with the notification.

#### Scenario: Phase transition does not wait for dismissal
- **WHEN** a phase reaches 00:00 and the notification fires
- **THEN** the system immediately performs the phase transition without waiting for user acknowledgment

---

### Requirement: Reset the current phase
**Implements**: UC2-S1 - User requests to reset the timer; UC2-S2 - System stops any active countdown; UC2-S3 - System restores the remaining time to the full duration of the current phase; UC2-S4 - System enters the idle state, awaiting a new start request
The system SHALL provide a control that, when activated, stops any active countdown, restores the remaining time to the full duration of the current phase (25:00 for work, 5:00 for rest), and places the timer in the idle state.

#### Scenario: Reset while running in work phase
- **GIVEN** the timer is running in the work phase with 12:04 remaining
- **WHEN** the user activates the reset control
- **THEN** the system stops the countdown, sets remaining time to 25:00, and enters the idle state in the work phase

#### Scenario: Reset while paused in rest phase
- **GIVEN** the timer is paused in the rest phase with 02:18 remaining
- **WHEN** the user activates the reset control
- **THEN** the system sets remaining time to 5:00 and enters the idle state in the rest phase
