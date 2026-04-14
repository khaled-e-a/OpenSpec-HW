# Spec: timer-ui

## Purpose
User interface that displays the timer state and provides controls to interact with the Pomodoro timer.

---

## Requirements

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

---

### Requirement: Mode Label
**Implements**: UC1-S2 - System begins a 25-minute countdown in work mode; UC2-S2 - System begins a 5-minute countdown in rest mode

The system SHALL display a label indicating the current session mode (work or rest).

#### Scenario: Work mode label
- **WHEN** the current mode is work
- **THEN** the label reads "🍅 Work"

#### Scenario: Rest mode label
- **WHEN** the current mode is rest
- **THEN** the label reads "☕ Rest"

---

### Requirement: Start Control
**Implements**: UC1-S1 - User starts the timer; UC2-S1 - User starts the rest timer

The system SHALL provide a control that starts the timer when activated in IDLE state.

#### Scenario: Start button visible when idle
- **WHEN** the timer status is IDLE
- **THEN** a "Start" control is displayed and actionable

#### Scenario: Start action begins countdown
- **WHEN** the user activates the Start control from IDLE state
- **THEN** the system transitions to RUNNING and the countdown begins

---

### Requirement: Pause Control
**Implements**: UC3-S1 - User pauses the timer

The system SHALL provide a control to pause the timer while it is running.

#### Scenario: Pause button visible when running
- **WHEN** the timer status is RUNNING
- **THEN** a "Pause" control is displayed and actionable

#### Scenario: Pause action stops countdown
- **WHEN** the user activates the Pause control
- **THEN** the system transitions to PAUSED and the countdown stops

---

### Requirement: Resume Control
**Implements**: UC3-S5 - User resumes the timer

The system SHALL provide a control to resume the timer when it is paused.

#### Scenario: Resume button visible when paused
- **WHEN** the timer status is PAUSED
- **THEN** a "Resume" control is displayed and actionable

#### Scenario: Resume action restarts countdown
- **WHEN** the user activates the Resume control
- **THEN** the system transitions back to RUNNING from the preserved remaining time

---

### Requirement: Reset Control
**Implements**: UC4-S1 - User resets the timer

The system SHALL provide a control to reset the timer from any non-idle state.

#### Scenario: Reset button visible when non-idle
- **WHEN** the timer status is RUNNING or PAUSED
- **THEN** a "Reset" control is displayed and actionable

#### Scenario: Reset button hidden when idle
- **WHEN** the timer status is IDLE
- **THEN** the Reset control is hidden or disabled

#### Scenario: Reset action returns timer to idle
- **WHEN** the user activates the Reset control
- **THEN** the system transitions to IDLE with the full default duration for the current mode

---

### Requirement: Paused State Visual Indicator
**Implements**: UC3-S3 - System displays paused state visually; UC3-S7 - System removes paused indicator and continues countdown display

The system SHALL visually distinguish the paused state from the running state, and remove the indicator when the timer resumes.

#### Scenario: Paused indicator shown
- **WHEN** the timer status is PAUSED
- **THEN** the timer display shows a visual indicator (e.g., dimmed appearance or "Paused" label)

#### Scenario: Paused indicator removed on resume
- **WHEN** the timer transitions from PAUSED to RUNNING
- **THEN** the paused indicator is removed and the display returns to the normal running appearance

---

### Requirement: Session Completion Signal
**Implements**: UC1-S6 - System signals end of work session (visual/audio cue); UC2-S6 - System signals end of rest break (visual/audio cue)

The system SHALL provide a visible signal when a session ends, before transitioning to the next mode.

#### Scenario: Work session completion flash
- **WHEN** the work session countdown reaches zero
- **THEN** the timer display flashes briefly (CSS animation) and a completion message is shown (e.g., "Work Complete! → Rest")

#### Scenario: Rest session completion flash
- **WHEN** the rest session countdown reaches zero
- **THEN** the timer display flashes briefly and a completion message is shown (e.g., "Rest Complete! → Work")

#### Scenario: Signal clears before next session
- **WHEN** the auto-transition occurs after the completion signal
- **THEN** the display reverts to normal IDLE appearance for the new mode
