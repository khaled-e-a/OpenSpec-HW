## Test Plan: widget-content-types

Generated: 2026-03-11
Source: test-report.md

### Summary

| ID | UC Step | Reason | Tool |
|----|---------|--------|------|
| TP-1 | UC1-S1 | OTHER | Component test on DraggableWidget / Playwright |
| TP-2 | UC5-S5 | BROWSER | Playwright |
| TP-3 | UC5-E4a, UC5-E4b | BROWSER | Playwright |
| TP-4 | UC1 Full Flow | BROWSER | Playwright |
| TP-5 | UC2 Full Flow | BROWSER | Playwright |
| TP-6 | UC3 Full Flow | BROWSER | Playwright |
| TP-7 | UC4 Full Flow | BROWSER | Playwright |
| TP-8 | UC5 Full Flow | BROWSER | Playwright |

---

## TP-1: UC1-S1 — User activates the settings control on a widget

**Blocking reason**: OTHER — no component test exercises clicking the gear-icon / settings trigger on the parent widget (DraggableWidget or similar). WidgetSettings tests cover the panel itself, not how it is opened.

**Recommended fix**: Add a component test to `DraggableWidget.test.tsx` (or whichever component renders the settings trigger) that clicks the gear icon and asserts that WidgetSettings appears.

**Preconditions**
- Dashboard is open with at least one widget

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Observe the widget — locate the settings trigger (e.g., gear icon ⚙, visible on hover or always)
3. Click the settings trigger on the widget

**Expected Result**
A settings panel appears overlaying the widget, showing four type options: Clock, Image, File, Webpage.

**Failure indicators**
No panel appears after clicking the trigger; or the panel appears but with wrong/missing options.

**Automation path**
Component test: `fireEvent.click(screen.getByRole('button', { name: /settings/i }))` then `expect(screen.getByRole('dialog')).toBeTruthy()`.
Playwright: `await page.hover('[data-testid="widget"]'); await page.click('[data-testid="settings-trigger"]'); await expect(page.getByRole('dialog')).toBeVisible()`.

---

## TP-2: UC5-S5 — Webpage is displayed; user can interact with the embedded page

**Blocking reason**: BROWSER — jsdom does not load URLs into iframes. Only iframe presence and the URL bar input are verifiable in the current component tests. Actual page load and user interaction require a real browser.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:5173`
- A Webpage widget exists with `https://example.com` configured as the URL

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Add a Webpage widget
3. Enter `https://example.com` in the URL field and click Load
4. Wait up to 5 seconds for the page to load inside the widget
5. Scroll within the embedded page
6. Click a link inside the embedded page

**Expected Result**
The Example Domain page is visible inside the widget. Scrolling within the iframe works. Clicking a link within the iframe navigates within the frame (or opens a new tab if target=_blank).

**Failure indicators**
Blank white area inside the widget; URL bar shows the URL but no content renders; scrolling has no effect.

**Automation path**
Playwright: `await expect(page.frameLocator('iframe[title="Embedded webpage"]').getByText('Example Domain')).toBeVisible()`.

---

## TP-3: UC5-E4a / UC5-E4b — Iframe load error handling

**Blocking reason**: BROWSER — React's `onError` on `<iframe>` does not fire in jsdom when `fireEvent.error(iframe)` is called. The component's `iframeError` state never updates. Requires a real browser where the network request is actually made and can fail.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:5173`
- Webpage widget added

**Test Steps (UC5-E4a — page refuses embedding)**
1. Add a Webpage widget
2. Enter `https://google.com` in the URL field and click Load
3. Wait up to 10 seconds

**Expected Result**
An error message is displayed inside the widget reading "Page could not be loaded". A "Try different URL" button is shown, allowing the user to enter a new URL.

**Failure indicators**
Blank iframe with no error message; "Try different URL" button absent; widget is stuck with no way to retry.

**Test Steps (UC5-E4b — unreachable URL)**
1. Add a Webpage widget
2. Enter `https://this-domain-does-not-exist-xyz-abc.com` in the URL field and click Load
3. Wait up to 15 seconds for the request to time out or fail

**Expected Result**
Same as UC5-E4a: error message and "Try different URL" button displayed.

**Failure indicators**
Widget is stuck loading indefinitely with no error state shown.

**Automation path**
Playwright UC5-E4b: `await page.route('https://this-domain-does-not-exist-xyz-abc.com', route => route.abort('failed')); // then load URL and assert error message`.

---

## TP-4: UC1 Full Flow — Select or Change Widget Content Type

**Blocking reason**: BROWSER — no integration test exists covering the complete UC1 flow from settings trigger through type change to content render.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:5173`
- Dashboard has at least one widget (default type: Clock)

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Observe the default widget showing the current time
3. Click the settings trigger on the widget
4. Observe the settings panel — confirm Clock is highlighted as the current type
5. Click "Image" in the settings panel
6. Observe the widget

**Expected Result**
Settings panel closes. Widget now shows "No image selected" placeholder and a "Choose image" button. The clock is no longer visible.

**Failure indicators**
Panel does not close after selection; clock still shows after selecting Image; image placeholder not shown.

---

## TP-5: UC2 Full Flow — View Current Time on Dashboard

**Blocking reason**: BROWSER — no integration test exists for the full clock widget lifecycle.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:5173`
- Dashboard has a Clock widget

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Note the seconds value currently shown in the Clock widget (e.g., `:45`)
3. Wait 3 seconds without interacting

**Expected Result**
The seconds value increments by 3 (e.g., from `:45` to `:48`). The time is within 1 second of the system clock.

**Failure indicators**
Time frozen; time jumps by more than 2 seconds; time shows stale value on reload.

---

## TP-6: UC3 Full Flow — Display a Personal Image

**Blocking reason**: BROWSER — file picker API and FileReader are not available in jsdom for a true end-to-end test.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:5173`
- Dashboard has an Image widget (or add one)
- A local image file available for upload (e.g., `test.png`)

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Add an Image widget — "No image selected" and "Choose image" are visible
3. Click "Choose image"
4. Select `test.png` from the local filesystem and confirm
5. Observe the widget

**Expected Result**
The chosen image fills the widget, scaled to fit (`object-fit: contain`). A "Change image" button is visible.

**Failure indicators**
File picker does not open; widget remains in placeholder state after file selection; image distorted or clipped.

**Automation path**
Playwright: `await page.setInputFiles('input[type="file"]', 'test.png')` (bypasses OS picker).

---

## TP-7: UC4 Full Flow — Display Contents of a Local File

**Blocking reason**: BROWSER — file picker and FileReader not available in jsdom for full end-to-end flow.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:5173`
- Dashboard has a File widget (or add one)
- A local text file available (e.g., `notes.txt` containing multiple lines of text)

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Add a File widget — "No file selected" and "Choose file" are visible
3. Click "Choose file"
4. Select `notes.txt` from the local filesystem
5. Observe the widget

**Expected Result**
The filename (`notes.txt`) is shown as a header. The full text content of the file is displayed in a scrollable area below. A "Change file" button is visible.

**Failure indicators**
Widget stays in placeholder state; filename not shown; text content missing or truncated incorrectly.

**Automation path**
Playwright: `await page.setInputFiles('input[type="file"]', { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('line 1\nline 2\nline 3') })`.

---

## TP-8: UC5 Full Flow — Embed a Webpage

**Blocking reason**: BROWSER — iframe loading and URL input flow must be tested in a real browser.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:5173`
- Dashboard has a Webpage widget (or add one)
- Network access to `https://example.com`

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Add a Webpage widget — "No URL set" and "Enter URL" are visible
3. Click "Enter URL"
4. Type `https://example.com` in the URL input field
5. Click "Load"
6. Wait up to 5 seconds for the page to load

**Expected Result**
A read-only URL bar shows `https://example.com`. An iframe is visible below it displaying the Example Domain page. A "Change" button is present. A warning "If the page appears blank, it may not allow embedding" is shown at the bottom of the iframe area.

**Failure indicators**
Blank iframe after loading; URL bar not showing the URL; "Change" button absent; warning message missing.

---

## How to Run These Tests

For **OTHER** items (TP-1):
- Add a component test in `DraggableWidget.test.tsx` targeting the settings trigger click — no browser needed.

For **BROWSER** items (TP-2 through TP-8):
1. Start the dev server: `npm run dev`
2. Install Playwright: `npx playwright install`
3. Run scenarios manually at `http://localhost:5173`, or write Playwright test scripts.

Playwright quick-start:
```bash
npm init playwright@latest
npx playwright test
```
