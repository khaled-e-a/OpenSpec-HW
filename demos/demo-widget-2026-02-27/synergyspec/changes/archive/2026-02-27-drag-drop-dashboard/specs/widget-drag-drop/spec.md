## ADDED Requirements

### Requirement: Drag is initiated by pointer-down on a widget's drag handle
The system SHALL initiate a drag interaction when the user triggers a `pointerdown` event on a widget's designated drag handle element. The system SHALL call `setPointerCapture` on the handle element to track pointer movement outside its bounds. The real widget SHALL remain visible at its original position with reduced opacity during drag.

#### Scenario: Drag starts on handle pointer-down
- **WHEN** the user presses the pointer on a widget's drag handle
- **THEN** the drag interaction begins, the widget's opacity is reduced, and the system captures the pointer

#### Scenario: Drag does not start on widget body
- **WHEN** the user presses the pointer on the widget body (outside the drag handle)
- **THEN** no drag interaction is initiated

---

### Requirement: Ghost renders at the snapped target position during drag
The system SHALL render a `GhostWidget` as a sibling element inside the grid container during an active drag. The ghost SHALL display at the nearest valid snapped grid cell as the pointer moves. The ghost SHALL be visually distinct (semi-transparent) and SHALL highlight the target drop zone.

#### Scenario: Ghost appears at drag start
- **WHEN** a drag is initiated on a widget
- **THEN** a ghost element appears at the widget's original grid position

#### Scenario: Ghost follows pointer and snaps to nearest cell
- **WHEN** the user moves the pointer across the grid during a drag
- **THEN** the ghost updates its position on each `pointermove` to the nearest valid grid cell beneath the pointer's top-left offset, snapping to whole-cell boundaries

#### Scenario: Ghost does not appear outside of active drag
- **WHEN** no drag interaction is in progress
- **THEN** no ghost element is present in the grid

---

### Requirement: Pointer coordinates are clamped to grid boundaries during drag
The system SHALL clamp the ghost's computed target position so that it never extends beyond the grid's column or row boundaries. The ghost SHALL remain fully inside the grid at all times during drag.

#### Scenario: Drag near right edge clamps to last valid column
- **WHEN** the user drags a widget so that its ghost would extend beyond the last column
- **THEN** the ghost is clamped so its rightmost cell is the last grid column

#### Scenario: Drag beyond top edge clamps to row 0
- **WHEN** the user drags a widget above the grid's top boundary
- **THEN** the ghost is clamped to row 0

---

### Requirement: Drop commits the widget to the snapped target position
The system SHALL update the layout state with the widget's new grid coordinates when the user releases the pointer. The ghost SHALL be removed and the widget SHALL render at its new position. The system SHALL verify the target cells are unoccupied before committing.

#### Scenario: Valid drop updates widget position
- **WHEN** the user releases the pointer over an unoccupied target cell
- **THEN** the layout state is updated with the widget's new `x` and `y`, the ghost is removed, and the widget renders at the new position

#### Scenario: Drop on occupied cells is rejected
- **WHEN** the user releases the pointer over cells occupied by another widget
- **THEN** the layout state is not changed, the ghost shakes to signal an invalid drop, and the widget returns to its original position

---

### Requirement: Escape key cancels an in-progress drag
The system SHALL cancel the active drag interaction when the user presses the Escape key before releasing the pointer. The widget SHALL return to its original position and the ghost SHALL be removed.

#### Scenario: Escape restores widget to original position
- **WHEN** a drag is in progress and the user presses Escape
- **THEN** the drag is cancelled, the ghost is removed, and the widget is rendered at its pre-drag position with full opacity

#### Scenario: Escape during drag does not alter layout state
- **WHEN** a drag is cancelled via Escape
- **THEN** the layout state is identical to its state before the drag began
