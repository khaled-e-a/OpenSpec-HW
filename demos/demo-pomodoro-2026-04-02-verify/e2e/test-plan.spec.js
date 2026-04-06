/**
 * e2e/test-plan.spec.js
 * Playwright tests covering TP-1 through TP-4 from test-plan.md
 * Change: update-timer-durations-and-notes
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('TP-1: R4-S1 — Notes area visible in all timer states', () => {
  test('notes textarea is visible in IDLE, RUNNING, and PAUSED states', async ({ page }) => {
    await page.goto('/');

    // IDLE state — notes area should be present
    const textarea = page.locator('#task-notes');
    await expect(textarea).toBeVisible();
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-1_idle.png', fullPage: true });

    // RUNNING state
    await page.locator('#btn-start').click();
    await expect(textarea).toBeVisible();
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-1_running.png', fullPage: true });

    // PAUSED state
    await page.locator('#btn-pause').click();
    await expect(textarea).toBeVisible();
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-1_paused.png', fullPage: true });

    // IDLE again after reset
    await page.locator('#btn-reset').click();
    await expect(textarea).toBeVisible();
  });
});

test.describe('TP-2: R4-S5 — Notes area has visible placeholder when empty', () => {
  test('placeholder text is set on empty textarea', async ({ page }) => {
    await page.goto('/');

    const textarea = page.locator('#task-notes');
    await expect(textarea).toBeVisible();

    // Verify placeholder attribute is non-empty
    const placeholder = await textarea.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder.length).toBeGreaterThan(0);

    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-2_placeholder.png', fullPage: true });
  });
});

test.describe('TP-3: UC3-S1 — User clicks notes area and types', () => {
  test('textarea accepts input and retains value', async ({ page }) => {
    await page.goto('/');

    const textarea = page.locator('#task-notes');
    await textarea.click();
    await textarea.fill('Fix login bug — check token expiry');

    await expect(textarea).toHaveValue('Fix login bug — check token expiry');
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-3_typing.png', fullPage: true });
  });

  test('notes value is preserved after session transition', async ({ page }) => {
    await page.goto('/');

    const textarea = page.locator('#task-notes');
    await textarea.fill('Important task note');

    // Start timer, wait briefly, then reset (we can't wait 30 min in e2e)
    await page.locator('#btn-start').click();
    await page.waitForTimeout(1200); // 1.2 s — timer ticks
    await page.locator('#btn-reset').click();

    // Notes must be unchanged
    await expect(textarea).toHaveValue('Important task note');
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-3_preserved.png', fullPage: true });
  });
});

test.describe('TP-4: R3-S3 — Countdown shows correct full durations on load', () => {
  test('countdown shows 30:00 on fresh load', async ({ page }) => {
    await page.goto('/');

    const countdown = page.locator('#countdown');
    await expect(countdown).toBeVisible();
    await expect(countdown).toHaveText('30:00');
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-4_initial.png', fullPage: true });
  });

  test('countdown decrements after starting', async ({ page }) => {
    await page.goto('/');

    const countdown = page.locator('#countdown');
    await expect(countdown).toHaveText('30:00');

    await page.locator('#btn-start').click();
    // Wait 2+ seconds for at least one tick
    await page.waitForTimeout(2200);

    const text = await countdown.textContent();
    expect(text).not.toBe('30:00'); // Must have counted down
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-4_running.png', fullPage: true });
  });

  test('countdown resets to 30:00 after reset', async ({ page }) => {
    await page.goto('/');

    const countdown = page.locator('#countdown');
    await page.locator('#btn-start').click();
    await page.waitForTimeout(1500);
    await page.locator('#btn-reset').click();

    await expect(countdown).toHaveText('30:00');
    await page.screenshot({ path: 'e2e-results/latest/artifacts/TP-4_reset.png', fullPage: true });
  });
});
