import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/features',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    testIdAttribute: 'data-test-id',
    baseURL: 'http://127.0.0.1:4322/',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm exec astro preview --host 127.0.0.1 --port 4322',
    port: 4322,
    reuseExistingServer: false,
  },
});
