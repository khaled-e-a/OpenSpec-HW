## Implementation Overview

This task list implements the widget-content-types change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability

This implementation addresses the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User activates the settings control on a widget |
| UC1-S2 | System opens a settings panel showing the current type and the four available types |
| UC1-S3 | User selects a content type |
| UC1-S4 | System updates the widget to the selected type and closes the settings panel |
| UC1-S5 | Widget renders the new content type immediately |
| UC1-E3a | User selects the same type already active — system makes no change |
| UC1-E3b | User dismisses the settings panel without selecting — widget type unchanged |
| UC1-E5a | Selected type requires a source but none is configured — system renders placeholder state |
| UC2-S1 | System renders the widget using the clock content component |
| UC2-S2 | System displays the current local time in a readable format |
| UC2-S3 | System refreshes the displayed time every second |
| UC3-S1 | User activates the file-selection control inside the image widget |
| UC3-S2 | System opens the OS file picker filtered to image file types |
| UC3-S3 | User selects an image file and confirms |
| UC3-S4 | System reads the selected image and renders it inside the widget, scaled to fit |
| UC3-S5 | System retains the image source for subsequent renders |
| UC3-E3a | User cancels the file picker — widget remains in its current state |
| UC3-E4a | Selected file is not a valid image — system shows error and prompts re-selection |
| UC3-E5a | User replaces the current image by re-activating the file-selection control |
| UC4-S1 | User activates the file-selection control inside the file viewer widget |
| UC4-S2 | System opens the OS file picker |
| UC4-S3 | User selects a file and confirms |
| UC4-S4 | System reads the file's text content and renders it as scrollable text inside the widget |
| UC4-S5 | System retains the file reference for subsequent renders |
| UC4-E3a | User cancels the file picker — widget remains in its current state |
| UC4-E4a | File cannot be read — system shows error and prompts re-selection |
| UC4-E5a | User changes the displayed file by re-activating the file-selection control |
| UC5-S1 | User activates the URL input control inside the webpage widget |
| UC5-S2 | System presents an editable URL field |
| UC5-S3 | User enters or edits the URL and confirms |
| UC5-S4 | System loads the URL in a sandboxed iframe within the widget |
| UC5-S5 | Webpage is displayed; user can interact with the embedded page |
| UC5-E3a | User confirms without entering a URL — system removes iframe and shows placeholder |
| UC5-E3b | User dismisses the URL input without confirming — widget unchanged |
| UC5-E4a | Page refuses embedding — system shows error and presents URL input |
| UC5-E4b | URL is malformed or unreachable — system shows load-error and presents URL input |
| UC5-E5a | User changes the URL by re-activating the URL input control |

---

## 1. Data Model

- [x] 1.1 Add `WidgetType = 'clock' | 'image' | 'file' | 'webpage'` union type to `src/components/dashboard/types.ts` (Addresses: UC1-S4)
- [x] 1.2 Add mandatory `type: WidgetType` field and optional config fields (`imageDataUrl?`, `fileText?`, `fileLabel?`, `webpageUrl?`) to the `WidgetLayout` interface in `types.ts` (Addresses: UC1-S4, UC3-S5, UC4-S5, UC5-S3)
- [x] 1.3 Add `type: 'clock'` to every existing `WidgetLayout` literal in `App.tsx` and all test files to satisfy the BREAKING type requirement (Addresses: UC1-S4)

---

## 2. Settings Panel and Config Callback

- [x] 2.1 Add `onConfigChange?: (updates: Partial<WidgetLayout>) => void` prop to `DraggableWidget` (Addresses: UC1-S3, UC1-S4)
- [x] 2.2 Wire `onConfigChange` in `App.tsx`: merge the partial update into the matching layout entry and call `setLayout` (Addresses: UC1-S4)
- [x] 2.3 Create `src/components/dashboard/WidgetSettings.tsx`: renders an absolutely-positioned overlay showing all four type options with the current type highlighted; calls `onConfigChange({ type })` and closes on selection; closes without change on dismiss; calls `e.stopPropagation()` on pointerDown to prevent drag (Addresses: UC1-S1, UC1-S2, UC1-S3, UC1-E3a, UC1-E3b)
- [x] 2.4 Add a settings toggle button (⚙) to `DraggableWidget` with local `settingsOpen` boolean state; renders `<WidgetSettings>` when open; button calls `e.stopPropagation()` on pointerDown (Addresses: UC1-S1, UC1-E3b)

---

## 3. Content Dispatcher

- [x] 3.1 Create `src/components/dashboard/WidgetContent.tsx`: accepts full `WidgetLayout` entry and `onConfigChange`; renders `ClockContent`, `ImageContent`, `FileContent`, or `WebpageContent` based on `type` (Addresses: UC1-S5, UC2-S1)
- [x] 3.2 Render `<WidgetContent>` inside `DraggableWidget` in place of the current `{children}` placeholder, passing the layout entry and `onConfigChange` (Addresses: UC1-S5)

---

## 4. Clock Content

- [x] 4.1 Create `src/components/dashboard/content/ClockContent.tsx`: uses `useState<Date>` and `useEffect` with `setInterval(1000)` to update every second; clears interval on unmount; displays time via `date.toLocaleTimeString()` (Addresses: UC2-S1, UC2-S2, UC2-S3)

---

## 5. Image Content

- [x] 5.1 Create `src/components/dashboard/content/ImageContent.tsx`: renders a "Choose image" button wired to a hidden `<input type="file" accept="image/*">`; on file selection reads via `FileReader.readAsDataURL` and calls `onConfigChange({ imageDataUrl })`; if `imageDataUrl` is set renders `<img>` with `object-fit: contain`; if no image is set renders "No image selected" placeholder (Addresses: UC3-S1, UC3-S2, UC3-S3, UC3-S4, UC3-E5a, UC1-E5a)
- [x] 5.2 Preserve current image when file picker is cancelled (no `change` event fires without selection) (Addresses: UC3-E3a)
- [x] 5.3 Handle invalid image files via `<img onError>`: display "Cannot display file — not a valid image" and keep the file-selection control accessible (Addresses: UC3-E4a)
- [x] 5.4 Ensure `onConfigChange({ imageDataUrl })` is called so the data URL is stored in layout state and survives re-renders (Addresses: UC3-S5)

---

## 6. File Viewer Content

- [x] 6.1 Create `src/components/dashboard/content/FileContent.tsx`: renders a "Choose file" button wired to a hidden `<input type="file">`; on selection reads via `FileReader.readAsText` and calls `onConfigChange({ fileText, fileLabel: file.name })`; if `fileText` is set renders content in a scrollable `<pre>` with `fileLabel` as a header; if no file is set renders "No file selected" placeholder (Addresses: UC4-S1, UC4-S2, UC4-S3, UC4-S4, UC4-E5a, UC1-E5a)
- [x] 6.2 Preserve current content when file picker is cancelled (Addresses: UC4-E3a)
- [x] 6.3 Handle `FileReader.onerror`: display "Cannot display file — check permissions or file type" and keep the file-selection control accessible (Addresses: UC4-E4a)
- [x] 6.4 Ensure `onConfigChange({ fileText, fileLabel })` is called so content persists across re-renders (Addresses: UC4-S5)

---

## 7. Webpage Content

- [x] 7.1 Create `src/components/dashboard/content/WebpageContent.tsx`: renders a URL input bar; on confirm calls `onConfigChange({ webpageUrl })`; if `webpageUrl` is set renders a sandboxed `<iframe src={webpageUrl} sandbox="allow-scripts allow-same-origin allow-forms">`; if URL is empty renders "No URL set" placeholder; always shows soft embedding warning (Addresses: UC5-S1, UC5-S2, UC5-S3, UC5-S4, UC5-S5, UC5-E3a, UC5-E5a, UC1-E5a)
- [x] 7.2 Dismiss URL input without committing on Escape or blur (Addresses: UC5-E3b)
- [x] 7.3 Handle iframe `onError` event: display "Page could not be loaded — it may not allow embedding" and keep URL input accessible (Addresses: UC5-E4a, UC5-E4b)
- [x] 7.4 Ensure `onConfigChange({ webpageUrl })` is called so the URL persists across re-renders (Addresses: UC5-E5a)

---

## 8. App.tsx Migration

- [x] 8.1 Update `handleAddWidget` in `App.tsx` to assign `type: 'clock'` to every newly created `WidgetLayout` entry (Addresses: UC1-E5a)
- [x] 8.2 Update the initial `layout` state in `App.tsx` to include `type: 'clock'` on all seed widgets (Addresses: UC1-S4)
- [x] 8.3 Wire `onConfigChange` on every `<DraggableWidget>` in `App.tsx`: merge partial into the matching layout entry by `id` and call `setLayout` + `onLayoutChange` (Addresses: UC1-S4, UC3-S5, UC4-S5, UC5-S3)

---

## 9. Tests

- [x] 9.1 Unit test `ClockContent`: mounts and renders a time string; time string updates after 1 second (fake timers) (Addresses: UC2-S1, UC2-S2, UC2-S3)
- [x] 9.2 Unit test `WidgetContent` dispatcher: renders `ClockContent` for `type:'clock'`; renders placeholders for `type:'image'`/`'file'`/`'webpage'` when no config is set (Addresses: UC1-S5, UC1-E5a)
- [x] 9.3 Component test for `WidgetSettings`: shows all four types; highlights current type; calling a different type invokes `onConfigChange`; re-selecting active type does not invoke `onConfigChange`; dismiss does not invoke `onConfigChange` (Addresses: UC1-S2, UC1-S3, UC1-E3a, UC1-E3b)
- [x] 9.4 Component test for `ImageContent`: "No image selected" placeholder shown initially; file input accepts `image/*`; `onConfigChange` called with `imageDataUrl` after valid selection; error message shown on `img onError` (Addresses: UC3-S1, UC3-S4, UC3-E4a)
- [x] 9.5 Component test for `FileContent`: "No file selected" placeholder shown initially; `onConfigChange` called with `fileText` and `fileLabel` after selection; error message shown on `FileReader` error (Addresses: UC4-S1, UC4-S4, UC4-E4a)
- [x] 9.6 Component test for `WebpageContent`: "No URL set" placeholder shown initially; iframe rendered after URL confirmed; `onConfigChange` called with `webpageUrl`; empty URL clears iframe (Addresses: UC5-S4, UC5-E3a)
- [x] 9.7 Integration test: settings toggle opens panel; selecting a new type calls `onConfigChange` and closes panel; settings toggle does not initiate drag (Addresses: UC1-S1, UC1-S3, UC1-S4)
