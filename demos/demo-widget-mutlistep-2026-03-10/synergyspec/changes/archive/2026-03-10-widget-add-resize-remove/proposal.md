## Why

The dashboard currently only supports dragging pre-existing widgets. Users have no way to populate the dashboard with new widgets, adjust widget size to fit more or less content, or remove widgets they no longer need — making the grid static and impractical for real use.

## What Changes

- New toolbar or control surface that lets users add a widget to the next available grid cell
- Resize handles on each widget that let users drag to change the widget's column/row span
- A remove button on each widget that deletes it from the layout
- Grid layout state updated to track `w` (width in columns) and `h` (height in rows) per widget, in addition to existing `col`/`row`
- Collision and bounds validation extended to account for variable widget sizes during drag and resize

## Capabilities

### New Capabilities

- `widget-add`: Mechanism to add a new widget to the dashboard, placing it at the first available grid position
- `widget-resize`: Drag-handle–based resizing of an existing widget's column and row span, with live ghost preview and collision/bounds validation
- `widget-remove`: Removal of an individual widget from the dashboard with immediate layout update

### Modified Capabilities

- `widget-drag-drop`: Collision detection and bounds validation must account for variable widget sizes (`w`, `h`); the `WidgetLayout` type gains `w` and `h` fields — existing drag-drop behaviour is preserved but operates on a richer layout model (**BREAKING** for `WidgetLayout` consumers)

## Impact

- **`src/components/dashboard/types.ts`** — `WidgetLayout` gains `w` and `h` fields
- **`src/components/dashboard/utils/collision.ts`** — collision checks updated to use `w`/`h`
- **`src/components/dashboard/utils/gridCoords.ts`** — coordinate mapping updated for variable-size widgets
- **`src/components/dashboard/DashboardGrid.tsx`** — new props/callbacks for add and remove; resize event handling added
- **`src/components/dashboard/DraggableWidget.tsx`** — resize handles and remove button added
- **`src/components/dashboard/GhostWidget.tsx`** — ghost sizing updated to reflect `w`/`h`
- **`src/App.tsx`** — wired to new add/remove callbacks and updated layout model
- No new external dependencies anticipated; resize handles implemented with pointer events or @dnd-kit sensors

---

Created by Khaled@Huawei
