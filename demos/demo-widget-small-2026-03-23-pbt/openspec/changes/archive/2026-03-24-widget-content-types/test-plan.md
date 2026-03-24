# Test Plan: widget-content-types

Generated: 2026-03-24
Source: test-report.md

### Summary

| ID | UC Step | Reason | Tool |
|----|---------|--------|------|
| TP-1 | UC4-E8a1/E8a2 — Embed-blocked detection | BROWSER | Playwright |

---

## TP-1: UC4-E8a1/E8a2 — Embed-blocked site detection

**Blocking reason**: BROWSER — jsdom cannot simulate a real cross-origin iframe `onLoad` event where the iframe's `contentDocument.body` is empty/restricted. The blank-document heuristic (checking `contentDocument.body.childNodes.length === 0`) relies on actual browser security enforcement of X-Frame-Options / CSP `frame-ancestors`. jsdom does not enforce these headers, so the `handleIframeLoad` path that sets `embedBlocked=true` fires but `contentDocument` is not actually restricted.

**Recommended tool**: Playwright or Cypress (real Chromium/Firefox engine required)

**Preconditions**
- The widget dashboard app is running at `http://localhost:3000` (run `npm start`)
- Network access available (or a local server configured to return `X-Frame-Options: DENY`)
- The default layout includes a Webpage Viewer widget

**Test Steps**

1. Open the app at `http://localhost:3000`
2. Locate the Webpage Viewer widget on the dashboard
3. In the URL input field (`.webpage-viewer__url-input`), type `https://www.google.com`
4. Click the "Go" button (`.webpage-viewer__go-btn`)
5. Wait up to 5 seconds for the iframe to attempt to load
6. Observe the widget area

**Expected Result**
- The iframe load attempt completes
- Because google.com sends `X-Frame-Options: SAMEORIGIN`, the browser blocks the embed
- The widget detects the blank `contentDocument` and replaces the iframe with an embed-blocked warning:
  - The element `.webpage-viewer__embed-blocked` is visible
  - It contains the text `https://www.google.com` (or normalized form)
  - It contains a direct link (`<a>` element) pointing to `https://www.google.com` that opens in a new tab

**Failure indicators**
- The iframe displays content (google.com was somehow not blocking — try `https://www.facebook.com` instead)
- No embed-blocked message appears after 5 seconds
- The widget crashes or shows a JavaScript error in the console

**Automation path**
```js
// Playwright example
await page.goto('http://localhost:3000');
const input = page.locator('.webpage-viewer__url-input');
await input.fill('https://www.google.com');
await page.locator('.webpage-viewer__go-btn').click();
await page.waitForSelector('.webpage-viewer__embed-blocked', { timeout: 6000 });
await expect(page.locator('.webpage-viewer__embed-blocked')).toContainText('google.com');
const link = page.locator('.webpage-viewer__embed-blocked a');
await expect(link).toHaveAttribute('href', /google\.com/);
await expect(link).toHaveAttribute('target', '_blank');
```

---

## How to Run These Tests

For **BROWSER** tests: install Playwright (`npx playwright install`) and run the automation path above, or perform the manual steps in a real Chromium/Firefox browser.

Note: X-Frame-Options enforcement varies by site. The following sites reliably block embedding as of 2026:
- `https://www.google.com` (X-Frame-Options: SAMEORIGIN)
- `https://www.facebook.com` (X-Frame-Options: DENY)
- `https://github.com` (X-Frame-Options: DENY)
