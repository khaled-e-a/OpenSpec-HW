# Spec: timer-engine

## Purpose
The core countdown timer logic that drives all Pomodoro session types. Handles starting, pausing, resuming, and resetting the countdown, as well as detecting and signalling session completion.

## Requirements

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

---

### Requirement: Signal session completion
**Implements**: UC1-S5 - System reaches 00:00 and signals session completion
The system SHALL detect when remaining time reaches zero, stop the countdown, and emit a completion signal.

#### Scenario: Completion at zero
- **WHEN** remainingSeconds reaches 0
- **THEN** the interval is cleared and a completion event is raised for the session manager

---

### Requirement: Hold completion state until acknowledged
**Implements**: UC1-E5a - Timer reaches 00:00 while user is away; system holds completion state
The system SHALL remain in a "completed" state (displaying 00:00 and a completion indicator) until the user initiates the next action.

#### Scenario: Completion state persists when user is absent
- **WHEN** the timer completes and no user action follows
- **THEN** the display continues showing 00:00 and the completion indicator indefinitely

---

### Requirement: Pause countdown
**Implements**: UC2-S1, UC2-S2 - User pauses the running timer; System halts the countdown and preserves the remaining time
The system SHALL stop the tick interval and preserve the current remaining time when the user pauses.

#### Scenario: Pause freezes remaining time
- **WHEN** the user pauses the timer while it is running
- **THEN** the tick interval is cleared and remainingSeconds is preserved in state

#### Scenario: Pause immediately after start
- **WHEN** the user pauses the timer within the first tick after starting (UC2-E2a)
- **THEN** the interval is cleared with remainingSeconds near the full duration; no special handling required

---

### Requirement: Resume countdown from preserved time
**Implements**: UC2-S5, UC2-S6 - User resumes the timer; System restarts the countdown from the preserved remaining time
The system SHALL restart the tick interval using the preserved remaining time when the user resumes.

#### Scenario: Resume continues from pause point
- **WHEN** the user resumes the timer after pausing
- **THEN** a new tick interval is started and decrements from the stored remainingSeconds value

---

### Requirement: Reset countdown to initial state
**Implements**: UC3-S1, UC3-S2, UC3-S3 - User resets the timer; System stops any active countdown; System resets display to initial duration
The system SHALL clear any active tick interval and restore remainingSeconds to the session's configured full duration.

#### Scenario: Reset while running stops and restores
- **WHEN** the user resets the timer while it is running or paused
- **THEN** the interval is cleared and remainingSeconds is set to the session's full duration

#### Scenario: Reset while idle is idempotent (UC3-E1a)
- **WHEN** the user resets the timer while it is already idle
- **THEN** the state is set to the full duration with no visible change or error
