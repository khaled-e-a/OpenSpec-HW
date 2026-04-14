# Test Plan: update-timer-durations-and-notes

Generated: 2026-04-02
Source: test-report.md

### Summary

| ID | UC Step | Reason | Tool |
|----|---------|--------|------|
| TP-1 | R4-S1 — Notes area visible in all timer states | BROWSER | Playwright |
| TP-2 | R4-S5 — Notes area has a visible placeholder when empty | BROWSER | Playwright |
| TP-3 | UC3-S1 — User clicks notes area and begins typing | BROWSER | Playwright |
| TP-4 | R3-S3 — Countdown display shows correct full durations on load | BROWSER | Playwright |

---

## TP-1: R4-S1 — Notes area visible in all timer states

**Blocking reason**: BROWSER — jsdom does not render CSS visibility or layout; confirming the textarea is actually visible requires a real browser rendering engine.
**Recommended tool**: Playwright

**Preconditions**
- App is served locally (e.g., `npx serve .` or `python3 -m http.server` from the project root)
- Browser is open at `http://localhost:3000` (or whichever port the server uses)

**Test Steps**
1. Open the app in a browser: navigate to `http://localhost:3000`
2. Verify a textarea element is visible on the page (labelled "Task Notes" or with placeholder "Notes about your current task…")
3. Click the **Start** button to begin the work session timer
4. While the timer is running (state = RUNNING), confirm the notes textarea is still visible and accessible
5. Click the **Pause** button to pause the timer
6. While the timer is paused (state = PAUSED), confirm the notes textarea is still visible and accessible
7. Click the **Reset** button to reset the timer
8. After reset (state = IDLE), confirm the notes textarea is still visible and accessible

**Expected Result**
The notes textarea is visible and accessible in all three timer states: IDLE, RUNNING, and PAUSED. It is never hidden, collapsed, or obscured by other UI elements.

**Failure indicators**
- The textarea disappears or is hidden (`display: none`, `visibility: hidden`) during RUNNING or PAUSED state
- The textarea is covered by the timer card or other UI elements in any state
- The textarea is not present in the DOM at all

**Automation path**
```js
// Playwright
await page.goto('http://localhost:3000');
await expect(page.locator('#task-notes')).toBeVisible();
await page.click('#start-btn');
await expect(page.locator('#task-notes')).toBeVisible();
await page.click('#pause-btn');
await expect(page.locator('#task-notes')).toBeVisible();
await page.click('#reset-btn');
await expect(page.locator('#task-notes')).toBeVisible();
```

---

## TP-2: R4-S5 — Notes area has a visible placeholder when empty

**Blocking reason**: BROWSER — jsdom does not render CSS `::placeholder` pseudo-elements or check placeholder text visibility in the UI.
**Recommended tool**: Playwright

**Preconditions**
- App is served locally and open in a browser
- The notes textarea is empty (no text has been typed)

**Test Steps**
1. Open the app in a browser: navigate to `http://localhost:3000`
2. Ensure the notes textarea (`#task-notes`) is empty — if it contains text, select all and delete it
3. Observe the notes textarea without clicking it

**Expected Result**
The notes textarea displays a placeholder hint visible to the user — for example, "Notes about your current task…". The placeholder text is visible when the textarea is empty and unfocused.

**Failure indicators**
- The textarea is blank with no placeholder hint
- The placeholder text does not appear or is invisible (e.g., same colour as background)

**Automation path**
```js
// Playwright
const placeholder = await page.locator('#task-notes').getAttribute('placeholder');
expect(placeholder).toBeTruthy();
// Visual check: placeholder colour is not the same as background (manual inspection)
```

---

## TP-3: UC3-S1 — User clicks notes area and begins typing

**Blocking reason**: BROWSER — jsdom does not dispatch real keyboard and focus events in the same way a browser does; confirming actual textarea input and retention requires a live browser.
**Recommended tool**: Playwright

**Preconditions**
- App is served locally and open in a browser
- The timer may be in any state (idle is fine for this test)

**Test Steps**
1. Open the app in a browser: navigate to `http://localhost:3000`
2. Click on the notes textarea (`#task-notes`)
3. Type the text: `Fix login bug — check token expiry`
4. Observe the textarea content

**Expected Result**
The textarea displays `Fix login bug — check token expiry` exactly as typed. The cursor remains in the textarea and the text is not cleared or modified.

**Failure indicators**
- The textarea does not accept keyboard input
- The typed text disappears after input
- The textarea loses focus unexpectedly and the text is cleared
- The text is modified (e.g., trimmed, encoded, or altered)

**Automation path**
```js
// Playwright
await page.click('#task-notes');
await page.fill('#task-notes', 'Fix login bug — check token expiry');
await expect(page.locator('#task-notes')).toHaveValue('Fix login bug — check token expiry');
```

---

## TP-4: R3-S3 — Countdown display shows correct full durations on load

**Blocking reason**: BROWSER — Confirms the rendered HTML countdown element displays the correct text, including correct styling and layout alongside the updated durations.
**Recommended tool**: Playwright

**Preconditions**
- App is served locally and open in a browser
- No previous timer session is running (fresh load)

**Test Steps**
1. Open the app in a browser: navigate to `http://localhost:3000`
2. Observe the countdown display element on the page (the large timer display)
3. Verify it shows `30:00`
4. Verify the session label reads "Work Session" (or equivalent)
5. Start the timer by clicking **Start**
6. Wait 2 seconds
7. Verify the countdown has decremented (should show `29:58` or `29:57`)
8. Click **Reset**
9. Verify the countdown returns to `30:00`

**Expected Result**
- On load: countdown shows `30:00` with "Work Session" label
- After 2 s running: countdown shows ≤ `29:58`
- After reset: countdown returns to exactly `30:00`

**Failure indicators**
- On load: countdown shows `25:00` (old Work duration) instead of `30:00`
- Countdown does not decrement while running
- After reset: countdown shows a value other than `30:00`

**Automation path**
```js
// Playwright
await page.goto('http://localhost:3000');
await expect(page.locator('#countdown')).toHaveText('30:00');
await page.click('#start-btn');
await page.waitForTimeout(2000);
const text = await page.locator('#countdown').textContent();
expect(text).not.toBe('30:00'); // Should have counted down
await page.click('#reset-btn');
await expect(page.locator('#countdown')).toHaveText('30:00');
```

---

## How to Run These Tests

For **BROWSER** tests: install Playwright and run each step in a real browser.

```bash
npx playwright install
npx playwright test
```

Or run manually by following the numbered test steps above in a browser pointed at the locally served app.

**Serving the app locally:**
```bash
npx serve .
# or
python3 -m http.server 3000
```
