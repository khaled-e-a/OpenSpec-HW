# Use Cases: widget-drag-drop

Generated: 2026-03-12

## Overview

This document captures the use cases for the widget-drag-drop change, following Cockburn's use case methodology. It covers the drag-and-drop interaction layer for a dashboard grid — enabling users to freely reposition and resize widgets that snap to a structured grid.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| Dashboard User | Rearrange widgets to personalise their dashboard layout |
| Dashboard User | Move a widget to a different position on the grid |
| Dashboard User | See a live preview of where a widget will land while dragging |
| Dashboard User | Have their layout automatically saved and restored across sessions |
| System | Enforce grid constraints so widgets stay valid and non-overlapping |

---

## Use Cases

### Use Case 1: Drag and Reposition a Widget

**Primary Actor**: Dashboard User
**Goal**: Move a widget to a new position on the dashboard grid

#### Stakeholders & Interests
- Dashboard User: Wants a smooth drag experience and widgets that land exactly where expected
- System: Must maintain a valid, non-overlapping grid layout at all times

#### Preconditions
- The dashboard is rendered with at least one widget visible on the grid
- The user's pointer device (mouse or touch) is available

#### Trigger
The user initiates a drag gesture on a widget (mousedown + move, or touchstart + move)

#### Main Success Scenario
1. User presses down on a widget and begins dragging it across the dashboard
2. System detects the drag start and lifts the widget visually, rendering a drag ghost/preview at the pointer position
3. System highlights the grid cells that the widget would occupy if dropped at the current pointer location (snap preview)
4. User moves the pointer to the desired grid area
5. System continuously updates the snap preview to reflect the nearest valid grid position as the pointer moves
6. User releases the pointer to drop the widget
7. System snaps the widget to the nearest valid grid position and updates the layout state
8. System persists the updated layout to local storage

#### Extensions
3a. Target position is already occupied by another widget:
  3a1. System shows the snap preview in an invalid/blocked state (e.g., red highlight)
  3a2. System does not allow the drop at that position (continues to step 4)

6a. User releases the pointer outside the grid boundary:
  6a1. System cancels the drag and returns the widget to its original position
  6a2. Layout state remains unchanged

6b. User presses Escape during the drag:
  6b1. System cancels the drag immediately
  6b2. Widget animates back to its original position
  6b3. Layout state remains unchanged

#### Postconditions
- The widget occupies its new grid position
- No two widgets overlap
- The updated layout is saved to local storage

---

### Use Case 2: Resize a Widget on the Grid

**Primary Actor**: Dashboard User
**Goal**: Change the grid span (width and/or height) of a widget

#### Stakeholders & Interests
- Dashboard User: Wants to make certain widgets larger (e.g., a chart) or smaller to free up space
- System: Must enforce minimum/maximum size constraints and prevent overlaps after resizing

#### Preconditions
- The dashboard is rendered with at least one widget visible on the grid
- The widget exposes a resize handle

#### Trigger
User drags the resize handle located at the widget's bottom-right corner

#### Main Success Scenario
1. User hovers over the resize handle at the corner of a widget; the handle becomes visible/highlighted
2. User presses down on the handle and drags to resize
3. System renders a live size preview showing the new grid span the widget would occupy
4. User drags to the desired size
5. User releases the pointer to confirm the new size
6. System updates the widget's grid span and reflows surrounding widgets if needed
7. System persists the updated layout to local storage

#### Extensions
4a. Desired size would overlap another widget:
  4a1. System caps the resize at the last valid non-overlapping size
  4a2. Preview reflects the capped size

4b. Desired size is smaller than the widget's minimum size:
  4b1. System enforces the minimum size constraint
  4b2. Widget cannot be resized below 1×1 grid units

5a. User releases the pointer outside a valid resize boundary:
  5a1. System reverts the widget to its original size
  5a2. Layout state remains unchanged

#### Postconditions
- The widget occupies its new grid span
- No two widgets overlap
- The updated layout is saved to local storage

---

### Use Case 3: Restore Saved Layout on Dashboard Load

**Primary Actor**: Dashboard User
**Goal**: See their previously arranged widget layout when they return to the dashboard

#### Stakeholders & Interests
- Dashboard User: Expects their customisations to persist across browser sessions
- System: Must load a valid layout and fall back gracefully if stored data is missing or corrupt

#### Preconditions
- The dashboard application is loading in the browser

#### Trigger
The dashboard page is mounted/initialised

#### Main Success Scenario
1. System reads the saved layout from local storage on mount
2. System validates that the saved layout matches the current set of available widgets
3. System renders each widget at its saved grid position and size
4. User sees their previously arranged dashboard

#### Extensions
1a. No saved layout exists in local storage:
  1a1. System renders the default layout (predefined widget positions)

2a. Saved layout contains positions for widgets that no longer exist:
  2a1. System discards the stale widget entries
  2a2. System renders remaining widgets at their saved positions

2b. Saved layout data is corrupt or unparseable:
  2b1. System logs a warning and discards the corrupt data
  2b2. System renders the default layout

#### Postconditions
- Dashboard displays all widgets at their correct positions
- Layout is ready for user interaction

---

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
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

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
