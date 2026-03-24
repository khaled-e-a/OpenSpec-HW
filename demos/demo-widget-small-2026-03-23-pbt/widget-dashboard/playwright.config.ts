import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: false,
  retries: 0,
  reporter: [['json', { outputFile: '../e2e-results/latest/playwright-results.json' }], ['list']],
  use: {
    baseURL: 'http://localhost:3001',
    screenshot: { mode: 'on', fullPage: true },
    video: 'off',
  },
  outputDir: '../e2e-results/latest/artifacts',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx serve -s build -l 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 30000,
    stdout: 'ignore',
    stderr: 'ignore',
  },
});
