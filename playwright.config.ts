import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  // fullyParallel: false in CI to avoid port conflicts with single worker
  fullyParallel: !isCI,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [['html'], ['github']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    // Capture screenshot on failure for easier debugging
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Root cause fix: Mobile Safari (WebKit) is not available on ubuntu-latest CI.
    // Only run it locally where WebKit is installed.
    ...(!isCI ? [{
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    }] : []),
  ],
  // Root cause fix: use `npm start` (production server) instead of `npm run dev`.
  // Dev server takes 60+ seconds to compile in CI and can race with test start.
  // Production server boots in ~3 seconds after `npm run build` completes.
  webServer: process.env.BASE_URL ? undefined : {
    command: isCI ? 'npm start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});

