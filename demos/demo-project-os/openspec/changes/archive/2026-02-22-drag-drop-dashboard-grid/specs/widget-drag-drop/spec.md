## ADDED Requirements

### Requirement: Drag initiation
A widget SHALL become draggable by default. When the user begins dragging a widget, the system SHALL record the widget's `id` and its starting grid position as the active drag state.

#### Scenario: Drag starts on mouse down and move
- **WHEN** the user clicks and drags a widget
- **THEN** the widget SHALL enter a dragging state and the active drag context SHALL store the widget's `id` and original `col`/`row`

#### Scenario: Non-draggable widget ignores drag events
- **WHEN** a widget is rendered with `draggable={false}`
- **THEN** the widget SHALL NOT respond to drag gestures and SHALL remain in place

### Requirement: Visual drag feedback
While a widget is being dragged, the system SHALL provide visual feedback: the dragged widget SHALL render at reduced opacity, and a ghost placeholder SHALL appear at the current target cell to preview where the widget will land.

#### Scenario: Dragged widget becomes translucent
- **WHEN** a widget is actively being dragged
- **THEN** the widget's opacity SHALL be reduced to 0.5

#### Scenario: Ghost placeholder appears at target cell
- **WHEN** the dragged widget's pointer is over a valid target cell
- **THEN** a semi-transparent placeholder element SHALL be rendered at that cell with the widget's colSpan and rowSpan dimensions

#### Scenario: Ghost disappears on drag end
- **WHEN** the drag operation ends (drop or cancel)
- **THEN** the ghost placeholder SHALL be removed from the grid

### Requirement: Target cell computation
The system SHALL compute the target grid cell from the pointer's position relative to the grid container. The target cell SHALL be the grid cell whose top-left corner is nearest to the pointer's position, clamped to grid boundaries.

#### Scenario: Pointer over cell center maps to that cell
- **WHEN** the pointer is positioned over the center of cell (col=3, row=2)
- **THEN** the computed target cell SHALL be (col=3, row=2)

#### Scenario: Pointer near grid edge clamps to boundary
- **WHEN** the pointer moves beyond the last column or row
- **THEN** the target cell SHALL clamp to the last valid column or row that fits the widget's colSpan/rowSpan

### Requirement: Drop collision detection
The system SHALL prevent a widget from being dropped onto a cell that is already occupied by another widget. A cell is considered occupied if any part of the dropped widget's bounding box (colSpan × rowSpan) overlaps with any part of another widget's bounding box.

#### Scenario: Drop onto occupied cell is blocked
- **WHEN** the user releases a widget over a cell that is fully or partially occupied by another widget
- **THEN** the drop SHALL be rejected and the widget SHALL return to its original position

#### Scenario: Drop onto empty cells succeeds
- **WHEN** the user releases a widget over a region of cells that are all unoccupied
- **THEN** the drop SHALL succeed and the widget SHALL move to the target position

#### Scenario: Widget may overlap its own original position
- **WHEN** a widget is dropped back onto its own original position or a position that overlaps only itself
- **THEN** the drop SHALL succeed

### Requirement: Drop cancellation
If the user releases the drag outside the grid boundaries or presses Escape during a drag, the system SHALL cancel the drag and return the widget to its original position.

#### Scenario: Drop outside the grid cancels
- **WHEN** the user releases the drag pointer outside the `DashboardGrid` container
- **THEN** the widget SHALL revert to its original `col`/`row`

#### Scenario: Escape key cancels drag
- **WHEN** the user presses the Escape key while dragging a widget
- **THEN** the drag SHALL be cancelled and the widget SHALL return to its original position
