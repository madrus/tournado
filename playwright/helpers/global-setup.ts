/* eslint-disable no-console */
import { chromium, FullConfig } from '@playwright/test'

import { cleanDatabase, createAdminUser, createRegularUser } from './database'

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

  // Clean database before starting tests
  await cleanDatabase()

  const browserConfig = {
    viewport: { width: 375, height: 812 }, // Mobile viewport
    baseURL: serverUrl,
    extraHTTPHeaders: {
      'Accept-Language': 'nl,en;q=0.9', // Use Dutch with English fallback for Playwright tests
      'x-test-bypass': 'true', // Bypass rate limiting in tests
    },
  }

  // Create browser instance for authentication
  const browser = await chromium.launch()

  try {
    // Create admin user and save admin auth state
    const adminUser = await createAdminUser()
    await createAuthState(
      browser,
      browserConfig,
      adminUser.email,
      './playwright/.auth/admin-auth.json',
      'admin'
    )

    // Create regular user and save regular user auth state
    const regularUser = await createRegularUser()
    await createAuthState(
      browser,
      browserConfig,
      regularUser.email,
      './playwright/.auth/user-auth.json',
      'regular user'
    )

    console.log('- both authentication contexts created successfully')
  } catch (error) {
    console.error('- global setup failed:', error)
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
    console.log(`- creating ${userType} authentication context for ${email}`)

    // Navigate to signin page
    await page.goto('/auth/signin')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Fill out login form
    await page.locator('#email').fill(email)
    await page.locator('#password').fill('MyReallyStr0ngPassw0rd!!!')

    // Wait for and click the Sign In button
    const signInButton = page.locator('button[type="submit"]')
    await signInButton.waitFor({ state: 'visible', timeout: 30000 })
    await signInButton.click()

    // Wait for successful login redirect
    await page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 30000 })

    // Save authentication state
    await context.storageState({ path: authFilePath })

    console.log(`- ${userType} authentication state saved to ${authFilePath}`)
  } catch (error) {
    console.error(`- ${userType} authentication setup failed:`, error)

    // Take a debug screenshot
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
