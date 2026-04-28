# Use Cases: react-drag-drop-dashboard

Generated: 2026-04-28

## Overview

This document captures the use cases for the react-drag-drop-dashboard change, following Cockburn's use case methodology. The dashboard lets users arrange widgets freely on a grid by dragging and dropping them, add or remove widgets from a registry, and have their layout survive a page refresh.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | Rearrange widgets on the dashboard by dragging and dropping |
| User | Add a new widget from the available widget registry |
| User | Remove a widget from the dashboard |
| User | See a live drag preview while moving a widget |
| User | Have the dashboard restore to the last saved layout on reload |

---

## Use Cases

### UC1 — Drag and Reposition a Widget

**Primary Actor**: User
**Goal**: Move a widget to a different position on the dashboard grid

#### Stakeholders & Interests
- User: Wants to rearrange the dashboard to fit their workflow without restriction
- System: Must keep all widgets visible and non-overlapping; must track position state accurately

#### Preconditions
- The dashboard is loaded and at least one widget is displayed
- The user has a pointer device (mouse or touch)

#### Trigger
User presses down on a widget's drag handle and begins moving the pointer

#### Main Success Scenario
1. User grabs a widget's drag handle
2. System lifts the widget visually and displays a drag preview at the widget's original size and shape
3. User moves the pointer across the dashboard
4. System highlights the valid drop zone under the pointer in real time
5. User releases the pointer over a target grid cell
6. System places the widget at the new position, shifting other widgets as needed to avoid overlap
7. System persists the updated layout to localStorage

#### Extensions
4a. User moves the pointer outside any valid drop zone
  4a1. System shows no highlight; the drop is treated as invalid
  4a2. Use case resumes at step 3

5a. User releases the pointer outside a valid drop zone
  5a1. System animates the widget back to its original position
  5a2. Use case ends without a layout change

6a. Target cell is already occupied and the grid is full
  6a1. System refuses the drop and returns the widget to its original position
  6a2. System shows a brief error indicator (e.g., shake animation)

#### Postconditions
- Widget occupies the new grid position
- No two widgets overlap
- Layout is persisted to localStorage

---

### UC2 — Add a Widget from the Registry

**Primary Actor**: User
**Goal**: Place a new widget type onto the dashboard

#### Stakeholders & Interests
- User: Wants to extend the dashboard with new information panels
- System: Must maintain a catalogue of available widget types and instantiate them with defaults

#### Preconditions
- The dashboard is loaded
- At least one widget type exists in the widget registry that is not yet on the dashboard (or multi-instance is allowed)

#### Trigger
User opens the "Add Widget" panel or clicks an "Add Widget" button

#### Main Success Scenario
1. User opens the Add Widget panel
2. System displays the list of available widget types from the registry with names and preview thumbnails
3. User selects a widget type
4. System places an instance of the chosen widget in the first available grid cell
5. System updates the layout state and persists it to localStorage
6. The new widget appears on the dashboard ready for use

#### Extensions
3a. User cancels the panel without selecting a widget
  3a1. System closes the panel
  3a2. No change is made to the dashboard

4a. No free grid cell is available
  4a1. System notifies the user that the grid is full
  4a2. System does not add the widget
  4a3. Use case ends

#### Postconditions
- A new widget instance is visible on the dashboard
- Layout reflects the addition and is persisted to localStorage

---

### UC3 — Remove a Widget from the Dashboard

**Primary Actor**: User
**Goal**: Dismiss a widget from the dashboard to declutter the layout

#### Stakeholders & Interests
- User: Wants a clean dashboard showing only relevant widgets
- System: Must release the occupied grid cells and compact/reflow remaining widgets if applicable

#### Preconditions
- The dashboard is loaded
- At least one widget is present on the dashboard

#### Trigger
User activates the remove/close control on a widget (e.g., "×" button)

#### Main Success Scenario
1. User clicks the remove control on a widget
2. System asks for confirmation (e.g., "Remove this widget?")
3. User confirms the removal
4. System removes the widget from the dashboard
5. System frees the grid cells previously occupied by the widget
6. System persists the updated layout to localStorage

#### Extensions
3a. User cancels the confirmation
  3a1. System closes the confirmation prompt
  3a2. Widget remains on the dashboard unchanged

#### Postconditions
- The widget is no longer visible on the dashboard
- Its grid cells are available for other widgets
- Layout is persisted to localStorage

---

### UC4 — Restore Layout After Page Reload

**Primary Actor**: User
**Goal**: Return to the dashboard and see it exactly as it was last arranged

#### Stakeholders & Interests
- User: Does not want to re-configure the layout on every visit
- System: Must reliably serialise and deserialise layout state without data loss

#### Preconditions
- The user has previously arranged the dashboard (at least one layout change was saved to localStorage)

#### Trigger
User loads or reloads the dashboard page

#### Main Success Scenario
1. Browser loads the React dashboard application
2. System reads the stored layout from localStorage
3. System parses the layout and reconstructs widget positions and types
4. System renders the dashboard with each widget in its persisted position
5. User sees the dashboard exactly as they last left it

#### Extensions
2a. No layout data found in localStorage (first visit or storage cleared)
  2a1. System renders a default layout with a set of pre-configured widgets
  2a2. Use case ends

2b. Layout data is found but is corrupt or incompatible (e.g., schema mismatch after an app update)
  2b1. System discards the corrupt data and falls back to the default layout
  2b2. System optionally notifies the user that the layout was reset

#### Postconditions
- Dashboard is rendered with all widgets in their saved positions
- User can continue interacting without re-arranging

---

### UC5 — View Live Drag Preview While Moving a Widget

**Primary Actor**: User
**Goal**: See a real-time visual cue of where a widget will land before releasing it

#### Stakeholders & Interests
- User: Needs feedback to place widgets precisely without guessing
- System: Must render a preview at the correct target cell without disrupting the live grid

#### Preconditions
- User has grabbed a widget's drag handle (UC1 is in progress, step 2)

#### Trigger
User begins moving the pointer after initiating a drag (UC1-S2)

#### Main Success Scenario
1. User moves the pointer while dragging a widget
2. System renders a ghost/placeholder at the hovered target cell showing where the widget will land
3. System updates the placeholder position in real time as the pointer moves between cells
4. User sees the intended drop position clearly distinguished (e.g., dashed border, shaded cell)
5. User releases the pointer; system removes the preview and completes the drop (proceeds to UC1-S6)

#### Extensions
3a. Pointer moves to an invalid position (outside grid or occupied cell with no reflow room)
  3a1. System removes the placeholder or renders it in an "invalid" state (e.g., red tint)
  3a2. If user releases here, UC1-E5a applies

#### Postconditions
- Preview is dismissed
- Widget is placed (or returned) per UC1

---

## Notes
- Use cases focus on user intent, not button names or implementation details
- UC1 and UC5 are closely coupled — UC5 is a sub-function of UC1
- UC4 is triggered automatically on every page load; no explicit user action beyond navigation
- Each use case is a direct test-case candidate

---

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User grabs a widget's drag handle |
| UC1-S2 | System lifts the widget visually and displays a drag preview |
| UC1-S3 | User moves the pointer across the dashboard |
| UC1-S4 | System highlights the valid drop zone under the pointer in real time |
| UC1-S5 | User releases the pointer over a target grid cell |
| UC1-S6 | System places the widget at the new position, shifting others to avoid overlap |
| UC1-S7 | System persists the updated layout to localStorage |
| UC1-E4a | User moves pointer outside any valid drop zone; system shows no highlight |
| UC1-E5a | User releases pointer outside valid drop zone; widget returns to original position |
| UC1-E6a | Target cell occupied and grid full; widget returned, error indicator shown |
| UC2-S1 | User opens the Add Widget panel |
| UC2-S2 | System displays available widget types with names and previews |
| UC2-S3 | User selects a widget type |
| UC2-S4 | System places widget instance in first available grid cell |
| UC2-S5 | System persists updated layout to localStorage |
| UC2-S6 | New widget appears on dashboard ready for use |
| UC2-E3a | User cancels panel; no change made |
| UC2-E4a | No free grid cell; system notifies user, widget not added |
| UC3-S1 | User clicks the remove control on a widget |
| UC3-S2 | System presents a confirmation prompt |
| UC3-S3 | User confirms the removal |
| UC3-S4 | System removes the widget from the dashboard |
| UC3-S5 | System frees the grid cells occupied by the widget |
| UC3-S6 | System persists updated layout to localStorage |
| UC3-E3a | User cancels confirmation; widget remains unchanged |
| UC4-S1 | Browser loads the React dashboard application |
| UC4-S2 | System reads stored layout from localStorage |
| UC4-S3 | System parses layout and reconstructs widget positions and types |
| UC4-S4 | System renders dashboard with each widget in its persisted position |
| UC4-S5 | User sees dashboard exactly as last left |
| UC4-E2a | No layout in localStorage; system renders default layout |
| UC4-E2b | Layout data corrupt/incompatible; system falls back to default, notifies user |
| UC5-S1 | User moves pointer while dragging a widget |
| UC5-S2 | System renders a ghost/placeholder at the hovered target cell |
| UC5-S3 | System updates placeholder position in real time as pointer moves |
| UC5-S4 | User sees intended drop position clearly distinguished |
| UC5-S5 | User releases pointer; preview is removed and drop completes |
| UC5-E3a | Pointer moves to invalid position; placeholder rendered in invalid state |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
