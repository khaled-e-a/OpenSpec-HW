# Spec: session-management

Generated: 2026-04-02

## Overview
This spec implements requirements for the session-management capability — the logic that tracks completed pomodoro cycles and determines which session type follows each completed session. See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:
- UC1-S6: System increments the completed pomodoro count by 1
- UC1-S7: System determines next session type and transitions to appropriate rest
- UC1-E7a: Pomodoro count is a multiple of 4
- UC1-E7a1: System transitions to Long Rest (10 min) instead of Short Rest
- UC2-S1: System displays "Short Rest" label and starts countdown from 05:00
- UC2-S4: System transitions back to "Work Session" mode, ready to start
- UC2-E2a: User skips the rest early by resetting
- UC2-E2a1: System transitions to next work session without completing rest countdown
- UC3-S1: System displays "Long Rest" label and starts countdown from 10:00
- UC3-S4: System transitions back to "Work Session" mode for next cycle
- UC3-E2a: User skips the long rest early by resetting
- UC3-E2a1: System transitions to next work session immediately
- UC5-S4: Completed pomodoro count remains unchanged on reset

---

## ADDED Requirements

### Requirement: Increment pomodoro count on work session completion
**Implements**: UC1-S6 - System increments the completed pomodoro count by 1
The system SHALL increment the completed pomodoro count by exactly 1 each time a work session completes naturally (reaches 00:00).

#### Scenario: Count increments on natural work session completion
- **WHEN** a work session countdown reaches 00:00
- **THEN** the completed pomodoro count increases by 1

#### Scenario: Count does not increment when session is reset
- **WHEN** the user resets the timer before the work session reaches 00:00
- **THEN** the completed pomodoro count is unchanged

---

### Requirement: Determine next session type after work session
**Implements**: UC1-S7 - System determines next session type and transitions to appropriate rest; UC1-E7a - Pomodoro count is a multiple of 4; UC1-E7a1 - System transitions to Long Rest (10 min) instead of Short Rest
After a work session completes, the system SHALL determine the next session type: Long Rest if the updated pomodoro count is a multiple of 4, otherwise Short Rest.

#### Scenario: Transition to Short Rest (non-multiple of 4)
- **WHEN** a work session completes and the updated pomodoro count is NOT a multiple of 4
- **THEN** next session type is set to "Short Rest" (5 minutes)

#### Scenario: Transition to Long Rest (multiple of 4)
- **WHEN** a work session completes and the updated pomodoro count IS a multiple of 4 (e.g., 4, 8, 12)
- **THEN** next session type is set to "Long Rest" (10 minutes)

#### Scenario: Fourth pomodoro triggers Long Rest
- **WHEN** the 4th work session completes
- **THEN** next session type is "Long Rest"

#### Scenario: First three pomodoros trigger Short Rest
- **WHEN** the 1st, 2nd, or 3rd work session completes
- **THEN** next session type is "Short Rest"

---

### Requirement: Transition back to Work Session after rest
**Implements**: UC2-S4 - System transitions back to "Work Session" mode, ready to start; UC3-S4 - System transitions back to "Work Session" mode for next cycle
After any rest session (short or long) completes naturally, the system SHALL set the next session type to "Work Session" (25 minutes) and enter idle state.

#### Scenario: Short Rest completion → Work Session
- **WHEN** a Short Rest countdown reaches 00:00
- **THEN** next session type is set to "Work Session" and timer enters idle state

#### Scenario: Long Rest completion → Work Session
- **WHEN** a Long Rest countdown reaches 00:00
- **THEN** next session type is set to "Work Session" and timer enters idle state

---

### Requirement: Session durations are fixed constants
**Implements**: UC1-S2 - System begins countdown from 25:00; UC2-S1 - System displays Short Rest and starts from 05:00; UC3-S1 - System displays Long Rest and starts from 10:00
The system SHALL use fixed, non-configurable durations for each session type:
- Work Session: 25 minutes (1500 seconds)
- Short Rest: 5 minutes (300 seconds)
- Long Rest: 10 minutes (600 seconds)

#### Scenario: Work session duration
- **WHEN** a Work Session starts
- **THEN** the initial countdown is exactly 25:00 (1500 seconds)

#### Scenario: Short Rest duration
- **WHEN** a Short Rest starts
- **THEN** the initial countdown is exactly 05:00 (300 seconds)

#### Scenario: Long Rest duration
- **WHEN** a Long Rest starts
- **THEN** the initial countdown is exactly 10:00 (600 seconds)

---

### Requirement: Skip rest by resetting preserves work state
**Implements**: UC2-E2a1 - System transitions to next work session without completing rest countdown; UC3-E2a1 - System transitions to next work session immediately
If the user resets during a rest session, the system SHALL set the session type to "Work Session" and enter idle state without modifying the pomodoro count.

#### Scenario: Reset during Short Rest → Work Session
- **WHEN** user resets while a Short Rest is in progress (running or paused)
- **THEN** session type becomes "Work Session" and timer enters idle state; pomodoro count is unchanged

#### Scenario: Reset during Long Rest → Work Session
- **WHEN** user resets while a Long Rest is in progress (running or paused)
- **THEN** session type becomes "Work Session" and timer enters idle state; pomodoro count is unchanged
