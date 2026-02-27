## ADDED Requirements

### Requirement: Resize handle on widget

Each widget SHALL expose at least one resize handle (bottom-right corner by default). The handle SHALL be visually accessible (min 44×44 px touch target) and SHALL only be interactive when the widget is not being dragged.

#### Scenario: Resize handle visible
- **WHEN** a widget is rendered on the grid and is not being dragged
- **THEN** a resize handle SHALL be visible at the widget's bottom-right corner

#### Scenario: Resize handle hidden during drag
- **WHEN** a drag operation is active on the widget
- **THEN** the resize handle SHALL not be interactive

---

### Requirement: Resize preview during handle drag

The system SHALL display a live resize preview (outline or shaded region) while the user drags a resize handle. The preview SHALL snap to grid cell boundaries in real time, showing the exact new span the widget will occupy on release.

#### Scenario: Preview updates as pointer moves
- **WHEN** the user is dragging a resize handle
- **THEN** a preview overlay SHALL show the snapped new dimensions, updating on every pointer move

#### Scenario: Preview snaps to grid
- **WHEN** the pointer is between two row or column boundaries during resize
- **THEN** the preview SHALL snap to the nearer boundary rather than showing a fractional size

---

### Requirement: Minimum widget size constraint

Each widget type SHALL declare a minimum width (`minW`) and minimum height (`minH`) in grid units. A resize operation SHALL not reduce the widget below these values.

#### Scenario: Resize blocked at minimum width
- **WHEN** the user drags the resize handle leftward to a position that would produce `w < minW`
- **THEN** the resize SHALL be capped at `w = minW` and the handle SHALL spring back

#### Scenario: Resize blocked at minimum height
- **WHEN** the user drags the resize handle upward to a position that would produce `h < minH`
- **THEN** the resize SHALL be capped at `h = minH` and the handle SHALL spring back

---

### Requirement: Maximum widget size constraint

A widget SHALL not be resized beyond the grid's column count in width, nor beyond a configurable `maxW` / `maxH` declared by the widget type (if set).

#### Scenario: Resize blocked at grid edge
- **WHEN** the user drags the resize handle rightward past the last column
- **THEN** the resize SHALL be capped at `x + w = columns`

#### Scenario: Resize blocked at declared maximum
- **WHEN** a widget type declares `maxW: 6` and the user drags to `w = 7`
- **THEN** the resize SHALL be capped at `w = 6`

---

### Requirement: Resize blocked by neighbouring widgets

A resize operation SHALL not expand a widget into cells already occupied by another widget. The resize SHALL be capped at the boundary of the nearest occupied neighbouring cell.

#### Scenario: Resize right blocked by neighbour
- **WHEN** a widget to the right occupies columns starting at `x + w`
- **THEN** the resize SHALL not expand the current widget's width beyond that boundary

#### Scenario: Resize down blocked by neighbour
- **WHEN** a widget below occupies rows starting at `y + h`
- **THEN** the resize SHALL not expand the current widget's height beyond that boundary

---

### Requirement: Commit resize on handle release

The system SHALL apply the new widget dimensions to the layout when the user releases the resize handle. The layout SHALL update atomically; the widget SHALL render at the new size immediately.

#### Scenario: Resize committed
- **WHEN** the user releases the resize handle over a valid new size
- **THEN** the widget's `w` and `h` in the layout SHALL be updated and `onLayoutChange` SHALL be called

#### Scenario: Resize cancelled with Escape
- **WHEN** the user presses Escape while dragging a resize handle
- **THEN** the resize SHALL be cancelled and the widget SHALL remain at its original size

---

## Use Case Requirements

### UC-03: Resize Widget

**Name**: Resize Widget by Dragging a Handle

**Actors**: Dashboard user

**Preconditions**:
- A widget is placed on the grid
- The widget is not currently being dragged

**Trigger**: The user clicks and drags a resize handle on the widget's edge or corner

**Main Scenario**:
1. User drags the resize handle outward or inward
2. A resize preview shows the new bounding box snapped to grid units
3. Adjacent grid cells highlight if they would be consumed or freed
4. User releases the handle
5. The widget is redrawn at the new span (width × height in grid units)
6. Layout state updates with the new size

**Alternative Flows**:
- A1: New size would overlap an existing widget → the resize is capped at the boundary of the nearest occupied cell

**Exception / Error Flows**:
- E1: Resize attempt would shrink widget below its declared minimum size → resize is blocked; handle springs back

**Postconditions**:
- Widget occupies the new cell span
- No other widget overlaps the resized widget
- Layout state is persisted
