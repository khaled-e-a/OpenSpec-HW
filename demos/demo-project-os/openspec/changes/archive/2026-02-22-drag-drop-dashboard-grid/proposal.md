## Why

Building data-rich UIs requires flexible, user-configurable layouts — but React lacks a built-in way to let users arrange widgets on a grid. This change introduces a drag-and-drop dashboard grid so users can freely position and reorder different-sized widgets that snap into place on a defined grid.

## What Changes

- Add a `DashboardGrid` container component that renders a CSS grid and manages widget layout state
- Add a `Widget` component that wraps any content, supports configurable grid dimensions (column span × row span), and handles drag interactions
- Implement snap-to-grid logic: widgets snap to the nearest valid grid cell on drop, with collision detection to prevent overlap
- Provide a set of example widget sizes (1×1, 2×1, 1×2, 2×2) to demonstrate the system

## Capabilities

### New Capabilities

- `dashboard-grid`: The grid container — defines column/row dimensions, gap, and manages the layout state (which widget occupies which cell). Renders widgets at their assigned grid positions.
- `widget-drag-drop`: Drag-and-drop interaction layer — handles drag start/move/end events, computes the target cell from pointer position, enforces grid boundaries, and resolves collisions by blocking invalid drops.
- `widget-sizing`: Widget size model — each widget declares a `colSpan` and `rowSpan` (in grid units). The grid uses these to allocate cells and prevent overlap.

### Modified Capabilities

*(none — this is a net-new feature)*

## Impact

- **New files**: `src/components/DashboardGrid.tsx`, `src/components/Widget.tsx`, `src/hooks/useGridLayout.ts`, `src/hooks/useDragDrop.ts`
- **Dependencies**: No new runtime dependencies required (uses native HTML5 Drag and Drop API and CSS Grid); React 18+ assumed
- **Styling**: Grid dimensions and gap are configurable via props; base styles provided as CSS modules or inline styles
