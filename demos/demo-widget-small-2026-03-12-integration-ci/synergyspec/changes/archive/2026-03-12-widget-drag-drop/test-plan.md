## Test Plan: widget-drag-drop

Generated: 2026-03-12
Source: test-report.md

### Summary

| ID | UC Step | Blocking Reason | Recommended Tool |
|----|---------|-----------------|-----------------|
| TP-1 | UC1-S1, UC1-S5, UC1-S6, UC1-S7 | BROWSER | Playwright |
| TP-2 | UC1-S2 | BROWSER | Playwright |
| TP-3 | UC1-S4 | BROWSER | Playwright |
| TP-4 | UC2-S2, UC2-S4, UC2-S7 | BROWSER | Playwright |
| TP-5 | UC2-S3 | BROWSER | Playwright |

---

## TP-1: UC1-S1, UC1-S5, UC1-S6, UC1-S7 — Drag widget to new position and verify layout update

**Blocking reason**: BROWSER — @dnd-kit pointer sensor requires real `setPointerCapture` and `getBoundingClientRect()` which jsdom does not implement realistically.
**Recommended tool**: Playwright or Cypress

**Preconditions**
- The app is running (e.g. `npm run dev` or a test fixture page that renders `<Dashboard>` with at least 2 widgets)
- Widget "A" is at grid position (0,0) with size 2×2
- Grid cell size is 80px; columns = 6

**Test Steps**
1. Open the dashboard page in a browser
2. Identify widget "A" at the top-left of the grid
3. Press and hold the pointer on widget "A" (pointerdown at approx. centre of the widget)
4. While holding, move the pointer two grid cells to the right (approximately 160px to the right)
5. Release the pointer

**Expected Result**
- Widget "A" snaps to grid position (2, 0) — two cells to the right of its original position
- The `onLayoutChange` callback is invoked with a `LayoutItem[]` where `A.x = 2`
- No other widget position changes

**Failure indicators**
- Widget does not move when released
- Widget moves but does not snap (lands at a fractional pixel offset)
- `onLayoutChange` is not called or is called with the original position

**Automation path**
```
await page.locator('[data-widget-id="A"]').dragTo({ x: originX + 160, y: originY });
await expect(page.locator('[data-widget-id="A"]')).toHaveCSS('left', '160px');
```

---

## TP-2: UC1-S2 — Ghost placeholder visible at original position while dragging

**Blocking reason**: BROWSER — rendering of the ghost placeholder (opacity/visibility state) requires @dnd-kit's `isDragging` to be true, which only activates after the pointer moves past the activation distance in a real browser.
**Recommended tool**: Playwright

**Preconditions**
- Dashboard is rendered with widget "A" at (0,0)
- Pointer drag is active on widget "A" (pointerdown and move past activation distance)

**Test Steps**
1. Open the dashboard page
2. Press and hold the pointer on widget "A"
3. Move the pointer 10px (past @dnd-kit's default activation distance)
4. Do NOT release — observe the grid while the drag is in progress

**Expected Result**
- A semi-transparent placeholder (ghost) is visible at widget "A"'s original grid position
- The ghost has `pointer-events: none`
- The dragged widget renders under the pointer with reduced opacity

**Failure indicators**
- No placeholder visible at the original position
- Original cell appears empty with no visual indicator

**Automation path**
```
await page.locator('[data-widget-id="A"]').hover();
await page.mouse.down();
await page.mouse.move(50, 0, { steps: 5 });
await expect(page.locator('.widget-ghost')).toBeVisible();
```

---

## TP-3: UC1-S4 — Drop zone highlights valid and invalid positions during drag

**Blocking reason**: BROWSER — the drop zone overlay is driven by `onDragMove` which requires @dnd-kit's active drag state, only achievable in a real browser.
**Recommended tool**: Playwright

**Preconditions**
- Dashboard rendered with widget "A" at (0,0,2,2) and widget "B" at (3,0,1,1)
- A drag of widget "A" is in progress

**Test Steps**
1. Open the dashboard page
2. Begin dragging widget "A"
3. Move the pointer over an empty cell (e.g., column 2, row 2)
4. Observe the drop zone colour
5. Move the pointer over widget "B"'s cell (column 3, row 0)
6. Observe the drop zone colour

**Expected Result**
- Step 4: The drop zone at (2,2) renders with a green tint and has the CSS class `drop-zone-valid`
- Step 6: The drop zone at (3,0) renders with a red tint and has the CSS class `drop-zone-invalid`

**Failure indicators**
- No coloured overlay appears during drag
- Both valid and invalid positions show the same colour

**Automation path**
```
// After drag starts and moves over empty cell:
await expect(page.locator('.drop-zone-valid')).toBeVisible();
// After moving over occupied cell:
await expect(page.locator('.drop-zone-invalid')).toBeVisible();
```

---

## TP-4: UC2-S2, UC2-S4, UC2-S7 — Resize widget and verify layout update

**Blocking reason**: BROWSER — jsdom does not reliably propagate `clientX/clientY` on PointerEvents; resize delta computation produces NaN which the NaN guard suppresses. Real browser required for pointer coordinate fidelity.
**Recommended tool**: Playwright

**Preconditions**
- Dashboard rendered with widget "A" at (0,0,2,2) and no adjacent widget
- Grid cell size is 80px

**Test Steps**
1. Open the dashboard page
2. Hover the pointer over widget "A" to reveal the resize handle at its bottom-right corner
3. Press and hold the pointer on the resize handle
4. Drag the handle 80px to the right and 80px down (one additional cell in each direction)
5. Release the pointer

**Expected Result**
- Widget "A" grows from 2×2 to 3×3 grid cells
- `onLayoutChange` is called with `A.w = 3, A.h = 3`
- Widget visually occupies the new 3×3 area

**Failure indicators**
- Widget size does not change on release
- `onLayoutChange` called with original or NaN dimensions

**Automation path**
```
const handleBB = await page.locator('.resize-handle').first().boundingBox();
await page.mouse.move(handleBB.x, handleBB.y);
await page.mouse.down();
await page.mouse.move(handleBB.x + 80, handleBB.y + 80, { steps: 10 });
await page.mouse.up();
await expect(page.locator('[data-widget-id="A"]')).toHaveCSS('width', '240px');
```

---

## TP-5: UC2-S3 — Live resize preview outline visible during resize drag

**Blocking reason**: BROWSER — same pointer coordinate issue as TP-4; the preview only renders if `rawW/rawH` are finite, which requires real pointer coordinates.
**Recommended tool**: Playwright

**Preconditions**
- Dashboard rendered with widget "A" at (0,0,2,2)
- A resize drag is in progress on widget "A"

**Test Steps**
1. Open the dashboard page
2. Hover over widget "A" to reveal the resize handle
3. Press and hold the pointer on the resize handle
4. Move the pointer 40px to the right (half a cell width) — do NOT release

**Expected Result**
- A blue dashed outline appears overlaid on widget "A" showing the candidate new size
- The outline updates continuously as the pointer moves
- The outline has `pointer-events: none`

**Failure indicators**
- No outline appears during resize drag
- Outline appears but does not update as pointer moves

**Automation path**
```
await page.mouse.down();
await page.mouse.move(handleBB.x + 40, handleBB.y, { steps: 5 });
await expect(page.locator('.resize-preview')).toBeVisible();
```

---

## How to Run These Tests

For **BROWSER** tests (all entries above):
1. Install Playwright: `npx playwright install`
2. Start the dev server: `npm run dev` (or set up a test fixture page that renders `<Dashboard>`)
3. Run Playwright: `npx playwright test`

For **MANUAL_UX** tests: perform the steps above in a browser (Chrome/Firefox) and compare visually.
