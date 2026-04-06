# Spec: session-management

## Purpose
The logic that tracks completed pomodoro cycles and determines which session type follows each completed session.

## Requirements

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

### Requirement: Skip rest by resetting preserves work state
**Implements**: UC2-E2a1 - System transitions to next work session without completing rest countdown; UC3-E2a1 - System transitions to next work session immediately
If the user resets during a rest session, the system SHALL set the session type to "Work Session" and enter idle state without modifying the pomodoro count.

#### Scenario: Reset during Short Rest → Work Session
- **WHEN** user resets while a Short Rest is in progress (running or paused)
- **THEN** session type becomes "Work Session" and timer enters idle state; pomodoro count is unchanged

#### Scenario: Reset during Long Rest → Work Session
- **WHEN** user resets while a Long Rest is in progress (running or paused)
- **THEN** session type becomes "Work Session" and timer enters idle state; pomodoro count is unchanged
