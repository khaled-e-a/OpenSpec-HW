## Test Report: widget-content-types

Generated: 2026-03-11

### Use Case Coverage Summary

| Use Case | Happy Path | Extensions | Overall |
|----------|-----------|------------|---------|
| UC1 — Select/Change Type | ⚠️ 4/5 (S1 ❌) | ✅ 3/3 | 88% |
| UC2 — Clock | ✅ 4/4 | n/a | 100% |
| UC3 — Image | ✅ 5/5 | ✅ 3/3 | 100% |
| UC4 — File Viewer | ✅ 5/5 | ✅ 3/3 | 100% |
| UC5 — Webpage | ⚠️ 4/5 (S5 ⚠️) | ⚠️ 3/5 (E4a ❌, E4b ❌) | 70% |
| **Overall** | **22/24** | **12/14** | **89%** |

Overall: 34/38 steps/extensions covered (89%)

---

### Covered Requirements

- ✅ **UC1-S2**: System opens settings panel showing current type and four types (`WidgetSettings.test.tsx:27,42,55`)
- ✅ **UC1-S3**: User selects a content type (`WidgetSettings.test.tsx:72,86`)
- ✅ **UC1-S4**: System updates the widget to selected type and closes panel (`WidgetSettings.test.tsx:105`)
- ✅ **UC1-S5**: Widget renders the new content type immediately (`WidgetContent.test.tsx:23,43,61,79`)
- ✅ **UC1-E3a**: Selecting the same type — no change (`WidgetSettings.test.tsx:121`)
- ✅ **UC1-E3b**: Dismiss panel without selecting (`WidgetSettings.test.tsx:138,151`)
- ✅ **UC1-E5a**: Placeholder state when no source configured (`WidgetContent.test.tsx:100,118,136`)
- ✅ **UC2-S1**: Clock content component renders (`WidgetContent.test.tsx:156`, `ClockContent.test.tsx:116`)
- ✅ **UC2-S2**: Current time in readable format (`ClockContent.test.tsx:24,33,43`)
- ✅ **UC2-S3**: Time refreshes every second (`ClockContent.test.tsx:57,73`)
- ✅ **UC2-S4**: Time remains current while visible — interval cleared on unmount (`ClockContent.test.tsx:88,97,120`)
- ✅ **UC3-S1**: Image file-selection control visible (`ImageContent.test.tsx:40,60`)
- ✅ **UC3-S2**: File picker filtered to image types (`ImageContent.test.tsx:49`)
- ✅ **UC3-S3**: Image selection calls onConfigChange (`ImageContent.test.tsx:116`)
- ✅ **UC3-S4**: Image displayed scaled to fit (`ImageContent.test.tsx:77,91,105`)
- ✅ **UC3-S5**: Image retained on re-render (`ImageContent.test.tsx:228`)
- ✅ **UC3-E3a**: Cancel picker — widget unchanged (`ImageContent.test.tsx:142`)
- ✅ **UC3-E4a**: Invalid image — error shown (`ImageContent.test.tsx:164,181`)
- ✅ **UC3-E5a**: Replace image via "Change image" (`ImageContent.test.tsx:200`)
- ✅ **UC4-S1**: File-selection control visible (`FileContent.test.tsx:41,60`)
- ✅ **UC4-S2**: File picker opens (`FileContent.test.tsx:50`)
- ✅ **UC4-S3**: File selection calls onConfigChange (`FileContent.test.tsx:136`)
- ✅ **UC4-S4**: File content rendered as scrollable text (`FileContent.test.tsx:77,92,108`)
- ✅ **UC4-S5**: File retained on re-render (`FileContent.test.tsx:264`)
- ✅ **UC4-E3a**: Cancel picker — widget unchanged (`FileContent.test.tsx:165`)
- ✅ **UC4-E4a**: Unreadable file — error shown (`FileContent.test.tsx:189,208`)
- ✅ **UC4-E5a**: Replace file via "Change file" (`FileContent.test.tsx:231`)
- ✅ **UC5-S1**: URL input control activates (`WebpageContent.test.tsx:32,41`)
- ✅ **UC5-S2**: URL field pre-populated with current URL (`WebpageContent.test.tsx:55`)
- ✅ **UC5-S3**: URL confirmed — calls onConfigChange (`WebpageContent.test.tsx:74,91`)
- ✅ **UC5-S4**: Sandboxed iframe rendered with correct attributes (`WebpageContent.test.tsx:110`)
- ✅ **UC5-E3a**: Empty URL confirmed — placeholder shown (`WebpageContent.test.tsx:152,172`)
- ✅ **UC5-E3b**: URL input dismissed without confirming (`WebpageContent.test.tsx:186,200,217`)
- ✅ **UC5-E5a**: URL changed via "Change" button (`WebpageContent.test.tsx:265`)

---

### Partial Requirements

- ⚠️ **UC5-S5**: Webpage displayed; user can interact with embedded page (`WebpageContent.test.tsx:126,139`)
  — Iframe presence and URL bar verified in jsdom. Actual page load and user interaction require a real browser. → See TP-2 in test-plan.md

---

### Uncovered Requirements

- ❌ **UC1-S1**: User activates the settings control on a widget
  — No test for gear-icon trigger on the parent widget component. → See TP-1 in test-plan.md

- ❌ **UC5-E4a**: Page refuses embedding (X-Frame-Options) — error indicator shown (`WebpageContent.test.tsx:234`)
  — Test exists but fails: React `onError` on `<iframe>` does not fire in jsdom. → See TP-3 in test-plan.md

- ❌ **UC5-E4b**: URL malformed or unreachable — load-error shown (`WebpageContent.test.tsx:249`)
  — Same jsdom limitation as UC5-E4a. → See TP-3 in test-plan.md

- ❌ **UC1 Full Flow** — No end-to-end integration test
- ❌ **UC2 Full Flow** — No end-to-end integration test
- ❌ **UC3 Full Flow** — No end-to-end integration test
- ❌ **UC4 Full Flow** — No end-to-end integration test
- ❌ **UC5 Full Flow** — No end-to-end integration test

---

### Test Run Results

**Run date**: 2026-03-11
**Runner**: Vitest v1.6.1
**Command**: `npx vitest run`

| Metric | Count |
|--------|-------|
| Test files passed | 12 |
| Test files failed | 1 (`WebpageContent.test.tsx`) |
| Tests passed | 133 |
| Tests failed | 2 |
| Tests skipped | 1 |
| **Total** | **136** |

**Failing tests** (2):

1. `WebpageContent > UC5-E4a/E4b — iframe error handling > shows error message when iframe fails to load`
   - Error: `Unable to find an element with the text: Try different URL`
   - Root cause: `fireEvent.error(iframe)` does not trigger React's `onError` handler in jsdom. The `iframeError` state is never set to `true`.

2. `WebpageContent > UC5-E4a/E4b — iframe error handling > provides URL input after load error`
   - Same root cause as above.

These 2 failures are expected and documented — they require a real browser to verify. See TP-3 in `test-plan.md`.
