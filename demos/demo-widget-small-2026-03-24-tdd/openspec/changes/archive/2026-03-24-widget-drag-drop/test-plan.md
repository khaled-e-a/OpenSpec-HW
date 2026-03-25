## Test Plan: widget-drag-drop

Generated: 2026-03-24
Source: test-report.md

### Summary

| ID | UC Step | Reason | Recommended Tool |
|----|---------|--------|-----------------|
| TP-1 | UC1-S2 | BROWSER | Playwright |
| TP-2 | UC1-S7 | BROWSER | Playwright |
| TP-3 | UC1-E5a1 | BROWSER + TIMING | Playwright |
| TP-4 | UC1-E6a2 | BROWSER | Playwright |
| TP-5 | UC1-E6a3 | BROWSER | Playwright |
| TP-6 | UC1 (Flow) | BROWSER | Playwright |
| TP-7 | UC2 (Flow) | BROWSER | Playwright |

---

## TP-1: UC1-S2 — System lifts widget visually, shows drag preview, highlights grid

**Blocking reason**: BROWSER — `@dnd-kit`'s `DragOverlay` renders as a DOM portal that exits the component tree; `PointerSensor` requires real pointer displacement exceeding the activation distance (8px by default) before a drag begins. jsdom does not dispatch real `PointerEvent` objects and does not track pointer positions, so the drag state never activates in unit tests.

**Recommended tool**: Playwright

**Preconditions**
- The app is running at `http://localhost:3000`
- The dashboard has at least one widget visible on the grid (e.g., the default demo layout with 5 widgets)

**Test Steps**
1. Open `http://localhost:3000` in a Chromium browser.
2. Locate the widget labelled `analytics` (top-left, 2×2 span).
3. Move the mouse pointer to the centre of the `analytics` widget.
4. Press and hold the left mouse button (mousedown) without moving.
5. While holding, move the mouse 20px to the right.
6. Observe the widget appearance while the mouse is held and moving.

**Expected Result**
- The original `analytics` widget cell dims to ~30% opacity (placeholder effect).
- A floating clone of the `analytics` widget at its full 2×2 size appears and tracks the mouse cursor.
- The grid canvas acquires a coloured outline (indigo `#6366f1` border) indicating it is an active drop target.

**Failure indicators**
- The widget does not dim — the placeholder style (`opacity: 0.3`) is not applied.
- No floating clone appears — `DragOverlay` is not rendering.
- The grid outline does not appear — `DndContext` `onDragStart` is not firing.

**Automation path**
```ts
// Playwright snippet
await page.goto('http://localhost:3000');
const widget = page.getByTestId('widget-analytics');
const box = await widget.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 20, box.y + box.height / 2);
await expect(widget).toHaveCSS('opacity', '0.3');
const grid = page.getByTestId('dashboard-grid');
await expect(grid).toHaveCSS('outline-style', 'solid');
```

---

## TP-2: UC1-S7 — System places widget at snapped target position and updates layout state

**Blocking reason**: BROWSER — `PointerSensor` requires a minimum pointer travel distance (8px) between `pointerdown` and `pointermove` to activate a drag. Synthetic `fireEvent` in jsdom does not accumulate pointer displacement, so `onDragEnd` with a valid target is never triggered in unit tests.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:3000`
- Dashboard has the default layout with `analytics` at col 1, row 1 and cell 3,1 is free

**Test Steps**
1. Open `http://localhost:3000`.
2. Note the initial position of the `status` widget (1×1, at approximately col 3, row 1).
3. Drag the `status` widget to an empty cell — move it 200px to the right and 100px down.
4. Release the mouse button.
5. Observe the final position of the `status` widget.

**Expected Result**
- The `status` widget snaps to the nearest unoccupied grid cell at the drop location.
- The widget's `grid-column` and `grid-row` CSS properties reflect the new cell coordinates (e.g., `5 / span 1` and `2 / span 1`).
- All other widgets (`analytics`, `chart`, `activity`, `metrics`) remain at their previous grid positions.
- The layout JSON displayed below the grid updates to show the new `x` and `y` values for `status`.

**Failure indicators**
- `status` widget snaps back to its original position after drop.
- Other widgets shift position unexpectedly.
- The layout JSON does not update.

**Automation path**
```ts
const widget = page.getByTestId('widget-status');
const box = await widget.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 200, box.y + box.height / 2 + 100, { steps: 10 });
await page.mouse.up();
// Verify new CSS position
await expect(widget).not.toHaveCSS('grid-column', '3 / span 1');
```

---

## TP-3: UC1-E5a1 — System returns widget to original position with smooth animation after invalid drop

**Blocking reason**: BROWSER + TIMING — CSS `transform` transitions (`transform 200ms ease`) are not executed in jsdom; `getComputedStyle` returns the end state immediately without interpolation. Verifying the animation requires a real browser that performs the CSS transition and allows measurement of intermediate states.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:3000`
- At least one widget visible on the grid

**Test Steps**
1. Open `http://localhost:3000`.
2. Start dragging the `analytics` widget by pressing and holding.
3. While dragging, move the mouse completely outside the grid canvas (e.g., to coordinates outside the grid boundary — below the grid by 50px).
4. Release the mouse button while the cursor is outside the grid.
5. Observe the widget's motion after the mouse button is released.

**Expected Result**
- The floating drag clone visibly animates back toward the original cell position of `analytics` over approximately 200ms.
- The animation eases (starts fast, slows near origin) rather than jumping instantly.
- After the animation completes, `analytics` is rendered at its original `grid-column: 1 / span 2; grid-row: 1 / span 2`.
- The layout JSON below the grid does not change.

**Failure indicators**
- Widget teleports back instantly with no animation.
- Widget remains at the dropped-outside position (layout mutated incorrectly).
- Widget disappears from the grid.

**Automation path**
```ts
const widget = page.getByTestId('widget-analytics');
const gridBox = await page.getByTestId('dashboard-grid').boundingBox();
const widgetBox = await widget.boundingBox();
await page.mouse.move(widgetBox.x + widgetBox.width / 2, widgetBox.y + widgetBox.height / 2);
await page.mouse.down();
await page.mouse.move(gridBox.x + gridBox.width + 100, gridBox.y + gridBox.height + 100, { steps: 5 });
await page.mouse.up();
// Wait for animation to complete
await page.waitForTimeout(250);
await expect(widget).toHaveCSS('grid-column', '1 / span 2');
```

---

## TP-4: UC1-E6a2 — System shows red highlight on cells occupied by another widget during drag

**Blocking reason**: BROWSER — The `drop-preview` overlay element is only rendered while `activeDragId` state is non-null, which only occurs during a real active drag. jsdom's synthetic pointer events do not trigger `@dnd-kit`'s `PointerSensor` drag activation, so the overlay never appears in unit tests.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:3000`
- Dashboard has at least two adjacent widgets (e.g., `analytics` at col 1–2 row 1–2, `status` at col 3 row 1)

**Test Steps**
1. Open `http://localhost:3000`.
2. Start dragging the `status` widget (1×1, col 3 row 1) by pressing and holding.
3. While holding the mouse button, slowly move the `status` widget toward the `analytics` widget's cells (cols 1–2, rows 1–2).
4. Position the drag preview so that it overlaps with the area occupied by `analytics`.
5. Observe the drop zone highlight colour while the cursor is over the occupied cells.
6. Move the cursor back to a free cell.
7. Observe the drop zone highlight colour over the free cells.

**Expected Result**
- While hovering over cells occupied by `analytics`: the `data-testid="drop-preview"` element is visible with a **red/semi-transparent red** background (`rgba(239,68,68,0.25)` or equivalent).
- While hovering over free cells: the `drop-preview` element shows a **green/semi-transparent green** background (`rgba(34,197,94,0.25)` or equivalent).

**Failure indicators**
- `drop-preview` element is not rendered during drag.
- Colour does not change between occupied and free cells.
- Both states show the same colour.

**Automation path**
```ts
const statusWidget = page.getByTestId('widget-status');
const analyticsWidget = page.getByTestId('widget-analytics');
const statusBox = await statusWidget.boundingBox();
const analyticsBox = await analyticsWidget.boundingBox();
await page.mouse.move(statusBox.x + statusBox.width / 2, statusBox.y + statusBox.height / 2);
await page.mouse.down();
// Move over analytics (occupied)
await page.mouse.move(analyticsBox.x + analyticsBox.width / 2, analyticsBox.y + analyticsBox.height / 2, { steps: 5 });
const preview = page.getByTestId('drop-preview');
await expect(preview).toBeVisible();
const bg = await preview.evaluate(el => getComputedStyle(el).backgroundColor);
expect(bg).toContain('239'); // red component
```

---

## TP-5: UC1-E6a3 — Layout state is unchanged after dropping onto an occupied cell

**Blocking reason**: BROWSER — Verifying that the layout state is unchanged after a full pointer drag-and-drop cycle onto an occupied cell requires real pointer events to activate and complete the `@dnd-kit` drag lifecycle (`onDragStart` → `onDragMove` → `onDragEnd`). Synthetic events in jsdom do not cross the `PointerSensor` activation threshold.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:3000`
- Dashboard has `analytics` (2×2) and `status` (1×1) both visible
- Note the initial position of `status` (col 3, row 1)

**Test Steps**
1. Open `http://localhost:3000`.
2. Record the layout JSON shown below the grid — note the `x` and `y` values for `status`.
3. Drag the `status` widget and drop it directly onto the `analytics` widget's occupied cells.
4. Release the mouse button.
5. Read the layout JSON below the grid again.

**Expected Result**
- The `status` widget returns to its original position (col 3, row 1).
- The layout JSON is identical to step 2 — the `x` and `y` values for `status` are unchanged.
- The `analytics` widget remains at its original position.
- No widgets overlap.

**Failure indicators**
- The layout JSON shows new `x`/`y` values for `status` after the invalid drop.
- `status` and `analytics` appear to overlap or `status` disappears.

**Automation path**
```ts
const initialLayout = await page.locator('pre').textContent();
const statusWidget = page.getByTestId('widget-status');
const analyticsWidget = page.getByTestId('widget-analytics');
const analyticsBox = await analyticsWidget.boundingBox();
const statusBox = await statusWidget.boundingBox();
await page.mouse.move(statusBox.x + statusBox.width / 2, statusBox.y + statusBox.height / 2);
await page.mouse.down();
await page.mouse.move(analyticsBox.x + analyticsBox.width / 2, analyticsBox.y + analyticsBox.height / 2, { steps: 10 });
await page.mouse.up();
await page.waitForTimeout(300);
const finalLayout = await page.locator('pre').textContent();
expect(finalLayout).toBe(initialLayout);
```

---

## TP-6: UC1 — Full drag-and-drop repositioning flow (integration)

**Blocking reason**: BROWSER — This is a full end-to-end user journey spanning all 8 main scenario steps (UC1-S1 through UC1-S8). It requires real pointer events, real CSS rendering, real `@dnd-kit` drag lifecycle, and visual verification of widget positions before and after.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:3000`
- Dashboard displays the default layout: `analytics` (2×2 at col 1 row 1), `status` (1×1 at col 3 row 1), `chart` (3×2 at col 4 row 1), `activity` (2×1 at col 3 row 2), `metrics` (3×1 at col 1 row 3)
- Cell at col 5, row 3 is free (no widget occupies it)

**Test Steps**
1. Open `http://localhost:3000`.
2. Verify `metrics` widget is at `grid-column: 1 / span 3; grid-row: 3 / span 1`.
3. Press and hold on the `metrics` widget centre.
4. Verify a drag preview clone of `metrics` appears following the cursor.
5. Move the cursor 360px to the right (approximately 3 cells).
6. Verify the drop-zone preview appears at the target cells with a green highlight.
7. Release the mouse button.
8. Verify `metrics` is now rendered at its new grid position (cols 4–6, row 3).
9. Verify all other widgets (`analytics`, `status`, `chart`, `activity`) remain at their original positions.
10. Verify the layout JSON below the grid reflects the new `x` value for `metrics`.

**Expected Result**
- After release: `metrics` appears at approximately col 4–6, row 3.
- `analytics`, `status`, `chart`, `activity` are visually unchanged.
- Layout JSON shows `metrics` with updated `x` (e.g., `3`) and unchanged `y` (`2`).

**Failure indicators**
- `metrics` snaps back to its original position instead of the new one.
- Other widgets shift.
- Layout JSON unchanged after the drop.

**Automation path**
```ts
await page.goto('http://localhost:3000');
const metrics = page.getByTestId('widget-metrics');
const box = await metrics.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 360, box.y + box.height / 2, { steps: 20 });
await page.mouse.up();
await page.waitForTimeout(300);
await expect(metrics).not.toHaveCSS('grid-column', '1 / span 3');
```

---

## TP-7: UC2 — Full initial render and visual layout flow (integration)

**Blocking reason**: BROWSER — End-to-end verification of the complete initial render requires a real browser to confirm CSS Grid layout actually positions elements at the correct pixel coordinates, and to verify that widgets of different sizes appear proportionally sized on screen.

**Recommended tool**: Playwright

**Preconditions**
- App running at `http://localhost:3000`
- No modifications to the default initial layout

**Test Steps**
1. Open `http://localhost:3000`.
2. Observe the dashboard grid canvas.
3. Count the number of widgets visible.
4. Verify each widget is labelled correctly: `analytics`, `status`, `chart`, `activity`, `metrics`.
5. Verify `analytics` (2×2) appears roughly twice as wide and twice as tall as `status` (1×1).
6. Verify `chart` (3×2) appears three times as wide as `status`.
7. Verify no two widgets visually overlap (no widgets share screen area).
8. Verify all widgets are fully contained within the grid boundary (no widget bleeds outside).

**Expected Result**
- 5 distinct widgets visible with correct labels.
- `analytics` occupies 4× the area of `status` visually.
- `chart` occupies 6× the area of `status` visually.
- Zero visual overlap between any two widgets.
- All widgets fully inside the grid canvas.

**Failure indicators**
- Fewer than 5 widgets shown.
- A widget label is missing.
- Two widgets overlap visually.
- A widget extends outside the grid boundary.

**Automation path**
```ts
await page.goto('http://localhost:3000');
const widgetIds = ['analytics', 'status', 'chart', 'activity', 'metrics'];
for (const id of widgetIds) {
  await expect(page.getByTestId(`widget-${id}`)).toBeVisible();
}
// Verify analytics is 2× wider than status
const analyticsBox = await page.getByTestId('widget-analytics').boundingBox();
const statusBox = await page.getByTestId('widget-status').boundingBox();
expect(analyticsBox.width).toBeCloseTo(statusBox.width * 2, 0);
expect(analyticsBox.height).toBeCloseTo(statusBox.height * 2, 0);
```

---

## How to Run These Tests

### BROWSER tests (TP-1 through TP-7)
1. Start the development server: `npm run dev` (or `npx vite`)
2. Install Playwright: `npx playwright install --with-deps chromium`
3. Create `e2e/widget-drag-drop.spec.ts` and implement the automation paths above
4. Run: `npx playwright test e2e/widget-drag-drop.spec.ts`

All 7 test plan entries are `BROWSER` type and can be automated with Playwright using the code snippets provided in each entry's "Automation path" section.
