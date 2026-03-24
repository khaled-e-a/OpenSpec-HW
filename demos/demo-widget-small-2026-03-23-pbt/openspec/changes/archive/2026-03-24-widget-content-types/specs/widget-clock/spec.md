# Spec: widget-clock

Generated: 2026-03-23

## Overview
This spec defines requirements for the clock widget capability — a self-contained widget that displays the current time and date, updating every second, with no user configuration required.

## Use Case Traceability
This spec implements the following use case steps from usecases.md:
- UC1-S1: User adds a clock widget or the dashboard loads with a saved clock widget
- UC1-S2: System renders the widget showing current hours, minutes, seconds, and date
- UC1-S3: System starts a 1-second interval timer internal to the widget
- UC1-S4: System updates the displayed time every second
- UC1-S5: User reads the current time from the widget
- UC1-E1a1: System restores the clock widget at its saved grid position on dashboard load
- UC1-E1a2: Clock begins ticking immediately — no configuration needed
- UC1-E5a1: System stops the 1-second timer when the clock widget is removed

---

## ADDED Requirements

### Requirement: Render current time and date on mount
**Implements**: UC1-S1 - User adds a clock widget or the dashboard loads with a saved clock widget; UC1-S2 - System renders the widget showing current hours, minutes, seconds, and date
The system SHALL render the clock widget immediately upon mount, displaying the current local hours, minutes, seconds, and full date without requiring any user input or configuration.

#### Scenario: Clock renders on add
- **WHEN** a clock widget is added to the dashboard
- **THEN** the widget displays the current time (HH:MM:SS) and date immediately

#### Scenario: Clock renders on restore
- **WHEN** the dashboard loads with a saved clock widget in the layout
- **THEN** the widget renders at its stored grid position and displays the current time immediately

---

### Requirement: Start 1-second interval timer on mount
**Implements**: UC1-S3 - System starts a 1-second interval timer internal to the widget; UC1-E1a2 - Clock begins ticking immediately — no configuration needed
The system SHALL start a `setInterval`-based timer with a 1000ms period inside the clock component on mount. The timer SHALL be local to the component instance and SHALL NOT depend on any external clock service or context.

#### Scenario: Timer starts automatically
- **WHEN** the clock widget component mounts
- **THEN** a 1-second interval timer is running within the component

---

### Requirement: Update displayed time every second
**Implements**: UC1-S4 - System updates the displayed time every second; UC1-S5 - User reads the current time from the widget
The system SHALL update the time display on every timer tick, reflecting the current local time. The displayed hours, minutes, and seconds SHALL always match the system clock at the moment of the last tick.

#### Scenario: Time advances each second
- **WHEN** one second elapses after the timer starts
- **THEN** the displayed seconds value increments by 1 (wrapping at 60)

#### Scenario: Time format uses locale
- **WHEN** the clock is rendering
- **THEN** the time is formatted using the browser locale (via `toLocaleTimeString()` or equivalent)

---

### Requirement: Stop timer on widget unmount
**Implements**: UC1-E5a1 - System stops the 1-second timer when the clock widget is removed
The system SHALL call `clearInterval` on the running timer when the clock widget component unmounts (e.g., when the widget is removed from the dashboard). No stale timers SHALL remain active after unmount.

#### Scenario: Timer cleared on remove
- **WHEN** the clock widget is removed from the dashboard
- **THEN** the interval timer is cleared and no further time updates occur

#### Scenario: No timer leak on re-mount
- **WHEN** a clock widget is removed and a new clock widget is subsequently added
- **THEN** only one timer is running (the new widget's timer); no ghost timers from the removed widget persist

---

### Requirement: No settings required
**Implements**: UC1-E1a2 - Clock begins ticking immediately — no configuration needed
The clock widget SHALL require no user configuration and SHALL display no settings panel, empty-state prompt, or configuration UI. It SHALL be fully functional from the moment it is placed on the dashboard.

#### Scenario: Clock has no configuration UI
- **WHEN** the clock widget is rendered
- **THEN** no input fields, file pickers, or URL inputs are visible inside the widget

#### Scenario: Clock widget settings entry is absent
- **WHEN** the clock widget is added
- **THEN** no entry is written to `dashboard-widget-settings` in localStorage for this widget
