# Spec: timer-ui

## Purpose
The visual interface that displays the countdown, session type, pomodoro count, paused state, and control buttons.

## Requirements

### Requirement: Display session label
**Implements**: UC1-S3 - System shows current session label ("Work Session") and remaining time; UC2-S1 - System displays "Short Rest" label; UC3-S1 - System displays "Long Rest" label
The system SHALL display a text label identifying the current session type at all times.

#### Scenario: Work Session label shown
- **WHEN** the current session type is Work
- **THEN** the UI displays the label "Work Session"

#### Scenario: Short Rest label shown
- **WHEN** the current session type is Short Rest
- **THEN** the UI displays the label "Short Rest"

#### Scenario: Long Rest label shown
- **WHEN** the current session type is Long Rest
- **THEN** the UI displays the label "Long Rest"

---

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

### Requirement: Display completed pomodoro count
**Implements**: UC1-S6 - System increments the completed pomodoro count by 1 (UI reflection)
The system SHALL display the number of completed pomodoro sessions at all times, updating immediately after each work session completes.

#### Scenario: Count displayed on screen
- **WHEN** the application is visible
- **THEN** the UI shows a label such as "Pomodoros completed: N"

#### Scenario: Count updates after work session completes
- **WHEN** a work session countdown reaches 00:00
- **THEN** the displayed count increments by 1

---

### Requirement: Display paused state indicator
**Implements**: UC4-S3 - System displays paused state visually
The system SHALL show a clear visual indicator when the timer is paused, distinguishing the paused state from both the running and idle states.

#### Scenario: Paused indicator shown
- **WHEN** the timer is paused
- **THEN** a "Paused" label or indicator is visible in the UI

#### Scenario: Paused indicator hidden when running
- **WHEN** the timer is running
- **THEN** the paused indicator is not shown

#### Scenario: Paused indicator hidden when idle
- **WHEN** the timer is in idle state
- **THEN** the paused indicator is not shown

---

### Requirement: Render Start/Resume control
**Implements**: UC1-S1 - User starts the timer; UC4-S4 - User presses Resume
The system SHALL display a Start button (labeled "Start" when idle, "Resume" when paused) that is enabled only when the timer is idle or paused.

#### Scenario: Start button enabled when idle
- **WHEN** the timer is idle
- **THEN** a "Start" button is visible and enabled

#### Scenario: Resume button enabled when paused
- **WHEN** the timer is paused
- **THEN** the button label changes to "Resume" and it is enabled

#### Scenario: Start/Resume button disabled when running
- **WHEN** the timer is running
- **THEN** the Start/Resume button is disabled

---

### Requirement: Render Pause control
**Implements**: UC4-S1 - User presses Pause during active session; UC1-E1a - User pauses the timer mid-session
The system SHALL display a Pause button that is enabled only when the timer is actively running.

#### Scenario: Pause button enabled when running
- **WHEN** the timer is running
- **THEN** a "Pause" button is visible and enabled

#### Scenario: Pause button disabled when idle
- **WHEN** the timer is idle
- **THEN** the Pause button is disabled

#### Scenario: Pause button disabled when paused
- **WHEN** the timer is paused
- **THEN** the Pause button is disabled

---

### Requirement: Render Reset control
**Implements**: UC5-S1 - User presses Reset; UC1-E1b - User resets the timer mid-session
The system SHALL display a Reset button that is always enabled regardless of timer state.

#### Scenario: Reset button always enabled
- **WHEN** the timer is in any state (idle, running, paused, or at session end)
- **THEN** the Reset button is visible and enabled

---

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

---

### Requirement: Show session-end notification
**Implements**: UC1-S5 - System reaches 00:00 and notifies user that work session is complete; UC2-S3 - System notifies user that short rest is over; UC3-S3 - System notifies user that long rest is over
The system SHALL display a visible in-page message when any session completes, describing what finished and what comes next. The system SHALL additionally attempt to fire a browser notification if permission has been granted.

#### Scenario: In-page banner on work session end
- **WHEN** a work session reaches 00:00
- **THEN** an in-page banner displays a message such as "Work session complete! Time for a break."

#### Scenario: In-page banner on short rest end
- **WHEN** a short rest reaches 00:00
- **THEN** an in-page banner displays a message such as "Short rest over! Ready to work?"

#### Scenario: In-page banner on long rest end
- **WHEN** a long rest reaches 00:00
- **THEN** an in-page banner displays a message such as "Long rest over! Start a new cycle."

#### Scenario: Browser notification sent if permission granted
- **WHEN** a session completes and the browser Notification permission is "granted"
- **THEN** system fires a browser notification with the session-end message

#### Scenario: In-page fallback when notification permission denied
- **WHEN** a session completes and notification permission is "denied" or unavailable
- **THEN** the in-page banner is shown; no browser notification is attempted
