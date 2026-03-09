## Why

Dashboard users need to arrange widgets to suit their workflow, but the current static layout provides no flexibility. A drag-and-drop grid enables users to organise and resize widgets freely while grid-snapping ensures a clean, structured layout.

## What Changes

- Introduce a React dashboard grid component that supports drag-and-drop widget placement
- Widgets snap to grid cells on drop, preventing arbitrary floating positions
- Widgets can have variable sizes (spanning multiple grid columns/rows)
- Users can drag widgets from one grid position to another
- Grid maintains consistent spacing and alignment across widget sizes

## Capabilities

### New Capabilities
- `widget-drag-drop`: Drag-and-drop interaction layer — initiating drags, computing valid drop targets, snapping to grid cells, and persisting widget positions

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **New dependencies**: A React drag-and-drop library (e.g., `react-dnd` or `@dnd-kit/core`) for pointer event handling and drag state
- **New components**: `DashboardGrid`, `GridWidget`, and associated drag-and-drop hooks
- **No backend changes**: Widget positions managed in frontend state (or passed via props/context)
- **No breaking changes** to existing components

---

Created by Khaled@Huawei
