# Spec: widget-drag-drop

Generated: 2026-03-30

## Overview

This spec defines all requirements for the `widget-drag-drop` capability — the interactive drag-and-drop grid system that allows dashboard users to reposition widgets and have their layout persisted automatically.

See `usecases.md` "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability

This spec implements the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User presses and holds a widget to initiate a drag |
| UC1-S2 | System lifts widget visually and displays ghost preview at current position |
| UC1-S3 | User moves the pointer across the grid |
| UC1-S4 | System snaps ghost preview to nearest valid grid cell(s) in real time |
| UC1-S5 | User releases pointer over a target cell |
| UC1-S6 | System validates target position is within bounds and unoccupied |
| UC1-S7 | System places widget at snapped position and removes drag preview |
| UC1-S8 | System persists updated layout to localStorage |
| UC1-E3a | User moves pointer outside grid boundary — preview stays at last valid position |
| UC1-E6a | Target position is occupied — system shows conflict highlight and snaps widget back |
| UC1-E6b | Target position is out of bounds — treated as invalid, widget snaps back |
| UC1-E1a | User cancels drag (Escape) — preview discarded, widget returns to original position |
| UC2-S1 | System reads serialised layout from localStorage on page init |
| UC2-S2 | System validates stored layout (IDs and positions) |
| UC2-S3 | System renders each widget at its stored grid position |
| UC2-S4 | User sees dashboard exactly as they left it |
| UC2-E1a | No stored layout — system renders default layout from props/config |
| UC2-E2a | Stored layout contains unknown widget ID — stale entry discarded, rest restored |
| UC2-E2b | Widget position out of current grid bounds — falls back to default layout for affected widget |

---

## ADDED Requirements

### Requirement: Initiate drag on widget press
**Implements**: UC1-S1 - User presses and holds a widget to initiate a drag

The system SHALL allow a dashboard user to begin dragging any widget by pressing and holding a pointer on it.

#### Scenario: Drag starts on pointer down
- **WHEN** the user presses and holds on a widget
- **THEN** the system enters drag mode for that widget

#### Scenario: No drag on quick tap
- **WHEN** the user taps a widget without holding (below drag-initiation threshold)
- **THEN** the system does NOT enter drag mode

---

### Requirement: Display drag ghost preview
**Implements**: UC1-S2 - System lifts widget visually and displays ghost preview at current position

The system SHALL visually lift the dragging widget above peer widgets and render a ghost preview at its current grid position when drag mode is active.

#### Scenario: Ghost preview appears on drag start
- **WHEN** drag mode is initiated on a widget
- **THEN** the system renders a ghost/overlay copy of the widget above all other content
- **AND** the original widget cell displays a placeholder (dimmed or outlined)

#### Scenario: Original cell remains visible during drag
- **WHEN** a widget is being dragged
- **THEN** the grid cell from which the widget originated SHALL remain visible as a placeholder

---

### Requirement: Track pointer movement during drag
**Implements**: UC1-S3 - User moves the pointer across the grid

The system SHALL continuously track pointer position during an active drag and update the drag state accordingly.

#### Scenario: Drag state updates on pointer move
- **WHEN** the user moves the pointer while dragging
- **THEN** the system updates the current drag position in real time

---

### Requirement: Snap preview to grid cells in real time
**Implements**: UC1-S4 - System snaps ghost preview to nearest valid grid cell(s) in real time

The system SHALL translate the pointer's pixel position to the nearest grid cell coordinate and update the ghost preview position on every pointer-move event during drag.

#### Scenario: Preview snaps to nearest cell
- **WHEN** the user moves the pointer over the grid during drag
- **THEN** the ghost preview SHALL be positioned at the nearest grid cell (col, row) that can accommodate the widget's full size

#### Scenario: Preview updates continuously
- **WHEN** the pointer moves from one cell area to another
- **THEN** the ghost preview SHALL update its cell position without delay or jitter

---

### Requirement: Detect drop on pointer release
**Implements**: UC1-S5 - User releases pointer over a target cell

The system SHALL detect when the user releases the pointer and treat the current snapped cell as the intended drop target.

#### Scenario: Drop detected on pointer up
- **WHEN** the user releases the pointer while over the grid
- **THEN** the system SHALL evaluate the snapped target cell as the drop destination

---

### Requirement: Validate drop position
**Implements**: UC1-S6 - System validates target position is within bounds and unoccupied

The system SHALL validate that the drop target cell is within the grid boundaries and not already occupied by another widget before committing the placement.

#### Scenario: Valid position accepted
- **WHEN** the drop target cell is within bounds and unoccupied
- **THEN** the system SHALL accept the drop and proceed to place the widget

#### Scenario: Occupied cell rejected
- **WHEN** the drop target cell is already occupied by another widget
- **THEN** the system SHALL reject the drop

#### Scenario: Out-of-bounds position rejected
- **WHEN** the drop target would place any part of the widget outside the grid dimensions
- **THEN** the system SHALL reject the drop

---

### Requirement: Place widget at new position on successful drop
**Implements**: UC1-S7 - System places widget at snapped position and removes drag preview

The system SHALL move the widget to the validated target cell and remove the drag ghost preview when a drop is accepted.

#### Scenario: Widget placed at target cell
- **WHEN** a drop is accepted
- **THEN** the widget SHALL occupy the snapped target cell position
- **AND** the drag ghost preview SHALL be removed

#### Scenario: Layout reflects new widget position
- **WHEN** a drop is accepted
- **THEN** the layout state SHALL be updated so the widget's (col, row) matches the target cell

---

### Requirement: Persist layout to localStorage after drop
**Implements**: UC1-S8 - System persists updated layout to localStorage

The system SHALL serialise and write the full layout state to `localStorage` after every accepted drop.

#### Scenario: Layout written after successful drop
- **WHEN** a widget is successfully placed at a new position
- **THEN** the system SHALL write the updated layout JSON to `localStorage` under the dashboard's storage key

#### Scenario: localStorage failure is handled gracefully
- **WHEN** writing to `localStorage` throws an error (e.g., storage quota exceeded)
- **THEN** the system SHALL log a warning and continue operating with the in-memory layout

---

### Requirement: Clamp preview to last valid position when out of bounds
**Implements**: UC1-E3a - User moves pointer outside grid boundary — preview stays at last valid position

The system SHALL retain the ghost preview at the last valid grid position when the pointer moves outside the grid boundary during drag.

#### Scenario: Preview stays at last valid cell when pointer exits grid
- **WHEN** the user drags the pointer outside the grid boundary
- **THEN** the ghost preview SHALL remain at the last valid snapped cell position
- **AND** no out-of-bounds position SHALL be shown or indicated as a valid target

---

### Requirement: Show conflict indicator for invalid drop targets
**Implements**: UC1-E6a - Target position is occupied — system shows conflict highlight and snaps widget back

The system SHALL visually indicate a conflict (e.g., red tint on the preview) when the current snap target is invalid, and SHALL return the widget to its original position if the user drops on a conflicting cell.

#### Scenario: Conflict highlight shown on invalid target
- **WHEN** the snap target cell is occupied or out of bounds during drag
- **THEN** the ghost preview SHALL display a conflict visual indicator (e.g., red tint)

#### Scenario: Widget returns to origin on invalid drop
- **WHEN** the user releases the pointer on an occupied or out-of-bounds cell
- **THEN** the widget SHALL return to its original position
- **AND** the layout state SHALL remain unchanged

---

### Requirement: Reject drop on out-of-bounds target
**Implements**: UC1-E6b - Target position is out of bounds — treated as invalid, widget snaps back

The system SHALL treat any drop target that would place any part of the widget outside the grid as invalid and return the widget to its origin.

#### Scenario: Out-of-bounds drop reverts widget
- **WHEN** the user releases the pointer at a position that would place the widget outside the grid
- **THEN** the widget SHALL snap back to its original position
- **AND** the layout state SHALL remain unchanged

---

### Requirement: Cancel drag on Escape key
**Implements**: UC1-E1a - User cancels drag (Escape) — preview discarded, widget returns to original position

The system SHALL cancel an in-progress drag when the user presses the Escape key, restoring the widget to its original position without modifying layout state.

#### Scenario: Escape cancels drag
- **WHEN** the user presses Escape during an active drag
- **THEN** the drag operation SHALL be cancelled
- **AND** the widget SHALL return to its original position
- **AND** the layout state SHALL remain unchanged
- **AND** the ghost preview SHALL be removed

---

### Requirement: Read layout from localStorage on initialisation
**Implements**: UC2-S1 - System reads serialised layout from localStorage on page init

The system SHALL read and parse the layout JSON from `localStorage` during dashboard initialisation, before the first render.

#### Scenario: Stored layout loaded on mount
- **WHEN** the dashboard component mounts
- **THEN** the system SHALL read the layout entry from `localStorage` using the configured storage key

#### Scenario: Corrupt or unparseable JSON falls back to default
- **WHEN** the stored layout JSON cannot be parsed
- **THEN** the system SHALL use the default layout provided via props

---

### Requirement: Validate stored layout on load
**Implements**: UC2-S2 - System validates stored layout (IDs and positions)

The system SHALL validate the loaded layout by checking that each entry's widget ID exists in the current widget definitions and that each position is within the current grid bounds.

#### Scenario: Unknown widget IDs are filtered out
- **WHEN** the stored layout contains a widget ID not present in the current widget definitions
- **THEN** the system SHALL discard that entry from the loaded layout
- **AND** the remaining valid entries SHALL be used

#### Scenario: Out-of-bounds positions fall back to default
- **WHEN** a stored widget position exceeds the current grid dimensions
- **THEN** the system SHALL use the default layout position for that widget

#### Scenario: Cleaned layout is persisted back
- **WHEN** the loaded layout is modified during validation (entries removed or corrected)
- **THEN** the system SHALL write the cleaned layout back to `localStorage`

---

### Requirement: Render widgets at stored positions
**Implements**: UC2-S3 - System renders each widget at its stored grid position

The system SHALL position each widget in the grid according to its (col, row) coordinates from the validated loaded layout.

#### Scenario: Widgets rendered at persisted positions
- **WHEN** a valid stored layout is loaded
- **THEN** each widget SHALL be rendered at its stored (col, row) grid position

---

### Requirement: Dashboard appearance matches last saved state
**Implements**: UC2-S4 - User sees dashboard exactly as they left it

The system SHALL ensure the dashboard visible to the user after a page load is identical in widget arrangement to the state at the end of the last session.

#### Scenario: Dashboard matches last saved layout
- **WHEN** the user returns to the dashboard after a page reload
- **THEN** the widget arrangement SHALL match the layout that was saved at the end of the previous session

---

### Requirement: Fall back to default layout when no stored layout exists
**Implements**: UC2-E1a - No stored layout — system renders default layout from props/config

The system SHALL render the default layout (provided via component props or configuration) when no stored layout exists in `localStorage`.

#### Scenario: Default layout used on first visit
- **WHEN** no layout entry exists in `localStorage` for the dashboard's storage key
- **THEN** the system SHALL render widgets using the default layout defined in props

---

### Requirement: Discard stale widget entries from stored layout
**Implements**: UC2-E2a - Stored layout contains unknown widget ID — stale entry discarded, rest restored

The system SHALL silently discard layout entries for widget IDs that no longer exist in the current widget set, and SHALL restore the remaining valid entries.

#### Scenario: Stale entries discarded on load
- **WHEN** the stored layout references a widget ID that no longer exists
- **THEN** that entry SHALL be removed from the loaded layout
- **AND** all other valid entries SHALL be applied normally

---

### Requirement: Fall back to default for out-of-bounds stored positions
**Implements**: UC2-E2b - Widget position out of current grid bounds — falls back to default layout for affected widget

The system SHALL use the default layout position for any widget whose stored position falls outside the current grid dimensions.

#### Scenario: Out-of-bounds entry replaced with default position
- **WHEN** a stored widget position would place the widget outside the current grid
- **THEN** the system SHALL substitute the default layout position for that widget
- **AND** the substituted position SHALL be written back to `localStorage`
