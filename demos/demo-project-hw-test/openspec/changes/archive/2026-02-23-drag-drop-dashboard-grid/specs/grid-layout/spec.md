## ADDED Requirements

### Requirement: Configurable column grid

The system SHALL render a grid container with a configurable number of columns (default 12) and a configurable row height in pixels (default 80px). The grid SHALL grow vertically without bound to accommodate all placed widgets.

#### Scenario: Render with default columns
- **WHEN** `<DashboardGrid>` is rendered with no `columns` prop
- **THEN** the grid SHALL divide its width into 12 equal columns

#### Scenario: Render with custom columns
- **WHEN** `<DashboardGrid columns={6}>` is rendered
- **THEN** the grid SHALL divide its width into 6 equal columns

#### Scenario: Vertical expansion
- **WHEN** a widget is placed at a row index that exceeds the current visible height
- **THEN** the grid container SHALL expand its height to reveal the new row

---

### Requirement: Absolute widget positioning

The system SHALL position each widget using absolute CSS coordinates computed from its grid layout entry `(x, y, w, h)`. The pixel values SHALL be:
- `left = x × cellWidth`
- `top = y × rowHeight`
- `width = w × cellWidth`
- `height = h × rowHeight`

where `cellWidth = containerWidth / columns`.

#### Scenario: Widget placed at origin
- **WHEN** a widget has layout `{ x: 0, y: 0, w: 2, h: 1 }`
- **THEN** the widget SHALL be positioned at `left: 0, top: 0` and span 2 columns × 1 row in pixels

#### Scenario: Widget placed mid-grid
- **WHEN** a widget has layout `{ x: 3, y: 2, w: 4, h: 2 }` and `columns=12`, `rowHeight=80`
- **THEN** the widget SHALL be at `left: 3/12 × containerWidth, top: 160px`

---

### Requirement: Collision prevention

The grid SHALL prevent any two widgets from occupying overlapping cells. Any operation (move or resize) that would produce an overlap SHALL be rejected; the widget SHALL return to its prior position/size.

#### Scenario: Drop on occupied cell rejected
- **WHEN** a widget is dropped onto a cell already occupied by another widget
- **THEN** the drag is cancelled and the widget returns to its original position

#### Scenario: Resize into occupied cell rejected
- **WHEN** a resize would extend a widget into a cell occupied by another widget
- **THEN** the resize is capped at the boundary of the occupied cell

---

### Requirement: Serializable layout state

The grid SHALL expose its layout as a plain JSON-serializable array of `WidgetLayout` objects `{ id, type, x, y, w, h }`. Changes to layout (move, resize, add, remove) SHALL produce a new array via an `onLayoutChange` callback.

#### Scenario: Controlled mode layout update
- **WHEN** a widget is moved and `onLayoutChange` is provided
- **THEN** `onLayoutChange` SHALL be called with the full updated `WidgetLayout[]`

#### Scenario: Uncontrolled mode persists internally
- **WHEN** `onLayoutChange` is not provided
- **THEN** the grid SHALL manage layout state internally using `useReducer`

---

### Requirement: Add widget at first available position

The system SHALL place a newly added widget at the first contiguous unoccupied region that fits the widget's default size, scanning left-to-right, top-to-bottom.

#### Scenario: Space available on existing rows
- **WHEN** `addWidget(type)` is called and a fitting gap exists in the current grid
- **THEN** the widget SHALL be placed at the first such gap

#### Scenario: No space on existing rows
- **WHEN** `addWidget(type)` is called and no fitting gap exists
- **THEN** a new row SHALL be appended and the widget placed there

---

### Requirement: Remove widget

The system SHALL remove a widget from the grid, freeing its cells, when `removeWidget(id)` is called.

#### Scenario: Widget removed
- **WHEN** `removeWidget(id)` is called with a valid widget ID
- **THEN** the widget SHALL no longer appear on the grid and its cells SHALL be unoccupied

#### Scenario: Remove unknown ID is a no-op
- **WHEN** `removeWidget(id)` is called with an ID not in the layout
- **THEN** the layout SHALL remain unchanged and no error is thrown

---

## Use Case Requirements

### UC-02: Snap Widget to Grid Cell

**Name**: Snap Widget to Grid Cell on Drop

**Actors**: Dashboard user, grid layout engine

**Preconditions**:
- A drag operation is in progress

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

---

### UC-04: Add Widget to Dashboard

**Name**: Add a New Widget to the Grid

**Actors**: Dashboard user

**Preconditions**:
- The dashboard is rendered
- At least one registered widget type is available

**Trigger**: The user selects a widget type from a widget picker / add menu

**Main Scenario**:
1. User opens the widget picker and selects a widget type
2. The system places the widget at the first available grid position that fits the widget's default size
3. The new widget renders on the grid with a brief entrance animation

**Alternative Flows**:
- A1: No contiguous space fits the default size → the grid expands vertically to accommodate the new widget

**Exception / Error Flows**:
- E1: Unknown widget type ID → an error placeholder is shown in place of the widget body

**Postconditions**:
- The new widget appears on the grid
- Layout state is updated to include the new widget entry

---

### UC-05: Remove Widget from Dashboard

**Name**: Remove a Widget from the Grid

**Actors**: Dashboard user

**Preconditions**:
- At least one widget is placed on the grid

**Trigger**: The user activates the "Remove" control on a widget (e.g., × button in the widget header)

**Main Scenario**:
1. A confirmation prompt or brief undo toast appears
2. User confirms removal (or the timeout expires without undo)
3. The widget is removed from the grid; its cells become free
4. Layout state updates to remove the widget entry

**Alternative Flows**:
- A1: User clicks "Undo" before the timeout → the widget is restored at its previous position and size

**Exception / Error Flows**:
- E1: Layout state fails to persist after removal → the widget is visually removed but a warning is shown; the state is retried

**Postconditions**:
- The widget no longer appears on the grid
- Its former cells are available for other widgets
