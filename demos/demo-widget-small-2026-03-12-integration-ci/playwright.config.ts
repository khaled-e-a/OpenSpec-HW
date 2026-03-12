import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  outputDir: 'e2e-results/latest/artifacts',
  reporter: [
    ['json', { outputFile: 'e2e-results/latest/playwright-results.json' }],
    ['html', { outputFolder: 'e2e-results/latest/html-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:5174',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx vite --port 5174',
    port: 5174,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
