## Context

The dashboard currently ships with three non-functional stub widget types (`text-card`, `metric-card`, `chart-placeholder`). These are replaced by four real content-capable widget types: a live clock, an image viewer, a plain-text file viewer, and a sandboxed webpage viewer. Widget-specific settings (image URL, file name, webpage URL) must be persisted in `localStorage` alongside the existing layout and type maps. No new npm dependencies are required; all capabilities rely on browser-native APIs (`setInterval`, File API, `<iframe>`, `URL`).

**Constraints:**
- React 18+ function components with hooks only
- Browser-native APIs only — no new npm packages
- File contents cannot be stored in localStorage (security / size); file names can be stored as hints
- Sandboxed iframes for webpage viewer to prevent script injection
- Settings persistence must be backward-compatible with the existing layout load/save path in `useDashboardLayout`

---

## Use Case Coverage

See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
This design addresses the following use case steps:

| Use Case Step | Description | Design Section |
|---------------|-------------|----------------|
| UC1-S1 | User adds a clock widget or dashboard loads with a saved clock widget | Decision 1 — Widget Registry |
| UC1-S2 | System renders the widget showing current hours, minutes, seconds, and date | Decision 2 — Clock Widget |
| UC1-S3 | System starts a 1-second interval timer internal to the widget | Decision 2 — Clock Widget |
| UC1-S4 | System updates the displayed time every second | Decision 2 — Clock Widget |
| UC1-S5 | User reads the current time from the widget | Decision 2 — Clock Widget |
| UC1-E1a1 | System restores the clock widget at its saved grid position on dashboard load | Decision 5 — Settings Persistence |
| UC1-E1a2 | Clock begins ticking immediately — no configuration needed | Decision 2 — Clock Widget |
| UC1-E5a1 | System stops the 1-second timer when the clock widget is removed | Decision 2 — Clock Widget |
| UC2-S1 | User adds an image viewer widget | Decision 1 — Widget Registry |
| UC2-S2 | System renders the widget with an empty-state prompt: "Choose an image" | Decision 3 — Image Viewer Widget |
| UC2-S3 | User activates the image source picker inside the widget | Decision 3 — Image Viewer Widget |
| UC2-S4 | System presents two options: "Select file" and "Enter URL" | Decision 3 — Image Viewer Widget |
| UC2-S5 | User selects a local image file via the browser file picker | Decision 3 — Image Viewer Widget |
| UC2-S6 | System reads the file client-side, creates an object URL, and displays the image | Decision 3 — Image Viewer Widget |
| UC2-S7 | System stores the image source reference in widget settings keyed by widget ID | Decision 5 — Settings Persistence |
| UC2-S8 | User sees the image displayed at full-fit within the widget bounds | Decision 3 — Image Viewer Widget |
| UC2-E4a1 | System shows a text input pre-populated with any previously saved URL | Decision 3 — Image Viewer Widget |
| UC2-E4a2 | User types or pastes an image URL and confirms | Decision 3 — Image Viewer Widget |
| UC2-E4a3 | System sets the image src to the entered URL | Decision 3 — Image Viewer Widget |
| UC2-E6a1 | System displays an inline error: "Not a supported image format" | Decision 3 — Image Viewer Widget |
| UC2-E8a1 | System displays an inline error: "Image could not be loaded" | Decision 3 — Image Viewer Widget |
| UC2-E8b1 | User activates the image source picker to change the displayed image | Decision 3 — Image Viewer Widget |
| UC3-S1 | User adds a file viewer widget | Decision 1 — Widget Registry |
| UC3-S2 | System renders the widget with an empty-state prompt: "Select a file to display" | Decision 4 — File Viewer Widget |
| UC3-S3 | User activates the file picker inside the widget | Decision 4 — File Viewer Widget |
| UC3-S4 | System opens the browser's native file picker | Decision 4 — File Viewer Widget |
| UC3-S5 | User selects a plain-text file | Decision 4 — File Viewer Widget |
| UC3-S6 | System reads the file contents via the File API | Decision 4 — File Viewer Widget |
| UC3-S7 | System displays the file contents as scrollable plain text inside the widget | Decision 4 — File Viewer Widget |
| UC3-S8 | System stores the file name in widget settings | Decision 5 — Settings Persistence |
| UC3-S9 | User reads the file contents | Decision 4 — File Viewer Widget |
| UC3-E5a1 | Widget remains in empty-state prompt when user cancels the file picker | Decision 4 — File Viewer Widget |
| UC3-E6a1 | System displays an inline error: "File is not readable as text" | Decision 4 — File Viewer Widget |
| UC3-E6b1 | System displays an inline warning: "File is large — only the first 1 MB is shown" | Decision 4 — File Viewer Widget |
| UC3-E9b1 | System restores widget with saved file name hint: "Re-select '<filename>' to restore" | Decision 5 — Settings Persistence |
| UC4-S1 | User adds a webpage viewer widget | Decision 1 — Widget Registry |
| UC4-S2 | System renders the widget with a URL input and empty-state prompt: "Enter a URL to embed" | Decision 6 — Webpage Viewer Widget |
| UC4-S3 | User types or pastes a URL into the input field | Decision 6 — Webpage Viewer Widget |
| UC4-S4 | User submits the URL | Decision 6 — Webpage Viewer Widget |
| UC4-S5 | System validates that the entered value is a well-formed URL | Decision 6 — Webpage Viewer Widget |
| UC4-S6 | System sets the src of a sandboxed iframe to the validated URL | Decision 6 — Webpage Viewer Widget |
| UC4-S7 | System saves the URL in widget settings keyed by widget ID | Decision 5 — Settings Persistence |
| UC4-S8 | The target page loads inside the iframe | Decision 6 — Webpage Viewer Widget |
| UC4-S9 | User browses or monitors the embedded page | Decision 6 — Webpage Viewer Widget |
| UC4-E4a1 | System pre-fills URL input with saved URL on dashboard load | Decision 5 — Settings Persistence |
| UC4-E4a2 | System immediately loads the page in the iframe from saved URL | Decision 6 — Webpage Viewer Widget |
| UC4-E5a1 | System displays inline error: "Please enter a valid URL (include https://)" | Decision 6 — Webpage Viewer Widget |
| UC4-E8a1 | System displays fallback overlay: "This page cannot be embedded" | Decision 6 — Webpage Viewer Widget |
| UC4-E8a2 | System shows "Open in new tab" link pointing to the URL | Decision 6 — Webpage Viewer Widget |
| UC5-S1 | User activates the source-change control on a configured widget | Decision 3, 4, 6 — Widget Controls |
| UC5-S2 | System opens the appropriate picker or input for the widget type | Decision 3, 4, 6 — Widget Controls |
| UC5-S3 | User selects or enters the new source | Decision 3, 4, 6 — Widget Controls |
| UC5-S4 | System replaces the displayed content with the new source | Decision 3, 4, 6 — Widget Controls |
| UC5-S5 | System updates widget settings in localStorage with the new source reference | Decision 5 — Settings Persistence |
| UC5-S6 | User sees the widget displaying the new content | Decision 3, 4, 6 — Widget Controls |
| UC5-E3a1 | Widget retains its current content and source when user cancels | Decision 3, 4, 6 — Widget Controls |
| UC6-S1 | User reloads the dashboard | Decision 5 — Settings Persistence |
| UC6-S2 | System reads dashboard-widget-settings from localStorage | Decision 5 — Settings Persistence |
| UC6-S3 | System validates the settings map against currently registered widget IDs | Decision 5 — Settings Persistence |
| UC6-S4 | System renders clock widgets immediately with no settings needed | Decision 2 — Clock Widget |
| UC6-S5 | System loads image viewer widgets from saved URL source | Decision 5 — Settings Persistence |
| UC6-S6 | System loads webpage viewer widgets from saved URL | Decision 5 — Settings Persistence |
| UC6-S7 | System shows file viewer widgets in empty-state with saved file name hint | Decision 5 — Settings Persistence |
| UC6-S8 | Dashboard appears with all previously configured widgets restored | Decision 5 — Settings Persistence |
| UC6-E2a1 | System uses empty settings map when no settings found in localStorage | Decision 5 — Settings Persistence |
| UC6-E2b1 | System logs a console warning and falls back to empty settings on corrupt data | Decision 5 — Settings Persistence |
| UC6-E3a1 | System silently discards settings entries for widget IDs no longer in the layout | Decision 5 — Settings Persistence |
| UC6-E5a1 | System shows inline error and source-change control when saved image URL fails | Decision 3 — Image Viewer Widget |

### Unaddressed Use Case Steps
None — all 63 use case steps are addressed by one or more decisions above.

---

## Goals / Non-Goals

**Goals:**
- Replace stub widget types with four functional widget implementations
- Live clock with automatic 1-second refresh and timer cleanup on unmount
- Image viewer supporting local file selection and URL entry; inline error states
- File viewer reading local files via the browser File API; 1 MB cap; re-select on reload
- Sandboxed iframe webpage viewer with URL validation and embed-blocked fallback
- Per-widget settings persisted in localStorage under a new `dashboard-widget-settings` key
- Settings restored on page reload; configurable widgets pre-populate from saved values
- All four types registered in `WIDGET_REGISTRY` with accurate `defaultSize` values

**Non-Goals:**
- Server-side storage of widget settings or file contents
- Real-time file watching (file is read once when selected; no auto-refresh)
- Authentication or CORS proxy for webpage viewer (user is responsible for choosing embeddable URLs)
- Rich text rendering in the file viewer (plain text only; no Markdown or syntax highlighting)
- Supporting image editing, annotation, or zoom controls in v1
- Multiple simultaneous file selections per widget

---

## Decisions

### Decision 1: Widget Registry — Replace Stubs with Four New Types
**Addresses**: UC1-S1 - User adds a clock widget or the dashboard loads with a saved clock widget; UC2-S1 - User adds an image viewer widget; UC3-S1 - User adds a file viewer widget; UC4-S1 - User adds a webpage viewer widget
**Rationale**: `WIDGET_REGISTRY` in `src/widgets/registry.ts` is the single source of truth for widget picker display, auto-placement sizing, and persistence validation. Replacing the three stubs with four new entries wires the entire system end-to-end with no changes to picker, drag/drop, or resize logic. Default sizes chosen to fit content naturally: clock (`2×1`), image viewer (`3×2`), file viewer (`3×2`), webpage viewer (`4×3`). `DEFAULT_LAYOUT` is updated to place one of each at non-overlapping positions.

**Alternative Considered**: Keep stubs alongside new types — rejected because it bloats the picker and leaves non-functional entries in the registry that would confuse users.

---

### Decision 2: Clock Widget — `setInterval` with `useEffect` cleanup
**Addresses**: UC1-S2 - System renders the widget showing current hours, minutes, seconds, and date; UC1-S3 - System starts a 1-second interval timer internal to the widget; UC1-S4 - System updates the displayed time every second; UC1-E5a1 - System stops the 1-second timer when the clock widget is removed
**Rationale**: Clock state is entirely local to the widget component — no settings, no persistence, no external data. `useState` holds the current `Date`, `useEffect` starts a `setInterval(fn, 1000)` on mount and returns a cleanup that calls `clearInterval` on unmount. This is the idiomatic React pattern for timers and prevents stale timer leaks when the widget is removed from the grid. The clock component receives no props beyond `id` (standard `WidgetContentProps`).

**Alternative Considered**: Global tick via a context or a shared interval — rejected because it adds cross-widget coupling for a fully self-contained feature.

---

### Decision 3: Image Viewer Widget — Dual-mode source selection (file picker + URL input)
**Addresses**: UC2-S2–S8, UC2-E4a1–E4a3, UC2-E6a1, UC2-E8a1, UC2-E8b1; UC5-S1–S6, UC5-E3a1
**Rationale**: Two valid image sources exist: local files (object URL from File API) and remote URLs. A two-button UI ("Select file" / "Enter URL") makes the choice explicit without a toggle. For local files, `URL.createObjectURL(file)` produces a blob URL that lives in-memory — it is **not** persisted to localStorage (blob URLs are session-only). The persisted value is the original remote URL (for URL-mode) or `null` (for file-mode). On page reload, URL-mode images restore automatically; file-mode shows the empty-state prompt since the blob URL is gone. Image load errors are caught via the `<img onError>` handler. File type validation uses `file.type.startsWith('image/')`.

**Alternative Considered**: Base64-encode the image and store it in localStorage — rejected because images easily exceed the 5 MB localStorage quota and would cause `QuotaExceededError`.

---

### Decision 4: File Viewer Widget — Client-side FileReader with 1 MB cap
**Addresses**: UC3-S2–S9, UC3-E5a1, UC3-E6a1, UC3-E6b1, UC3-E9b1; UC5-S1–S6, UC5-E3a1
**Rationale**: `FileReader.readAsText()` reads the selected file as a UTF-8 string entirely in the browser — no server roundtrip. A 1 MB cap is enforced by slicing the File object (`file.slice(0, 1_048_576)`) before reading; if the original file size exceeds 1 MB a warning banner is shown above the content. Non-text files are detected by checking `FileReader`'s `error` event or by testing that the result contains non-printable characters (heuristic); a clear error is shown. The file name (`file.name`) — but not the path or contents — is saved to widget settings so a re-select hint can be displayed on reload. Because `<input type="file">` cannot be programmatically pre-populated after page load (browser security), the widget always shows the empty-state + hint on reload.

**Alternative Considered**: Storing file contents in `sessionStorage` (survives tab refresh within same session) — deferred as a v2 enhancement because it adds significant complexity for unclear benefit.

---

### Decision 5: Settings Persistence — New `dashboard-widget-settings` localStorage key
**Addresses**: UC2-S7, UC3-S8, UC4-S7, UC5-S5, UC6-S1–S8, UC6-E2a1, UC6-E2b1, UC6-E3a1, UC4-E4a1, UC3-E9b1, UC6-E5a1
**Rationale**: Widget settings are a separate concern from layout geometry (`dashboard-layout`) and type mapping (`dashboard-widget-types`). A new key `dashboard-widget-settings` holds a `Record<widgetId, WidgetSettings>` where `WidgetSettings` is a discriminated union:

```ts
type WidgetSettings =
  | { type: 'clock' }
  | { type: 'image-viewer'; source: 'url'; url: string }
  | { type: 'image-viewer'; source: 'file' }   // no URL persisted for file mode
  | { type: 'file-viewer'; fileName: string }
  | { type: 'webpage-viewer'; url: string };
```

The existing `useDashboardLayout` hook is extended with:
- `widgetSettings: Record<string, WidgetSettings>` state
- `updateWidgetSettings(id, settings)` mutation
- Debounced persistence (same 300ms pattern as layout)
- On load: JSON parse with try/catch fallback, stale-ID pruning against current layout

`WidgetContentProps` gains an optional `settings` prop and an `onSettingsChange` callback so widget components can read their persisted state on mount and push updates back to the hook.

**Alternative Considered**: Store settings inside each `WidgetLayout` entry (alongside col/row/w/h) — rejected because it couples geometry with content concerns, making the layout type impure and harder to test.

---

### Decision 6: Webpage Viewer Widget — Sandboxed `<iframe>` with URL validation and embed-blocked fallback
**Addresses**: UC4-S2–S9, UC4-E4a1, UC4-E4a2, UC4-E5a1, UC4-E8a1, UC4-E8a2; UC5-S1–S6, UC5-E3a1
**Rationale**: An `<iframe sandbox="allow-scripts allow-same-origin allow-forms allow-popups">` attribute set prevents the embedded page from accessing the parent frame's DOM, executing top-level navigation, or accessing parent localStorage. URL validation uses the native `URL` constructor (throws on malformed input) to avoid regex brittleness. Detecting embed-blocked pages is inherently unreliable cross-browser (X-Frame-Options is not exposed to JS); the practical approach is to listen to the iframe's `load` event and check `iframe.contentDocument` — if it throws a cross-origin security error the page likely blocked embedding. A fallback overlay with "This page cannot be embedded" and an "Open in new tab" anchor covers this case. The URL is saved to settings on submit (not on every keystroke) to avoid redundant localStorage writes.

**Alternative Considered**: Using a CORS proxy to bypass X-Frame-Options — rejected because it would require a server-side component and introduces security risks; out of scope for v1.

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Object URLs from file picker become invalid after page reload | Document clearly in UI ("image will need to be re-selected on reload") — acceptable for v1 |
| Webpage viewer iframe blocked by X-Frame-Options on most modern sites | Provide clear fallback with direct-link; users learn quickly which sites embed |
| `localStorage` quota exceeded if many image URLs are long | URLs are short strings; quota risk is negligible compared to base64 approach |
| `setInterval` drift in inactive tabs (browsers throttle timers) | Clock accuracy is not mission-critical; 1s drift is acceptable |
| File contents not persisted — user must re-select on every reload | Show file name hint to reduce friction; v2 could use sessionStorage |
| React StrictMode in development double-invokes effects — two timers on clock | `useEffect` cleanup return ensures only one timer is active at any time |

---

## Migration Plan

This change replaces existing stub entries in `WIDGET_REGISTRY`. Any saved layout referencing `text-card`, `metric-card`, or `chart-placeholder` will have those entries silently dropped on load (existing UC3-E3a stale-ID pruning behaviour). No migration script is needed.

1. Update `src/widgets/types.ts` — add `settings` / `onSettingsChange` to `WidgetContentProps`
2. Update `src/hooks/useDashboardLayout.ts` — add `widgetSettings` state, `updateWidgetSettings`, persistence key
3. Implement the four widget components under `src/widgets/`
4. Update `src/widgets/registry.ts` — replace three stubs with four new entries; update `DEFAULT_LAYOUT`
5. No database migrations, API changes, or feature flags required

**Rollback**: Revert `registry.ts` to the stub entries and remove the four new component files. Any saved settings in localStorage are ignored if the widget types are absent from the registry.

---

## Open Questions

1. **Clock format**: Should the clock display 12-hour (with AM/PM) or 24-hour by default? Current design defaults to the browser locale via `toLocaleTimeString()`. A future settings toggle could expose this.
2. **File viewer refresh**: Should the file viewer offer a "Reload file" button to re-read the same file without opening the picker? Requires storing a `FileSystemFileHandle` (File System Access API) — deferred to v2.
3. **Image viewer object URL cleanup**: Should blob URLs be explicitly revoked on widget removal (`URL.revokeObjectURL`)? Yes — add cleanup in the `useEffect` return of `ImageViewerWidget`.
4. **Webpage viewer navigation**: Should the iframe allow in-page navigation (clicking links)? The `allow-same-origin` sandbox token permits this — but removing it would lock the page to its initial URL. Current decision: allow navigation.
