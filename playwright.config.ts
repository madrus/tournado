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
  globalSetup: './playwright/helpers/global-setup.ts', // Creates both admin and user auth contexts
  globalTeardown: './playwright/helpers/global-teardown.ts', // Clean database after tests
  testDir: './playwright/tests',
  /* Enable parallel execution for faster local testing */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Optimized workers: CI uses 2, M4 MacBook Pro uses 6 (optimal for 24GB RAM) */
  workers: process.env.CI ? 2 : 6,
  /* Add expect timeout for CI reliability */
  expect: {
    timeout: process.env.CI ? 10000 : 5000, // Longer timeouts in CI
  },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['dot']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5174',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',

    /* Record video for all tests - change to 'on' to record all tests */
    video: 'on',

    /* Take screenshot on failure */
    screenshot: 'on',

    /* Timeouts - using proven working values */
    actionTimeout: 15000,
    navigationTimeout: 30000,

    /* Add test header for server-side test detection */
    extraHTTPHeaders: {
      'Accept-Language': 'nl-NL,nl;q=0.9', // Use Dutch for consistent locators
      'x-test-bypass': 'true', // Bypass rate limiting in tests
    },
  },

  /* Configure projects for major browsers */
  projects: [
    // Admin tests - use admin authentication context
    {
      name: 'admin-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './playwright/.auth/admin-auth.json',
        locale: 'nl-NL',
      },
      testMatch: ['**/admin-*.spec.ts'],
    },

    // Regular user tests - use regular user authentication context for user-specific features
    {
      name: 'user-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './playwright/.auth/user-auth.json',
        locale: 'nl-NL',
      },
      testMatch: ['**/menu-toggle.spec.ts', '**/user-authorization.spec.ts'],
    },

    // Public/no-auth tests - for testing auth flows, public access, and features available to all users
    {
      name: 'no-auth',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'nl-NL',
        // Force Dutch language cookie for consistent locator text
        storageState: {
          cookies: [
            {
              name: 'lang',
              value: 'nl',
              domain: 'localhost',
              path: '/',
              expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // 1 year
              httpOnly: false,
              secure: false,
              sameSite: 'Lax',
            },
          ],
          origins: [],
        },
      },
      testMatch: [
        '**/auth*.spec.ts',
        '**/teams-*.spec.ts',
        '**/navigation.spec.ts',
        '**/authorization.spec.ts',
        '**/firebase-auth.spec.ts',
        '**/business-logic-auth-example.spec.ts',
        '**/role-based-redirects.spec.ts',
      ],
    },

    // Visual regression tests - for testing visual consistency across themes
    {
      name: 'visual-regression',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './playwright/.auth/admin-auth.json',
        locale: 'nl-NL',
      },
      testMatch: ['**/visual-regression.spec.ts'],
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
