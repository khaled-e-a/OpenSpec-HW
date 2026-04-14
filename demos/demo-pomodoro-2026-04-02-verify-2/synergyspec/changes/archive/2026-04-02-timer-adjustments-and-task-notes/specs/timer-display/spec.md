# Spec: timer-display (delta)

Generated: 2026-04-02

## Overview
Delta spec for the `timer-display` capability.
Updates the initial full-duration display from `25:00` to `30:00` and the "Reflect reset in display" requirement accordingly. Also updates the long-rest label requirement to reference 25 minutes instead of 10. Adds the new requirement to show the task-notes panel during work sessions.

See usecases.md "Use Case Traceability Mapping" for the complete list of use case steps.

## Use Case Traceability
This delta implements the following use case steps:
- UC1-S2: System begins countdown from 30:00, updating each second
- UC2-S1: System transitions to long rest (25 min) and shows "Long Rest"
- UC3-S1: System displays the task-notes panel during the work session

## MODIFIED Requirements

### Requirement: Display countdown in MM:SS format
**Implements**: UC1-S2 - System begins countdown from 30:00, updating each second
The system SHALL render the remaining time as `MM:SS` and update it every second while the timer is running.

#### Scenario: Running timer shows MM:SS ticking down
- **WHEN** the timer is running
- **THEN** the display SHALL show the remaining time in MM:SS format, decrementing each second

#### Scenario: Full-duration display at start
- **WHEN** a work session is idle
- **THEN** the display SHALL show `30:00`

---

### Requirement: Display current session type label
**Implements**: UC1-S3 - System shows the current session type as "Work"
**Implements**: UC4-S2 - System starts a 5-minute short rest countdown and shows "Short Rest"
**Implements**: UC2-S1 - System transitions to long rest (25 min) and shows "Long Rest"
The system SHALL display a human-readable label for the active session type: "Work", "Short Rest", or "Long Rest".

#### Scenario: Work session label
- **WHEN** sessionType is `work`
- **THEN** the display SHALL show the label "Work"

#### Scenario: Short rest label
- **WHEN** sessionType is `shortRest`
- **THEN** the display SHALL show the label "Short Rest"

#### Scenario: Long rest label
- **WHEN** sessionType is `longRest`
- **THEN** the display SHALL show the label "Long Rest"

---

### Requirement: Reflect reset in display
**Implements**: UC3-S3 - System resets the display to the initial work session duration (30:00)
**Implements**: UC3-S4 - System resets the session type to "Work"
**Implements**: UC3-S5 - System resets the completed Pomodoro count to zero
The system SHALL update the display immediately after a reset to show `30:00`, the label "Work", and a Pomodoro count of 0.

#### Scenario: Display shows defaults after reset
- **WHEN** the user triggers reset
- **THEN** the countdown SHALL show `30:00`, session label SHALL show "Work", and Pomodoro count SHALL show 0

---

### Requirement: Show start control when idle or completed
**Implements**: UC1-S1 - User starts the timer to begin a work session
The system SHALL display a Start button when the timer status is `idle` or `completed`.

#### Scenario: Start button visible when idle
- **WHEN** status is `idle`
- **THEN** a Start button SHALL be visible and actionable

#### Scenario: Start button visible after completion
- **WHEN** status is `completed`
- **THEN** a Start button (or "Start Next") SHALL be visible and actionable

## ADDED Requirements

### Requirement: Show task-notes panel during work session
**Implements**: UC3-S1 - System displays the task-notes panel during the work session
The system SHALL render the task-notes panel in the UI when and only when `sessionType` is `work`.

#### Scenario: Task-notes panel visible during work session
- **WHEN** sessionType is `work`
- **THEN** the task-notes panel SHALL be visible in the UI

#### Scenario: Task-notes panel hidden during rest sessions
- **WHEN** sessionType is `shortRest` or `longRest`
- **THEN** the task-notes panel SHALL NOT be visible in the UI
