## Test Plan: widget-add-resize-remove

Generated: 2026-03-10
Source: test-report.md

### Summary

| ID | UC Step | Description | Reason | Tool |
|----|---------|-------------|--------|------|
| TP-1 | UC1-S5 | New widget is visible and available for interaction | BROWSER | Playwright |
| TP-2 | UC2-S3 | User drags the handle to change the widget's span | BROWSER | Playwright |
| TP-3 | UC2-S4 | Ghost updates continuously during drag | BROWSER | Playwright |
| TP-4 | UC2-S6 | Ghost reflects validity — cannot-resize indicator | BROWSER | Playwright |
| TP-5 | UC2-E7a | Releasing at invalid size cancels resize | BROWSER | Playwright |
| TP-6 | UC2-S10 | Ghost removed after commit; widget at new size | BROWSER | Playwright |
| TP-7 | UC1 | Add Widget — full flow integration | BROWSER | Playwright |
| TP-8 | UC2 | Resize Widget — full flow integration | BROWSER | Playwright |

---

## TP-1: UC1-S5 — New widget is visible and available for interaction

**Blocking reason**: BROWSER — jsdom verifies DOM presence but cannot assert that pointer events, drag handles, and remove buttons are interactive in a rendered layout.
**Recommended tool**: Playwright or Cypress

**Preconditions**
- App running at `http://localhost:5173` (run `npm run dev`)
- Dashboard starts with one existing widget

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Click the "Add Widget" button
3. Observe that a new widget tile appears in the grid
4. Hover over the new widget and confirm the remove button (×) is visible at the top-right
5. Hover over the new widget and confirm the resize handle is visible at the bottom-right
6. Click and drag the new widget to a different grid cell

**Expected Result**
- A new widget appears immediately in the first open grid cell
- The remove button and resize handle are both visible and respond to hover
- The widget can be dragged to a new position; the layout updates accordingly

**Failure indicators**
- Widget appears but cannot be dragged (drag handle not interactive)
- Remove button / resize handle not visible or not clickable
- Widget re-snaps to its original position after drag

**Automation path**
Use Playwright `page.locator('[data-testid^="widget-"]').last()` to get the new widget, then `page.dragAndDrop()` to move it.

---

## TP-2: UC2-S3 — User drags the handle to change the widget's span

**Blocking reason**: BROWSER — jsdom `getBoundingClientRect()` returns zero; `pointermove` delta divided by cell width = NaN; cannot drive real resize motion.
**Recommended tool**: Playwright or Cypress

**Preconditions**
- App running at `http://localhost:5173`
- Dashboard has a 1×1 widget at col 0, row 0 with at least 1 empty column to its right

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Identify the resize handle at the bottom-right corner of the 1×1 widget (small dark square, `aria-label="Resize widget"`)
3. Press and hold the pointer on the resize handle
4. Slowly drag the pointer 1 grid-cell-width to the right (approximately 1/4 of the grid width, assuming 4 columns)
5. While dragging, observe the ghost overlay in the grid
6. Release the pointer

**Expected Result**
- While dragging: a ghost overlay appears showing a 2×1 span at col 0, row 0; ghost has a blue border (valid)
- After release: the widget expands to fill 2 columns at col 0, row 0

**Failure indicators**
- No ghost appears during drag
- Ghost appears but does not update as the pointer moves
- Widget size does not change after release (stays 1×1)

**Automation path**
```javascript
const handle = page.locator('[aria-label="Resize widget"]').first();
const box = await handle.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + cellWidth, box.y + box.height / 2);
await page.mouse.up();
```

---

## TP-3: UC2-S4 — Ghost updates continuously to reflect candidate size during drag

**Blocking reason**: BROWSER — requires live `pointermove` events with real bounding rects to verify ghost DOM updates mid-drag.
**Recommended tool**: Playwright or Cypress

**Preconditions**
- App running at `http://localhost:5173`
- Dashboard has a 1×1 widget with empty cells to the right and below

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Press and hold the resize handle of the widget
3. Drag slowly right by 1 cell width — pause and observe the ghost
4. Continue dragging right by another cell width — pause and observe the ghost
5. Drag down by 1 cell height — pause and observe the ghost

**Expected Result**
- After step 3: ghost shows 2×1 span
- After step 4: ghost shows 3×1 span (if cells available)
- After step 5: ghost shows 3×2 span (if cells available)
- Ghost updates smoothly on each cell boundary crossing

**Failure indicators**
- Ghost does not update between mouse moves (stays at initial size)
- Ghost jumps erratically between sizes
- Ghost disappears during the drag

---

## TP-4: UC2-S6 — Ghost shows "cannot resize" indicator when candidate is invalid

**Blocking reason**: BROWSER — jsdom cannot compute real grid cell geometry; impossible to drive pointer into a position that would produce an out-of-bounds or colliding candidate.
**Recommended tool**: Playwright or Cypress

**Preconditions**
- App running at `http://localhost:5173`
- Dashboard has two widgets: w1 at col 0 row 0 (1×1), w2 at col 2 row 0 (1×1)
- Grid is 4 columns wide

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Press and hold the resize handle on w1 (col 0, row 0)
3. Drag the pointer to the right until the ghost would overlap w2 at col 2 (drag ~2.5 cell-widths right)
4. Observe the ghost appearance while in the invalid position
5. Drag back left until the ghost no longer overlaps (1-cell-width candidate, valid)
6. Observe the ghost appearance while in the valid position

**Expected Result**
- Step 4: ghost border and background turn red; a "cannot resize" visual indicator is shown
- Step 6: ghost border and background return to blue (valid)

**Failure indicators**
- Ghost stays blue even when overlapping another widget
- Ghost stays red even after moving to a valid position
- Ghost disappears instead of showing the invalid indicator

---

## TP-5: UC2-E7a — Releasing at an invalid size cancels resize without committing

**Blocking reason**: BROWSER — jsdom zero bounding rect makes `Math.max(1, NaN) = NaN`; NaN passes `isValidDrop` checks, so it is impossible to land on a truly invalid candidate via pointer movement in jsdom.
**Recommended tool**: Playwright or Cypress

**Preconditions**
- App running at `http://localhost:5173`
- Dashboard has two widgets: w1 at col 0 row 0 (1×1), w2 at col 2 row 0 (1×1)

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Press and hold the resize handle on w1
3. Drag the pointer until the ghost turns red (would overlap w2)
4. Release the pointer while the ghost is still red

**Expected Result**
- Widget w1 retains its original 1×1 size
- No layout change is committed
- The ghost disappears immediately on release

**Failure indicators**
- Widget w1 expands to the invalid candidate size (overlap with w2)
- Ghost lingers after release instead of disappearing

---

## TP-6: UC2-S10 — Ghost is removed and widget renders at new size after commit

**Blocking reason**: BROWSER — jsdom test 7.5d verifies `onLayoutChange` is called but does not assert (a) ghost DOM element is absent and (b) widget's CSS grid span visually matches the committed w/h.
**Recommended tool**: Playwright or Cypress

**Preconditions**
- App running at `http://localhost:5173`
- Dashboard has a 1×1 widget with at least one empty cell to the right

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Note the initial width of the widget (spans 1 column)
3. Press and hold the resize handle; drag 1 cell-width to the right
4. Release the pointer at the valid 2×1 candidate

**Expected Result**
- Ghost overlay disappears immediately after pointer release
- Widget now visually spans 2 columns (CSS `gridColumn: "1 / span 2"`)
- No ghost element with `aria-hidden="true"` remains in the DOM

**Failure indicators**
- Ghost remains visible after release
- Widget stays at 1×1 (commit not applied)
- Widget flickers between sizes

---

## TP-7: UC1 — Add Widget — Full Flow Integration

**Blocking reason**: BROWSER — the jsdom test 7.2a verifies DOM rendering but does not confirm the full user-visible goal: a widget appears, is positioned correctly, and is immediately interactive (drag, resize, remove).
**Recommended tool**: Playwright or Cypress

**Preconditions**
- App running at `http://localhost:5173`
- Dashboard starts empty (0 widgets)

**Test Steps**
1. Open the app at `http://localhost:5173` with an empty dashboard
2. Observe that the "Add Widget" button is enabled
3. Click "Add Widget"
4. Confirm a new widget appears at col 0, row 0
5. Click "Add Widget" again
6. Confirm a second widget appears at col 1, row 0
7. Fill the entire grid by clicking "Add Widget" until the button becomes disabled
8. Confirm the button is disabled and no new widget can be added

**Expected Result**
- Each click adds exactly one widget at the next available cell (left-to-right, top-to-bottom)
- Button disables precisely when the grid is full
- All added widgets are interactive (drag, resize, remove handles visible)

**Failure indicators**
- Widget appears at the wrong cell
- Button remains enabled after grid is full
- Widgets are added but not interactive

---

## TP-8: UC2 — Resize Widget — Full Flow Integration

**Blocking reason**: BROWSER — full flow requires real pointer events with layout measurements for steps S3/S4/S6; jsdom cannot provide these.
**Recommended tool**: Playwright or Cypress

**Preconditions**
- App running at `http://localhost:5173`
- Dashboard has one 1×1 widget at col 0, row 0 in a 4×3 grid

**Test Steps**
1. Open the app at `http://localhost:5173`
2. Identify the resize handle (bottom-right of widget)
3. Press and hold the pointer on the resize handle — ghost should appear (blue, 1×1)
4. Drag right 1 cell — ghost updates to 2×1 (still blue/valid)
5. Continue dragging right 3 more cells (past grid boundary) — ghost turns red (invalid)
6. Drag back to 2×1 position — ghost returns to blue
7. Release pointer — widget commits to 2×1
8. Confirm ghost is gone; widget occupies 2 columns
9. Press the resize handle again; drag down 1 cell — ghost shows 2×2
10. Press Escape — ghost disappears; widget remains at 2×1 (not 2×2)

**Expected Result**
- Steps 3–6: ghost correctly reflects valid/invalid state on each cell boundary
- Step 7–8: widget committed to 2×1; ghost absent from DOM
- Step 10: Escape cancels resize; widget stays at 2×1

**Failure indicators**
- Ghost does not appear on step 3
- Ghost does not turn red at step 5
- Widget does not expand at step 7
- Widget changes size at step 10 despite Escape

---

## How to Run These Tests

**For BROWSER tests (all entries above)**:

1. Install Playwright:
   ```bash
   npx playwright install --with-deps chromium
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Create a Playwright test file (e.g., `e2e/widget-add-resize-remove.spec.ts`) and implement each TP entry as a `test(...)` block.
4. Run:
   ```bash
   npx playwright test
   ```

**Alternatively**, the steps in each TP entry can be executed manually in a browser against the running dev server.
