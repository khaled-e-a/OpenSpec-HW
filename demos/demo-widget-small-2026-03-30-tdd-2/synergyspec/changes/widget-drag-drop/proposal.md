## Why

Modern dashboards require flexible, user-customizable layouts — static grids force users into rigid arrangements that don't match their workflows. This change introduces a drag-and-drop dashboard grid that lets users freely reposition different-sized widgets and snap them to a consistent grid layout.

## What Changes

- Introduce a new `DashboardGrid` React component that renders a grid canvas
- Introduce `DraggableWidget` components that can be moved within the grid
- Widgets snap to grid cells on drop, supporting variable sizes (e.g., 1×1, 2×1, 2×2)
- Drag preview follows the pointer while dragging
- Grid enforces collision detection — widgets cannot overlap
- Layout state is serializable (storable / restorable)

## Capabilities

### New Capabilities
- `widget-drag-drop`: Drag-and-drop interaction for repositioning widgets on a dashboard grid, with snap-to-grid behavior, variable widget sizes, collision detection, and drag preview

### Modified Capabilities
<!-- None — this is a net-new capability with no existing specs to modify -->

## Impact

- **New React components**: `DashboardGrid`, `DraggableWidget`
- **Dependencies**: Requires a drag-and-drop library (e.g., `react-dnd` + `react-dnd-html5-backend`)
- **State management**: Grid layout state (widget positions + sizes) managed in component or lifted to parent
- **No breaking changes** — entirely new feature, no existing code modified

---

Created by Khaled@Huawei
