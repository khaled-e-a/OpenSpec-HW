# Spec: widget-management

Generated: 2026-04-28

## Overview
This spec defines requirements for the UI controls that let users add new widgets from the registry and remove existing widgets from the dashboard.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:
- UC2-S1: User opens the Add Widget panel
- UC2-S2: System displays available widget types with names and preview thumbnails
- UC2-S3: User selects a widget type
- UC2-E3a: User cancels panel; no change made
- UC2-E4a: No free grid cell; system notifies user, widget not added
- UC3-S1: User clicks the remove control on a widget
- UC3-S2: System presents a confirmation prompt
- UC3-S3: User confirms the removal
- UC3-E3a: User cancels confirmation; widget remains unchanged

## ADDED Requirements

### Requirement: Provide an "Add Widget" entry point in the toolbar
**Implements**: UC2-S1 - User opens the Add Widget panel
The system SHALL display a persistent "Add Widget" button in the dashboard toolbar. Activating this button SHALL open the Add Widget panel.

#### Scenario: Add Widget button visible in toolbar
- **WHEN** the dashboard is loaded
- **THEN** an "Add Widget" button is visible in the toolbar

#### Scenario: Panel opens on button activation
- **WHEN** the user clicks the "Add Widget" button
- **THEN** the Add Widget panel (slide-in drawer) opens

---

### Requirement: Display widget catalogue in the Add Widget panel
**Implements**: UC2-S2 - System displays available widget types with names and preview thumbnails
The Add Widget panel SHALL list all widget types from the registry, showing each type's displayName and description.

#### Scenario: All widget types listed
- **WHEN** the Add Widget panel is open
- **THEN** every widget type from the registry is listed with its name and description visible

---

### Requirement: Add selected widget to dashboard
**Implements**: UC2-S3 - User selects a widget type
The system SHALL add a new widget instance to the dashboard when the user selects a widget type in the Add Widget panel and close the panel upon successful addition.

#### Scenario: Widget added on selection
- **WHEN** the user clicks a widget type in the Add Widget panel
- **THEN** a new instance of that widget type is added to the dashboard and the panel closes

---

### Requirement: Close Add Widget panel without change on cancel
**Implements**: UC2-E3a - User cancels panel; no change made
The system SHALL close the Add Widget panel and leave the dashboard layout unchanged when the user dismisses the panel without selecting a widget (e.g., clicks outside the drawer or presses Escape).

#### Scenario: Panel dismissed without selection
- **WHEN** the user presses Escape or clicks outside the Add Widget panel
- **THEN** the panel closes and no widget is added to the dashboard

---

### Requirement: Notify user when grid is full and block addition
**Implements**: UC2-E4a - No free grid cell; system notifies user, widget not added
The system SHALL check for available grid space before adding a widget. If no free cell block exists for the widget's default size, the system SHALL display a notification and SHALL NOT add the widget.

#### Scenario: Notification shown on full grid
- **WHEN** the user attempts to add a widget and no free space exists on the grid
- **THEN** a notification message is shown (e.g., "Dashboard is full — remove a widget to add a new one")

#### Scenario: Widget not added when grid is full
- **WHEN** the grid is full and an add is attempted
- **THEN** no new widget instance appears on the dashboard

---

### Requirement: Provide a remove control on each widget
**Implements**: UC3-S1 - User clicks the remove control on a widget
Each widget card SHALL display a remove control (e.g., "×" icon button) that is accessible to the user.

#### Scenario: Remove control visible on widget
- **WHEN** the dashboard is displayed and a widget is rendered
- **THEN** the widget card shows a remove "×" control in its header

---

### Requirement: Request confirmation before removing a widget
**Implements**: UC3-S2 - System presents a confirmation prompt; UC3-S3 - User confirms removal
The system SHALL present a confirmation prompt when the user activates the remove control on a widget. The widget SHALL only be removed if the user confirms.

#### Scenario: Confirmation prompt shown on remove activation
- **WHEN** the user clicks the remove "×" control on a widget
- **THEN** a confirmation prompt appears asking the user to confirm the removal

#### Scenario: Widget removed on confirmation
- **WHEN** the user confirms the removal prompt
- **THEN** the widget is removed from the dashboard

---

### Requirement: Cancel removal without change
**Implements**: UC3-E3a - User cancels confirmation; widget remains unchanged
The system SHALL dismiss the confirmation prompt and leave the widget on the dashboard when the user cancels the removal.

#### Scenario: Widget retained on cancel
- **WHEN** the user dismisses the confirmation prompt without confirming
- **THEN** the confirmation prompt closes and the widget remains on the dashboard unchanged
