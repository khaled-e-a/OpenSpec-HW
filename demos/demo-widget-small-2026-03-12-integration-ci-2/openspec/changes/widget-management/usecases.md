# Use Cases: widget-management

Generated: 2026-03-13

## Overview

This document captures the use cases for the widget-management change. Users can browse available widgets, add them to the dashboard grid, and remove widgets they no longer need. These use cases complement the existing drag-and-drop and resize interactions.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | Add a new widget to the dashboard grid |
| User | Remove an existing widget from the dashboard grid |

## Use Cases

---

### Use Case 1: Add Widget to Dashboard

**Primary Actor**: User
**Goal**: Place a new widget onto the dashboard grid

#### Stakeholders & Interests
- User: Wants to extend their dashboard with a widget they find useful, placed on the grid quickly
- System: Ensures the new widget is placed in a valid, non-overlapping grid position and persisted

#### Preconditions
- The dashboard grid is displayed with at least one available widget not yet on the grid
- The user is not currently dragging or resizing a widget

#### Trigger
User opens the widget catalogue (e.g., clicks an "Add widget" button)

#### Main Success Scenario
1. User opens the widget catalogue.
2. System displays a list of available widgets not currently present on the grid.
3. User selects a widget from the catalogue.
4. System finds the first available (non-overlapping) grid position for the new widget.
5. System places the widget at that position with a default size.
6. System closes the catalogue.
7. System persists the updated layout to local storage.

#### Extensions

2a. All widgets are already on the grid:
  2a1. System displays an empty catalogue with a message indicating no widgets are available to add.
  2a2. Use case ends.

4a. No available grid position exists (grid is full):
  4a1. System displays an error message: "Not enough space to add this widget."
  4a2. System does not add the widget.
  4a3. Use case ends.

#### Postconditions
- The selected widget appears on the dashboard grid at a valid, non-overlapping position.
- The updated layout is saved to local storage.
- The widget catalogue is closed.

---

### Use Case 2: Remove Widget from Dashboard

**Primary Actor**: User
**Goal**: Dismiss a widget from the dashboard grid

#### Stakeholders & Interests
- User: Wants to declutter the dashboard by removing a widget they no longer need
- System: Ensures the widget is cleanly removed and the layout is persisted; remaining widgets are not displaced

#### Preconditions
- At least one widget is present on the dashboard grid
- The user is not currently dragging or resizing a widget

#### Trigger
User activates the remove control on a widget (e.g., clicks the "×" button that appears on hover)

#### Main Success Scenario
1. User hovers over a widget; the remove control becomes visible.
2. User clicks the remove control on the target widget.
3. System removes the widget from the grid.
4. System leaves the remaining widgets in their current positions (no automatic reflow).
5. System persists the updated layout to local storage.

#### Extensions

2a. User accidentally clicks remove:
  2a1. System removes the widget immediately (no confirmation dialog for MVP).
  2a2. The widget is available again in the catalogue for re-adding.

3a. The widget being removed is the last widget on the grid:
  3a1. System removes it, leaving an empty grid.
  3a2. System persists the empty layout.
  3a3. Use case ends successfully.

#### Postconditions
- The removed widget no longer appears on the dashboard grid.
- All remaining widgets retain their previous positions and sizes.
- The updated layout is saved to local storage.
- The removed widget is available in the widget catalogue for future re-adding.

---

## Notes
- Use cases are at the **user-goal (sea level)** level — single-session interactions that deliver clear value.
- UI details (button labels, modal vs. popover) are intentionally omitted; those belong in design.md.
- The remove action is intentionally immediate (no confirmation) for MVP simplicity; a confirmation step can be added in a future change.
- Grid-full detection (UC1-E4a) reuses the `isValidPlacement` utility already in `src/utils/placement.ts`.

---

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User opens the widget catalogue |
| UC1-S2 | System displays available widgets not currently on the grid |
| UC1-S3 | User selects a widget from the catalogue |
| UC1-S4 | System finds the first available grid position for the new widget |
| UC1-S5 | System places the widget at that position with a default size |
| UC1-S6 | System closes the catalogue |
| UC1-S7 | System persists the updated layout to local storage |
| UC1-E2a1 | System displays an empty catalogue when all widgets are already on the grid |
| UC1-E4a1 | System displays an error when no grid space is available for the new widget |
| UC1-E4a2 | System does not add the widget when no space is available |
| UC2-S1 | User hovers over a widget; remove control becomes visible |
| UC2-S2 | User clicks the remove control on the target widget |
| UC2-S3 | System removes the widget from the grid |
| UC2-S4 | System leaves remaining widgets in their current positions |
| UC2-S5 | System persists the updated layout to local storage |
| UC2-E2a1 | System removes the widget immediately without a confirmation dialog |
| UC2-E2a2 | Removed widget becomes available again in the catalogue |
| UC2-E3a1 | System removes the last widget, leaving an empty grid |
| UC2-E3a2 | System persists the empty layout |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
