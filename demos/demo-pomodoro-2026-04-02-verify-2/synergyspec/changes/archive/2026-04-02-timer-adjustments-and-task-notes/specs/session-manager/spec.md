# Spec: session-manager (delta)

Generated: 2026-04-02

## Overview
Delta spec for the `session-manager` capability.
Updates duration references for `work` (1500 → 1800 s / 25 → 30 min) and `longRest` (600 → 1500 s / 10 → 25 min) in the cycle-progression and reset requirements.

See usecases.md "Use Case Traceability Mapping" for the complete list of use case steps.

## Use Case Traceability
This delta implements the following use case steps:
- UC2-S1: System transitions to long rest (25 min) and shows "Long Rest"
- UC2-S5: System resets Pomodoro counter and readies next work cycle
- UC2-E3a: User triggers skip; system advances to next work session immediately

## MODIFIED Requirements

### Requirement: Advance to long rest after 4th completed work session
**Implements**: UC2-S1 - System transitions to long rest (25 min) and shows "Long Rest"
The system SHALL transition to `longRest` (25 minutes) and reset `pomodoroCount` to 0 when a work session completes and the incremented count equals 4.

#### Scenario: 4th work session triggers long rest
- **WHEN** a work session completes and pomodoroCount reaches 4
- **THEN** sessionType SHALL become `longRest`, remainingSeconds SHALL be 1500 (25 min), and pomodoroCount SHALL be reset to 0

---

### Requirement: Advance from short rest to next work session
**Implements**: UC2-S5 - System resets Pomodoro counter and readies next work cycle
The system SHALL transition back to `work` (30 minutes) when a short rest session completes.

#### Scenario: Short rest completion returns to Work
- **WHEN** a shortRest session completes
- **THEN** sessionType SHALL become `work` and remainingSeconds SHALL be 1800 (30 min)

---

### Requirement: Advance from long rest to new cycle
**Implements**: UC2-S5 - System resets Pomodoro counter and readies next work cycle
The system SHALL transition back to `work` and ensure `pomodoroCount` is 0 when a long rest session completes.

#### Scenario: Long rest completion starts new cycle
- **WHEN** a longRest session completes
- **THEN** sessionType SHALL become `work`, remainingSeconds SHALL be 1800, and pomodoroCount SHALL be 0

---

### Requirement: Allow skipping a rest session
**Implements**: UC2-E3a - User triggers skip; system advances to next work session immediately
The system SHALL advance to the next session in the cycle when the user triggers a skip action during a rest session.

#### Scenario: Skip short rest advances to next work session
- **WHEN** the user triggers skip while sessionType is `shortRest`
- **THEN** sessionType SHALL become `work` and remainingSeconds SHALL be 1800

#### Scenario: Skip long rest starts new cycle
- **WHEN** the user triggers skip while sessionType is `longRest`
- **THEN** sessionType SHALL become `work`, remainingSeconds SHALL be 1800, and pomodoroCount SHALL remain 0

---

### Requirement: Reset session state to defaults
**Implements**: UC2-S5 - System resets Pomodoro counter and readies next work cycle
The system SHALL set `sessionType` to `work`, `remainingSeconds` to 1800, and `pomodoroCount` to 0 when a reset is triggered.

#### Scenario: Reset restores Work session defaults
- **WHEN** the user triggers a reset
- **THEN** sessionType SHALL be `work`, remainingSeconds SHALL be 1800, and pomodoroCount SHALL be 0
