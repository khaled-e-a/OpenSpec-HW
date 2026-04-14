## Why

Dashboards are a common pattern in data-driven UIs, but most implementations are static grids that require code changes to reorganize. Users need to personalize their workspace by repositioning and resizing widgets freely — a drag-and-drop grid with snap-to-cell behavior achieves this without layout chaos.

## What Changes

- Introduce a `DashboardGrid` React component that renders a configurable column/row grid
- Introduce a `Widget` component that occupies one or more grid cells and declares its own size (width × height in grid units)
- Enable pointer-based drag-and-drop to reposition any widget; widget snaps to the nearest valid grid cell on drop
- Enable resize handles on widgets to change their column/row span interactively
- Provide a widget registry so different widget types (chart, table, metric card, etc.) can be rendered inside the grid
- Persist layout state (positions + sizes) so the dashboard survives page refresh

## Capabilities

### New Capabilities

- `grid-layout`: Snap-to-grid container component, layout state management, collision detection and reflow
- `widget-drag-drop`: Drag-and-drop interaction layer — pointer event handling, ghost/preview element, drop-target validation, snap animation
- `widget-resize`: Per-widget resize handles, multi-cell span adjustment, min/max size constraints
- `widget-registry`: Widget type catalog, default size declarations, rendering slot for widget content

### Modified Capabilities

_(none — no existing specs)_

## Impact

- **New dependencies**: `react` (peer), optionally `@dnd-kit/core` or similar for accessible drag-and-drop primitives
- **New files**: `src/components/DashboardGrid/`, `src/components/Widget/`, `src/hooks/useLayout.ts`, `src/store/layoutStore.ts`
- **No breaking changes** to existing code — this is a standalone new feature

---

## Use Case Requirements

### UC-01: Drag Widget to a New Position

**Name**: Drag Widget to New Position

**Actors**: Dashboard user

**Preconditions**:
- The dashboard is rendered with at least one widget placed on the grid
- The user's device supports pointer events (mouse or touch)

**Trigger**: The user presses and holds (mousedown / touchstart) on a widget's drag handle or body

**Main Scenario**:
1. User initiates drag on a widget
2. A semi-transparent ghost/preview of the widget follows the pointer
3. As the pointer moves, the nearest valid grid cell highlights to show the drop target
4. User releases the pointer over a valid grid cell
5. The widget animates to its new grid position
6. Layout state updates to reflect the new position

**Alternative Flows**:
- A2: User drags to a cell already occupied by another widget → occupied cells are highlighted as invalid; the widget cannot be dropped there
- A3: User drags to a position outside the grid boundary → drop is rejected; widget returns to its original position

**Exception / Error Flows**:
- E1: Drag is cancelled via Escape key → widget snaps back to its original position with no state change

**Postconditions**:
- The widget occupies the new grid cell(s)
- All other widgets remain in their previous positions (no automatic reflow)
- Layout state is persisted

---

### UC-02: Snap Widget to Grid Cell

**Name**: Snap Widget to Grid Cell on Drop

**Actors**: Dashboard user, grid layout engine

**Preconditions**:
- A drag operation is in progress (UC-01 triggered)

**Trigger**: The user releases the pointer (mouseup / touchend) while over the grid

**Main Scenario**:
1. The layout engine calculates the grid cell nearest to the pointer's drop coordinates
2. The engine checks that the target cell(s) are unoccupied and within bounds
3. The widget is placed flush to the top-left corner of the target cell
4. The ghost preview is removed; the widget renders at the snapped position

**Alternative Flows**:
- A1: Nearest cell is occupied → engine finds the closest available cell and proposes it as fallback; visual indicator shows the adjusted position

**Exception / Error Flows**:
- E1: Grid has no available cell → widget returns to its original position; a brief error indication is shown

**Postconditions**:
- Widget position is a multiple of the grid cell unit (no fractional placement)
- Layout is consistent — no overlapping widgets

---

### UC-03: Resize Widget

**Name**: Resize Widget by Dragging a Handle

**Actors**: Dashboard user

**Preconditions**:
- A widget is placed on the grid
- The widget is not currently being dragged

**Trigger**: The user clicks and drags a resize handle on the widget's edge or corner

**Main Scenario**:
1. User drags the resize handle outward or inward
2. A resize preview shows the new bounding box snapped to grid units
3. Adjacent grid cells highlight if they would be consumed or freed
4. User releases the handle
5. The widget is redrawn at the new span (width × height in grid units)
6. Layout state updates with the new size

**Alternative Flows**:
- A1: New size would overlap an existing widget → the resize is capped at the boundary of the nearest occupied cell

**Exception / Error Flows**:
- E1: Resize attempt would shrink widget below its declared minimum size → resize is blocked; handle springs back

**Postconditions**:
- Widget occupies the new cell span
- No other widget overlaps the resized widget
- Layout state is persisted

---

### UC-04: Add Widget to Dashboard

**Name**: Add a New Widget to the Grid

**Actors**: Dashboard user

**Preconditions**:
- The dashboard is rendered
- At least one registered widget type is available

**Trigger**: The user selects a widget type from a widget picker / add menu

**Main Scenario**:
1. User opens the widget picker and selects a widget type
2. The system places the widget at the first available grid position that fits the widget's default size
3. The new widget renders on the grid with a brief entrance animation

**Alternative Flows**:
- A1: No contiguous space fits the default size → the grid expands vertically to accommodate the new widget

**Exception / Error Flows**:
- E1: Unknown widget type ID → an error placeholder is shown in place of the widget body

**Postconditions**:
- The new widget appears on the grid
- Layout state is updated to include the new widget entry

---

### UC-05: Remove Widget from Dashboard

**Name**: Remove a Widget from the Grid

**Actors**: Dashboard user

**Preconditions**:
- At least one widget is placed on the grid

**Trigger**: The user activates the "Remove" control on a widget (e.g., × button in the widget header)

**Main Scenario**:
1. A confirmation prompt or brief undo toast appears
2. User confirms removal (or the timeout expires without undo)
3. The widget is removed from the grid; its cells become free
4. Layout state updates to remove the widget entry

**Alternative Flows**:
- A1: User clicks "Undo" before the timeout → the widget is restored at its previous position and size

**Exception / Error Flows**:
- E1: Layout state fails to persist after removal → the widget is visually removed but a warning is shown; the state is retried

**Postconditions**:
- The widget no longer appears on the grid
- Its former cells are available for other widgets

---

Created by Khaled@Huawei
