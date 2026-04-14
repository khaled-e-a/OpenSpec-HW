# Use Cases: widget-add-resize-remove

Generated: 2026-03-10

## Overview

This document captures the use cases for the widget-add-resize-remove change, following Cockburn's use case methodology. Three new user goals are introduced — adding, resizing, and removing dashboard widgets — along with a supporting subfunction use case covering the updated layout model that underpins all operations.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | Add a new widget to the dashboard |
| User | Resize an existing widget to a different column/row span |
| User | Remove an unwanted widget from the dashboard |

---

## Use Cases

### Use Case UC1: Add Widget to Dashboard

**Primary Actor**: User
**Goal**: Place a new widget onto the dashboard grid at the next available position
**Level**: User goal

#### Stakeholders & Interests
- User: Wants to see a new widget appear on the dashboard without effort
- System: Must ensure the widget is placed at a valid, unoccupied cell and the layout remains consistent

#### Preconditions
- The dashboard is rendered and displaying the current grid layout
- At least one grid cell is unoccupied

#### Trigger
The user activates the "Add Widget" control (e.g., a toolbar button).

#### Main Success Scenario
1. User activates the Add Widget control.
2. System finds the first available (unoccupied) grid cell scanning left-to-right, top-to-bottom.
3. System creates a new widget entry with default size (1×1) at the found cell.
4. System updates the layout state and re-renders the grid with the new widget in place.
5. The new widget is visible on the dashboard and immediately available for interaction (drag, resize, remove).

#### Extensions

1a. No unoccupied cell exists in the current grid:
  1a1. System disables or visually indicates the Add Widget control as unavailable.
  1a2. No widget is added; layout remains unchanged.

#### Postconditions
- A new widget exists in the layout at a valid, unoccupied grid cell.
- `onLayoutChange` has been called with the updated `WidgetLayout[]` array including the new widget.

---

### Use Case UC2: Resize Widget

**Primary Actor**: User
**Goal**: Change a widget's column and row span by dragging a resize handle
**Level**: User goal

#### Stakeholders & Interests
- User: Wants to make a widget larger or smaller to fit their content needs
- System: Must prevent the resized widget from overlapping other widgets or exceeding grid bounds, and must give real-time visual feedback

#### Preconditions
- The dashboard is rendered with at least one widget visible.
- The widget to be resized is not currently being dragged.

#### Trigger
The user presses down on a resize handle on the corner or edge of a widget.

#### Main Success Scenario
1. User presses down on the resize handle of a widget.
2. System enters resize mode for that widget: activates a ghost overlay showing the widget's current size at its current position.
3. User drags the handle to increase or decrease the widget's span.
4. System continuously updates the ghost to reflect the candidate new size, snapped to whole grid cells.
5. System validates the candidate size: checks it stays within grid bounds and does not overlap other widgets.
6. Ghost reflects validity — valid candidate shown normally, invalid shown as "cannot resize" indicator.
7. User releases the handle at the desired size.
8. System validates the final candidate size.
9. System commits the new size — updates `w` and `h` in the layout state and re-renders the widget at its new span.
10. Ghost is removed and the widget renders at the new size.

#### Extensions

3a. User drags the handle to a position that would make the widget zero-sized:
  3a1. System clamps the minimum span to 1×1; ghost reflects the 1×1 minimum.

5a. Candidate size overlaps another widget or exceeds grid bounds:
  5a1. Ghost shows "cannot resize" indicator (distinct visual style).
  5a2. System continues tracking pointer movement; ghost updates as pointer moves.

7a. User releases handle at an invalid candidate size:
  7a1. System cancels the resize; widget retains its original size and layout is unchanged.

7b. User presses Escape during resize:
  7b1. System cancels the resize immediately; widget retains its original size and layout is unchanged.
  7b2. Ghost is removed.

#### Postconditions
- The widget's `w` and `h` in the layout reflect the new span.
- No two widgets overlap in the grid.
- `onLayoutChange` has been called with the updated `WidgetLayout[]` array.

---

### Use Case UC3: Remove Widget

**Primary Actor**: User
**Goal**: Delete a widget from the dashboard
**Level**: User goal

#### Stakeholders & Interests
- User: Wants a widget gone from the dashboard immediately and permanently (for the session)
- System: Must remove the widget cleanly and free the cells it occupied

#### Preconditions
- The dashboard is rendered with at least one widget visible.

#### Trigger
The user activates the Remove control on a specific widget (e.g., a close/×  button).

#### Main Success Scenario
1. User activates the Remove control on a widget.
2. System removes the widget from the layout state.
3. System re-renders the grid; the cells previously occupied by the widget are now empty.
4. `onLayoutChange` is called with the updated `WidgetLayout[]` array without the removed widget.

#### Extensions

1a. User activates Remove on the last remaining widget:
  1a1. System removes it; grid renders as empty.
  1a2. `onLayoutChange` is called with an empty array.

#### Postconditions
- The widget no longer appears in the layout or on the grid.
- Its previously occupied cells are available for future widgets.
- `onLayoutChange` has been called with the updated `WidgetLayout[]` array.

---

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User activates the Add Widget control |
| UC1-S2 | System finds the first available grid cell (left-to-right, top-to-bottom) |
| UC1-S3 | System creates a new widget entry with default size (1×1) at the found cell |
| UC1-S4 | System updates layout state and re-renders the grid with the new widget |
| UC1-S5 | New widget is visible and available for interaction |
| UC1-E1a | No unoccupied cell exists — Add Widget control is disabled/unavailable |
| UC2-S1 | User presses down on the resize handle of a widget |
| UC2-S2 | System enters resize mode — ghost overlay shows current size at current position |
| UC2-S3 | User drags the handle to change the widget's span |
| UC2-S4 | System continuously updates ghost to reflect candidate new size, snapped to whole cells |
| UC2-S5 | System validates candidate size: bounds check and collision check |
| UC2-S6 | Ghost reflects validity — valid normal, invalid shows "cannot resize" indicator |
| UC2-S7 | User releases handle at the desired size |
| UC2-S8 | System performs final validation of candidate size |
| UC2-S9 | System commits new size — updates `w` and `h` in layout, re-renders widget |
| UC2-S10 | Ghost is removed; widget renders at new size |
| UC2-E3a | Candidate span would be zero — system clamps to 1×1 minimum |
| UC2-E5a | Candidate size overlaps widget or exceeds bounds — ghost shows "cannot resize" |
| UC2-E7a | User releases at invalid size — resize cancelled, original size retained |
| UC2-E7b | User presses Escape during resize — resize cancelled immediately, ghost removed |
| UC3-S1 | User activates the Remove control on a widget |
| UC3-S2 | System removes the widget from layout state |
| UC3-S3 | System re-renders the grid; occupied cells are now empty |
| UC3-S4 | `onLayoutChange` called with updated array without the removed widget |
| UC3-E1a | User removes the last remaining widget — grid renders as empty, `onLayoutChange` called with empty array |

### Mapping Guidelines for Downstream Artifacts
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
