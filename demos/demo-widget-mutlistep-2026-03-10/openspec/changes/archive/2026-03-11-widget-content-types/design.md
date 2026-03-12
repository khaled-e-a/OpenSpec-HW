## Context

The dashboard currently renders widgets as unstyled placeholder containers. Each `WidgetLayout` entry carries only position and size (`col`, `row`, `w`, `h`, `id`). This design introduces a `type` field and type-specific configuration so each widget renders meaningful content. The four supported types are: `clock`, `image`, `file`, and `webpage`. Users must be able to select a type when a widget is created and change it at any time without removing the widget.

The change extends the data model, adds a settings UI layer inside each widget, and introduces five new React components (one per type + one dispatcher). It does not touch drag, drop, resize, or remove behaviour.

## Use Case Coverage

See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
This design addresses the following use case steps:

| Use Case Step | Description | Design Section |
|---------------|-------------|----------------|
| UC1-S1 | User activates the settings control on a widget. | Settings Toggle Button |
| UC1-S2 | System opens a settings panel for that widget, showing the currently active type and the four available types (clock, image, file, webpage). | Settings Panel |
| UC1-S3 | User selects a content type. | Settings Panel |
| UC1-S4 | System updates the widget to the selected type and closes the settings panel. | Type Dispatch / onConfigChange |
| UC1-S5 | Widget renders the new content type immediately (clock starts ticking; image/file/webpage renders its configured source, or its empty state if no source is yet configured). | Type Dispatch |
| UC1-E3a | User selects the same type that is already active. | Settings Panel |
| UC1-E3b | User dismisses the settings panel without selecting a type. | Settings Toggle Button |
| UC1-E5a | Selected type requires a source (image, file, or webpage) and none has been configured yet. | Content Components |
| UC2-S1 | System renders the widget using the clock content component. | ClockContent |
| UC2-S2 | System displays the current local time in a readable format (e.g., HH:MM:SS). | ClockContent |
| UC2-S3 | System refreshes the displayed time every second. | ClockContent |
| UC2-S4 | Time remains current for as long as the widget is visible. | ClockContent |
| UC3-S1 | User activates the file-selection control inside the widget. | ImageContent |
| UC3-S2 | System opens the operating system's file picker, filtered to image file types. | ImageContent |
| UC3-S3 | User selects an image file and confirms. | ImageContent |
| UC3-S4 | System reads the selected image and renders it inside the widget, scaled to fit. | ImageContent |
| UC3-S5 | System retains the image source so the widget re-displays the same image on subsequent renders. | WidgetLayout Data Model |
| UC3-E3a | User cancels the file picker without selecting a file. | ImageContent |
| UC3-E4a | Selected file is not a valid image. | ImageContent |
| UC3-E5a | User wants to replace the current image. | ImageContent |
| UC4-S1 | User activates the file-selection control inside the widget. | FileContent |
| UC4-S2 | System opens the operating system's file picker. | FileContent |
| UC4-S3 | User selects a file and confirms. | FileContent |
| UC4-S4 | System reads the file's text content and renders it as scrollable text inside the widget. | FileContent |
| UC4-S5 | System retains the file reference so the widget can re-display the file on subsequent renders. | WidgetLayout Data Model |
| UC4-E3a | User cancels the file picker. | FileContent |
| UC4-E4a | File cannot be read (access error, binary content, or read failure). | FileContent |
| UC4-E5a | User wants to change the displayed file. | FileContent |
| UC5-S1 | User activates the URL input control inside the widget. | WebpageContent |
| UC5-S2 | System presents an editable URL field pre-populated with the current URL (or empty if none is set). | WebpageContent |
| UC5-S3 | User enters or edits the URL and confirms. | WebpageContent |
| UC5-S4 | System loads the URL inside a sandboxed `<iframe>` within the widget. | WebpageContent |
| UC5-S5 | Webpage is displayed; user can interact with the embedded page normally. | WebpageContent |
| UC5-E3a | User confirms without entering a URL. | WebpageContent |
| UC5-E3b | User dismisses the URL input without confirming. | WebpageContent |
| UC5-E4a | The page refuses embedding (X-Frame-Options: DENY or SAMEORIGIN). | WebpageContent |
| UC5-E4b | The URL is malformed or the host is unreachable. | WebpageContent |
| UC5-E5a | User wants to change the URL. | WebpageContent |

### Unaddressed Use Case Steps
None — all 38 steps are addressed by the decisions below.

---

## Goals / Non-Goals

**Goals:**
- Add a `type` field to `WidgetLayout` (BREAKING; all existing entries must include it)
- Render type-appropriate content inside each widget
- Allow the user to change a widget's type at any time via an in-widget settings panel
- Allow the user to update type-specific configuration (image, file, URL) via in-widget controls
- Store all type-specific data in the layout array so it propagates through `onLayoutChange` like any other layout change

**Non-Goals:**
- Persistence across browser sessions (no localStorage, no backend; data is in-memory React state)
- Timezone selection for the clock widget
- Image cropping or editing
- Syntax highlighting in the file viewer
- Webpage interaction state persistence (scroll position, form input, etc.)
- Sharing widget configurations between users

---

## Decisions

### Decision 1: Extend `WidgetLayout` with a flat optional-config shape

**Addresses**:
- UC1-S4 - System updates the widget to the selected type and closes the settings panel.
- UC3-S5 - System retains the image source so the widget re-displays the same image on subsequent renders.
- UC4-S5 - System retains the file reference so the widget can re-display the file on subsequent renders.
- UC5-S3 - User enters or edits the URL and confirms.

**Rationale**: Type-specific configuration is stored directly on `WidgetLayout` as optional fields, alongside the existing position/size fields. This keeps the data model flat, typeable, and serialisable without a discriminated union or generic bag.

New `WidgetLayout` fields:
```typescript
type WidgetType = 'clock' | 'image' | 'file' | 'webpage';

interface WidgetLayout {
  id: string;
  col: number;
  row: number;
  w: number;
  h: number;
  type: WidgetType;          // BREAKING — mandatory
  imageDataUrl?: string;     // base64 data URL for image type
  fileText?: string;         // plain text content for file type
  fileLabel?: string;        // display filename for file type
  webpageUrl?: string;       // URL for webpage type
}
```

**Alternative considered**: A `config: ClockConfig | ImageConfig | FileConfig | WebpageConfig` discriminated union. Rejected because it adds type narrowing complexity throughout the codebase and complicates the `onLayoutChange` callback signature without meaningful benefit at this scale.

---

### Decision 2: New `onConfigChange` prop on `DraggableWidget` for in-widget config updates

**Addresses**:
- UC1-S3 - User selects a content type.
- UC1-S4 - System updates the widget to the selected type and closes the settings panel.
- UC3-S4 - System reads the selected image and renders it inside the widget, scaled to fit.
- UC4-S4 - System reads the file's text content and renders it as scrollable text inside the widget.
- UC5-S3 - User enters or edits the URL and confirms.

**Rationale**: Content components and the settings panel need to write back changes (type switches, image data URL, file text, URL) to the parent layout. Rather than requiring every content component to reach up to `App.tsx` via props chains, `DraggableWidget` receives a single `onConfigChange: (updates: Partial<WidgetLayout>) => void` callback. `App.tsx` implements it by merging the partial update into the affected layout entry and calling `setLayout`.

**Alternative considered**: Lifting all config state up to `App.tsx` and threading it down as separate props. Rejected because it would require `App.tsx` to know about every type-specific field.

---

### Decision 3: Settings toggle button inside `DraggableWidget`; settings panel as absolute overlay

**Addresses**:
- UC1-S1 - User activates the settings control on a widget.
- UC1-S2 - System opens a settings panel for that widget, showing the currently active type and the four available types (clock, image, file, webpage).
- UC1-E3b - User dismisses the settings panel without selecting a type.

**Rationale**: A small gear/settings button (⚙) is added to each widget alongside the existing remove (×) and resize handles. Clicking it toggles a local `settingsOpen` boolean state inside `DraggableWidget`. When open, a `<WidgetSettings>` panel is rendered as an absolute overlay covering the widget's content area. The panel has a close button. Both the toggle and the panel must call `e.stopPropagation()` on `pointerDown` to prevent drag activation.

The `settingsOpen` state is local to `DraggableWidget` (not in `WidgetLayout`) since it is transient UI state that does not need to persist across renders.

---

### Decision 4: `WidgetContent` dispatcher component

**Addresses**:
- UC1-S5 - Widget renders the new content type immediately (clock starts ticking; image/file/webpage renders its configured source, or its empty state if no source is yet configured).
- UC2-S1 - System renders the widget using the clock content component.
- UC1-E5a - Selected type requires a source (image, file, or webpage) and none has been configured yet.

**Rationale**: A `WidgetContent` component receives the full `WidgetLayout` entry and `onConfigChange` and renders the appropriate child component via a `switch` on `type`. This single dispatch point makes adding future types trivial and keeps `DraggableWidget` free of type-specific logic.

```
DraggableWidget
  ├── WidgetSettings (when settingsOpen)
  └── WidgetContent
        ├── ClockContent      (type === 'clock')
        ├── ImageContent      (type === 'image')
        ├── FileContent       (type === 'file')
        └── WebpageContent    (type === 'webpage')
```

---

### Decision 5: Clock uses `setInterval` via `useEffect`

**Addresses**:
- UC2-S2 - System displays the current local time in a readable format (e.g., HH:MM:SS).
- UC2-S3 - System refreshes the displayed time every second.
- UC2-S4 - Time remains current for as long as the widget is visible.

**Rationale**: `ClockContent` holds a `Date` in `useState`, updated via a `setInterval(1000)` inside a `useEffect`. The interval is cleared on unmount. Display format: `date.toLocaleTimeString()`. No external dependency required.

---

### Decision 6: Image uses `FileReader.readAsDataURL`; result stored in `WidgetLayout.imageDataUrl`

**Addresses**:
- UC3-S2 - System opens the operating system's file picker, filtered to image file types.
- UC3-S3 - User selects an image file and confirms.
- UC3-S4 - System reads the selected image and renders it inside the widget, scaled to fit.
- UC3-E3a - User cancels the file picker without selecting a file.
- UC3-E4a - Selected file is not a valid image.
- UC3-E5a - User wants to replace the current image.

**Rationale**: A hidden `<input type="file" accept="image/*">` is triggered programmatically by a visible "Choose image" button. On file selection, `FileReader.readAsDataURL()` converts the binary to a base64 data URL which is passed to `onConfigChange({ imageDataUrl })`. The `<img>` renders with `object-fit: contain`. If the `input` fires a `change` event with no file (cancelled), the existing `imageDataUrl` is left unchanged. Invalid images (e.g., a `.txt` file selected despite the accept filter) are detected by setting `<img onError>` and showing a recoverable error message inside the widget.

---

### Decision 7: File viewer uses `FileReader.readAsText`; content stored in `WidgetLayout.fileText`

**Addresses**:
- UC4-S2 - System opens the operating system's file picker.
- UC4-S3 - User selects a file and confirms.
- UC4-S4 - System reads the file's text content and renders it as scrollable text inside the widget.
- UC4-E3a - User cancels the file picker.
- UC4-E4a - File cannot be read (access error, binary content, or read failure).
- UC4-E5a - User wants to change the displayed file.

**Rationale**: A hidden `<input type="file">` (no accept filter — any file can be attempted) triggers `FileReader.readAsText()`. On success, text is stored as `fileText` and filename as `fileLabel` in `WidgetLayout` via `onConfigChange`. Content is displayed in a `<pre style={{ overflow: 'auto', height: '100%' }}>`. On `FileReader.onerror`, a recoverable error message is shown inside the widget with a re-select button.

---

### Decision 8: Webpage uses a sandboxed `<iframe>`; X-Frame-Options failures handled best-effort

**Addresses**:
- UC5-S1 - User activates the URL input control inside the widget.
- UC5-S2 - System presents an editable URL field pre-populated with the current URL (or empty if none is set).
- UC5-S3 - User enters or edits the URL and confirms.
- UC5-S4 - System loads the URL inside a sandboxed `<iframe>` within the widget.
- UC5-S5 - Webpage is displayed; user can interact with the embedded page normally.
- UC5-E3a - User confirms without entering a URL.
- UC5-E3b - User dismisses the URL input without confirming.
- UC5-E4a - The page refuses embedding (X-Frame-Options: DENY or SAMEORIGIN).
- UC5-E4b - The URL is malformed or the host is unreachable.
- UC5-E5a - User wants to change the URL.

**Rationale**: `WebpageContent` shows an inline URL input bar (always visible above the iframe, or shown on demand). On confirm, the URL is stored in `WidgetLayout.webpageUrl` via `onConfigChange` and an `<iframe>` is rendered with `sandbox="allow-scripts allow-same-origin allow-forms"`. If `webpageUrl` is empty, a placeholder is shown instead.

X-Frame-Options: browsers block the load silently — the iframe's `onLoad` fires but the content is blank. There is no reliable cross-origin way to detect this. The widget will show a static notice ("If the page appears blank, it may not allow embedding") beneath the URL bar as a soft warning. This is a known browser limitation, not a design defect.

---

### Decision 9: `widget-add` defaults new widgets to `type: "clock"`

**Addresses**:
- UC1-E5a - Selected type requires a source (image, file, or webpage) and none has been configured yet.

**Rationale**: Adding a widget always produces a fully renderable widget — clock requires no configuration. Users can immediately change the type via the settings panel.

---

## Risks / Trade-offs

- **Large image data URLs in state**: `imageDataUrl` is a base64 blob in React state. For very large images this increases state size and causes slow re-renders. → Mitigation: document a recommended size limit (< 2 MB); no enforcement in code at this stage.
- **File content not re-read on change**: `fileText` is a snapshot at selection time. If the file changes on disk, the widget does not update. → Acceptable for v1; a refresh button can be added later.
- **X-Frame-Options silent failures**: No reliable detection mechanism in the browser. → Mitigation: the soft "may not allow embedding" notice (see Decision 8).
- **BREAKING `type` field**: All existing `WidgetLayout` literal objects in tests and `App.tsx` must be updated to include `type`. → Mitigation: TypeScript will surface every missing `type` at compile time, making the migration mechanical.

---

## Migration Plan

1. Update `WidgetLayout` type in `types.ts` — TypeScript errors immediately surface all call sites.
2. Add `type: 'clock'` to every `WidgetLayout` literal in `App.tsx` and all test files.
3. Implement new components in order: `WidgetContent` dispatcher → `ClockContent` → `ImageContent` → `FileContent` → `WebpageContent` → `WidgetSettings`.
4. Wire `onConfigChange` into `DraggableWidget` and `App.tsx`.
5. No data migration needed — all data is in-memory React state.

---

## Open Questions

- Should the settings gear button be visible always, or only on hover? (Hover-only is cleaner but requires CSS hover state that is harder to test.)
- Should `fileText` be truncated at a character limit for very large files, or left unrestricted? (Unrestricted may cause rendering slowness for files > 1 MB.)
