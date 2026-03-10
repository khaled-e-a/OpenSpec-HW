## Why

Dashboard applications require flexible, user-configurable layouts, but static grids force users into fixed arrangements that don't fit diverse workflows. Adding drag-and-drop with snap-to-grid positioning enables users to organise widgets however they need — improving usability and making the dashboard genuinely customisable.

## What Changes

- Introduce a `DashboardGrid` container component that renders a snap-to-grid canvas
- Introduce a `DraggableWidget` wrapper component that makes any widget draggable and resizable
- Widgets have variable sizes (e.g., 1×1, 2×1, 2×2 grid units) and snap to defined grid columns/rows
- Drag preview shadow shows the target drop position while dragging
- Collision detection prevents widgets from overlapping
- Layout state is serialisable so it can be persisted/restored

## Capabilities

### New Capabilities

- `widget-drag-drop`: Drag-and-drop interaction for widgets — initiating drags, showing previews, validating drop positions, and committing layout changes

### Modified Capabilities

_(none — this is a new capability with no existing spec)_

## Impact

- **New dependencies**: A React drag-and-drop library (e.g., `@dnd-kit/core` + `@dnd-kit/sortable`) and a grid layout utility
- **New components**: `DashboardGrid`, `DraggableWidget`
- **State**: Grid layout (widget positions and sizes) managed in component state or a parent store
- **No breaking changes** to existing widget components — they are wrapped, not modified

---

Created by Khaled@Huawei
