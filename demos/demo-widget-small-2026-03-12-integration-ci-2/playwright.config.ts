import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'e2e-results/latest/playwright-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'on',
    screenshotsPath: 'e2e-results/latest/artifacts',
    trace: 'off',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
