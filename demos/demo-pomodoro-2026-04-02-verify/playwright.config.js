import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  reporter: [['json', { outputFile: 'e2e-results/latest/playwright-results.json' }], ['list']],
  use: {
    baseURL: 'http://localhost:3001',
    screenshot: { mode: 'on', fullPage: true },
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx serve . -p 3001 -n',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 15000,
  },
  outputDir: 'e2e-results/latest/artifacts',
});
