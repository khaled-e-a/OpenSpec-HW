## Why

Dashboard widgets currently display static placeholder content — they cannot show live information or user-chosen data. Adding typed widget content (clock, image, file, webpage) transforms the dashboard from a layout demo into a genuinely useful personal workspace.

## What Changes

- Introduce a `WidgetType` discriminated union: `clock | image | file | webpage`
- Each `WidgetLayout` entry gains a `type` field and optional `config` payload
- New `WidgetContent` renderer component dispatches to the correct content component per type
- **Clock** widget: displays a live digital clock (HH:MM:SS), updates every second
- **Image** widget: displays a user-chosen image; user can replace it via a file picker (`<input type="file" accept="image/*">`)
- **File** widget: displays the text contents of a user-chosen file; user can replace it via a file picker (`<input type="file">`)
- **Webpage** widget: embeds a user-supplied URL in an `<iframe>`; user can change the URL via an inline input
- Each widget type exposes a small settings control (icon button) that opens an inline config panel for changing the content source
- `DashboardGrid` and `DraggableWidget` require no structural changes — widget type is purely a content concern
- `App.tsx` updated to seed the initial layout with one widget of each type

## Capabilities

### New Capabilities

- `widget-types`: Four widget content types (clock, image, file, webpage) with per-widget configuration UI

### Modified Capabilities

- `widget-drag-drop`: `WidgetLayout` interface gains a `type` and optional `config` field — a breaking schema change to the data model shared with the drag-drop implementation

## Impact

- **`src/utils/gridGeometry.ts`**: `WidgetLayout` interface extended with `type` and `config` fields
- **`src/components/DashboardGrid.tsx`**: passes type/config through to `DraggableWidget`
- **`src/components/DraggableWidget.tsx`**: renders `<WidgetContent>` instead of `{children}`
- **New files**: `src/components/WidgetContent.tsx`, `src/components/widgets/ClockWidget.tsx`, `src/components/widgets/ImageWidget.tsx`, `src/components/widgets/FileWidget.tsx`, `src/components/widgets/WebpageWidget.tsx`
- **`src/App.tsx`**: initial layout seeded with four typed widgets
- No backend changes; all state is local (React `useState`)
- No new npm dependencies required (File API, `<iframe>`, `setInterval` are all native browser APIs)

---

Created by Khaled@Huawei
