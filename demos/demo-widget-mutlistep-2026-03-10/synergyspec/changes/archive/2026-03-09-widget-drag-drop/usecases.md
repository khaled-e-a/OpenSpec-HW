# Use Cases: widget-drag-drop

Generated: 2026-03-09

## Overview

This document captures the use cases for the `widget-drag-drop` change, following Cockburn's use case methodology. The single capability `widget-drag-drop` covers the full drag-and-drop lifecycle: initiating a drag, showing a snap-to-grid preview, validating the target position, and committing or cancelling the layout change.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | Rearrange dashboard widgets by dragging them to new grid positions |

---

## Use Cases

### Use Case 1: Drag Widget to New Position

**Primary Actor**: User
**Goal**: Move a widget from its current grid position to a different position on the dashboard

#### Stakeholders & Interests
- **User**: Wants to reorganise the dashboard layout quickly and intuitively, with clear feedback about where the widget will land
- **System**: Must maintain a valid layout — no overlaps, all widgets within grid bounds — and preserve layout integrity after every move

#### Preconditions
- The dashboard is rendered with at least one `DraggableWidget` inside a `DashboardGrid`
- The user is viewing the dashboard in a browser that supports pointer/touch events

#### Trigger
The user presses and holds (or touches and holds) a widget's drag handle or body to initiate a drag.

#### Main Success Scenario

1. User presses down on a widget to start dragging.
2. System lifts the widget visually (raises z-index, applies drag styling) and attaches it to the pointer.
3. System displays a ghost/shadow overlay at the nearest valid snap-to-grid position as the user moves the pointer.
4. User moves the pointer across the grid toward the desired target cell.
5. System continuously updates the ghost to the nearest valid snap position, keeping the preview within grid bounds.
6. User releases the pointer over the target position.
7. System validates that the target position is unoccupied and within grid bounds.
8. System commits the new position — updates layout state and re-renders the widget at the target cell.
9. System removes the drag overlay and restores normal widget appearance.

#### Extensions

**1a. User drags by touch on a mobile/tablet device**
- 1a1. System handles `touchstart`/`touchmove`/`touchend` events equivalently to pointer events.
- 1a2. Scenario continues from step 2.

**3a. No valid snap position exists near the pointer (e.g., pointer is outside the grid)**
- 3a1. System shows no ghost (or shows a "cannot drop here" indicator).
- 3a2. Scenario continues from step 4.

**6a. User releases the pointer outside the grid boundary**
- 6a1. System treats the drop as cancelled.
- 6a2. Widget animates back to its original position.
- 6a3. Layout state remains unchanged. Use case ends.

**7a. Target position is occupied by another widget (collision detected)**
- 7a1. System rejects the drop.
- 7a2. Widget animates back to its original position.
- 7a3. Layout state remains unchanged. Use case ends.

**7b. Target position is partially outside grid bounds**
- 7b1. System rejects the drop.
- 7b2. Widget animates back to its original position.
- 7b3. Layout state remains unchanged. Use case ends.

**Any step — User presses Escape before releasing**
- Ea1. System cancels the drag immediately.
- Ea2. Widget returns to its original position.
- Ea3. Layout state remains unchanged. Use case ends.

#### Postconditions
- Widget is rendered at the new grid position.
- No two widgets occupy the same grid cell(s).
- All widgets remain within grid bounds.
- Layout state reflects the updated positions and can be serialised/persisted.

---

## Notes

- Use cases focus on intent, not button labels or DOM events — implementation details (e.g., which DnD library handles events) belong in design.md.
- Each main-scenario step and significant extension is a potential test case.
- "Grid position" means a cell coordinate (column, row) — the widget's anchor cell plus its size span define its occupied area.

---

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User presses down on a widget to start dragging |
| UC1-S2 | System lifts the widget visually (raises z-index, applies drag styling) and attaches it to the pointer |
| UC1-S3 | System displays a ghost/shadow overlay at the nearest valid snap-to-grid position as the user moves the pointer |
| UC1-S4 | User moves the pointer across the grid toward the desired target cell |
| UC1-S5 | System continuously updates the ghost to the nearest valid snap position, keeping the preview within grid bounds |
| UC1-S6 | User releases the pointer over the target position |
| UC1-S7 | System validates that the target position is unoccupied and within grid bounds |
| UC1-S8 | System commits the new position — updates layout state and re-renders the widget at the target cell |
| UC1-S9 | System removes the drag overlay and restores normal widget appearance |
| UC1-E1a | User drags by touch — system handles touch events equivalently |
| UC1-E3a | No valid snap position near pointer — system shows no ghost or a "cannot drop" indicator |
| UC1-E6a | User releases outside grid — system cancels, widget returns to original position |
| UC1-E7a | Target position is occupied — collision detected, drop rejected, widget returns |
| UC1-E7b | Target position is partially out of bounds — drop rejected, widget returns |
| UC1-Ea | User presses Escape — drag cancelled immediately, widget returns, layout unchanged |

### Mapping Guidelines for Downstream Artifacts
- **Specs**: Reference steps using `**Implements**: UC1-S1 - [description]`
- **Design**: Reference steps using `**Addresses**: UC1-S1 - [description]`
- **Tasks**: Reference steps using `(Addresses: UC1-S1)` or `(Addresses: UC1-S1, UC1-S2)`
