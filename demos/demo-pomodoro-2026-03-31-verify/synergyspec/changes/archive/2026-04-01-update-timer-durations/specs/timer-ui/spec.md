# Spec: timer-ui (delta)

Generated: 2026-04-01

## Overview
Delta spec for the `timer-ui` capability — updates display requirements to reflect new default durations (30 min work / 15 min rest).
See usecases.md "Use Case Traceability Mapping" for the complete list of use case steps.

## Use Case Traceability
This delta spec modifies requirements for the following use case steps:

- UC1-E1a1: System displays "30:00" on load in idle work mode
- UC2-E1a1: System displays "15:00" in idle rest mode after a work session ends
- UC1-S3: System displays remaining time starting from 30:00, updating every second
- UC2-S3: System displays remaining rest time starting from 15:00, updating every second

---

## MODIFIED Requirements

### Requirement: Countdown Display in MM:SS Format
**Implements**: UC1-S3 - System displays remaining time starting from 30:00, updating every second; UC2-S3 - System displays remaining rest time starting from 15:00, updating every second; UC1-E1a1 - System displays "30:00" on load in idle work mode; UC2-E1a1 - System displays "15:00" in idle rest mode after a work session ends

The system SHALL display the remaining time in `MM:SS` format, updated once per second while running.

#### Scenario: Display updates each second while running
- **WHEN** the timer is in RUNNING state
- **THEN** the displayed time reflects the current remainingSeconds, formatted as zero-padded MM:SS (e.g., "29:59", "15:00", "00:01")

#### Scenario: Display at full duration in work mode
- **WHEN** the timer is in IDLE state in work mode
- **THEN** the display shows "30:00"

#### Scenario: Display at full duration in rest mode
- **WHEN** the timer is in IDLE state in rest mode
- **THEN** the display shows "15:00"
