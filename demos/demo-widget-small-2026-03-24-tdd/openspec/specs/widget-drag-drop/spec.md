# Spec: widget-drag-drop

## Purpose

The `widget-drag-drop` capability provides a React grid dashboard where variable-sized widgets can be dragged, snapped to grid cells, and repositioned without overlap. It handles initial layout configuration and rendering, pointer-driven drag interactions, drop validation, and state updates.

---

## Requirements

### Requirement: Accept Initial Layout Configuration
**Implements**: UC2-S1 - System receives initial layout configuration with widget sizes and grid coordinates

The system SHALL accept an initial layout configuration as a prop, consisting of an array of widget descriptors each specifying a unique `id`, grid position (`x`, `y`), and cell span (`w`, `h`).

#### Scenario: Valid initial layout renders correctly
- **WHEN** `DashboardGrid` is mounted with a valid `initialLayout` array
- **THEN** the component renders each widget at its declared grid position and cell span

#### Scenario: Empty initial layout renders an empty grid
- **WHEN** `DashboardGrid` is mounted with an empty `initialLayout` array
- **THEN** the component renders the grid canvas with no widgets

---

### Requirement: Render Grid Canvas
**Implements**: UC2-S2 - System renders DashboardGrid canvas divided into equal-sized cells

The system SHALL render the `DashboardGrid` as a CSS grid container divided into equal-sized cells, with the number of columns and rows determined by `cols` and `rows` props.

#### Scenario: Grid divided into correct columns and rows
- **WHEN** `DashboardGrid` is rendered with `cols={6}` and `rows={4}`
- **THEN** the grid container has 6 equal columns and 4 equal rows

#### Scenario: Cell size is configurable
- **WHEN** `DashboardGrid` is rendered with a `cellSize` prop
- **THEN** each cell is rendered at the specified pixel dimension

---

### Requirement: Render Variable-Sized Widgets
**Implements**: UC2-S3 - System renders each DraggableWidget occupying its specified cell span at correct grid position; UC2-S4 - User sees all widgets displayed without overlap, each proportional to declared size

The system SHALL render each `DraggableWidget` spanning the number of columns and rows declared in its layout entry, positioned at its declared grid coordinates.

#### Scenario: Widget spans declared columns and rows
- **WHEN** a widget has `w=2` and `h=2` at position `x=1, y=0`
- **THEN** it occupies columns 2–3 and rows 1–2 of the grid (CSS `grid-column: 2 / span 2; grid-row: 1 / span 2`)

#### Scenario: Multiple widgets rendered without overlap
- **WHEN** `DashboardGrid` is mounted with multiple non-overlapping widgets
- **THEN** no two widgets share any grid cell

---

### Requirement: Resolve Overlapping Initial Layout
**Implements**: UC2-E3a - Two widgets in initial config overlap — first rendered in conflict position, second moved to nearest available

The system SHALL detect overlapping widget positions in the initial configuration and automatically relocate the conflicting widget to the nearest available grid position, emitting a console warning.

#### Scenario: Second widget moved on overlap
- **WHEN** two widgets in `initialLayout` declare overlapping cells
- **THEN** the first widget retains its declared position and the second is placed at the nearest free cells
- **AND** a console warning is emitted identifying the conflict

---

### Requirement: Clamp Out-of-Bounds Initial Widget
**Implements**: UC2-E3b - Widget declared outside grid bounds — system clamps it to fit within boundary

The system SHALL clamp any widget whose initial position or size would extend outside the grid boundary so that it fits entirely within the grid.

#### Scenario: Widget clamped to grid boundary
- **WHEN** a widget in `initialLayout` has `x + w > cols` or `y + h > rows`
- **THEN** the widget's position is adjusted so that `x + w <= cols` and `y + h <= rows`

---

### Requirement: Initiate Widget Drag
**Implements**: UC1-S1 - User initiates a drag on a widget by pressing and holding it

The system SHALL make each `DraggableWidget` draggable via pointer interaction. Pressing and holding a widget SHALL begin a drag operation for that widget.

#### Scenario: Drag begins on pointer down
- **WHEN** the user presses and holds on a `DraggableWidget`
- **THEN** the drag operation is initiated for that widget

---

### Requirement: Show Drag Visual Feedback
**Implements**: UC1-S2 - System lifts the widget visually, shows a drag preview at original size, highlights the grid

The system SHALL display a drag overlay at the widget's original dimensions following the pointer during a drag, and SHALL highlight the grid canvas to indicate it is an active drop target.

#### Scenario: Drag overlay shown during drag
- **WHEN** a widget drag is in progress
- **THEN** a visual clone of the widget at its original size follows the pointer
- **AND** the original grid cell is visually dimmed or retains a placeholder

#### Scenario: Grid highlighted during drag
- **WHEN** a widget drag is in progress
- **THEN** the grid canvas applies a visual highlight to indicate it is receptive to a drop

---

### Requirement: Snap Preview to Grid Cell
**Implements**: UC1-S3 - User moves pointer across grid canvas; UC1-S4 - System continuously snaps the drag preview to the nearest valid grid cell(s) as pointer moves

The system SHALL continuously calculate the nearest grid cell to the pointer position and display the drag preview snapped to those cell coordinates throughout the drag operation.

#### Scenario: Preview snaps to nearest cell as pointer moves
- **WHEN** the pointer moves across the grid during a drag
- **THEN** the drag preview position updates to the nearest snapped grid cell on each pointer move

#### Scenario: Preview stays within grid bounds during movement
- **WHEN** the pointer moves beyond the grid boundary during a drag
- **THEN** the snapped preview position is clamped to the nearest valid in-bounds cell

---

### Requirement: Highlight Blocked Cells During Drag
**Implements**: UC1-E6a2 - System shows visual cue (red highlight) on blocked cells during drag

The system SHALL apply a distinct visual indicator (e.g. red/warning colour) to the projected drop cells when they are occupied by another widget, allowing the user to see the conflict before releasing.

#### Scenario: Red highlight on occupied target cells
- **WHEN** the pointer is positioned over cells already occupied by another widget during a drag
- **THEN** the projected drop zone is highlighted in red (or equivalent warning colour)

#### Scenario: Green highlight on free target cells
- **WHEN** the pointer is positioned over unoccupied in-bounds cells during a drag
- **THEN** the projected drop zone is highlighted in green (or equivalent success colour)

---

### Requirement: Validate Drop Position
**Implements**: UC1-S5 - User releases widget over a target grid area; UC1-S6 - System validates that target cells are unoccupied and within grid bounds

The system SHALL validate the target drop position when the user releases a widget. A position is valid only if all target cells are unoccupied (excluding the dragged widget itself) and fully within grid bounds.

#### Scenario: Valid drop accepted
- **WHEN** the user releases a widget over unoccupied in-bounds cells
- **THEN** the drop is accepted as valid

#### Scenario: Drop rejected — cells occupied
- **WHEN** the user releases a widget over cells occupied by another widget
- **THEN** the drop is rejected

#### Scenario: Drop rejected — out of bounds
- **WHEN** the user releases a widget such that any of its cells would be outside the grid boundary
- **THEN** the drop is rejected

---

### Requirement: Commit Valid Drop to Layout State
**Implements**: UC1-S7 - System places the widget at the snapped target position and updates layout state; UC1-S8 - User sees the widget settled in its new position; all other widgets remain in place

The system SHALL update the layout state to reflect the widget's new position after a valid drop, and all other widgets SHALL remain at their previous positions.

#### Scenario: Layout state updated on valid drop
- **WHEN** a valid drop is completed
- **THEN** the layout entry for the dragged widget is updated to the new `x` and `y` coordinates
- **AND** all other widgets retain their previous `x`, `y`, `w`, `h` values

#### Scenario: Widget rendered at new position after drop
- **WHEN** the layout state is updated after a valid drop
- **THEN** the widget is rendered at its new grid position

---

### Requirement: Return Widget on Invalid Drop
**Implements**: UC1-E5a - User releases widget outside the grid canvas boundary; UC1-E5a1 - System returns widget to original position with smooth animation, layout unchanged; UC1-E6a - Target cells partially or fully occupied; UC1-E6a1 - System rejects drop and returns widget to original position; UC1-E6a3 - Layout state unchanged; UC1-E6b - Out-of-bounds placement; UC1-E6b1 - System treats position as invalid and returns widget

The system SHALL return the dragged widget to its original grid position when the drop is invalid (out-of-bounds, outside the grid, or cells occupied). The layout state SHALL remain unchanged. The return SHALL be accompanied by a smooth animation.

#### Scenario: Widget returns to origin on out-of-bounds drop
- **WHEN** the user releases a widget outside the grid canvas
- **THEN** the widget animates back to its original position
- **AND** the layout state is not modified

#### Scenario: Widget returns to origin on occupied-cell drop
- **WHEN** the user releases a widget over occupied cells
- **THEN** the widget animates back to its original position
- **AND** the layout state is not modified

#### Scenario: Return animation is smooth
- **WHEN** a widget is returned to its origin after an invalid drop
- **THEN** the return uses a CSS transition (e.g. `transform 200ms ease`) rather than an instant snap

---

### Requirement: Widget layout data model

**Implements**: UC5-S5 — System updates the widget content config

The `WidgetLayout` interface SHALL include the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Unique widget identifier |
| `x` | `number` | ✅ | Column index (0-based) |
| `y` | `number` | ✅ | Row index (0-based) |
| `w` | `number` | ✅ | Width in grid cells (≥ 1) |
| `h` | `number` | ✅ | Height in grid cells (≥ 1) |
| `type` | `WidgetType` | ❌ (optional) | Content type: `'clock' \| 'image' \| 'file' \| 'webpage'`. Defaults to `'clock'` when absent. |
| `config` | `WidgetConfig` | ❌ (optional) | Content configuration payload (image URL, file text/name, webpage URL). |

The `gridGeometry.ts` pure functions (`snapToCell`, `buildOccupancySet`, `isValidPlacement`, `resolveLayout`) SHALL operate exclusively on the positional fields (`id`, `x`, `y`, `w`, `h`) and SHALL ignore `type` and `config`.

#### Scenario: Layout with no type field is valid
- **WHEN** a `WidgetLayout` entry is provided without a `type` field
- **THEN** the system accepts it and defaults the widget type to `'clock'`

#### Scenario: Layout with type field is valid
- **WHEN** a `WidgetLayout` entry is provided with `type: 'image'`
- **THEN** the system accepts it and renders an image widget

#### Scenario: Geometry functions ignore type and config
- **WHEN** `isValidPlacement` or `resolveLayout` is called with a layout containing `type` and `config` fields
- **THEN** the result is identical to calling with a layout that omits those fields
