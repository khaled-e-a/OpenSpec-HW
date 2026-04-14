# Use Cases: widget-drag-drop

Generated: 2026-03-23

## Overview

This document captures the use cases for the widget-drag-drop change, following Cockburn's use case methodology. The primary capability enables users to arrange a dashboard by dragging widgets to new positions and resizing them, with all widgets snapping to a consistent grid.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| Dashboard User | Rearrange widgets to match their preferred layout |
| Dashboard User | Resize a widget to show more or less content |
| Dashboard User | Restore a previously saved layout after returning to the dashboard |
| Dashboard User | Add a new widget to the dashboard grid |
| Dashboard User | Remove an unwanted widget from the dashboard |

---

## Use Cases

### UC1 — Move Widget to New Position

**Primary Actor**: Dashboard User
**Goal**: Reposition a widget on the dashboard grid so it occupies a different location

#### Stakeholders & Interests
- **Dashboard User**: Wants to arrange widgets in a way that matches their workflow priority
- **System**: Must ensure widgets stay within grid bounds and do not overlap other widgets

#### Preconditions
- The dashboard is rendered with at least one widget visible
- The user's pointer device (mouse or touch) is available

#### Trigger
The user begins dragging a widget by pressing and holding on it

#### Main Success Scenario
1. User presses and holds on a widget to initiate a drag
2. System lifts the widget visually and displays a drag preview following the pointer
3. System highlights valid drop zones on the grid as the user moves the pointer
4. User moves the pointer to the desired grid location and releases
5. System snaps the widget to the nearest valid grid cell at the drop position
6. System reflows any displaced widgets to avoid overlap
7. System saves the updated layout to persistent state

#### Extensions
4a. User releases the pointer outside the grid bounds
  4a1. System cancels the drag and returns the widget to its original position

4b. Target cell is already fully occupied by another widget
  4b1. System snaps the dragged widget to the nearest available adjacent cell

6a. No valid cell is available near the drop point
  6a1. System cancels the drop and returns the widget to its original position
  6a2. System briefly highlights the conflict to indicate why the drop failed

#### Postconditions
- The widget occupies the new grid position
- No two widgets overlap
- The updated layout is persisted

---

### UC2 — Resize a Widget

**Primary Actor**: Dashboard User
**Goal**: Change the size of a widget (in grid units) to show more or less content

#### Stakeholders & Interests
- **Dashboard User**: Wants granular control over how much space a widget occupies
- **System**: Must ensure resized widget stays within grid bounds and doesn't overlap neighbours

#### Preconditions
- The dashboard is rendered with at least one widget visible
- The target widget supports resizing

#### Trigger
The user grabs the resize handle on the edge or corner of a widget

#### Main Success Scenario
1. User hovers over a widget; system reveals resize handles on its edges/corners
2. User clicks and drags a resize handle
3. System shows a live preview of the new widget size snapped to grid units
4. User releases the handle at the desired size
5. System applies the new grid-unit dimensions to the widget
6. System reflows neighbouring widgets if the enlarged widget overlaps them
7. System saves the updated layout

#### Extensions
3a. User drags the handle to a size smaller than the widget's minimum (1×1)
  3a1. System clamps the size to the minimum and shows a visual indicator

3b. User drags the handle beyond the grid boundary
  3b1. System clamps the size at the grid edge

6a. No room exists to reflow displaced neighbours
  6a1. System reverts to the pre-resize dimensions
  6a2. System provides brief feedback that there is insufficient space

#### Postconditions
- The widget occupies its new grid-unit dimensions
- No two widgets overlap
- The updated layout is persisted

---

### UC3 — Persist and Restore Layout

**Primary Actor**: Dashboard User
**Goal**: Return to the dashboard and find widgets exactly where they were left

#### Stakeholders & Interests
- **Dashboard User**: Wants their custom layout to survive page reloads and navigation
- **System**: Must serialise layout state reliably and restore it faithfully

#### Preconditions
- The user has previously arranged widgets (UC1 or UC2 was completed)
- A persistence mechanism (e.g., `localStorage`) is available in the browser

#### Trigger
The user reloads the page or navigates back to the dashboard

#### Main Success Scenario
1. User navigates to or reloads the dashboard
2. System reads the serialised layout from `localStorage`
3. System validates that all widget IDs in the stored layout still exist
4. System renders each widget at its stored position and size
5. Dashboard appears identical to how the user last left it

#### Extensions
2a. No stored layout is found (first visit or cleared storage)
  2a1. System renders the default layout defined in configuration

3a. Stored layout references widget IDs that no longer exist
  3a1. System renders only the widgets that still exist at their stored positions
  3a2. System silently discards stale widget entries

3b. Stored layout data is corrupt or unparseable
  3b1. System falls back to the default layout
  3b2. System logs a warning to the console

#### Postconditions
- Dashboard displays widget positions and sizes matching the last saved state (or default)

---

### UC4 — Add a Widget to the Dashboard

**Primary Actor**: Dashboard User
**Goal**: Place a new widget on the dashboard grid

#### Stakeholders & Interests
- **Dashboard User**: Wants to expand the dashboard with additional information panels
- **System**: Must find a valid grid position for the new widget

#### Preconditions
- The dashboard is rendered
- At least one grid cell is unoccupied

#### Trigger
The user selects a widget type from the widget picker/toolbar and confirms adding it

#### Main Success Scenario
1. User opens the widget picker
2. System displays available widget types with size previews
3. User selects a widget type and initiates placement
4. System finds the first available grid region that fits the widget's default size
5. System places the widget at that position and renders it
6. System saves the updated layout

#### Extensions
4a. No available region fits the widget's default size
  4a1. System informs the user that there is not enough space
  4a2. System suggests removing or resizing an existing widget

#### Postconditions
- The new widget is visible on the dashboard at a valid grid position
- Layout is persisted with the new widget included

---

### UC5 — Remove a Widget from the Dashboard

**Primary Actor**: Dashboard User
**Goal**: Permanently remove a widget from the dashboard to free up space

#### Stakeholders & Interests
- **Dashboard User**: Wants a clutter-free dashboard with only relevant widgets
- **System**: Must cleanly remove widget state and update the layout

#### Preconditions
- The dashboard is rendered with at least one widget

#### Trigger
The user activates the remove/close action on a widget (e.g., clicks ✕ on the widget toolbar)

#### Main Success Scenario
1. User activates the remove action on a widget
2. System removes the widget from the grid
3. System frees the grid cells previously occupied by the widget
4. System saves the updated layout

#### Extensions
1a. User accidentally triggers remove
  1a1. System shows a brief undo affordance (e.g., toast notification with "Undo")
  1a2. If user activates undo within the timeout, system restores the widget at its previous position

#### Postconditions
- The widget is no longer visible on the dashboard
- Its grid cells are available for other widgets
- Layout is persisted without the removed widget

---

## Notes
- Use cases focus on user intent, not specific UI controls (e.g., "activates remove" not "clicks the × button")
- Grid coordinates are abstract (column, row in grid units), not pixel values
- All layout mutations (move, resize, add, remove) share the same persistence pathway (UC3)
- UC1 and UC2 are the primary use cases; UC3–UC5 support the full lifecycle

---

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User presses and holds on a widget to initiate a drag |
| UC1-S2 | System lifts the widget visually and displays a drag preview following the pointer |
| UC1-S3 | System highlights valid drop zones on the grid as the user moves the pointer |
| UC1-S4 | User moves the pointer to the desired grid location and releases |
| UC1-S5 | System snaps the widget to the nearest valid grid cell at the drop position |
| UC1-S6 | System reflows any displaced widgets to avoid overlap |
| UC1-S7 | System saves the updated layout to persistent state |
| UC1-E4a | User releases the pointer outside the grid bounds — drag cancelled, widget returns to origin |
| UC1-E4b | Target cell is occupied — widget snaps to nearest available adjacent cell |
| UC1-E6a | No valid cell available near drop point — drop cancelled, widget returns to origin |
| UC1-E6a2 | System highlights the conflict to indicate why the drop failed |
| UC2-S1 | User hovers over a widget; system reveals resize handles on edges/corners |
| UC2-S2 | User clicks and drags a resize handle |
| UC2-S3 | System shows a live preview of the new widget size snapped to grid units |
| UC2-S4 | User releases the handle at the desired size |
| UC2-S5 | System applies the new grid-unit dimensions to the widget |
| UC2-S6 | System reflows neighbouring widgets if the enlarged widget overlaps them |
| UC2-S7 | System saves the updated layout |
| UC2-E3a | User drags below minimum size (1×1) — system clamps and shows indicator |
| UC2-E3b | User drags beyond grid boundary — system clamps at grid edge |
| UC2-E6a | No room for reflow — system reverts to pre-resize dimensions and shows feedback |
| UC3-S1 | User navigates to or reloads the dashboard |
| UC3-S2 | System reads the serialised layout from localStorage |
| UC3-S3 | System validates that all widget IDs in the stored layout still exist |
| UC3-S4 | System renders each widget at its stored position and size |
| UC3-S5 | Dashboard appears identical to how the user last left it |
| UC3-E2a | No stored layout found — system renders the default layout |
| UC3-E3a | Stored layout has stale widget IDs — system renders only existing widgets |
| UC3-E3b | Stored layout data is corrupt — system falls back to default layout |
| UC4-S1 | User opens the widget picker |
| UC4-S2 | System displays available widget types with size previews |
| UC4-S3 | User selects a widget type and initiates placement |
| UC4-S4 | System finds the first available grid region that fits the widget's default size |
| UC4-S5 | System places the widget at that position and renders it |
| UC4-S6 | System saves the updated layout |
| UC4-E4a | No available region fits the widget — system informs user and suggests freeing space |
| UC5-S1 | User activates the remove action on a widget |
| UC5-S2 | System removes the widget from the grid |
| UC5-S3 | System frees the grid cells previously occupied by the widget |
| UC5-S4 | System saves the updated layout |
| UC5-E1a | User activates undo within timeout — system restores the widget at its previous position |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
