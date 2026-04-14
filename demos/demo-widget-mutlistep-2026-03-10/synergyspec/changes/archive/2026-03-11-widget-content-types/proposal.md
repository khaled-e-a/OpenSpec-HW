## Why

Widgets on the dashboard are currently placeholder containers with no content. Giving each widget a user-selectable content type — clock, image, file viewer, or webpage — turns the dashboard into a genuinely useful, personalised information surface. Users need to be able to pick a type when adding a widget and change it later without removing and re-adding the widget.

## What Changes

- Each `WidgetLayout` entry gains a `type` field identifying which of the four content types the widget displays. **BREAKING**: all existing layout consumers must supply `type`; no implicit default.
- A new type-dispatch layer renders the correct content component inside `DraggableWidget` based on `type`.
- Each widget renders a settings overlay that lets the user change its type and update type-specific configuration (image source, file path, URL).
- Four content type implementations are introduced:
  - **Clock** — displays the current local time, updating every second.
  - **Image** — displays a user-selected image from the local filesystem; user can replace the image at any time.
  - **File viewer** — reads and displays the text content of a user-selected local file; user can change the file at any time.
  - **Webpage** — renders a user-supplied URL inside an `<iframe>`; user can change the URL at any time.
- The Add Widget flow assigns a default type (`clock`) to newly created widgets. Users can change the type immediately via the widget settings.

## Capabilities

### New Capabilities

- `widget-type-system`: Core type field on `WidgetLayout`, per-widget settings panel (open/close toggle), type-change UI, and content dispatch router that renders the correct component for each type.
- `widget-clock`: Clock content type — live display of the current local time, self-updating.
- `widget-image`: Image content type — displays a locally-selected image; provides a file-picker control to replace the image.
- `widget-file-viewer`: File viewer content type — reads and renders plain text from a locally-selected file; provides a file-picker control to change the file.
- `widget-webpage`: Webpage content type — embeds a user-supplied URL in a sandboxed `<iframe>`; provides a URL input to change the page.

### Modified Capabilities

- `widget-drag-drop`: `WidgetLayout` gains a mandatory `type: WidgetType` field. **BREAKING** — all layout consumers must include `type` in every entry.
- `widget-add`: When a new widget is created, it is assigned `type: "clock"` by default. No other behaviour changes.

## Impact

- `src/components/dashboard/types.ts` — `WidgetLayout` extended with `type: WidgetType`; new `WidgetType` union type (`"clock" | "image" | "file" | "webpage"`)
- `src/components/dashboard/DraggableWidget.tsx` — renders a type-specific content component and a settings toggle button
- `src/App.tsx` — initial layout entries must include `type`; `handleAddWidget` assigns `type: "clock"`
- New component files: `WidgetSettings.tsx`, `ClockContent.tsx`, `ImageContent.tsx`, `FileContent.tsx`, `WebpageContent.tsx`
- No changes to drag-and-drop, resize, or remove behaviour
- No new npm dependencies required (file picker via native `<input type="file">`, webpage via `<iframe>`)

---

Created by Khaled@Huawei
