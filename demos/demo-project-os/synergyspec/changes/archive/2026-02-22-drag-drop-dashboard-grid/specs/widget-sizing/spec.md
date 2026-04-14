## ADDED Requirements

### Requirement: Widget size declaration
Each `Widget` SHALL accept `colSpan` and `rowSpan` props that declare how many grid columns and rows the widget occupies. Both props SHALL be positive integers and SHALL default to 1 if not provided.

#### Scenario: Widget renders with declared colSpan and rowSpan
- **WHEN** a widget is rendered with `colSpan={2}` and `rowSpan={1}`
- **THEN** the widget's CSS grid placement SHALL span 2 columns and 1 row

#### Scenario: Widget defaults to 1×1 when size props are omitted
- **WHEN** a widget is rendered without `colSpan` or `rowSpan`
- **THEN** the widget SHALL occupy exactly 1 column and 1 row

#### Scenario: Non-positive colSpan or rowSpan is rejected
- **WHEN** a widget is given `colSpan={0}` or `rowSpan={-1}`
- **THEN** the component SHALL throw a prop validation error and default to 1

### Requirement: Multi-cell occupation tracking
The `DashboardGrid` SHALL track which cells are occupied by each widget based on its `col`, `row`, `colSpan`, and `rowSpan`. A widget with `colSpan=2` and `rowSpan=2` at `col=1, row=1` SHALL be considered to occupy cells (1,1), (2,1), (1,2), and (2,2).

#### Scenario: All occupied cells are marked in the grid occupancy map
- **WHEN** a 2×2 widget is placed at col=1, row=1
- **THEN** the grid occupancy map SHALL mark cells (1,1), (2,1), (1,2), and (2,2) as occupied by that widget's id

#### Scenario: Occupancy map updates when a widget moves
- **WHEN** a widget is successfully dropped to a new position
- **THEN** the occupancy map SHALL release the widget's old cells and mark its new cells as occupied

### Requirement: Widget size constraints relative to grid
A widget's `colSpan` SHALL NOT exceed the total number of columns in the grid, and `rowSpan` SHALL NOT exceed the total number of rows. Widgets that violate these constraints SHALL NOT be rendered and SHALL emit a console warning.

#### Scenario: Widget wider than the grid is not rendered
- **WHEN** a widget has `colSpan={5}` in a grid with `columns={4}`
- **THEN** the widget SHALL NOT be rendered and a console warning SHALL be emitted

#### Scenario: Widget fitting within bounds renders normally
- **WHEN** a widget has `colSpan={4}` in a grid with `columns={4}`
- **THEN** the widget SHALL render and span the full grid width

### Requirement: Supported standard widget sizes
The system SHALL document and support four standard widget size presets: small (1×1), wide (2×1), tall (1×2), and large (2×2). These presets are provided as named constants and used in demo/example code; arbitrary integer sizes are also valid.

#### Scenario: Standard size constants are exported
- **WHEN** a consumer imports `WIDGET_SIZES` from the component library
- **THEN** it SHALL expose `SMALL`, `WIDE`, `TALL`, and `LARGE` constants with the correct colSpan/rowSpan values

#### Scenario: Large widget is placed and occupies correct cells
- **WHEN** a widget uses the `LARGE` preset (colSpan=2, rowSpan=2) and is placed at col=3, row=1
- **THEN** it SHALL occupy cells (3,1), (4,1), (3,2), and (4,2)
