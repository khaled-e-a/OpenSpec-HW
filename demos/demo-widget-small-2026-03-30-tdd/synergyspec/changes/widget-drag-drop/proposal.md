## Why

Dashboard users need to organize widgets in a way that reflects their workflow priorities, but today widgets are static and cannot be repositioned. Adding drag-and-drop with snap-to-grid empowers users to arrange their dashboards freely and intuitively.

## What Changes

- Introduce a drag-and-drop dashboard grid component where widgets can be freely repositioned
- Widgets snap to a configurable grid when dropped, preventing arbitrary off-grid placement
- Widgets support variable sizes (e.g., 1×1, 2×1, 2×2 cells) and occupy grid cells accordingly
- Layout state is persisted so users retain their arrangement across page reloads

## Capabilities

### New Capabilities
- `widget-drag-drop`: Covers the interactive drag-and-drop behaviour — initiating a drag, showing a live preview, snapping to grid, detecting valid/invalid drop positions, and persisting the final layout.

### Modified Capabilities
<!-- No existing specs require requirement-level changes -->

## Impact

- **New React component**: `DashboardGrid` + `DraggableWidget` wrappers
- **State management**: Layout state (widget positions + sizes) stored in component state and persisted to `localStorage`
- **Dependencies**: A drag-and-drop library (e.g., `@dnd-kit/core`) will be added
- **CSS/layout**: Grid sizing and snap logic require coordinated CSS grid or absolute positioning
- **No API changes**: All layout storage is client-side only in this iteration

---

*Created by Khaled@Huawei*
