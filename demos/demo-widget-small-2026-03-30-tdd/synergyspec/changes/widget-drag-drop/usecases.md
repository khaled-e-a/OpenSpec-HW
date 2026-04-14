# Use Cases: widget-drag-drop

Generated: 2026-03-30

## Overview

This document captures the use cases for the widget-drag-drop change, following Cockburn's use case methodology. The single capability `widget-drag-drop` yields one primary user-goal use case covering the full drag-and-drop lifecycle, plus a supporting subfunction use case for layout persistence.

---

## Actor-Goal List

| Actor | Goal |
|-------|------|
| Dashboard User | Rearrange widgets on the dashboard by dragging them to preferred positions |
| Dashboard User | Retain a customised layout across browser sessions |

---

## Use Cases

### UC1 — Drag and Drop a Widget to a New Grid Position

**Level**: User goal (sea level)
**Primary Actor**: Dashboard User
**Goal**: Move a widget to a different position on the dashboard grid so the layout reflects the user's priorities.

#### Stakeholders & Interests
- **Dashboard User**: Wants to freely reposition widgets with immediate visual feedback and have the new layout stick.
- **System**: Must keep widget positions valid (no overlap, no out-of-bounds) and keep the grid coherent after every drop.

#### Preconditions
- The dashboard is rendered with at least one widget visible on the grid.
- The grid dimensions and cell size are initialised.

#### Trigger
The user begins dragging a widget by pressing and holding on it.

#### Main Success Scenario

1. User presses and holds a widget to initiate a drag.
2. System lifts the widget visually (raises it above peer widgets) and displays a ghost/preview at the widget's current grid position.
3. User moves the pointer across the grid.
4. System continuously snaps the ghost preview to the nearest valid grid cell(s) that can accommodate the widget's size, updating the preview in real time.
5. User releases the pointer over a target cell.
6. System validates that the target position is within bounds and unoccupied by another widget.
7. System places the widget at the snapped target position and removes the drag preview.
8. System persists the updated layout to `localStorage`.

#### Extensions

3a. User moves the pointer outside the grid boundary:
  3a1. System keeps the preview at the last valid snapped position; no out-of-bounds placement is shown.

6a. Target position is already occupied by another widget:
  6a1. System highlights the conflict zone (e.g., red tint on preview).
  6a2. System does not allow the drop; widget snaps back to its original position.

6b. Target position would place part of the widget out of grid bounds:
  6b1. System treats the position as invalid (same as 6a1–6a2).

1a. User immediately cancels the drag (e.g., presses Escape):
  1a1. System discards the preview and returns the widget to its original position without any state change.

#### Postconditions
- The widget occupies the new grid position.
- No two widgets overlap.
- The updated layout is saved in `localStorage`.

---

### UC2 — Persist and Restore Dashboard Layout

**Level**: Subfunction (clam)
**Primary Actor**: Dashboard User
**Goal**: Ensure the customised widget layout survives a page reload or return visit.

#### Stakeholders & Interests
- **Dashboard User**: Wants their arrangement to be remembered without any explicit save action.
- **System**: Must serialise and deserialise layout state reliably without data loss.

#### Preconditions
- A drag-and-drop operation (UC1) has completed successfully at least once.
- `localStorage` is accessible in the browser.

#### Trigger
The page is loaded or reloaded after a layout has been previously saved.

#### Main Success Scenario

1. System reads the serialised layout from `localStorage` on page initialisation.
2. System validates the stored layout (widget IDs still exist, positions within current grid bounds).
3. System renders each widget at its stored grid position.
4. User sees the dashboard exactly as they left it.

#### Extensions

1a. No stored layout exists in `localStorage` (first visit or cleared storage):
  1a1. System renders the default layout defined in component props/config.

2a. Stored layout contains a widget ID that no longer exists in the current widget set:
  2a1. System discards the stale entry and positions the remaining widgets from stored data.
  2a2. System saves the cleaned layout back to `localStorage`.

2b. Stored layout has a widget positioned outside current grid bounds (e.g., grid was resized):
  2b1. System falls back to the default layout for affected widgets.

#### Postconditions
- All widgets are rendered at valid positions.
- The layout in `localStorage` reflects the current rendered state.

---

## Notes
- UC1 is the primary sea-level use case; UC2 is a supporting subfunction triggered automatically by the system.
- UI details (button labels, CSS classes) are intentionally excluded — steps describe intent.
- Every main scenario step and extension is a candidate automated test case.
- Grid cell coordinates are abstract (column, row) indices, not pixel values.

---

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
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

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
