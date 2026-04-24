## Why

Users need a customizable dashboard where they can arrange widgets freely by dragging and dropping them into any position. This empowers users to personalize their workspace and prioritize the information most relevant to them, without requiring developer intervention each time layout preferences change.

## What Changes

- Introduce a new `DashboardPage` component featuring a drag-and-drop grid layout
- Introduce a `WidgetRegistry` that defines available widget types (e.g., charts, stats cards, tables)
- Each widget is independently draggable and droppable to any grid position
- Widget layout state (position + size) is persisted in `localStorage` so users retain their arrangement across sessions
- Add dependency: `@dnd-kit/core` and `@dnd-kit/sortable` for drag-and-drop primitives
- Add dependency: `react-grid-layout` for the responsive grid container

## Capabilities

### New Capabilities

- `drag-drop-dashboard`: Core dashboard page with a drag-and-drop grid layout, supporting widget positioning and reordering
- `widget-registry`: Registry of available widget types with their configurations and default placements
- `dashboard-persistence`: Saving and restoring widget layout to/from `localStorage`

### Modified Capabilities

<!-- No existing capabilities have requirement changes -->

## Impact

- **New files**: `src/components/Dashboard/`, `src/components/widgets/`, `src/registry/widgetRegistry.ts`
- **Dependencies**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `react-grid-layout`
- **State**: Dashboard layout stored in `localStorage` under key `dashboard-layout`
- **Routing**: A new `/dashboard` route added to the app router
- **No breaking changes** to existing components or APIs

---
Created by Khaled@Huawei
