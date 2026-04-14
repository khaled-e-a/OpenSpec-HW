## Test Plan: widget-drag-drop

Generated: 2026-03-09
Source: test-report.md

These manual / browser-based test cases cover the ⚠️ requirements that cannot be fully verified by the Vitest/jsdom suite because they depend on real pointer events and CSS layout geometry.

---

### Summary

| ID | UC Step | Blocking Reason | Recommended Tool |
|----|---------|-----------------|-----------------|
| TP-1 | UC1-S1 + S4 + S6 + S8 | BROWSER — jsdom returns zero bounding rects; @dnd-kit sensors don't fire | Playwright |
| TP-2 | UC1-S8 | BROWSER — col/row commit values require real grid dimensions | Playwright |
| TP-3 | UC1-E1a | BROWSER — touch events require real touch-capable browser | Playwright (mobile emulation) |
| TP-4 | UC1-E7a | BROWSER — collision rejection in full drag flow needs real sensor activation | Playwright |

---

## TP-1: UC1-S1 + UC1-S4 + UC1-S6 — Full drag interaction cycle

**Blocking reason**: BROWSER — jsdom's `getBoundingClientRect()` returns `{0,0,0,0}`, so `@dnd-kit`'s `PointerSensor` activation threshold is never reached and drag events are not fired. This prevents verifying that the drag lifecycle (press → move → release) actually triggers the system's visual and state responses.

**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:5173` (or wherever `vite dev` serves)
- At least two widgets are visible on the dashboard (default layout has 4)
- No modal or overlay is blocking the dashboard

**Test Steps**
1. Open `http://localhost:5173` in a Chromium browser
2. Identify the widget labelled "Revenue Chart" (top-left, spanning 2 columns)
3. Move the mouse pointer over the "Revenue Chart" widget
4. Press and hold the left mouse button on the widget
5. While holding, observe the widget's visual appearance
6. Slowly move the mouse pointer 200px to the right
7. Continue observing the ghost overlay that appears on the grid
8. Release the mouse button at the new position

**Expected Result**
- Step 5: The "Revenue Chart" widget slot becomes semi-transparent (opacity ≈ 0.3) and the cursor changes to "grabbing"
- Step 7: A blue dashed ghost placeholder appears at the snapped grid cell nearest to the cursor; the ghost updates as the cursor moves
- Step 8: The widget snaps to the new grid cell; the ghost disappears; the widget slot returns to full opacity

**Failure indicators**
- Widget does not become semi-transparent on press → UC1-S2 not working
- No ghost appears during move → UC1-S3 not working
- Widget does not move on release → UC1-S6/S8 not working
- Ghost remains after drop → UC1-S9 not working

**Automation path**
```js
// Playwright
await page.goto('http://localhost:5173');
const widget = page.locator('[data-testid="widget-widget-a"]');
const box = await widget.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + 200, box.y + box.height / 2, { steps: 10 });
await page.mouse.up();
// Assert widget rendered at new column
```

---

## TP-2: UC1-S8 — Layout state committed with correct col/row values

**Blocking reason**: BROWSER — verifying exact `col` and `row` values in the committed layout requires measuring real grid cell dimensions, which jsdom does not provide.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:5173`
- Dashboard has 4 columns (default)
- "KPI Card" widget is at column 3, row 1 (grid position visible top-right)
- "Revenue Chart" widget starts at column 1, row 1

**Test Steps**
1. Open `http://localhost:5173`
2. Locate the "KPI Card" widget (top-right, 1-column wide)
3. Press and hold the mouse button on it
4. Drag it to the second column, first row (the cell immediately to the left of its current position, which should be empty)
5. Release the mouse button

**Expected Result**
- The "KPI Card" widget is now rendered in the second column of the first row
- No two widgets overlap
- The original third-column cell is now empty
- If the component exposes layout state (e.g., via a data attribute or test hook), verify `col: 1, row: 0`

**Failure indicators**
- Widget snaps back to its original position → validation or commit logic broken
- Widget disappears → render error on layout update
- Two widgets appear to overlap → collision check not applied at commit time

**Automation path**
```js
// Playwright — measure grid cell and drag precisely
const grid = page.locator('[data-testid="dashboard-grid"]'); // add data-testid to DashboardGrid
const gridBox = await grid.boundingBox();
const cellW = gridBox.width / 4;
// Drag from col 2 center to col 1 center
await page.mouse.move(gridBox.x + 2.5 * cellW, gridBox.y + 60);
await page.mouse.down();
await page.mouse.move(gridBox.x + 1.5 * cellW, gridBox.y + 60, { steps: 20 });
await page.mouse.up();
```

---

## TP-3: UC1-E1a — Touch drag on mobile device produces equivalent layout change

**Blocking reason**: BROWSER — touch events (`touchstart`, `touchmove`, `touchend`) require a real touch-capable device or a browser with touch emulation. `@dnd-kit`'s `TouchSensor` does not activate in jsdom.

**Recommended tool**: Playwright with mobile emulation (`--device="iPhone 13"`)

**Preconditions**
- App running and accessible on the network, or using Playwright's local server
- Device or Playwright emulation set to a touch-capable mobile profile
- "Revenue Chart" widget visible in the viewport

**Test Steps**
1. Open the app with mobile emulation active (e.g., Playwright `iPhone 13` device preset)
2. Locate the "Revenue Chart" widget
3. Press and hold a finger on the widget for at least 150ms (satisfies `TouchSensor` activation delay)
4. Slide the finger 1 grid column to the right
5. Lift the finger

**Expected Result**
- Step 3: After 150ms hold, the widget slot becomes semi-transparent (drag initiated)
- Step 4: A ghost overlay tracks the finger position on the grid
- Step 5: The widget commits to the new grid cell, identical to the pointer drag outcome

**Failure indicators**
- Widget does not respond to touch hold → TouchSensor not configured
- Ghost does not appear during touch move → onDragMove not firing for touch
- Widget snaps back instead of committing → touch drag end not triggering onDragEnd correctly

**Automation path**
```js
// Playwright mobile emulation
const iPhone = devices['iPhone 13'];
const context = await browser.newContext({ ...iPhone });
const page = await context.newPage();
await page.goto('http://localhost:5173');
const widget = page.locator('text=Revenue Chart').locator('..');
const box = await widget.boundingBox();
await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
// Long-press then drag — use mouse as touch proxy in headless
```

---

## TP-4: UC1-E7a — Collision rejection in full drag flow (integration)

**Blocking reason**: BROWSER — the integration test (11.4) passes a soft assertion: if `onLayoutChange` is not called (because jsdom doesn't activate the sensor), the test vacuously passes. Verifying that a drop on an occupied cell is actually rejected requires the sensor to fire and the `isValidDrop` check to run at `onDragEnd`.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:5173`
- "KPI Card" (1×1) is at column 3, row 1
- "Activity Feed" (1×2) is at column 1, rows 1–2

**Test Steps**
1. Open `http://localhost:5173`
2. Note the position of "KPI Card" (column 3, row 1)
3. Press and hold the mouse on "KPI Card"
4. Drag it toward "Activity Feed" (column 1, row 1) — a cell already occupied
5. Release the mouse button over "Activity Feed"

**Expected Result**
- During drag: ghost turns red (invalid drop indicator) as the cursor enters the occupied cell area
- On release: "KPI Card" animates back to its original position (column 3, row 1)
- Layout state unchanged — `onLayoutChange` callback is NOT called (verifiable via a test hook or by confirming no visual change)

**Failure indicators**
- Ghost stays blue over an occupied cell → collision check not running during move
- Widget commits to the occupied cell → collision check not running at onDragEnd
- Both widgets visible in overlapping positions → layout corruption

**Automation path**
```js
// Playwright
const grid = page.locator('[data-testid="dashboard-grid"]');
const gridBox = await grid.boundingBox();
const cellW = gridBox.width / 4;
// KPI Card at col 2 (0-indexed), drag to col 0
await page.mouse.move(gridBox.x + 2.5 * cellW, gridBox.y + 60);
await page.mouse.down();
await page.mouse.move(gridBox.x + 0.5 * cellW, gridBox.y + 60, { steps: 15 });
// Assert ghost has red styling here
await page.mouse.up();
// Assert widget returned to original position
```

---

## How to Run These Tests

**BROWSER tests (TP-1 through TP-4)**:
1. Install Playwright: `npx playwright install chromium`
2. Start the dev server: `npm run dev`
3. Run each test step in a headed Playwright session or follow manually

For mobile (TP-3):
- Use `npx playwright codegen --device="iPhone 13" http://localhost:5173` to record steps interactively

**Manual walkthrough**:
Follow test steps in a Chrome/Safari browser window with DevTools open (Network tab to monitor any state updates).
