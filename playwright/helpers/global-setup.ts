/* eslint-disable no-console */
import { chromium, FullConfig } from '@playwright/test'

import { cleanDatabase, createAdminUser } from './database'

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

  // Create a browser instance for authentication
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // Mobile viewport
    baseURL: serverUrl,
    extraHTTPHeaders: {
      'Accept-Language': 'nl,en;q=0.9', // Use Dutch with English fallback for Playwright tests
    },
  })
  const page = await context.newPage()

  try {
    // Create admin user
    const adminUser = await createAdminUser()

    // Navigate to signin page
    await page.goto('/auth/signin')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Fill out login form
    await page.locator('#email').fill(adminUser.email)
    await page.locator('#password').fill('MyReallyStr0ngPassw0rd!!!')

    // Wait for and click the Sign In button
    const signInButton = page.locator('button[type="submit"]')
    await signInButton.waitFor({ state: 'visible', timeout: 30000 })
    await signInButton.click()

    // Wait for successful login redirect
    await page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 30000 })

    // Save authentication state
    await context.storageState({ path: './playwright/.auth/auth.json' })

    // Don't clean up the test user here - we need it to exist for the session to be valid
    console.log(
      `- admin user ${adminUser.email} created for global authentication state`
    )
  } catch (error) {
    console.error('- global setup failed:', error)

    // Take a debug screenshot
    await page.screenshot({
      path: './playwright/.auth/global-setup-error.png',
      fullPage: true,
    })

    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
