# Spec: timer-core (delta)

Generated: 2026-04-01

## Overview
Delta spec for the `timer-core` capability — updates duration requirements from 25 min/5 min to 30 min/15 min.
See usecases.md "Use Case Traceability Mapping" for the complete list of use case steps.

## Use Case Traceability
This delta spec modifies requirements for the following use case steps:

- UC1-S2: System begins a 30-minute countdown in work mode
- UC1-S3: System displays remaining time starting from 30:00, updating every second
- UC1-S5: System detects that the 30-minute session has ended
- UC1-S7: System transitions automatically to rest mode with 15-minute timer ready
- UC2-S2: System begins a 15-minute countdown in rest mode
- UC2-S5: System detects that the 15-minute rest period has ended
- UC2-S7: System transitions automatically to work mode with 30-minute timer ready

---

## MODIFIED Requirements

### Requirement: Work Session Duration
**Implements**: UC1-S2 - System begins a 30-minute countdown in work mode

The system SHALL initialize a work session with a duration of exactly 30 minutes (1800 seconds).

#### Scenario: Work session starts at full duration
- **WHEN** the timer is in work mode and the user starts it from idle
- **THEN** the system begins counting down from 1800 seconds

---

### Requirement: Rest Session Duration
**Implements**: UC2-S2 - System begins a 15-minute countdown in rest mode

The system SHALL initialize a rest session with a duration of exactly 15 minutes (900 seconds).

#### Scenario: Rest session starts at full duration
- **WHEN** the timer is in rest mode and the user starts it from idle
- **THEN** the system begins counting down from 900 seconds

---

### Requirement: Automatic Mode Transition
**Implements**: UC1-S7 - System transitions automatically to rest mode with 15-minute timer ready; UC2-S7 - System transitions automatically to work mode with 30-minute timer ready

After a session ends, the system SHALL automatically switch to the opposite mode and reset to that mode's full duration, returning to IDLE state.

#### Scenario: Work session ends → transitions to rest
- **WHEN** a work session reaches ENDED
- **THEN** the system switches mode to rest, sets remaining time to 900 seconds, and returns to IDLE

#### Scenario: Rest session ends → transitions to work
- **WHEN** a rest session reaches ENDED
- **THEN** the system switches mode to work, sets remaining time to 1800 seconds, and returns to IDLE

---

### Requirement: Reset Restores Default Duration
**Implements**: UC1-S5 - System detects that the 30-minute session has ended; UC2-S5 - System detects that the 15-minute rest period has ended; UC3-E4a1 - System discards preserved time and restores default duration; UC4-S1 through UC4-S4

The system SHALL stop any active countdown and restore the current mode's default duration, returning to IDLE state.

#### Scenario: Reset during running work session
- **WHEN** the user resets while status is RUNNING in work mode
- **THEN** the countdown stops, remainingSeconds returns to 1800, and status becomes IDLE

#### Scenario: Reset during running rest session
- **WHEN** the user resets while status is RUNNING in rest mode
- **THEN** the countdown stops, remainingSeconds returns to 900, and status becomes IDLE

#### Scenario: Reset during paused session
- **WHEN** the user resets while status is PAUSED
- **THEN** the preserved time is discarded, remainingSeconds returns to the current mode's default, and status becomes IDLE

#### Scenario: Reset when already idle
- **WHEN** the user resets while status is IDLE
- **THEN** the system remains in IDLE with the full default duration for the current mode
