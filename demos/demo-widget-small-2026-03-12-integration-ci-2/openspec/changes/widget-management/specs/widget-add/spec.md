# Spec: widget-add

Generated: 2026-03-13

## Overview
This spec implements requirements for the `widget-add` capability — browsing the widget catalogue and adding a new widget to the dashboard grid.

See `usecases.md` "Use Case Traceability Mapping" for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User opens the widget catalogue |
| UC1-S2 | System displays available widgets not currently on the grid |
| UC1-S3 | User selects a widget from the catalogue |
| UC1-S4 | System finds the first available grid position for the new widget |
| UC1-S5 | System places the widget at that position with a default size |
| UC1-S6 | System closes the catalogue |
| UC1-S7 | System persists the updated layout to local storage |
| UC1-E2a1 | System displays an empty catalogue when all widgets are already on the grid |
| UC1-E4a1 | System displays an error when no grid space is available for the new widget |
| UC1-E4a2 | System does not add the widget when no space is available |

---

## ADDED Requirements

### Requirement: Open Widget Catalogue
**Implements**: UC1-S1 - User opens the widget catalogue
The system SHALL provide a control (e.g., an "Add widget" button) on the dashboard that opens the widget catalogue when activated.

#### Scenario: Catalogue opens on trigger
- **WHEN** the user activates the "Add widget" control
- **THEN** the system displays the widget catalogue

#### Scenario: Catalogue closes on dismiss
- **WHEN** the user dismisses the catalogue without selecting a widget
- **THEN** the catalogue is hidden and the dashboard layout is unchanged

---

### Requirement: Display Available Widgets
**Implements**: UC1-S2 - System displays available widgets not currently on the grid; UC1-E2a1 - System displays an empty catalogue when all widgets are already on the grid
The system SHALL display only those widgets from the registry that are not currently present on the dashboard grid. If all widgets are already on the grid, the system SHALL display an empty catalogue with an explanatory message.

#### Scenario: Catalogue shows only absent widgets
- **WHEN** the catalogue is open
- **THEN** each widget listed is not currently present on the dashboard grid
- **THEN** widgets already on the grid are not listed

#### Scenario: Empty catalogue when all widgets present
- **WHEN** the catalogue is open and every widget in the registry is already on the grid
- **THEN** the catalogue displays a message indicating no widgets are available to add

---

### Requirement: Select Widget from Catalogue
**Implements**: UC1-S3 - User selects a widget from the catalogue
The system SHALL allow the user to select one widget from the catalogue list. Selection SHALL immediately trigger the placement flow.

#### Scenario: Widget selected triggers placement
- **WHEN** the user clicks a widget entry in the catalogue
- **THEN** the system initiates the auto-placement flow for that widget

---

### Requirement: Auto-Place New Widget
**Implements**: UC1-S4 - System finds the first available grid position for the new widget; UC1-S5 - System places the widget at that position with a default size; UC1-E4a1 - System displays an error when no grid space is available; UC1-E4a2 - System does not add the widget when no space is available
The system SHALL automatically place a newly added widget at the first available non-overlapping grid position, using a default size of 4 columns × 2 rows. If no valid position exists, the system SHALL display an error and SHALL NOT add the widget.

#### Scenario: Widget placed at first available position
- **WHEN** the user selects a widget and at least one valid grid position exists
- **THEN** the widget appears on the grid at the first available non-overlapping position
- **THEN** the widget has a default size of 4 columns × 2 rows

#### Scenario: Error shown when grid is full
- **WHEN** the user selects a widget and no valid grid position exists for the default size
- **THEN** the system displays an error message indicating there is not enough space
- **THEN** the widget is not added to the grid

#### Scenario: No overlap after placement
- **WHEN** a widget is successfully added
- **THEN** no two widgets share the same grid cells

---

### Requirement: Close Catalogue After Add
**Implements**: UC1-S6 - System closes the catalogue
The system SHALL close the widget catalogue automatically after a widget is successfully added to the grid.

#### Scenario: Catalogue closes after successful add
- **WHEN** a widget is successfully placed on the grid
- **THEN** the catalogue is hidden

---

### Requirement: Persist Layout After Add
**Implements**: UC1-S7 - System persists the updated layout to local storage
The system SHALL write the updated layout to `localStorage` immediately after a widget is successfully added.

#### Scenario: Layout saved after add
- **WHEN** a widget is successfully added to the grid
- **THEN** the updated layout (including the new widget entry) is written to `localStorage`

#### Scenario: Layout not saved when add fails
- **WHEN** a widget add fails (e.g., no space)
- **THEN** `localStorage` is not modified
