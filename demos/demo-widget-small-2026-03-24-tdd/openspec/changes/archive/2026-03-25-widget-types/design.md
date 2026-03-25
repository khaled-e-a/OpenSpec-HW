## Context

The existing dashboard renders widgets as unstyled `<div>` children. Each `WidgetLayout` entry carries only position/size (`x`, `y`, `w`, `h`, `id`). There is no concept of content type.

This design introduces a `WidgetType` discriminated union and a content-rendering layer that sits inside `DraggableWidget`. The drag-and-drop mechanics in `DashboardGrid` and the geometry utilities in `gridGeometry.ts` are left structurally intact; only the data model and the visual content of each widget change.

All content sources (image, file, webpage) are ephemeral — they exist in React component state and are not persisted to `localStorage` or any backend. This is intentional for V1.

---

## Use Case Coverage

| Use Case Step | Description | Design Section |
|---------------|-------------|----------------|
| UC1-S1 | User opens the dashboard | Decision 5 (App seed layout) |
| UC1-S2 | System renders clock widget with HH:MM:SS | Decision 3 (ClockWidget) |
| UC1-S3 | System updates clock every second | Decision 3 (ClockWidget — setInterval) |
| UC1-S4 | User reads the time | Decision 3 |
| UC1-E4a1 | System resumes updates after tab navigation | Decision 3 (not required V1) |
| UC2-S1 | User sees image widget (placeholder or image) | Decision 4 (WidgetContent dispatch) |
| UC2-S2 | User opens image config panel | Decision 6 (ConfigPanel) |
| UC2-S3 | System shows file picker accepting image files | Decision 4 (ImageWidget) |
| UC2-S4 | User selects an image file | Decision 4 |
| UC2-S5 | System reads file and generates object URL | Decision 4 (URL.createObjectURL) |
| UC2-S6 | System renders image filling widget area | Decision 4 |
| UC2-S7 | User closes the config panel | Decision 6 |
| UC2-E3a1 | Retain previous image on cancel | Decision 6 (controlled state) |
| UC2-E4a1 | Error for non-image file | Decision 4 (MIME type guard) |
| UC3-S1 | User sees file widget (placeholder or contents) | Decision 4 (WidgetContent dispatch) |
| UC3-S2 | User opens file config panel | Decision 6 |
| UC3-S3 | System shows file picker (any type) | Decision 4 (FileWidget) |
| UC3-S4 | User selects a file | Decision 4 |
| UC3-S5 | System reads file as UTF-8 text | Decision 4 (FileReader.readAsText) |
| UC3-S6 | System renders contents in scrollable monospace area | Decision 4 |
| UC3-S7 | User reads the file and closes the panel | Decision 6 |
| UC3-E3a1 | Retain previous contents on cancel | Decision 6 |
| UC3-E5a1 | Error for unreadable binary file | Decision 4 (FileReader onerror) |
| UC3-E5b1 | Truncate at 10 000 chars with notice | Decision 4 |
| UC4-S1 | User sees webpage widget (prompt or embedded page) | Decision 4 (WidgetContent dispatch) |
| UC4-S2 | User opens webpage config panel | Decision 6 |
| UC4-S3 | System shows URL input pre-filled | Decision 4 (WebpageWidget) |
| UC4-S4 | User enters URL and confirms | Decision 4 |
| UC4-S5 | System validates URL is well-formed | Decision 4 (URL constructor guard) |
| UC4-S6 | System renders iframe pointing to URL | Decision 4 |
| UC4-S7 | User views page and closes panel | Decision 6 |
| UC4-E4a1 | Remove iframe and show placeholder on empty URL | Decision 4 |
| UC4-E5a1 | Show validation error for malformed URL | Decision 4 |
| UC4-E6a1 | Browser blocks iframe; system shows helper note | Decision 4 (iframe onError / static note) |
| UC4-E6b1 | Prepend "https://" to scheme-less URL | Decision 4 |
| UC5-S1 | User clicks settings icon | Decision 6 |
| UC5-S2 | System opens inline config panel | Decision 6 |
| UC5-S3 | System shows correct control per type | Decision 6 (dispatch by type) |
| UC5-S4 | User selects new file or URL | Decision 4 / Decision 6 |
| UC5-S5 | System updates widget content config | Decision 2 (config state model) |
| UC5-S6 | System re-renders widget with new content | Decision 4 |
| UC5-S7 | System closes config panel | Decision 6 |
| UC5-E4a1 | Content unchanged when user cancels | Decision 6 (cancel before commit) |
| UC5-E5a1 | Show inline validation error; no update until valid | Decision 4 / Decision 6 |

### Unaddressed Use Case Steps
- **UC1-E4a1** (pause interval on hidden tab): Not addressed in V1. The clock continues ticking in the background; this is an optional optimisation deferred to a future change.

---

## Goals / Non-Goals

**Goals:**
- Add a `type` + `config` field to `WidgetLayout` without breaking drag-and-drop behaviour
- Render four distinct widget content types inside the existing grid
- Allow the user to change the content source of any non-clock widget at runtime
- Keep all content state local (no persistence, no backend)

**Non-Goals:**
- Persisting widget config to `localStorage` or any server (V2)
- Drag-and-drop for widget type assignment
- Multiple instances of the same type sharing a config
- Video, audio, or other media types beyond image / text / iframe
- Server-side proxy for X-Frame-Options bypass

---

## Decisions

### Decision 1: Extend `WidgetLayout` with `type` and `config`

**Addresses**:
- UC5-S5 — System updates the widget content config
- UC1-S2 — System renders clock widget with HH:MM:SS

**Rationale**: `WidgetLayout` is the single source of truth for the grid state. Placing `type` and `config` here means the full widget definition travels together through `DashboardGrid` → `DraggableWidget` → `WidgetContent` without prop-drilling through unrelated layers.

```ts
export type WidgetType = 'clock' | 'image' | 'file' | 'webpage';

export interface WidgetConfig {
  imageUrl?: string;       // object URL for image widget
  fileText?: string;       // text content for file widget
  fileName?: string;       // display name for file widget
  webpageUrl?: string;     // URL string for webpage widget
}

export interface WidgetLayout {
  id: string;
  x: number; y: number; w: number; h: number;
  type?: WidgetType;      // optional — defaults to 'clock' for backward compat
  config?: WidgetConfig;
}
```

`type` is optional with a default of `'clock'` so the existing drag-drop tests continue to compile and pass without modification. `gridGeometry.ts` pure functions ignore `type`/`config` entirely — they operate only on positional fields.

**Alternative Considered**: Separate `widgetConfigs: Map<id, Config>` state in `DashboardGrid`. Rejected — splits what logically belongs together and complicates the `onLayoutChange` callback contract.

---

### Decision 2: Local config state owned by each content component

**Addresses**:
- UC5-S5 — System updates the widget content config
- UC2-E3a1, UC3-E3a1, UC5-E4a1 — Retain previous content when user cancels

**Rationale**: Config changes (picking a new image, typing a URL) are ephemeral until the user confirms. Each content component (`ImageWidget`, `FileWidget`, `WebpageWidget`) keeps a **draft** state for the in-progress edit and only promotes it to the committed state (passed up via `onConfigChange` prop) when the user confirms.

Draft state lives in `useState` inside the config component; committed state is held in `DashboardGrid`'s layout array. Cancelling the config panel simply discards the draft.

**Alternative Considered**: Lift all config editing state to `DashboardGrid`. Rejected — bloats the grid component with unrelated concerns.

---

### Decision 3: `ClockWidget` uses `setInterval` + `useState`

**Addresses**:
- UC1-S2 — System renders clock widget with current local time (HH:MM:SS)
- UC1-S3 — System updates the clock display every second

**Rationale**: `setInterval(fn, 1000)` is the simplest mechanism for a 1-second update. The interval is started in a `useEffect` and cleared on unmount to avoid memory leaks. Time is formatted with `toLocaleTimeString('en-GB', { hour12: false })` which reliably produces `HH:MM:SS` without a date library.

```tsx
function ClockWidget() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <div>{time.toLocaleTimeString('en-GB', { hour12: false })}</div>;
}
```

**Alternative Considered**: `requestAnimationFrame` loop. Rejected — unnecessary battery/CPU cost for a 1-second display.

---

### Decision 4: `WidgetContent` dispatcher + four leaf components

**Addresses**:
- UC2-S5, UC2-S6 — Read file → generate object URL → render image
- UC3-S5, UC3-S6 — Read file as text → render in monospace area
- UC4-S5, UC4-S6 — Validate URL → render iframe
- UC2-E4a1, UC3-E5a, UC3-E5b1, UC4-E5a1, UC4-E6b1 — All validation / error paths

**Rationale**: A single `WidgetContent` component receives `type`, `config`, and `onConfigChange` and switches on `type` to render the appropriate leaf. This keeps `DraggableWidget` type-agnostic.

```
WidgetContent
  ├── ClockWidget       (no config)
  ├── ImageWidget       (config.imageUrl, accepts image/* via <input type=file>)
  ├── FileWidget        (config.fileText + config.fileName, accepts any file)
  └── WebpageWidget     (config.webpageUrl, <iframe sandbox="allow-scripts allow-same-origin">)
```

**ImageWidget**: on file selection, checks `file.type.startsWith('image/')`. If not, shows inline error. Otherwise calls `URL.createObjectURL(file)` and invokes `onConfigChange`.

**FileWidget**: uses `FileReader.readAsText`. On load, truncates to 10 000 characters with notice if needed. On `onerror`, shows "File could not be read as text." Renders contents in `<pre style={{ overflow: 'auto', fontFamily: 'monospace' }}>`.

**WebpageWidget**: on confirm, wraps the raw input with `new URL(value)` in a try/catch — invalid throws are caught and shown as an inline error. If the scheme is missing, prepends `https://` before parsing. Renders `<iframe src={url} title="Embedded page" />`. A static note "This site may not allow embedding" is shown below the iframe at all times (browsers don't fire a reliably detectable event for X-Frame-Options denial).

**Alternative Considered**: `react-error-boundary` around each iframe to catch frame denials. Rejected — browsers do not throw JS errors for X-Frame-Options; only a network-level block occurs.

---

### Decision 5: `App.tsx` seeds one widget of each type

**Addresses**:
- UC1-S1 — User opens the dashboard
- UC2-S1, UC3-S1, UC4-S1 — User sees each widget type on load

**Rationale**: The initial layout in `App.tsx` is updated to include four widgets with explicit `type` values. A fifth widget (e.g., a second `clock`) can remain to fill the grid if needed. This makes the feature immediately visible without the user needing to add widgets manually.

```ts
const initialLayout: WidgetLayout[] = [
  { id: 'analytics', x: 0, y: 0, w: 2, h: 2, type: 'clock' },
  { id: 'status',    x: 2, y: 0, w: 1, h: 1, type: 'image' },
  { id: 'chart',     x: 3, y: 0, w: 1, h: 1, type: 'file' },
  { id: 'activity',  x: 0, y: 2, w: 2, h: 1, type: 'webpage' },
  { id: 'metrics',   x: 0, y: 3, w: 1, h: 3, type: 'clock' },
];
```

---

### Decision 6: Inline config panel as a toggled overlay inside `WidgetContent`

**Addresses**:
- UC5-S1, UC5-S2, UC5-S3, UC5-S7 — Click settings icon → open panel → show control → close
- UC2-S2, UC2-S7, UC3-S2, UC3-S7, UC4-S2, UC4-S7 — Per-type config panels
- UC5-E4a1 — Content unchanged when user cancels

**Rationale**: Each non-clock content component manages its own `isConfigOpen: boolean` state. A gear icon (⚙) button in the top-right corner of the widget toggles the panel. The panel is rendered as an absolutely-positioned overlay within the widget's bounding box (no portals needed at this scale). Clicking the × close button or pressing Escape dismisses the panel and discards the draft without committing changes.

`ClockWidget` has no config panel (no settings icon shown).

**Alternative Considered**: A modal dialog (portal). Rejected — at this widget size a modal would cover too much of the dashboard and adds complexity without benefit.

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Object URLs leak if component unmounts before revoke | Call `URL.revokeObjectURL(prev)` in the `useEffect` cleanup when `imageUrl` changes |
| `FileReader` is async; fast double-click could create a race | Use a single in-flight flag (`readingRef`) or cancel previous read before starting a new one |
| `<iframe>` with `sandbox` may block sites that require cookies | Default sandbox: `allow-scripts allow-same-origin allow-forms` — balances usability and security |
| `WidgetLayout.type` is optional (defaults to `clock`) — old snapshots without `type` still work | Handled by the `?? 'clock'` default in `WidgetContent` |
| Truncation at 10 000 chars may surprise users with large files | The truncation notice is visible; a future version can add a "show more" expander |

---

## Migration Plan

1. Extend `WidgetLayout` interface in `gridGeometry.ts` (additive — no breaking change to existing type-safe callers, only broadens the type).
2. Update `App.tsx` initial layout to add `type` fields.
3. Update `DraggableWidget` to render `<WidgetContent>` instead of `{children}` — wire `onConfigChange` up through `DashboardGrid`.
4. Add four new widget components and `WidgetContent`.
5. Update `DashboardGrid` to thread `type`, `config`, and `onConfigChange` through to each `DraggableWidget`.
6. Run existing tests — all should pass because `type` is optional and the positional logic is unchanged.
7. Add new tests for each widget type.

No rollback complexity — the change is fully additive. If reverted, widgets fall back to rendering their `id` string (original behaviour).

---

## Open Questions

- **Clock locale**: Should the clock respect the browser's locale (`toLocaleTimeString()` with no locale arg) or always use `en-GB` 24-hour format? Defaulting to `en-GB` for now; can be made configurable later.
- **File encoding**: `FileReader.readAsText` defaults to UTF-8. Should we expose encoding selection (e.g., for Latin-1 files)? Deferred to V2.
- **iframe sandbox permissions**: `allow-popups` and `allow-top-navigation` are excluded. Is that acceptable for all anticipated use cases? Assumed yes for V1.
