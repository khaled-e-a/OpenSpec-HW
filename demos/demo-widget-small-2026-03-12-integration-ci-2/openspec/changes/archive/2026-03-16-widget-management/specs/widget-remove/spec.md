# Spec: widget-remove

Generated: 2026-03-13

## Overview
This spec implements requirements for the `widget-remove` capability — removing an existing widget from the dashboard grid via an inline remove control.

See `usecases.md` "Use Case Traceability Mapping" for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:

| Step | Description |
|------|-------------|
| UC2-S1 | User hovers over a widget; remove control becomes visible |
| UC2-S2 | User clicks the remove control on the target widget |
| UC2-S3 | System removes the widget from the grid |
| UC2-S4 | System leaves remaining widgets in their current positions |
| UC2-S5 | System persists the updated layout to local storage |
| UC2-E2a1 | System removes the widget immediately without a confirmation dialog |
| UC2-E2a2 | Removed widget becomes available again in the catalogue |
| UC2-E3a1 | System removes the last widget, leaving an empty grid |
| UC2-E3a2 | System persists the empty layout |

---

## ADDED Requirements

### Requirement: Show Remove Control on Hover
**Implements**: UC2-S1 - User hovers over a widget; remove control becomes visible
The system SHALL display a remove control on a widget when the user hovers over it. The control SHALL be hidden when the widget is not hovered and SHALL become visible on hover via a CSS transition.

#### Scenario: Remove control appears on hover
- **WHEN** the user moves the pointer over a widget
- **THEN** the widget's remove control becomes visible

#### Scenario: Remove control hidden at rest
- **WHEN** the pointer is not hovering over a widget
- **THEN** the widget's remove control is not visible

---

### Requirement: Remove Widget Immediately on Click
**Implements**: UC2-S2 - User clicks the remove control on the target widget; UC2-E2a1 - System removes the widget immediately without a confirmation dialog
The system SHALL remove the target widget from the grid immediately when the user clicks its remove control, without displaying a confirmation dialog.

#### Scenario: Widget removed on remove control click
- **WHEN** the user clicks the remove control on a widget
- **THEN** the widget is immediately removed from the dashboard grid
- **THEN** no confirmation dialog is shown

---

### Requirement: Preserve Remaining Widget Positions
**Implements**: UC2-S3 - System removes the widget from the grid; UC2-S4 - System leaves remaining widgets in their current positions
The system SHALL remove only the target widget from the layout. All other widgets SHALL retain their current grid positions and sizes unchanged.

#### Scenario: Remaining widgets unaffected
- **WHEN** a widget is removed
- **THEN** all other widgets remain at their previous grid positions
- **THEN** all other widgets retain their previous sizes

---

### Requirement: Persist Layout After Remove
**Implements**: UC2-S5 - System persists the updated layout to local storage; UC2-E3a2 - System persists the empty layout
The system SHALL write the updated layout to `localStorage` immediately after a widget is removed, including the case where the last widget is removed (resulting in an empty layout array).

#### Scenario: Layout saved after remove
- **WHEN** a widget is successfully removed
- **THEN** the updated layout (without the removed widget) is written to `localStorage`

#### Scenario: Empty layout saved when last widget removed
- **WHEN** the last widget on the grid is removed
- **THEN** an empty layout array is written to `localStorage`

---

### Requirement: Allow Re-Adding Removed Widgets
**Implements**: UC2-E2a2 - Removed widget becomes available again in the catalogue
The system SHALL make a removed widget available in the widget catalogue immediately after removal, so the user can re-add it.

#### Scenario: Removed widget appears in catalogue
- **WHEN** a widget is removed from the grid
- **THEN** that widget appears in the widget catalogue as an available option

---

### Requirement: Support Removing Last Widget
**Implements**: UC2-E3a1 - System removes the last widget, leaving an empty grid
The system SHALL permit removing the last widget from the grid. The result SHALL be an empty grid with no widgets rendered.

#### Scenario: Empty grid after last widget removed
- **WHEN** the user removes the only remaining widget on the grid
- **THEN** the dashboard grid is empty (no widgets rendered)
- **THEN** the "Add widget" control remains accessible so the user can repopulate the grid
