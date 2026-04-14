## ADDED Requirements

### Requirement: Grid container configuration
The `DashboardGrid` component SHALL accept `columns`, `rows`, and `gap` props that define the grid dimensions and spacing. The grid SHALL render as a CSS grid with the specified number of columns and rows. The `gap` prop SHALL control the spacing between cells in pixels.

#### Scenario: Renders with configured columns and rows
- **WHEN** `DashboardGrid` is rendered with `columns={4}` and `rows={3}`
- **THEN** the container SHALL have a CSS grid with 4 equal-width columns and 3 equal-height rows

#### Scenario: Gap is applied between cells
- **WHEN** `DashboardGrid` is rendered with `gap={16}`
- **THEN** each cell SHALL be separated by 16px of space in both axes

#### Scenario: Defaults are applied when props are omitted
- **WHEN** `DashboardGrid` is rendered without `columns`, `rows`, or `gap`
- **THEN** the grid SHALL default to 12 columns, 8 rows, and 8px gap

### Requirement: Layout state management
The `DashboardGrid` component SHALL maintain a layout state that maps each widget's `id` to its current grid position (`col`, `row`) and size (`colSpan`, `rowSpan`). Layout state SHALL be updated when a widget is successfully dropped to a new position.

#### Scenario: Initial layout is set from props
- **WHEN** `DashboardGrid` is rendered with an `initialLayout` prop containing widget positions
- **THEN** each widget SHALL be rendered at the position specified in `initialLayout`

#### Scenario: Layout updates after a successful drop
- **WHEN** a widget is dragged and dropped onto a valid target cell
- **THEN** the layout state SHALL update the widget's `col` and `row` to the new cell coordinates

#### Scenario: onLayoutChange callback is invoked
- **WHEN** the layout state changes after a drop
- **THEN** the `onLayoutChange` callback prop SHALL be called with the updated layout array

### Requirement: Widget rendering at grid positions
The `DashboardGrid` SHALL render each child `Widget` at its assigned grid position using CSS `grid-column` and `grid-row` placement. Widgets outside the grid boundaries SHALL NOT be rendered.

#### Scenario: Widget is placed at correct grid cell
- **WHEN** a widget has `col=2` and `row=3` in the layout
- **THEN** the widget's DOM element SHALL have `grid-column-start: 2` and `grid-row-start: 3` applied

#### Scenario: Widget spanning multiple cells is placed correctly
- **WHEN** a widget has `col=1`, `row=1`, `colSpan=2`, `rowSpan=2`
- **THEN** the widget's DOM element SHALL span from column 1 to 3 and row 1 to 3
