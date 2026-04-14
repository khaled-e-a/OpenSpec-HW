# Spec: session-manager

Generated: 2026-04-02

## Overview
This spec implements requirements for the `session-manager` capability — the logic that tracks which Pomodoro session is active, advances through the cycle (Work → Short Rest → Long Rest), and resets the cycle counter.

See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:
- UC1-S3: System shows the current session type as "Work"
- UC1-S6: System records the completed Pomodoro and advances to the next session
- UC3-S4: System resets the session type to "Work"
- UC3-S5: System resets the completed Pomodoro count to zero
- UC4-S1: User completes Pomodoro #1; system advances to short rest
- UC4-S2: System starts a 5-minute short rest countdown and shows "Short Rest"
- UC4-S3: User completes the short rest; system advances to Pomodoro #2
- UC4-S4: User completes Pomodoros #2 and #3, each followed by a 5-minute short rest
- UC4-S5: User completes Pomodoro #4; system advances to long rest
- UC4-S6: System starts a 10-minute long rest countdown and shows "Long Rest"
- UC4-S7: User completes the long rest; system resets counter and readies new cycle
- UC4-E3a: User skips a rest session; system advances the cycle accordingly

## ADDED Requirements

### Requirement: Track current session type
**Implements**: UC1-S3 - System shows the current session type as "Work"
The system SHALL maintain a `sessionType` value of `work`, `shortRest`, or `longRest` and expose it to the display layer.

#### Scenario: Initial session is Work
- **WHEN** the application loads or is reset
- **THEN** `sessionType` SHALL be `work`

---

### Requirement: Advance to short rest after completed work session (Pomodoros 1–3)
**Implements**: UC1-S6 - System records the completed Pomodoro and advances to the next session
**Implements**: UC4-S1 - User completes Pomodoro #1; system advances to short rest
**Implements**: UC4-S3 - User completes the short rest; system advances to Pomodoro #2
**Implements**: UC4-S4 - User completes Pomodoros #2 and #3, each followed by a 5-minute short rest
The system SHALL increment `pomodoroCount` and transition to `shortRest` (5 minutes) when a work session completes and `pomodoroCount` is less than 4.

#### Scenario: Work session 1 advances to short rest
- **WHEN** a work session completes and pomodoroCount is 1 (after increment)
- **THEN** sessionType SHALL become `shortRest` and remainingSeconds SHALL be 300 (5 min)

#### Scenario: Work sessions 2 and 3 also advance to short rest
- **WHEN** a work session completes and pomodoroCount is 2 or 3 (after increment)
- **THEN** sessionType SHALL become `shortRest` and remainingSeconds SHALL be 300

---

### Requirement: Advance to long rest after 4th completed work session
**Implements**: UC4-S5 - User completes Pomodoro #4; system advances to long rest
**Implements**: UC4-S6 - System starts a 10-minute long rest countdown and shows "Long Rest"
The system SHALL transition to `longRest` (10 minutes) and reset `pomodoroCount` to 0 when a work session completes and the incremented count equals 4.

#### Scenario: 4th work session triggers long rest
- **WHEN** a work session completes and pomodoroCount reaches 4
- **THEN** sessionType SHALL become `longRest`, remainingSeconds SHALL be 600 (10 min), and pomodoroCount SHALL be reset to 0

---

### Requirement: Advance from short rest to next work session
**Implements**: UC4-S3 - User completes the short rest; system advances to Pomodoro #2
The system SHALL transition back to `work` (25 minutes) when a short rest session completes.

#### Scenario: Short rest completion returns to Work
- **WHEN** a shortRest session completes
- **THEN** sessionType SHALL become `work` and remainingSeconds SHALL be 1500 (25 min)

---

### Requirement: Advance from long rest to new cycle
**Implements**: UC4-S7 - User completes the long rest; system resets counter and readies new cycle
The system SHALL transition back to `work` and ensure `pomodoroCount` is 0 when a long rest session completes.

#### Scenario: Long rest completion starts new cycle
- **WHEN** a longRest session completes
- **THEN** sessionType SHALL become `work`, remainingSeconds SHALL be 1500, and pomodoroCount SHALL be 0

---

### Requirement: Allow skipping a rest session
**Implements**: UC4-E3a - User skips a rest session; system advances the cycle accordingly
The system SHALL advance to the next session in the cycle when the user triggers a skip action during a rest session.

#### Scenario: Skip short rest advances to next work session
- **WHEN** the user triggers skip while sessionType is `shortRest`
- **THEN** sessionType SHALL become `work` and remainingSeconds SHALL be 1500

#### Scenario: Skip long rest starts new cycle
- **WHEN** the user triggers skip while sessionType is `longRest`
- **THEN** sessionType SHALL become `work`, remainingSeconds SHALL be 1500, and pomodoroCount SHALL remain 0

---

### Requirement: Reset session state to defaults
**Implements**: UC3-S4 - System resets the session type to "Work"
**Implements**: UC3-S5 - System resets the completed Pomodoro count to zero
The system SHALL set `sessionType` to `work`, `remainingSeconds` to 1500, and `pomodoroCount` to 0 when a reset is triggered.

#### Scenario: Reset restores Work session defaults
- **WHEN** the user triggers a reset
- **THEN** sessionType SHALL be `work`, remainingSeconds SHALL be 1500, and pomodoroCount SHALL be 0
