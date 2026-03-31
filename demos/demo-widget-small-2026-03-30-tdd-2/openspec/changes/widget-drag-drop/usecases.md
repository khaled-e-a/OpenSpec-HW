# Use Cases: widget-drag-drop

Generated: 2026-03-30

## Overview

This document captures the use cases for the widget-drag-drop change, following Cockburn's use case methodology. The capability allows users to drag differently-sized widgets across a dashboard canvas and snap them to grid positions, with collision prevention and drag preview feedback.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| Dashboard User | Reposition a widget to a preferred location on the grid |
| Dashboard User | Place a new widget onto the dashboard at a chosen position |
| Dashboard System | Prevent widgets from overlapping during placement |
| Dashboard System | Provide visual feedback during a drag operation |

---

## Use Cases

### Use Case 1: Reposition Widget on Dashboard Grid

**Primary Actor**: Dashboard User
**Goal**: Move an existing widget to a new position on the dashboard grid

#### Stakeholders & Interests
- **Dashboard User**: Wants to freely rearrange widgets to match their preferred layout
- **Dashboard System**: Must maintain a valid, non-overlapping layout at all times
- **Application**: Must persist or expose the updated layout state

#### Preconditions
- The dashboard is rendered with at least one widget placed on the grid
- The user's device supports pointer/mouse drag events

#### Trigger
The user initiates a drag on a widget (click/hold + move)

#### Main Success Scenario
1. User clicks and holds on a widget to begin dragging it.
2. System detaches the widget visually and displays a drag preview that follows the pointer.
3. User moves the pointer across the dashboard canvas.
4. System highlights the grid cell(s) the widget would occupy if dropped at the current pointer position.
5. User releases the pointer over a valid, unoccupied grid region.
6. System snaps the widget to the nearest valid grid position.
7. System updates the layout state to reflect the new widget position.

#### Extensions

**4a. Pointer moves outside the dashboard canvas boundary:**
- 4a1. System continues showing the drag preview but does not highlight any drop target.
- 4a2. If the user releases outside the canvas, the system returns the widget to its original position.

**5a. Target grid region is already occupied by another widget:**
- 5a1. System visually indicates the position is invalid (e.g., red highlight).
- 5a2. User moves the pointer to a valid region and releases, or releases on the invalid region.
- 5a3. If released on an occupied region, system returns the widget to its original position.

**5b. User presses Escape key during drag:**
- 5b1. System cancels the drag operation and restores the widget to its original position.

#### Postconditions
- The widget occupies the new grid position.
- No two widgets overlap.
- The layout state reflects the updated position.

---

### Use Case 2: Place New Widget onto Dashboard

**Primary Actor**: Dashboard User
**Goal**: Add a new widget to an unoccupied area of the dashboard grid

#### Stakeholders & Interests
- **Dashboard User**: Wants to choose where a new widget lands on the grid
- **Dashboard System**: Must ensure the new widget does not overlap existing widgets
- **Application**: Must incorporate the new widget into the layout state

#### Preconditions
- The dashboard is rendered and at least some grid cells are unoccupied
- A new widget is available to be placed (e.g., from a widget tray or by programmatic addition)

#### Trigger
User drags a new widget from outside the grid onto the dashboard canvas

#### Main Success Scenario
1. User picks up a new widget from the widget source area.
2. System shows a drag preview of the widget following the pointer.
3. User moves the pointer over the dashboard canvas.
4. System highlights the grid cell(s) the widget would occupy at the current pointer position.
5. User releases the pointer over a valid, unoccupied grid region.
6. System places the widget at the snapped grid position.
7. System updates the layout state to include the new widget.

#### Extensions

**4a. No unoccupied region large enough for the widget exists:**
- 4a1. System shows no valid highlight anywhere on the canvas.
- 4a2. User releases the widget; system returns it to its source without placing it.

**5a. Target region is partially occupied:**
- 5a1. System shows the position as invalid.
- 5a2. User adjusts pointer to a valid region or cancels.

**5b. User cancels drag (Escape or release outside canvas):**
- 5b1. System discards the widget placement; layout is unchanged.

#### Postconditions
- The new widget appears at the chosen grid position.
- No overlap with existing widgets.
- Layout state includes the new widget.

---

### Use Case 3: Receive Visual Feedback During Drag

**Primary Actor**: Dashboard User
**Goal**: Understand where a widget will land before releasing the drag

#### Stakeholders & Interests
- **Dashboard User**: Wants clear, real-time visual feedback to make accurate placements
- **Dashboard System**: Must render drag preview and drop-zone highlights without blocking interaction

#### Preconditions
- A drag operation is in progress (widget is being dragged)

#### Trigger
User has begun dragging a widget and is moving it across the canvas

#### Main Success Scenario
1. User is dragging a widget across the dashboard canvas.
2. System renders a semi-transparent drag preview of the widget at the current pointer position.
3. System computes and highlights the grid cell(s) the widget would snap to upon release.
4. Highlight color indicates validity: green (or neutral) for valid, red (or blocked) for occupied/invalid.
5. User moves the pointer; system continuously updates the preview and highlight in real time.
6. User releases the pointer; the widget is placed (or returned) per the drop outcome.

#### Extensions

**3a. Widget is over its original position:**
- 3a1. System shows a neutral highlight (no-move state).

**5a. Drag preview lags or flickers:**
- 5a1. System degrades gracefully — preview may be simplified but must remain visible.

#### Postconditions
- The drag preview is removed after drop or cancel.
- The grid returns to its normal (no highlight) state.

---

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| **UC1-S1** | User clicks and holds on a widget to begin dragging it |
| **UC1-S2** | System detaches the widget visually and displays a drag preview following the pointer |
| **UC1-S3** | User moves the pointer across the dashboard canvas |
| **UC1-S4** | System highlights the grid cell(s) the widget would occupy at the current pointer position |
| **UC1-S5** | User releases the pointer over a valid, unoccupied grid region |
| **UC1-S6** | System snaps the widget to the nearest valid grid position |
| **UC1-S7** | System updates the layout state to reflect the new widget position |
| **UC1-E4a** | Pointer moves outside the dashboard canvas boundary — no drop target highlighted |
| **UC1-E4a1** | Widget is returned to original position if released outside canvas |
| **UC1-E5a** | Target grid region is occupied — system shows invalid indicator |
| **UC1-E5a2** | Widget returned to original position if dropped on occupied region |
| **UC1-E5b** | User presses Escape — drag cancelled, widget restored to original position |
| **UC2-S1** | User picks up a new widget from the widget source area |
| **UC2-S2** | System shows a drag preview of the new widget following the pointer |
| **UC2-S3** | User moves the pointer over the dashboard canvas |
| **UC2-S4** | System highlights the grid cell(s) the new widget would occupy |
| **UC2-S5** | User releases the pointer over a valid, unoccupied grid region |
| **UC2-S6** | System places the widget at the snapped grid position |
| **UC2-S7** | System updates the layout state to include the new widget |
| **UC2-E4a** | No unoccupied region large enough — no valid highlight shown |
| **UC2-E4a2** | Widget returned to source without placement |
| **UC2-E5a** | Target region partially occupied — system shows invalid indicator |
| **UC2-E5b** | User cancels drag — layout unchanged |
| **UC3-S1** | User is dragging a widget across the dashboard canvas |
| **UC3-S2** | System renders a semi-transparent drag preview at current pointer position |
| **UC3-S3** | System computes and highlights the snap target grid cell(s) |
| **UC3-S4** | Highlight color indicates validity: green/neutral = valid, red/blocked = invalid |
| **UC3-S5** | User moves pointer; system continuously updates preview and highlight in real time |
| **UC3-S6** | User releases pointer; widget is placed or returned per drop outcome |
| **UC3-E3a** | Widget is over its original position — neutral highlight shown |
| **UC3-E5a** | Drag preview lags — system degrades gracefully, preview remains visible |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
