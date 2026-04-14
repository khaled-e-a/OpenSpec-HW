# Spec: widget-drag-drop

Generated: 2026-03-30

## Overview
This spec implements requirements for the `widget-drag-drop` capability — a drag-and-drop dashboard grid in React where users can drag differently-sized widgets and snap them to grid positions.
See `usecases.md` "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User clicks and holds on a widget to begin dragging it |
| UC1-S2 | System detaches widget visually and displays a drag preview following the pointer |
| UC1-S3 | User moves the pointer across the dashboard canvas |
| UC1-S4 | System highlights the grid cell(s) the widget would occupy at the current pointer position |
| UC1-S5 | User releases the pointer over a valid, unoccupied grid region |
| UC1-S6 | System snaps the widget to the nearest valid grid position |
| UC1-S7 | System updates the layout state to reflect the new widget position |
| UC1-E4a | Pointer moves outside canvas — no drop target highlighted |
| UC1-E4a1 | Widget returned to original position if released outside canvas |
| UC1-E5a | Target grid region is occupied — system shows invalid indicator |
| UC1-E5a2 | Widget returned to original position if dropped on occupied region |
| UC1-E5b | User presses Escape — drag cancelled, widget restored to original position |
| UC2-S1 | User picks up a new widget from the widget source area |
| UC2-S2 | System shows a drag preview of the new widget following the pointer |
| UC2-S3 | User moves the pointer over the dashboard canvas |
| UC2-S4 | System highlights the grid cell(s) the new widget would occupy |
| UC2-S5 | User releases the pointer over a valid, unoccupied grid region |
| UC2-S6 | System places the widget at the snapped grid position |
| UC2-S7 | System updates the layout state to include the new widget |
| UC2-E4a | No unoccupied region large enough — no valid highlight shown |
| UC2-E4a2 | Widget returned to source without placement |
| UC2-E5a | Target region partially occupied — system shows invalid indicator |
| UC2-E5b | User cancels drag — layout unchanged |
| UC3-S1 | User is dragging a widget across the dashboard canvas |
| UC3-S2 | System renders a semi-transparent drag preview at current pointer position |
| UC3-S3 | System computes and highlights the snap target grid cell(s) |
| UC3-S4 | Highlight color indicates validity: green/neutral = valid, red/blocked = invalid |
| UC3-S5 | User moves pointer; system continuously updates preview and highlight in real time |
| UC3-S6 | User releases pointer; widget is placed or returned per drop outcome |
| UC3-E3a | Widget is over its original position — neutral highlight shown |
| UC3-E5a | Drag preview lags — system degrades gracefully, preview remains visible |

---

## ADDED Requirements

### Requirement: Initiate Widget Drag
**Implements**: UC1-S1 - User clicks and holds on a widget to begin dragging it
The system SHALL allow a user to begin dragging any widget on the dashboard by clicking and holding on it.

#### Scenario: Drag begins on mousedown-hold
- **WHEN** the user clicks and holds the pointer on a widget
- **THEN** the system initiates a drag operation for that widget

#### Scenario: Drag begins on touch-equivalent
- **WHEN** the user initiates a drag gesture on a widget using a supported input device
- **THEN** the system initiates a drag operation for that widget

---

### Requirement: Display Drag Preview
**Implements**: UC1-S2 - System detaches widget visually and displays a drag preview following the pointer; UC2-S2 - System shows a drag preview of the new widget following the pointer; UC3-S2 - System renders a semi-transparent drag preview at current pointer position
The system SHALL render a semi-transparent visual preview of the dragged widget that follows the pointer throughout the drag operation.

#### Scenario: Preview follows pointer during drag
- **WHEN** a drag operation is in progress
- **THEN** the system SHALL display a semi-transparent copy of the widget at the current pointer position

#### Scenario: Preview remains visible if updates lag
- **WHEN** pointer movement events are delayed
- **THEN** the system SHALL keep the last rendered preview visible rather than hiding it (UC3-E5a)

#### Scenario: Preview removed after drag ends
- **WHEN** the drag operation ends (drop or cancel)
- **THEN** the system SHALL remove the drag preview from the display

---

### Requirement: Highlight Drop Target Cells
**Implements**: UC1-S4 - System highlights the grid cell(s) the widget would occupy at the current pointer position; UC2-S4 - System highlights the grid cell(s) the new widget would occupy; UC3-S3 - System computes and highlights the snap target grid cell(s)
The system SHALL highlight the grid cell(s) that the dragged widget would occupy if dropped at the current pointer position.

#### Scenario: Valid drop target highlighted in green
- **WHEN** the pointer is over an unoccupied grid region that can fit the widget
- **THEN** the system SHALL highlight those grid cells in green (or a visually distinct valid-state color) (UC3-S4)

#### Scenario: Invalid drop target highlighted in red
- **WHEN** the pointer is over a grid region already occupied by another widget
- **THEN** the system SHALL highlight those cells in red (or a visually distinct invalid-state color) (UC3-S4, UC1-E5a, UC2-E5a)

#### Scenario: Neutral highlight when over original position
- **WHEN** the pointer is over the widget's current (pre-drag) grid position
- **THEN** the system SHALL show a neutral highlight (UC3-E3a)

#### Scenario: No highlight outside canvas
- **WHEN** the pointer moves outside the dashboard canvas boundary during drag
- **THEN** the system SHALL not highlight any drop target (UC1-E4a, UC2-E4a)

#### Scenario: No highlight when grid is full
- **WHEN** no unoccupied region large enough for the widget exists anywhere on the grid
- **THEN** the system SHALL show no valid highlight anywhere on the canvas (UC2-E4a)

#### Scenario: Highlight updates continuously
- **WHEN** the pointer moves during a drag operation
- **THEN** the system SHALL update the highlighted cells in real time on every pointer position change (UC3-S5)

---

### Requirement: Snap Widget to Grid on Drop
**Implements**: UC1-S6 - System snaps the widget to the nearest valid grid position; UC2-S6 - System places the widget at the snapped grid position
The system SHALL snap the dropped widget to the nearest valid grid cell boundary upon release over a valid drop target.

#### Scenario: Widget snaps to grid on valid drop
- **WHEN** the user releases the pointer over a valid, unoccupied grid region
- **THEN** the system SHALL position the widget at the nearest grid cell (x, y) derived from the pointer coordinates (UC1-S5, UC2-S5)

#### Scenario: Widget occupies correct cell span
- **WHEN** a widget with dimensions w×h is dropped
- **THEN** the system SHALL occupy exactly w columns and h rows starting from the snap position

---

### Requirement: Update Layout State on Drop
**Implements**: UC1-S7 - System updates the layout state to reflect the new widget position; UC2-S7 - System updates the layout state to include the new widget
The system SHALL update its layout state after every successful drop and invoke the `onLayoutChange` callback with the new layout.

#### Scenario: Layout updated after reposition
- **WHEN** a widget is successfully dropped at a new valid position
- **THEN** the system SHALL update the internal layout state and call `onLayoutChange(newLayout)` (UC1-S7)

#### Scenario: Layout updated after new widget placement
- **WHEN** a new widget is successfully placed on the grid
- **THEN** the system SHALL add the widget to the layout state and call `onLayoutChange(newLayout)` (UC2-S7)

#### Scenario: Layout unchanged on cancelled or invalid drop
- **WHEN** a drag operation is cancelled or ends on an invalid position
- **THEN** the system SHALL NOT modify the layout state and SHALL NOT call `onLayoutChange`

---

### Requirement: Return Widget on Invalid or Cancelled Drop
**Implements**: UC1-E4a1 - Widget returned to original position if released outside canvas; UC1-E5a2 - Widget returned to original position if dropped on occupied region; UC1-E5b - User presses Escape — drag cancelled, widget restored; UC2-E4a2 - Widget returned to source without placement; UC2-E5b - User cancels drag — layout unchanged
The system SHALL restore the widget to its pre-drag position when a drag ends on an invalid target or is cancelled.

#### Scenario: Widget restored on drop outside canvas
- **WHEN** the user releases the pointer outside the dashboard canvas
- **THEN** the system SHALL return the widget to its original grid position (UC1-E4a1)

#### Scenario: Widget restored on drop over occupied region
- **WHEN** the user releases the pointer over a grid region already occupied by another widget
- **THEN** the system SHALL return the widget to its original grid position (UC1-E5a2)

#### Scenario: Widget restored on Escape key
- **WHEN** the user presses the Escape key during a drag operation
- **THEN** the system SHALL cancel the drag and restore the widget to its original position (UC1-E5b)

#### Scenario: New widget not placed on invalid drop
- **WHEN** the user cancels drag of a new widget or releases it over an invalid region
- **THEN** the system SHALL discard the placement and leave the layout unchanged (UC2-E5b)

---

### Requirement: Collision Detection
**Implements**: UC1-E5a - Target grid region is occupied — system shows invalid indicator; UC2-E5a - Target region partially occupied — system shows invalid indicator
The system SHALL detect and prevent widget placement that would cause two widgets to overlap.

#### Scenario: Occupied region detected during hover
- **WHEN** the pointer hovers over a region already occupied (fully or partially) by another widget
- **THEN** the system SHALL classify that drop target as invalid (UC1-E5a, UC2-E5a)

#### Scenario: Partial overlap detected
- **WHEN** the widget being dragged would partially overlap an existing widget at the candidate position
- **THEN** the system SHALL classify that position as invalid

#### Scenario: Out-of-bounds detected
- **WHEN** the candidate position would place any part of the widget outside the grid boundaries
- **THEN** the system SHALL classify that position as invalid

---

### Requirement: Serializable Layout State
**Implements**: UC1-S7 - System updates the layout state; UC2-S7 - System updates the layout state to include the new widget
The system SHALL represent the dashboard layout as a serializable array of widget descriptors.

#### Scenario: Layout is a plain JSON-serializable array
- **WHEN** `onLayoutChange` is called
- **THEN** the argument SHALL be an array of objects each with shape `{ id: string, x: number, y: number, w: number, h: number }` where all values are integers

#### Scenario: Layout can be restored from serialized form
- **WHEN** a previously persisted layout array is passed as the `layout` prop
- **THEN** the system SHALL render widgets at the positions defined in the array

---

### Requirement: Grid Cell Sizing and Configuration
**Implements**: UC1-S6 - System snaps the widget to the nearest valid grid position
The system SHALL expose a `cellSize` prop (in pixels) that determines the width and height of each grid cell, defaulting to `100`.

#### Scenario: Default cell size is 100px
- **WHEN** no `cellSize` prop is provided
- **THEN** each grid cell SHALL be 100×100 pixels

#### Scenario: Custom cell size is respected
- **WHEN** a `cellSize` prop is provided (e.g., `80`)
- **THEN** each grid cell SHALL be `cellSize × cellSize` pixels and snap positions are calculated accordingly

---

### Requirement: Controlled and Uncontrolled Layout Mode
**Implements**: UC1-S7 - System updates the layout state; UC2-S7 - System updates the layout state
The `DashboardGrid` component SHALL support both controlled (consumer-owned state) and uncontrolled (internal state) layout modes.

#### Scenario: Uncontrolled mode uses internal state
- **WHEN** no `layout` prop is provided
- **THEN** the component SHALL manage layout in internal state and call `onLayoutChange` on every change

#### Scenario: Controlled mode delegates state to consumer
- **WHEN** a `layout` prop is provided
- **THEN** the component SHALL render from that prop and call `onLayoutChange` on change without updating internal state
