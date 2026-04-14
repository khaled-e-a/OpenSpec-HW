# Spec: timer-core

Generated: 2026-04-02

## Overview
This spec implements requirements for the timer-core capability — the countdown engine responsible for ticking, completing, pausing, and resetting timers. See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:
- UC1-S1: User starts the timer
- UC1-S2: System begins countdown from 25:00, displaying remaining time
- UC1-S4: User works while the timer counts down
- UC1-S5: System reaches 00:00 and notifies user that work session is complete
- UC1-E1a: User pauses the timer mid-session
- UC1-E1a1: System pauses countdown and holds current time
- UC1-E1a2: User resumes; System continues countdown from paused time
- UC1-E1b: User resets the timer mid-session
- UC1-E1b1: System stops countdown and resets time to 25:00; count not incremented
- UC2-S2: User rests while the timer counts down
- UC2-S3: System reaches 00:00 and notifies user that short rest is over
- UC3-S2: User takes extended break while the timer counts down
- UC3-S3: System reaches 00:00 and notifies user that long rest is over
- UC4-S1: User presses Pause during active session
- UC4-S2: System stops countdown and retains remaining time
- UC4-S4: User presses Resume
- UC4-S5: System resumes counting down from retained time
- UC4-E4a: User resets instead of resuming
- UC4-E4a1: System discards paused state and returns to session initial time
- UC5-S1: User presses Reset
- UC5-S2: System stops any active countdown
- UC5-S3: System returns displayed time to full duration of current session type
- UC5-S5: System enters idle state, ready to start again

---

## ADDED Requirements

### Requirement: Start countdown
**Implements**: UC1-S1 - User starts the timer; UC1-S2 - System begins countdown from 25:00, displaying remaining time
The system SHALL begin a countdown from the full duration of the current session type when the user initiates a start action, updating the displayed remaining time each second.

#### Scenario: Start from idle work session
- **WHEN** the timer is in idle state with session type "Work"
- **THEN** system starts counting down from 25:00, decrementing by one second each tick

#### Scenario: Start from idle short rest
- **WHEN** the timer is in idle state with session type "Short Rest"
- **THEN** system starts counting down from 05:00

#### Scenario: Start from idle long rest
- **WHEN** the timer is in idle state with session type "Long Rest"
- **THEN** system starts counting down from 10:00

---

### Requirement: Tick and display remaining time
**Implements**: UC1-S2 - System begins countdown from 25:00, displaying remaining time; UC1-S4 - User works while the timer counts down
The system SHALL update the displayed remaining time once per second during an active countdown, using wall-clock drift correction to ensure accuracy over long durations.

#### Scenario: Accurate tick during active countdown
- **WHEN** the timer is running
- **THEN** the displayed time decrements by 1 second each tick and matches wall-clock elapsed time

#### Scenario: Drift correction
- **WHEN** the interval fires late due to browser throttling
- **THEN** remaining time is recalculated as `initialSeconds - floor((now - startedAt) / 1000)`, not simply `remaining - 1`

---

### Requirement: Complete session at zero
**Implements**: UC1-S5 - System reaches 00:00 and notifies user that work session is complete; UC2-S3 - System notifies user short rest is over; UC3-S3 - System notifies user long rest is over
The system SHALL stop the countdown and fire a session-complete event when remaining time reaches 0.

#### Scenario: Work session reaches zero
- **WHEN** the work session countdown reaches 00:00
- **THEN** system stops the interval, sets remaining time to 0, and emits a "session-complete" event with session type "Work"

#### Scenario: Short rest reaches zero
- **WHEN** the short rest countdown reaches 00:00
- **THEN** system emits a "session-complete" event with session type "Short Rest"

#### Scenario: Long rest reaches zero
- **WHEN** the long rest countdown reaches 00:00
- **THEN** system emits a "session-complete" event with session type "Long Rest"

---

### Requirement: Pause countdown
**Implements**: UC1-E1a1 - System pauses countdown and holds current time; UC4-S1 - User presses Pause; UC4-S2 - System stops countdown and retains remaining time
The system SHALL halt the countdown and preserve the current remaining time when a pause action is received while the timer is running.

#### Scenario: Pause during active countdown
- **WHEN** user triggers pause while the timer is running
- **THEN** system clears the interval and retains the current `remainingSeconds` value

#### Scenario: Pause is idempotent when already paused
- **WHEN** user triggers pause while the timer is already paused
- **THEN** system takes no action and remaining time is unchanged

---

### Requirement: Resume from paused state
**Implements**: UC1-E1a2 - User resumes; System continues countdown from paused time; UC4-S4 - User presses Resume; UC4-S5 - System resumes counting down from retained time
The system SHALL restart the countdown from the retained remaining time when a resume action is received while the timer is paused.

#### Scenario: Resume continues from pause point
- **WHEN** user triggers resume while the timer is paused with N seconds remaining
- **THEN** system restarts the interval treating N seconds as the new initial duration, resetting `startedAt` to now

#### Scenario: Resume is idempotent when already running
- **WHEN** user triggers resume while the timer is already running
- **THEN** system takes no action

---

### Requirement: Reset timer
**Implements**: UC1-E1b1 - System stops countdown and resets time; UC4-E4a1 - System discards paused state and returns to session initial time; UC5-S1 - User presses Reset; UC5-S2 - System stops any active countdown; UC5-S3 - System returns displayed time to full duration of current session type; UC5-S5 - System enters idle state
The system SHALL stop any active countdown and restore the remaining time to the full duration of the current session type when a reset action is received. The pomodoro count SHALL NOT be modified.

#### Scenario: Reset during active countdown
- **WHEN** user triggers reset while the timer is running
- **THEN** system clears the interval and sets remaining time back to the session's full duration

#### Scenario: Reset from paused state
- **WHEN** user triggers reset while the timer is paused
- **THEN** system discards the paused remaining time and restores full session duration

#### Scenario: Reset does not change pomodoro count
- **WHEN** user triggers reset at any point during a work session
- **THEN** the completed pomodoro count is unchanged
