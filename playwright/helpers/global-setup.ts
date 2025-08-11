/* eslint-disable no-console */
import { chromium, FullConfig } from '@playwright/test'

import {
  cleanDatabaseCompletely,
  createAdminUser,
  createManagerUser,
  createRefereeUser,
} from './database'

// Set environment variable for test detection
process.env.PLAYWRIGHT = 'true'

// Wait for server to be ready
async function waitForServer(url: string, timeout = 60000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error(`Server at ${url} did not respond within ${timeout}ms`)
}

async function globalSetup(_config: FullConfig): Promise<void> {
  // Set environment variables for server-side test detection
  process.env.PLAYWRIGHT = 'true'
  process.env.NODE_ENV = 'test'
  process.env.PLAYWRIGHT_GLOBAL_SETUP = 'true'

  // Wait for server to be ready - use the configured baseURL
  const serverUrl = process.env.PORT
    ? `http://localhost:${process.env.PORT}`
    : 'http://localhost:5173'
  await waitForServer(serverUrl)

  // Clean database completely before starting tests
  await cleanDatabaseCompletely()

  const browserConfig = {
    viewport: { width: 375, height: 812 }, // Mobile viewport
    baseURL: serverUrl,
    extraHTTPHeaders: {
      'Accept-Language': 'nl,en;q=0.9', // Use Dutch with English fallback for consistent testing
      'x-test-bypass': 'true', // Bypass rate limiting in tests
    },
    // Set language cookie for all tests to ensure consistent Dutch language
    locale: 'nl-NL',
    // Set cookies to force Dutch language in the app
    storageState: {
      cookies: [
        {
          name: 'lang',
          value: 'nl',
          domain: 'localhost',
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'Lax',
        },
      ],
      origins: [],
    },
  }

  // Create browser instance for authentication
  const browser = await chromium.launch()

  try {
    const adminUser = await createAdminUser()
    await createAuthState(
      browser,
      browserConfig,
      adminUser.email,
      './playwright/.auth/admin-auth.json',
      'admin'
    )

    const regularUser = await createManagerUser()
    await createAuthState(
      browser,
      browserConfig,
      regularUser.email,
      './playwright/.auth/user-auth.json',
      'regular user'
    )
  } catch (error) {
    console.error('Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

async function createAuthState(
  browser: any,
  browserConfig: any,
  email: string,
  authFilePath: string,
  userType: string
): Promise<void> {
  const context = await browser.newContext(browserConfig)
  const page = await context.newPage()

  try {
    await page.goto('/auth/signin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.locator('#email').fill(email)
    await page.locator('#password').fill('MyReallyStr0ngPassw0rd!!!')

    const signInButton = page.locator('button[type="submit"]')
    await signInButton.waitFor({ state: 'visible', timeout: 30000 })
    await signInButton.click()

    if (userType === 'admin') {
      await page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 30000 })
    } else {
      await page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 30000 })
    }

    await context.storageState({ path: authFilePath })
  } catch (error) {
    console.error(`${userType} authentication setup failed:`, error)

    await page.screenshot({
      path: `./playwright/.auth/${userType}-setup-error.png`,
      fullPage: true,
    })

    throw error
  } finally {
    await context.close()
  }
}

export default globalSetup
