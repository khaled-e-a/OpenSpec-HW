## ADDED Requirements

### Requirement: Grid container renders with defined columns and row height
The system SHALL render a `DashboardGrid` container using absolute positioning of child widgets. The container SHALL accept a `GridConfig` with `columns` (number of columns), `rowHeight` (pixel height of each row), and `gap` (pixel spacing between cells). The container SHALL compute each widget's pixel position from its grid coordinates on every render.

#### Scenario: Grid renders with valid config
- **WHEN** `DashboardGrid` is mounted with `columns=12`, `rowHeight=100`, and `gap=8`
- **THEN** the container renders with a width that accommodates 12 columns and applies the row height and gap to all widget position calculations

#### Scenario: Grid renders with zero widgets
- **WHEN** `DashboardGrid` is mounted with an empty `layout` array
- **THEN** the container renders an empty grid with visible column and row guides and a placeholder prompt indicating no widgets are present

---

### Requirement: Grid renders visual column and row guides
The system SHALL render a `GridLines` component that overlays column and row guides across the full grid surface. Grid lines SHALL be purely decorative and non-interactive.

#### Scenario: Grid lines are visible on render
- **WHEN** the dashboard is rendered with at least one row of height
- **THEN** vertical column dividers and horizontal row dividers are visible across the grid container

#### Scenario: Grid lines do not intercept pointer events
- **WHEN** the user attempts to interact with a widget beneath the grid lines overlay
- **THEN** pointer events pass through the grid lines layer to the widget below

---

### Requirement: Widget pixel position is derived from grid coordinates
The system SHALL compute each widget's `left`, `top`, `width`, and `height` CSS values from its `WidgetDescriptor` fields (`x`, `y`, `w`, `h`) and the active `GridConfig`. The formula SHALL be: `left = x * (cellWidth + gap)`, `top = y * (rowHeight + gap)`, `width = w * cellWidth + (w-1) * gap`, `height = h * rowHeight + (h-1) * gap`.

#### Scenario: Widget position matches grid coordinate
- **WHEN** a widget has `x=2`, `y=1`, `w=3`, `h=2` and `rowHeight=100`, `gap=8`
- **THEN** the widget is positioned at the pixel coordinates corresponding to column 2, row 1, spanning 3 columns and 2 rows

#### Scenario: Widget at origin renders at top-left
- **WHEN** a widget has `x=0`, `y=0`, `w=1`, `h=1`
- **THEN** the widget's `left` and `top` are both 0 pixels within the grid container

---

### Requirement: Layout state is free of cell overlap
The system SHALL derive an occupancy map from the layout on each render and verify that no two widgets occupy the same grid cell. When an overlap is detected in the initial layout, the system SHALL resolve it by shifting the later-listed widget downward to the next available row.

#### Scenario: Non-overlapping layout renders as-is
- **WHEN** all widgets in the layout occupy distinct cells
- **THEN** all widgets render at their declared positions without modification

#### Scenario: Overlapping widgets are shifted on load
- **WHEN** two widgets in the initial layout share at least one cell
- **THEN** the system detects the conflict, shifts the second widget down to the next available row, and renders both widgets without overlap

---

### Requirement: Widget with unregistered type renders a fallback error tile
The system SHALL render a clearly labelled error tile in place of any widget whose `type` key is not found in the widget registry. The error tile SHALL display the unrecognised type key and SHALL log a warning to the console.

#### Scenario: Unknown type key shows error tile
- **WHEN** a widget descriptor references a type key not present in the registry
- **THEN** an error tile is rendered in that widget's grid slot showing the unrecognised key, and a console warning is emitted

#### Scenario: Error tile does not affect other widgets
- **WHEN** one widget has an unregistered type and others have registered types
- **THEN** only the unknown widget renders as an error tile; all other widgets render their registered components normally
