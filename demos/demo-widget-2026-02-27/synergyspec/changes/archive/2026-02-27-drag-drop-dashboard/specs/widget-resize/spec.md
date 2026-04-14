## ADDED Requirements

### Requirement: Resize handles are visible on each resizable widget
The system SHALL render a resize handle (e.g., bottom-right corner grip) on each widget that is configured as resizable. The handle SHALL be a distinct interactive element inside the widget shell. The handle SHALL be hidden or suppressed during an active drag interaction.

#### Scenario: Resize handle is visible on resizable widget
- **WHEN** a widget is rendered with `resizable: true` in its descriptor
- **THEN** a resize handle element is visible at the widget's bottom-right corner

#### Scenario: Resize handle is absent during active drag
- **WHEN** a drag interaction is in progress on any widget
- **THEN** resize handles on all widgets are not interactable

---

### Requirement: Resize is initiated by pointer-down on a widget's resize handle
The system SHALL initiate a resize interaction when the user triggers a `pointerdown` event on a widget's resize handle. The system SHALL call `setPointerCapture` on the handle element. The system SHALL record the widget's current `w` (column span) and `h` (row span) as the resize baseline.

#### Scenario: Resize starts on handle pointer-down
- **WHEN** the user presses the pointer on a widget's resize handle
- **THEN** the resize interaction begins and the system captures the pointer, recording the starting span values

#### Scenario: Resize does not start on widget body or drag handle
- **WHEN** the user presses the pointer on the widget body or the drag handle
- **THEN** no resize interaction is initiated

---

### Requirement: A resize ghost overlay shows the new span during resize
The system SHALL render a ghost overlay during an active resize that visualises the snapped target dimensions. The ghost SHALL update its size on each `pointermove` event to reflect the new column-span and row-span, snapped to whole-cell increments.

#### Scenario: Ghost overlay appears at resize start
- **WHEN** a resize interaction begins
- **THEN** a ghost overlay matching the widget's current dimensions is rendered over the widget

#### Scenario: Ghost updates to snapped span on pointer move
- **WHEN** the user moves the pointer during a resize
- **THEN** the ghost overlay resizes to reflect the nearest whole-cell column-span and row-span derived from the pointer position

---

### Requirement: Resize enforces minimum and maximum span constraints
The system SHALL enforce a minimum widget size of 1 column by 1 row. The system SHALL enforce a maximum size limited by the grid boundaries (the widget's `x` position plus its span SHALL NOT exceed the total column count; similarly for rows). Spans SHALL be clamped rather than allowing invalid values.

#### Scenario: Resize below minimum is clamped to 1x1
- **WHEN** the user drags the resize handle to a position that would result in a span smaller than 1 column or 1 row
- **THEN** the ghost and the committed span are clamped to 1 column or 1 row respectively

#### Scenario: Resize beyond grid boundary is clamped
- **WHEN** the user drags the resize handle so that the widget would extend beyond the grid's last column or row
- **THEN** the ghost and the committed span are clamped so the widget's extent equals the grid boundary

---

### Requirement: Resize commit applies the new span when target cells are unoccupied
The system SHALL update the layout state with the widget's new `w` and `h` when the user releases the pointer and the target cells are unoccupied by other widgets. The ghost overlay SHALL be removed and the widget SHALL render at its new dimensions.

#### Scenario: Valid resize updates widget span
- **WHEN** the user releases the pointer over unoccupied target cells
- **THEN** the layout state is updated with the new `w` and `h`, the ghost is removed, and the widget renders at its new dimensions

#### Scenario: Resize into occupied cells is rejected
- **WHEN** the user releases the pointer at a size that would overlap another widget's cells
- **THEN** the layout state is not changed, the ghost shakes to signal an invalid resize, and the widget retains its original dimensions

---

### Requirement: Escape key cancels an in-progress resize
The system SHALL cancel the active resize interaction when the user presses the Escape key before releasing the pointer. The widget SHALL retain its original span and the ghost overlay SHALL be removed.

#### Scenario: Escape restores original widget dimensions
- **WHEN** a resize is in progress and the user presses Escape
- **THEN** the resize is cancelled, the ghost overlay is removed, and the widget renders with its pre-resize `w` and `h`

#### Scenario: Escape during resize does not alter layout state
- **WHEN** a resize is cancelled via Escape
- **THEN** the layout state is identical to its state before the resize began
