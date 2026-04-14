# Spec: widget-drag-drop

Generated: 2026-03-12

## Overview
This spec implements requirements for the `widget-drag-drop` capability — the drag-and-drop interaction layer for a React dashboard grid. It covers drag initiation, live drag preview, snap-to-grid positioning, drop validation, collision detection, resize interaction, and layout persistence.

See `usecases.md` "Use Case Traceability Mapping" for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User presses down on a widget and begins dragging it |
| UC1-S2 | System detects drag start and renders a drag ghost/preview at pointer position |
| UC1-S3 | System highlights grid cells the widget would occupy (snap preview) |
| UC1-S4 | User moves the pointer to the desired grid area |
| UC1-S5 | System continuously updates snap preview to nearest valid grid position |
| UC1-S6 | User releases the pointer to drop the widget |
| UC1-S7 | System snaps widget to nearest valid grid position and updates layout state |
| UC1-S8 | System persists updated layout to local storage |
| UC1-E3a1 | System shows snap preview in invalid/blocked state (target occupied) |
| UC1-E3a2 | System does not allow drop at occupied position |
| UC1-E6a1 | System cancels drag when pointer released outside grid boundary |
| UC1-E6a2 | Layout state remains unchanged after out-of-bounds drop |
| UC1-E6b1 | System cancels drag immediately on Escape key press |
| UC1-E6b2 | Widget animates back to its original position on cancel |
| UC1-E6b3 | Layout state remains unchanged after Escape cancel |
| UC2-S1 | User hovers resize handle; handle becomes visible/highlighted |
| UC2-S2 | User presses down on handle and drags to resize |
| UC2-S3 | System renders live size preview showing new grid span |
| UC2-S4 | User drags to desired size |
| UC2-S5 | User releases pointer to confirm new size |
| UC2-S6 | System updates widget grid span and reflows surrounding widgets if needed |
| UC2-S7 | System persists updated layout to local storage |
| UC2-E4a1 | System caps resize at last valid non-overlapping size |
| UC2-E4a2 | Preview reflects the capped size |
| UC2-E4b1 | System enforces minimum size constraint (1×1 grid units) |
| UC2-E4b2 | Widget cannot be resized below minimum |
| UC2-E5a1 | System reverts widget to original size on out-of-bounds release |
| UC2-E5a2 | Layout state remains unchanged after invalid resize |
| UC3-S1 | System reads saved layout from local storage on mount |
| UC3-S2 | System validates saved layout against current available widgets |
| UC3-S3 | System renders each widget at its saved grid position and size |
| UC3-S4 | User sees their previously arranged dashboard |
| UC3-E1a1 | System renders default layout when no saved layout exists |
| UC3-E2a1 | System discards stale widget entries from saved layout |
| UC3-E2a2 | System renders remaining widgets at saved positions |
| UC3-E2b1 | System logs warning and discards corrupt layout data |
| UC3-E2b2 | System renders default layout when saved data is corrupt |

---

## ADDED Requirements

### Requirement: Initiate Widget Drag
**Implements**: UC1-S1 - User presses down on a widget and begins dragging it; UC1-S4 - User moves the pointer to the desired grid area
The system SHALL allow a user to initiate a drag gesture on any widget by pressing the pointer down on it and moving, using pointer events (not the HTML5 Drag API).

#### Scenario: Drag initiated on widget
- **WHEN** the user presses the pointer down on a widget and begins moving the pointer
- **THEN** the system transitions the widget into a dragging state and begins tracking pointer movement

#### Scenario: Static click does not start drag
- **WHEN** the user presses and immediately releases the pointer without movement
- **THEN** the system does not initiate a drag and the layout is unchanged

---

### Requirement: Render Drag Ghost Preview
**Implements**: UC1-S2 - System detects drag start and renders a drag ghost/preview at pointer position
The system SHALL render a visual ghost copy of the dragged widget that follows the pointer during a drag operation. The original widget slot SHALL remain visible on the grid at reduced opacity to indicate the widget's origin.

#### Scenario: Ghost visible during drag
- **WHEN** a drag operation is active
- **THEN** a ghost copy of the widget is rendered at the current pointer position
- **THEN** the original widget slot is visible on the grid at reduced opacity

#### Scenario: Ghost removed on drag end
- **WHEN** the drag operation ends (drop, cancel, or Escape)
- **THEN** the ghost is removed from the DOM

---

### Requirement: Display Snap-to-Grid Preview
**Implements**: UC1-S3 - System highlights grid cells the widget would occupy (snap preview); UC1-S5 - System continuously updates snap preview to nearest valid grid position
The system SHALL display a highlighted overlay on the grid cells that the dragged widget would occupy if dropped at the current pointer position. The preview SHALL update continuously as the pointer moves, always reflecting the nearest valid snapped grid position.

#### Scenario: Valid snap preview shown
- **WHEN** a drag is active and the pointer is over a valid drop position
- **THEN** the grid cells the widget would occupy are highlighted in a distinct valid colour (e.g., blue)

#### Scenario: Snap preview updates on pointer move
- **WHEN** the pointer moves during a drag
- **THEN** the snap preview updates to reflect the nearest grid position within one animation frame

---

### Requirement: Block Drop at Occupied Position
**Implements**: UC1-E3a1 - System shows snap preview in invalid/blocked state (target occupied); UC1-E3a2 - System does not allow drop at occupied position
The system SHALL indicate when the snap target is invalid (occupied by another widget or out of bounds) and SHALL NOT commit a drop to an invalid position.

#### Scenario: Invalid snap preview shown on collision
- **WHEN** a drag is active and the pointer is over grid cells already occupied by another widget
- **THEN** the snap preview is displayed in a distinct invalid colour (e.g., red)

#### Scenario: Drop rejected at occupied position
- **WHEN** the user releases the pointer over an occupied grid position
- **THEN** the system does not update the layout
- **THEN** the dragged widget returns to its original position

---

### Requirement: Commit Widget Drop to Grid
**Implements**: UC1-S6 - User releases the pointer to drop the widget; UC1-S7 - System snaps widget to nearest valid grid position and updates layout state
The system SHALL snap the widget to the nearest valid grid position when the user releases the pointer over a valid drop target and SHALL update the layout state accordingly.

#### Scenario: Widget dropped at valid position
- **WHEN** the user releases the pointer over a valid, unoccupied grid position
- **THEN** the widget is placed at the snapped grid position
- **THEN** the layout state is updated to reflect the widget's new position

#### Scenario: No two widgets overlap after drop
- **WHEN** any drop is committed
- **THEN** no two widgets share the same grid cells

---

### Requirement: Cancel Drag on Out-of-Bounds Release
**Implements**: UC1-E6a1 - System cancels drag when pointer released outside grid boundary; UC1-E6a2 - Layout state remains unchanged after out-of-bounds drop
The system SHALL cancel the drag operation and restore the widget to its original position when the pointer is released outside the grid boundary. The layout state SHALL NOT be mutated.

#### Scenario: Drag cancelled on out-of-bounds release
- **WHEN** the user releases the pointer outside the dashboard grid area
- **THEN** the drag is cancelled
- **THEN** the widget returns to its original grid position
- **THEN** the layout state is unchanged

---

### Requirement: Cancel Drag on Escape Key
**Implements**: UC1-E6b1 - System cancels drag immediately on Escape key press; UC1-E6b2 - Widget animates back to its original position on cancel; UC1-E6b3 - Layout state remains unchanged after Escape cancel
The system SHALL immediately cancel an in-progress drag when the user presses the Escape key. The widget SHALL animate back to its original position and the layout state SHALL NOT be mutated.

#### Scenario: Escape cancels active drag
- **WHEN** a drag operation is active and the user presses the Escape key
- **THEN** the drag is immediately cancelled
- **THEN** the widget animates back to its original grid position
- **THEN** the layout state is unchanged

---

### Requirement: Persist Layout to Local Storage
**Implements**: UC1-S8 - System persists updated layout to local storage; UC2-S7 - System persists updated layout to local storage
The system SHALL write the current layout state to `localStorage` whenever a layout change is committed (drag drop or resize confirm).

#### Scenario: Layout saved after successful drop
- **WHEN** the user drops a widget at a valid new position
- **THEN** the updated layout is serialised and written to `localStorage`

#### Scenario: Layout saved after successful resize
- **WHEN** the user confirms a widget resize
- **THEN** the updated layout is serialised and written to `localStorage`

#### Scenario: Layout not saved after cancelled interaction
- **WHEN** a drag or resize is cancelled
- **THEN** `localStorage` is not written

---

### Requirement: Show Resize Handle on Hover
**Implements**: UC2-S1 - User hovers resize handle; handle becomes visible/highlighted
The system SHALL display a resize handle on a widget when the user hovers over it. The handle SHALL be positioned at the bottom-right corner of the widget and SHALL be hidden when the widget is not hovered.

#### Scenario: Resize handle appears on hover
- **WHEN** the user moves the pointer over a widget
- **THEN** the resize handle at the widget's bottom-right corner becomes visible

#### Scenario: Resize handle hidden at rest
- **WHEN** the pointer is not hovering over a widget
- **THEN** the resize handle is not visible

---

### Requirement: Resize Widget via Drag
**Implements**: UC2-S2 - User presses down on handle and drags to resize; UC2-S3 - System renders live size preview showing new grid span; UC2-S4 - User drags to desired size; UC2-S5 - User releases pointer to confirm new size; UC2-S6 - System updates widget grid span and reflows surrounding widgets if needed
The system SHALL allow a user to resize a widget by dragging its resize handle. During the drag a live size preview SHALL be shown. On release, the new size SHALL be committed to the layout state.

#### Scenario: Live preview shown during resize drag
- **WHEN** the user is dragging the resize handle
- **THEN** a live preview shows the new grid span the widget would occupy

#### Scenario: Resize committed on pointer release
- **WHEN** the user releases the pointer after a valid resize drag
- **THEN** the widget's grid span is updated to the new size
- **THEN** the layout state reflects the new span

---

### Requirement: Enforce Resize Collision Constraints
**Implements**: UC2-E4a1 - System caps resize at last valid non-overlapping size; UC2-E4a2 - Preview reflects the capped size
The system SHALL cap the resize at the last valid non-overlapping size when the desired new size would cause an overlap with another widget. The live preview SHALL reflect the capped size.

#### Scenario: Resize capped at collision boundary
- **WHEN** the user drags the resize handle to a size that would overlap another widget
- **THEN** the live preview reflects the largest valid size (capped)
- **THEN** committing the resize applies the capped size, not the overlapping size

---

### Requirement: Enforce Minimum Widget Size
**Implements**: UC2-E4b1 - System enforces minimum size constraint (1×1 grid units); UC2-E4b2 - Widget cannot be resized below minimum
The system SHALL enforce a minimum widget size of 1×1 grid units. No resize operation SHALL produce a widget smaller than 1 column by 1 row.

#### Scenario: Resize blocked below minimum width
- **WHEN** the user attempts to resize a widget to a width of less than 1 grid unit
- **THEN** the widget width is clamped to 1 grid unit

#### Scenario: Resize blocked below minimum height
- **WHEN** the user attempts to resize a widget to a height of less than 1 grid unit
- **THEN** the widget height is clamped to 1 grid unit

---

### Requirement: Revert Resize on Invalid Release
**Implements**: UC2-E5a1 - System reverts widget to original size on out-of-bounds release; UC2-E5a2 - Layout state remains unchanged after invalid resize
The system SHALL revert the widget to its original size and layout position when the resize interaction is released outside a valid boundary. The layout state SHALL NOT be mutated.

#### Scenario: Resize reverted on out-of-bounds release
- **WHEN** the user releases the resize handle outside the grid boundary
- **THEN** the widget reverts to its pre-resize size
- **THEN** the layout state is unchanged

---

### Requirement: Restore Layout from Local Storage on Mount
**Implements**: UC3-S1 - System reads saved layout from local storage on mount; UC3-S2 - System validates saved layout against current available widgets; UC3-S3 - System renders each widget at its saved grid position and size; UC3-S4 - User sees their previously arranged dashboard; UC3-E2a1 - System discards stale widget entries from saved layout; UC3-E2a2 - System renders remaining widgets at saved positions
The system SHALL read the saved layout from `localStorage` when the dashboard mounts, validate it against the current set of available widgets, and render each widget at its saved position and size.

#### Scenario: Saved layout restored on mount
- **WHEN** the dashboard is mounted and a valid layout exists in `localStorage`
- **THEN** each widget is rendered at its saved grid position and size

#### Scenario: Stale widget entries discarded
- **WHEN** the saved layout contains entries for widgets that no longer exist
- **THEN** those entries are discarded
- **THEN** the remaining widgets are rendered at their saved positions

---

### Requirement: Fall Back to Default Layout
**Implements**: UC3-E1a1 - System renders default layout when no saved layout exists; UC3-E2b2 - System renders default layout when saved data is corrupt
The system SHALL render a predefined default layout when no saved layout exists in `localStorage` or when the stored data cannot be parsed.

#### Scenario: Default layout used when no saved data
- **WHEN** the dashboard is mounted and `localStorage` contains no layout entry
- **THEN** the system renders the default layout

#### Scenario: Default layout used when data is corrupt
- **WHEN** the dashboard is mounted and the `localStorage` entry cannot be parsed as valid JSON
- **THEN** the system renders the default layout

---

### Requirement: Log Warning on Corrupt Layout Data
**Implements**: UC3-E2b1 - System logs warning and discards corrupt layout data
The system SHALL log a warning to the browser console when saved layout data is corrupt or unparseable, before falling back to the default layout.

#### Scenario: Warning logged for corrupt data
- **WHEN** the dashboard is mounted and the stored layout is not valid JSON or fails schema validation
- **THEN** the system logs a `console.warn` message identifying the issue
- **THEN** the system renders the default layout
