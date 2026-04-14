## Why

Modern dashboards require flexible, interactive layouts where users can arrange information panels to suit their workflow. This change introduces a drag-and-drop dashboard grid system in React, enabling users to freely reposition and resize widgets that snap to a structured grid — reducing clutter and improving spatial clarity in data-dense UIs.

## What Changes

- Introduce a `grid-layout` capability: a CSS-grid-backed container that manages cell occupancy, snap zones, and collision detection
- Introduce a `widget-drag-drop` capability: pointer-event-driven drag interactions that move widgets to new grid positions with snap feedback
- Introduce a `widget-registery` capability: a central registry mapping widget type keys to React components, enabling dynamic widget rendering
- Introduce a `widget-resize` capability: handle-based resizing of widgets across multiple grid cells, with min/max constraints

## Capabilities

### New Capabilities

- `grid-layout`: Grid container that defines columns, rows, cell size, and manages widget slot occupancy and collision avoidance
- `widget-drag-drop`: Drag-and-drop interaction layer allowing widgets to be repositioned on the grid with snap-to-cell behaviour
- `widget-registery`: Registry system that maps widget type identifiers to React component implementations for dynamic rendering
- `widget-resize`: Resize handle system allowing users to expand or shrink widgets across grid cells within defined constraints

### Modified Capabilities

_(none — all capabilities are new)_

## Impact

- **New React components**: `DashboardGrid`, `Widget`, `GhostWidget`, `GridLines`, resize handle overlays
- **New hooks**: `useDashboard` (layout state), `useDrag`, `useResize`
- **New context/registry module**: `WidgetRegistry` singleton or context provider
- **Dependencies**: No mandatory third-party drag libraries — native pointer events. Optionally `react-dnd` if the design phase determines native events are insufficient.
- **CSS**: Grid lines, snap ghost, resize handles require custom styles or CSS modules

---

## Use Case Requirements

### UC-1: Lay out widgets on the dashboard grid

**Name**: Lay out widgets on the dashboard grid

**Primary Actor**: Dashboard User

**Stakeholders & Interests**:
- Dashboard User: wants widgets placed predictably without overlap so the layout is readable
- Application Developer: needs a stable layout state that can be serialised and restored
- Designer: expects visual alignment to a visible grid for a clean appearance

**Preconditions**:
- The dashboard grid is rendered with a defined column count and row height
- At least one widget is registered in the widget registry
- The grid has sufficient unoccupied cells for the widget being placed

**Trigger**: The user opens the dashboard or a pre-configured layout is loaded from state

**Main Scenario** (Happy Path):
1. User opens the dashboard view
2. System renders the grid container with column and row guides visible
3. System reads the layout configuration (array of widget descriptors with position and size)
4. System resolves each widget's grid column/row from its descriptor
5. System verifies no two widgets overlap the same cells
6. System renders each widget in its assigned grid slot
7. User sees all widgets correctly positioned within the grid

**Extensions**:
- 3a. Layout configuration is absent or empty: System renders an empty grid with a placeholder prompt to add widgets
- 5a. Two widgets in the configuration overlap: System detects the conflict and shifts the later widget down to the next available row before rendering
- 4a. A widget references an unregistered type key: System renders a fallback error tile in that slot and logs a warning

**Postconditions**: All widgets are rendered in non-overlapping grid slots. Layout state reflects final positions. Grid guides are visible.

---

### UC-2: Drag a widget to a new grid position

**Name**: Drag a widget to a new grid position

**Primary Actor**: Dashboard User

**Stakeholders & Interests**:
- Dashboard User: wants to move a widget and have it land precisely where intended
- Application: layout state must stay consistent — no widget left in an invalid position

**Preconditions**:
- The dashboard is fully rendered with at least one widget
- The user's pointer device is available
- The target area has enough unoccupied cells to accommodate the widget's size

**Trigger**: User presses and holds (pointerdown) on a widget's drag handle or header area

**Main Scenario** (Happy Path):
1. User initiates a drag gesture on a widget's handle
2. System captures the pointer and records the drag offset from the widget's origin
3. System renders a ghost (semi-transparent preview) at the widget's original position
4. User moves the pointer across the grid
5. System continuously calculates the nearest grid cell beneath the ghost's top-left corner
6. System updates the ghost's snapped position to the nearest valid cell, highlighting it
7. User releases the pointer at the desired cell
8. System verifies the target cells are unoccupied (or occupied only by the dragged widget)
9. System updates the layout state with the widget's new grid position
10. System removes the ghost and renders the widget at its new position

**Extensions**:
- 8a. Target cells are occupied by another widget: System keeps the ghost at the last valid position and does not move the widget; ghost shakes to signal invalid drop
- 4a. User drags the pointer outside the grid boundary: System clamps the ghost to the nearest valid edge cell
- 7a. User presses Escape before releasing: System cancels the drag, returns the widget to its original position, and removes the ghost

**Postconditions**: Widget occupies the new grid position. Layout state is updated. No cells are doubly occupied. Ghost is removed.

---

### UC-3: Register a widget type

**Name**: Register a widget type

**Primary Actor**: Application Developer

**Stakeholders & Interests**:
- Application Developer: needs to add new widget types without modifying core dashboard code
- Dashboard User: expects registered widgets to render correctly with no broken tiles

**Preconditions**:
- The widget registry module is initialised before the dashboard renders
- The developer has a valid React component to register

**Trigger**: Developer calls `WidgetRegistry.register(typeKey, Component)` during application bootstrap

**Main Scenario** (Happy Path):
1. Developer provides a unique string type key and a React component
2. System validates the type key is a non-empty string
3. System validates the component is a valid React component (function or class)
4. System stores the mapping of type key → component in the registry
5. System confirms registration (no-op return or logged confirmation)
6. Dashboard later encounters a widget descriptor with this type key and renders the registered component

**Extensions**:
- 2a. Type key is empty or not a string: System throws a descriptive error and does not register
- 3a. Component is not a valid React component: System throws a descriptive error and does not register
- 4a. Type key is already registered: System overwrites the previous registration and emits a console warning

**Postconditions**: The type key is mapped to the component in the registry. Subsequent dashboard renders with that type key use this component.

---

### UC-4: Render a widget from the registry

**Name**: Render a widget from the registry

**Primary Actor**: Dashboard System (automated)

**Stakeholders & Interests**:
- Dashboard User: sees meaningful widget content, not broken tiles
- Application Developer: registered components receive the correct props

**Preconditions**:
- The widget registry contains at least one registered type
- A layout configuration references one or more type keys

**Trigger**: Dashboard renders and resolves a widget descriptor's `type` field against the registry

**Main Scenario** (Happy Path):
1. System reads the widget descriptor's `type` field
2. System looks up the type key in the registry
3. System retrieves the registered React component
4. System instantiates the component, passing `widgetId`, `config`, and grid-position props
5. System renders the component inside the widget shell (border, drag handle, resize handle)

**Extensions**:
- 2a. Type key is not found in the registry: System renders a fallback error tile with the unrecognised type key displayed
- 4a. Component throws during render: React error boundary catches the error and renders an error tile for that widget only

**Postconditions**: Widget content from the registered component is visible inside the widget shell.

---

### UC-5: Resize a widget across grid cells

**Name**: Resize a widget across grid cells

**Primary Actor**: Dashboard User

**Stakeholders & Interests**:
- Dashboard User: wants to expand or shrink a widget to show more or less content
- Application: layout state must reflect new dimensions; no widget overlap introduced

**Preconditions**:
- The dashboard is fully rendered with at least one resizable widget
- The widget has resize handles visible (corner or edge)
- Sufficient unoccupied cells exist in the intended resize direction

**Trigger**: User presses and holds (pointerdown) on a widget's resize handle

**Main Scenario** (Happy Path):
1. User initiates a drag on the resize handle (e.g., bottom-right corner)
2. System captures the pointer and records the widget's current column-span and row-span
3. System renders a resize ghost overlay showing the current dimensions
4. User drags the handle to expand or shrink the widget
5. System continuously calculates the new column-span and row-span from the pointer position, snapping to whole grid cells
6. System enforces minimum size (1×1 cell) and maximum size (grid boundary) constraints
7. System updates the ghost overlay to reflect the snapped new dimensions
8. User releases the pointer at the desired size
9. System verifies the new cells are unoccupied
10. System updates the layout state with the new span values
11. System removes the ghost and renders the widget at its new size

**Extensions**:
- 9a. New cells are occupied by another widget: System reverts to the last valid size and does not apply the resize; ghost shakes to signal conflict
- 5a. Pointer moves beyond grid boundary: System clamps new span to the grid edge
- 8a. User presses Escape before releasing: System cancels the resize and restores the original dimensions

**Postconditions**: Widget occupies the new column-span and row-span. Layout state updated. No cell overlap. Ghost removed.

---

Created by Khaled@Huawei
