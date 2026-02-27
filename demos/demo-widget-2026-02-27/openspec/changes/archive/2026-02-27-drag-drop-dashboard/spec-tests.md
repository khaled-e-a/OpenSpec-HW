# Spec-Test Mapping: drag-drop-dashboard
Generated: 2026-02-27

## Use Case ID Mapping

| ID | Spec File | Requirement |
|----|-----------|-------------|
| R1-UC1 | grid-layout/spec.md | Grid container renders with defined columns and row height |
| R1-UC2 | grid-layout/spec.md | Grid renders visual column and row guides |
| R1-UC3 | grid-layout/spec.md | Widget pixel position is derived from grid coordinates |
| R1-UC4 | grid-layout/spec.md | Layout state is free of cell overlap |
| R1-UC5 | grid-layout/spec.md | Widget with unregistered type renders a fallback error tile |
| R2-UC1 | widget-drag-drop/spec.md | Drag is initiated by pointer-down on a widget's drag handle |
| R2-UC2 | widget-drag-drop/spec.md | Ghost renders at the snapped target position during drag |
| R2-UC3 | widget-drag-drop/spec.md | Pointer coordinates are clamped to grid boundaries during drag |
| R2-UC4 | widget-drag-drop/spec.md | Drop commits the widget to the snapped target position |
| R2-UC5 | widget-drag-drop/spec.md | Escape key cancels an in-progress drag |
| R3-UC1 | widget-registery/spec.md | Widget types are registered via a module-level registry |
| R3-UC2 | widget-registery/spec.md | Registration validates its inputs and throws on invalid arguments |
| R3-UC3 | widget-registery/spec.md | Registering a duplicate type key overwrites the previous mapping with a warning |
| R3-UC4 | widget-registery/spec.md | The dashboard resolves widget components from the registry at render time |
| R3-UC5 | widget-registery/spec.md | Widgets with unresolvable type keys render a fallback error tile |
| R4-UC1 | widget-resize/spec.md | Resize handles are visible on each resizable widget |
| R4-UC2 | widget-resize/spec.md | Resize is initiated by pointer-down on a widget's resize handle |
| R4-UC3 | widget-resize/spec.md | A resize ghost overlay shows the new span during resize |
| R4-UC4 | widget-resize/spec.md | Resize enforces minimum and maximum span constraints |
| R4-UC5 | widget-resize/spec.md | Resize commit applies the new span when target cells are unoccupied |
| R4-UC6 | widget-resize/spec.md | Escape key cancels an in-progress resize |

---

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| R1-UC1 | Grid container renders with defined columns and row height | Flow | Integration | `src/components/DashboardGrid.integration.test.tsx` | ⚠️ |
| R1-UC1-S1 | Grid renders with valid config | Step | Component | `src/components/DashboardGrid.test.tsx` "renders a widget at the correct position" | ⚠️ |
| R1-UC1-S2 | Grid renders with zero widgets | Step | Component | `src/components/DashboardGrid.test.tsx` "renders an empty-state placeholder when layout is empty" | ✅ |
| R1-UC2 | Grid renders visual column and row guides | Flow | Component | `src/components/GridLines.test.tsx` | ❌ |
| R1-UC2-S1 | Grid lines are visible on render | Step | Component | `src/components/GridLines.test.tsx` "renders column and row guide elements" | ❌ |
| R1-UC2-S2 | Grid lines do not intercept pointer events | Step | Unit | `src/components/GridLines.test.tsx` "grid lines overlay has pointer-events: none" | ❌ |
| R1-UC3 | Widget pixel position is derived from grid coordinates | Flow | Unit | `src/utils/gridCoords.test.ts` | ❌ |
| R1-UC3-S1 | Widget position matches grid coordinate (x=2,y=1,w=3,h=2) | Step | Unit | `src/utils/gridCoords.test.ts` "toPixelRect computes correct left/top/width/height" | ❌ |
| R1-UC3-S2 | Widget at origin renders at top-left (left=0, top=0) | Step | Unit | `src/utils/gridCoords.test.ts` "toPixelRect returns left=0 top=0 for x=0 y=0" | ❌ |
| R1-UC4 | Layout state is free of cell overlap | Flow | Unit, Component | `src/hooks/useDashboard.test.ts`, `src/components/DashboardGrid.test.tsx` | ✅ |
| R1-UC4-S1 | Non-overlapping layout renders as-is | Step | Unit | `src/hooks/useDashboard.test.ts:53` "leaves a non-overlapping layout unchanged" | ✅ |
| R1-UC4-S2 | Overlapping widgets are shifted on load | Step | Unit, Component | `src/hooks/useDashboard.test.ts:60`, `src/components/DashboardGrid.test.tsx:40` | ✅ |
| R1-UC5 | Widget with unregistered type renders a fallback error tile | Flow | Component | `src/components/Widget.test.tsx` | ✅ |
| R1-UC5-S1 | Unknown type key shows error tile | Step | Component | `src/components/Widget.test.tsx:42` "renders an error tile for an unregistered type" | ✅ |
| R1-UC5-S2 | Error tile does not affect other widgets | Step | Component | `src/components/Widget.test.tsx` | ⚠️ |
| R2-UC1 | Drag is initiated by pointer-down on a widget's drag handle | Flow | Integration | `src/components/DashboardGrid.drag.test.tsx` | ❌ |
| R2-UC1-S1 | Drag starts on handle pointer-down (opacity reduced, pointer captured) | Step | Component | `src/components/DashboardGrid.drag.test.tsx` "dragging a widget reduces its opacity" | ❌ |
| R2-UC1-S2 | Drag does not start on widget body | Step | Component | `src/components/DashboardGrid.drag.test.tsx` "pointer-down on widget body does not initiate drag" | ❌ |
| R2-UC2 | Ghost renders at the snapped target position during drag | Flow | Integration | `src/components/DashboardGrid.drag.test.tsx` | ❌ |
| R2-UC2-S1 | Ghost appears at drag start | Step | Component | `src/components/DashboardGrid.drag.test.tsx` "ghost widget is rendered after drag start" | ❌ |
| R2-UC2-S2 | Ghost follows pointer and snaps to nearest cell | Step | Integration | `src/components/DashboardGrid.drag.test.tsx` "ghost position updates on pointer move" | ❌ |
| R2-UC2-S3 | Ghost does not appear outside of active drag | Step | Integration | `src/components/DashboardGrid.integration.test.tsx:47` "does not render a ghost when no interaction is active" | ✅ |
| R2-UC3 | Pointer coordinates are clamped to grid boundaries during drag | Flow | Unit | `src/utils/gridCoords.test.ts` | ❌ |
| R2-UC3-S1 | Drag near right edge clamps to last valid column | Step | Unit | `src/utils/gridCoords.test.ts` "clampPosition clamps x so widget fits within columns" | ❌ |
| R2-UC3-S2 | Drag beyond top edge clamps to row 0 | Step | Unit | `src/utils/gridCoords.test.ts` "clampPosition clamps y to minimum 0" | ❌ |
| R2-UC4 | Drop commits the widget to the snapped target position | Flow | Integration | `src/components/DashboardGrid.drag.test.tsx` | ❌ |
| R2-UC4-S1 | Valid drop updates widget position | Step | Integration | `src/components/DashboardGrid.drag.test.tsx` "dropping on a free cell updates layout state" | ❌ |
| R2-UC4-S2 | Drop on occupied cells is rejected | Step | Integration | `src/components/DashboardGrid.drag.test.tsx` "dropping on an occupied cell does not update layout state" | ❌ |
| R2-UC5 | Escape key cancels an in-progress drag | Flow | Integration | `src/components/DashboardGrid.drag.test.tsx` | ❌ |
| R2-UC5-S1 | Escape restores widget to original position | Step | Integration | `src/components/DashboardGrid.drag.test.tsx` "Escape during drag cancels and removes ghost" | ❌ |
| R2-UC5-S2 | Escape during drag does not alter layout state | Step | Integration | `src/components/DashboardGrid.drag.test.tsx` "Escape during drag leaves layout unchanged" | ❌ |
| R3-UC1 | Widget types are registered via a module-level registry | Flow | Unit | `src/registry/WidgetRegistry.test.ts` | ✅ |
| R3-UC1-S1 | Registering a valid widget type | Step | Unit | `src/registry/WidgetRegistry.test.ts:11` "stores a valid component and can be resolved" | ✅ |
| R3-UC1-S2 | Registry persists across component mounts | Step | Integration | `src/registry/WidgetRegistry.test.ts` "registry map persists between test-isolated calls" | ❌ |
| R3-UC2 | Registration validates its inputs and throws on invalid arguments | Flow | Unit | `src/registry/WidgetRegistry.test.ts` | ✅ |
| R3-UC2-S1 | Empty type key throws | Step | Unit | `src/registry/WidgetRegistry.test.ts:16` "throws when type key is an empty string" | ✅ |
| R3-UC2-S2 | Non-string type key throws | Step | Unit | `src/registry/WidgetRegistry.test.ts:22` "throws when type key is not a string" | ✅ |
| R3-UC2-S3 | Non-component value throws | Step | Unit | `src/registry/WidgetRegistry.test.ts:28` "throws when Component is not a function" | ✅ |
| R3-UC3 | Registering a duplicate type key overwrites the previous mapping with a warning | Flow | Unit | `src/registry/WidgetRegistry.test.ts` | ✅ |
| R3-UC3-S1 | Duplicate key overwrites with warning | Step | Unit | `src/registry/WidgetRegistry.test.ts:34` "overwrites duplicate key and emits a console warning" | ✅ |
| R3-UC4 | Dashboard resolves widget components from the registry at render time | Flow | Component | `src/components/Widget.test.tsx` | ✅ |
| R3-UC4-S1 | Registered widget renders its component | Step | Component | `src/components/Widget.test.tsx:36` "renders the registered component for a known type" | ✅ |
| R3-UC4-S2 | Registered component receives correct props (widgetId, config, position) | Step | Component | `src/components/Widget.test.tsx` "registered component receives widgetId and config props" | ❌ |
| R3-UC5 | Widgets with unresolvable type keys render a fallback error tile | Flow | Component | `src/components/Widget.test.tsx` | ✅ |
| R3-UC5-S1 | Unknown type renders error tile with type key label | Step | Component | `src/components/Widget.test.tsx:42` "renders an error tile for an unregistered type" | ✅ |
| R3-UC5-S2 | Error boundary isolates component render errors | Step | Component | `src/components/Widget.test.tsx:48` "renders an error tile when the component throws, without affecting siblings" | ✅ |
| R4-UC1 | Resize handles are visible on each resizable widget | Flow | Component | `src/components/DashboardGrid.resize.test.tsx` | ❌ |
| R4-UC1-S1 | Resize handle is visible on resizable widget | Step | Component | `src/components/DashboardGrid.resize.test.tsx` "resize handle is rendered for a widget with resizable: true" | ❌ |
| R4-UC1-S2 | Resize handle is absent during active drag | Step | Integration | `src/components/DashboardGrid.resize.test.tsx` "resize handle is not interactable while a drag is in progress" | ❌ |
| R4-UC2 | Resize is initiated by pointer-down on a widget's resize handle | Flow | Integration | `src/components/DashboardGrid.resize.test.tsx` | ❌ |
| R4-UC2-S1 | Resize starts on handle pointer-down | Step | Component | `src/components/DashboardGrid.resize.test.tsx` "pointer-down on resize handle initiates resize" | ❌ |
| R4-UC2-S2 | Resize does not start on widget body or drag handle | Step | Component | `src/components/DashboardGrid.resize.test.tsx` "pointer-down on widget body does not initiate resize" | ❌ |
| R4-UC3 | A resize ghost overlay shows the new span during resize | Flow | Integration | `src/components/DashboardGrid.resize.test.tsx` | ❌ |
| R4-UC3-S1 | Ghost overlay appears at resize start | Step | Component | `src/components/DashboardGrid.resize.test.tsx` "ghost widget appears after resize handle pointer-down" | ❌ |
| R4-UC3-S2 | Ghost updates to snapped span on pointer move | Step | Integration | `src/components/DashboardGrid.resize.test.tsx` "ghost size updates on pointer move during resize" | ❌ |
| R4-UC4 | Resize enforces minimum and maximum span constraints | Flow | Unit | `src/utils/gridCoords.test.ts` | ❌ |
| R4-UC4-S1 | Resize below minimum is clamped to 1x1 | Step | Unit | `src/utils/gridCoords.test.ts` "clampSpan returns minimum w=1 h=1 when span is zero or negative" | ❌ |
| R4-UC4-S2 | Resize beyond grid boundary is clamped | Step | Unit | `src/utils/gridCoords.test.ts` "clampSpan clamps span so widget does not exceed column count" | ❌ |
| R4-UC5 | Resize commit applies the new span when target cells are unoccupied | Flow | Integration | `src/components/DashboardGrid.resize.test.tsx` | ❌ |
| R4-UC5-S1 | Valid resize updates widget span | Step | Integration | `src/components/DashboardGrid.resize.test.tsx` "releasing resize handle over free cells commits new span" | ❌ |
| R4-UC5-S2 | Resize into occupied cells is rejected | Step | Integration | `src/components/DashboardGrid.resize.test.tsx` "releasing resize handle over occupied cells rejects resize" | ❌ |
| R4-UC6 | Escape key cancels an in-progress resize | Flow | Integration | `src/components/DashboardGrid.resize.test.tsx` | ❌ |
| R4-UC6-S1 | Escape restores original widget dimensions | Step | Integration | `src/components/DashboardGrid.resize.test.tsx` "Escape during resize cancels and removes ghost" | ❌ |
| R4-UC6-S2 | Escape during resize does not alter layout state | Step | Integration | `src/components/DashboardGrid.resize.test.tsx` "Escape during resize leaves layout unchanged" | ❌ |

---

## Use Case Details: grid-layout

### Main Scenario

- **R1-UC1-S1**: Grid renders with valid config
  - `src/components/DashboardGrid.test.tsx:30` "renders a widget at the correct position" (Component) ⚠️
  - `src/components/DashboardGrid.integration.test.tsx:37` "mounts with two widgets and renders both" (Integration) ⚠️
- **R1-UC1-S2**: Grid renders with zero widgets
  - `src/components/DashboardGrid.test.tsx:25` "renders an empty-state placeholder when layout is empty" (Component) ✅
- **R1-UC2-S1**: Grid lines are visible on render
  - `src/components/GridLines.test.tsx` "renders column and row guide elements" (Component) ❌
- **R1-UC2-S2**: Grid lines do not intercept pointer events
  - `src/components/GridLines.test.tsx` "grid lines overlay has pointer-events: none" (Unit) ❌
- **R1-UC3-S1**: Widget position matches grid coordinate
  - `src/utils/gridCoords.test.ts` "toPixelRect computes correct left/top/width/height for x=2,y=1,w=3,h=2" (Unit) ❌
- **R1-UC3-S2**: Widget at origin renders at top-left
  - `src/utils/gridCoords.test.ts` "toPixelRect returns left=0 top=0 for x=0 y=0" (Unit) ❌
- **R1-UC4-S1**: Non-overlapping layout renders as-is
  - `src/hooks/useDashboard.test.ts:53` "leaves a non-overlapping layout unchanged" (Unit) ✅
- **R1-UC4-S2**: Overlapping widgets are shifted on load
  - `src/hooks/useDashboard.test.ts:60` "shifts the second widget down when two widgets overlap" (Unit) ✅
  - `src/components/DashboardGrid.test.tsx:40` "auto-corrects an overlapping initial layout" (Component) ✅
- **R1-UC5-S1**: Unknown type key shows error tile
  - `src/components/Widget.test.tsx:42` "renders an error tile for an unregistered type" (Component) ✅
- **R1-UC5-S2**: Error tile does not affect other widgets
  - `src/components/Widget.test.tsx` — tested for single-widget isolation only (Component) ⚠️

### Full Flow Tests
- `R1-UC4` — "Layout state is free of cell overlap" → `src/hooks/useDashboard.test.ts` (Unit) ✅
- `R1-UC5` — "Widget with unregistered type renders a fallback error tile" → `src/components/Widget.test.tsx` (Component) ✅

---

## Use Case Details: widget-drag-drop

### Main Scenario

- **R2-UC1-S1**: Drag starts on handle pointer-down
  - `src/components/DashboardGrid.drag.test.tsx` "dragging a widget reduces its opacity" (Component) ❌
- **R2-UC1-S2**: Drag does not start on widget body
  - `src/components/DashboardGrid.drag.test.tsx` "pointer-down on widget body does not initiate drag" (Component) ❌
- **R2-UC2-S1**: Ghost appears at drag start
  - `src/components/DashboardGrid.drag.test.tsx` "ghost widget is rendered after drag start" (Component) ❌
- **R2-UC2-S2**: Ghost follows pointer and snaps to nearest cell
  - `src/components/DashboardGrid.drag.test.tsx` "ghost position updates on pointer move" (Integration) ❌
- **R2-UC2-S3**: Ghost does not appear outside of active drag
  - `src/components/DashboardGrid.integration.test.tsx:47` "does not render a ghost when no interaction is active" (Integration) ✅
- **R2-UC3-S1**: Drag near right edge clamps to last valid column
  - `src/utils/gridCoords.test.ts` "clampPosition clamps x so widget fits within columns" (Unit) ❌
- **R2-UC3-S2**: Drag beyond top edge clamps to row 0
  - `src/utils/gridCoords.test.ts` "clampPosition clamps y to minimum 0" (Unit) ❌
- **R2-UC4-S1**: Valid drop updates widget position
  - `src/components/DashboardGrid.drag.test.tsx` "dropping on a free cell updates layout state" (Integration) ❌
- **R2-UC4-S2**: Drop on occupied cells is rejected
  - `src/components/DashboardGrid.drag.test.tsx` "dropping on an occupied cell does not update layout state" (Integration) ❌
- **R2-UC5-S1**: Escape restores widget to original position
  - `src/components/DashboardGrid.drag.test.tsx` "Escape during drag cancels and removes ghost" (Integration) ❌
- **R2-UC5-S2**: Escape during drag does not alter layout state
  - `src/components/DashboardGrid.drag.test.tsx` "Escape during drag leaves layout unchanged" (Integration) ❌

### Full Flow Tests
- `R2-UC2-S3` — "Ghost does not appear outside of active drag" → `src/components/DashboardGrid.integration.test.tsx:47` (Integration) ✅

---

## Use Case Details: widget-registery

### Main Scenario

- **R3-UC1-S1**: Registering a valid widget type
  - `src/registry/WidgetRegistry.test.ts:11` "stores a valid component and can be resolved" (Unit) ✅
- **R3-UC1-S2**: Registry persists across component mounts
  - `src/registry/WidgetRegistry.test.ts` "registry map persists between test-isolated calls" (Integration) ❌
- **R3-UC2-S1**: Empty type key throws
  - `src/registry/WidgetRegistry.test.ts:16` "throws when type key is an empty string" (Unit) ✅
- **R3-UC2-S2**: Non-string type key throws
  - `src/registry/WidgetRegistry.test.ts:22` "throws when type key is not a string" (Unit) ✅
- **R3-UC2-S3**: Non-component value throws
  - `src/registry/WidgetRegistry.test.ts:28` "throws when Component is not a function" (Unit) ✅
- **R3-UC3-S1**: Duplicate key overwrites with warning
  - `src/registry/WidgetRegistry.test.ts:34` "overwrites duplicate key and emits a console warning" (Unit) ✅
- **R3-UC4-S1**: Registered widget renders its component
  - `src/components/Widget.test.tsx:36` "renders the registered component for a known type" (Component) ✅
- **R3-UC4-S2**: Registered component receives correct props
  - `src/components/Widget.test.tsx` "registered component receives widgetId and config props" (Component) ❌
- **R3-UC5-S1**: Unknown type renders error tile
  - `src/components/Widget.test.tsx:42` "renders an error tile for an unregistered type" (Component) ✅
- **R3-UC5-S2**: Error boundary isolates component render errors
  - `src/components/Widget.test.tsx:48` "renders an error tile when the component throws" (Component) ✅

### Full Flow Tests
- `R3-UC1` — "Widget types are registered via a module-level registry" → `src/registry/WidgetRegistry.test.ts` (Unit) ✅
- `R3-UC2` — "Registration validates its inputs" → `src/registry/WidgetRegistry.test.ts` (Unit) ✅
- `R3-UC3` — "Duplicate key handling" → `src/registry/WidgetRegistry.test.ts` (Unit) ✅
- `R3-UC5` — "Fallback error tile" → `src/components/Widget.test.tsx` (Component) ✅

---

## Use Case Details: widget-resize

### Main Scenario

- **R4-UC1-S1**: Resize handle is visible on resizable widget
  - `src/components/DashboardGrid.resize.test.tsx` "resize handle is rendered for a widget with resizable: true" (Component) ❌
- **R4-UC1-S2**: Resize handle is absent during active drag
  - `src/components/DashboardGrid.resize.test.tsx` "resize handle is not interactable while a drag is in progress" (Integration) ❌
- **R4-UC2-S1**: Resize starts on handle pointer-down
  - `src/components/DashboardGrid.resize.test.tsx` "pointer-down on resize handle initiates resize" (Component) ❌
- **R4-UC2-S2**: Resize does not start on widget body or drag handle
  - `src/components/DashboardGrid.resize.test.tsx` "pointer-down on widget body does not initiate resize" (Component) ❌
- **R4-UC3-S1**: Ghost overlay appears at resize start
  - `src/components/DashboardGrid.resize.test.tsx` "ghost widget appears after resize handle pointer-down" (Component) ❌
- **R4-UC3-S2**: Ghost updates to snapped span on pointer move
  - `src/components/DashboardGrid.resize.test.tsx` "ghost size updates on pointer move during resize" (Integration) ❌
- **R4-UC4-S1**: Resize below minimum is clamped to 1x1
  - `src/utils/gridCoords.test.ts` "clampSpan returns minimum w=1 h=1" (Unit) ❌
- **R4-UC4-S2**: Resize beyond grid boundary is clamped
  - `src/utils/gridCoords.test.ts` "clampSpan clamps span to not exceed column count" (Unit) ❌
- **R4-UC5-S1**: Valid resize updates widget span
  - `src/components/DashboardGrid.resize.test.tsx` "releasing resize handle over free cells commits new span" (Integration) ❌
- **R4-UC5-S2**: Resize into occupied cells is rejected
  - `src/components/DashboardGrid.resize.test.tsx` "releasing resize handle over occupied cells rejects resize" (Integration) ❌
- **R4-UC6-S1**: Escape restores original widget dimensions
  - `src/components/DashboardGrid.resize.test.tsx` "Escape during resize cancels and removes ghost" (Integration) ❌
- **R4-UC6-S2**: Escape during resize does not alter layout state
  - `src/components/DashboardGrid.resize.test.tsx` "Escape during resize leaves layout unchanged" (Integration) ❌

### Full Flow Tests
- `R4-UC1` — "Resize handle visibility" → `src/components/DashboardGrid.resize.test.tsx` (Component) ❌
- `R4-UC2` — "Resize initiation" → `src/components/DashboardGrid.resize.test.tsx` (Integration) ❌
- `R4-UC3` — "Resize ghost" → `src/components/DashboardGrid.resize.test.tsx` (Integration) ❌
- `R4-UC5` — "Resize commit" → `src/components/DashboardGrid.resize.test.tsx` (Integration) ❌
- `R4-UC6` — "Escape cancel" → `src/components/DashboardGrid.resize.test.tsx` (Integration) ❌
