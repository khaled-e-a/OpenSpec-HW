/**
 * E2E tests for widget-types — covering test-plan.md TP-1 through TP-6.
 * Runner: Playwright / Chromium
 */
import { test, expect } from '@playwright/test';
import path from 'path';

const FIXTURE_IMAGE = path.join(__dirname, 'fixtures', 'test-image.png');
const FIXTURE_TEXT  = path.join(__dirname, 'fixtures', 'test-file.txt');

// ---------------------------------------------------------------------------
// TP-2: UC2-S1 / UC3-S1 / UC4-S1 — All four widget types visible on load
// ---------------------------------------------------------------------------
test('TP-2: initial render — all four widget types display correctly', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'e2e-results/latest/artifacts/wt-tp2-initial.png', fullPage: true });

  // Clock widgets (analytics + metrics)
  const analyticsText = await page.getByTestId('widget-analytics').getByTestId('clock-display').textContent();
  expect(analyticsText).toMatch(/\d{2}:\d{2}:\d{2}/);

  const metricsText = await page.getByTestId('widget-metrics').getByTestId('clock-display').textContent();
  expect(metricsText).toMatch(/\d{2}:\d{2}:\d{2}/);

  // Image widget (status) — placeholder
  await expect(page.getByTestId('widget-status').getByText(/click to choose image/i)).toBeVisible();

  // File widget (chart) — placeholder
  await expect(page.getByTestId('widget-chart').getByText(/click to choose file/i)).toBeVisible();

  // Webpage widget (activity) — prompt
  await expect(page.getByTestId('widget-activity').getByText(/enter a url/i)).toBeVisible();
});

// ---------------------------------------------------------------------------
// TP-3: UC2-S4/S5/S6 — Image widget: pick file → image displayed
// ---------------------------------------------------------------------------
test('TP-3: UC2-S4/S5/S6 — image widget file pick renders image', async ({ page }) => {
  await page.goto('/');

  // Open config panel
  await page.getByTestId('widget-status').getByRole('button', { name: /settings/i }).click();
  await expect(page.getByTestId('image-config-panel')).toBeVisible();

  await page.screenshot({ path: 'e2e-results/latest/artifacts/wt-tp3-config-open.png', fullPage: true });

  // Pick file
  await page.getByTestId('image-file-input').setInputFiles(FIXTURE_IMAGE);
  await page.waitForTimeout(400);

  await page.screenshot({ path: 'e2e-results/latest/artifacts/wt-tp3-after-pick.png', fullPage: true });

  // Config panel should close
  await expect(page.getByTestId('image-config-panel')).not.toBeVisible();

  // Image should be rendered
  const img = page.getByTestId('widget-status').locator('img');
  await expect(img).toBeVisible();
  const src = await img.getAttribute('src');
  expect(src).toMatch(/^blob:/);

  // Placeholder text gone
  await expect(page.getByTestId('widget-status').getByText(/click to choose image/i)).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// TP-4: UC3-S4/S5/S6 — File widget: pick text file → contents rendered
// ---------------------------------------------------------------------------
test('TP-4: UC3-S4/S5/S6 — file widget shows text content after pick', async ({ page }) => {
  await page.goto('/');

  // Open config panel
  await page.getByTestId('widget-chart').getByRole('button', { name: /settings/i }).click();
  await expect(page.getByTestId('file-config-panel')).toBeVisible();

  // Pick file
  await page.getByTestId('file-file-input').setInputFiles(FIXTURE_TEXT);
  await page.waitForTimeout(400);

  await page.screenshot({ path: 'e2e-results/latest/artifacts/wt-tp4-after-pick.png', fullPage: true });

  // Config panel closed
  await expect(page.getByTestId('file-config-panel')).not.toBeVisible();

  // Contents rendered in pre
  const pre = page.getByTestId('widget-chart').locator('[data-testid="file-content"]');
  await expect(pre).toBeVisible();
  await expect(pre).toContainText('Hello from test file');
});

// ---------------------------------------------------------------------------
// TP-5: UC4-S4/S5/S6 — Webpage widget: enter URL → iframe rendered
// ---------------------------------------------------------------------------
test('TP-5: UC4-S4/S5/S6 — webpage widget renders iframe after URL entry', async ({ page }) => {
  await page.goto('/');

  // Open config panel
  await page.getByTestId('widget-activity').getByRole('button', { name: /settings/i }).click();
  await expect(page.getByTestId('webpage-config-panel')).toBeVisible();

  // Enter URL
  await page.getByTestId('webpage-url-input').fill('https://example.com');
  await page.getByTestId('webpage-config-panel').getByRole('button', { name: /^load$/i }).click();
  await page.waitForTimeout(400);

  await page.screenshot({ path: 'e2e-results/latest/artifacts/wt-tp5-after-url.png', fullPage: true });

  // Config panel closed
  await expect(page.getByTestId('webpage-config-panel')).not.toBeVisible();

  // iframe rendered with correct src
  const iframe = page.getByTestId('widget-activity').locator('iframe');
  await expect(iframe).toBeVisible();
  expect(await iframe.getAttribute('src')).toBe('https://example.com');

  // Embedding note visible
  await expect(page.getByTestId('embedding-note')).toBeVisible();
});

// ---------------------------------------------------------------------------
// TP-6: UC5 full flow — Change widget content source; position unchanged
// ---------------------------------------------------------------------------
test('TP-6: UC5 — change image widget source; grid position unchanged', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'e2e-results/latest/artifacts/wt-tp6-before.png', fullPage: true });

  // Record grid position before
  const posBefore = await page.getByTestId('widget-status').evaluate(
    (el) => ({ col: el.style.gridColumn, row: el.style.gridRow })
  );

  // Change image
  await page.getByTestId('widget-status').getByRole('button', { name: /settings/i }).click();
  await page.getByTestId('image-file-input').setInputFiles(FIXTURE_IMAGE);
  await page.waitForTimeout(400);

  await page.screenshot({ path: 'e2e-results/latest/artifacts/wt-tp6-after.png', fullPage: true });

  // Grid position unchanged
  const posAfter = await page.getByTestId('widget-status').evaluate(
    (el) => ({ col: el.style.gridColumn, row: el.style.gridRow })
  );
  expect(posAfter).toEqual(posBefore);

  // All 5 widgets still visible
  for (const id of ['analytics', 'status', 'chart', 'activity', 'metrics']) {
    await expect(page.getByTestId(`widget-${id}`)).toBeVisible();
  }
});
