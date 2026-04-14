# Spec: session-management

Generated: 2026-04-02

## Overview
Delta spec for session-management — updates the fixed session duration constants for Work Session (25 min → 30 min) and Long Rest (10 min → 25 min). Short Rest remains unchanged.
See usecases.md "Use Case Traceability Mapping" for the complete list of use case steps.

## Use Case Traceability
This delta implements the following use case steps:
- UC1-S2: System begins countdown from 30:00, displaying remaining time
- UC1-S4: User works while the timer counts down for 30 minutes
- UC1-E4b1: System stops countdown and resets to 30:00; pomodoro count not incremented
- UC2-S1: System displays "Long Rest" label and starts countdown from 25:00
- UC2-S2: User takes extended break while the timer counts down
- UC1-S7: System transitions to the appropriate rest session (Long Rest duration now 25 min)

---

## MODIFIED Requirements

### Requirement: Session durations are fixed constants
**Implements**: UC1-S2 - System begins countdown from 30:00, displaying remaining time; UC2-S1 - System displays "Long Rest" label and starts countdown from 25:00; UC1-S4 - User works while the timer counts down for 30 minutes
The system SHALL use fixed, non-configurable durations for each session type:
- Work Session: 30 minutes (1800 seconds)
- Short Rest: 5 minutes (300 seconds)
- Long Rest: 25 minutes (1500 seconds)

#### Scenario: Work session duration
- **WHEN** a Work Session starts
- **THEN** the initial countdown is exactly 30:00 (1800 seconds)

#### Scenario: Short Rest duration
- **WHEN** a Short Rest starts
- **THEN** the initial countdown is exactly 05:00 (300 seconds)

#### Scenario: Long Rest duration
- **WHEN** a Long Rest starts
- **THEN** the initial countdown is exactly 25:00 (1500 seconds)

---

## MODIFIED Requirements

### Requirement: Determine next session type after work session
**Implements**: UC1-S7 - System transitions to the appropriate rest session; UC1-E7a - Pomodoro count is a multiple of 4; UC1-E7a1 - System transitions to Long Rest (25 min) instead of Short Rest
After a work session completes, the system SHALL determine the next session type: Long Rest if the updated pomodoro count is a multiple of 4, otherwise Short Rest.

#### Scenario: Transition to Short Rest (non-multiple of 4)
- **WHEN** a work session completes and the updated pomodoro count is NOT a multiple of 4
- **THEN** next session type is set to "Short Rest" (5 minutes)

#### Scenario: Transition to Long Rest (multiple of 4)
- **WHEN** a work session completes and the updated pomodoro count IS a multiple of 4 (e.g., 4, 8, 12)
- **THEN** next session type is set to "Long Rest" (25 minutes)

#### Scenario: Fourth pomodoro triggers Long Rest
- **WHEN** the 4th work session completes
- **THEN** next session type is "Long Rest" (25 minutes)

#### Scenario: First three pomodoros trigger Short Rest
- **WHEN** the 1st, 2nd, or 3rd work session completes
- **THEN** next session type is "Short Rest"
