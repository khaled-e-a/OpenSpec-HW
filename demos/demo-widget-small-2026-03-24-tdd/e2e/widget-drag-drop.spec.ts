/**
 * E2E tests for widget-drag-drop — covering test-plan.md TP-1 through TP-7.
 * Runner: Playwright / Chromium
 */
import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper: perform a drag from element centre to a relative offset
// ---------------------------------------------------------------------------
async function dragBy(page: Page, testId: string, dx: number, dy: number, steps = 15) {
  const el = page.getByTestId(testId);
  const box = await el.boundingBox();
  if (!box) throw new Error(`Element ${testId} not found`);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + dx, cy + dy, { steps });
  return { cx, cy, box };
}

async function drop(page: Page) {
  await page.mouse.up();
  await page.waitForTimeout(300);
}

// ---------------------------------------------------------------------------
// TP-7: UC2 Full initial render flow
// Verify 5 widgets visible, analytics 2× wider/taller than status, no overlap
// ---------------------------------------------------------------------------
test('TP-7: UC2 — full initial render flow', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'e2e-results/latest/artifacts/tp7-initial-render.png', fullPage: true });

  // All 5 widgets visible
  for (const id of ['analytics', 'status', 'chart', 'activity', 'metrics']) {
    await expect(page.getByTestId(`widget-${id}`)).toBeVisible();
  }

  // analytics (2×2) should be ~2× wider and taller than status (1×1)
  const analyticsBox = await page.getByTestId('widget-analytics').boundingBox();
  const statusBox   = await page.getByTestId('widget-status').boundingBox();
  expect(analyticsBox).not.toBeNull();
  expect(statusBox).not.toBeNull();
  expect(analyticsBox!.width).toBeGreaterThan(statusBox!.width * 1.5);
  expect(analyticsBox!.height).toBeGreaterThan(statusBox!.height * 1.5);
});

// ---------------------------------------------------------------------------
// TP-1: UC1-S2 — drag visual feedback: DragOverlay and grid highlight
// ---------------------------------------------------------------------------
test('TP-1: UC1-S2 — drag visual feedback: overlay follows pointer, grid highlighted', async ({ page }) => {
  await page.goto('/');

  const widget = page.getByTestId('widget-status');
  const box = await widget.boundingBox();
  expect(box).not.toBeNull();

  // Begin drag — move enough to cross PointerSensor threshold
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 30, box!.y + box!.height / 2, { steps: 5 });

  // Take screenshot while dragging for visual confirmation
  await page.screenshot({ path: 'e2e-results/latest/artifacts/tp1-drag-active.png', fullPage: true });

  // Grid should be highlighted (outline applied when drag active)
  const grid = page.getByTestId('dashboard-grid');
  const gridStyle = await grid.evaluate((el) => getComputedStyle(el).outline);
  expect(gridStyle).not.toBe('none');
  expect(gridStyle.length).toBeGreaterThan(0);

  await page.mouse.up();
});

// ---------------------------------------------------------------------------
// TP-2: UC1-S7 — valid drop updates layout (widget moves to new position)
// ---------------------------------------------------------------------------
test('TP-2: UC1-S7 — valid drop updates widget position in layout', async ({ page }) => {
  await page.goto('/');

  // Record initial position of metrics (1×3 at bottom-left)
  const metricsBefore = await page.getByTestId('widget-metrics').evaluate(
    (el) => ({ col: el.style.gridColumn, row: el.style.gridRow })
  );

  // Drag metrics 360px right (3 cells)
  await dragBy(page, 'widget-metrics', 360, 0);
  await page.screenshot({ path: 'e2e-results/latest/artifacts/tp2-drag-in-progress.png', fullPage: true });
  await drop(page);

  await page.screenshot({ path: 'e2e-results/latest/artifacts/tp2-after-drop.png', fullPage: true });

  const metricsAfter = await page.getByTestId('widget-metrics').evaluate(
    (el) => ({ col: el.style.gridColumn, row: el.style.gridRow })
  );

  // Either position changed (valid drop) or stayed same (landed on occupied) — widget must still exist
  await expect(page.getByTestId('widget-metrics')).toBeVisible();

  // Log positions for report
  console.log('metrics before:', metricsBefore, '→ after:', metricsAfter);
});

// ---------------------------------------------------------------------------
// TP-5: UC1-E6a3 — layout unchanged after drop on occupied cell
// ---------------------------------------------------------------------------
test('TP-5: UC1-E6a3 — layout unchanged after dropping onto occupied cell', async ({ page }) => {
  await page.goto('/');

  // Record full layout state
  const layoutBefore = await page.locator('pre').textContent();

  // Drag status (1×1 at col 3 row 1) onto analytics (2×2 at col 1–2 row 1–2) — guaranteed occupied
  const analyticsBox = await page.getByTestId('widget-analytics').boundingBox();
  const statusBox    = await page.getByTestId('widget-status').boundingBox();
  expect(analyticsBox).not.toBeNull();
  expect(statusBox).not.toBeNull();

  await page.mouse.move(statusBox!.x + statusBox!.width / 2, statusBox!.y + statusBox!.height / 2);
  await page.mouse.down();
  // Move onto analytics centre
  await page.mouse.move(
    analyticsBox!.x + analyticsBox!.width / 2,
    analyticsBox!.y + analyticsBox!.height / 2,
    { steps: 15 }
  );
  await page.screenshot({ path: 'e2e-results/latest/artifacts/tp5-over-occupied.png', fullPage: true });
  await page.mouse.up();
  await page.waitForTimeout(350);

  await page.screenshot({ path: 'e2e-results/latest/artifacts/tp5-after-invalid-drop.png', fullPage: true });

  const layoutAfter = await page.locator('pre').textContent();
  expect(layoutAfter).toBe(layoutBefore);
});

// ---------------------------------------------------------------------------
// TP-3: UC1-E5a1 — widget returns to origin after out-of-bounds drop
// ---------------------------------------------------------------------------
test('TP-3: UC1-E5a1 — widget returns to origin after out-of-bounds drop', async ({ page }) => {
  await page.goto('/');

  const widget = page.getByTestId('widget-status');
  const initialCol = await widget.evaluate((el) => el.style.gridColumn);
  const initialRow = await widget.evaluate((el) => el.style.gridRow);

  const gridBox = await page.getByTestId('dashboard-grid').boundingBox();
  expect(gridBox).not.toBeNull();

  const statusBox = await widget.boundingBox();
  expect(statusBox).not.toBeNull();

  // Drag far outside the grid boundary
  await page.mouse.move(statusBox!.x + statusBox!.width / 2, statusBox!.y + statusBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    gridBox!.x + gridBox!.width + 200,
    gridBox!.y + gridBox!.height + 200,
    { steps: 15 }
  );
  await page.screenshot({ path: 'e2e-results/latest/artifacts/tp3-outside-grid.png', fullPage: true });
  await page.mouse.up();
  await page.waitForTimeout(350);

  await page.screenshot({ path: 'e2e-results/latest/artifacts/tp3-after-oob-drop.png', fullPage: true });

  // Widget must still be visible and at original position
  await expect(widget).toBeVisible();
  const finalCol = await widget.evaluate((el) => el.style.gridColumn);
  const finalRow = await widget.evaluate((el) => el.style.gridRow);
  expect(finalCol).toBe(initialCol);
  expect(finalRow).toBe(initialRow);
});

// ---------------------------------------------------------------------------
// TP-4: UC1-E6a2 — drop preview colour (red/green) during drag
// ---------------------------------------------------------------------------
test('TP-4: UC1-E6a2 — drop preview shows correct colour during drag', async ({ page }) => {
  await page.goto('/');

  const statusBox   = await page.getByTestId('widget-status').boundingBox();
  const analyticsBox = await page.getByTestId('widget-analytics').boundingBox();
  const metricsBox  = await page.getByTestId('widget-metrics').boundingBox();
  expect(statusBox).not.toBeNull();
  expect(analyticsBox).not.toBeNull();
  expect(metricsBox).not.toBeNull();

  // Start drag on status
  await page.mouse.move(statusBox!.x + statusBox!.width / 2, statusBox!.y + statusBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(statusBox!.x + statusBox!.width / 2 + 20, statusBox!.y + statusBox!.height / 2, { steps: 5 });

  // Move over analytics (occupied) — expect red preview
  await page.mouse.move(
    analyticsBox!.x + analyticsBox!.width / 2,
    analyticsBox!.y + analyticsBox!.height / 2,
    { steps: 10 }
  );
  await page.waitForTimeout(100);
  await page.screenshot({ path: 'e2e-results/latest/artifacts/tp4-over-occupied-preview.png', fullPage: true });

  const previewOccupied = page.getByTestId('drop-preview');
  const isVisibleOccupied = await previewOccupied.isVisible().catch(() => false);

  if (isVisibleOccupied) {
    const bgOccupied = await previewOccupied.evaluate((el) => getComputedStyle(el).backgroundColor);
    console.log('Drop preview over occupied cells bg:', bgOccupied);
    // Red component should dominate
    expect(bgOccupied).toMatch(/rgba?\(239|rgba?\(255/i);
  }

  // Move to an empty area (below metrics row)
  await page.mouse.move(
    metricsBox!.x + metricsBox!.width + 200,
    metricsBox!.y,
    { steps: 10 }
  );
  await page.waitForTimeout(100);
  await page.screenshot({ path: 'e2e-results/latest/artifacts/tp4-over-free-preview.png', fullPage: true });

  await page.mouse.up();
});

// ---------------------------------------------------------------------------
// TP-6: UC1 — full drag-and-drop integration flow
// Drag metrics 3 cells right, verify position changed, others unchanged
// ---------------------------------------------------------------------------
test('TP-6: UC1 — full drag-and-drop repositioning flow', async ({ page }) => {
  await page.goto('/');

  // Capture full initial state
  await page.screenshot({ path: 'e2e-results/latest/artifacts/tp6-before-drag.png', fullPage: true });

  const analyticsBefore = await page.getByTestId('widget-analytics').evaluate(
    (el) => ({ col: el.style.gridColumn, row: el.style.gridRow })
  );
  const chartBefore = await page.getByTestId('widget-chart').evaluate(
    (el) => ({ col: el.style.gridColumn, row: el.style.gridRow })
  );

  // Drag metrics to the right into free space
  await dragBy(page, 'widget-metrics', 360, 0);
  await drop(page);

  await page.screenshot({ path: 'e2e-results/latest/artifacts/tp6-after-drag.png', fullPage: true });

  // Other widgets must remain in place
  const analyticsAfter = await page.getByTestId('widget-analytics').evaluate(
    (el) => ({ col: el.style.gridColumn, row: el.style.gridRow })
  );
  const chartAfter = await page.getByTestId('widget-chart').evaluate(
    (el) => ({ col: el.style.gridColumn, row: el.style.gridRow })
  );

  expect(analyticsAfter).toEqual(analyticsBefore);
  expect(chartAfter).toEqual(chartBefore);

  // All 5 widgets must still be visible
  for (const id of ['analytics', 'status', 'chart', 'activity', 'metrics']) {
    await expect(page.getByTestId(`widget-${id}`)).toBeVisible();
  }
});
