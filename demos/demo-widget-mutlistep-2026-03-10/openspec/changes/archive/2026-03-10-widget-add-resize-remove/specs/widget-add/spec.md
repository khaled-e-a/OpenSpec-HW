# Spec: widget-add

Generated: 2026-03-10

## Overview

This spec defines requirements for the `widget-add` capability — adding a new widget to the dashboard grid at the first available cell.

## Use Case Traceability

This spec implements the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User activates the Add Widget control |
| UC1-S2 | System finds the first available grid cell (left-to-right, top-to-bottom) |
| UC1-S3 | System creates a new widget entry with default size (1×1) at the found cell |
| UC1-S4 | System updates layout state and re-renders the grid with the new widget |
| UC1-S5 | New widget is visible and available for interaction |
| UC1-E1a | No unoccupied cell exists — Add Widget control is disabled/unavailable |

---

## ADDED Requirements

### Requirement: Provide Add Widget Control

**Implements**: UC1-S1 - User activates the Add Widget control
**Implements**: UC1-E1a - No unoccupied cell exists — Add Widget control is disabled/unavailable

The system SHALL provide a visible, activatable control (e.g., a button labelled "Add Widget") that allows the user to add a new widget to the dashboard.

#### Scenario: Control is visible when grid has capacity

- **WHEN** the dashboard is rendered and at least one grid cell is unoccupied
- **THEN** the Add Widget control is visible and enabled

#### Scenario: Control is disabled when grid is full

- **WHEN** every grid cell is occupied by a widget
- **THEN** the Add Widget control SHALL be disabled or visually indicate unavailability (UC1-E1a)

---

### Requirement: Find First Available Cell

**Implements**: UC1-S2 - System finds the first available grid cell (left-to-right, top-to-bottom)

When the Add Widget control is activated, the system SHALL identify the first unoccupied 1×1 grid cell by scanning left-to-right within each row, starting from the top row.

#### Scenario: First empty cell found left-to-right, top-to-bottom

- **WHEN** the Add Widget control is activated and there are one or more unoccupied cells
- **THEN** the system selects the first unoccupied cell found scanning columns 0…(cols−1) for row 0, then row 1, and so on

#### Scenario: No cell available — no widget created

- **WHEN** the Add Widget control is activated and all grid cells are occupied
- **THEN** no new widget is created and the layout is unchanged (UC1-E1a)

---

### Requirement: Create Default-Size Widget

**Implements**: UC1-S3 - System creates a new widget entry with default size (1×1) at the found cell

The system SHALL create a new `WidgetLayout` entry with `w: 1`, `h: 1`, a unique `id`, and `col`/`row` set to the found cell coordinates.

#### Scenario: New widget has correct default properties

- **WHEN** a valid empty cell is found and a widget is created
- **THEN** the new widget entry has `w: 1`, `h: 1`, and `col`/`row` matching the found cell

#### Scenario: New widget ID is unique

- **WHEN** a new widget is created
- **THEN** its `id` does not collide with any existing widget `id` in the current layout

---

### Requirement: Update Layout State

**Implements**: UC1-S4 - System updates layout state and re-renders the grid with the new widget
**Implements**: UC1-S5 - New widget is visible and available for interaction

The system SHALL append the new widget to the layout array and invoke the `onLayoutChange` callback with the updated array. The grid SHALL re-render showing the new widget at its assigned cell.

#### Scenario: Layout callback called with new widget

- **WHEN** a new widget is successfully created
- **THEN** `onLayoutChange` is called with an array that includes the new widget entry

#### Scenario: New widget rendered and interactive

- **WHEN** the layout is updated with the new widget
- **THEN** the new widget is rendered on the grid at `(col, row)` and supports drag, resize, and remove interactions
