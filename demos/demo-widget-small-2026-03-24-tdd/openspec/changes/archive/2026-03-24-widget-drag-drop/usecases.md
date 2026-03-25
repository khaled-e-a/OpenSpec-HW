# Use Cases: widget-drag-drop

Generated: 2026-03-24

## Overview

This document captures the use cases for the widget-drag-drop change, following Cockburn's use case methodology. The single capability `widget-drag-drop` enables a dashboard user to freely reposition variable-sized widgets on a snapping grid.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| Dashboard User | Rearrange widgets on the grid to suit their preferred layout |
| Dashboard User | Drag a widget to a new position and have it snap cleanly to the grid |
| Dashboard User | Be prevented from placing a widget where another already exists |

---

## Use Cases

### Use Case UC1: Reposition Widget on Dashboard Grid

**Primary Actor**: Dashboard User
**Goal**: Move a widget from its current grid position to a new position that better suits the user's layout preference

#### Stakeholders & Interests
- Dashboard User: Wants to freely rearrange widgets without breaking the layout
- System: Must keep all widgets within grid bounds and prevent overlapping

#### Preconditions
- The dashboard is rendered and at least one widget is visible on the grid
- The grid has at least one free cell adjacent to or away from the widget's current position

#### Trigger
The user begins dragging a widget by pressing and holding on it.

#### Main Success Scenario
1. User initiates a drag on a widget by pressing and holding it.
2. System lifts the widget visually, shows a drag preview at the widget's original size, and highlights the grid beneath.
3. User moves the pointer across the grid canvas.
4. System continuously snaps the drag preview to the nearest valid grid cell(s) as the pointer moves.
5. User releases the widget over a target grid area.
6. System validates that the target cells are unoccupied and within grid bounds.
7. System places the widget at the snapped target position and updates the layout state.
8. User sees the widget settled in its new grid position; all other widgets remain in place.

#### Extensions

5a. User releases the widget outside the grid canvas boundary:
  5a1. System returns the widget to its original position with a smooth animation.
  5a2. Layout state is unchanged.

6a. Target cells are partially or fully occupied by another widget:
  6a1. System rejects the drop and returns the dragged widget to its original position.
  6a2. System provides a visual cue (e.g., red highlight on the blocked cells) during the drag so the user can see the conflict before releasing.
  6a3. Layout state is unchanged.

6b. Target cells would place the widget partially outside grid bounds:
  6b1. System treats the position as invalid and returns the widget to its original position.
  6b2. Layout state is unchanged.

#### Postconditions
- The widget occupies its new grid position (or its original position if the drop was invalid).
- No two widgets overlap.
- All widgets remain fully within grid bounds.
- Layout state reflects the final positions of all widgets.

---

### Use Case UC2: View Dashboard with Multiple Sized Widgets

**Primary Actor**: Dashboard User
**Goal**: See all widgets rendered correctly at their designated sizes on the grid before any drag interaction

#### Stakeholders & Interests
- Dashboard User: Wants a clear, well-structured dashboard layout on load
- System: Must render each widget spanning the correct number of grid columns and rows

#### Preconditions
- The dashboard component has been mounted with an initial layout configuration specifying widget sizes and positions.

#### Trigger
The dashboard page is loaded or the component mounts.

#### Main Success Scenario
1. System receives an initial layout configuration (list of widgets with sizes and grid coordinates).
2. System renders the `DashboardGrid` canvas divided into equal-sized cells.
3. System renders each `DraggableWidget` occupying its specified cell span (e.g., 2×1, 2×2) at the correct grid position.
4. User sees all widgets displayed without overlap, each proportional to its declared size.

#### Extensions

3a. Two widgets in the initial configuration overlap:
  3a1. System logs a warning and renders the first widget in the conflicting position; the second widget is rendered at the nearest available position.

3b. A widget's declared position or size would extend outside grid bounds:
  3b1. System clamps the widget to fit within the grid boundary.

#### Postconditions
- All widgets are visible, correctly sized, and non-overlapping on the grid.

---

## Notes
- Use cases focus on intent, not UI mechanics (no mention of specific mouse events or CSS classes).
- Each main scenario step is a verifiable behaviour and maps directly to a test case.
- UC1 is the primary sea-level use case; UC2 is a supporting subfunction ensuring correct initial render.

---

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User initiates a drag on a widget by pressing and holding it |
| UC1-S2 | System lifts the widget visually, shows a drag preview at original size, highlights the grid |
| UC1-S3 | User moves the pointer across the grid canvas |
| UC1-S4 | System continuously snaps the drag preview to the nearest valid grid cell(s) as pointer moves |
| UC1-S5 | User releases the widget over a target grid area |
| UC1-S6 | System validates that target cells are unoccupied and within grid bounds |
| UC1-S7 | System places the widget at the snapped target position and updates layout state |
| UC1-S8 | User sees the widget settled in its new position; all other widgets remain in place |
| UC1-E5a | User releases widget outside the grid canvas boundary |
| UC1-E5a1 | System returns widget to original position with smooth animation; layout unchanged |
| UC1-E6a | Target cells are partially or fully occupied by another widget |
| UC1-E6a1 | System rejects drop and returns dragged widget to original position |
| UC1-E6a2 | System shows visual cue (red highlight) on blocked cells during drag |
| UC1-E6a3 | Layout state is unchanged after rejected drop |
| UC1-E6b | Target cells would place widget partially outside grid bounds |
| UC1-E6b1 | System treats position as invalid and returns widget to original position |
| UC2-S1 | System receives initial layout configuration with widget sizes and grid coordinates |
| UC2-S2 | System renders DashboardGrid canvas divided into equal-sized cells |
| UC2-S3 | System renders each DraggableWidget occupying its specified cell span at correct grid position |
| UC2-S4 | User sees all widgets displayed without overlap, each proportional to declared size |
| UC2-E3a | Two widgets in initial config overlap — first rendered in conflict position, second moved to nearest available |
| UC2-E3b | Widget declared outside grid bounds — system clamps it to fit within boundary |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
