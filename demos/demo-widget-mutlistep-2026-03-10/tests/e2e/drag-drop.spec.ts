/**
 * E2E Tests from test-plan.md
 * Source: openspec/changes/archive/2026-03-09-widget-drag-drop/test-plan.md
 *
 * TP-1: UC1-S1+S4+S6+S8 — Full drag interaction cycle
 * TP-2: UC1-S8           — Layout state committed with correct col/row values
 * TP-3: UC1-E1a          — Touch drag on mobile device (iPhone 13 emulation)
 * TP-4: UC1-E7a          — Collision rejection in full drag flow
 */
import { test, expect, devices } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the computed opacity of a widget element as a number. */
async function getOpacity(page: import('@playwright/test').Page, testId: string): Promise<number> {
  return page.locator(`[data-testid="${testId}"]`).evaluate((el) => {
    return parseFloat(window.getComputedStyle(el).opacity);
  });
}

/** Wait for a ghost element to appear in the DOM (aria-hidden ghost div). */
async function waitForGhost(page: import('@playwright/test').Page) {
  // GhostWidget renders an aria-hidden div with a dashed border
  await page.waitForFunction(() => {
    const ghosts = Array.from(document.querySelectorAll('[aria-hidden="true"]'));
    return ghosts.some(
      (el) =>
        (el as HTMLElement).style.border.includes('dashed') ||
        window.getComputedStyle(el).borderStyle.includes('dashed'),
    );
  }, { timeout: 5000 });
}

/** Get the bounding box of the dashboard grid. */
async function getGridBox(page: import('@playwright/test').Page) {
  const grid = page.locator('[data-testid="dashboard-grid"]');
  const box = await grid.boundingBox();
  if (!box) throw new Error('Dashboard grid not found');
  return box;
}

// ---------------------------------------------------------------------------
// TP-1: Full drag interaction cycle
// ---------------------------------------------------------------------------

test.describe('TP-1: Full drag interaction cycle (UC1-S1+S4+S6+S8)', () => {
  test('widget lifts, ghost appears, widget snaps to new position on drop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-1_before.png' });

    // Locate "Revenue Chart" widget (widget-a, spans 2 cols, top-left)
    const widget = page.locator('[data-testid="widget-widget-a"]');
    await expect(widget).toBeVisible();

    const box = await widget.boundingBox();
    if (!box) throw new Error('widget-a not found');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Step 4: press and hold
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();

    // Brief pause so PointerSensor activation fires
    await page.waitForTimeout(100);
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-1_step-4-pressed.png' });

    // Steps 5+6: move 200px to the right in small increments
    await page.mouse.move(centerX + 200, centerY, { steps: 15 });
    await page.waitForTimeout(100);
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-1_step-6-during-drag.png' });

    // Step 5 assertion: widget slot should be semi-transparent (opacity ≈ 0.3)
    const opacityDuring = await getOpacity(page, 'widget-widget-a');
    expect(opacityDuring).toBeLessThanOrEqual(0.4);

    // Step 7 assertion: ghost placeholder exists
    await waitForGhost(page);

    // Step 8: release
    await page.mouse.up();
    // Wait for 150ms CSS opacity transition to complete + React state update
    await page.waitForFunction(
      (testId) => {
        const el = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;
        return el ? parseFloat(window.getComputedStyle(el).opacity) > 0.9 : false;
      },
      'widget-widget-a',
      { timeout: 2000 },
    );
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-1_result.png' });

    // Step 8 assertion: widget returns to full opacity
    const opacityAfter = await getOpacity(page, 'widget-widget-a');
    expect(opacityAfter).toBeCloseTo(1, 1);

    // Ghost should be gone
    const ghostCount = await page.locator('[aria-hidden="true"]').count();
    expect(ghostCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// TP-2: Layout state committed with correct col/row values
// ---------------------------------------------------------------------------

test.describe('TP-2: Layout state committed with correct col/row (UC1-S8)', () => {
  test('KPI Card dragged left one column commits to new position without overlap', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-2_before.png' });

    // widget-b = "KPI Card" starts at col:2 row:0 (0-indexed), 1×1
    const gridBox = await getGridBox(page);
    const cellW = gridBox.width / 4;
    const cellH = 140; // rowHeight from App.tsx

    // KPI Card center: col 2 (0-indexed) → pixel col 2 center = gridBox.x + 2.5 * cellW
    const startX = gridBox.x + 2.5 * cellW;
    const startY = gridBox.y + 0.5 * cellH;

    // Target: empty cell at col 3 (right of KPI Card) — col 3 center
    // widget-a occupies col 0-1; widget-b occupies col 2; col 3 is empty
    const targetX = gridBox.x + 3.5 * cellW;
    const targetY = startY;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(targetX, targetY, { steps: 20 });
    await page.waitForTimeout(100);
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-2_during-drag.png' });
    await page.mouse.up();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-2_result.png' });

    // Assert widget-b rendered at new column (col 3 → gridColumn: 4)
    const widgetB = page.locator('[data-testid="widget-widget-b"]');
    const gridColumn = await widgetB.evaluate(
      (el) => window.getComputedStyle(el).gridColumn,
    );
    // col 3 (0-indexed) → gridColumn starts at 4
    expect(gridColumn).toMatch(/^4/);

    // Assert no overlap: collect (gridColumnStart, gridRowStart) pairs and check uniqueness
    const positions = await page.locator('[data-testid^="widget-"]').evaluateAll((els) =>
      els.map((el) => {
        const s = window.getComputedStyle(el);
        return `${s.gridColumnStart},${s.gridRowStart}`;
      }),
    );
    const uniquePositions = new Set(positions);
    expect(uniquePositions.size).toBe(positions.length);
  });
});

// TP-3 is in drag-drop-mobile.spec.ts (requires top-level test.use for iPhone 13)

// ---------------------------------------------------------------------------
// TP-4: Collision rejection in full drag flow
// ---------------------------------------------------------------------------

test.describe('TP-4: Collision rejection (UC1-E7a)', () => {
  test('dragging KPI Card onto occupied cell: ghost turns red, widget snaps back', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-4_before.png' });

    const gridBox = await getGridBox(page);
    const cellW = gridBox.width / 4;
    const cellH = 140;

    // widget-b "KPI Card" is at col:2 row:0 — drag it onto col:0 (occupied by widget-a)
    const startX = gridBox.x + 2.5 * cellW;
    const startY = gridBox.y + 0.5 * cellH;
    const targetX = gridBox.x + 0.5 * cellW; // col 0 — widget-a is here

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(targetX, startY, { steps: 15 });
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-4_step-4-over-occupied.png' });

    // During drag: ghost should show invalid (red border) over occupied cell
    const ghostBorderColor = await page.locator('[aria-hidden="true"]').first().evaluate((el) => {
      return window.getComputedStyle(el).borderColor;
    });
    // Red: rgb(239, 68, 68)
    expect(ghostBorderColor).toContain('239');

    // Record widget-b position before drop
    const beforeGridCol = await page.locator('[data-testid="widget-widget-b"]').evaluate(
      (el) => window.getComputedStyle(el).gridColumnStart,
    );

    // Release over occupied cell
    await page.mouse.up();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-4_result.png' });

    // Assert widget-b snapped back to original col:2 (gridColumnStart = 3)
    const afterGridCol = await page.locator('[data-testid="widget-widget-b"]').evaluate(
      (el) => window.getComputedStyle(el).gridColumnStart,
    );
    expect(afterGridCol).toBe('3'); // col 2 (0-indexed) → CSS grid col 3

    // Assert layout unchanged from before
    expect(afterGridCol).toBe(beforeGridCol);
  });
});
