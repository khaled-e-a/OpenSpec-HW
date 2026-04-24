# Use Cases: react-drag-drop-dashboard

Generated: 2026-04-24

## Overview

This document captures the use cases for the react-drag-drop-dashboard change, following Cockburn's use case methodology. Three capabilities drive the use cases: the drag-and-drop dashboard layout (`drag-drop-dashboard`), the widget registry (`widget-registry`), and layout persistence (`dashboard-persistence`).

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | Arrange dashboard widgets into a preferred layout by dragging and dropping |
| User | Browse and understand available widget types |
| User | Have the dashboard remember their layout between sessions |
| System | Persist and restore widget positions reliably |

---

## Use Cases

### UC1: Arrange Dashboard Widgets

**Primary Actor**: User
**Goal**: Rearrange widgets on the dashboard into a personally preferred layout by dragging them to new positions.

#### Stakeholders & Interests
- **User**: Wants an intuitive way to customise the dashboard without any configuration files or developer help
- **System**: Must keep widget positions valid (no overlaps, no out-of-bounds placements) and persist changes

#### Preconditions
- The user has navigated to `/dashboard`
- At least two widgets are rendered on the dashboard grid

#### Trigger
The user decides the current widget arrangement does not suit their workflow and begins dragging a widget.

#### Main Success Scenario
1. User views the dashboard with widgets laid out in their current grid positions.
2. User picks up a widget by pressing and holding it (mouse or touch).
3. System highlights the widget as active and shows a drag preview following the pointer.
4. User drags the widget over an empty target area on the grid.
5. System highlights the target drop zone to indicate a valid placement.
6. User releases the widget over the target zone.
7. System moves the widget to the new grid position, closing any gap left behind.
8. System persists the updated layout automatically.

#### Extensions
2a. User begins dragging but cancels (presses Escape or drags outside the grid):
  2a1. System returns the widget to its original position without any changes.

4a. User drags the widget over an occupied or invalid zone:
  4a1. System shows a "no-drop" indicator on the invalid zone.
  4a2. User continues dragging to a valid zone (returns to step 4), or cancels (2a1).

6a. User drops the widget in the same position it started:
  6a1. System leaves the layout unchanged; no persistence write is triggered.

#### Postconditions
- The widget occupies the new grid cell(s).
- The remaining widgets have reflowed to fill any gaps (if sortable mode is active).
- The updated layout is saved to `localStorage`.

---

### UC2: View Available Widgets

**Primary Actor**: User
**Goal**: Discover which widget types are available and understand what each one displays.

#### Stakeholders & Interests
- **User**: Wants to know what widgets exist so they can decide which ones to add to their dashboard
- **System**: Must expose the widget registry in a browsable format

#### Preconditions
- The user has navigated to `/dashboard`
- The widget registry contains at least one widget type

#### Trigger
User opens the widget picker/panel to see what widgets can be added.

#### Main Success Scenario
1. User opens the widget picker (e.g., clicks an "Add Widget" button).
2. System displays a list of available widget types from the registry, each with a name and brief description.
3. User scans the list and selects a widget type to add.
4. System instantiates the widget with its default configuration and places it in the next available grid position.
5. System persists the updated layout.

#### Extensions
3a. No empty grid position is available:
  3a1. System notifies the user that the grid is full.
  3a2. Use case ends; user must remove or resize an existing widget first.

3b. User closes the picker without selecting a widget:
  3b1. Dashboard remains unchanged.

#### Postconditions
- The selected widget appears on the dashboard at a default position.
- The widget registry reflects the widget as active on the current layout.
- The layout is persisted.

---

### UC3: Restore Layout on Return Visit

**Primary Actor**: User
**Goal**: Return to the dashboard and see the same widget arrangement they configured in a previous session.

#### Stakeholders & Interests
- **User**: Wants their configuration to survive page reloads and browser restarts
- **System**: Must reliably store and retrieve layout state from `localStorage`

#### Preconditions
- The user has previously arranged and saved a layout (UC1 postconditions are met)
- `localStorage` key `dashboard-layout` contains a valid serialised layout

#### Trigger
User navigates to `/dashboard` in a new browser tab or after a page reload.

#### Main Success Scenario
1. System reads the saved layout from `localStorage` on dashboard mount.
2. System validates that all widget IDs in the saved layout correspond to registered widget types.
3. System renders each widget at its saved grid position and size.
4. User sees the dashboard exactly as they left it.

#### Extensions
1a. `localStorage` is empty or key is missing:
  1a1. System renders the dashboard with the default widget layout defined in the registry.

2a. One or more saved widget IDs are no longer in the registry (widget type was removed):
  2a1. System discards the unrecognised widgets from the layout.
  2a2. System renders remaining widgets at their saved positions.
  2a3. System saves the pruned layout back to `localStorage`.

1b. `localStorage` data is malformed / cannot be parsed:
  1b1. System falls back to the default layout.
  1b2. System logs a warning to the console.

#### Postconditions
- The dashboard shows a valid, non-overlapping widget layout.
- If the saved layout was used, widgets match the user's last configuration.
- If fallback was used, the default layout is shown and persisted.

---

## Use Case Traceability Mapping

This section provides a centralised mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User views the dashboard with widgets in their current grid positions |
| UC1-S2 | User picks up a widget by pressing and holding it |
| UC1-S3 | System highlights the widget as active and shows a drag preview following the pointer |
| UC1-S4 | User drags the widget over an empty target area on the grid |
| UC1-S5 | System highlights the target drop zone to indicate a valid placement |
| UC1-S6 | User releases the widget over the target zone |
| UC1-S7 | System moves the widget to the new grid position, closing any gap left behind |
| UC1-S8 | System persists the updated layout automatically |
| UC1-E2a | User cancels drag (Escape or drags outside grid) — widget returns to original position |
| UC1-E4a | User drags over occupied/invalid zone — system shows no-drop indicator |
| UC1-E6a | User drops widget in its original position — layout unchanged, no persistence write |
| UC2-S1 | User opens the widget picker |
| UC2-S2 | System displays available widget types with names and descriptions |
| UC2-S3 | User selects a widget type to add |
| UC2-S4 | System instantiates the widget at the next available grid position |
| UC2-S5 | System persists the updated layout |
| UC2-E3a | No empty grid position available — system notifies user, use case ends |
| UC2-E3b | User closes picker without selecting — dashboard unchanged |
| UC3-S1 | System reads saved layout from `localStorage` on dashboard mount |
| UC3-S2 | System validates widget IDs against the registry |
| UC3-S3 | System renders each widget at its saved grid position and size |
| UC3-S4 | User sees the dashboard exactly as they left it |
| UC3-E1a | `localStorage` empty/missing — system renders default layout |
| UC3-E2a | Saved widget IDs not in registry — unrecognised widgets discarded, remainder rendered |
| UC3-E1b | `localStorage` data malformed — system falls back to default layout and logs warning |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
