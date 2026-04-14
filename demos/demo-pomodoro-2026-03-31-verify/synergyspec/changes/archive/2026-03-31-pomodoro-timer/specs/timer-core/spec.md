# Spec: timer-core

Generated: 2026-03-31

## Overview
This spec implements requirements for the `timer-core` capability — the countdown logic, session state machine, and automatic mode transitions.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:

- UC1-S1: User starts the timer
- UC1-S2: System begins a 25-minute countdown in work mode
- UC1-S5: System detects that the 25-minute session has ended
- UC1-S7: System transitions automatically to rest mode with 5-minute timer ready
- UC1-E1a1: System ignores start action when timer is already running
- UC1-E5a1: System stops countdown and preserves remaining time (pause)
- UC1-E5a3: System continues countdown from preserved time
- UC1-E5b1: System stops countdown and resets to 25 minutes (reset during work)
- UC2-S1: User starts the rest timer
- UC2-S2: System begins a 5-minute countdown in rest mode
- UC2-S5: System detects that the 5-minute rest period has ended
- UC2-S7: System transitions automatically to work mode with 25-minute timer ready
- UC2-E5a1: System stops countdown and preserves remaining rest time (pause)
- UC2-E5a3: System continues rest countdown from preserved time
- UC2-E5b1: System stops countdown and resets to 5 minutes (reset during rest)
- UC3-S1: User pauses the timer
- UC3-S2: System stops countdown and preserves remaining time
- UC3-S5: User resumes the timer
- UC3-S6: System resumes countdown from preserved remaining time
- UC3-E4a1: System discards preserved time and restores default duration
- UC3-E4a2: Timer returns to idle state
- UC4-S1: User resets the timer
- UC4-S2: System stops any active countdown
- UC4-S3: System restores default duration for current mode (25 min work / 5 min rest)
- UC4-S4: System returns to idle state, ready to start

---

## ADDED Requirements

### Requirement: Work Session Duration
**Implements**: UC1-S2 - System begins a 25-minute countdown in work mode

The system SHALL initialize a work session with a duration of exactly 25 minutes (1500 seconds).

#### Scenario: Work session starts at full duration
- **WHEN** the timer is in work mode and the user starts it from idle
- **THEN** the system begins counting down from 1500 seconds

---

### Requirement: Rest Session Duration
**Implements**: UC2-S2 - System begins a 5-minute countdown in rest mode

The system SHALL initialize a rest session with a duration of exactly 5 minutes (300 seconds).

#### Scenario: Rest session starts at full duration
- **WHEN** the timer is in rest mode and the user starts it from idle
- **THEN** the system begins counting down from 300 seconds

---

### Requirement: Per-Second Countdown Tick
**Implements**: UC1-S3 - System displays remaining time, updating every second; UC2-S3 - System displays remaining rest time, updating every second

The system SHALL decrement the remaining time by one second on each tick while the timer is running.

#### Scenario: Countdown decrements every second
- **WHEN** the timer is in RUNNING state
- **THEN** the remaining seconds decrease by 1 each second until the timer reaches zero or is paused/reset

---

### Requirement: Session End Detection
**Implements**: UC1-S5 - System detects that the 25-minute session has ended; UC2-S5 - System detects that the 5-minute rest period has ended

The system SHALL detect when the remaining time reaches zero and transition to the ENDED state.

#### Scenario: Work session ends at zero
- **WHEN** the remaining seconds reach 0 during a work session
- **THEN** the system stops the countdown and sets status to ENDED

#### Scenario: Rest session ends at zero
- **WHEN** the remaining seconds reach 0 during a rest session
- **THEN** the system stops the countdown and sets status to ENDED

---

### Requirement: Automatic Mode Transition
**Implements**: UC1-S7 - System transitions automatically to rest mode with 5-minute timer ready; UC2-S7 - System transitions automatically to work mode with 25-minute timer ready

After a session ends, the system SHALL automatically switch to the opposite mode and reset to that mode's full duration, returning to IDLE state.

#### Scenario: Work session ends → transitions to rest
- **WHEN** a work session reaches ENDED
- **THEN** the system switches mode to rest, sets remaining time to 300 seconds, and returns to IDLE

#### Scenario: Rest session ends → transitions to work
- **WHEN** a rest session reaches ENDED
- **THEN** the system switches mode to work, sets remaining time to 1500 seconds, and returns to IDLE

---

### Requirement: Guard Against Double-Start
**Implements**: UC1-E1a1 - System ignores start action when timer is already running

The system SHALL ignore a start action when the timer is already in RUNNING state.

#### Scenario: Start while already running
- **WHEN** the user triggers a start action and the status is already RUNNING
- **THEN** the system takes no action and the countdown continues unaffected

---

### Requirement: Pause Preserves Remaining Time
**Implements**: UC1-E5a1 - System stops countdown and preserves remaining time (pause); UC2-E5a1 - System stops countdown and preserves remaining rest time (pause); UC3-S1 - User pauses the timer; UC3-S2 - System stops countdown and preserves remaining time

When the user pauses the timer, the system SHALL stop the countdown and preserve the exact remaining seconds in PAUSED state.

#### Scenario: Pause during work session
- **WHEN** the user pauses while status is RUNNING in work mode
- **THEN** the countdown stops and remainingSeconds is unchanged

#### Scenario: Pause during rest session
- **WHEN** the user pauses while status is RUNNING in rest mode
- **THEN** the countdown stops and remainingSeconds is unchanged

---

### Requirement: Resume from Preserved Time
**Implements**: UC1-E5a3 - System continues countdown from preserved time; UC2-E5a3 - System continues rest countdown from preserved time; UC3-S5 - User resumes the timer; UC3-S6 - System resumes countdown from preserved remaining time

When the user resumes the timer, the system SHALL restart the countdown from the preserved remaining seconds.

#### Scenario: Resume after pause
- **WHEN** the user resumes and status is PAUSED
- **THEN** the countdown restarts from the same remainingSeconds that was preserved at pause time

---

### Requirement: Reset Restores Default Duration
**Implements**: UC1-E5b1 - System stops countdown and resets to 25 minutes (reset during work); UC2-E5b1 - System stops countdown and resets to 5 minutes (reset during rest); UC3-E4a1 - System discards preserved time and restores default duration; UC4-S1 through UC4-S4

The system SHALL stop any active countdown and restore the current mode's default duration, returning to IDLE state.

#### Scenario: Reset during running work session
- **WHEN** the user resets while status is RUNNING in work mode
- **THEN** the countdown stops, remainingSeconds returns to 1500, and status becomes IDLE

#### Scenario: Reset during running rest session
- **WHEN** the user resets while status is RUNNING in rest mode
- **THEN** the countdown stops, remainingSeconds returns to 300, and status becomes IDLE

#### Scenario: Reset during paused session
- **WHEN** the user resets while status is PAUSED
- **THEN** the preserved time is discarded, remainingSeconds returns to the current mode's default, and status becomes IDLE

#### Scenario: Reset when already idle
- **WHEN** the user resets while status is IDLE
- **THEN** the system remains in IDLE with the full default duration for the current mode
