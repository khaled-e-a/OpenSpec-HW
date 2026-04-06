# Spec: timer-engine (delta)

Generated: 2026-04-02

## Overview
Delta spec for the `timer-engine` capability.
Updates duration references from 25 minutes (1500 s) to 30 minutes (1800 s) in the "Start countdown" and "Tick countdown every second" requirements to reflect the new `WORK_DURATION` constant.

See usecases.md "Use Case Traceability Mapping" for the complete list of use case steps.

## Use Case Traceability
This delta implements the following use case steps:
- UC1-S1: User starts the timer to begin a work session
- UC1-S2: System begins countdown from 30:00, updating each second
- UC1-S4: User works for the full 30 minutes without interruption

## MODIFIED Requirements

### Requirement: Start countdown
**Implements**: UC1-S1 - User starts the timer to begin a work session
The system SHALL begin a countdown from the current session's full duration when the user triggers the start action.

#### Scenario: Timer starts from full duration
- **WHEN** the user starts the timer from an idle or completed state
- **THEN** the countdown begins from the session's configured duration (e.g., 1800 s for Work)

---

### Requirement: Tick countdown every second
**Implements**: UC1-S2 - System begins countdown from 30:00, updating each second
The system SHALL decrement the remaining time by exactly 1 second on each tick and update the displayed time accordingly.

#### Scenario: Display updates each second
- **WHEN** the timer is running
- **THEN** the displayed remaining time decreases by 1 second on every clock tick

---

### Requirement: Maintain uninterrupted countdown
**Implements**: UC1-S4 - User works for the full 30 minutes without interruption
The system SHALL continue ticking without user interaction until it reaches zero or the user explicitly pauses or resets it.

#### Scenario: Countdown runs to zero without input
- **WHEN** the timer is started and no pause or reset is triggered
- **THEN** the timer decrements continuously until remainingSeconds reaches 0
