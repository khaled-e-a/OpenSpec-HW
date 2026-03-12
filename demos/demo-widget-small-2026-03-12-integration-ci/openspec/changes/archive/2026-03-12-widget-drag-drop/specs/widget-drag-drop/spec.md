# Spec: widget-drag-drop

Generated: 2026-03-12

## Overview
This spec implements requirements for the widget-drag-drop capability.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:
- UC1-S1: User initiates drag on a widget
- UC1-S2: System shows drag preview at original position
- UC1-S3: User moves pointer across the grid
- UC1-S4: System highlights valid drop zones
- UC1-S5: User releases widget over a target grid cell
- UC1-S6: System snaps widget to nearest valid grid position
- UC1-S7: System updates layout state with new position
- UC1-E5a: Target cell is occupied — system prevents drop with feedback
- UC1-E5b: User cancels drag — system returns widget to original position
- UC2-S1: User locates resize handle on widget
- UC2-S2: User begins dragging resize handle
- UC2-S3: System shows live resize preview
- UC2-S4: User releases handle at desired size
- UC2-S5: System snaps widget size to whole grid cell dimensions
- UC2-S6: System checks for overlap with adjacent widgets
- UC2-S7: System updates layout state with new size
- UC2-E4a: Resize would overlap adjacent widget — system caps at boundary
- UC2-E4b: Resize would exceed grid boundary — system constrains to grid edge
- UC2-E4c: User cancels resize — system restores original size

## ADDED Requirements

### Requirement: Initiate Widget Drag
**Implements**: UC1-S1 - User initiates drag on a widget
The system SHALL allow a user to begin dragging any widget by pressing and holding the pointer on it.

#### Scenario: Drag initiated on widget
- **WHEN** the user presses and holds the pointer on a widget
- **THEN** the system enters drag mode for that widget

---

### Requirement: Show Drag Preview
**Implements**: UC1-S2 - System shows drag preview at original position
The system SHALL display a ghost/preview element at the widget's original grid position while a drag is in progress.

#### Scenario: Preview visible during drag
- **WHEN** the user is dragging a widget
- **THEN** the system renders a semi-transparent placeholder at the widget's original position

---

### Requirement: Track Pointer Over Grid
**Implements**: UC1-S3 - User moves pointer across the grid
The system SHALL continuously track the pointer position and translate it to grid cell coordinates during a drag.

#### Scenario: Pointer tracked to grid cell
- **WHEN** the user moves the pointer while dragging a widget
- **THEN** the system computes the candidate grid cell (x, y) under the pointer on every pointer-move event

---

### Requirement: Highlight Valid Drop Zones
**Implements**: UC1-S4 - System highlights valid drop zones
The system SHALL visually distinguish valid and invalid candidate drop positions as the user drags a widget.

#### Scenario: Valid candidate position highlighted
- **WHEN** the pointer is over an unoccupied grid area during drag
- **THEN** the system renders the candidate drop zone with a "valid" visual indicator (e.g., green tint)

#### Scenario: Invalid candidate position indicated
- **WHEN** the pointer is over an occupied grid area during drag
- **THEN** the system renders the candidate drop zone with an "invalid" visual indicator (e.g., red tint)

---

### Requirement: Accept Widget Drop
**Implements**: UC1-S5, UC1-S6 - User releases widget; system snaps to nearest valid grid position
The system SHALL snap the widget to the nearest valid grid cell and complete the drop when the user releases the pointer over a valid drop zone.

#### Scenario: Widget snaps to grid on release
- **WHEN** the user releases a dragged widget over an unoccupied grid position
- **THEN** the widget is placed at the snapped grid cell (x, y) rounded to integer cell coordinates

---

### Requirement: Update Layout State After Move
**Implements**: UC1-S7 - System updates layout state with new position
The system SHALL invoke the `onLayoutChange` callback with the updated layout array after a successful drop.

#### Scenario: Layout state updated on drop
- **WHEN** a widget is successfully dropped at a new position
- **THEN** the system calls `onLayoutChange` with the new `LayoutItem[]` reflecting the updated (x, y) for that widget

---

### Requirement: Prevent Drop on Occupied Cell
**Implements**: UC1-E5a - Target cell is occupied — system prevents drop with feedback
The system SHALL block a drop and provide visual feedback when the target position is occupied by another widget.

#### Scenario: Drop blocked on occupied cell
- **WHEN** the user releases a dragged widget over a grid area occupied by another widget
- **THEN** the system cancels the drop, returns the widget to its original position, and shows an invalid-position indicator

---

### Requirement: Cancel Drag and Restore Position
**Implements**: UC1-E5b - User cancels drag — system returns widget to original position
The system SHALL return the widget to its original grid position when the user cancels a drag operation (e.g., presses Escape).

#### Scenario: Drag cancelled via Escape key
- **WHEN** the user presses Escape during an active drag
- **THEN** the system exits drag mode and renders the widget at its pre-drag position

#### Scenario: Drag cancelled by release outside grid
- **WHEN** the user releases the pointer outside the grid boundary
- **THEN** the system exits drag mode and renders the widget at its pre-drag position

---

### Requirement: Show Resize Handle
**Implements**: UC2-S1 - User locates resize handle on widget
The system SHALL render a visible resize handle on each widget, accessible on hover.

#### Scenario: Resize handle visible on hover
- **WHEN** the user moves the pointer over a widget
- **THEN** the system displays a resize handle at the widget's bottom-right corner

---

### Requirement: Initiate Widget Resize
**Implements**: UC2-S2 - User begins dragging resize handle
The system SHALL allow a user to begin resizing a widget by dragging its resize handle.

#### Scenario: Resize initiated on handle drag
- **WHEN** the user presses and holds the pointer on the resize handle
- **THEN** the system enters resize mode for that widget

---

### Requirement: Show Live Resize Preview
**Implements**: UC2-S3 - System shows live resize preview
The system SHALL render a live preview of the widget's new dimensions as the resize handle is dragged.

#### Scenario: Resize preview updates during drag
- **WHEN** the user is dragging the resize handle
- **THEN** the system continuously updates a preview outline showing the widget's candidate new size in grid cells

---

### Requirement: Snap Resize to Grid Cell Dimensions
**Implements**: UC2-S4, UC2-S5 - User releases handle; system snaps size to whole grid cell dimensions
The system SHALL snap the widget's width and height to the nearest whole grid cell dimensions when the resize handle is released.

#### Scenario: Widget size snapped on release
- **WHEN** the user releases the resize handle
- **THEN** the widget width and height are rounded to integer grid cell counts (w ≥ 1, h ≥ 1)

---

### Requirement: Validate Resize Against Adjacent Widgets
**Implements**: UC2-S6, UC2-E4a - System checks for overlap; resize caps at boundary of nearest occupied cell
The system SHALL prevent a resize that would cause the widget to overlap an adjacent widget, capping the size at the boundary of the nearest occupied cell.

#### Scenario: Resize capped at adjacent widget boundary
- **WHEN** the candidate resized dimensions would overlap another widget
- **THEN** the system caps the width/height at the last valid non-overlapping size in that direction

---

### Requirement: Constrain Resize to Grid Boundary
**Implements**: UC2-E4b - Resize would exceed grid boundary — system constrains to grid edge
The system SHALL prevent a resize that would extend beyond the grid's column or row boundary.

#### Scenario: Resize constrained at grid edge
- **WHEN** the candidate resized dimensions would exceed the grid's total columns or rows
- **THEN** the system caps the width/height so the widget fits within the grid boundary

---

### Requirement: Update Layout State After Resize
**Implements**: UC2-S7 - System updates layout state with new size
The system SHALL invoke the `onLayoutChange` callback with the updated layout array after a successful resize.

#### Scenario: Layout state updated on resize
- **WHEN** a widget is successfully resized
- **THEN** the system calls `onLayoutChange` with the new `LayoutItem[]` reflecting the updated (w, h) for that widget

---

### Requirement: Cancel Resize and Restore Size
**Implements**: UC2-E4c - User cancels resize — system restores original size
The system SHALL restore the widget's original dimensions when the user cancels a resize operation (e.g., presses Escape).

#### Scenario: Resize cancelled via Escape key
- **WHEN** the user presses Escape during an active resize
- **THEN** the system exits resize mode and renders the widget at its pre-resize dimensions
