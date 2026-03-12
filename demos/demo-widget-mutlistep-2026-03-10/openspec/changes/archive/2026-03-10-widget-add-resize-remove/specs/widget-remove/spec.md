# Spec: widget-remove

Generated: 2026-03-10

## Overview

This spec defines requirements for the `widget-remove` capability — removing an individual widget from the dashboard grid via a per-widget remove control.

## Use Case Traceability

This spec implements the following use case steps:

| Step | Description |
|------|-------------|
| UC3-S1 | User activates the Remove control on a widget |
| UC3-S2 | System removes the widget from layout state |
| UC3-S3 | System re-renders the grid; occupied cells are now empty |
| UC3-S4 | `onLayoutChange` called with updated array without the removed widget |
| UC3-E1a | User removes the last remaining widget — grid renders empty, `onLayoutChange` called with empty array |

---

## ADDED Requirements

### Requirement: Per-Widget Remove Control

**Implements**: UC3-S1 - User activates the Remove control on a widget

Each widget SHALL render a visible remove control (e.g., a × button). Activating the remove control SHALL initiate widget removal and SHALL NOT initiate a drag or resize operation.

#### Scenario: Remove control visible on each widget

- **WHEN** the dashboard is rendered with at least one widget
- **THEN** each widget displays a remove control within or adjacent to its bounds

#### Scenario: Activating remove control does not trigger drag

- **WHEN** the user activates the remove control on a widget
- **THEN** no drag operation is initiated for that widget

---

### Requirement: Remove Widget from Layout

**Implements**: UC3-S2 - System removes the widget from layout state
**Implements**: UC3-S3 - System re-renders the grid; occupied cells are now empty
**Implements**: UC3-S4 - `onLayoutChange` called with updated array without the removed widget

When the remove control is activated, the system SHALL remove the corresponding widget entry from the layout array and invoke `onLayoutChange` with the updated array. The grid SHALL re-render without the removed widget; its previously occupied cells SHALL be empty.

#### Scenario: Widget removed from layout

- **WHEN** the user activates the remove control on a widget
- **THEN** `onLayoutChange` is called with a layout array that does not contain the removed widget's entry

#### Scenario: Removed widget's cells become available

- **WHEN** a widget is removed
- **THEN** the grid cells it previously occupied are no longer rendered as occupied and are available for future widgets

---

### Requirement: Remove Last Widget

**Implements**: UC3-E1a - User removes the last remaining widget — grid renders as empty, `onLayoutChange` called with empty array

Removing the last widget from the dashboard SHALL be permitted. The system SHALL call `onLayoutChange` with an empty array and the grid SHALL render as empty.

#### Scenario: Removing last widget empties the grid

- **WHEN** the user activates the remove control on the only remaining widget
- **THEN** `onLayoutChange` is called with an empty array `[]` and the grid renders with no widgets
