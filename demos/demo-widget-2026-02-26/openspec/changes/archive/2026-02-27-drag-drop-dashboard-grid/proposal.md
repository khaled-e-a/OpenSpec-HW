## Why

Dashboard UIs today require users to work within fixed, pre-arranged layouts that cannot be personalized at runtime. By introducing a drag-and-drop dashboard grid, users gain full control over the arrangement and sizing of widgets, enabling a flexible workspace tailored to their workflow.

## What Changes

- Introduce a `DashboardGrid` React component that renders a configurable snap grid as the widget container.
- Add drag-and-drop support so widgets can be freely repositioned across the grid by the user.
- Introduce a `WidgetRegistry` service that application developers use to register named widget types; the grid instantiates widgets from this registry.
- Add resize handles on each widget so users can stretch or shrink widgets to span a different number of grid cells.

## Capabilities

### New Capabilities

- `grid-layout`: Grid rendering, cell geometry, and snap-to-grid placement logic for the dashboard container.
- `widget-drag-drop`: Pointer-driven drag interaction, live ghost preview, collision detection, and grid drop targeting.
- `widget-registry`: Widget type registration, lookup, and instantiation API for application developers.
- `widget-resize`: Resize handle rendering, drag-to-resize interaction, size constraint enforcement, and grid re-layout on resize.

### Modified Capabilities

*(none)*

## Impact

- **New code**: `DashboardGrid`, `GridCell`, `WidgetRegistry`, `DragLayer`, `ResizeHandle` React components and hooks.
- **Dependencies**: A pointer-events library (e.g., `react-dnd` or native HTML5 Drag and Drop API) for drag support; no additional runtime dependencies for grid math.
- **APIs**: Exposes a `WidgetRegistry` singleton and a `<DashboardGrid>` component API consumed by the host application.
- **Breaking changes**: None — this is entirely new functionality.

---

## Use Case Requirements

---

### UC-1: Snap Widget to Grid Cell
*Capability: `grid-layout`*

**Name**: Snap widget to grid cell

**Primary Actor**: Dashboard User

**Stakeholders & Interests**:
- Dashboard User: Widgets land precisely on grid boundaries without requiring pixel-perfect pointer accuracy; placement always looks clean and aligned.
- Application Developer: Snapped positions are expressed as integer grid coordinates `{ x, y, w, h }`, making layout state predictable and serialisable.
- UI Designer: No widget ever sits between cells; the grid remains visually coherent at all times.

**Preconditions**:
- The `DashboardGrid` is mounted with valid `columns` and `rowHeight` props.
- A widget is in motion (being dragged or resized) or is being programmatically placed for the first time.

**Trigger**: The pointer position or computed widget position changes during a drag, resize, or initial placement operation.

**Main Scenario**:
1. System receives the current pixel position `{ px, py }` of the widget's top-left corner (or resize anchor).
2. System divides `px` by the column pixel width and rounds to the nearest integer to compute grid column `x`.
3. System divides `py` by `rowHeight` and rounds to the nearest integer to compute grid row `y`.
4. System clamps `x` to `[0, columns − w]` and `y` to `[0, maxRows − h]` to keep the widget within grid bounds.
5. System updates the live ghost or preview element to reflect the snapped `{ x, y }` position.
6. System commits the snapped position to layout state when the interaction ends.

**Extensions**:
- 4a. Widget width `w` would exceed the right grid boundary at the computed `x`: System clamps `x` so the widget fits entirely within the grid.
- 4b. Widget height `h` would exceed the bottom grid boundary at the computed `y`: System clamps `y` so the widget fits entirely within the grid.
- 6a. Interaction is cancelled (Escape key or pointer leaves the window): System discards the snapped position and restores the original coordinates.

**Postconditions**:
- Widget position is expressed in whole grid units. No widget extends beyond the grid boundary. Layout state contains only integer coordinates.

---

### UC-2: Drag Widget to a New Position
*Capability: `widget-drag-drop`*

**Name**: Drag widget to a new position

**Primary Actor**: Dashboard User

**Stakeholders & Interests**:
- Dashboard User: Repositioning a widget is intuitive and provides real-time visual feedback; the widget lands exactly where the ghost preview indicated.
- Application Developer: The updated layout is delivered via `onLayoutChange` with new integer grid coordinates for all affected widgets.
- Other Dashboard Users (shared dashboards): No widget overlap is ever committed to the layout.

**Preconditions**:
- The `DashboardGrid` is rendered with at least one widget.
- The user's pointer device is functional.

**Trigger**: The user initiates a press-and-hold gesture on a widget's drag handle.

**Main Scenario**:
1. User presses and holds the drag handle of a widget.
2. System enters drag mode: the source widget becomes semi-transparent and a ghost preview appears at the widget's current snapped position.
3. User moves the pointer across the grid.
4. System maps the pointer position to the nearest valid grid cell via the snap logic (UC-1) and updates the ghost preview continuously.
5. System highlights the target cell range green when it is unoccupied and red when it overlaps another widget.
6. User releases the pointer over a valid (unoccupied) target cell.
7. System moves the widget to the new snapped grid position and updates the layout state.
8. System invokes `onLayoutChange` with the full updated layout array.
9. System exits drag mode and restores all widgets to normal appearance.

**Extensions**:
- 4a. Pointer moves outside the grid boundary: System holds the ghost at the last valid snapped position inside the grid.
- 5a. Target cell range overlaps an existing widget throughout the drag: System keeps the zone highlighted red.
- 6a. User releases the pointer over an invalid (occupied) zone: System cancels the move and returns the widget to its original position.
- 6b. User presses Escape during drag: System cancels the move and returns the widget to its original position.

**Postconditions**:
- Widget occupies the new grid position. No two widgets overlap. `onLayoutChange` has been called with the updated layout. The dashboard is fully interactive.

---

### UC-3: Add Widget to Dashboard
*Capability: `widget-registry`*

**Name**: Add widget to dashboard

**Primary Actor**: Dashboard User

**Stakeholders & Interests**:
- Dashboard User: Can place any registered widget type onto the dashboard quickly; the new widget appears at a sensible default position without overlapping existing ones.
- Application Developer: Only widget types that have been explicitly registered are available for placement; the registry is the single source of truth.
- System Integrity: An unregistered or invalid widget type identifier is rejected before any layout mutation occurs.

**Preconditions**:
- The `WidgetRegistry` contains at least one registered widget type.
- The dashboard has at least one unoccupied cell range large enough for the widget's `defaultSize`.

**Trigger**: The user selects a widget type from the widget palette and confirms placement.

**Main Scenario**:
1. User opens the widget palette and selects a widget type by name.
2. System looks up the widget type in `WidgetRegistry` by name.
3. System retrieves the widget's `defaultSize { w, h }` from the registry entry.
4. System finds the first unoccupied cell range on the grid that fits `{ w, h }` (scanning left-to-right, top-to-bottom).
5. System creates a new layout entry with a unique instance ID, the type name, and the computed `{ x, y, w, h }`.
6. System renders the new widget in the grid at the computed position.
7. System invokes `onLayoutChange` with the updated layout array including the new widget.

**Extensions**:
- 2a. The selected widget type name is not found in the registry: System displays an error notification and makes no layout change.
- 4a. No unoccupied range of sufficient size exists on the grid: System displays a notification that the dashboard is full and makes no layout change.

**Postconditions**:
- The new widget instance is visible on the dashboard at a non-overlapping position. `onLayoutChange` has been called. The widget is immediately draggable and resizable.

---

### UC-4: Remove Widget from Dashboard
*Capability: `widget-registry`*

**Name**: Remove widget from dashboard

**Primary Actor**: Dashboard User

**Stakeholders & Interests**:
- Dashboard User: Can remove a widget they no longer need; the removal is confirmed before it takes effect to prevent accidental data loss.
- Application Developer: The removal is reflected in the layout state via `onLayoutChange`; the widget type remains registered and can be re-added later.

**Preconditions**:
- The `DashboardGrid` contains at least one widget instance.

**Trigger**: The user activates the remove control (e.g., close button) on a widget.

**Main Scenario**:
1. User activates the remove control on a widget.
2. System displays a confirmation prompt identifying the widget by its display name.
3. User confirms the removal.
4. System removes the widget's layout entry from the layout state.
5. System unmounts the widget's React component and releases its grid cells.
6. System invokes `onLayoutChange` with the updated layout array (widget omitted).

**Extensions**:
- 3a. User cancels the confirmation prompt: System makes no change and closes the prompt.
- 4a. The widget to be removed is no longer present in the layout (e.g., concurrent update): System silently no-ops and invokes `onLayoutChange` with the current layout unchanged.

**Postconditions**:
- The widget is no longer visible on the dashboard. Its grid cells are free. `onLayoutChange` has been called. The widget type remains in the registry and can be re-added.

---

### UC-5: Resize Widget
*Capability: `widget-resize`*

**Name**: Resize widget

**Primary Actor**: Dashboard User

**Stakeholders & Interests**:
- Dashboard User: Resizing is smooth, snaps cleanly to grid cell boundaries, and respects per-widget minimum and maximum size constraints; the final size matches the live preview.
- Application Developer: Size changes are delivered via `onLayoutChange` with the widget's updated `w` and `h` as integer grid units.

**Preconditions**:
- The `DashboardGrid` contains at least one widget with resize handles enabled (the default).
- The widget's `minW`/`minH` and `maxW`/`maxH` constraints are set (defaults: min 1×1, max unbounded by grid boundary).

**Trigger**: The user initiates a press-and-hold gesture on a widget's resize handle (bottom-right corner).

**Main Scenario**:
1. User presses and holds the resize handle of a widget.
2. System enters resize mode: the widget displays a live resize preview border at its current size.
3. User drags the handle toward the desired new size.
4. System maps the pointer offset to the nearest grid cell boundary via snap logic (UC-1), computing a candidate `{ w, h }`.
5. System enforces `minW`/`minH` and `maxW`/`maxH` constraints on the candidate size, clamping if necessary.
6. System updates the resize preview border in real time to reflect the clamped candidate size.
7. User releases the pointer.
8. System applies the confirmed `{ w, h }` to the widget's layout entry.
9. System re-flows any widgets displaced by the size change to eliminate overlaps.
10. System invokes `onLayoutChange` with the full updated layout array.
11. System exits resize mode.

**Extensions**:
- 4a. Pointer moves outside the grid boundary: System clamps the candidate size to the maximum grid-bounded dimensions.
- 5a. Candidate size is below the widget's `minW` or `minH`: System holds the preview at the minimum size.
- 5b. Candidate size exceeds `maxW` or `maxH`: System holds the preview at the maximum size.
- 8a. User presses Escape during resize: System cancels the resize and restores the original `{ w, h }`.
- 9a. Re-flowing displaced widgets would push one outside the grid boundary: System refuses the resize, reverts to the original size, and notifies the user.

**Postconditions**:
- The widget occupies its new cell span in whole grid units. No widgets overlap. `onLayoutChange` has been called. The dashboard is fully interactive.

---

Created by Khaled@Huawei
