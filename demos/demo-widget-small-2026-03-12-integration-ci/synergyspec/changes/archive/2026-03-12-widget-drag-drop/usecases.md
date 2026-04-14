# Use Cases: widget-drag-drop

Generated: 2026-03-12

## Overview

This document captures the use cases for the widget-drag-drop change, following Cockburn's use case methodology.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| Dashboard User | Reposition a widget to a new location on the grid |
| Dashboard User | Resize a widget to cover more or fewer grid cells |
| Dashboard User | Understand valid drop positions during drag |

## Use Cases

### Use Case 1: Reposition Widget on Grid
**Primary Actor**: Dashboard User
**Goal**: Move a widget from its current grid position to a new position

#### Stakeholders & Interests
- Dashboard User: Wants a fast, intuitive way to rearrange the layout
- System: Must maintain a consistent grid layout with no overlapping widgets

#### Preconditions
- The dashboard is rendered with at least one widget
- The user's device supports pointer events (mouse or touch)

#### Trigger
The user begins dragging a widget by pressing and holding on it

#### Main Success Scenario
1. User initiates drag on a widget
2. System lifts the widget visually and shows a drag preview at its original position
3. User moves the pointer across the grid
4. System highlights valid drop zones as the widget travels over grid cells
5. User releases the widget over a target grid cell
6. System snaps the widget to the nearest valid grid position
7. System updates the layout state with the widget's new position

#### Extensions
5a. Target cell is occupied by another widget
  5a1. System prevents drop and shows visual feedback indicating the position is invalid
  5a2. User moves to an unoccupied cell or cancels

5b. User cancels the drag (presses Escape or releases outside a valid zone)
  5b1. System returns the widget to its original position
  5b2. Layout state remains unchanged

#### Postconditions
- The widget occupies the target grid cells
- No two widgets overlap
- Layout state reflects the new position

---

### Use Case 2: Resize Widget on Grid
**Primary Actor**: Dashboard User
**Goal**: Change a widget's size to span a different number of grid cells

#### Stakeholders & Interests
- Dashboard User: Wants to allocate more or less space to a widget
- System: Must prevent the resized widget from overlapping others or exceeding grid boundaries

#### Preconditions
- The dashboard is rendered with at least one widget
- The target widget has a visible resize handle

#### Trigger
The user begins dragging the resize handle of a widget

#### Main Success Scenario
1. User locates the resize handle on a widget's edge or corner
2. User begins dragging the resize handle
3. System shows a live preview of the widget's new size as the handle is dragged
4. User releases the handle at the desired size
5. System snaps the widget size to the nearest whole grid cell dimensions
6. System checks for overlap with adjacent widgets
7. System updates the layout state with the widget's new size

#### Extensions
4a. Resized widget would overlap an adjacent widget
  4a1. System caps the resize at the boundary of the nearest occupied cell
  4a2. Widget snaps to the largest valid size in that direction

4b. Resized widget would exceed the grid boundary
  4b1. System constrains the size to the grid's edge
  4b2. Widget snaps to fit within the grid

4c. User cancels the resize (presses Escape)
  4c1. System restores the widget to its original size
  4c2. Layout state remains unchanged

#### Postconditions
- The widget spans the new grid cell dimensions
- No widgets overlap
- Layout state reflects the new size

---

## Notes
- Use cases focus on intent, not specific UI controls or library APIs
- Grid snapping is a system responsibility — users drag freely and the system aligns
- Both use cases should be testable via simulated pointer events

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User initiates drag on a widget |
| UC1-S2 | System shows drag preview at original position |
| UC1-S3 | User moves pointer across the grid |
| UC1-S4 | System highlights valid drop zones |
| UC1-S5 | User releases widget over a target grid cell |
| UC1-S6 | System snaps widget to nearest valid grid position |
| UC1-S7 | System updates layout state with new position |
| UC1-E5a | Target cell is occupied — system prevents drop with feedback |
| UC1-E5b | User cancels drag — system returns widget to original position |
| UC2-S1 | User locates resize handle on widget |
| UC2-S2 | User begins dragging resize handle |
| UC2-S3 | System shows live resize preview |
| UC2-S4 | User releases handle at desired size |
| UC2-S5 | System snaps widget size to whole grid cell dimensions |
| UC2-S6 | System checks for overlap with adjacent widgets |
| UC2-S7 | System updates layout state with new size |
| UC2-E4a | Resize would overlap adjacent widget — system caps at boundary |
| UC2-E4b | Resize would exceed grid boundary — system constrains to grid edge |
| UC2-E4c | User cancels resize — system restores original size |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
