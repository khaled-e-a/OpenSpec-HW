## Why

The dashboard currently ships with three placeholder widget types (`text-card`, `metric-card`, `chart-placeholder`) that display static stub content and provide no real utility to users. To make the dashboard genuinely useful, widgets must display live, meaningful, user-controlled content from the moment they are added.

## What Changes

- Replace the three stub widget types with four real content-capable widget types registered in `WIDGET_REGISTRY`.
- Add a per-widget settings panel that lets users configure the content source for their widget (image URL or file, file path, webpage URL).
- The clock widget requires no user configuration and begins ticking immediately on placement.
- The image viewer widget allows the user to pick a local image file or enter a URL; the selected source is stored per widget in the layout persistence layer.
- The file viewer widget allows the user to select a local plain-text file; the file is read client-side via the File API and its contents displayed inside the widget.
- The webpage viewer widget allows the user to enter any URL; the page is embedded in a sandboxed `<iframe>` inside the widget.
- Widget-specific settings (image source, file reference, URL) are persisted alongside the layout in `localStorage` so they survive page reloads.
- **BREAKING**: The existing `text-card`, `metric-card`, and `chart-placeholder` entries are removed from `WIDGET_REGISTRY`. Any stored layout referencing these types will be treated as stale and discarded on load (existing UC3-E3a behaviour applies).

## Capabilities

### New Capabilities

- `widget-clock`: A widget that displays a continuously updating digital clock (hours, minutes, seconds) and the current date. No user configuration required.
- `widget-image-viewer`: A widget that displays an image chosen by the user — either by selecting a local file via a file picker or by entering an image URL. The user can change the source at any time via an in-widget controls.
- `widget-file-viewer`: A widget that displays the plain-text contents of a local file selected by the user via a file picker. The user can re-select a different file at any time. Binary and non-text files are not supported and show an error message.
- `widget-webpage-viewer`: A widget that embeds a user-specified URL inside a sandboxed `<iframe>`. The user can enter or change the URL via an in-widget input. Pages that refuse to be embedded (X-Frame-Options / CSP) show a fallback message with a direct link.

### Modified Capabilities

- `widget-drag-drop`: The `WIDGET_REGISTRY` map and `DEFAULT_LAYOUT` constant are changing — the three stub types are replaced with the four new types. This is a requirement-level change to the registry contract that drives widget picker display, auto-placement sizing, and persistence validation.

## Impact

- **`src/widgets/registry.ts`** — remove stub entries; register `clock` (2×1), `image-viewer` (3×2), `file-viewer` (3×2), `webpage-viewer` (4×3) with updated `defaultSize` values and component references.
- **`src/widgets/types.ts`** — extend `WidgetContentProps` with an optional `settings` field to carry per-widget configuration (image source, file reference, URL).
- **`src/hooks/useDashboardLayout.ts`** — extend persistence to save/load a `widgetSettings` map (`Record<widgetId, object>`) in `localStorage` alongside `dashboard-layout` and `dashboard-widget-types`.
- **New component files** — `ClockWidget.tsx`, `ImageViewerWidget.tsx`, `FileViewerWidget.tsx`, `WebpageViewerWidget.tsx` under `src/widgets/`.
- **No changes** to grid utilities, drag/drop logic, resize handles, or the widget picker UI flow.
- **Dependencies** — no new npm packages required (File API, `<iframe>`, `setInterval` are all browser-native).

---

Created by Khaled@Huawei
