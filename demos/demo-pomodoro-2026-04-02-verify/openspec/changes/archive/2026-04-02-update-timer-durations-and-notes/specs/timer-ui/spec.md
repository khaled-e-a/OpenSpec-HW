# Spec: timer-ui

Generated: 2026-04-02

## Overview
Delta spec for timer-ui — updates countdown display scenarios to reflect new durations (Work: 30:00, Long Rest: 25:00) and adds the notes area requirement.
See usecases.md "Use Case Traceability Mapping" for the complete list of use case steps.

## Use Case Traceability
This delta implements the following use case steps:
- UC1-S2: System begins countdown from 30:00, displaying remaining time
- UC2-S1: System displays "Long Rest" label and starts countdown from 25:00
- UC3-S1: User clicks the notes area
- UC3-S2: System activates the text input, allowing free-form typing
- UC3-S3: User types notes about the current task
- UC3-S4: System retains the notes content as the user types
- UC3-S6: User continues to view or edit notes in subsequent sessions

---

## MODIFIED Requirements

### Requirement: Display countdown in MM:SS format
**Implements**: UC1-S2 - System begins countdown from 30:00, displaying remaining time; UC2-S1 - System displays "Long Rest" label and starts countdown from 25:00
The system SHALL display the remaining time as a large, prominent MM:SS formatted countdown that updates every second during an active session.

#### Scenario: Display updates each second
- **WHEN** the timer is running
- **THEN** the countdown display updates once per second

#### Scenario: Format is MM:SS
- **WHEN** remaining time is any value
- **THEN** the display shows zero-padded minutes and seconds (e.g., "04:07", "30:00", "25:00", "00:00")

#### Scenario: Display shows full duration when idle
- **WHEN** the timer is in idle state
- **THEN** the countdown shows the full duration for the current session type (30:00 for Work, 05:00 for Short Rest, 25:00 for Long Rest)

---

## ADDED Requirements

### Requirement: Display notes area
**Implements**: UC3-S1 - User clicks the notes area; UC3-S2 - System activates the text input, allowing free-form typing; UC3-S3 - User types notes about the current task; UC3-S4 - System retains the notes content as the user types; UC3-S6 - User continues to view or edit notes in subsequent sessions
The system SHALL display a persistent, always-visible notes textarea that allows the user to type, edit, and retain free-form notes about their current task at any time, regardless of timer state.

#### Scenario: Notes area visible in all timer states
- **WHEN** the application is loaded and the timer is in any state (idle, running, paused)
- **THEN** a notes textarea is visible on the page

#### Scenario: User can type notes
- **WHEN** the user clicks the notes area and begins typing
- **THEN** the textarea accepts and displays the typed text

#### Scenario: Notes persist across session transitions
- **WHEN** a session completes (work → rest, or rest → work) and the timer transitions to a new session
- **THEN** the notes textarea content is unchanged

#### Scenario: Notes persist across timer resets
- **WHEN** the user triggers a timer reset
- **THEN** the notes textarea content remains unchanged

#### Scenario: Notes area has a visible placeholder when empty
- **WHEN** the notes textarea is empty
- **THEN** a placeholder hint is displayed (e.g., "Notes about your current task…")
