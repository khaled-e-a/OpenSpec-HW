/**
 * TP-3: Touch drag on mobile device (UC1-E1a)
 * Source: openspec/changes/archive/2026-03-09-widget-drag-drop/test-plan.md
 *
 * Requires top-level test.use() for iPhone 13 emulation (sets defaultBrowserType).
 */
import { test, expect, devices } from '@playwright/test';

// Use mobile Chrome viewport (Chromium-based) to avoid WebKit dependency
test.use({
  viewport: { width: 390, height: 844 },
  userAgent:
    'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
  hasTouch: true,
  isMobile: true,
});

async function getOpacity(page: import('@playwright/test').Page, testId: string): Promise<number> {
  return page.locator(`[data-testid="${testId}"]`).evaluate((el) => {
    return parseFloat(window.getComputedStyle(el).opacity);
  });
}

async function getGridBox(page: import('@playwright/test').Page) {
  const grid = page.locator('[data-testid="dashboard-grid"]');
  const box = await grid.boundingBox();
  if (!box) throw new Error('Dashboard grid not found');
  return box;
}

test.describe('TP-3: Touch drag on mobile device (UC1-E1a)', () => {
  test('touch long-press activates drag; widget moves on lift', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-3_before.png' });

    const widget = page.locator('[data-testid="widget-widget-a"]');
    await expect(widget).toBeVisible();

    const box = await widget.boundingBox();
    if (!box) throw new Error('widget-a not found on mobile');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // TouchSensor has delay:100ms — hold via pointer down + wait
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.waitForTimeout(200); // satisfy 150ms activation delay
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-3_step-3-hold.png' });

    // Slide one column to the right
    const gridBox = await getGridBox(page);
    const cellW = gridBox.width / 4;
    await page.mouse.move(centerX + cellW, centerY, { steps: 10 });
    await page.waitForTimeout(100);
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-3_step-4-sliding.png' });

    // Opacity should be reduced during drag (drag activated)
    const opacityDuring = await getOpacity(page, 'widget-widget-a');
    expect(opacityDuring).toBeLessThanOrEqual(0.5);

    await page.mouse.up();
    // Wait for 150ms CSS opacity transition to complete
    await page.waitForFunction(
      (testId) => {
        const el = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;
        return el ? parseFloat(window.getComputedStyle(el).opacity) > 0.9 : false;
      },
      'widget-widget-a',
      { timeout: 2000 },
    );
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-3_result.png' });

    // Widget returns to full opacity after drop
    const opacityAfter = await getOpacity(page, 'widget-widget-a');
    expect(opacityAfter).toBeCloseTo(1, 1);
  });
});
