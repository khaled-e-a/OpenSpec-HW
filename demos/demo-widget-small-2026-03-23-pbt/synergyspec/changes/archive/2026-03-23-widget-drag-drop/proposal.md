## Why

Modern dashboards require flexible, user-configurable layouts where widgets can be freely arranged to match individual workflows. A drag-and-drop grid system solves the rigid, fixed-layout problem by letting users reposition and resize widgets interactively, snapping them to a consistent grid for a clean, organized appearance.

## What Changes

- Introduce a new `DashboardGrid` React component that renders a responsive, configurable grid canvas
- Introduce a `Widget` component that wraps arbitrary content and supports drag-and-resize interactions
- Implement grid-snap logic so widgets always align to cell boundaries when dropped
- Support variable widget sizes (e.g., 1×1, 2×1, 2×2, 4×2 in grid units)
- Persist widget layout positions so the arrangement survives re-renders
- Provide a set of sample widgets (text, chart placeholder, metric card) to demonstrate the system

## Capabilities

### New Capabilities
- `widget-drag-drop`: Drag-and-drop dashboard grid allowing users to move and resize widgets that snap to a configurable grid layout

### Modified Capabilities
<!-- No existing capabilities are affected by requirement changes -->

## Impact

- **New React components**: `DashboardGrid`, `Widget`, `WidgetToolbar`
- **Dependencies**: Introduces `dnd-kit` (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`) for pointer/touch drag handling; `react-resizable` or custom resize handles for widget sizing
- **State management**: Grid layout state (positions + sizes) held in component state with optional serialisation to `localStorage`
- **Styling**: CSS Grid used for the layout canvas; no external UI framework required
- **No breaking changes** to existing code — this is a greenfield feature addition

---
Created by Khaled@Huawei
