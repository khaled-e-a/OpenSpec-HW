# Spec-Test Mapping: widget-content-types
Generated: 2026-03-24

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC1 | Clock Widget Full Flow | Flow | Integration | `src/widgets/ClockWidget.test.tsx` | ✅ |
| UC1-S1 | System adds a clock widget to the grid | Step | Unit | `src/widgets/ClockWidget.test.tsx:8` UC1-S1 clock renders without crashing | ✅ |
| UC1-S2 | Clock renders current time and date | Step | Unit | `src/widgets/ClockWidget.test.tsx:14` UC1-S2 renders time and date on mount | ✅ |
| UC1-S2 | Clock renders current time and date | Step | PBT | `src/widgets/ClockWidget.property.test.tsx:21` UC1-S2: clock always renders non-empty time and date | ✅ |
| UC1-S3 | Time string is non-empty | Step | Unit | `src/widgets/ClockWidget.test.tsx:14` (asserts textContent.length > 0) | ✅ |
| UC1-S4 | Time updates each second | Step | Unit | `src/widgets/ClockWidget.test.tsx:29` UC1-S4 time updates after one second | ✅ |
| UC1-S4 | Time updates each second | Step | PBT | `src/widgets/ClockWidget.property.test.tsx:46` UC1-S4: time display text differs for distinct dates | ✅ |
| UC1-E1a1 | Settings icon opens configuration panel | Extension | Unit | `src/widgets/ClockWidget.test.tsx:40` UC1-E1a1 no config UI rendered | ✅ |
| UC1-E1a2 | Clock has no configurable options | Extension | Unit | `src/widgets/ClockWidget.test.tsx:40` no input/button/iframe rendered | ✅ |
| UC1-E1a2 | Clock has no configurable options | Extension | PBT | `src/widgets/ClockWidget.property.test.tsx:71` UC1-E1a2: clock never renders input/button/iframe | ✅ |
| UC1-E5a1 | Timer cleared when widget removed | Extension | Unit | `src/widgets/ClockWidget.test.tsx:47` UC1-E5a1 clearInterval called on unmount | ✅ |
| UC1-E5a1 | Timer cleared when widget removed | Extension | PBT | `src/widgets/ClockWidget.property.test.tsx:96` UC1-E5a1: clearInterval always called on unmount | ✅ |
| UC2 | Image Viewer Full Flow | Flow | Integration | `src/widgets/ImageViewerWidget.test.tsx` | ✅ |
| UC2-S1 | System adds an image viewer widget | Step | Unit | `src/widgets/ImageViewerWidget.test.tsx:12` UC2-S1 renders without crashing | ✅ |
| UC2-S2 | Widget shows empty-state prompt | Step | Unit | `src/widgets/ImageViewerWidget.test.tsx:18` UC2-S2 empty state on new widget | ✅ |
| UC2-S2 | Widget shows empty-state prompt | Step | PBT | `src/widgets/ImageViewerWidget.property.test.tsx:18` UC2-S2: any widget id always shows empty-state | ✅ |
| UC2-S3 | Source picker opens with Choose Image | Step | Unit | `src/widgets/ImageViewerWidget.test.tsx:26` UC2-S3 source picker shown after button click | ✅ |
| UC2-S4 | Picker offers File and URL options | Step | Unit | `src/widgets/ImageViewerWidget.test.tsx:26` (asserts Select file and Enter URL buttons) | ✅ |
| UC2-S5 | User selects file from filesystem | Step | Unit | `src/widgets/ImageViewerWidget.test.tsx:37` UC2-S5 selecting image file shows img | ✅ |
| UC2-S6 | File validated as image type | Step | Unit | `src/widgets/ImageViewerWidget.test.tsx:37` (MIME type check via file.type) | ✅ |
| UC2-S7 | Settings persisted via onSettingsChange | Step | Unit | `src/widgets/ImageViewerWidget.test.tsx:56` UC2-S7 onSettingsChange called with file settings | ✅ |
| UC2-S7 | Settings persisted via onSettingsChange | Step | PBT | `src/widgets/ImageViewerWidget.property.test.tsx:114` UC2-S7: onSettingsChange always called with correct url settings | ✅ |
| UC2-S8 | Image displayed fitting the widget | Step | Unit | `src/widgets/ImageViewerWidget.test.tsx:67` UC2-S8 image displayed with object-fit contain | ✅ |
| UC2-E4a1 | User chooses URL entry mode | Extension | Unit | `src/widgets/ImageViewerWidget.test.tsx:76` UC2-E4a1 URL entry mode shown | ✅ |
| UC2-E4a2 | URL input field shown | Extension | Unit | `src/widgets/ImageViewerWidget.test.tsx:76` (asserts .image-viewer__url-input present) | ✅ |
| UC2-E4a3 | URL confirmed and image shown | Extension | Unit | `src/widgets/ImageViewerWidget.test.tsx:88` UC2-E4a3 image shown after URL load | ✅ |
| UC2-E4a3 | URL confirmed and image shown | Extension | PBT | `src/widgets/ImageViewerWidget.property.test.tsx:39` UC2-E4a3: any valid URL confirmed sets img src | ✅ |
| UC2-E6a1 | Non-image file rejected with error | Extension | Unit | `src/widgets/ImageViewerWidget.test.tsx:103` UC2-E6a1 non-image file rejected | ✅ |
| UC2-E6a1 | Non-image file rejected with error | Extension | PBT | `src/widgets/ImageViewerWidget.property.test.tsx:78` UC2-E6a1: non-image MIME types always trigger error | ✅ |
| UC2-E8a1 | Broken image shows load error | Extension | Unit | `src/widgets/ImageViewerWidget.test.tsx:117` UC2-E8a1 broken image shows load error | ✅ |
| UC2-E8b1 | Change button present when image loaded | Extension | Unit | `src/widgets/ImageViewerWidget.test.tsx:128` UC2-E8b1 change image button present | ✅ |
| UC3 | File Viewer Full Flow | Flow | Integration | `src/widgets/FileViewerWidget.test.tsx` | ✅ |
| UC3-S1 | System adds a file viewer widget | Step | Unit | `src/widgets/FileViewerWidget.test.tsx:12` UC3-S1 renders without crashing | ✅ |
| UC3-S2 | Widget shows empty-state prompt | Step | Unit | `src/widgets/FileViewerWidget.test.tsx:18` UC3-S2 empty state on new widget | ✅ |
| UC3-S2 | Widget shows empty-state prompt | Step | PBT | `src/widgets/FileViewerWidget.property.test.tsx:20` UC3-S2: any widget id with no settings always shows empty state | ✅ |
| UC3-S3 | User clicks to open file picker | Step | Unit | `src/widgets/FileViewerWidget.test.tsx:26` UC3-S3 file picker opens | ✅ |
| UC3-S4 | User selects a text file | Step | Unit | `src/widgets/FileViewerWidget.test.tsx:34` UC3-S4 text file content displayed | ✅ |
| UC3-S5 | File name shown in header | Step | Unit | `src/widgets/FileViewerWidget.test.tsx:34` (asserts fileName in header) | ✅ |
| UC3-S6 | File read with FileReader | Step | Unit | `src/widgets/FileViewerWidget.test.tsx:34` (FileReader mock triggered) | ✅ |
| UC3-S7 | Settings persisted via onSettingsChange | Step | Unit | `src/widgets/FileViewerWidget.test.tsx:48` UC3-S7 onSettingsChange called with fileName | ✅ |
| UC3-S7 | Settings persisted via onSettingsChange | Step | PBT | `src/widgets/FileViewerWidget.property.test.tsx:85` UC3-S7: onSettingsChange always called with fileName | ✅ |
| UC3-S8 | File content displayed in scrollable area | Step | Unit | `src/widgets/FileViewerWidget.test.tsx:34` (asserts content element present) | ✅ |
| UC3-E6b1 | Large file truncated at 1MiB | Extension | Unit | `src/widgets/FileViewerWidget.test.tsx:61` UC3-E6b1 large file truncated | ✅ |
| UC3-E6b1 | Large file truncated at 1MiB | Extension | PBT | `src/widgets/FileViewerWidget.property.test.tsx:40` UC3-E6b1: files > 1MiB always show truncation warning | ✅ |
| UC3-E6b2 | Truncation warning shown | Extension | Unit | `src/widgets/FileViewerWidget.test.tsx:61` (asserts truncated notice) | ✅ |
| UC3-E9b1 | Binary file detected (null bytes) | Extension | Unit | `src/widgets/FileViewerWidget.test.tsx:73` UC3-E9b1 binary file rejected | ✅ |
| UC3-E9b1 | Binary file detected (null bytes) | Extension | PBT | `src/widgets/FileViewerWidget.property.test.tsx:57` UC3-E9b1: any content with null bytes always triggers binary warning | ✅ |
| UC3-E9b2 | Binary error message shown | Extension | Unit | `src/widgets/FileViewerWidget.test.tsx:73` (asserts binary error text) | ✅ |
| UC3-E9b3 | No content rendered for binary files | Extension | Unit | `src/widgets/FileViewerWidget.test.tsx:73` (asserts no content element) | ✅ |
| UC4 | Webpage Viewer Full Flow | Flow | Integration | `src/widgets/WebpageViewerWidget.test.tsx` | ✅ |
| UC4-S1 | System adds a webpage viewer widget | Step | Unit | `src/widgets/WebpageViewerWidget.test.tsx:12` UC4-S1 renders without crashing | ✅ |
| UC4-S2 | URL input and prompt on first add | Step | Unit | `src/widgets/WebpageViewerWidget.test.tsx:18` UC4-S2 URL input and Go button visible on new widget | ✅ |
| UC4-S2 | URL input and prompt on first add | Step | PBT | `src/widgets/WebpageViewerWidget.property.test.tsx:18` UC4-S2: any widget id with no settings shows URL input | ✅ |
| UC4-S3 | User types URL into input | Step | Unit | `src/widgets/WebpageViewerWidget.test.tsx:27` UC4-S3 URL input accepts typed text | ✅ |
| UC4-S4 | User clicks Go button | Step | Unit | `src/widgets/WebpageViewerWidget.test.tsx:27` (Go button click triggers navigation) | ✅ |
| UC4-S5 | Valid URL accepted and iframe shown | Step | Unit | `src/widgets/WebpageViewerWidget.test.tsx:37` UC4-S5 valid URL shows iframe | ✅ |
| UC4-S5 | Valid URL accepted and iframe shown | Step | PBT | `src/widgets/WebpageViewerWidget.property.test.tsx:71` UC4-S5: any valid https URL sets iframe src | ✅ |
| UC4-S6 | Iframe is sandboxed | Step | Unit | `src/widgets/WebpageViewerWidget.test.tsx:49` UC4-S6 iframe has sandbox attribute | ✅ |
| UC4-S6 | Iframe is sandboxed | Step | PBT | `src/widgets/WebpageViewerWidget.property.test.tsx:99` UC4-S6: iframe always has all four required sandbox values | ✅ |
| UC4-S7 | URL saved after submission | Step | Unit | `src/widgets/WebpageViewerWidget.test.tsx:60` UC4-S7 onSettingsChange called with url | ✅ |
| UC4-S7 | URL saved after submission | Step | PBT | `src/widgets/WebpageViewerWidget.property.test.tsx:128` UC4-S7: onSettingsChange always called with correct url settings | ✅ |
| UC4-E4a1 | Saved URL pre-fills input on restore | Extension | Unit | `src/widgets/WebpageViewerWidget.test.tsx:71` UC4-E4a1 saved URL pre-fills input on mount | ✅ |
| UC4-E4a1 | Saved URL pre-fills input on restore | Extension | PBT | `src/widgets/WebpageViewerWidget.property.test.tsx:153` UC4-E4a1/E4a2: saved URL always pre-fills input and auto-loads iframe | ✅ |
| UC4-E4a2 | Saved URL auto-loads on restore | Extension | Unit | `src/widgets/WebpageViewerWidget.test.tsx:71` (asserts iframe src on mount) | ✅ |
| UC4-E5a1 | Malformed URL shows error, no iframe | Extension | Unit | `src/widgets/WebpageViewerWidget.test.tsx:82` UC4-E5a1 malformed URL shows error | ✅ |
| UC4-E5a1 | Malformed URL shows error, no iframe | Extension | PBT | `src/widgets/WebpageViewerWidget.property.test.tsx:39` UC4-E5a1: validation error shown for all URLs new URL() rejects | ✅ |
| UC4-E8a1 | Site detects embedding blocked | Extension | Unit | `src/widgets/WebpageViewerWidget.test.tsx:96` UC4-E8a1 embed-blocked detection | ⚠️ |
| UC4-E8a2 | X-Frame-Options blocked detection | Extension | Unit | `src/widgets/WebpageViewerWidget.test.tsx:96` (partial — jsdom limitation) | ⚠️ |
| UC4-E8a3 | Embed-blocked warning message shown | Extension | Unit | `src/widgets/WebpageViewerWidget.test.tsx:96` (asserts embed-blocked element) | ✅ |
| UC4-E8a4 | URL shown in blocked warning | Extension | Unit | `src/widgets/WebpageViewerWidget.test.tsx:96` (asserts URL in message) | ✅ |
| UC4-E9a1 | Direct link provided for embed-blocked | Extension | Unit | `src/widgets/WebpageViewerWidget.test.tsx:108` UC4-E9a1 direct link in blocked message | ✅ |
| UC4-E9a1 | Direct link provided for embed-blocked | Extension | PBT | `src/widgets/WebpageViewerWidget.property.test.tsx` | ⚠️ |
| UC5 | Change/Replace Content Full Flow | Flow | Integration | `src/widgets/ImageViewerWidget.test.tsx`, `src/widgets/FileViewerWidget.test.tsx` | ✅ |
| UC5-S1 | Change button visible on loaded content | Step | Unit | `src/widgets/ImageViewerWidget.test.tsx:128` UC2-E8b1 change image button present | ✅ |
| UC5-S2 | Change button reopens picker | Step | Unit | `src/widgets/ImageViewerWidget.test.tsx:128` (picker mode re-opened) | ✅ |
| UC5-E3a1 | Clearing input without submit preserves content | Extension | Unit | `src/widgets/WebpageViewerWidget.test.tsx:119` UC5-E3a1 clearing input preserves iframe | ✅ |
| UC5-E3a1 | Clearing input without submit preserves content | Extension | PBT | `src/widgets/WebpageViewerWidget.property.test.tsx:179` UC5-E3a1: clearing URL input never changes iframe src | ✅ |
| UC6 | Settings Persistence Full Flow | Flow | Integration | `src/hooks/useDashboardLayout.test.ts` | ✅ |
| UC6-S1 | Widget settings saved to localStorage | Step | Unit | `src/hooks/useDashboardLayout.test.ts` updateWidgetSettings triggers debounced write | ✅ |
| UC6-S2 | Settings keyed by widget ID | Step | Unit | `src/hooks/useDashboardLayout.test.ts` loadSettings returns correct shape | ✅ |
| UC6-S3 | Settings loaded on dashboard mount | Step | Unit | `src/hooks/useDashboardLayout.test.ts` loadSettings returns {} when absent | ✅ |
| UC6-S4 | Stale widget settings pruned | Step | Unit | `src/hooks/useDashboardLayout.test.ts` stale settings pruned on mount | ✅ |
| UC6-S5 | URL-mode restored with img src | Step | Unit | `src/widgets/ImageViewerWidget.test.tsx:138` UC6-S5 URL-mode image restored from settings | ✅ |
| UC6-S5 | URL-mode restored with img src | Step | PBT | `src/widgets/ImageViewerWidget.property.test.tsx:149` UC6-S5: img src always equals normalized saved URL | ✅ |
| UC6-S6 | File-mode shows reload hint | Step | Unit | `src/widgets/FileViewerWidget.test.tsx:86` UC6-S6 file-mode reload hint shown | ✅ |
| UC6-S6 | File-mode shows reload hint | Step | PBT | `src/widgets/FileViewerWidget.property.test.tsx:113` UC6-S6: file-mode always shows fileName in reload hint | ✅ |
| UC6-S7 | Webpage viewer restores with iframe | Step | Unit | `src/widgets/WebpageViewerWidget.test.tsx:71` (auto-loads iframe on mount) | ✅ |
| UC6-E5a1 | Corrupt settings ignored, empty state shown | Extension | Unit | `src/hooks/useDashboardLayout.test.ts` corrupt JSON fallback | ✅ |

## PBT Coverage

| UC Step | Scenario | PBT Test | Framework | Status |
|---------|----------|----------|-----------|--------|
| UC1-S2 | WHEN clock mounts with any widget id THEN time and date elements are non-empty | `src/widgets/ClockWidget.property.test.tsx:21` | fast-check | ✅ |
| UC1-S4 | WHEN two distinct timestamps are compared THEN toLocaleTimeString values differ | `src/widgets/ClockWidget.property.test.tsx:46` | fast-check | ✅ |
| UC1-E1a2 | WHEN clock rendered with any props THEN no input/button/iframe rendered | `src/widgets/ClockWidget.property.test.tsx:71` | fast-check | ✅ |
| UC1-E5a1 | WHEN clock mounts and unmounts with any id THEN clearInterval always called | `src/widgets/ClockWidget.property.test.tsx:96` | fast-check | ✅ |
| UC2-S2 | WHEN image viewer mounts with any id and no settings THEN empty-state shown | `src/widgets/ImageViewerWidget.property.test.tsx:18` | fast-check | ✅ |
| UC2-E4a3 | WHEN valid https URL confirmed via Load THEN img src equals normalized URL | `src/widgets/ImageViewerWidget.property.test.tsx:39` | fast-check | ✅ |
| UC2-E6a1 | WHEN non-image MIME type file selected THEN error shown and no img rendered | `src/widgets/ImageViewerWidget.property.test.tsx:78` | fast-check | ✅ |
| UC2-S7 | WHEN valid URL confirmed THEN onSettingsChange called with correct url shape | `src/widgets/ImageViewerWidget.property.test.tsx:114` | fast-check | ✅ |
| UC6-S5 | WHEN image viewer mounts with saved url settings THEN img src equals normalized URL | `src/widgets/ImageViewerWidget.property.test.tsx:149` | fast-check | ✅ |
| UC3-S2 | WHEN file viewer mounts with any id and no settings THEN empty-state shown | `src/widgets/FileViewerWidget.property.test.tsx:20` | fast-check | ✅ |
| UC3-E6b1 | WHEN file size > 1MiB THEN truncation warning always shown | `src/widgets/FileViewerWidget.property.test.tsx:40` | fast-check | ✅ |
| UC3-E9b1 | WHEN file content contains null bytes THEN binary warning always shown | `src/widgets/FileViewerWidget.property.test.tsx:57` | fast-check | ✅ |
| UC3-S7 | WHEN any file selected THEN onSettingsChange called with fileName | `src/widgets/FileViewerWidget.property.test.tsx:85` | fast-check | ✅ |
| UC6-S6 | WHEN file viewer mounts with file settings THEN fileName shown in reload hint | `src/widgets/FileViewerWidget.property.test.tsx:113` | fast-check | ✅ |
| UC3-S4 | WHEN any non-binary text file selected THEN content always displayed | `src/widgets/FileViewerWidget.property.test.tsx` | fast-check | ✅ |
| UC3-S8 | WHEN content loaded THEN scrollable area always present | `src/widgets/FileViewerWidget.property.test.tsx` | fast-check | ✅ |
| UC4-S2 | WHEN webpage viewer mounts with any id and no settings THEN URL input shown | `src/widgets/WebpageViewerWidget.property.test.tsx:18` | fast-check | ✅ |
| UC4-E5a1 | WHEN URL that new URL() rejects is submitted THEN error shown, no iframe | `src/widgets/WebpageViewerWidget.property.test.tsx:39` | fast-check | ✅ |
| UC4-S5 | WHEN valid https URL submitted THEN iframe src equals normalized URL | `src/widgets/WebpageViewerWidget.property.test.tsx:71` | fast-check | ✅ |
| UC4-S6 | WHEN valid URL submitted THEN iframe sandbox has all four required values | `src/widgets/WebpageViewerWidget.property.test.tsx:99` | fast-check | ✅ |
| UC4-S7 | WHEN valid URL submitted THEN onSettingsChange called with correct url settings | `src/widgets/WebpageViewerWidget.property.test.tsx:128` | fast-check | ✅ |
| UC4-E4a1 | WHEN webpage viewer mounts with saved url settings THEN input pre-filled and iframe shown | `src/widgets/WebpageViewerWidget.property.test.tsx:153` | fast-check | ✅ |
| UC5-E3a1 | WHEN input cleared without submitting THEN iframe src unchanged | `src/widgets/WebpageViewerWidget.property.test.tsx:179` | fast-check | ✅ |
| UC4-E8a1 | WHEN iframe onLoad fires with empty body THEN embed-blocked warning shown | — | fast-check | ❌ missing |
| UC4-E9a1 | WHEN embed blocked THEN direct link always points to submitted URL | — | fast-check | ❌ missing |

## Use Case Details: Clock Widget (ID: UC1)

### Main Scenario
- **UC1-S1**: System adds a clock widget to the grid
  - `src/widgets/ClockWidget.test.tsx:8` UC1-S1 clock renders without crashing (Unit)
- **UC1-S2**: Clock renders current time and date
  - `src/widgets/ClockWidget.test.tsx:14` UC1-S2 renders time and date on mount (Unit)
  - `src/widgets/ClockWidget.property.test.tsx:21` UC1-S2: clock always renders non-empty time and date for any widget id (PBT)
- **UC1-S3**: Time string is non-empty
  - `src/widgets/ClockWidget.test.tsx:14` (asserts textContent.length > 0) (Unit)
- **UC1-S4**: Time updates each second via setInterval
  - `src/widgets/ClockWidget.test.tsx:29` UC1-S4 time updates after one second (Unit)
  - `src/widgets/ClockWidget.property.test.tsx:46` UC1-S4: time display text differs when Date returns different values (PBT)

### Extensions
- **UC1-E1a1**: Settings icon → configuration panel (clock has none)
  - `src/widgets/ClockWidget.test.tsx:40` UC1-E1a1 no config UI rendered (Unit)
- **UC1-E1a2**: Clock has no configurable options
  - `src/widgets/ClockWidget.test.tsx:40` no input/button/iframe rendered (Unit)
  - `src/widgets/ClockWidget.property.test.tsx:71` UC1-E1a2: clock never renders input/button/iframe regardless of props (PBT)
- **UC1-E5a1**: Timer cleared when widget removed
  - `src/widgets/ClockWidget.test.tsx:47` UC1-E5a1 clearInterval called on unmount (Unit)
  - `src/widgets/ClockWidget.property.test.tsx:96` UC1-E5a1: clearInterval always called on unmount for any widget id (PBT)

### Full Flow Tests
- `UC1` — "Clock Widget Full Flow" → `src/widgets/ClockWidget.test.tsx` (Integration)

---

## Use Case Details: Image Viewer Widget (ID: UC2)

### Main Scenario
- **UC2-S1**: System adds an image viewer widget
  - `src/widgets/ImageViewerWidget.test.tsx:12` UC2-S1 renders without crashing (Unit)
- **UC2-S2**: Widget shows empty-state prompt with no saved source
  - `src/widgets/ImageViewerWidget.test.tsx:18` UC2-S2 empty state on new widget (Unit)
  - `src/widgets/ImageViewerWidget.property.test.tsx:18` UC2-S2: any widget id with no settings always shows empty-state prompt (PBT)
- **UC2-S3**: Source picker opens showing two options
  - `src/widgets/ImageViewerWidget.test.tsx:26` UC2-S3 source picker shown after button click (Unit)
- **UC2-S4**: Picker offers "Select file" and "Enter URL"
  - `src/widgets/ImageViewerWidget.test.tsx:26` (asserts both buttons present) (Unit)
- **UC2-S5**: User selects file from filesystem
  - `src/widgets/ImageViewerWidget.test.tsx:37` UC2-S5 selecting image file shows img (Unit)
- **UC2-S6**: File validated as image type
  - `src/widgets/ImageViewerWidget.test.tsx:37` (MIME type startsWith 'image/') (Unit)
- **UC2-S7**: Settings persisted via onSettingsChange
  - `src/widgets/ImageViewerWidget.test.tsx:56` UC2-S7 onSettingsChange called with file settings (Unit)
  - `src/widgets/ImageViewerWidget.property.test.tsx:114` UC2-S7: onSettingsChange always called with correct url settings shape (PBT)
- **UC2-S8**: Image displayed fitting the widget area
  - `src/widgets/ImageViewerWidget.test.tsx:67` UC2-S8 image displayed with object-fit contain (Unit)

### Extensions
- **UC2-E4a1**: User chooses URL entry mode
  - `src/widgets/ImageViewerWidget.test.tsx:76` UC2-E4a1 URL entry mode shown (Unit)
- **UC2-E4a2**: URL input field shown
  - `src/widgets/ImageViewerWidget.test.tsx:76` (asserts .image-viewer__url-input present) (Unit)
- **UC2-E4a3**: URL confirmed and image shown
  - `src/widgets/ImageViewerWidget.test.tsx:88` UC2-E4a3 image shown after URL load (Unit)
  - `src/widgets/ImageViewerWidget.property.test.tsx:39` UC2-E4a3: any valid URL confirmed via Load button sets img src (PBT)
- **UC2-E6a1**: Non-image file rejected with error
  - `src/widgets/ImageViewerWidget.test.tsx:103` UC2-E6a1 non-image file rejected (Unit)
  - `src/widgets/ImageViewerWidget.property.test.tsx:78` UC2-E6a1: non-image MIME types always trigger format error (PBT)
- **UC2-E8a1**: Broken image shows load error
  - `src/widgets/ImageViewerWidget.test.tsx:117` UC2-E8a1 broken image shows load error (Unit)
- **UC2-E8b1**: Change button present when image loaded
  - `src/widgets/ImageViewerWidget.test.tsx:128` UC2-E8b1 change image button present (Unit)

### Full Flow Tests
- `UC2` — "Image Viewer Full Flow" → `src/widgets/ImageViewerWidget.test.tsx` (Integration)

---

## Use Case Details: File Viewer Widget (ID: UC3)

### Main Scenario
- **UC3-S1**: System adds a file viewer widget
  - `src/widgets/FileViewerWidget.test.tsx:12` UC3-S1 renders without crashing (Unit)
- **UC3-S2**: Widget shows empty-state prompt with no saved file
  - `src/widgets/FileViewerWidget.test.tsx:18` UC3-S2 empty state on new widget (Unit)
  - `src/widgets/FileViewerWidget.property.test.tsx:20` UC3-S2: any widget id with no settings always shows empty state (PBT)
- **UC3-S3**: User clicks to open file picker
  - `src/widgets/FileViewerWidget.test.tsx:26` UC3-S3 file picker opens (Unit)
- **UC3-S4**: User selects a text file
  - `src/widgets/FileViewerWidget.test.tsx:34` UC3-S4 text file content displayed (Unit)
- **UC3-S5**: File name shown in header
  - `src/widgets/FileViewerWidget.test.tsx:34` (asserts fileName in header) (Unit)
- **UC3-S6**: File read with FileReader API
  - `src/widgets/FileViewerWidget.test.tsx:34` (FileReader mock triggered) (Unit)
- **UC3-S7**: Settings persisted via onSettingsChange
  - `src/widgets/FileViewerWidget.test.tsx:48` UC3-S7 onSettingsChange called with fileName (Unit)
  - `src/widgets/FileViewerWidget.property.test.tsx:85` UC3-S7: onSettingsChange always called with fileName for any file name (PBT)
- **UC3-S8**: File content displayed in scrollable area
  - `src/widgets/FileViewerWidget.test.tsx:34` (asserts content element present) (Unit)

### Extensions
- **UC3-E6b1**: Large file truncated at 1MiB
  - `src/widgets/FileViewerWidget.test.tsx:61` UC3-E6b1 large file truncated (Unit)
  - `src/widgets/FileViewerWidget.property.test.tsx:40` UC3-E6b1: files > 1MiB always show truncation warning (PBT)
- **UC3-E6b2**: Truncation warning shown
  - `src/widgets/FileViewerWidget.test.tsx:61` (asserts truncated notice) (Unit)
- **UC3-E9b1**: Binary file detected (null bytes in content)
  - `src/widgets/FileViewerWidget.test.tsx:73` UC3-E9b1 binary file rejected (Unit)
  - `src/widgets/FileViewerWidget.property.test.tsx:57` UC3-E9b1: any content with null bytes always triggers binary warning (PBT)
- **UC3-E9b2**: Binary error message shown
  - `src/widgets/FileViewerWidget.test.tsx:73` (asserts binary error text) (Unit)
- **UC3-E9b3**: No content rendered for binary files
  - `src/widgets/FileViewerWidget.test.tsx:73` (asserts no pre element) (Unit)

### Full Flow Tests
- `UC3` — "File Viewer Full Flow" → `src/widgets/FileViewerWidget.test.tsx` (Integration)

---

## Use Case Details: Webpage Viewer Widget (ID: UC4)

### Main Scenario
- **UC4-S1**: System adds a webpage viewer widget
  - `src/widgets/WebpageViewerWidget.test.tsx:12` UC4-S1 renders without crashing (Unit)
- **UC4-S2**: URL input and prompt shown on first add
  - `src/widgets/WebpageViewerWidget.test.tsx:18` UC4-S2 URL input and Go button visible on new widget (Unit)
  - `src/widgets/WebpageViewerWidget.property.test.tsx:18` UC4-S2: any widget id with no settings always shows URL input but no iframe (PBT)
- **UC4-S3**: User types URL into input
  - `src/widgets/WebpageViewerWidget.test.tsx:27` UC4-S3 URL input accepts typed text (Unit)
- **UC4-S4**: User clicks Go button to navigate
  - `src/widgets/WebpageViewerWidget.test.tsx:27` (Go button click triggers navigation) (Unit)
- **UC4-S5**: Valid URL accepted and iframe shown
  - `src/widgets/WebpageViewerWidget.test.tsx:37` UC4-S5 valid URL shows iframe (Unit)
  - `src/widgets/WebpageViewerWidget.property.test.tsx:71` UC4-S5: any valid https URL sets iframe src to normalized URL (PBT)
- **UC4-S6**: Iframe is sandboxed with required permissions
  - `src/widgets/WebpageViewerWidget.test.tsx:49` UC4-S6 iframe has sandbox attribute (Unit)
  - `src/widgets/WebpageViewerWidget.property.test.tsx:99` UC4-S6: iframe always has all four required sandbox values for any valid URL (PBT)
- **UC4-S7**: URL saved after submission
  - `src/widgets/WebpageViewerWidget.test.tsx:60` UC4-S7 onSettingsChange called with url (Unit)
  - `src/widgets/WebpageViewerWidget.property.test.tsx:128` UC4-S7: onSettingsChange always called with correct url settings for any valid URL (PBT)

### Extensions
- **UC4-E4a1**: Saved URL pre-fills input on restore
  - `src/widgets/WebpageViewerWidget.test.tsx:71` UC4-E4a1 saved URL pre-fills input on mount (Unit)
  - `src/widgets/WebpageViewerWidget.property.test.tsx:153` UC4-E4a1/E4a2: saved URL always pre-fills input and auto-loads iframe on mount (PBT)
- **UC4-E4a2**: Saved URL auto-loads iframe on restore
  - `src/widgets/WebpageViewerWidget.test.tsx:71` (asserts iframe src on mount) (Unit)
- **UC4-E5a1**: Malformed URL shows error message, no iframe
  - `src/widgets/WebpageViewerWidget.test.tsx:82` UC4-E5a1 malformed URL shows error (Unit)
  - `src/widgets/WebpageViewerWidget.property.test.tsx:39` UC4-E5a1: validation error shown and iframe absent for all URLs that new URL() rejects (PBT)
- **UC4-E8a1**: Site detects embedding is blocked (blank document heuristic)
  - `src/widgets/WebpageViewerWidget.test.tsx:96` UC4-E8a1 embed-blocked detection (Unit, partial — jsdom limitation)
- **UC4-E8a2**: X-Frame-Options blocked detection
  - `src/widgets/WebpageViewerWidget.test.tsx:96` (partial — jsdom cannot simulate cross-origin iframe) (Unit)
- **UC4-E8a3**: Embed-blocked warning message shown
  - `src/widgets/WebpageViewerWidget.test.tsx:96` (asserts embed-blocked element) (Unit)
- **UC4-E8a4**: URL shown in blocked warning message
  - `src/widgets/WebpageViewerWidget.test.tsx:96` (asserts URL in message) (Unit)
- **UC4-E9a1**: Direct link provided for embed-blocked sites
  - `src/widgets/WebpageViewerWidget.test.tsx:108` UC4-E9a1 direct link in blocked message (Unit)

### Full Flow Tests
- `UC4` — "Webpage Viewer Full Flow" → `src/widgets/WebpageViewerWidget.test.tsx` (Integration)

---

## Use Case Details: Change/Replace Content (ID: UC5)

### Main Scenario
- **UC5-S1**: Change button visible on loaded content
  - `src/widgets/ImageViewerWidget.test.tsx:128` (change image button present) (Unit)
- **UC5-S2**: Change button reopens source picker
  - `src/widgets/ImageViewerWidget.test.tsx:128` (picker mode re-opened) (Unit)

### Extensions
- **UC5-E3a1**: Clearing input without submitting preserves currently loaded content
  - `src/widgets/WebpageViewerWidget.test.tsx:119` UC5-E3a1 clearing input preserves iframe (Unit)
  - `src/widgets/WebpageViewerWidget.property.test.tsx:179` UC5-E3a1: clearing URL input without submitting never changes iframe src (PBT)

### Full Flow Tests
- `UC5` — "Change/Replace Content" → `src/widgets/ImageViewerWidget.test.tsx`, `src/widgets/WebpageViewerWidget.test.tsx` (Integration)

---

## Use Case Details: Settings Persistence (ID: UC6)

### Main Scenario
- **UC6-S1**: Widget settings saved to localStorage on change
  - `src/hooks/useDashboardLayout.test.ts` updateWidgetSettings triggers debounced write (Unit)
- **UC6-S2**: Settings keyed by widget ID
  - `src/hooks/useDashboardLayout.test.ts` loadSettings returns correct shape (Unit)
- **UC6-S3**: Settings loaded on dashboard mount
  - `src/hooks/useDashboardLayout.test.ts` loadSettings returns {} when absent (Unit)
- **UC6-S4**: Stale widget settings pruned on mount
  - `src/hooks/useDashboardLayout.test.ts` stale settings pruned on mount (Unit)
- **UC6-S5**: URL-mode image restored with img src set
  - `src/widgets/ImageViewerWidget.test.tsx:138` UC6-S5 URL-mode image restored from settings (Unit)
  - `src/widgets/ImageViewerWidget.property.test.tsx:149` UC6-S5: img src always equals normalized saved URL from settings on mount (PBT)
- **UC6-S6**: File-mode shows reload hint with file name
  - `src/widgets/FileViewerWidget.test.tsx:86` UC6-S6 file-mode reload hint shown (Unit)
  - `src/widgets/FileViewerWidget.property.test.tsx:113` UC6-S6: file-mode always shows fileName in reload hint for any file name (PBT)
- **UC6-S7**: Webpage viewer settings restore with iframe loaded
  - `src/widgets/WebpageViewerWidget.test.tsx:71` (auto-loads iframe on mount) (Unit)

### Extensions
- **UC6-E5a1**: Corrupt settings JSON ignored, empty state shown
  - `src/hooks/useDashboardLayout.test.ts` corrupt JSON fallback (Unit)

### Full Flow Tests
- `UC6` — "Settings Persistence Full Flow" → `src/hooks/useDashboardLayout.test.ts` (Integration)
