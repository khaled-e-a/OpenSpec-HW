## Test Plan: widget-drag-drop

Generated: 2026-03-12
Source: test-report.md

### Summary

| ID | UC Step | Reason | Tool |
|----|---------|--------|------|
| TP-1 | UC1-S1 | BROWSER | Playwright |
| TP-2 | UC1-E3a1 | BROWSER | Playwright |
| TP-3 | UC2-S3/S4 | BROWSER | Playwright |

---

## TP-1: UC1-S1 — User presses down on a widget and begins dragging it

**Blocking reason**: BROWSER — jsdom does not dispatch realistic PointerEvents for `@dnd-kit/core`'s `PointerSensor`. The sensor requires an `activationConstraint` distance of 4px to trigger; simulating this in jsdom produces `NaN` coordinates and does not fire `onDragStart`.

**Recommended tool**: Playwright

**Preconditions**
- The app is running at `http://localhost:5173` (via `npm run dev`)
- The dashboard grid is visible and shows at least one widget (e.g., "Revenue")
- No drag operation is currently active

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Locate the "Revenue" widget card in the dashboard grid
3. Move the mouse pointer to the centre of the "Revenue" widget card
4. Press and hold the left mouse button (mousedown / pointerdown)
5. Move the mouse 5 pixels to the right while holding the button (to exceed the 4px activation threshold)
6. Observe the state of the widget while the button is still held

**Expected Result**
- The "Revenue" widget card renders at reduced opacity (approximately 0.3) — it becomes a translucent ghost in its original slot
- A drag overlay (ghost copy of the widget at full opacity) follows the mouse pointer
- No layout change has occurred yet (widgets remain at original grid positions)

**Failure indicators**
- The widget does not dim — the `isDragging` prop was not passed correctly from `DashboardGrid`
- No drag overlay appears — `DragOverlay` is not rendering or `activeDragId` is not being set
- The cursor changes but the widget's appearance does not — CSS opacity is missing or overridden

**Automation path**
```
// Playwright snippet (approximate)
await page.goto('http://localhost:5173');
const widget = page.getByTestId('widget-w1');
const box = await widget.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 10, box.y + box.height / 2);
await expect(widget).toHaveCSS('opacity', '0.3');
```

---

## TP-2: UC1-E3a1 — System shows snap preview in invalid/blocked state (target occupied)

**Blocking reason**: BROWSER — the `DropPreview` component renders as an absolutely-positioned `div` with dynamic background colour (`rgba(59,130,246,0.25)` for valid, `rgba(239,68,68,0.25)` for invalid). The colour is set via React state that only updates during an active pointer drag (`handleDragMove`), which requires real PointerEvents dispatched through `@dnd-kit`'s sensor pipeline — not achievable in jsdom.

**Recommended tool**: Playwright

**Preconditions**
- The app is running at `http://localhost:5173`
- The dashboard has at least two widgets side-by-side, e.g., "Revenue" (col=0, w=4) and "Users" (col=4, w=4)
- No drag operation is currently active

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Locate the "Revenue" widget (left side) and "Users" widget (right side)
3. Press and hold the left mouse button on the "Revenue" widget
4. Move the mouse 5 pixels to trigger drag activation (exceeding the 4px PointerSensor threshold)
5. Continue moving the mouse slowly to the right, toward the area already occupied by the "Users" widget
6. Observe the `DropPreview` overlay colour while hovering over an occupied cell

**Expected Result**
- While hovering over a valid (unoccupied) grid cell, the `DropPreview` overlay displays a blue semi-transparent highlight (`rgba(59,130,246,0.25)`)
- When the drag position overlaps with the "Users" widget's occupied cells, the `DropPreview` overlay changes to a red semi-transparent highlight (`rgba(239,68,68,0.25)`)
- The "Revenue" widget does not snap into the occupied position

**Failure indicators**
- `DropPreview` never appears — `snapTarget` state is not being set in `handleDragMove`
- `DropPreview` stays blue even over an occupied area — `isValidPlacement` is not being called or the `isValid` flag is not being passed to `DropPreview`
- `DropPreview` shows red over a valid area — collision detection is incorrectly flagging valid positions

**Automation path**
```
// Playwright snippet (approximate)
await page.goto('http://localhost:5173');
const revenue = page.getByTestId('widget-w1');
const box = await revenue.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 10, box.y + box.height / 2);
// Move to occupied area (Users widget at col=4, ~320px from left)
await page.mouse.move(340, box.y + box.height / 2);
const preview = page.getByTestId('drop-preview'); // or locator('[aria-hidden="true"]')
await expect(preview).toHaveCSS('background-color', 'rgba(239, 68, 68, 0.25)');
```

---

## TP-3: UC2-S3/S4 — System renders live size preview / User drags resize handle to desired size

**Blocking reason**: BROWSER — the resize handle uses the Pointer Capture API (`element.setPointerCapture`) and document-level `pointermove` events to stream live resize updates via `onResizePreview`. jsdom stubs `setPointerCapture` but does not deliver captured `pointermove` events to the document — so the `DropPreview` colour change during an active resize drag cannot be observed in jsdom.

**Recommended tool**: Playwright

**Preconditions**
- The app is running at `http://localhost:5173`
- The dashboard has at least one widget visible, e.g., "Revenue" (col=0, row=0, w=4, h=2)
- No drag or resize operation is currently active
- The mouse is not hovering over the widget (resize handle should be hidden)

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Move the mouse pointer over the "Revenue" widget card to reveal the resize handle (bottom-right corner)
3. Verify the resize handle (labelled "Resize widget") becomes visible (opacity > 0)
4. Press and hold the left mouse button on the resize handle
5. Slowly move the mouse 80px to the right and 80px down (one grid cell in each direction)
6. Observe the `DropPreview` overlay while holding the button

**Expected Result**
- While dragging, a blue semi-transparent `DropPreview` overlay appears at the projected new widget size (5 columns × 3 rows)
- The overlay tracks the resize in real time with each mouse move
- The overlay is blue (`rgba(59,130,246,0.25)`) when the new size is a valid placement
- If dragged over an occupied cell, the overlay turns red (`rgba(239,68,68,0.25)`)
- Upon releasing the mouse, the widget snaps to the new size and the overlay disappears

**Failure indicators**
- No `DropPreview` appears during drag — `onResizePreview` is not being called or `DropPreview` is not rendering for resize previews
- The overlay does not update as the mouse moves — `rafThrottle` may be blocking updates or the pointermove listener is not attached
- The overlay appears only at the final position after mouse release — the throttle is not flushing during drag

**Automation path**
```
// Playwright snippet (approximate)
await page.goto('http://localhost:5173');
const widget = page.getByTestId('widget-w1');
await widget.hover(); // reveal resize handle
const handle = page.getByLabel('Resize widget');
const handleBox = await handle.boundingBox();
await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
await page.mouse.down();
await page.mouse.move(
  handleBox.x + handleBox.width / 2 + 80,
  handleBox.y + handleBox.height / 2 + 80
);
const preview = page.getByTestId('drop-preview');
await expect(preview).toBeVisible();
await expect(preview).toHaveCSS('background-color', 'rgba(59, 130, 246, 0.25)');
await page.mouse.up();
await expect(widget).toHaveCSS('width', `${5 * 80}px`);
await expect(widget).toHaveCSS('height', `${3 * 80}px`);
```

---

## How to Run These Tests

### Setup

```bash
cd /path/to/demo-widget-small-2026-03-12-integration-ci-2
npm run dev          # Start the dev server at http://localhost:5173
```

### For BROWSER tests (TP-1, TP-2, TP-3)

Install Playwright and run each step in a real browser:

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
npx playwright test
```

Or execute manually by following the **Test Steps** in each entry above using Chrome DevTools / any browser.

### Automated unit/integration tests (already passing)

```bash
npm test             # runs Vitest — 64/64 tests pass
```
