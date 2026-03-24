## Why

The dashboard currently ships with a fixed set of widgets that users cannot modify. Users need the ability to personalise their dashboard by adding widgets they care about, removing ones they don't, and resizing existing ones to fit their preferred layout — without these capabilities the dashboard is static and not genuinely useful.

## What Changes

- Add a widget catalogue / picker UI that lets users select and add new widgets to the grid
- Add a "remove" control on each widget so users can dismiss widgets they don't need
- Extend the existing resize handle to support both grow and shrink (minimum 1×1)
- Persist add/remove actions to localStorage alongside layout changes
- Update the widget registry to act as the source of truth for available widgets

## Capabilities

### New Capabilities

- `widget-add`: Browsing the widget catalogue and adding a new widget to the dashboard grid
- `widget-remove`: Removing an existing widget from the dashboard grid

### Modified Capabilities

- `widget-drag-drop`: The resize interaction already exists; requirements are extended to cover shrinking below the original size and enforcing the 1×1 minimum during a remove-triggered reflow

## Impact

- `src/components/DashboardGrid.tsx` — add catalogue trigger button and wire add/remove actions
- `src/components/Widget.tsx` — add remove (×) button; expose remove callback
- `src/hooks/useDashboardLayout.ts` — add `addWidget` and `removeWidget` actions alongside existing `commitLayout`
- `src/constants.ts` — WIDGET_REGISTRY already defines available widgets; no schema change needed
- `src/types.ts` — possibly a `WidgetDefinition` catalogue type if not already present
- No new external dependencies expected

Created by Khaled@Huawei
