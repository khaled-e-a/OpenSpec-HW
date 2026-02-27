## ADDED Requirements

### Requirement: Drag is initiated by press-and-hold on a drag handle
The system SHALL activate drag mode when the user initiates a press-and-hold pointer gesture on a widget's designated drag handle element. The drag handle SHALL be a distinct, visually identifiable region of the widget header. Drag SHALL be implemented using `@dnd-kit/core` Pointer Events and SHALL work on both mouse and touch devices.

#### Scenario: Drag initiated on drag handle
- **WHEN** the user presses and holds the drag handle of a widget
- **THEN** the system enters drag mode: the source widget becomes semi-transparent and a ghost preview appears at the widget's current snapped position

#### Scenario: Drag not initiated outside handle
- **WHEN** the user presses and holds anywhere on the widget body that is not the drag handle
- **THEN** no drag mode is entered and the widget remains interactive normally

---

### Requirement: Ghost preview tracks pointer position snapped to grid
During an active drag, the system SHALL render a ghost element (via `DragOverlay`) that tracks the pointer and displays the widget's snapped candidate position in real time. The ghost SHALL use the snap algorithm defined in `grid-layout` to compute `{ x, y }` from the current pointer offset.

#### Scenario: Ghost updates on pointer move
- **WHEN** the user moves the pointer to a new position during an active drag
- **THEN** the ghost preview repositions to the snapped grid cell nearest to the pointer

#### Scenario: Ghost stays within grid on boundary exit
- **WHEN** the pointer moves outside the grid boundary during drag
- **THEN** the ghost preview remains at the last valid snapped position inside the grid

---

### Requirement: Drop zone validity is indicated visually
The system SHALL highlight the target cell range green when the candidate position is unoccupied and red when it overlaps any existing widget (excluding the dragged widget itself). The validity indicator SHALL update continuously as the pointer moves.

#### Scenario: Valid drop zone highlighted
- **WHEN** the dragged widget's ghost is over an unoccupied cell range
- **THEN** the target cell range is highlighted green

#### Scenario: Invalid drop zone highlighted
- **WHEN** the dragged widget's ghost overlaps an existing widget
- **THEN** the target cell range is highlighted red

---

### Requirement: Drag Widget to a New Position — successful drop commits layout change
When the user releases the pointer over a valid (unoccupied) target cell, the system SHALL move the widget to the snapped grid position, update the layout state, and invoke `onLayoutChange` with the complete updated layout array. The source widget SHALL return to full opacity and drag mode SHALL exit.

#### Scenario: Drag Widget to a New Position — happy path
- **WHEN** the user releases the pointer over a valid target cell after dragging
- **THEN** the widget moves to the new snapped position, `onLayoutChange` is invoked with the updated layout, and the dashboard returns to normal interactive state

#### Scenario: No two widgets overlap after drop
- **WHEN** a drag drop completes successfully
- **THEN** every widget in the updated layout occupies a unique, non-overlapping set of grid cells

---

### Requirement: Drop over invalid zone cancels the drag
When the user releases the pointer over a cell range that overlaps an existing widget, the system SHALL cancel the drag and return the widget to its original grid position. `onLayoutChange` SHALL NOT be called.

#### Scenario: Drop on occupied zone reverts position
- **WHEN** the user releases the pointer over a cell range occupied by another widget
- **THEN** the dragged widget returns to its original position and `onLayoutChange` is not invoked

---

### Requirement: Escape key cancels an active drag
The system SHALL cancel the current drag interaction when the user presses the Escape key and return the widget to its original position. `onLayoutChange` SHALL NOT be called on cancellation.

#### Scenario: Escape cancels drag
- **WHEN** the user presses Escape during an active drag
- **THEN** the drag is cancelled, the widget returns to its original position, and `onLayoutChange` is not invoked

---

### Requirement: Collision detection uses AABB in grid units
The system SHALL detect overlaps between layout items using axis-aligned bounding box (AABB) comparison in grid coordinates. Two items overlap when their grid rectangles intersect.

```
overlaps(a, b) = !(a.x+a.w ≤ b.x || b.x+b.w ≤ a.x || a.y+a.h ≤ b.y || b.y+b.h ≤ a.y)
```

The dragged item SHALL be excluded from the set of items it is compared against.

#### Scenario: Overlap detected between two items
- **WHEN** item A is `{ x:0, y:0, w:2, h:2 }` and item B is `{ x:1, y:1, w:2, h:2 }`
- **THEN** `overlaps(A, B)` returns `true`

#### Scenario: Adjacent items do not overlap
- **WHEN** item A is `{ x:0, y:0, w:2, h:2 }` and item B is `{ x:2, y:0, w:2, h:2 }`
- **THEN** `overlaps(A, B)` returns `false`
