import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  // Serial in CI to avoid port conflicts and resource exhaustion on shared runners
  fullyParallel: !isCI,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [['html'], ['github']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Run Mobile Safari on all environments — webkit is installed via
      // `npx playwright install --with-deps` in the workflow
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  // Use dev server in all environments — no production build required.
  // `npm run dev` boots in ~3-7 seconds with Turbopack and has a stable
  // "ready" signal. reuseExistingServer=true locally, false in CI for clean state.
  webServer: process.env.BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      SKIP_ENV_VALIDATION: '1',
    },
  },
});
