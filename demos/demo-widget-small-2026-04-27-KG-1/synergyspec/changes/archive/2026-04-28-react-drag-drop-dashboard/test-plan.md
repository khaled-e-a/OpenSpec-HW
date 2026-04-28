## Test Plan: react-drag-drop-dashboard

Generated: 2026-04-28
Source: test-report.md

All 8 entries below require a real browser because they involve pointer/drag events, CSS visual states, or react-grid-layout's internal drag engine — none of which jsdom simulates faithfully.

---

### Summary

| ID | UC Step | Reason | Recommended Tool |
|----|---------|--------|-----------------|
| TP-1 | UC1-S4 | BROWSER | Playwright |
| TP-2 | UC1-E4a | BROWSER | Playwright |
| TP-3 | UC1-E5a | BROWSER | Playwright |
| TP-4 | UC5-S2 | BROWSER | Playwright |
| TP-5 | UC5-S3 | BROWSER | Playwright |
| TP-6 | UC5-S4 | MANUAL_UX | Manual / Visual regression (Playwright screenshot) |
| TP-7 | UC5-S5 | BROWSER | Playwright |
| TP-8 | UC5-E3a | BROWSER | Playwright |

---

## TP-1: UC1-S4 — System highlights valid drop zone in real time

**Blocking reason**: BROWSER — jsdom does not dispatch real PointerEvents or trigger react-grid-layout's drag calculations, so the placeholder CSS class is never applied in a unit/component test environment.

**Recommended tool**: Playwright

**Preconditions**
- The dashboard app is running at `http://localhost:5173`
- At least two widgets are visible on the grid

**Test Steps**
1. Navigate to `http://localhost:5173`
2. Confirm at least one widget is visible on the dashboard grid
3. Hover over the grip-icon drag handle of any widget until the cursor changes to `grab`
4. Press and hold the primary mouse button on the drag handle
5. While holding, move the mouse 200px to the right across the grid

**Expected Result**
A shaded placeholder with a dashed indigo border appears at the target grid cell(s) under the moving cursor, updating its position as the cursor moves.

**Failure indicators**
- No placeholder appears during the drag
- The placeholder does not move when the cursor moves to different cells
- The placeholder appears but has no visible border or background

**Automation path**
```ts
// Playwright
await page.goto('http://localhost:5173')
const handle = page.locator('.widget-drag-handle').first()
await handle.hover()
await page.mouse.down()
await page.mouse.move(300, 200, { steps: 10 })
await expect(page.locator('.react-grid-placeholder')).toBeVisible()
await page.mouse.up()
```

---

## TP-2: UC1-E4a — Pointer outside valid drop zone; no highlight shown

**Blocking reason**: BROWSER — pointer position outside the grid canvas cannot be tested in jsdom.

**Recommended tool**: Playwright

**Preconditions**
- Dashboard app is running at `http://localhost:5173`
- At least one widget is visible

**Test Steps**
1. Navigate to `http://localhost:5173`
2. Press and hold the primary mouse button on a widget's drag handle
3. While holding, move the mouse outside the grid canvas area (e.g., into the toolbar at the top)

**Expected Result**
No drop-zone placeholder is visible while the cursor is outside the grid canvas.

**Failure indicators**
- A placeholder appears while the cursor is in the toolbar or outside the grid
- The placeholder remains visible outside the grid bounds

**Automation path**
```ts
const handle = page.locator('.widget-drag-handle').first()
await handle.hover()
await page.mouse.down()
// Move into toolbar (outside grid)
await page.mouse.move(100, 10, { steps: 5 })
await expect(page.locator('.react-grid-placeholder')).not.toBeVisible()
await page.mouse.up()
```

---

## TP-3: UC1-E5a — Widget returns to original position when released outside valid zone

**Blocking reason**: BROWSER — requires real drag release outside the grid container.

**Recommended tool**: Playwright

**Preconditions**
- Dashboard app is running at `http://localhost:5173`
- At least one widget is visible; note its grid position before dragging

**Test Steps**
1. Navigate to `http://localhost:5173`
2. Note the position of widget A (its grid column/row visible in the layout)
3. Press and hold the drag handle of widget A
4. Move the mouse to the toolbar area (outside the grid)
5. Release the mouse button

**Expected Result**
Widget A animates back to its original grid position. The dashboard layout is unchanged from step 2.

**Failure indicators**
- Widget A disappears
- Widget A remains at the position where the mouse was released (outside the grid)
- The layout changes after the release

**Automation path**
```ts
const widget = page.locator('[data-testid="widget-w1"]') // or first grid item
const boundsBefore = await widget.boundingBox()
const handle = widget.locator('.widget-drag-handle')
await handle.hover()
await page.mouse.down()
await page.mouse.move(100, 10, { steps: 5 }) // move to toolbar
await page.mouse.up()
await page.waitForTimeout(400) // allow snap-back animation
const boundsAfter = await widget.boundingBox()
expect(Math.round(boundsAfter!.x)).toBe(Math.round(boundsBefore!.x))
expect(Math.round(boundsAfter!.y)).toBe(Math.round(boundsBefore!.y))
```

---

## TP-4: UC5-S2 — System renders ghost/placeholder at hovered target cell

**Blocking reason**: BROWSER — react-grid-layout only renders the `.react-grid-placeholder` element when a real pointer drag is in progress in a live browser.

**Recommended tool**: Playwright

**Preconditions**
- Dashboard app is running at `http://localhost:5173`
- At least one widget is visible

**Test Steps**
1. Navigate to `http://localhost:5173`
2. Press and hold the primary mouse button on a widget's drag handle
3. Move the mouse slowly over another region of the grid (at least 100px away)

**Expected Result**
A placeholder element with class `react-grid-placeholder` is visible in the DOM and is rendered with a dashed indigo border and shaded background at the target cell.

**Failure indicators**
- `.react-grid-placeholder` is not present in the DOM during the drag
- The placeholder has no visible styling (invisible or unstyled)

**Automation path**
```ts
const handle = page.locator('.widget-drag-handle').first()
await handle.hover()
await page.mouse.down()
await page.mouse.move(400, 300, { steps: 15 })
await expect(page.locator('.react-grid-placeholder')).toBeVisible()
await page.mouse.up()
```

---

## TP-5: UC5-S3 — System updates placeholder position in real time as pointer moves

**Blocking reason**: BROWSER — placeholder position updates are driven by react-grid-layout's internal pointer event handlers, which require a real browser.

**Recommended tool**: Playwright

**Preconditions**
- Dashboard app running at `http://localhost:5173`
- At least two distinct grid cells are unoccupied

**Test Steps**
1. Navigate to `http://localhost:5173`
2. Press and hold the drag handle of any widget
3. Move the mouse to grid region A (e.g., top-left area); observe placeholder position
4. While still holding, move the mouse to grid region B (e.g., right side, at least 300px away)

**Expected Result**
The placeholder visibly moves to track the cursor as it crosses grid cells. The placeholder is at a different screen position in step 4 than in step 3.

**Failure indicators**
- The placeholder stays at the original position and does not follow the cursor
- The placeholder disappears during movement and reappears only on release

**Automation path**
```ts
const handle = page.locator('.widget-drag-handle').first()
await handle.hover()
await page.mouse.down()
await page.mouse.move(200, 250, { steps: 5 })
const pos1 = await page.locator('.react-grid-placeholder').boundingBox()
await page.mouse.move(700, 400, { steps: 10 })
const pos2 = await page.locator('.react-grid-placeholder').boundingBox()
expect(pos2!.x).not.toBe(pos1!.x) // placeholder moved
await page.mouse.up()
```

---

## TP-6: UC5-S4 — User sees intended drop position clearly distinguished

**Blocking reason**: MANUAL_UX — "clearly distinguished" is a visual quality assertion requiring human judgment or a visual regression baseline.

**Recommended tool**: Manual verification or Playwright screenshot comparison

**Preconditions**
- Dashboard app running at `http://localhost:5173`
- At least one widget is present on the dashboard

**Test Steps**
1. Navigate to `http://localhost:5173`
2. Press and hold the drag handle of any widget
3. Move the mouse to an unoccupied area of the grid
4. While holding, visually inspect the placeholder

**Expected Result**
The placeholder is clearly visible and unambiguous:
- It has a dashed indigo border (`--color-placeholder-border: #6366f1`)
- It has a light indigo shaded background
- It occupies exactly the cells the widget would land on (same w×h as the dragged widget)
- It is clearly distinct from widget cards (not a solid filled box)

**Failure indicators**
- Placeholder is invisible or has no border
- Placeholder has the same visual style as a widget card (confusing)
- Placeholder size does not match the dragged widget's dimensions

**Automation path** *(visual regression)*
```ts
await handle.hover()
await page.mouse.down()
await page.mouse.move(400, 300, { steps: 10 })
await expect(page).toHaveScreenshot('drag-preview-valid.png')
await page.mouse.up()
```

---

## TP-7: UC5-S5 — User releases pointer; preview removed and drop completes

**Blocking reason**: BROWSER — verifying that the placeholder is removed after mouse-up requires real browser event dispatch.

**Recommended tool**: Playwright

**Preconditions**
- Dashboard app running at `http://localhost:5173`
- One widget is being dragged (continuation of TP-4 or TP-5 setup)

**Test Steps**
1. Navigate to `http://localhost:5173`
2. Press and hold the drag handle of any widget
3. Move the mouse to a valid drop target on the grid
4. Confirm the placeholder is visible (see TP-4)
5. Release the mouse button

**Expected Result**
Immediately after release:
- The `.react-grid-placeholder` element is no longer visible in the DOM
- The widget appears at the new grid position
- The dashboard grid returns to its normal (non-dragging) visual state

**Failure indicators**
- The placeholder remains visible after mouse-up
- The widget does not appear at the new position
- The grid appears stuck in a "dragging" visual state

**Automation path**
```ts
const handle = page.locator('.widget-drag-handle').first()
await handle.hover()
await page.mouse.down()
await page.mouse.move(500, 350, { steps: 10 })
await expect(page.locator('.react-grid-placeholder')).toBeVisible()
await page.mouse.up()
await expect(page.locator('.react-grid-placeholder')).not.toBeVisible()
```

---

## TP-8: UC5-E3a — Invalid position; placeholder shown in invalid state (red tint)

**Blocking reason**: BROWSER — the `.rgl-grid-full` CSS class is applied to the grid container based on React state during a live drag; jsdom does not run CSS transitions or class application triggered by pointer events.

**Recommended tool**: Playwright

**Preconditions**
- Dashboard app running at `http://localhost:5173`
- The grid is full (all 12 columns are occupied for the height of existing widgets — add enough widgets to fill the visible grid)

**Test Steps**
1. Navigate to `http://localhost:5173`
2. Add widgets using the "+ Add Widget" button until the "Dashboard is full" toast appears
3. Navigate back to the dashboard (toast confirms grid is full)
4. Attempt to drag an existing widget by pressing and holding its drag handle
5. Move the mouse across the grid

**Expected Result**
The `.react-grid-placeholder` element has a red-tinted background and red dashed border (CSS class `.rgl-grid-full` applied to `.dashboard-grid-container`).

**Failure indicators**
- Placeholder still shows indigo/valid styling even when grid is full
- No placeholder appears at all
- `.rgl-grid-full` class is not applied to the grid container

**Automation path**
```ts
// Fill the grid first...
// Then drag
const handle = page.locator('.widget-drag-handle').first()
await handle.hover()
await page.mouse.down()
await page.mouse.move(400, 300, { steps: 10 })
const container = page.locator('.dashboard-grid-container')
await expect(container).toHaveClass(/rgl-grid-full/)
await page.mouse.up()
```

---

## How to Run These Tests

**For BROWSER tests (TP-1 through TP-5, TP-7, TP-8)**:
1. Install Playwright: `npx playwright install --with-deps chromium`
2. Start the dev server: `npm run dev`
3. Run each test step in a Playwright script, or execute manually in a Chromium browser

**For MANUAL_UX tests (TP-6)**:
1. Start the dev server: `npm run dev`
2. Open `http://localhost:5173` in Chrome or Firefox
3. Perform the test steps and visually compare against the expected result description

**For visual regression automation**:
- Use `@playwright/test` with `toHaveScreenshot()` after establishing a baseline screenshot
- Run `npx playwright test --update-snapshots` once to create the baseline
