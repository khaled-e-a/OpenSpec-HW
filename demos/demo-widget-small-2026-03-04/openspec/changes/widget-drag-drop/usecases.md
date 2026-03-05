# Use Cases: widget-drag-drop

Generated: 2026-03-04

## Overview

This document captures the use cases for the widget-drag-drop change, following Cockburn's use case methodology.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| Dashboard User | Rearrange widgets to create personalized dashboard layout |
| Dashboard User | Resize widgets to better display content |
| Dashboard User | Save customized layout for future sessions |

## Use Cases

### Use Case: Rearrange Dashboard Widgets
**Primary Actor**: Dashboard User
**Goal**: Move widgets to preferred positions on the dashboard

#### Stakeholders & Interests
- Dashboard User: Wants to organize widgets in a way that matches their workflow
- System: Needs to maintain valid widget positions and prevent overlaps

#### Preconditions
- User is logged in and viewing their dashboard
- Dashboard contains at least one widget

#### Trigger
User clicks and holds on a widget to begin dragging

#### Main Success Scenario
1. User clicks and holds on a widget
2. System displays drag preview and highlights valid drop zones
3. User drags widget to desired position
4. System snaps widget to nearest grid position
5. System updates dashboard layout without overlaps
6. System saves new widget position

#### Extensions
2a. Widget cannot be dragged (locked by administrator)
  2a1. System shows lock indicator and prevents dragging
4a. Drop position overlaps with another widget
  4a1. System shifts existing widgets to accommodate
  4a2. If no valid position exists, System returns widget to original position
5a. Network connection lost during drag
  5a1. System caches position locally
  5a2. System syncs position when connection restored

#### Postconditions
- Widget is positioned at new location
- Dashboard layout is valid (no overlaps)
- Widget position is saved for future sessions

---

### Use Case: Resize Dashboard Widget
**Primary Actor**: Dashboard User
**Goal**: Change widget size to better display its content

#### Stakeholders & Interests
- Dashboard User: Wants optimal display of widget content
- System: Needs to maintain grid alignment and prevent layout issues

#### Preconditions
- User is viewing their dashboard
- Widget supports resizing

#### Trigger
User selects resize handle on widget

#### Main Success Scenario
1. User hovers over widget resize handle
2. System displays resize cursor and available size options
3. User selects new size (small, medium, large)
4. System resizes widget to selected dimensions
5. System adjusts surrounding widgets to maintain grid
6. System saves new widget size

#### Extensions
3a. Selected size would cause overlap
  3a1. System highlights conflict
  3a2. User chooses different size or cancels
4a. Widget content doesn't fit new size
  4a1. System applies scrollbars or content scaling

#### Postconditions
- Widget is displayed at new size
- Dashboard layout remains valid
- Widget size is persisted

---

### Use Case: Save Custom Dashboard Layout
**Primary Actor**: Dashboard User
**Goal**: Preserve customized widget arrangement for future sessions

#### Stakeholders & Interests
- Dashboard User: Wants layout preferences remembered
- System: Needs to store and retrieve layout data efficiently

#### Preconditions
- User has modified widget positions or sizes
- User has permission to customize dashboard

#### Trigger
User clicks "Save Layout" button or system auto-saves

#### Main Success Scenario
1. System detects layout changes
2. System collects current widget positions and sizes
3. System validates layout configuration
4. System sends layout data to backend
5. System confirms layout saved successfully

#### Extensions
4a. Network connection unavailable
  4a1. System stores layout locally
  4a2. System syncs when connection available
4b. Invalid layout configuration
  4b1. System reverts to last valid layout
  4b2. System notifies user of issue

#### Postconditions
- Current layout is saved to user profile
- Layout will be restored on next login

---

## Notes
- Each use case should focus on a single, coherent goal
- Keep UI details out of the steps - focus on intent
- Extensions should cover significant alternatives and failures
- Use cases should be testable - each scenario is a potential test case