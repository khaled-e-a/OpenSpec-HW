## Why

Modern dashboards need flexible, user-configurable layouts so users can tailor their workspace to their workflow without requiring developer intervention. Adding drag-and-drop widget management directly in the current directory enables a self-contained, interactive React dashboard experience where users own the layout.

## What Changes

- Introduce a new React dashboard application with a drag-and-drop widget system
- Add a widget registry supporting multiple widget types (e.g., charts, stats, tables)
- Implement drag-and-drop reordering and repositioning of widgets on the dashboard grid
- Provide the ability to add, remove, and resize widgets via the UI
- Persist layout configuration in `localStorage` so arrangements survive page refreshes

## Capabilities

### New Capabilities

- `dashboard-layout`: Grid-based dashboard canvas that hosts widgets and manages their positions; supports drag-to-reorder and drop-to-place interactions
- `widget-registry`: Registry of available widget types that can be instantiated and placed on the dashboard
- `drag-drop-interaction`: Core drag-and-drop mechanics — drag handles, drop zones, drag previews, and collision/overlap detection
- `widget-management`: UI controls to add new widgets from the registry and remove existing widgets from the dashboard
- `layout-persistence`: Serialisation and deserialisation of dashboard layout state to/from `localStorage`

### Modified Capabilities

_(none — this is a greenfield addition)_

## Impact

- **New files**: React app bootstrapped in the current directory (`src/`, `public/`, `package.json`, etc.)
- **Dependencies**: `react`, `react-dom`, a drag-and-drop library (e.g., `@dnd-kit/core` + `@dnd-kit/sortable`), `react-grid-layout` (or equivalent)
- **No existing code modified**: This is a self-contained new application
- **Browser APIs**: Uses `localStorage` for persistence; no backend required

Created by Khaled@Huawei
