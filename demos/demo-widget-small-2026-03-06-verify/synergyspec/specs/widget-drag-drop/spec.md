# Spec: widget-drag-drop

## Purpose

The drag-and-drop interaction layer enabling users to rearrange widgets on a dashboard grid with snapping behaviour.

## Use Case Traceability

This spec implements the following use case steps:

| UC Step | Description |
|---------|-------------|
| UC1-S1 | User initiates a drag gesture on a widget |
| UC1-S2 | System lifts the widget visually and displays a drag preview following the pointer |
| UC1-S3 | User moves the pointer across the grid |
| UC1-S4 | System highlights the nearest valid grid cell(s) as a drop target as the pointer moves |
| UC1-S5 | User releases the pointer over the desired grid position |
| UC1-S6 | System snaps the widget to the nearest valid grid cell |
| UC1-S7 | System updates and persists the widget's grid position in the dashboard state |
| UC1-E4a | Pointer moves over an occupied cell — system indicates cell is unavailable |
| UC1-E5a | User releases pointer outside grid bounds — system cancels drag and restores original position |
| UC1-E5b | User releases pointer over occupied cell — system cancels drop and restores original position |
| UC2-S1 | User's pointer enters an empty grid area during a drag |
| UC2-S2 | System computes the grid cell(s) the widget would occupy at the pointer position |
| UC2-S3 | System highlights the target cell(s) to show the snap preview |
| UC2-S4 | User releases the pointer |
| UC2-S5 | System places the widget snapped to the computed cell(s) |
| UC2-S6 | System removes the drag preview and shows the widget in its final position |
| UC2-E2a | Widget would extend beyond grid boundary — system clamps position to keep widget within bounds |

## Requirements

### Requirement: Initiate widget drag
**Implements**: UC1-S1 - User initiates a drag gesture on a widget

The system SHALL allow any widget on the dashboard grid to be dragged by the user via pointer press-and-hold.

#### Scenario: Widget becomes draggable on press
- **WHEN** the user presses and holds on a widget
- **THEN** the system activates a drag operation for that widget

#### Scenario: Only one widget dragged at a time
- **WHEN** a drag operation is already in progress
- **THEN** the system SHALL NOT initiate a second drag operation for another widget

---

### Requirement: Display drag preview
**Implements**: UC1-S2 - System lifts the widget visually and displays a drag preview following the pointer

The system SHALL display a floating drag preview that visually represents the dragged widget and follows the pointer throughout the drag operation.

#### Scenario: Drag preview appears on drag start
- **WHEN** the user initiates a drag gesture on a widget
- **THEN** the system SHALL render a visual clone of the widget that tracks the pointer position

#### Scenario: Original slot remains visible during drag
- **WHEN** a drag operation is in progress
- **THEN** the system SHALL display the original widget slot in a dimmed state to indicate its current position

---

### Requirement: Track pointer movement over grid
**Implements**: UC1-S3 - User moves the pointer across the grid

The system SHALL continuously track pointer position during a drag and update the computed drop target in real time.

#### Scenario: Drop target updates on pointer move
- **WHEN** the user moves the pointer while dragging a widget
- **THEN** the system SHALL recompute the target grid cell(s) based on the current pointer coordinates

---

### Requirement: Highlight valid drop target
**Implements**: UC1-S4 - System highlights the nearest valid grid cell(s) as a drop target as the pointer moves; UC2-S3 - System highlights the target cell(s) to show the snap preview

The system SHALL visually highlight the grid cell(s) where the dragged widget would be placed, updating in real time as the pointer moves.

#### Scenario: Valid cell highlighted on hover
- **WHEN** the pointer is over an empty grid area during a drag
- **THEN** the system SHALL apply a highlight style to the target cell(s) the widget would occupy

#### Scenario: Occupied cell indicated as unavailable
- **WHEN** the pointer moves over a cell already occupied by another widget
- **THEN** the system SHALL display a "blocked" indicator on those cell(s) instead of a highlight

#### Scenario: Highlight updates continuously
- **WHEN** the pointer moves from one grid area to another during drag
- **THEN** the system SHALL remove the previous highlight and apply it to the new target cell(s)

---

### Requirement: Resolve drop on pointer release
**Implements**: UC1-S5 - User releases the pointer over the desired grid position; UC2-S4 - User releases the pointer

The system SHALL process the drop when the user releases the pointer, applying the result based on the validity of the drop target.

#### Scenario: Valid drop committed
- **WHEN** the user releases the pointer over a valid (empty, in-bounds) grid position
- **THEN** the system SHALL complete the drop and update the widget's position

#### Scenario: Out-of-bounds drop cancelled
- **WHEN** the user releases the pointer outside the grid bounds
- **THEN** the system SHALL cancel the drag and return the widget to its original position

#### Scenario: Occupied cell drop cancelled
- **WHEN** the user releases the pointer over an occupied cell
- **THEN** the system SHALL cancel the drop and return the widget to its original position

---

### Requirement: Snap widget to grid cell
**Implements**: UC1-S6 - System snaps the widget to the nearest valid grid cell; UC2-S2 - System computes the grid cell(s) the widget would occupy at the pointer position; UC2-S5 - System places the widget snapped to the computed cell(s)

The system SHALL compute the target grid cell from pointer coordinates and snap the widget to that cell on a valid drop.

#### Scenario: Pointer coordinates converted to grid cell
- **WHEN** the pointer is at a given position over the grid during drag
- **THEN** the system SHALL translate those coordinates to a `(col, row)` grid cell using the grid's cell dimensions and gap

#### Scenario: Widget snapped to computed cell on drop
- **WHEN** a valid drop occurs
- **THEN** the system SHALL position the widget at the computed `(col, row)` cell

#### Scenario: Multi-cell widget anchor computed correctly
- **WHEN** the dragged widget spans more than one column or row
- **THEN** the system SHALL compute the top-left anchor cell such that all spanned cells are within bounds

---

### Requirement: Clamp widget position within grid bounds
**Implements**: UC2-E2a - Widget would extend beyond grid boundary — system clamps position to keep widget within bounds

The system SHALL prevent a widget from being placed such that any part of it extends outside the grid boundary.

#### Scenario: Position clamped on boundary violation
- **WHEN** the computed drop position would cause the widget to extend beyond the grid edge
- **THEN** the system SHALL clamp the position to the nearest valid in-bounds cell

#### Scenario: Widget always fully visible after drop
- **WHEN** a widget is dropped anywhere on the grid
- **THEN** the system SHALL ensure the widget is fully contained within the grid bounds

---

### Requirement: Persist updated widget position in state
**Implements**: UC1-S7 - System updates and persists the widget's grid position in the dashboard state

The system SHALL update the dashboard layout state with the widget's new position after a successful drop, and notify the parent component via callback.

#### Scenario: State updated after valid drop
- **WHEN** a widget is successfully dropped at a new grid position
- **THEN** the system SHALL update the internal layout to reflect the new `(col, row)` for that widget

#### Scenario: Parent notified via onLayoutChange
- **WHEN** the layout state changes after a drop
- **THEN** the system SHALL invoke the `onLayoutChange` callback with the updated widget layout array

#### Scenario: State unchanged on cancelled drag
- **WHEN** a drag operation is cancelled (out-of-bounds or occupied cell)
- **THEN** the system SHALL NOT modify the layout state

---

### Requirement: Remove drag preview on drop or cancel
**Implements**: UC2-S6 - System removes the drag preview and shows the widget in its final position

The system SHALL remove the floating drag preview and restore the normal widget render at its final (or original) position when the drag ends.

#### Scenario: Drag overlay removed after successful drop
- **WHEN** a drag operation completes with a valid drop
- **THEN** the system SHALL unmount the drag overlay and render the widget at its new grid position

#### Scenario: Drag overlay removed after cancelled drag
- **WHEN** a drag operation is cancelled
- **THEN** the system SHALL unmount the drag overlay and render the widget at its original grid position
