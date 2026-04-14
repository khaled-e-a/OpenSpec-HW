# Tasks: widget-content-types

Generated: 2026-03-23

## Use Case Traceability

All tasks below reference steps from the centralized mapping in usecases.md.
Step descriptions are copied verbatim from that table.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User adds a clock widget or the dashboard loads with a saved clock widget |
| UC1-S2 | System renders the widget showing current hours, minutes, seconds, and date |
| UC1-S3 | System starts a 1-second interval timer internal to the widget |
| UC1-S4 | System updates the displayed time every second |
| UC1-S5 | User reads the current time from the widget |
| UC1-E1a1 | System restores the clock widget at its saved grid position on dashboard load |
| UC1-E1a2 | Clock begins ticking immediately — no configuration needed |
| UC1-E5a1 | System stops the 1-second timer when the clock widget is removed |
| UC2-S1 | User adds an image viewer widget |
| UC2-S2 | System renders the widget with an empty-state prompt: "Choose an image" |
| UC2-S3 | User activates the image source picker inside the widget |
| UC2-S4 | System presents two options: "Select file" and "Enter URL" |
| UC2-S5 | User selects a local image file via the browser file picker |
| UC2-S6 | System reads the file client-side, creates an object URL, and displays the image |
| UC2-S7 | System stores the image source reference in widget settings keyed by widget ID |
| UC2-S8 | User sees the image displayed at full-fit within the widget bounds |
| UC2-E4a1 | System shows a text input pre-populated with any previously saved URL |
| UC2-E4a2 | User types or pastes an image URL and confirms |
| UC2-E4a3 | System sets the image src to the entered URL |
| UC2-E6a1 | System displays an inline error: "Not a supported image format" |
| UC2-E8a1 | System displays an inline error: "Image could not be loaded" |
| UC2-E8b1 | User activates the image source picker to change the displayed image |
| UC3-S1 | User adds a file viewer widget |
| UC3-S2 | System renders the widget with an empty-state prompt: "Select a file to display" |
| UC3-S3 | User activates the file picker inside the widget |
| UC3-S4 | System opens the browser's native file picker |
| UC3-S5 | User selects a plain-text file |
| UC3-S6 | System reads the file contents via the File API |
| UC3-S7 | System displays the file contents as scrollable plain text inside the widget |
| UC3-S8 | System stores the file name in widget settings |
| UC3-S9 | User reads the file contents |
| UC3-E5a1 | Widget remains in empty-state prompt when user cancels the file picker |
| UC3-E6a1 | System displays an inline error: "File is not readable as text" |
| UC3-E6b1 | System displays an inline warning: "File is large — only the first 1 MB is shown" |
| UC3-E6b2 | System displays the first 1 MB of content |
| UC3-E9a1 | User activates the file picker again |
| UC3-E9b1 | System restores the widget at its saved position |
| UC3-E9b2 | Widget shows empty-state prompt with the saved file name as a hint: "Re-select '<filename>' to restore" |
| UC3-E9b3 | User must re-select the file (browser security prevents storing file paths) |
| UC4-S1 | User adds a webpage viewer widget |
| UC4-S2 | System renders the widget with a URL input and empty-state prompt: "Enter a URL to embed" |
| UC4-S3 | User types or pastes a URL into the input field |
| UC4-S4 | User submits the URL |
| UC4-S5 | System validates that the entered value is a well-formed URL |
| UC4-S6 | System sets the src of a sandboxed iframe to the validated URL |
| UC4-S7 | System saves the URL in widget settings keyed by widget ID |
| UC4-S8 | The target page loads inside the iframe |
| UC4-S9 | User browses or monitors the embedded page |
| UC4-E4a1 | System pre-fills URL input with saved URL on dashboard load |
| UC4-E4a2 | System immediately loads the page in the iframe from saved URL |
| UC4-E5a1 | System displays inline error: "Please enter a valid URL (include https://)" |
| UC4-E8a1 | System detects the blocked embed (e.g., via iframe error or load event heuristic) |
| UC4-E8a2 | System displays a fallback overlay: "This page cannot be embedded" |
| UC4-E8a3 | System shows a "Open in new tab" link pointing to the URL |
| UC4-E8a4 | The URL remains saved for the next session |
| UC4-E9a1 | User updates the URL input with a new URL |
| UC5-S1 | User activates the source-change control on a configured widget |
| UC5-S2 | System opens the appropriate picker or input for the widget type |
| UC5-S3 | User selects or enters the new source |
| UC5-S4 | System replaces the displayed content with the new source |
| UC5-S5 | System updates widget settings in localStorage with the new source reference |
| UC5-S6 | User sees the widget displaying the new content |
| UC5-E3a1 | Widget retains its current content and source when user cancels |
| UC6-S1 | User reloads the dashboard |
| UC6-S2 | System reads dashboard-widget-settings from localStorage |
| UC6-S3 | System validates the settings map against currently registered widget IDs |
| UC6-S4 | System renders clock widgets immediately with no settings needed |
| UC6-S5 | System loads image viewer widgets from saved URL source |
| UC6-S6 | System loads webpage viewer widgets from saved URL |
| UC6-S7 | System shows file viewer widgets in empty-state with saved file name hint |
| UC6-S8 | Dashboard appears with all previously configured widgets restored |
| UC6-E2a1 | System uses empty settings map when no settings found in localStorage |
| UC6-E2b1 | System logs a console warning and falls back to empty settings on corrupt data |
| UC6-E3a1 | System silently discards settings entries for widget IDs no longer in the layout |
| UC6-E5a1 | System shows inline error and source-change control when saved image URL fails |

---

## Group 1: Types and Registry

- [x] 1.1 Update `src/widgets/types.ts` — add optional `settings?: WidgetSettings` and `onSettingsChange?: (settings: WidgetSettings) => void` fields to `WidgetContentProps` (Addresses: UC2-S7, UC3-S8, UC4-S7, UC5-S5)
- [x] 1.2 Define `WidgetSettings` discriminated union type in `src/widgets/types.ts`: variants for `clock`, `image-viewer` (url|file mode), `file-viewer` (fileName), `webpage-viewer` (url) (Addresses: UC6-S2, UC6-S3)
- [x] 1.3 Remove `text-card`, `metric-card`, `chart-placeholder` entries from `WIDGET_REGISTRY` in `src/widgets/registry.ts` (Addresses: UC6-E3a1)
- [x] 1.4 Register `clock` (2×1) in `WIDGET_REGISTRY` with `ClockWidget` as component (Addresses: UC1-S1, UC1-E1a2)
- [x] 1.5 Register `image-viewer` (3×2) in `WIDGET_REGISTRY` with `ImageViewerWidget` as component (Addresses: UC2-S1)
- [x] 1.6 Register `file-viewer` (3×2) in `WIDGET_REGISTRY` with `FileViewerWidget` as component (Addresses: UC3-S1)
- [x] 1.7 Register `webpage-viewer` (4×3) in `WIDGET_REGISTRY` with `WebpageViewerWidget` as component (Addresses: UC4-S1)
- [x] 1.8 Update `DEFAULT_LAYOUT` to contain one of each new type at non-overlapping grid positions (Addresses: UC1-S1, UC1-E1a1)
- [x] 1.9 Update `DEFAULT_TYPE_MAP` to map default widget IDs to new type keys (Addresses: UC1-S1)
- [x] 1.10 Delete stub widget component files: `TextCardWidget.tsx`, `MetricCardWidget.tsx`, `ChartPlaceholderWidget.tsx` (or repurpose as needed) (Addresses: UC6-E3a1)

---

## Group 2: Settings Persistence — `useDashboardLayout`

- [x] 2.1 Add `widgetSettings` state (`Record<string, WidgetSettings>`) to `useDashboardLayout` hook (Addresses: UC6-S2, UC6-S3)
- [x] 2.2 Implement `loadSettings()` function: read `dashboard-widget-settings` from localStorage, JSON.parse with try/catch fallback to `{}`, log warning on corrupt data (Addresses: UC6-S2, UC6-E2a1, UC6-E2b1)
- [x] 2.3 On load, prune settings entries whose widget ID is absent from the restored layout (stale-ID pruning) (Addresses: UC6-S3, UC6-E3a1)
- [x] 2.4 Implement `updateWidgetSettings(id: string, settings: WidgetSettings)` mutation that updates `widgetSettings` state (Addresses: UC5-S5, UC2-S7, UC3-S8, UC4-S7)
- [x] 2.5 Add debounced `useEffect` (300ms) to write `widgetSettings` to localStorage key `dashboard-widget-settings` whenever it changes (Addresses: UC6-S1, UC6-S8)
- [x] 2.6 Expose `widgetSettings` and `updateWidgetSettings` from hook return value (Addresses: UC6-S4, UC6-S5, UC6-S6, UC6-S7)
- [x] 2.7 Pass `settings={widgetSettings[id]}` and `onSettingsChange={(s) => updateWidgetSettings(id, s)}` through `Widget.tsx` → `WidgetSlot.tsx` → widget component (Addresses: UC2-S7, UC3-S8, UC4-S7, UC5-S5)

---

## Group 3: Clock Widget

- [x] 3.1 Create `src/widgets/ClockWidget.tsx` — function component accepting `WidgetContentProps` (Addresses: UC1-S1, UC1-E1a2)
- [x] 3.2 Implement `useState<Date>` initialised to `new Date()` for current time (Addresses: UC1-S2)
- [x] 3.3 Implement `useEffect` that calls `setInterval(() => setTime(new Date()), 1000)` and returns `clearInterval` as cleanup (Addresses: UC1-S3, UC1-S4, UC1-E5a1)
- [x] 3.4 Render formatted time using `toLocaleTimeString()` (shows HH:MM:SS in locale format) (Addresses: UC1-S2, UC1-S5)
- [x] 3.5 Render formatted date using `toLocaleDateString()` below the time (Addresses: UC1-S2, UC1-S5)
- [x] 3.6 Verify no settings panel or picker UI is rendered in the clock widget (Addresses: UC1-E1a2)
- [x] 3.7 Add CSS for clock widget: centered large time text, smaller date below, fills widget cell (Addresses: UC1-S5)

---

## Group 4: Image Viewer Widget

- [x] 4.1 Create `src/widgets/ImageViewerWidget.tsx` — function component accepting `WidgetContentProps` with `settings` and `onSettingsChange` (Addresses: UC2-S1)
- [x] 4.2 Render empty-state prompt "Choose an image" with a picker-open button when `settings` is absent or source not yet set (Addresses: UC2-S2)
- [x] 4.3 Render source-picker UI (two buttons: "Select file" / "Enter URL") when picker is open (Addresses: UC2-S3, UC2-S4)
- [x] 4.4 Implement file selection: hidden `<input type="file" accept="image/*">` triggered on "Select file" click (Addresses: UC2-S5)
- [x] 4.5 On file selection, validate `file.type.startsWith('image/')` — show inline error "Not a supported image format" if false (Addresses: UC2-E6a1)
- [x] 4.6 On valid file selection, call `URL.createObjectURL(file)` and set as `<img>` src (Addresses: UC2-S6, UC2-S8)
- [x] 4.7 Call `onSettingsChange({ type: 'image-viewer', source: 'file' })` after file selection (blob URL not persisted) (Addresses: UC2-S7)
- [x] 4.8 Implement URL entry: show text input pre-populated with `settings.url` if `source === 'url'` (Addresses: UC2-E4a1, UC2-E4a2)
- [x] 4.9 On URL confirm, set `<img>` src to entered URL and call `onSettingsChange({ type: 'image-viewer', source: 'url', url })` (Addresses: UC2-E4a3, UC2-S7)
- [x] 4.10 Add `<img onError>` handler that shows inline error "Image could not be loaded" and re-displays source-change control (Addresses: UC2-E8a1)
- [x] 4.11 Render `<img>` with `style={{ width:'100%', height:'100%', objectFit:'contain' }}` for full-fit display (Addresses: UC2-S8)
- [x] 4.12 Show "Change image" control when image is displayed, re-opening the picker on click (Addresses: UC2-E8b1, UC5-S1, UC5-S2)
- [x] 4.13 Preserve current image/source if user cancels picker without selecting (Addresses: UC5-E3a1)
- [x] 4.14 On mount, if `settings.source === 'url'`, set img src to `settings.url` immediately (Addresses: UC6-S5)
- [x] 4.15 Add `useEffect` cleanup to call `URL.revokeObjectURL(blobUrl)` when blob URL is replaced or component unmounts (Addresses: UC2-S6)

---

## Group 5: File Viewer Widget

- [x] 5.1 Create `src/widgets/FileViewerWidget.tsx` — function component accepting `WidgetContentProps` with `settings` and `onSettingsChange` (Addresses: UC3-S1)
- [x] 5.2 Render empty-state prompt "Select a file to display" with a "Select file" button when no file is loaded (Addresses: UC3-S2)
- [x] 5.3 If `settings.fileName` exists on mount, render hint "Re-select '<fileName>' to restore" alongside the empty-state prompt (Addresses: UC3-E9b1, UC3-E9b2, UC3-E9b3, UC6-S7)
- [x] 5.4 Implement file selection: hidden `<input type="file">` (no accept filter) triggered on button click (Addresses: UC3-S3, UC3-S4)
- [x] 5.5 On file selection, check `file.size` — if > 1,048,576 bytes, slice to first 1 MB and set a `truncated` flag (Addresses: UC3-E6b1, UC3-E6b2)
- [x] 5.6 Read file using `FileReader.readAsText(fileOrSlice)` asynchronously (Addresses: UC3-S5, UC3-S6)
- [x] 5.7 On `FileReader` `error` event, show inline error "File is not readable as text" and return to empty-state prompt (Addresses: UC3-E6a1)
- [x] 5.8 On successful read, display the text content in a `<pre>` or scrollable `<div>` with `white-space: pre-wrap; overflow: auto; font-family: monospace` (Addresses: UC3-S7, UC3-S9)
- [x] 5.9 If `truncated` flag is set, render warning banner "File is large — only the first 1 MB is shown" above the content (Addresses: UC3-E6b1, UC3-E6b2)
- [x] 5.10 Call `onSettingsChange({ type: 'file-viewer', fileName: file.name })` after successful read (Addresses: UC3-S8)
- [x] 5.11 If user cancels file picker (no file selected), preserve current state unchanged (Addresses: UC3-E5a1)
- [x] 5.12 Show "Select a different file" control when file content is displayed; activating it re-opens the file picker (Addresses: UC5-S1, UC5-S2, UC5-S3, UC5-S4)
- [x] 5.13 Preserve current content if user cancels the re-selection picker (Addresses: UC5-E3a1)

---

## Group 6: Webpage Viewer Widget

- [x] 6.1 Create `src/widgets/WebpageViewerWidget.tsx` — function component accepting `WidgetContentProps` with `settings` and `onSettingsChange` (Addresses: UC4-S1)
- [x] 6.2 Render URL text input and empty-state prompt "Enter a URL to embed" when no URL is configured (Addresses: UC4-S2)
- [x] 6.3 If `settings.url` exists on mount, pre-populate the URL input and set the iframe `src` immediately (Addresses: UC4-E4a1, UC4-E4a2, UC6-S6)
- [x] 6.4 Handle Enter key and "Go" button click to trigger URL submission (Addresses: UC4-S3, UC4-S4)
- [x] 6.5 Validate submitted URL using `new URL(value)` in a try/catch; show inline error "Please enter a valid URL (include https://)" on failure (Addresses: UC4-S5, UC4-E5a1)
- [x] 6.6 On valid URL, set `<iframe>` `src` to the URL (Addresses: UC4-S6, UC4-S8)
- [x] 6.7 Render iframe with `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"` attribute (Addresses: UC4-S6, UC4-S9)
- [x] 6.8 Attempt embed-blocked detection: on iframe `load`, try accessing `iframe.contentDocument`; if a cross-origin `SecurityError` is thrown, show the fallback overlay (Addresses: UC4-E8a1, UC4-E8a2)
- [x] 6.9 Render fallback overlay: text "This page cannot be embedded" and an `<a href={url} target="_blank">Open in new tab</a>` link (Addresses: UC4-E8a2, UC4-E8a3, UC4-E8a4)
- [x] 6.10 Call `onSettingsChange({ type: 'webpage-viewer', url })` after valid URL submission (Addresses: UC4-S7, UC5-S5)
- [x] 6.11 Keep URL input always visible and editable while iframe is loaded, enabling URL change at any time (Addresses: UC5-S1, UC5-S2, UC5-S3, UC5-S4)
- [x] 6.12 If user clears input without submitting, iframe continues to display the previous page (Addresses: UC5-E3a1)

---

## Group 7: Settings Persistence Integration

- [x] 7.1 Add `widgetSettings` and `updateWidgetSettings` to `DashboardGrid.tsx` destructure from `useDashboardLayout` (Addresses: UC6-S2, UC6-S8)
- [x] 7.2 Pass `settings` and `onSettingsChange` props down through `WidgetSlot` → `Widget` → widget content component (Addresses: UC6-S4, UC6-S5, UC6-S6, UC6-S7)
- [x] 7.3 Verify clock widget receives `settings` prop but does not use it (no-op) (Addresses: UC6-S4, UC1-E1a2)
- [x] 7.4 Write unit test: `loadSettings()` returns `{}` when localStorage key absent (Addresses: UC6-E2a1)
- [x] 7.5 Write unit test: `loadSettings()` returns `{}` and logs warning when data is corrupt JSON (Addresses: UC6-E2b1)
- [x] 7.6 Write unit test: stale widget ID in settings is pruned after load (Addresses: UC6-E3a1)
- [x] 7.7 Write unit test: `updateWidgetSettings` updates state and triggers debounced localStorage write (Addresses: UC5-S5, UC6-S8)

---

## Group 8: Styling

- [x] 8.1 Add CSS for clock widget: centered layout, large `font-size` for time, smaller for date, overflow hidden (Addresses: UC1-S5)
- [x] 8.2 Add CSS for image viewer: empty-state centered, `<img>` fills cell with `object-fit: contain`, error text in red (Addresses: UC2-S2, UC2-S8, UC2-E6a1, UC2-E8a1)
- [x] 8.3 Add CSS for file viewer: empty-state and hint text centered, scrollable `<pre>` fills remaining widget height, warning banner styled distinctly (Addresses: UC3-S2, UC3-S7, UC3-E6b1, UC3-E9b2)
- [x] 8.4 Add CSS for webpage viewer: URL input bar at top, iframe fills remaining widget height, fallback overlay positioned absolutely over iframe (Addresses: UC4-S2, UC4-S8, UC4-E8a2)
- [x] 8.5 Add CSS for source-change controls: subtle hover-reveal overlay on image/file/webpage widgets (Addresses: UC2-E8b1, UC5-S1, UC5-S2)

---

## Group 9: Widget Component Prop Wiring in `Widget.tsx`

- [x] 9.1 Update `Widget.tsx` to accept and forward `settings` and `onSettingsChange` props to the rendered content component (Addresses: UC2-S7, UC3-S8, UC4-S7, UC5-S5)
- [x] 9.2 Verify that `WidgetDefinition.component` typing in `types.ts` accepts `settings` and `onSettingsChange` as optional props (Addresses: UC1-E1a2)

---

## Group 10: Remove Stale Tests and Update Existing Tests

- [x] 10.1 Update `src/App.test.tsx` — update snapshot/render test to expect new widget type names (clock, image-viewer, file-viewer, webpage-viewer) instead of stubs (Addresses: UC6-E3a1)
- [x] 10.2 Update `src/hooks/useDashboardLayout.test.ts` — update tests that reference `text-card`, `metric-card`, or `chart-placeholder` default types to use new type keys (Addresses: UC6-S3)
- [x] 10.3 Delete or repurpose test files for stub widget components if they exist (Addresses: UC6-E3a1)

---

## Group 11: Final Verification

- [x] 11.1 Run `npm test` — verify all 52+ existing tests pass and new tests pass (Addresses: all)
- [x] 11.2 Manual smoke test: add clock widget — verify time ticks, timer stops on remove (Addresses: UC1-S2, UC1-S4, UC1-E5a1)
- [x] 11.3 Manual smoke test: add image viewer — select local file, confirm displayed; reload page, confirm empty-state shown (Addresses: UC2-S6, UC2-S8)
- [x] 11.4 Manual smoke test: add image viewer — enter URL, confirm image loads; reload, confirm image restores (Addresses: UC2-E4a3, UC6-S5)
- [x] 11.5 Manual smoke test: add file viewer — select text file, confirm content shown; reload, confirm hint shown (Addresses: UC3-S7, UC3-E9b2)
- [x] 11.6 Manual smoke test: add webpage viewer — enter `https://example.com`, confirm iframe loads; reload, confirm auto-restores (Addresses: UC4-S8, UC4-E4a2)
- [x] 11.7 Manual smoke test: enter invalid URL in webpage viewer — confirm inline error shown (Addresses: UC4-E5a1)
- [x] 11.8 Manual smoke test: drag and resize all four new widget types — confirm no regressions in grid behaviour (Addresses: UC6-S3)
- [x] 11.9 Verify `localStorage` contains `dashboard-widget-settings` after configuring image-viewer and webpage-viewer widgets (Addresses: UC6-S8)
- [x] 11.10 Verify old layout with stub types is discarded gracefully on first load with new code (Addresses: UC6-E3a1)
