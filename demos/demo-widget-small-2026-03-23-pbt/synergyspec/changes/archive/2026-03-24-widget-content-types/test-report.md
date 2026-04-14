# Test Report: widget-content-types

Generated: 2026-03-24
Test runner: `react-scripts test --watchAll=false --forceExit`
Result: **144/144 tests passing ✅**

---

## Use Case Coverage Summary

| Use Case | Happy Path Steps | Extensions | Overall |
|----------|-----------------|------------|---------|
| UC1 — Clock Widget | ✅ 4/4 | ✅ 3/3 | 100% |
| UC2 — Image Viewer | ✅ 8/8 | ✅ 5/5 | 100% |
| UC3 — File Viewer | ✅ 8/8 | ✅ 5/5 | 100% |
| UC4 — Webpage Viewer | ✅ 7/7 | ⚠️ 6/7 | 93% |
| UC5 — Change/Replace Content | ✅ 2/2 | ✅ 1/1 | 100% |
| UC6 — Settings Persistence | ✅ 7/7 | ✅ 1/1 | 100% |

**Overall: 49/50 requirements covered (98%)**

---

## Covered Requirements

- ✅ **UC1-S1**: Clock renders without crashing (`src/widgets/ClockWidget.test.tsx:8`)
- ✅ **UC1-S2**: Clock renders time and date on mount (`src/widgets/ClockWidget.test.tsx:14` + PBT `:21`)
- ✅ **UC1-S3**: Time string is non-empty (covered within UC1-S2 test)
- ✅ **UC1-S4**: Time updates after one second (`src/widgets/ClockWidget.test.tsx:29` + PBT `:46`)
- ✅ **UC1-E1a1/E1a2**: No config UI / form elements (`src/widgets/ClockWidget.test.tsx:40` + PBT `:71`)
- ✅ **UC1-E5a1**: clearInterval called on unmount (`src/widgets/ClockWidget.test.tsx:47` + PBT `:96`)
- ✅ **UC2-S1**: Image viewer renders without crashing (`src/widgets/ImageViewerWidget.test.tsx:12`)
- ✅ **UC2-S2**: Empty state on new widget (`src/widgets/ImageViewerWidget.test.tsx:18` + PBT `:18`)
- ✅ **UC2-S3/S4**: Source picker with file and URL options (`src/widgets/ImageViewerWidget.test.tsx:26`)
- ✅ **UC2-S5/S6**: File validated and shown (`src/widgets/ImageViewerWidget.test.tsx:37`)
- ✅ **UC2-S7**: onSettingsChange called with correct shape (`src/widgets/ImageViewerWidget.test.tsx:56` + PBT `:114`)
- ✅ **UC2-S8**: Image displayed with object-fit contain (`src/widgets/ImageViewerWidget.test.tsx:67`)
- ✅ **UC2-E4a1/E4a2**: URL entry mode and input field shown (`src/widgets/ImageViewerWidget.test.tsx:76`)
- ✅ **UC2-E4a3**: Image shown after URL load (`src/widgets/ImageViewerWidget.test.tsx:88` + PBT `:39`)
- ✅ **UC2-E6a1**: Non-image MIME rejected (`src/widgets/ImageViewerWidget.test.tsx:103` + PBT `:78`)
- ✅ **UC2-E8a1**: Broken image shows load error (`src/widgets/ImageViewerWidget.test.tsx:117`)
- ✅ **UC2-E8b1**: Change image button present (`src/widgets/ImageViewerWidget.test.tsx:128`)
- ✅ **UC3-S1**: File viewer renders without crashing (`src/widgets/FileViewerWidget.test.tsx:12`)
- ✅ **UC3-S2**: Empty state on new widget (`src/widgets/FileViewerWidget.test.tsx:18` + PBT `:20`)
- ✅ **UC3-S3**: File picker opens (`src/widgets/FileViewerWidget.test.tsx:26`)
- ✅ **UC3-S4/S5/S6**: File read, name shown, content displayed (`src/widgets/FileViewerWidget.test.tsx:34`)
- ✅ **UC3-S7**: onSettingsChange with fileName (`src/widgets/FileViewerWidget.test.tsx:48` + PBT `:85`)
- ✅ **UC3-S8**: Content in scrollable area (`src/widgets/FileViewerWidget.test.tsx:34`)
- ✅ **UC3-E6b1/E6b2**: Large file truncated with warning (`src/widgets/FileViewerWidget.test.tsx:61` + PBT `:40`)
- ✅ **UC3-E9b1/E9b2/E9b3**: Binary file detected, error shown, no content (`src/widgets/FileViewerWidget.test.tsx:73` + PBT `:57`)
- ✅ **UC4-S1**: Webpage viewer renders without crashing (`src/widgets/WebpageViewerWidget.test.tsx:12`)
- ✅ **UC4-S2**: URL input and Go button on new widget (`src/widgets/WebpageViewerWidget.test.tsx:18` + PBT `:18`)
- ✅ **UC4-S3/S4**: URL input accepts text, Go button navigates (`src/widgets/WebpageViewerWidget.test.tsx:27`)
- ✅ **UC4-S5**: Valid URL shows iframe (`src/widgets/WebpageViewerWidget.test.tsx:37` + PBT `:71`)
- ✅ **UC4-S6**: Iframe sandboxed with all four required values (`src/widgets/WebpageViewerWidget.test.tsx:49` + PBT `:99`)
- ✅ **UC4-S7**: onSettingsChange with url settings (`src/widgets/WebpageViewerWidget.test.tsx:60` + PBT `:128`)
- ✅ **UC4-E4a1/E4a2**: Saved URL pre-fills input and auto-loads iframe (`src/widgets/WebpageViewerWidget.test.tsx:71` + PBT `:153`)
- ✅ **UC4-E5a1**: Malformed URL shows error, no iframe (`src/widgets/WebpageViewerWidget.test.tsx:82` + PBT `:39`)
- ✅ **UC4-E8a3/E8a4**: Embed-blocked warning shown with URL (`src/widgets/WebpageViewerWidget.test.tsx:96`)
- ✅ **UC4-E9a1**: Direct link shown for embed-blocked sites (`src/widgets/WebpageViewerWidget.test.tsx:108`)
- ✅ **UC5-S1/S2**: Change button present and reopens picker (`src/widgets/ImageViewerWidget.test.tsx:128`)
- ✅ **UC5-E3a1**: Clearing input preserves iframe src (`src/widgets/WebpageViewerWidget.test.tsx:119` + PBT `:179`)
- ✅ **UC6-S1**: Settings saved to localStorage (`src/hooks/useDashboardLayout.test.ts`)
- ✅ **UC6-S2/S3**: Settings keyed by ID and loaded on mount (`src/hooks/useDashboardLayout.test.ts`)
- ✅ **UC6-S4**: Stale settings pruned on mount (`src/hooks/useDashboardLayout.test.ts`)
- ✅ **UC6-S5**: URL-mode image restored from settings (`src/widgets/ImageViewerWidget.test.tsx:138` + PBT `:149`)
- ✅ **UC6-S6**: File-mode reload hint shown (`src/widgets/FileViewerWidget.test.tsx:86` + PBT `:113`)
- ✅ **UC6-S7**: Webpage viewer iframe auto-loads on mount (`src/widgets/WebpageViewerWidget.test.tsx:71`)
- ✅ **UC6-E5a1**: Corrupt settings JSON falls back to empty state (`src/hooks/useDashboardLayout.test.ts`)

---

## Uncovered / Partial Requirements

- ⚠️ **UC4-E8a1/E8a2** (embed-blocked detection — blank document heuristic / X-Frame-Options):
  Tested partially via example-based test. jsdom cannot simulate a real cross-origin iframe `onLoad` event with restricted `contentDocument`. The `handleIframeLoad` code path that sets `embedBlocked=true` is exercised but the actual browser mechanism (iframe content being a blank document due to X-Frame-Options) cannot be reproduced in jsdom.
  → See `test-plan.md` TP-1 for browser verification steps.

---

## PBT Results

| UC Step | Scenario | Outcome | Counterexample | Regression Test |
|---------|----------|---------|----------------|-----------------|
| UC1-S2 | Clock always renders non-empty time+date for any id | ✅ passed (10 runs) | — | — |
| UC1-S4 | Time strings differ for distinct timestamps | ✅ passed (20 runs) | — | — |
| UC1-E1a2 | Clock never renders input/button/iframe | ✅ passed (5 runs) | — | — |
| UC1-E5a1 | clearInterval always called on unmount | ✅ passed (5 runs) | — | — |
| UC2-S2 | Any id with no settings always shows empty-state | ✅ passed (10 runs) | — | — |
| UC2-E4a3 | Any valid URL confirmed sets img src to normalized URL | ✅ passed (15 runs) | — | — |
| UC2-E6a1 | Non-image MIME types always trigger format error | ✅ passed (6 runs) | — | — |
| UC2-S7 | onSettingsChange always called with correct url shape | ✅ passed (10 runs) | — | — |
| UC6-S5 | img src always equals normalized saved URL on mount | ✅ passed (10 runs) | — | — |
| UC3-S2 | Any id with no settings always shows empty state | ✅ passed (10 runs) | — | — |
| UC3-E6b1 | Files > 1MiB always show truncation warning | ✅ passed (10 runs) | — | — |
| UC3-E9b1 | Content with null bytes always triggers binary warning | ✅ passed (10 runs) | — | — |
| UC3-S7 | onSettingsChange always called with fileName | ✅ passed (10 runs) | — | — |
| UC6-S6 | File-mode always shows fileName in reload hint | ✅ passed (10 runs) | — | — |
| UC4-S2 | Any id with no settings always shows URL input | ✅ passed (10 runs) | — | — |
| UC4-E5a1 | Validation error for all URLs new URL() rejects | ✅ passed (15 runs) | — | — |
| UC4-S5 | Any valid https URL sets iframe src to normalized URL | ✅ passed (15 runs) | — | — |
| UC4-S6 | iframe always has all four required sandbox values | ✅ passed (10 runs) | — | — |
| UC4-S7 | onSettingsChange always called with correct url settings | ✅ passed (10 runs) | — | — |
| UC4-E4a1 | Saved URL always pre-fills input and auto-loads iframe | ✅ passed (10 runs) | — | — |
| UC5-E3a1 | Clearing URL input never changes iframe src | ✅ passed (10 runs) | — | — |
| UC1-S5 (gridUtils) | snapAndClamp always returns integer coords within bounds | ✅ passed | — | — |
| UC1-S5 (gridUtils) | snapAndClamp result closest to raw input | ✅ fixed (was ❌) | `col=NaN, row=0` | `src/utils/pbt-regression-uc1-s5-1.test.ts` |
| UC4-E8a1 | Embed-blocked detection via blank document | ❌ missing — cannot model in jsdom | — | — |
| UC4-E9a1 | Direct link always points to submitted URL | ❌ missing PBT | — | — |

---

## Test Run Results

```
Test Suites: 15 passed, 15 total
Tests:       144 passed, 144 total
Snapshots:   0 total
Time:        ~8s
```

**No failures.**

### PBT Counterexample Found and Fixed

- **Test**: `src/utils/gridUtils.property.test.ts:101` — "UC1-S5: snapAndClamp result is closest integer cell to raw input"
- **Counterexample**: `[Number.NaN, 0]` (fast-check seed 565570752, shrunk 1 time)
- **Root cause**: `fc.float()` in fast-check v3 includes `NaN` by default; `snapAndClamp` passed it directly to `Math.round()` producing `NaN` output
- **Fix**: `Number.isFinite()` guard in `snapAndClamp` — `NaN`/`±Infinity` → `0`
- **Regression test**: `src/utils/pbt-regression-uc1-s5-1.test.ts` — ✅ passes
