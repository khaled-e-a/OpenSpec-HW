## Implementation Overview

This task list implements the widget-types change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability

This implementation addresses the following use case steps:

- UC1-S1: User opens the dashboard
- UC1-S2: System renders clock widget with current local time (HH:MM:SS)
- UC1-S3: System updates the clock display every second
- UC1-E4a1: System resumes live updates after tab navigation
- UC2-S1: User sees image widget (placeholder or previously chosen image)
- UC2-S2: User opens the image widget config panel
- UC2-S3: System shows file picker accepting image files
- UC2-S4: User selects an image file
- UC2-S5: System reads the file and generates an object URL
- UC2-S6: System renders the selected image filling the widget area
- UC2-S7: User closes the config panel
- UC2-E3a1: System retains previous image when file picker is cancelled
- UC2-E4a1: System shows error for non-image file selection
- UC3-S1: User sees file widget (placeholder or previously loaded file contents)
- UC3-S2: User opens the file widget config panel
- UC3-S3: System shows file picker accepting any file
- UC3-S4: User selects a file
- UC3-S5: System reads the file as UTF-8 text
- UC3-S6: System renders file contents in scrollable monospace area
- UC3-S7: User reads the file and closes the config panel
- UC3-E3a1: System retains previous contents when file picker is cancelled
- UC3-E5a1: System shows error for unreadable (binary) file
- UC3-E5b1: System truncates content at 10 000 chars with a notice
- UC4-S1: User sees webpage widget (URL prompt or embedded page)
- UC4-S2: User opens the webpage widget config panel
- UC4-S3: System shows URL input field pre-filled with current URL
- UC4-S4: User enters or pastes a URL and confirms
- UC4-S5: System validates the URL is well-formed
- UC4-S6: System renders iframe pointing to the supplied URL
- UC4-S7: User views embedded webpage and closes the config panel
- UC4-E4a1: System removes iframe and shows placeholder when URL is cleared
- UC4-E5a1: System shows validation error for malformed URL
- UC4-E6a1: Browser blocks iframe; system shows helper note about embedding restrictions
- UC4-E6b1: System prepends "https://" to scheme-less URL before loading
- UC5-S1: User clicks settings icon on a widget
- UC5-S2: System opens inline config panel on the widget
- UC5-S3: System shows appropriate control (file picker or URL input) per widget type
- UC5-S4: User selects a new file or enters a new URL
- UC5-S5: System updates the widget content config
- UC5-S6: System re-renders the widget with new content
- UC5-S7: System closes the config panel
- UC5-E4a1: System closes config panel; content unchanged when user cancels
- UC5-E5a1: System shows inline validation error; content unchanged until valid source provided

---

## 1. Data Model Extension

- [x] 1.1 Add `WidgetType` union type (`'clock' | 'image' | 'file' | 'webpage'`) and `WidgetConfig` interface to `src/utils/gridGeometry.ts` (Addresses: UC1-S2, UC2-S1, UC3-S1, UC4-S1)
- [x] 1.2 Add optional `type?: WidgetType` and `config?: WidgetConfig` fields to the `WidgetLayout` interface in `src/utils/gridGeometry.ts` — ensure geometry functions ignore these fields (Addresses: UC5-S5)
- [x] 1.3 Update `src/App.tsx` initial layout to assign one widget of each type: `analytics` → `clock`, `status` → `image`, `chart` → `file`, `activity` → `webpage`, `metrics` → `clock` (Addresses: UC1-S1, UC2-S1, UC3-S1, UC4-S1)

---

## 2. Clock Widget

- [x] 2.1 Create `src/components/widgets/ClockWidget.tsx`: render current local time in HH:MM:SS using `toLocaleTimeString('en-GB', { hour12: false })` (Addresses: UC1-S2)
- [x] 2.2 Add `setInterval` (1 000 ms) in `useEffect` to update time state every second; clear interval on unmount (Addresses: UC1-S3)

---

## 3. Image Widget

- [x] 3.1 Create `src/components/widgets/ImageWidget.tsx`: render placeholder text "Click to choose image" when `config.imageUrl` is absent; render `<img src={config.imageUrl}>` with `object-fit: cover` when present (Addresses: UC2-S1, UC2-S6)
- [x] 3.2 Add settings icon (⚙) button that toggles `isConfigOpen` state; render inline config panel when open (Addresses: UC2-S2, UC5-S1, UC5-S2)
- [x] 3.3 Inside config panel render `<input type="file" accept="image/*">` for image selection (Addresses: UC2-S3)
- [x] 3.4 On file selection: check `file.type.startsWith('image/')` — if not, show inline error and return without updating (Addresses: UC2-E4a1, UC5-E5a1)
- [x] 3.5 On valid image file: call `URL.createObjectURL(file)`, revoke previous object URL if any, invoke `onConfigChange({ imageUrl })` (Addresses: UC2-S4, UC2-S5, UC5-S5, UC5-S6)
- [x] 3.6 On config panel cancel / close / Escape: discard draft and close panel without changing `config` (Addresses: UC2-E3a1, UC2-S7, UC5-E4a1, UC5-S7)

---

## 4. File Widget

- [x] 4.1 Create `src/components/widgets/FileWidget.tsx`: render placeholder "Click to choose file" when `config.fileText` is absent; render contents in `<pre style={{ overflow: 'auto', fontFamily: 'monospace' }}>` when present (Addresses: UC3-S1, UC3-S6)
- [x] 4.2 Add settings icon button and inline config panel with `<input type="file">` (no accept restriction) (Addresses: UC3-S2, UC3-S3, UC5-S1, UC5-S2, UC5-S3)
- [x] 4.3 On file selection: use `FileReader.readAsText` to read the file as UTF-8; invoke `onConfigChange` with text and file name on load success (Addresses: UC3-S4, UC3-S5, UC5-S5, UC5-S6)
- [x] 4.4 If `FileReader` fires `onerror`: show inline error "File could not be read as text." and do not update config (Addresses: UC3-E5a1, UC5-E5a1)
- [x] 4.5 After reading: if text length > 10 000 characters, truncate to 10 000 and append notice "Showing first 10 000 characters." before invoking `onConfigChange` (Addresses: UC3-E5b1)
- [x] 4.6 On config panel cancel / close / Escape: discard draft; leave existing content unchanged (Addresses: UC3-E3a1, UC3-S7, UC5-E4a1, UC5-S7)

---

## 5. Webpage Widget

- [x] 5.1 Create `src/components/widgets/WebpageWidget.tsx`: render URL-entry prompt when `config.webpageUrl` is absent; render `<iframe src={config.webpageUrl} sandbox="allow-scripts allow-same-origin allow-forms">` plus static helper note when URL is set (Addresses: UC4-S1, UC4-S6, UC4-E6a1)
- [x] 5.2 Add settings icon button and inline config panel with URL text input pre-filled with current `config.webpageUrl` (or blank) (Addresses: UC4-S2, UC4-S3, UC5-S1, UC5-S2, UC5-S3)
- [x] 5.3 On URL confirm: if input is empty, invoke `onConfigChange({ webpageUrl: '' })` to clear the iframe (Addresses: UC4-E4a1)
- [x] 5.4 On URL confirm with non-empty value: prepend `https://` if no scheme present; attempt `new URL(value)` — if it throws, show inline error "Please enter a valid URL (e.g., https://example.com)" and do not update config (Addresses: UC4-S4, UC4-S5, UC4-E5a1, UC4-E6b1, UC5-S5)
- [x] 5.5 On valid URL: invoke `onConfigChange({ webpageUrl: validatedUrl })` to update the iframe; close config panel (Addresses: UC4-S6, UC4-S7, UC5-S6, UC5-S7)
- [x] 5.6 On config panel cancel / close / Escape: discard draft; leave existing URL and iframe unchanged (Addresses: UC5-E4a1, UC5-S7)

---

## 6. WidgetContent Dispatcher

- [x] 6.1 Create `src/components/WidgetContent.tsx`: accept `type`, `config`, and `onConfigChange` props; switch on `type` to render `ClockWidget`, `ImageWidget`, `FileWidget`, or `WebpageWidget`; default to `ClockWidget` when type is absent (Addresses: UC1-S2, UC2-S1, UC3-S1, UC4-S1)
- [x] 6.2 Wire `onConfigChange` in `WidgetContent` to call the parent callback with the updated `WidgetConfig` payload (Addresses: UC5-S5, UC5-S6)

---

## 7. DraggableWidget + DashboardGrid Wiring

- [x] 7.1 Update `src/components/DraggableWidget.tsx` to accept `type`, `config`, and `onConfigChange` props and render `<WidgetContent>` instead of `{children ?? id}` (Addresses: UC2-S6, UC3-S6, UC4-S6, UC5-S6)
- [x] 7.2 Update `src/components/DashboardGrid.tsx` to pass `type`, `config`, and an `onConfigChange` handler through to each `DraggableWidget`; the handler updates the matching entry in layout state (Addresses: UC5-S5, UC5-S6)

---

## 8. Config Panel UX (shared behaviour)

- [x] 8.1 Implement Escape key listener in each content component's config panel to close and discard draft (Addresses: UC5-S7, UC5-E4a1, UC2-S7, UC3-S7, UC4-S7)
- [x] 8.2 Ensure clock widget renders no settings icon and no config panel (Addresses: UC5-S3 — clock has no config)
