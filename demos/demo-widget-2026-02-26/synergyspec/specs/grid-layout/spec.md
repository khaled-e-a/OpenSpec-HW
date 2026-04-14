## ADDED Requirements

### Requirement: Grid renders with configurable columns and row height
The system SHALL render a `DashboardGrid` component that accepts integer `columns` (≥ 1) and numeric `rowHeight` (px, > 0) props. Column pixel width SHALL be computed as `containerWidth / columns`. The grid container SHALL use `position: relative` so widget children can use `position: absolute`.

#### Scenario: Grid mounts with valid props
- **WHEN** `DashboardGrid` is mounted with `columns={12}` and `rowHeight={80}`
- **THEN** the grid container renders with `position: relative` and each column has width equal to `containerWidth / 12`

#### Scenario: Grid receives invalid columns prop
- **WHEN** `columns` is `0`, negative, or not an integer
- **THEN** the system logs a prop-type warning and renders an empty container with a single column as fallback

#### Scenario: Grid receives invalid rowHeight prop
- **WHEN** `rowHeight` is `0`, negative, or non-numeric
- **THEN** the system logs a prop-type warning and renders an empty container with `rowHeight` defaulting to `80`

---

### Requirement: Widget pixel positions derive from grid coordinates
The system SHALL position each widget using `position: absolute` with `left`, `top`, `width`, and `height` computed from its `LayoutItem` grid coordinates.

```
left   = item.x * colWidth
top    = item.y * rowHeight
width  = item.w * colWidth
height = item.h * rowHeight
```

#### Scenario: Widget renders at correct pixel position
- **WHEN** a layout item has `{ x: 2, y: 1, w: 3, h: 2 }` and `colWidth` is `100` and `rowHeight` is `80`
- **THEN** the widget renders at `left: 200px`, `top: 80px`, `width: 300px`, `height: 160px`

---

### Requirement: Grid container height auto-expands to fit widgets
The system SHALL set the grid container's height to `(maxOccupiedRow + 1) * rowHeight`, where `maxOccupiedRow` is the highest `y + h` value across all layout items minus one. An empty grid SHALL have a minimum height of one row.

#### Scenario: Container height matches tallest widget stack
- **WHEN** the layout contains a widget at `{ y: 3, h: 2 }` and no widget extends further
- **THEN** the grid container height is `(3 + 2) * rowHeight = 5 * rowHeight`

#### Scenario: Empty grid has minimum height
- **WHEN** the layout array is empty
- **THEN** the grid container height is `1 * rowHeight`

---

### Requirement: Grid recomputes geometry on container resize
The system SHALL attach a `ResizeObserver` to the grid container and recompute `colWidth` whenever the container's width changes. All widget pixel positions SHALL update accordingly without a full remount.

#### Scenario: ResizeObserver triggers on width change
- **WHEN** the grid container's measured width changes from 1200 to 800
- **THEN** `colWidth` recomputes to `800 / columns` and all widgets rerender at updated pixel positions

#### Scenario: ResizeObserver unavailable
- **WHEN** `ResizeObserver` is not available in the environment
- **THEN** the system falls back to a `window.resize` event listener to trigger recomputation

---

### Requirement: Widget positions snap to nearest grid cell
The system SHALL compute snapped grid coordinates from pixel positions using rounding, and SHALL clamp the result so the widget stays fully within the grid.

```
snappedX = clamp(round(px / colWidth),  0, columns - item.w)
snappedY = clamp(round(py / rowHeight), 0, ∞)
```

`px` and `py` are the widget's top-left pixel position relative to the grid container.

#### Scenario: Snap Widget to Grid Cell — happy path
- **WHEN** a widget's top-left pixel position is `{ px: 155, py: 95 }` with `colWidth=100` and `rowHeight=80`
- **THEN** the snapped grid position is `{ x: round(155/100)=2, y: round(95/80)=1 }`

#### Scenario: Snap clamps to left boundary
- **WHEN** pixel `px` computes to a negative column index
- **THEN** `x` is clamped to `0`

#### Scenario: Snap clamps to right boundary
- **WHEN** pixel `px` would place the widget's right edge beyond column `columns`
- **THEN** `x` is clamped to `columns - item.w`

#### Scenario: Interaction cancelled during snap
- **WHEN** the user presses Escape or the pointer leaves the window during a drag or resize
- **THEN** the snapped position is discarded and the widget reverts to its original grid coordinates

---

### Requirement: Layout is managed via controlled component pattern
The system SHALL NOT mutate layout state internally. All layout changes SHALL be proposed by invoking the `onLayoutChange(newLayout: LayoutItem[])` callback with the complete updated array. The `layout` prop is the single source of truth.

#### Scenario: onLayoutChange called after position update
- **WHEN** a widget drag or resize interaction completes successfully
- **THEN** `onLayoutChange` is invoked once with the full updated layout array

#### Scenario: Layout does not update without onLayoutChange wiring
- **WHEN** `onLayoutChange` is not provided and a drag completes
- **THEN** the widget visually reverts to its original position (no internal state mutation)
