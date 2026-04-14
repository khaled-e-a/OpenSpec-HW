## Why

Users need an interactive dashboard where widgets of varying sizes can be freely repositioned with drag-and-drop, snapping to a grid for consistent alignment. This enables flexible, user-configurable layouts without requiring manual coordinate management.

## What Changes

- New React dashboard component that renders a configurable grid layout
- Draggable, resizable widget components that snap to grid cells on drop
- Grid collision detection to prevent widget overlap
- Visual drag preview and drop zone highlighting during drag operations
- Persistent layout state tracking widget positions and sizes

## Capabilities

### New Capabilities

- `widget-drag-drop`: Grid-snapping drag-and-drop system for repositioning and resizing widgets on a dashboard canvas

### Modified Capabilities

## Impact

- New React components: `Dashboard`, `DashboardGrid`, `DraggableWidget`
- New dependency: drag-and-drop library (e.g., `@dnd-kit/core`, `react-beautiful-dnd`, or `react-grid-layout`)
- No existing code modified — this is a net-new feature

Created by Khaled@Huawei
