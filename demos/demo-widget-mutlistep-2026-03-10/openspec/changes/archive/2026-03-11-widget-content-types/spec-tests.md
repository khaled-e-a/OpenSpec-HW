# Spec-Test Mapping: widget-content-types
Generated: 2026-03-11

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC1 | Select or Change Widget Content Type — Full Flow | Flow | Integration | | ❌ |
| UC1-S1 | User activates the settings control on a widget | Step | Component | | ❌ |
| UC1-S2 | System opens settings panel showing current type and four available types | Step | Component | `src/components/dashboard/__tests__/WidgetSettings.test.tsx` | ✅ |
| UC1-S3 | User selects a content type | Step | Component | `src/components/dashboard/__tests__/WidgetSettings.test.tsx` | ✅ |
| UC1-S4 | System updates the widget to selected type and closes the panel | Step | Component | `src/components/dashboard/__tests__/WidgetSettings.test.tsx` | ✅ |
| UC1-S5 | Widget renders the new content type immediately | Step | Component | `src/components/dashboard/__tests__/WidgetContent.test.tsx` | ✅ |
| UC1-E3a | User selects the same type already active — no change | Extension | Component | `src/components/dashboard/__tests__/WidgetSettings.test.tsx` | ✅ |
| UC1-E3b | User dismisses the settings panel without selecting a type | Extension | Component | `src/components/dashboard/__tests__/WidgetSettings.test.tsx` | ✅ |
| UC1-E5a | Selected type has no configured source — placeholder state | Extension | Component | `src/components/dashboard/__tests__/WidgetContent.test.tsx` | ✅ |
| UC2 | View Current Time on Dashboard — Full Flow | Flow | Integration | | ❌ |
| UC2-S1 | System renders the widget using the clock content component | Step | Component | `src/components/dashboard/__tests__/WidgetContent.test.tsx`, `src/components/dashboard/__tests__/ClockContent.test.tsx` | ✅ |
| UC2-S2 | System displays the current local time in a readable format | Step | Unit | `src/components/dashboard/__tests__/ClockContent.test.tsx` | ✅ |
| UC2-S3 | System refreshes the displayed time every second | Step | Unit | `src/components/dashboard/__tests__/ClockContent.test.tsx` | ✅ |
| UC2-S4 | Time remains current for as long as the widget is visible | Step | Unit | `src/components/dashboard/__tests__/ClockContent.test.tsx` | ✅ |
| UC3 | Display a Personal Image — Full Flow | Flow | Integration | | ❌ |
| UC3-S1 | User activates the file-selection control inside the image widget | Step | Component | `src/components/dashboard/__tests__/ImageContent.test.tsx` | ✅ |
| UC3-S2 | System opens the OS file picker filtered to image file types | Step | Component | `src/components/dashboard/__tests__/ImageContent.test.tsx` | ✅ |
| UC3-S3 | User selects an image file and confirms | Step | Component | `src/components/dashboard/__tests__/ImageContent.test.tsx` | ✅ |
| UC3-S4 | System reads the selected image and renders it scaled to fit | Step | Component | `src/components/dashboard/__tests__/ImageContent.test.tsx` | ✅ |
| UC3-S5 | System retains the image source for subsequent renders | Step | Component | `src/components/dashboard/__tests__/ImageContent.test.tsx` | ✅ |
| UC3-E3a | User cancels the file picker — widget remains in current state | Extension | Component | `src/components/dashboard/__tests__/ImageContent.test.tsx` | ✅ |
| UC3-E4a | Selected file is not a valid image — error shown | Extension | Component | `src/components/dashboard/__tests__/ImageContent.test.tsx` | ✅ |
| UC3-E5a | User replaces the current image by re-activating selection | Extension | Component | `src/components/dashboard/__tests__/ImageContent.test.tsx` | ✅ |
| UC4 | Display Contents of a Local File — Full Flow | Flow | Integration | | ❌ |
| UC4-S1 | User activates the file-selection control inside the file widget | Step | Component | `src/components/dashboard/__tests__/FileContent.test.tsx` | ✅ |
| UC4-S2 | System opens the OS file picker | Step | Component | `src/components/dashboard/__tests__/FileContent.test.tsx` | ✅ |
| UC4-S3 | User selects a file and confirms | Step | Component | `src/components/dashboard/__tests__/FileContent.test.tsx` | ✅ |
| UC4-S4 | System reads the file's text content and renders it as scrollable text | Step | Component | `src/components/dashboard/__tests__/FileContent.test.tsx` | ✅ |
| UC4-S5 | System retains the file reference for subsequent renders | Step | Component | `src/components/dashboard/__tests__/FileContent.test.tsx` | ✅ |
| UC4-E3a | User cancels the file picker — widget unchanged | Extension | Component | `src/components/dashboard/__tests__/FileContent.test.tsx` | ✅ |
| UC4-E4a | File cannot be read — error shown, re-selection prompted | Extension | Component | `src/components/dashboard/__tests__/FileContent.test.tsx` | ✅ |
| UC4-E5a | User changes the displayed file by re-activating selection | Extension | Component | `src/components/dashboard/__tests__/FileContent.test.tsx` | ✅ |
| UC5 | Embed a Webpage — Full Flow | Flow | Integration | | ❌ |
| UC5-S1 | User activates the URL input control inside the webpage widget | Step | Component | `src/components/dashboard/__tests__/WebpageContent.test.tsx` | ✅ |
| UC5-S2 | System presents an editable URL field pre-populated with current URL | Step | Component | `src/components/dashboard/__tests__/WebpageContent.test.tsx` | ✅ |
| UC5-S3 | User enters or edits the URL and confirms | Step | Component | `src/components/dashboard/__tests__/WebpageContent.test.tsx` | ✅ |
| UC5-S4 | System loads the URL in a sandboxed iframe within the widget | Step | Component | `src/components/dashboard/__tests__/WebpageContent.test.tsx` | ✅ |
| UC5-S5 | Webpage is displayed; user can interact with the embedded page | Step | Component | `src/components/dashboard/__tests__/WebpageContent.test.tsx` | ⚠️ |
| UC5-E3a | User confirms without entering a URL — iframe removed, placeholder shown | Extension | Component | `src/components/dashboard/__tests__/WebpageContent.test.tsx` | ✅ |
| UC5-E3b | User dismisses URL input without confirming — widget unchanged | Extension | Component | `src/components/dashboard/__tests__/WebpageContent.test.tsx` | ✅ |
| UC5-E4a | Page refuses embedding (X-Frame-Options) — error indicator shown | Extension | Component | `src/components/dashboard/__tests__/WebpageContent.test.tsx` | ❌ |
| UC5-E4b | URL malformed or unreachable — load-error shown | Extension | Component | `src/components/dashboard/__tests__/WebpageContent.test.tsx` | ❌ |
| UC5-E5a | User changes the URL by re-activating the URL input | Extension | Component | `src/components/dashboard/__tests__/WebpageContent.test.tsx` | ✅ |

---

## Use Case Details: Select or Change Widget Content Type (ID: UC1)

### Main Scenario
- **UC1-S1**: User activates the settings control on a widget
  - ❌ No dedicated test — gear-icon trigger on the parent widget is not tested at component level
- **UC1-S2**: System opens a settings panel showing the current type and the four available types
  - `src/components/dashboard/__tests__/WidgetSettings.test.tsx:27` "renders all four widget type options" (Component)
  - `src/components/dashboard/__tests__/WidgetSettings.test.tsx:42` "highlights the current type" (Component)
  - `src/components/dashboard/__tests__/WidgetSettings.test.tsx:55` "positions panel absolutely at top-right of viewport" (Component)
- **UC1-S3**: User selects a content type
  - `src/components/dashboard/__tests__/WidgetSettings.test.tsx:72` "calls onConfigChange with selected type when user clicks a different type" (Component)
  - `src/components/dashboard/__tests__/WidgetSettings.test.tsx:86` "calls onConfigChange with correct type for each option" (Component)
- **UC1-S4**: System updates the widget to the selected type and closes the settings panel
  - `src/components/dashboard/__tests__/WidgetSettings.test.tsx:105` "calls onClose after type selection" (Component)
- **UC1-S5**: Widget renders the new content type immediately
  - `src/components/dashboard/__tests__/WidgetContent.test.tsx:23` "renders ClockContent for type: clock" (Component)
  - `src/components/dashboard/__tests__/WidgetContent.test.tsx:43` "renders ImageContent for type: image" (Component)
  - `src/components/dashboard/__tests__/WidgetContent.test.tsx:61` "renders FileContent for type: file" (Component)
  - `src/components/dashboard/__tests__/WidgetContent.test.tsx:79` "renders WebpageContent for type: webpage" (Component)

### Extensions
- **UC1-E3a**: User selects the same type that is already active — no change
  - `src/components/dashboard/__tests__/WidgetSettings.test.tsx:121` "does not call onConfigChange when selecting current type" (Component)
- **UC1-E3b**: User dismisses the settings panel without selecting a type
  - `src/components/dashboard/__tests__/WidgetSettings.test.tsx:138` "calls onClose when clicking outside panel" (Component)
  - `src/components/dashboard/__tests__/WidgetSettings.test.tsx:151` "does not call onConfigChange when dismissed" (Component)
- **UC1-E5a**: Selected type requires a source but none is configured — placeholder state
  - `src/components/dashboard/__tests__/WidgetContent.test.tsx:100` "renders image placeholder when no imageDataUrl is configured" (Component)
  - `src/components/dashboard/__tests__/WidgetContent.test.tsx:118` "renders file placeholder when no fileText is configured" (Component)
  - `src/components/dashboard/__tests__/WidgetContent.test.tsx:136` "renders webpage placeholder when no webpageUrl is configured" (Component)

### Full Flow Tests
- `UC1` — "Select or Change Widget Content Type" → ❌ No integration test

---

## Use Case Details: View Current Time on Dashboard (ID: UC2)

### Main Scenario
- **UC2-S1**: System renders the widget using the clock content component
  - `src/components/dashboard/__tests__/WidgetContent.test.tsx:156` "renders clock content when type is clock" (Component)
  - `src/components/dashboard/__tests__/WidgetContent.test.tsx:23` "renders ClockContent for type: clock" (Component)
  - `src/components/dashboard/__tests__/ClockContent.test.tsx:116` "mounts without errors" (Unit)
- **UC2-S2**: System displays the current local time in a readable format
  - `src/components/dashboard/__tests__/ClockContent.test.tsx:24` "renders current time in HH:MM:SS format" (Unit)
  - `src/components/dashboard/__tests__/ClockContent.test.tsx:33` "uses toLocaleTimeString for locale-specific formatting" (Unit)
  - `src/components/dashboard/__tests__/ClockContent.test.tsx:43` "displays time in a large, centered container" (Unit)
- **UC2-S3**: System refreshes the displayed time every second
  - `src/components/dashboard/__tests__/ClockContent.test.tsx:57` "updates time display every second" (Unit)
  - `src/components/dashboard/__tests__/ClockContent.test.tsx:73` "continues updating while component is mounted" (Unit)
- **UC2-S4**: Time remains current for as long as the widget is visible
  - `src/components/dashboard/__tests__/ClockContent.test.tsx:88` "clears interval on unmount" (Unit)
  - `src/components/dashboard/__tests__/ClockContent.test.tsx:97` "does not update after unmount" (Unit)
  - `src/components/dashboard/__tests__/ClockContent.test.tsx:120` "renders immediately on mount" (Unit)

### Extensions
*(none — clock type has no error states)*

### Full Flow Tests
- `UC2` — "View Current Time on Dashboard" → ❌ No integration test

---

## Use Case Details: Display a Personal Image (ID: UC3)

### Main Scenario
- **UC3-S1**: User activates the file-selection control inside the image widget
  - `src/components/dashboard/__tests__/ImageContent.test.tsx:40` "renders Choose image button when no image is selected" (Component)
  - `src/components/dashboard/__tests__/ImageContent.test.tsx:60` "triggers file input click when button is clicked" (Component)
- **UC3-S2**: System opens the OS file picker, filtered to image file types
  - `src/components/dashboard/__tests__/ImageContent.test.tsx:49` "renders hidden file input with image/* accept attribute" (Component)
- **UC3-S3**: User selects an image file and confirms
  - `src/components/dashboard/__tests__/ImageContent.test.tsx:116` "calls onConfigChange with imageDataUrl after file selection" (Component)
- **UC3-S4**: System reads the selected image and renders it inside the widget, scaled to fit
  - `src/components/dashboard/__tests__/ImageContent.test.tsx:77` "displays selected image when imageDataUrl is provided" (Component)
  - `src/components/dashboard/__tests__/ImageContent.test.tsx:91` "scales image to fit container with object-fit: contain" (Component)
  - `src/components/dashboard/__tests__/ImageContent.test.tsx:105` "shows Change image button when image is displayed" (Component)
- **UC3-S5**: System retains the image source for subsequent renders
  - `src/components/dashboard/__tests__/ImageContent.test.tsx:228` "retains image display between renders" (Component)

### Extensions
- **UC3-E3a**: User cancels the file picker without selecting a file
  - `src/components/dashboard/__tests__/ImageContent.test.tsx:142` "preserves current image when file picker is cancelled" (Component)
- **UC3-E4a**: Selected file is not a valid image — error shown, re-selection prompted
  - `src/components/dashboard/__tests__/ImageContent.test.tsx:164` "shows error message when image fails to load" (Component)
  - `src/components/dashboard/__tests__/ImageContent.test.tsx:181` "keeps file selection accessible after error" (Component)
- **UC3-E5a**: User replaces the current image by re-activating the selection control
  - `src/components/dashboard/__tests__/ImageContent.test.tsx:200` "allows changing current image via Change image button" (Component)

### Full Flow Tests
- `UC3` — "Display a Personal Image" → ❌ No integration test

---

## Use Case Details: Display Contents of a Local File (ID: UC4)

### Main Scenario
- **UC4-S1**: User activates the file-selection control inside the file widget
  - `src/components/dashboard/__tests__/FileContent.test.tsx:41` "renders Choose file button when no file is selected" (Component)
  - `src/components/dashboard/__tests__/FileContent.test.tsx:60` "triggers file input click when button is clicked" (Component)
- **UC4-S2**: System opens the OS file picker
  - `src/components/dashboard/__tests__/FileContent.test.tsx:50` "renders hidden file input" (Component)
- **UC4-S3**: User selects a file and confirms
  - `src/components/dashboard/__tests__/FileContent.test.tsx:136` "calls onConfigChange with fileText and fileLabel after file selection" (Component)
- **UC4-S4**: System reads the file's text content and renders it as scrollable text inside the widget
  - `src/components/dashboard/__tests__/FileContent.test.tsx:77` "displays file content when fileText is provided" (Component)
  - `src/components/dashboard/__tests__/FileContent.test.tsx:92` "renders file content in a scrollable pre element" (Component)
  - `src/components/dashboard/__tests__/FileContent.test.tsx:108` "displays file name as header" (Component)
- **UC4-S5**: System retains the file reference for subsequent renders
  - `src/components/dashboard/__tests__/FileContent.test.tsx:264` "retains file content between renders" (Component)

### Extensions
- **UC4-E3a**: User cancels the file picker — widget unchanged
  - `src/components/dashboard/__tests__/FileContent.test.tsx:165` "preserves current file when file picker is cancelled" (Component)
- **UC4-E4a**: File cannot be read — error shown, re-selection prompted
  - `src/components/dashboard/__tests__/FileContent.test.tsx:189` "shows error message when file cannot be read" (Component)
  - `src/components/dashboard/__tests__/FileContent.test.tsx:208` "keeps file selection accessible after error" (Component)
- **UC4-E5a**: User changes the displayed file by re-activating the selection control
  - `src/components/dashboard/__tests__/FileContent.test.tsx:231` "allows changing current file via Change file button" (Component)

### Full Flow Tests
- `UC4` — "Display Contents of a Local File" → ❌ No integration test

---

## Use Case Details: Embed a Webpage (ID: UC5)

### Main Scenario
- **UC5-S1**: User activates the URL input control inside the webpage widget
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:32` "shows No URL set placeholder when no URL is configured" (Component)
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:41` "shows URL input form when Enter URL is clicked" (Component)
- **UC5-S2**: System presents an editable URL field pre-populated with the current URL
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:55` "shows URL input form when URL is present but change is clicked" (Component)
- **UC5-S3**: User enters or edits the URL and confirms
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:74` "calls onConfigChange with URL when Load is clicked" (Component)
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:91` "submits on Enter key press" (Component)
- **UC5-S4**: System loads the URL in a sandboxed iframe within the widget
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:110` "renders iframe with sandbox attributes when URL is provided" (Component)
- **UC5-S5**: Webpage is displayed; user can interact with the embedded page
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:126` "displays URL in read-only input when iframe is shown" (Component) ⚠️ partial — iframe presence and URL bar only; actual page interaction not testable in jsdom
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:139` "shows embedding warning when iframe is displayed" (Component) ⚠️ partial

### Extensions
- **UC5-E3a**: User confirms without entering a URL — iframe removed, placeholder shown
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:152` "clears URL when Load is clicked with empty input" (Component)
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:172` "shows Clear button when input is empty" (Component)
- **UC5-E3b**: User dismisses URL input without confirming — widget unchanged
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:186` "closes input without changes on Cancel click" (Component)
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:200` "closes input without changes on Escape key" (Component)
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:217` "clears input on blur when empty" (Component)
- **UC5-E4a**: Page refuses embedding (X-Frame-Options) — error indicator shown
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:234` "shows error message when iframe fails to load" ❌ FAILS in jsdom — React `onError` on `<iframe>` does not fire; requires real browser (see TP-12 in test-plan.md)
- **UC5-E4b**: URL malformed or unreachable — load-error shown
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:249` "provides URL input after load error" ❌ FAILS in jsdom — same limitation as UC5-E4a (see TP-12 in test-plan.md)
- **UC5-E5a**: User changes the URL by re-activating the URL input
  - `src/components/dashboard/__tests__/WebpageContent.test.tsx:265` "allows changing URL via Change button" (Component)

### Full Flow Tests
- `UC5` — "Embed a Webpage" → ❌ No integration test

---

## Coverage Summary

| Use Case | Steps Covered | Extensions Covered | Overall |
|----------|--------------|-------------------|---------|
| UC1 — Select/Change Type | 4/5 (S1 ❌) | 3/3 | 78% |
| UC2 — Clock | 4/4 | n/a | 100% |
| UC3 — Image | 5/5 | 3/3 | 100% |
| UC4 — File Viewer | 5/5 | 3/3 | 100% |
| UC5 — Webpage | 4/5 (S5 ⚠️) | 3/5 (E4a ❌, E4b ❌) | 70% |
| **Totals** | **22/24** | **12/14** | **89%** |

**Gaps requiring action**:
- **UC1-S1** — No test for the settings-control trigger (gear icon click) on the parent widget component. A component test on `DraggableWidget` or similar could cover this.
- **UC5-E4a / UC5-E4b** — Iframe error events don't fire in jsdom. Covered by manual test plan (TP-12 in `test-plan.md`).
- **UC5-S5** — Only iframe presence is verified; interactive page behavior requires a real browser.
- **All UC full flows** — No integration tests exist. The test plan (TP-1 through TP-12) documents manual end-to-end verification steps.
