## ADDED Requirements

### Requirement: Initiate drag on widget

The system SHALL allow a user to begin dragging a widget by pressing and holding (mousedown / touchstart) on the widget's drag handle. While a drag is active no other widget drag SHALL be startable simultaneously.

#### Scenario: Drag begins on handle press
- **WHEN** the user presses the pointer down on a widget's drag handle
- **THEN** a drag operation SHALL start for that widget

#### Scenario: Only one drag active at a time
- **WHEN** a drag is already in progress
- **THEN** attempting to start a drag on another widget SHALL have no effect

---

### Requirement: Ghost preview during drag

The system SHALL display a semi-transparent ghost copy of the widget that follows the pointer position throughout the drag operation. The ghost SHALL be rendered in a portal (above all other content) so it is never clipped by `overflow: hidden` containers.

#### Scenario: Ghost visible during drag
- **WHEN** a drag operation is active
- **THEN** a ghost element matching the widget's dimensions SHALL be visible and SHALL track the pointer

#### Scenario: Ghost removed on drag end
- **WHEN** the drag operation ends (drop or cancel)
- **THEN** the ghost element SHALL be removed from the DOM

---

### Requirement: Live snap indicator

The system SHALL highlight the target grid cell(s) in real time as the pointer moves during a drag, showing where the widget will land if dropped. Valid targets SHALL be visually distinct from invalid (occupied or out-of-bounds) targets.

#### Scenario: Valid cell highlighted
- **WHEN** the pointer is over an unoccupied region that fits the widget
- **THEN** the target cells SHALL render with a "valid drop" highlight style

#### Scenario: Invalid cell highlighted
- **WHEN** the pointer is over an occupied region or outside the grid boundary
- **THEN** the target cells SHALL render with an "invalid drop" highlight style

---

### Requirement: Drop commits widget to snapped cell

The system SHALL finalize the widget's new position on pointer release. The widget SHALL animate from the ghost position to the snapped grid cell. The layout SHALL update atomically — the widget must not appear in both the old and new position.

#### Scenario: Successful drop
- **WHEN** the user releases the pointer over a valid grid cell
- **THEN** the widget SHALL move to the snapped cell and the layout SHALL be updated

#### Scenario: Drop on invalid target returns widget
- **WHEN** the user releases the pointer over an occupied cell or outside the grid
- **THEN** the widget SHALL return to its original position and the layout SHALL be unchanged

---

### Requirement: Cancel drag with Escape

The system SHALL cancel the active drag operation when the user presses the Escape key, returning the widget to its original position with no layout change.

#### Scenario: Escape cancels drag
- **WHEN** a drag is in progress and the user presses Escape
- **THEN** the ghost SHALL be removed and the widget SHALL render at its original position

---

### Requirement: Touch drag support

All drag interactions SHALL function on touch devices using touchstart / touchmove / touchend events (or unified pointer events). The ghost preview SHALL render and the snap indicator SHALL update during touch drag.

#### Scenario: Touch drag repositions widget
- **WHEN** the user long-presses and drags a widget on a touch screen
- **THEN** the drag, preview, and snap behavior SHALL be identical to mouse drag

---

## Use Case Requirements

### UC-01: Drag Widget to a New Position

**Name**: Drag Widget to New Position

**Actors**: Dashboard user

**Preconditions**:
- The dashboard is rendered with at least one widget placed on the grid
- The user's device supports pointer events (mouse or touch)

**Trigger**: The user presses and holds (mousedown / touchstart) on a widget's drag handle or body

**Main Scenario**:
1. User initiates drag on a widget
2. A semi-transparent ghost/preview of the widget follows the pointer
3. As the pointer moves, the nearest valid grid cell highlights to show the drop target
4. User releases the pointer over a valid grid cell
5. The widget animates to its new grid position
6. Layout state updates to reflect the new position

**Alternative Flows**:
- A2: User drags to a cell already occupied by another widget → occupied cells are highlighted as invalid; the widget cannot be dropped there
- A3: User drags to a position outside the grid boundary → drop is rejected; widget returns to its original position

**Exception / Error Flows**:
- E1: Drag is cancelled via Escape key → widget snaps back to its original position with no state change

**Postconditions**:
- The widget occupies the new grid cell(s)
- All other widgets remain in their previous positions (no automatic reflow)
- Layout state is persisted

---

### UC-02: Snap Widget to Grid Cell

**Name**: Snap Widget to Grid Cell on Drop

**Actors**: Dashboard user, grid layout engine

**Preconditions**:
- A drag operation is in progress (UC-01 triggered)

**Trigger**: The user releases the pointer (mouseup / touchend) while over the grid

**Main Scenario**:
1. The layout engine calculates the grid cell nearest to the pointer's drop coordinates
2. The engine checks that the target cell(s) are unoccupied and within bounds
3. The widget is placed flush to the top-left corner of the target cell
4. The ghost preview is removed; the widget renders at the snapped position

**Alternative Flows**:
- A1: Nearest cell is occupied → engine finds the closest available cell and proposes it as fallback; visual indicator shows the adjusted position

**Exception / Error Flows**:
- E1: Grid has no available cell → widget returns to its original position; a brief error indication is shown

**Postconditions**:
- Widget position is a multiple of the grid cell unit (no fractional placement)
- Layout is consistent — no overlapping widgets
