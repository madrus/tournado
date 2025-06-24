import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  globalSetup: './playwright/helpers/global-setup.ts', // Re-enabled for auth.json creation
  globalTeardown: './playwright/helpers/global-teardown.ts', // Clean database after tests
  testDir: './playwright/tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Add expect timeout for CI reliability */
  expect: {
    timeout: process.env.CI ? 10000 : 5000, // Longer timeouts in CI
  },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PORT
      ? `http://localhost:${process.env.PORT}`
      : 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',

    /* Record video for all tests - change to 'on' to record all tests */
    video: 'on',

    /* Take screenshot on failure */
    screenshot: 'on',

    /* Optimized timeouts - reduced since form issues are resolved */
    actionTimeout: process.env.CI ? 20000 : 10000, // 20s in CI, 10s locally
    navigationTimeout: process.env.CI ? 30000 : 15000, // 30s in CI, 15s locally

    /* Add test header for server-side test detection */
    extraHTTPHeaders: {
      'Accept-Language': 'nl,en;q=0.9', // Use Dutch with English fallback for Playwright tests
    },
  },

  /* Configure projects for major browsers */
  projects: [
    // Admin tests - use authenticated state from global setup
    {
      name: 'admin-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './playwright/.auth/auth.json',
      },
      testMatch: ['**/admin-*.spec.ts'],
    },

    // Public tests - no authentication required
    {
      name: 'public-no-auth',
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
      testMatch: ['**/public-*.spec.ts', '**/teams.spec.ts'],
    },

    // Auth flow tests - per-test authentication (login/signup testing)
    {
      name: 'auth-flows',
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
      testMatch: [
        '**/auth*.spec.ts',
        '**/authorization.spec.ts',
        '**/navigation.spec.ts',
      ],
    },

    // Uncomment for multi-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Web server is managed by start-server-and-test for local development */
  // webServer: {
  //   command: 'pnpm dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000, // 2 minutes for server to start
  // },
})
