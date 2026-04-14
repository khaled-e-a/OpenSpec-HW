# Spec: widget-drag-drop

## Purpose

This spec defines requirements for the `widget-drag-drop` capability — the full lifecycle of dragging a widget to a new grid position, including visual feedback, snap-to-grid positioning, collision/bounds validation, and layout state commitment.

## Use Case Traceability

This spec implements the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User presses down on a widget to start dragging |
| UC1-S2 | System lifts the widget visually (raises z-index, applies drag styling) and attaches it to the pointer |
| UC1-S3 | System displays a ghost/shadow overlay at the nearest valid snap-to-grid position as the user moves the pointer |
| UC1-S4 | User moves the pointer across the grid toward the desired target cell |
| UC1-S5 | System continuously updates the ghost to the nearest valid snap position, keeping the preview within grid bounds |
| UC1-S6 | User releases the pointer over the target position |
| UC1-S7 | System validates that the target position is unoccupied and within grid bounds |
| UC1-S8 | System commits the new position — updates layout state and re-renders the widget at the target cell |
| UC1-S9 | System removes the drag overlay and restores normal widget appearance |
| UC1-E1a | User drags by touch — system handles touch events equivalently |
| UC1-E3a | No valid snap position near pointer — system shows no ghost or "cannot drop" indicator |
| UC1-E6a | User releases outside grid — system cancels, widget returns to original position |
| UC1-E7a | Target occupied — collision detected, drop rejected, widget returns |
| UC1-E7b | Target partially out of bounds — drop rejected, widget returns |
| UC1-Ea | User presses Escape — drag cancelled, widget returns, layout unchanged |

---

## Requirements

### Requirement: Initiate Drag on Widget Press

**Implements**: UC1-S1 - User presses down on a widget to start dragging

The system SHALL recognise a press-and-hold (pointer-down or touch-start) on a `DraggableWidget` as the start of a drag operation.

#### Scenario: Pointer down initiates drag
- **WHEN** the user presses and holds a pointer button on a `DraggableWidget`
- **THEN** the system transitions the widget to an active-drag state

#### Scenario: Touch start initiates drag
- **WHEN** the user touches and holds a `DraggableWidget` on a touch device
- **THEN** the system recognises the gesture and transitions the widget to active-drag state (UC1-E1a)

---

### Requirement: Visual Lift During Drag

**Implements**: UC1-S2 - System lifts the widget visually (raises z-index, applies drag styling) and attaches it to the pointer

The system SHALL render a drag overlay clone of the widget that follows the pointer position, and SHALL visually distinguish the original widget slot (e.g., reduced opacity or hidden) from the overlay.

#### Scenario: Overlay appears on drag start
- **WHEN** a drag operation begins on a widget
- **THEN** a visual clone of the widget appears attached to the pointer, and the original slot is visually muted

#### Scenario: Overlay tracks pointer movement
- **WHEN** the user moves the pointer during a drag (UC1-S4)
- **THEN** the drag overlay follows the pointer position continuously

---

### Requirement: Snap-to-Grid Ghost Preview

**Implements**: UC1-S3 - System displays a ghost/shadow overlay at the nearest valid snap-to-grid position as the user moves the pointer
**Implements**: UC1-S4 - User moves the pointer across the grid toward the desired target cell
**Implements**: UC1-S5 - System continuously updates the ghost to the nearest valid snap position, keeping the preview within grid bounds

The system SHALL display a ghost/shadow element at the grid cell nearest to the current pointer position. The ghost SHALL update continuously as the pointer moves. The ghost SHALL be constrained to valid grid positions (within bounds and not overlapping other widgets).

#### Scenario: Ghost shown at nearest valid cell
- **WHEN** the pointer is over the grid during a drag
- **THEN** the system renders a ghost at the snapped grid cell nearest to the pointer

#### Scenario: Ghost updates on pointer move
- **WHEN** the user moves the pointer to a new area of the grid
- **THEN** the ghost moves to the newly computed snap position without delay

#### Scenario: Ghost indicates invalid position
- **WHEN** the pointer is over a grid area where the widget cannot be dropped (collision or out-of-bounds)
- **THEN** the system shows no ghost or renders a visually distinct "cannot drop" indicator (UC1-E3a)

#### Scenario: Ghost hidden outside grid
- **WHEN** the pointer moves outside the grid boundary
- **THEN** the ghost is not rendered or is hidden

---

### Requirement: Touch Event Parity

**Implements**: UC1-E1a - User drags by touch — system handles touch events equivalently

The system SHALL handle touch-based drag events with equivalent semantics to pointer/mouse events. All drag lifecycle steps (start, move, drop, cancel) MUST be reachable via touch interaction.

#### Scenario: Touch drag completes full lifecycle
- **WHEN** a user drags a widget using a touch gesture from start to release
- **THEN** the system processes the touch drag identically to a pointer drag, resulting in the same layout outcome

---

### Requirement: Drop Validation — Collision Detection

**Implements**: UC1-S6 - User releases the pointer over the target position
**Implements**: UC1-S7 - System validates that the target position is unoccupied and within grid bounds
**Implements**: UC1-E7a - Target position is occupied — collision detected, drop rejected, widget returns

The system SHALL reject a drop if any cell in the widget's candidate bounding box is already occupied by a different widget. On rejection, the widget SHALL animate back to its original position and layout state SHALL remain unchanged.

#### Scenario: Drop on occupied cell is rejected
- **WHEN** the user releases a widget over a position occupied by another widget
- **THEN** the system rejects the drop and the dragged widget returns to its original position

#### Scenario: Layout unchanged after collision rejection
- **WHEN** a drop is rejected due to collision
- **THEN** the layout state is identical to the state before the drag began

---

### Requirement: Drop Validation — Bounds Enforcement

**Implements**: UC1-S7 - System validates that the target position is unoccupied and within grid bounds
**Implements**: UC1-E6a - User releases outside grid — system cancels, widget returns to original position
**Implements**: UC1-E7b - Target position is partially out of bounds — drop rejected, widget returns

The system SHALL reject a drop if the widget's candidate bounding box extends beyond the grid boundary in any direction (left, right, top, bottom). Releasing the pointer outside the grid entirely SHALL also cancel the drag. On rejection, the widget SHALL return to its original position and layout state SHALL remain unchanged.

#### Scenario: Widget released outside grid is cancelled
- **WHEN** the user releases the pointer outside the grid boundary
- **THEN** the drag is cancelled and the widget returns to its original position

#### Scenario: Partially out-of-bounds drop is rejected
- **WHEN** the user releases a widget at a position where part of the widget would extend beyond the grid edge
- **THEN** the system rejects the drop and the widget returns to its original position

---

### Requirement: Commit Layout on Valid Drop

**Implements**: UC1-S8 - System commits the new position — updates layout state and re-renders the widget at the target cell

The system SHALL update the layout state with the widget's new position when a drop is valid (unoccupied target within grid bounds). The `onLayoutChange` callback MUST be called with an updated `WidgetLayout[]` array reflecting the new position.

#### Scenario: Valid drop updates layout
- **WHEN** the user releases a widget over a valid, unoccupied, in-bounds position
- **THEN** the system calls `onLayoutChange` with the updated layout and re-renders the widget at the new cell

#### Scenario: Layout reflects new position
- **WHEN** the layout is updated after a successful drop
- **THEN** the widget's `col` and `row` in the layout array match the drop target cell

---

### Requirement: Restore Widget Appearance After Drop or Cancel

**Implements**: UC1-S9 - System removes the drag overlay and restores normal widget appearance

The system SHALL remove the drag overlay and restore the original widget slot to its normal appearance after every drag operation ends — whether by a valid drop, an invalid drop, an out-of-bounds release, or a cancellation.

#### Scenario: Overlay removed after valid drop
- **WHEN** a drag ends with a successful drop
- **THEN** the drag overlay is unmounted and the widget at the new position appears with normal styling

#### Scenario: Overlay removed after cancelled drag
- **WHEN** a drag is cancelled (collision, out-of-bounds, or Escape)
- **THEN** the drag overlay is unmounted and the widget at its original position appears with normal styling

---

### Requirement: Keyboard Cancel via Escape

**Implements**: UC1-Ea - User presses Escape — drag cancelled immediately, widget returns, layout unchanged

The system SHALL cancel an in-progress drag when the user presses the Escape key. The widget SHALL return to its original position and layout state SHALL remain unchanged.

#### Scenario: Escape cancels drag
- **WHEN** a drag is in progress and the user presses Escape
- **THEN** the drag is cancelled immediately, the widget returns to its original position, and layout state is unchanged

---

### Requirement: WidgetLayout Data Model

**Implements**: (layout contract, no new use case step — supports all UC1/UC2/UC3 operations)

The `WidgetLayout` type SHALL include the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id`  | `string` | Unique widget identifier |
| `col` | `number` | 0-based left column |
| `row` | `number` | 0-based top row |
| `w`   | `number` | Width in grid columns (≥ 1) |
| `h`   | `number` | Height in grid rows (≥ 1) |

**BREAKING**: All consumers of `WidgetLayout` MUST supply `w` and `h`. There is no default or optional fallback.

#### Scenario: All layout entries carry w and h

- **WHEN** a `WidgetLayout` array is passed to `DashboardGrid`
- **THEN** every entry in the array has `w >= 1` and `h >= 1`

#### Scenario: Collision detection uses w and h

- **WHEN** the system evaluates whether a drop or resize candidate is valid
- **THEN** it uses the candidate's `w` and `h` to compute the full occupied bounding box before checking overlap
