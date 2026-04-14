# Spec: timer-display

Generated: 2026-04-02

## Overview
This spec implements requirements for the `timer-display` capability — the visual UI that renders the current session type, remaining time, Pomodoro count, timer controls, and status indicators (paused, completed).

See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:
- UC1-S1: User starts the timer to begin a 25-minute work session
- UC1-S2: System begins countdown from 25:00, updating the display each second
- UC1-S3: System shows the current session type as "Work"
- UC1-S5: System reaches 00:00 and signals session completion
- UC1-E5a: Timer reaches 00:00 while user is away; system holds completion state
- UC2-S1: User pauses the running timer
- UC2-S3: System displays a "Paused" indicator alongside the frozen countdown
- UC2-S5: User resumes the timer
- UC2-S7: System removes the "Paused" indicator and resumes normal display
- UC3-S1: User resets the timer
- UC3-S3: System resets the display to the initial work session duration (25:00)
- UC3-S4: System resets the session type to "Work"
- UC3-S5: System resets the completed Pomodoro count to zero
- UC4-S2: System starts a 5-minute short rest countdown and shows "Short Rest"
- UC4-S6: System starts a 10-minute long rest countdown and shows "Long Rest"
- UC4-E3a: User skips a rest session; system advances the cycle accordingly

## ADDED Requirements

### Requirement: Display countdown in MM:SS format
**Implements**: UC1-S2 - System begins countdown from 25:00, updating the display each second
The system SHALL render the remaining time as `MM:SS` and update it every second while the timer is running.

#### Scenario: Running timer shows MM:SS ticking down
- **WHEN** the timer is running
- **THEN** the display SHALL show the remaining time in MM:SS format, decrementing each second

#### Scenario: Full-duration display at start
- **WHEN** a work session is idle
- **THEN** the display SHALL show `25:00`

---

### Requirement: Display current session type label
**Implements**: UC1-S3 - System shows the current session type as "Work"
**Implements**: UC4-S2 - System starts a 5-minute short rest countdown and shows "Short Rest"
**Implements**: UC4-S6 - System starts a 10-minute long rest countdown and shows "Long Rest"
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

### Requirement: Show start control when idle or completed
**Implements**: UC1-S1 - User starts the timer to begin a 25-minute work session
The system SHALL display a Start button when the timer status is `idle` or `completed`.

#### Scenario: Start button visible when idle
- **WHEN** status is `idle`
- **THEN** a Start button SHALL be visible and actionable

#### Scenario: Start button visible after completion
- **WHEN** status is `completed`
- **THEN** a Start button (or "Start Next") SHALL be visible and actionable

---

### Requirement: Show pause control while running
**Implements**: UC2-S1 - User pauses the running timer
The system SHALL replace the Start button with a Pause button while the timer is running.

#### Scenario: Pause button visible when running
- **WHEN** status is `running`
- **THEN** a Pause button SHALL be visible and the Start button SHALL NOT be visible

---

### Requirement: Show paused indicator
**Implements**: UC2-S3 - System displays a "Paused" indicator alongside the frozen countdown
The system SHALL display a visible "Paused" status label when the timer is paused.

#### Scenario: Paused label shown when paused
- **WHEN** status is `paused`
- **THEN** the display SHALL include a "Paused" indicator

---

### Requirement: Show resume control when paused
**Implements**: UC2-S5 - User resumes the timer
The system SHALL display a Resume button when the timer status is `paused`.

#### Scenario: Resume button visible when paused
- **WHEN** status is `paused`
- **THEN** a Resume button SHALL be visible and actionable

---

### Requirement: Remove paused indicator when running
**Implements**: UC2-S7 - System removes the "Paused" indicator and resumes normal display
The system SHALL hide the "Paused" indicator when status transitions from `paused` to `running`.

#### Scenario: Paused label hidden after resume
- **WHEN** the user resumes and status becomes `running`
- **THEN** the "Paused" indicator SHALL no longer be visible

---

### Requirement: Show completion indicator
**Implements**: UC1-S5 - System reaches 00:00 and signals session completion
**Implements**: UC1-E5a - Timer reaches 00:00 while user is away; system holds completion state
The system SHALL display a completion banner or indicator when status is `completed`, and continue showing it until the user starts the next session.

#### Scenario: Completion banner shown at 00:00
- **WHEN** status becomes `completed`
- **THEN** the display SHALL show a completion indicator (e.g., "Session Complete!") and the countdown SHALL show `00:00`

#### Scenario: Completion state persists while user is absent
- **WHEN** status is `completed` and no user action is taken
- **THEN** the completion indicator SHALL remain visible indefinitely

---

### Requirement: Show reset control at all times
**Implements**: UC3-S1 - User resets the timer
The system SHALL display a Reset button regardless of the current timer status.

#### Scenario: Reset button always visible
- **WHEN** the application is in any state (idle, running, paused, completed)
- **THEN** a Reset button SHALL be visible and actionable

---

### Requirement: Reflect reset in display
**Implements**: UC3-S3 - System resets the display to the initial work session duration (25:00)
**Implements**: UC3-S4 - System resets the session type to "Work"
**Implements**: UC3-S5 - System resets the completed Pomodoro count to zero
The system SHALL update the display immediately after a reset to show `25:00`, the label "Work", and a Pomodoro count of 0.

#### Scenario: Display shows defaults after reset
- **WHEN** the user triggers reset
- **THEN** the countdown SHALL show `25:00`, session label SHALL show "Work", and Pomodoro count SHALL show 0

---

### Requirement: Show skip control during rest sessions
**Implements**: UC4-E3a - User skips a rest session; system advances the cycle accordingly
The system SHALL display a Skip button when the current session is `shortRest` or `longRest`.

#### Scenario: Skip button visible during short rest
- **WHEN** sessionType is `shortRest`
- **THEN** a Skip button SHALL be visible and actionable

#### Scenario: Skip button visible during long rest
- **WHEN** sessionType is `longRest`
- **THEN** a Skip button SHALL be visible and actionable

#### Scenario: Skip button hidden during work session
- **WHEN** sessionType is `work`
- **THEN** a Skip button SHALL NOT be visible

---

### Requirement: Display Pomodoro count
**Implements**: UC1-S6 - System records the completed Pomodoro and advances to the next session
The system SHALL show the number of completed Pomodoros in the current cycle (0–3).

#### Scenario: Pomodoro count increments after work session
- **WHEN** a work session completes
- **THEN** the displayed Pomodoro count SHALL increment by 1 (up to 4, then resets to 0)
