## Why

Modern dashboards need to be flexible and personalized — users should be able to arrange widgets to match their workflow without relying on a developer to reconfigure layouts. This change introduces a drag-and-drop dashboard grid so users can freely reposition and resize widgets that snap to a structured grid, giving them full control over their workspace.

## What Changes

- Add a new `DashboardGrid` React component that renders a snapping grid layout
- Add draggable `Widget` components that can be moved to any grid cell
- Support variable-sized widgets (e.g., 1×1, 2×1, 2×2, 3×2 grid units)
- Implement snap-to-grid behaviour so widgets align precisely to grid cells on drop
- Persist layout state so widget positions are retained across sessions

## Capabilities

### New Capabilities

- `widget-drag-drop`: Drag-and-drop interaction layer for dashboard widgets — covers drag initiation, live drag preview, snap-to-grid positioning, drop validation, collision detection, and layout persistence.

### Modified Capabilities

<!-- No existing capabilities have requirement-level changes -->

## Impact

- **New React components**: `DashboardGrid`, `Widget`, drag overlay/preview components
- **Dependencies**: Requires a drag-and-drop library (e.g., `react-dnd` or `@dnd-kit/core`) and a grid layout utility
- **State management**: New layout state shape to track each widget's grid position and size
- **Persistence**: LocalStorage (or equivalent) integration to save/restore layouts
- **No backend changes**: Purely a frontend feature; no API or schema changes required

---

Created by Khaled@Huawei
