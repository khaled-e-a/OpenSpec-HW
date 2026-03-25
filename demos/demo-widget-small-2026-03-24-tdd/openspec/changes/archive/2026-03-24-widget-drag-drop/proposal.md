## Why

Static dashboard layouts force users into a fixed arrangement that rarely matches their individual workflow needs. A drag-and-drop grid dashboard empowers users to organise widgets freely, with grid snapping ensuring layouts remain clean and structured.

## What Changes

- Introduce a new `DashboardGrid` React component that renders a snappable grid canvas
- Introduce a `DraggableWidget` React component supporting variable sizes (e.g. 1×1, 2×1, 2×2, 3×2)
- Widgets can be picked up, dragged across the grid, and dropped to a new snapped position
- Collision detection prevents widgets from overlapping one another
- Layout state is maintained in component state (or optionally lifted to a parent)
- No backend or API changes required

## Capabilities

### New Capabilities
- `widget-drag-drop`: Drag-and-drop grid dashboard — a React grid canvas where variable-sized widgets can be dragged, snapped, and repositioned without overlap

### Modified Capabilities
<!-- none -->

## Impact

- **New components**: `DashboardGrid`, `DraggableWidget`
- **New dependency**: `@dnd-kit/core` + `@dnd-kit/utilities` (lightweight, accessible drag-and-drop for React)
- **Grid geometry utility**: helper functions for snapping coordinates to grid cells and detecting collisions
- No changes to existing components, routes, or APIs
- No breaking changes

---
Created by Khaled@Huawei
