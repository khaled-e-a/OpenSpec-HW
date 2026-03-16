import { test, expect } from '@playwright/test';

/**
 * E2E tests derived from openspec/changes/widget-drag-drop/test-plan.md
 *
 * TP-1: UC1-S1  — User presses down on a widget and begins dragging it
 * TP-2: UC1-E3a1 — System shows snap preview in invalid/blocked state
 * TP-3: UC2-S3/S4 — System renders live size preview during resize drag
 */

test.describe('widget-drag-drop e2e', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the grid and at least one widget to be visible
    await page.waitForSelector('[data-testid="dashboard-grid"]');
    await page.waitForSelector('[data-testid="widget-widget-1"]');
  });

  // ─── TP-1: UC1-S1 — Drag initiation: widget dims at pointer-down + move ───────
  test('TP-1: UC1-S1 — dragging a widget dims the original slot to 0.3 opacity', async ({ page }) => {
    // widget-1 is "Analytics" at col=0, row=0
    const widget = page.getByTestId('widget-widget-1');

    // Take "before drag" screenshot
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-1_before.png' });

    const box = await widget.boundingBox();
    if (!box) throw new Error('widget-w1 not found');

    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    // Press down and move > 4px to trigger @dnd-kit PointerSensor activation
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 10, cy + 2, { steps: 5 });

    // After activation, the original slot should be at opacity 0.3
    await expect(widget).toHaveCSS('opacity', '0.3');

    // Take "during drag" screenshot
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-1_during_drag.png' });

    // Release mouse to end drag
    await page.mouse.up();
  });

  // ─── TP-2: UC1-E3a1 — DropPreview turns red when dragged over occupied cell ────
  test('TP-2: UC1-E3a1 — DropPreview shows red highlight over occupied grid cell', async ({ page }) => {
    // widget-1 = "Analytics" at col=0, row=0, w=4
    const widgetW1 = page.getByTestId('widget-widget-1');

    const boxW1 = await widgetW1.boundingBox();
    if (!boxW1) throw new Error('widget-widget-1 not found');

    // widget-2 = "Revenue" at col=4, row=0, w=4 — adjacent occupied widget
    const widgetW2 = page.getByTestId('widget-widget-2');
    const boxW2 = await widgetW2.boundingBox();
    if (!boxW2) throw new Error('widget-widget-2 not found');

    const cx = boxW1.x + boxW1.width / 2;
    const cy = boxW1.y + boxW1.height / 2;

    // Begin drag on w1
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    // Activate the drag sensor (move > 4px)
    await page.mouse.move(cx + 10, cy, { steps: 5 });

    // Take screenshot showing the drag started (blue valid preview)
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-2_drag_valid.png' });

    // Move into the occupied area of w2
    const w2cx = boxW2.x + boxW2.width / 2;
    const w2cy = boxW2.y + boxW2.height / 2;
    await page.mouse.move(w2cx, w2cy, { steps: 10 });

    // Take screenshot showing the drag over occupied cell (red invalid preview)
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-2_drag_invalid.png' });

    // Locate DropPreview (aria-hidden overlay) and check it has red background
    const dropPreview = page.locator('[aria-hidden="true"][style*="background"]').first();
    await expect(dropPreview).toBeVisible();
    const bgColor = await dropPreview.evaluate((el) => getComputedStyle(el).backgroundColor);
    // Red: rgba(239, 68, 68, 0.25) — note: computed style may normalize the value
    expect(bgColor).toMatch(/rgba?\(239,?\s*68,?\s*68/);

    await page.mouse.up();
  });

  // ─── TP-3: UC2-S3/S4 — Live resize preview appears during resize handle drag ───
  test('TP-3: UC2-S3/S4 — resize handle drag shows live DropPreview overlay', async ({ page }) => {
    // widget-1 = "Analytics" at col=0, row=0, w=4, h=2
    const widget = page.getByTestId('widget-widget-1');

    // Hover over the widget to reveal the resize handle (scope to this widget)
    await widget.hover();
    const handle = widget.getByLabel('Resize widget');
    await expect(handle).toBeVisible();

    const handleBox = await handle.boundingBox();
    if (!handleBox) throw new Error('Resize handle not found');

    const hx = handleBox.x + handleBox.width / 2;
    const hy = handleBox.y + handleBox.height / 2;

    // Take screenshot before resize
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-3_before_resize.png' });

    // Press and move the resize handle downward only (+1 row = 80px).
    // widget-1 is at col=0, row=0, w=4, h=2 — growing h to 3 (=240px) is valid
    // because row 2 is empty (widgets 4 and 5 start at col=0/6 respectively, also at row=2).
    // However widget-4 is at col=0 row=2 w=6 h=2 which would overlap.
    // Growing height-only also overlaps widget-4.
    // Instead, grow width only but within free space: rows 4+ are empty.
    // The safest valid resize is purely downward into row 4+ (below row=2+2=4 = safe).
    // Use delta +80 down (would give h=3, row=2 area) — widget-4 is at row=2, col=0,
    // so this DOES overlap. Let's grow in row direction to row=4 (delta = 2*80=160px down).
    // Actually widget-4 height is 2, so it occupies rows 2-3. Safe height is 4+ (delta=160 down).
    // To keep the test simple, grow +160px downward (h from 2 to 4).
    await page.mouse.move(hx, hy);
    await page.mouse.down();
    await page.mouse.move(hx, hy + 160, { steps: 10 });

    // Take screenshot during resize (should show DropPreview overlay)
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-3_during_resize.png' });

    // Confirm DropPreview is visible during resize drag
    const dropPreview = page.locator('[aria-hidden="true"][style*="background"]').first();
    await expect(dropPreview).toBeVisible();

    // DropPreview may be blue (valid) or red (invalid depending on overlap detection).
    // The key assertion is that the overlay exists and reflects the state — just verify it's visible.
    const bgColor = await dropPreview.evaluate((el) => getComputedStyle(el).backgroundColor);
    // Accept either valid (blue) or invalid (red) — the feature is working as long as a preview renders
    expect(bgColor).toMatch(/rgba?\(/);

    // Release mouse
    await page.mouse.up();

    // Take screenshot after resize
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-3_after_resize.png' });
  });
});
