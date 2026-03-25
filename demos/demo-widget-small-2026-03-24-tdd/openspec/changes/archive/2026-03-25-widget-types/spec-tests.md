# spec-tests.md — widget-types

Generated: 2026-03-25

## Summary

| Metric | Value |
|--------|-------|
| PBT tests written (new) | 52 |
| Total test count (full suite) | 187 |
| Test files | 15 |
| UC steps covered | 40 / 44 |
| UC steps with no test (browser-only / not testable) | 4 |

---

## Requirement Traceability Matrix

Maps every use-case step from `usecases.md` to the test(s) that cover it.

Legend:
- ✅ Covered
- ❌ Missing / not testable in jsdom
- ⚠️ Partially covered (degenerate or jsdom-limited PBT)

| UC Step | Description | Test File(s) & Test Name | Status |
|---------|-------------|--------------------------|--------|
| UC1-S1 | User opens the dashboard | `WidgetContent.test.tsx` — "defaults to ClockWidget when type is undefined" | ✅ |
| UC1-S2 | System renders clock widget with current local time (HH:MM:SS) | `ClockWidget.test.tsx` — "renders current local time in HH:MM:SS format"<br>`widgetTypes.property.test.tsx` — S3, S1 | ✅ |
| UC1-S3 | System updates the clock display every second | `ClockWidget.test.tsx` — "updates time after one second", "clears interval on unmount"<br>`widgetTypes.property.test.tsx` — S4, S5 | ✅ |
| UC1-S4 | User reads the time | `ClockWidget.test.tsx` — "renders current local time in HH:MM:SS format" | ✅ |
| UC1-E4a1 | System resumes live updates after tab navigation | ❌ BROWSER-ONLY — requires tab focus/blur events unavailable in jsdom. See Test Plan section. | ❌ |
| UC2-S1 | User sees image widget (placeholder or previously chosen image) | `ImageWidget.test.tsx` — "shows placeholder when no imageUrl configured", "shows <img> when imageUrl is set"<br>`widgetTypes.property.test.tsx` — S6, S7 | ✅ |
| UC2-S2 | User opens the image widget config panel | `ImageWidget.test.tsx` — "clicking settings opens config panel"<br>`widgetTypes.property.test.tsx` — S29 | ✅ |
| UC2-S3 | System shows file picker accepting image files | `ImageWidget.test.tsx` — "config panel contains file input accepting image/*"<br>`widgetTypes.property.test.tsx` — S8 | ✅ |
| UC2-S4 | User selects an image file | `ImageWidget.test.tsx` — "calls onConfigChange with object URL for valid image"<br>`widgetTypes.property.test.tsx` — S9 | ✅ |
| UC2-S5 | System reads the file and generates an object URL | `ImageWidget.test.tsx` — "calls onConfigChange with object URL for valid image"<br>`widgetTypes.property.test.tsx` — S9, S32 | ✅ |
| UC2-S6 | System renders the selected image filling the widget area | `ImageWidget.test.tsx` — "shows <img> when imageUrl is set"<br>`widgetTypes.property.test.tsx` — S7 | ✅ |
| UC2-S7 | User closes the config panel | `ImageWidget.test.tsx` — "clicking close button closes panel"<br>`ConfigPanelUX.test.tsx` — "Escape closes ImageWidget config panel"<br>`widgetTypes.property.test.tsx` — S30, S31 | ✅ |
| UC2-E3a1 | System retains previous image when file picker is cancelled | `ImageWidget.test.tsx` — "closing panel without selecting keeps existing image"<br>`widgetTypes.property.test.tsx` — S11, S34 | ✅ |
| UC2-E4a1 | System shows error for non-image file selection | `ImageWidget.test.tsx` — "shows error and does not call onConfigChange for non-image file"<br>`widgetTypes.property.test.tsx` — S12, S35 | ✅ |
| UC3-S1 | User sees file widget (placeholder or previously loaded file contents) | `FileWidget.test.tsx` — "shows placeholder when no fileText configured", "renders file contents in pre element"<br>`widgetTypes.property.test.tsx` — S13, S15 | ✅ |
| UC3-S2 | User opens the file widget config panel | `FileWidget.test.tsx` — "clicking settings opens config panel"<br>`widgetTypes.property.test.tsx` — S29 | ✅ |
| UC3-S3 | System shows file picker accepting any file | `FileWidget.test.tsx` — "file input has no type restriction"<br>`widgetTypes.property.test.tsx` — S14 | ✅ |
| UC3-S4 | User selects a file | `FileWidget.test.tsx` — "calls onConfigChange with file text after FileReader reads file" | ✅ |
| UC3-S5 | System reads the file as UTF-8 text | `FileWidget.test.tsx` — "calls onConfigChange with file text after FileReader reads file"<br>`widgetTypes.property.test.tsx` — S15 | ✅ |
| UC3-S6 | System renders file contents in scrollable monospace area | `FileWidget.test.tsx` — "renders file contents in pre element when fileText is set"<br>`widgetTypes.property.test.tsx` — S15 | ✅ |
| UC3-S7 | User reads the file and closes the config panel | `ConfigPanelUX.test.tsx` — "Escape closes FileWidget config panel"<br>`widgetTypes.property.test.tsx` — S30, S31 | ✅ |
| UC3-E3a1 | System retains previous contents when file picker is cancelled | `FileWidget.test.tsx` — "closing panel without selecting does not call onConfigChange"<br>`widgetTypes.property.test.tsx` — S18, S34 | ✅ |
| UC3-E5a1 | System shows error for unreadable (binary) file | `FileWidget.test.tsx` — "shows error when FileReader fires onerror"<br>`widgetTypes.property.test.tsx` — S17 ⚠️ | ✅ ⚠️ |
| UC3-E5b1 | System truncates content at 10 000 chars with a notice | `FileWidget.test.tsx` — "truncates content at 10 000 chars and shows notice"<br>`widgetTypes.property.test.tsx` — S16 | ✅ |
| UC4-S1 | User sees webpage widget (URL prompt or embedded page) | `WebpageWidget.test.tsx` — "shows URL-entry prompt when no webpageUrl configured", "renders iframe when webpageUrl is set"<br>`widgetTypes.property.test.tsx` — S19, S24 | ✅ |
| UC4-S2 | User opens the webpage widget config panel | `WebpageWidget.test.tsx` — "clicking settings opens config panel"<br>`widgetTypes.property.test.tsx` — S29 | ✅ |
| UC4-S3 | System shows URL input field pre-filled with current URL | `WebpageWidget.test.tsx` — "URL input pre-filled with current URL", "URL input blank when no URL configured"<br>`widgetTypes.property.test.tsx` — S20 | ✅ |
| UC4-S4 | User enters or pastes a URL and confirms | `WebpageWidget.test.tsx` — "calls onConfigChange with valid URL on confirm"<br>`widgetTypes.property.test.tsx` — S21, S33 | ✅ |
| UC4-S5 | System validates the URL is well-formed | `WebpageWidget.test.tsx` — "calls onConfigChange with valid URL on confirm", "shows error for malformed URL"<br>`widgetTypes.property.test.tsx` — S21, S22 | ✅ |
| UC4-S6 | System renders iframe pointing to the supplied URL | `WebpageWidget.test.tsx` — "renders iframe when webpageUrl is set"<br>`widgetTypes.property.test.tsx` — S24 | ✅ |
| UC4-S7 | User views embedded webpage and closes the config panel | `ConfigPanelUX.test.tsx` — "Escape closes WebpageWidget config panel"<br>`widgetTypes.property.test.tsx` — S30, S31 | ✅ |
| UC4-E4a1 | System removes iframe and shows placeholder when URL is cleared | `WebpageWidget.test.tsx` — "clears iframe when URL is emptied and confirmed"<br>`widgetTypes.property.test.tsx` — S25 | ✅ |
| UC4-E5a1 | System shows validation error for malformed URL | `WebpageWidget.test.tsx` — "shows error for malformed URL and does not call onConfigChange"<br>`widgetTypes.property.test.tsx` — S22, S35 | ✅ |
| UC4-E6a1 | Browser blocks iframe; system shows helper note about embedding restrictions | `WebpageWidget.test.tsx` — "shows helper note when iframe is rendered"<br>`widgetTypes.property.test.tsx` — S26 | ✅ |
| UC4-E6b1 | System prepends "https://" to scheme-less URL before loading | `WebpageWidget.test.tsx` — "prepends https:// to scheme-less URL"<br>`widgetTypes.property.test.tsx` — S23 | ✅ |
| UC5-S1 | User clicks settings icon on a widget | `ImageWidget.test.tsx`, `FileWidget.test.tsx`, `WebpageWidget.test.tsx` — "shows settings icon button"<br>`widgetTypes.property.test.tsx` — S27 | ✅ |
| UC5-S2 | System opens inline config panel on the widget | `ImageWidget.test.tsx`, `FileWidget.test.tsx`, `WebpageWidget.test.tsx` — "config panel hidden initially", "clicking settings opens config panel"<br>`widgetTypes.property.test.tsx` — S29 | ✅ |
| UC5-S3 | System shows appropriate control (file picker or URL input) per widget type | `ConfigPanelUX.test.tsx` — "ClockWidget renders no settings button"<br>`widgetTypes.property.test.tsx` — S27, S28 | ✅ |
| UC5-S4 | User selects a new file or enters a new URL | `ImageWidget.test.tsx` — "calls onConfigChange with object URL for valid image"<br>`WebpageWidget.test.tsx` — "calls onConfigChange with valid URL on confirm" | ✅ |
| UC5-S5 | System updates the widget content config | `ImageWidget.test.tsx`, `FileWidget.test.tsx`, `WebpageWidget.test.tsx` — "calls onConfigChange…"<br>`widgetTypes.property.test.tsx` — S32, S33 | ✅ |
| UC5-S6 | System re-renders the widget with new content | `WidgetWiring.test.tsx` — "renders image placeholder when type is image"<br>`widgetTypes.property.test.tsx` — S2, S7, integration UC5-flow | ✅ |
| UC5-S7 | System closes the config panel | `ConfigPanelUX.test.tsx` — "Escape closes …"<br>`widgetTypes.property.test.tsx` — S30, S31 | ✅ |
| UC5-E4a1 | System closes config panel; content unchanged when user cancels | `ImageWidget.test.tsx` — "closing panel without selecting keeps existing image"<br>`FileWidget.test.tsx`, `WebpageWidget.test.tsx` — "closing panel without selecting does not call onConfigChange"<br>`widgetTypes.property.test.tsx` — S11, S18, S34 | ✅ |
| UC5-E5a1 | System shows inline validation error; content unchanged until valid source provided | `ImageWidget.test.tsx` — "shows error and does not call onConfigChange for non-image file"<br>`WebpageWidget.test.tsx` — "shows error for malformed URL"<br>`widgetTypes.property.test.tsx` — S12, S22, S35 | ✅ |

---

## PBT Coverage Table

All WHEN/THEN scenarios from `specs/widget-types/spec.md` and `specs/widget-drag-drop/spec.md`.

| # | Scenario (spec.md) | PBT Test | Status |
|---|-------------------|----------|--------|
| S1 | Default type when absent → clock | `widgetTypes.property.test.tsx` — "S1: WidgetContent with type=undefined always renders a clock widget" | ✅ |
| S2 | Typed widget rendered correctly (type='image' → ImageWidget) | `widgetTypes.property.test.tsx` — "S2: WidgetContent with type=image renders image content, not clock" | ✅ |
| S3 | Clock shows current time on render | `widgetTypes.property.test.tsx` — "S3: ClockWidget for any fixed time always shows HH:MM:SS format" | ✅ |
| S4 | Time advances each second | `widgetTypes.property.test.tsx` — "S4: ClockWidget displayed text changes after 1 s for any starting time" | ✅ |
| S5 | Interval cleared on unmount | `widgetTypes.property.test.tsx` — "S5: clearInterval is always called when ClockWidget unmounts" | ✅ |
| S6 | Placeholder shown initially (image) | `widgetTypes.property.test.tsx` — "S6: ImageWidget with empty config always shows placeholder text" | ✅ |
| S7 | Image shown after selection | `widgetTypes.property.test.tsx` — "S7: ImageWidget with any non-empty imageUrl always renders <img> and no placeholder" | ✅ |
| S8 | File picker accepts only images | `widgetTypes.property.test.tsx` — "S8: image config panel file input always has accept='image/*'" | ✅ |
| S9 | Object URL created on selection | `widgetTypes.property.test.tsx` — "S9: selecting a valid image file always triggers onConfigChange with a blob: URL" | ✅ |
| S10 | Previous URL revoked on replacement | `widgetTypes.property.test.tsx` — "S10: revokeObjectURL is called when imageUrl prop changes (degenerate property)" | ✅ ⚠️ |
| S11 | Cancel preserves existing image | `widgetTypes.property.test.tsx` — "S11: closing image config panel without selecting never calls onConfigChange" | ✅ |
| S12 | Non-image rejected with error | `widgetTypes.property.test.tsx` — "S12: selecting a non-image file always shows an error and does not call onConfigChange" | ✅ |
| S13 | Placeholder shown initially (file) | `widgetTypes.property.test.tsx` — "S13: FileWidget with empty config always shows placeholder text" | ✅ |
| S14 | File picker accepts any type | `widgetTypes.property.test.tsx` — "S14: file config panel file input always has no (or unrestricted) accept attribute" | ✅ |
| S15 | File text rendered in monospace | `widgetTypes.property.test.tsx` — "S15: FileWidget with any non-empty fileText always renders a <pre> with that content" | ✅ |
| S16 | Long file truncated | `widgetTypes.property.test.tsx` — "S16: fileText longer than 10 000 chars always truncates and adds a notice" | ✅ |
| S17 | Unreadable file shows error | `widgetTypes.property.test.tsx` — "S17: FileReader onerror always causes an alert to appear and no onConfigChange call" | ✅ ⚠️ |
| S18 | Cancel preserves existing content (file) | `widgetTypes.property.test.tsx` — "S18: closing file config panel without selecting never calls onConfigChange" | ✅ |
| S19 | Placeholder shown with no URL (webpage) | `widgetTypes.property.test.tsx` — "S19: WebpageWidget with empty config always shows prompt and no iframe" | ✅ |
| S20 | URL input pre-filled | `widgetTypes.property.test.tsx` — "S20: opening webpage config panel always pre-fills the URL input with current URL" | ✅ |
| S21 | Valid URL accepted | `widgetTypes.property.test.tsx` — "S21: confirming any well-formed https URL always calls onConfigChange with that URL" | ✅ |
| S22 | Malformed URL rejected | `widgetTypes.property.test.tsx` — "S22: confirming a malformed URL always shows a validation alert and no onConfigChange call" | ✅ |
| S23 | Scheme prepended automatically | `widgetTypes.property.test.tsx` — "S23: scheme-less host always gets https:// prepended on confirm"<br>"S23b: canonical 'example.com' always maps to 'https://example.com'" | ✅ |
| S24 | Iframe rendered with correct src | `widgetTypes.property.test.tsx` — "S24: WebpageWidget with any valid webpageUrl always renders an iframe with that src" | ✅ |
| S25 | Clear URL removes iframe | `widgetTypes.property.test.tsx` — "S25: confirming empty URL always calls onConfigChange with empty webpageUrl" | ✅ |
| S26 | Helper note always visible with iframe | `widgetTypes.property.test.tsx` — "S26: embedding-note is always present when webpageUrl is set"<br>"S26b: embedding-note is never present when no webpageUrl is set" | ✅ |
| S27 | Settings icon present on non-clock widget | `widgetTypes.property.test.tsx` — "S27: ImageWidget/FileWidget/WebpageWidget always has a Settings button" (3 tests) | ✅ |
| S28 | Clock widget has no settings icon | `widgetTypes.property.test.tsx` — "S28: ClockWidget never renders a Settings button"<br>"S28b: WidgetContent type=clock never renders a Settings button" | ✅ |
| S29 | Config panel opens on click | `widgetTypes.property.test.tsx` — "S29: clicking Settings on Image/File/WebpageWidget always opens config panel" (3 tests) | ✅ |
| S30 | Config panel closed by close button | `widgetTypes.property.test.tsx` — "S30: clicking Close on image/file/webpage config panel always closes it" (3 tests) | ✅ |
| S31 | Config panel closed by Escape | `widgetTypes.property.test.tsx` — "S31: pressing Escape on image/file/webpage config panel always closes it" (3 tests) | ✅ |
| S32 | New image committed and displayed | `widgetTypes.property.test.tsx` — "S32: selecting a valid image always fires onConfigChange with a new imageUrl" | ✅ |
| S33 | New URL committed and iframe updated | `widgetTypes.property.test.tsx` — "S33: confirming a new valid URL always calls onConfigChange with that URL" | ✅ |
| S34 | Cancel leaves content unchanged | `widgetTypes.property.test.tsx` — "S34: closing webpage config panel without Load never calls onConfigChange" | ✅ |
| S35 | Invalid input shows error, no update | `widgetTypes.property.test.tsx` — "S35: malformed URL always shows alert and never calls onConfigChange"<br>"S35: selecting non-image file always shows alert and never calls onConfigChange" | ✅ |
| D1 | Layout with no type field defaults to clock (delta) | `widgetTypes.property.test.tsx` — "D1: WidgetLayout without type always renders as ClockWidget via WidgetContent" | ✅ |
| D2 | Layout with type field is valid (delta) | `widgetTypes.property.test.tsx` — "D2: WidgetLayout with type=image always renders image widget content" | ✅ |
| D3 | Geometry functions ignore type and config (delta) | `widgetTypes.property.test.tsx` — "D3: WIDGET_TYPES contains exactly the four expected members"<br>"D3b: arbitrary WidgetLayout with type+config fields have same positional fields" | ✅ |

### PBT ⚠️ Partial Notes

| Scenario | Reason for partial coverage |
|----------|----------------------------|
| S10 (Previous URL revoked on replacement) | `URL.revokeObjectURL` timing depends on React's `useEffect` scheduling. In jsdom, effects fire synchronously after `rerender` but the degenerate property (single known blob URL) verifies the revoke path. Full coverage would require a real browser. |
| S17 (Unreadable file shows error) | jsdom's native `FileReader` never raises `onerror` for arbitrary binary data in the test environment. The property stubs `FileReader` globally with `fc.asyncProperty` and verifies the invariant with `fc.constant`. Full coverage requires a real browser with an actual unreadable binary file. |

---

## Test Plan: Browser-only Steps

The following UC steps require a real browser environment and **cannot** be tested in jsdom:

### ❌ UC1-E4a1: System resumes live updates after tab navigation

**Why not testable in jsdom**: This requires `document.visibilityState`, `visibilitychange` events, and actual tab lifecycle — none of which jsdom simulates. The ClockWidget V1 implementation does not gate on `visibilityState` (extension 4b is marked optional), so this is also not yet implemented.

**Manual test plan**:
1. Open the dashboard in Chrome/Firefox.
2. Confirm a clock widget shows live HH:MM:SS updates.
3. Navigate to another tab (or window) for ≥5 seconds.
4. Navigate back to the dashboard.
5. **Expected**: The clock immediately shows the current time (not a stale time from before the navigation).
6. Wait 3 more seconds.
7. **Expected**: The clock continues to update every second.

**Recommendation**: Add an E2E test (Playwright / Cypress) to `e2e/` that covers this step.

---

## Use Case Details

### UC1: View Live Clock Widget

| Step | Test Coverage |
|------|---------------|
| UC1-S1 | `WidgetContent.test.tsx` — defaults to ClockWidget when type is undefined |
| UC1-S2 | `ClockWidget.test.tsx` + PBT S3 — HH:MM:SS format for any timestamp |
| UC1-S3 | `ClockWidget.test.tsx` + PBT S4, S5 — time advances; interval cleared |
| UC1-S4 | Covered by UC1-S2 (reading is rendered display) |
| UC1-E4a1 | ❌ BROWSER-ONLY — see Test Plan above |

**Overall UC1 coverage**: 4/5 steps covered. 1 step blocked by jsdom limitation.

---

### UC2: Display User-Chosen Image

| Step | Test Coverage |
|------|---------------|
| UC2-S1 | `ImageWidget.test.tsx` + PBT S6, S7 |
| UC2-S2 | `ImageWidget.test.tsx` + PBT S29 |
| UC2-S3 | `ImageWidget.test.tsx` + PBT S8 |
| UC2-S4 | `ImageWidget.test.tsx` + PBT S9 |
| UC2-S5 | `ImageWidget.test.tsx` + PBT S9, S32 |
| UC2-S6 | `ImageWidget.test.tsx` + PBT S7 |
| UC2-S7 | `ImageWidget.test.tsx` + `ConfigPanelUX.test.tsx` + PBT S30, S31 |
| UC2-E3a1 | `ImageWidget.test.tsx` + PBT S11 |
| UC2-E4a1 | `ImageWidget.test.tsx` + PBT S12, S35 |
| UC2-S5 memory (URL revocation) | PBT S10 ⚠️ (degenerate) |

**Overall UC2 coverage**: All 9 steps fully covered; S10 (URL revocation) partially covered.

---

### UC3: Display User-Chosen File Contents

| Step | Test Coverage |
|------|---------------|
| UC3-S1 | `FileWidget.test.tsx` + PBT S13, S15 |
| UC3-S2 | `FileWidget.test.tsx` + PBT S29 |
| UC3-S3 | `FileWidget.test.tsx` + PBT S14 |
| UC3-S4 | `FileWidget.test.tsx` |
| UC3-S5 | `FileWidget.test.tsx` + PBT S15 |
| UC3-S6 | `FileWidget.test.tsx` + PBT S15 |
| UC3-S7 | `ConfigPanelUX.test.tsx` + PBT S30, S31 |
| UC3-E3a1 | `FileWidget.test.tsx` + PBT S18 |
| UC3-E5a1 | `FileWidget.test.tsx` + PBT S17 ⚠️ |
| UC3-E5b1 | `FileWidget.test.tsx` + PBT S16 |

**Overall UC3 coverage**: All 10 steps covered; S17 (binary read error) partially covered due to jsdom FileReader limitations.

---

### UC4: Embed a User-Chosen Webpage

| Step | Test Coverage |
|------|---------------|
| UC4-S1 | `WebpageWidget.test.tsx` + PBT S19, S24 |
| UC4-S2 | `WebpageWidget.test.tsx` + PBT S29 |
| UC4-S3 | `WebpageWidget.test.tsx` + PBT S20 |
| UC4-S4 | `WebpageWidget.test.tsx` + PBT S21, S33 |
| UC4-S5 | `WebpageWidget.test.tsx` + PBT S21, S22 |
| UC4-S6 | `WebpageWidget.test.tsx` + PBT S24 |
| UC4-S7 | `ConfigPanelUX.test.tsx` + PBT S30, S31 |
| UC4-E4a1 | `WebpageWidget.test.tsx` + PBT S25 |
| UC4-E5a1 | `WebpageWidget.test.tsx` + PBT S22, S35 |
| UC4-E6a1 | `WebpageWidget.test.tsx` + PBT S26 |
| UC4-E6b1 | `WebpageWidget.test.tsx` + PBT S23 |

**Overall UC4 coverage**: All 11 steps fully covered.

---

### UC5: Change Widget Content Source

| Step | Test Coverage |
|------|---------------|
| UC5-S1 | `ImageWidget.test.tsx`, `FileWidget.test.tsx`, `WebpageWidget.test.tsx` + PBT S27 |
| UC5-S2 | `ImageWidget.test.tsx`, `FileWidget.test.tsx`, `WebpageWidget.test.tsx` + PBT S29 |
| UC5-S3 | `ConfigPanelUX.test.tsx` + PBT S27, S28 |
| UC5-S4 | `ImageWidget.test.tsx`, `WebpageWidget.test.tsx` |
| UC5-S5 | `ImageWidget.test.tsx`, `FileWidget.test.tsx`, `WebpageWidget.test.tsx` + PBT S32, S33 |
| UC5-S6 | `WidgetWiring.test.tsx` + PBT S2, integration UC5-flow |
| UC5-S7 | `ConfigPanelUX.test.tsx` + PBT S30, S31 |
| UC5-E4a1 | `ImageWidget.test.tsx`, `FileWidget.test.tsx`, `WebpageWidget.test.tsx` + PBT S11, S18, S34 |
| UC5-E5a1 | `ImageWidget.test.tsx`, `WebpageWidget.test.tsx` + PBT S12, S22, S35 |

**Overall UC5 coverage**: All 9 steps fully covered.

---

## Appendix: Test File Index

| Test File | Tests | What it covers |
|-----------|-------|----------------|
| `src/utils/widgetTypes.test.ts` | 6 | WidgetType union, WIDGET_TYPES constant, WidgetLayout optional fields |
| `src/components/widgets/ClockWidget.test.tsx` | 3 | Clock rendering (UC1-S2), interval (UC1-S3) |
| `src/components/widgets/ImageWidget.test.tsx` | 10 | All UC2 steps; UC5-S1, UC5-S2, UC5-E4a1 |
| `src/components/widgets/FileWidget.test.tsx` | 10 | All UC3 steps; UC5-S1, UC5-S2, UC5-E4a1 |
| `src/components/widgets/WebpageWidget.test.tsx` | 14 | All UC4 steps; UC5-S1, UC5-S2, UC5-E4a1 |
| `src/components/WidgetContent.test.tsx` | 5 | Dispatcher: type → correct widget (UC1-S2, UC2-S1, UC3-S1, UC4-S1) |
| `src/components/WidgetWiring.test.tsx` | 5 | DraggableWidget renders WidgetContent correctly (UC5-S6) |
| `src/components/widgets/ConfigPanelUX.test.tsx` | 4 | Escape key closes panels; ClockWidget has no settings (UC5-S3, UC5-S7) |
| `src/utils/gridGeometry.test.ts` | 20 | Pure geometry functions (pre-existing, not widget-types) |
| `src/utils/gridGeometry.property.test.ts` | 26 | Grid geometry PBT (pre-existing, not widget-types) |
| `src/components/DashboardGrid.test.tsx` | 9 | DashboardGrid rendering (pre-existing) |
| `src/components/DashboardGrid.drag.test.tsx` | 8 | Drag behaviour (pre-existing) |
| `src/components/DashboardGrid.gaps.test.tsx` | 10 | Gap/cell-size rendering (pre-existing) |
| `src/components/DraggableWidget.test.tsx` | 5 | DraggableWidget position/attributes (pre-existing) |
| **`src/components/widgets/widgetTypes.property.test.tsx`** | **52** | **PBT: all 35 spec scenarios + 3 delta scenarios + 1 integration UC5 flow** |
| **Total** | **187** | |
