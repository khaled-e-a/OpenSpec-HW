# Spec: widget-drag-drop

Generated: 2026-03-23

## Overview
This spec implements requirements for the `widget-drag-drop` capability — a drag-and-drop dashboard grid in React where users can freely move and resize widgets that snap to a configurable grid.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps from usecases.md:

| UC Step | Description | Requirement |
|---------|-------------|-------------|
| UC1-S1 | User presses and holds on a widget to initiate a drag | Drag Initiation |
| UC1-S2 | System lifts the widget visually and displays a drag preview following the pointer | Drag Visual Preview |
| UC1-S3 | System highlights valid drop zones on the grid as the user moves the pointer | Drop Zone Highlighting |
| UC1-S4 | User moves the pointer to the desired grid location and releases | Drag Initiation |
| UC1-S5 | System snaps the widget to the nearest valid grid cell at the drop position | Grid Snap on Drop |
| UC1-S6 | System reflows any displaced widgets to avoid overlap | Collision-Free Reflow |
| UC1-S7 | System saves the updated layout to persistent state | Layout Persistence |
| UC1-E4a | User releases outside the grid bounds — drag cancelled, widget returns to origin | Out-of-Bounds Cancel |
| UC1-E4b | Target cell occupied — widget snaps to nearest available adjacent cell | Adjacent Cell Fallback |
| UC1-E6a | No valid cell available near drop point — drop cancelled, widget returns to origin | No-Space Drop Cancel |
| UC1-E6a2 | System highlights the conflict to indicate why the drop failed | Conflict Highlight Feedback |
| UC2-S1 | User hovers over a widget; system reveals resize handles on edges/corners | Resize Handle Visibility |
| UC2-S2 | User clicks and drags a resize handle | Resize Drag Activation |
| UC2-S3 | System shows a live preview of the new widget size snapped to grid units | Resize Live Preview |
| UC2-S4 | User releases the handle at the desired size | Resize Drag Activation |
| UC2-S5 | System applies the new grid-unit dimensions to the widget | Resize Commit |
| UC2-S6 | System reflows neighbouring widgets if the enlarged widget overlaps them | Collision-Free Reflow |
| UC2-S7 | System saves the updated layout | Layout Persistence |
| UC2-E3a | User drags below minimum size (1×1) — system clamps and shows indicator | Minimum Size Enforcement |
| UC2-E3b | User drags beyond grid boundary — system clamps at grid edge | Grid Boundary Clamping |
| UC2-E6a | No room for reflow — system reverts to pre-resize dimensions and shows feedback | Resize Revert on Conflict |
| UC3-S1 | User navigates to or reloads the dashboard | Layout Persistence |
| UC3-S2 | System reads the serialised layout from localStorage | Layout Persistence |
| UC3-S3 | System validates that all widget IDs in the stored layout still exist | Stale Widget Cleanup |
| UC3-S4 | System renders each widget at its stored position and size | Layout Restore Rendering |
| UC3-S5 | Dashboard appears identical to how the user last left it | Layout Restore Rendering |
| UC3-E2a | No stored layout found — system renders the default layout | Default Layout Fallback |
| UC3-E3a | Stored layout has stale widget IDs — system renders only existing widgets | Stale Widget Cleanup |
| UC3-E3b | Stored layout data is corrupt — system falls back to default layout | Corrupt Layout Recovery |
| UC4-S1 | User opens the widget picker | Widget Picker Display |
| UC4-S2 | System displays available widget types with size previews | Widget Picker Display |
| UC4-S3 | User selects a widget type and initiates placement | Widget Addition |
| UC4-S4 | System finds the first available grid region that fits the widget's default size | Auto Placement |
| UC4-S5 | System places the widget at that position and renders it | Widget Addition |
| UC4-S6 | System saves the updated layout | Layout Persistence |
| UC4-E4a | No available region fits the widget — system informs user and suggests freeing space | No-Space Add Feedback |
| UC5-S1 | User activates the remove action on a widget | Widget Removal |
| UC5-S2 | System removes the widget from the grid | Widget Removal |
| UC5-S3 | System frees the grid cells previously occupied by the widget | Widget Removal |
| UC5-S4 | System saves the updated layout | Layout Persistence |
| UC5-E1a | User activates undo within timeout — system restores the widget at its previous position | Removal Undo |

---

## ADDED Requirements

### Requirement: Drag Initiation
**Implements**: UC1-S1 - User presses and holds on a widget to initiate a drag; UC1-S4 - User moves the pointer to the desired grid location and releases
The system SHALL allow the Dashboard User to initiate a drag on any widget by pressing and holding (pointer or touch) on the widget body or its drag-handle affordance. A minimum movement threshold of 5px SHALL be required before the drag is considered active, to prevent accidental drags on click interactions.

#### Scenario: Drag starts on hold
- **WHEN** a user presses and holds the pointer on a widget for at least 5px of movement
- **THEN** the system transitions the widget into an active drag state

#### Scenario: Click does not trigger drag
- **WHEN** a user clicks a widget without moving the pointer more than 5px
- **THEN** the system does not initiate a drag

#### Scenario: Touch drag initiation
- **WHEN** a user touches and moves a widget on a touch device
- **THEN** the system initiates a drag using the touch pointer

---

### Requirement: Drag Visual Preview
**Implements**: UC1-S2 - System lifts the widget visually and displays a drag preview following the pointer
The system SHALL render a floating visual clone (overlay) of the dragged widget that tracks the pointer position at all times during an active drag. The original widget slot SHALL remain visible as a semi-transparent ghost to indicate its starting position.

#### Scenario: Overlay follows pointer
- **WHEN** a drag is active
- **THEN** a clone of the dragged widget is rendered as a floating overlay that moves with the pointer

#### Scenario: Ghost slot remains
- **WHEN** a drag is active
- **THEN** the original widget slot is shown with reduced opacity to indicate its origin position

---

### Requirement: Drop Zone Highlighting
**Implements**: UC1-S3 - System highlights valid drop zones on the grid as the user moves the pointer; UC1-E6a2 - System highlights the conflict to indicate why the drop failed
The system SHALL highlight individual grid cells during an active drag to communicate drop validity. Cells that can accept the dragged widget SHALL be highlighted green. Cells that would cause the widget to exceed grid bounds or overlap an unmoveable widget SHALL be highlighted red.

#### Scenario: Valid cells highlighted green
- **WHEN** the dragged widget is hovering over an empty, in-bounds grid region
- **THEN** those cells are highlighted with a green tint

#### Scenario: Invalid cells highlighted red
- **WHEN** the dragged widget is hovering over an occupied or out-of-bounds region
- **THEN** those cells are highlighted with a red tint

#### Scenario: No highlight when not dragging
- **WHEN** no drag is active
- **THEN** no grid cells display a highlight overlay

---

### Requirement: Grid Snap on Drop
**Implements**: UC1-S5 - System snaps the widget to the nearest valid grid cell at the drop position
The system SHALL calculate the target grid position by converting the pointer's pixel offset into grid units using rounding to the nearest integer cell, then clamping to ensure the widget remains fully within the grid. The widget SHALL be placed at the computed snapped position upon drop.

#### Scenario: Widget snaps on release
- **WHEN** a user releases a dragged widget over the grid
- **THEN** the widget is placed at the nearest valid grid cell, aligned to cell boundaries

#### Scenario: Partial overlap snaps to nearest cell
- **WHEN** a user releases a widget where only part of it overlaps a grid cell
- **THEN** the widget snaps to the cell boundary closest to the drop point

---

### Requirement: Adjacent Cell Fallback
**Implements**: UC1-E4b - Target cell is occupied — widget snaps to nearest available adjacent cell
When the snapped target position is occupied, the system SHALL find and use the nearest unoccupied grid region large enough to fit the widget using a breadth-first search from the desired position.

#### Scenario: Occupied target uses adjacent cell
- **WHEN** the computed snap position is occupied by another widget
- **THEN** the system places the dragged widget at the nearest available adjacent position

---

### Requirement: Out-of-Bounds Cancel
**Implements**: UC1-E4a - User releases the pointer outside the grid bounds — drag cancelled, widget returns to origin
The system SHALL cancel an in-progress drag and return the widget to its original grid position if the pointer is released outside the grid container boundaries.

#### Scenario: Drop outside grid cancels drag
- **WHEN** a user releases the pointer outside the grid container
- **THEN** the widget returns to its original position and no layout change is recorded

---

### Requirement: No-Space Drop Cancel
**Implements**: UC1-E6a - No valid cell available near drop point — drop cancelled, widget returns to origin
The system SHALL cancel the drop and restore the widget to its original position if no valid unoccupied grid region of sufficient size exists near the drop point.

#### Scenario: No space reverts widget
- **WHEN** a drag is released and no valid placement can be found within the grid
- **THEN** the widget is returned to its original position unchanged

---

### Requirement: Collision-Free Reflow
**Implements**: UC1-S6 - System reflows any displaced widgets to avoid overlap; UC2-S6 - System reflows neighbouring widgets if the enlarged widget overlaps them
After a widget is moved or resized, the system SHALL ensure no two widgets occupy the same grid cells. Any widget displaced by the operation SHALL be automatically repositioned downward (gravity-down reflow) to the next available row. If displaced widgets cannot be accommodated within the grid, the entire operation SHALL be reverted.

#### Scenario: Displaced widget moves down
- **WHEN** a widget is placed at a position that partially overlaps another widget
- **THEN** the overlapped widget is pushed down to the next available row

#### Scenario: Operation reverted on no reflow room
- **WHEN** reflow cannot accommodate all displaced widgets within grid bounds
- **THEN** the move or resize operation is reverted and the layout remains unchanged

---

### Requirement: Resize Handle Visibility
**Implements**: UC2-S1 - User hovers over a widget; system reveals resize handles on edges/corners
The system SHALL display resize handles on widget edges and/or corners when the user hovers over a widget. Handles SHALL be hidden when the widget is not hovered to reduce visual clutter. On touch devices, handles SHALL be persistently visible when a widget is in focus.

#### Scenario: Handles appear on hover
- **WHEN** a user moves the pointer over a widget
- **THEN** resize handles are revealed on the widget's resizable edges

#### Scenario: Handles hidden when not hovered
- **WHEN** the pointer is not over a widget
- **THEN** resize handles are not visible for that widget

---

### Requirement: Resize Drag Activation
**Implements**: UC2-S2 - User clicks and drags a resize handle; UC2-S4 - User releases the handle at the desired size
The system SHALL allow the user to initiate a resize by clicking and dragging a resize handle. Dragging SHALL update the widget's preview size in real-time. Releasing the handle SHALL commit the resize if valid, or revert it if constrained.

#### Scenario: Drag handle activates resize
- **WHEN** a user presses and drags a resize handle
- **THEN** the system enters resize mode and tracks the drag delta

#### Scenario: Release commits resize
- **WHEN** a user releases a resize handle
- **THEN** the system commits the new widget dimensions if the position is valid

---

### Requirement: Resize Live Preview
**Implements**: UC2-S3 - System shows a live preview of the new widget size snapped to grid units
During a resize drag, the system SHALL show a live preview of the widget's new size snapped to the nearest grid unit. The preview SHALL update continuously as the handle is dragged.

#### Scenario: Preview updates during drag
- **WHEN** a user is dragging a resize handle
- **THEN** a preview of the new widget size, snapped to grid units, is displayed in real-time

---

### Requirement: Resize Commit
**Implements**: UC2-S5 - System applies the new grid-unit dimensions to the widget
Upon release of a resize handle, the system SHALL apply the previewed grid-unit dimensions to the widget's layout entry if no constraint violations exist.

#### Scenario: New dimensions applied on release
- **WHEN** a user releases a resize handle at a valid size
- **THEN** the widget's width and height in grid units are updated to match the preview

---

### Requirement: Minimum Size Enforcement
**Implements**: UC2-E3a - User drags below minimum size (1×1) — system clamps and shows indicator
The system SHALL enforce a minimum widget size of 1×1 grid unit. If a resize drag attempts to reduce the widget below this size, the system SHALL clamp the preview at 1×1 and provide a brief visual indicator on the resize handle to signal the floor has been reached.

#### Scenario: Resize clamped at minimum
- **WHEN** a user drags a resize handle to a size smaller than 1×1
- **THEN** the preview is clamped at 1×1 and a visual indicator is shown on the handle

---

### Requirement: Grid Boundary Clamping
**Implements**: UC2-E3b - User drags beyond grid boundary — system clamps at grid edge
The system SHALL prevent any widget from being resized beyond the grid's boundary. If a resize drag would extend the widget beyond the grid edge, the preview and committed size SHALL be clamped at the grid boundary.

#### Scenario: Resize clamped at grid edge
- **WHEN** a user drags a resize handle beyond the grid boundary
- **THEN** the widget's preview size is clamped so it fits within the grid

---

### Requirement: Resize Revert on Conflict
**Implements**: UC2-E6a - No room for reflow — system reverts to pre-resize dimensions and shows feedback
If a resize operation causes displacement that cannot be resolved via reflow within grid bounds, the system SHALL revert the widget to its pre-resize dimensions and display brief feedback to the user indicating insufficient space.

#### Scenario: Resize reverted when no reflow room
- **WHEN** a resize would displace widgets that cannot be reflowed within the grid
- **THEN** the widget returns to its previous dimensions and the user receives feedback

---

### Requirement: Layout Persistence
**Implements**: UC1-S7, UC2-S7, UC3-S1, UC3-S2, UC4-S6, UC5-S4 - All layout save/restore steps
The system SHALL automatically persist the current layout to `localStorage` after every layout mutation (move, resize, add, remove). Persistence SHALL be debounced by 300ms. On mount, the system SHALL attempt to read and restore the layout from `localStorage`.

#### Scenario: Layout saved after move
- **WHEN** a user successfully moves a widget
- **THEN** the updated layout is written to localStorage within 300ms

#### Scenario: Layout saved after resize
- **WHEN** a user successfully resizes a widget
- **THEN** the updated layout is written to localStorage within 300ms

#### Scenario: Layout restored on mount
- **WHEN** the dashboard component mounts
- **THEN** it reads the layout from localStorage and renders widgets at their stored positions

---

### Requirement: Layout Restore Rendering
**Implements**: UC3-S4 - System renders each widget at its stored position and size; UC3-S5 - Dashboard appears identical to how the user last left it
The system SHALL render each widget at exactly the grid position and size stored in the persisted layout. The resulting dashboard layout SHALL be visually identical to the state at the time of last persistence.

#### Scenario: Widgets render at stored positions
- **WHEN** a valid layout is loaded from localStorage
- **THEN** each widget appears at its stored (col, row, w, h) grid coordinates

---

### Requirement: Default Layout Fallback
**Implements**: UC3-E2a - No stored layout found — system renders the default layout
If no layout entry exists in `localStorage`, the system SHALL render the dashboard using a built-in default layout defined in the widget registry configuration.

#### Scenario: Default layout on first visit
- **WHEN** no layout is found in localStorage
- **THEN** the dashboard renders using the default layout from configuration

---

### Requirement: Stale Widget Cleanup
**Implements**: UC3-S3 - System validates that all widget IDs in the stored layout still exist; UC3-E3a - Stored layout has stale widget IDs — system renders only existing widgets
The system SHALL validate restored layout entries against the widget registry. Widget IDs present in the stored layout but absent from the registry SHALL be silently discarded. Remaining valid widgets SHALL render at their stored positions.

#### Scenario: Stale widget IDs discarded
- **WHEN** the stored layout contains a widget ID not in the registry
- **THEN** that widget entry is removed and remaining widgets render normally

---

### Requirement: Corrupt Layout Recovery
**Implements**: UC3-E3b - Stored layout data is corrupt — system falls back to default layout
If the value in `localStorage` cannot be parsed as valid JSON or fails schema validation, the system SHALL fall back to the default layout and log a console warning.

#### Scenario: Corrupt data uses default layout
- **WHEN** localStorage contains unparseable or invalid layout data
- **THEN** the system logs a warning and renders the default layout

---

### Requirement: Widget Picker Display
**Implements**: UC4-S1 - User opens the widget picker; UC4-S2 - System displays available widget types with size previews
The system SHALL provide a widget picker panel that can be opened by the Dashboard User. The picker SHALL display all registered widget types, each showing the widget's name and its default grid size (e.g., "2 × 2 cells").

#### Scenario: Picker opens on action
- **WHEN** a user activates the "Add Widget" control
- **THEN** a picker panel is displayed listing all available widget types

#### Scenario: Widget types shown with size
- **WHEN** the widget picker is open
- **THEN** each widget type entry shows its name and default grid dimensions

---

### Requirement: Widget Addition
**Implements**: UC4-S3 - User selects a widget type and initiates placement; UC4-S5 - System places the widget at that position and renders it
The system SHALL add a new widget instance of the selected type to the dashboard when the user selects it from the picker. The new widget SHALL be rendered at the auto-placed position and included in the layout state.

#### Scenario: Widget added and rendered
- **WHEN** a user selects a widget type from the picker
- **THEN** a new widget instance is rendered on the grid at a valid auto-placed position

---

### Requirement: Auto Placement
**Implements**: UC4-S4 - System finds the first available grid region that fits the widget's default size
The system SHALL automatically find the first available grid region (scanning top-left to bottom-right) that can accommodate the new widget's default size without overlapping existing widgets.

#### Scenario: New widget placed at first available position
- **WHEN** a widget is added and the grid has sufficient space
- **THEN** the widget is placed at the top-leftmost available region that fits its default dimensions

---

### Requirement: No-Space Add Feedback
**Implements**: UC4-E4a - No available region fits the widget — system informs user and suggests freeing space
If no grid region can accommodate a new widget's default size, the system SHALL inform the user that there is insufficient space and suggest removing or resizing an existing widget.

#### Scenario: User informed when grid is full
- **WHEN** a user attempts to add a widget but no valid space exists
- **THEN** the system displays a message explaining the limitation and suggests freeing space

---

### Requirement: Widget Removal
**Implements**: UC5-S1 - User activates the remove action on a widget; UC5-S2 - System removes the widget from the grid; UC5-S3 - System frees the grid cells previously occupied by the widget
The system SHALL allow the Dashboard User to remove any widget via a remove action exposed in the widget's toolbar. Upon removal, the widget SHALL no longer appear on the grid and its previously occupied cells SHALL become available.

#### Scenario: Widget removed from grid
- **WHEN** a user activates the remove action on a widget
- **THEN** the widget is no longer rendered and its grid cells are freed

---

### Requirement: Removal Undo
**Implements**: UC5-E1a - User activates undo within timeout — system restores the widget at its previous position
After a widget is removed, the system SHALL display an undo affordance (e.g., a toast notification) for 5 seconds. If the user activates undo within that window, the widget SHALL be restored to its previous grid position and size. Only the most recent removal SHALL be undoable.

#### Scenario: Undo restores removed widget
- **WHEN** a user activates undo within 5 seconds of removing a widget
- **THEN** the widget is restored at its previous (col, row, w, h) position

#### Scenario: Undo expires after timeout
- **WHEN** 5 seconds elapse after a widget removal without undo activation
- **THEN** the undo affordance is dismissed and the removal is permanent

#### Scenario: Only most recent removal is undoable
- **WHEN** a user removes two widgets in sequence
- **THEN** only the most recently removed widget can be restored via undo

---

### Requirement: Conflict Highlight Feedback
**Implements**: UC1-E6a2 - System highlights the conflict to indicate why the drop failed
When a drop is cancelled due to no valid placement being available, the system SHALL briefly highlight the conflicting grid region in red to communicate visually why the drop failed.

#### Scenario: Conflict region highlighted on failed drop
- **WHEN** a drop is cancelled because no valid placement exists
- **THEN** the conflicting cells flash red briefly before returning to their normal state
