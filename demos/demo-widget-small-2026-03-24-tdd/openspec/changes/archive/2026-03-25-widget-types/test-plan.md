## Test Plan: widget-types

Generated: 2026-03-25
Source: test-report.md

### Summary

| ID | UC Step | Reason | Tool |
|----|---------|--------|------|
| TP-1 | UC1-E4a1 | BROWSER | Playwright |
| TP-2 | UC2-S1 (initial render — all 4 types visible) | BROWSER | Playwright |
| TP-3 | UC2-S4/S5/S6 (image file pick → rendered) | BROWSER |Playwright |
| TP-4 | UC3-S4/S5/S6 (file pick → text rendered) | BROWSER | Playwright |
| TP-5 | UC4-S4/S5/S6 (URL enter → iframe rendered) | BROWSER | Playwright |
| TP-6 | UC5 full flow (change image widget source) | BROWSER | Playwright |

---

## TP-1: UC1-E4a1 — Clock resumes live updates after tab navigation

**Blocking reason**: BROWSER — `document.visibilityState` and `visibilitychange` events are unavailable in jsdom. The current `ClockWidget` V1 does not gate on visibility (extension 4b is optional per usecases.md), so this is also not yet implemented.

**Recommended tool**: Playwright (Chromium)

**Preconditions**
- The dashboard is running at `http://localhost:5173`
- At least one widget with `type: 'clock'` is visible (the `analytics` widget in the default layout)

**Test Steps**
1. Open `http://localhost:5173` in Chromium
2. Observe the `analytics` clock widget — note the displayed time (HH:MM:SS format)
3. Wait 2 seconds and confirm the displayed time advances
4. Open a new tab in the same browser window
5. Wait at least 5 seconds in the new tab
6. Navigate back to the dashboard tab
7. Immediately observe the clock widget time

**Expected Result**
- The clock immediately shows the current local time (not the stale time from before the tab switch)
- After returning to the tab, wait 3 more seconds — the clock advances every second normally

**Failure indicators**
- The clock shows a time that was correct before the tab switch but has not advanced
- The clock stops updating after returning to the tab

**Automation path**
```ts
// Playwright: use page.goto, page.waitForTimeout, then page.evaluate(() => document.visibilityState)
// Simulate background via: await page.context().newPage() then switch back
test('UC1-E4a1: clock resumes after tab switch', async ({ context }) => {
  const page = await context.newPage();
  await page.goto('/');
  const before = await page.getByTestId('clock-display').textContent();
  const tab2 = await context.newPage();
  await tab2.waitForTimeout(3000);
  await page.bringToFront();
  await page.waitForTimeout(200);
  const after = await page.getByTestId('clock-display').textContent();
  expect(after).not.toBe(before);
});
```

---

## TP-2: UC2-S1 / UC3-S1 / UC4-S1 — Full initial render — all four widget types visible

**Blocking reason**: BROWSER — full visual confirmation of widget type rendering requires a real browser render pass; some widget-specific CSS (object-fit, iframe dimensions, pre overflow scroll) is not computed in jsdom.

**Recommended tool**: Playwright (Chromium)

**Preconditions**
- Dashboard running at `http://localhost:5173`
- Default `INITIAL_LAYOUT` with `analytics`=clock, `status`=image, `chart`=file, `activity`=webpage, `metrics`=clock

**Test Steps**
1. Open `http://localhost:5173`
2. Take a full-page screenshot
3. Locate the `analytics` widget (`data-testid="widget-analytics"`)
4. Verify it contains a text node matching `\d{2}:\d{2}:\d{2}` (the clock display)
5. Locate the `status` widget (`data-testid="widget-status"`)
6. Verify it contains the text "Click to choose image" (no image selected yet)
7. Locate the `chart` widget (`data-testid="widget-chart"`)
8. Verify it contains the text "Click to choose file"
9. Locate the `activity` widget (`data-testid="widget-activity"`)
10. Verify it contains the text "Enter a URL to embed a webpage"
11. Locate the `metrics` widget (`data-testid="widget-metrics"`)
12. Verify it also contains a clock display matching `\d{2}:\d{2}:\d{2}`

**Expected Result**
- All 5 widgets are visible
- `analytics` and `metrics` show live time in HH:MM:SS
- `status`, `chart`, `activity` show their respective placeholder texts

**Failure indicators**
- Any widget shows raw id text (e.g., "analytics") instead of typed content
- A widget shows the wrong placeholder for its type

---

## TP-3: UC2-S4/S5/S6 — Image widget: pick file → image displayed

**Blocking reason**: BROWSER — `<input type="file">` requires real browser file picker interaction; `URL.createObjectURL` requires a browser File API; image rendering with `object-fit: cover` requires a real render engine.

**Recommended tool**: Playwright (Chromium)

**Preconditions**
- Dashboard running at `http://localhost:5173`
- A test image file available on disk (e.g., `e2e/fixtures/test-image.png`)

**Test Steps**
1. Open `http://localhost:5173`
2. Locate the `status` widget (`data-testid="widget-status"`)
3. Confirm it shows "Click to choose image"
4. Click the ⚙ (settings) icon button on the `status` widget
5. Confirm the config panel overlay appears
6. Using Playwright's `setInputFiles`, set the file input to `e2e/fixtures/test-image.png`
7. Wait 300ms for the React state update
8. Confirm the config panel has closed
9. Confirm the `status` widget now contains an `<img>` element
10. Confirm the `<img>` src starts with `blob:`
11. Take a screenshot to confirm visual rendering

**Expected Result**
- The config panel closes automatically after file selection
- The widget displays the selected image (not the placeholder text)
- The image src is a `blob:` URL

**Failure indicators**
- Config panel remains open after file selection
- Widget still shows "Click to choose image"
- `<img>` element is absent or has an empty src

**Automation path**
```ts
test('UC2-S4/S5/S6: image widget file pick', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('widget-status').getByRole('button', { name: /settings/i }).click();
  await page.getByTestId('image-file-input').setInputFiles('e2e/fixtures/test-image.png');
  await page.waitForTimeout(300);
  const src = await page.getByTestId('widget-status').locator('img').getAttribute('src');
  expect(src).toMatch(/^blob:/);
});
```

---

## TP-4: UC3-S4/S5/S6 — File widget: pick text file → contents rendered

**Blocking reason**: BROWSER — `FileReader.readAsText` with real files requires a browser File API. jsdom stubs were used for unit tests but the full round-trip (picker → read → display) must be verified in a real browser.

**Recommended tool**: Playwright (Chromium)

**Preconditions**
- Dashboard running at `http://localhost:5173`
- A test text file available: `e2e/fixtures/test-file.txt` (contents: "Hello from test file")

**Test Steps**
1. Open `http://localhost:5173`
2. Locate the `chart` widget (`data-testid="widget-chart"`)
3. Confirm it shows "Click to choose file"
4. Click the ⚙ settings icon on the `chart` widget
5. Confirm the config panel overlay appears
6. Set the file input to `e2e/fixtures/test-file.txt` using `setInputFiles`
7. Wait 300ms
8. Confirm the config panel has closed
9. Confirm the `chart` widget now contains a `<pre>` element
10. Confirm the `<pre>` element contains "Hello from test file"

**Expected Result**
- Config panel closes after file selection
- Widget displays the text file contents in a monospace `<pre>` element

**Failure indicators**
- Config panel remains open
- Widget still shows "Click to choose file"
- `<pre>` is absent or has wrong/empty content

---

## TP-5: UC4-S4/S5/S6 — Webpage widget: enter URL → iframe rendered

**Blocking reason**: BROWSER — `<iframe>` rendering requires a real browser engine. jsdom does not render iframe content. URL validation via `new URL()` works in jsdom, but the visual outcome (iframe appearing / disappearing) must be verified end-to-end.

**Recommended tool**: Playwright (Chromium)

**Preconditions**
- Dashboard running at `http://localhost:5173`
- Internet connectivity (to verify `https://example.com` loads in an iframe)

**Test Steps**
1. Open `http://localhost:5173`
2. Locate the `activity` widget (`data-testid="widget-activity"`)
3. Confirm it shows "Enter a URL to embed a webpage"
4. Click the ⚙ settings icon on the `activity` widget
5. Confirm the config panel overlay appears with a URL input
6. Clear the URL input and type `https://example.com`
7. Click the "Load" button
8. Wait 500ms
9. Confirm the config panel has closed
10. Confirm the `activity` widget now contains an `<iframe>` with `src="https://example.com"`
11. Confirm the embedding restriction note is visible below the iframe

**Expected Result**
- Config panel closes after confirming URL
- Widget renders `<iframe src="https://example.com">`
- Embedding note "Note: some sites may not allow embedding." is visible

**Failure indicators**
- Config panel remains open
- Widget still shows the URL-entry prompt
- No iframe in the DOM

**Automation path**
```ts
test('UC4-S4/S5/S6: webpage widget URL enter', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('widget-activity').getByRole('button', { name: /settings/i }).click();
  await page.getByTestId('webpage-url-input').fill('https://example.com');
  await page.getByRole('button', { name: /load/i }).click();
  await page.waitForTimeout(500);
  const src = await page.getByTestId('widget-activity').locator('iframe').getAttribute('src');
  expect(src).toBe('https://example.com');
  await expect(page.getByTestId('embedding-note')).toBeVisible();
});
```

---

## TP-6: UC5 full flow — Change widget content source mid-session

**Blocking reason**: BROWSER — this test verifies the full round-trip: open config → select new source → widget re-renders with new content, while widget position and size remain unchanged. The drag-and-drop layer is involved (position/size must not change).

**Recommended tool**: Playwright (Chromium)

**Preconditions**
- Dashboard running at `http://localhost:5173`
- `e2e/fixtures/test-image.png` available for image selection

**Test Steps**
1. Open `http://localhost:5173`
2. Record the grid position of the `status` widget (read `style.gridColumn`, `style.gridRow`)
3. Click the ⚙ settings icon on the `status` widget (type=image)
4. Set `image-file-input` to `e2e/fixtures/test-image.png`
5. Wait 300ms
6. Confirm the `status` widget now shows an `<img>` with a `blob:` src
7. Re-check the grid position of the `status` widget
8. Confirm grid position is unchanged from step 2

**Expected Result**
- The widget content changes from placeholder to the chosen image
- The widget's grid position (gridColumn, gridRow) is identical before and after the config change

**Failure indicators**
- Widget moves to a different grid position after config change
- Widget reverts to placeholder after the onConfigChange callback fires

---

## How to Run These Tests

For **BROWSER** tests: ensure Playwright is installed and the dev server is running.

```bash
# Install browsers (first time)
npx playwright install --with-deps

# Start dev server in background
npx vite --port 5173 &

# Run e2e tests
npx playwright test
```

For TP-3, TP-4: create fixture files before running:
```bash
mkdir -p e2e/fixtures
echo "Hello from test file" > e2e/fixtures/test-file.txt
# Copy any PNG to e2e/fixtures/test-image.png
```
