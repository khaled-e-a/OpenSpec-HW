# Use Cases: widget-drag-drop

Generated: 2026-03-09

## Overview

This document captures the use cases for the widget-drag-drop change, following Cockburn's use case methodology. The capability covers drag-and-drop widget placement on a dashboard grid with snapping behaviour.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| Dashboard User | Rearrange widgets on the dashboard to suit their workflow |
| Dashboard User | Place a widget at a specific grid position |

## Use Cases

### Use Case 1: Drag Widget to New Grid Position

**Primary Actor**: Dashboard User
**Goal**: Move an existing dashboard widget to a different position on the grid

#### Stakeholders & Interests
- Dashboard User: Wants to reorganise widgets quickly and intuitively without breaking the layout
- System: Must maintain valid grid positions for all widgets and prevent overlapping

#### Preconditions
- The dashboard is rendered with at least one widget present
- The drag-and-drop library is initialised and interactive

#### Trigger
The user begins dragging a widget by pressing and holding on it

#### Main Success Scenario
1. User initiates a drag gesture on a widget
2. System lifts the widget visually and displays a drag preview following the pointer
3. User moves the pointer across the grid
4. System highlights the nearest valid grid cell(s) as a drop target as the pointer moves
5. User releases the pointer over the desired grid position
6. System snaps the widget to the nearest valid grid cell
7. System updates and persists the widget's grid position in the dashboard state

#### Extensions

4a. Pointer moves over an occupied cell:
  4a1. System indicates the cell is unavailable (no highlight or visual warning)
  4a2. Main scenario resumes from step 3

5a. User releases pointer outside the grid bounds:
  5a1. System cancels the drag and returns the widget to its original position
  5a2. Use case ends

5b. User releases pointer over an occupied cell:
  5b1. System cancels the drop and returns the widget to its original position
  5b2. Use case ends

#### Postconditions
- The widget occupies its new grid position
- No two widgets overlap on the grid
- Dashboard state reflects the updated layout

---

### Use Case 2: Drop Widget onto Empty Grid Area

**Primary Actor**: Dashboard User
**Goal**: Place a dragged widget precisely on an empty area of the grid

#### Stakeholders & Interests
- Dashboard User: Wants reliable snapping so widgets land in predictable positions
- System: Must compute the correct grid cell from pointer coordinates and enforce boundaries

#### Preconditions
- A drag operation is in progress (UC1 is active)
- At least one empty grid cell exists in the target area

#### Trigger
The user moves the pointer over an empty area of the grid while dragging

#### Main Success Scenario
1. User's pointer enters an empty grid area during a drag
2. System computes the grid cell(s) the widget would occupy at the pointer position
3. System highlights the target cell(s) to show the snap preview
4. User releases the pointer
5. System places the widget snapped to the computed cell(s)
6. System removes the drag preview and shows the widget in its final position

#### Extensions

2a. Widget would extend beyond the grid boundary:
  2a1. System clamps the target position so the widget stays within bounds
  2a2. System highlights the clamped position
  2a3. Main scenario resumes from step 3

#### Postconditions
- Widget is positioned at the snapped grid cell
- Widget remains fully within grid boundaries
- Drag preview is removed

---

## Notes
- Use cases focus on goal-level intent, not specific UI controls or mouse button mechanics
- Each extension is a potential negative test case
- Snapping behaviour (UC2) is a subfunction supporting the user goal (UC1) but captured separately for spec coverage

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User initiates a drag gesture on a widget |
| UC1-S2 | System lifts the widget visually and displays a drag preview following the pointer |
| UC1-S3 | User moves the pointer across the grid |
| UC1-S4 | System highlights the nearest valid grid cell(s) as a drop target as the pointer moves |
| UC1-S5 | User releases the pointer over the desired grid position |
| UC1-S6 | System snaps the widget to the nearest valid grid cell |
| UC1-S7 | System updates and persists the widget's grid position in the dashboard state |
| UC1-E4a | Pointer moves over an occupied cell — system indicates cell is unavailable |
| UC1-E5a | User releases pointer outside grid bounds — system cancels drag and restores original position |
| UC1-E5b | User releases pointer over occupied cell — system cancels drop and restores original position |
| UC2-S1 | User's pointer enters an empty grid area during a drag |
| UC2-S2 | System computes the grid cell(s) the widget would occupy at the pointer position |
| UC2-S3 | System highlights the target cell(s) to show the snap preview |
| UC2-S4 | User releases the pointer |
| UC2-S5 | System places the widget snapped to the computed cell(s) |
| UC2-S6 | System removes the drag preview and shows the widget in its final position |
| UC2-E2a | Widget would extend beyond grid boundary — system clamps position to keep widget within bounds |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
