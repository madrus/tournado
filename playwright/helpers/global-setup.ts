/* eslint-disable no-console */
import { chromium, FullConfig } from '@playwright/test'

import { cleanDatabaseCompletely, createAdminUser, createManagerUser } from './database'
import { getFirebaseMockScript } from './firebase-mock'

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
    : 'http://localhost:5174'
  await waitForServer(serverUrl)

  // Clean database completely before starting tests
  await cleanDatabaseCompletely()

  const browserConfig = {
    viewport: { width: 375, height: 812 }, // Mobile viewport
    baseURL: serverUrl,
    extraHTTPHeaders: {
      'Accept-Language': 'nl-NL,nl;q=0.9', // Use Dutch for consistent locators
      'x-test-bypass': 'true', // Bypass rate limiting in tests
    },
    // Set language cookie for all tests to ensure consistent Dutch language
    locale: 'nl-NL',
    // Set cookies to use Dutch language in the app (natural default)
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
    // Capture console messages from the start
    const consoleMessages = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`${userType} browser console error: ${msg.text()}`)
        consoleMessages.push(`${msg.type()}: ${msg.text()}`)
      }
    })

    // Set the test flag and use Dutch language (natural default)
    await page.addInitScript(() => {
      window.playwrightTest = true
      window.localStorage.setItem('playwrightTest', 'true')
      // Use Dutch language in localStorage (app's natural default)
      window.localStorage.setItem('i18nextLng', 'nl')
      window.localStorage.setItem('language', 'nl')
      // Set Dutch language cookie
      document.cookie = 'lang=nl; path=/; domain=localhost'
    })

    // Inject Firebase mocks before navigation
    await page.addInitScript(getFirebaseMockScript())

    await page.goto('/auth/signin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Check if Firebase email sign-in form is available
    const emailInput = page.locator('#email')
    const passwordInput = page.locator('#password')

    if (await emailInput.isVisible({ timeout: 5000 })) {
      console.log(`Using Firebase email sign-in for ${userType}`)

      // Wait for the form to be enabled (Firebase to finish loading)
      console.log(`Waiting for email input to be enabled for ${userType}`)
      await emailInput.waitFor({ state: 'attached' })

      try {
        await page.waitForFunction(
          () => {
            const emailInput = document.getElementById('email')
            return emailInput && !emailInput.disabled
          },
          { timeout: 30000 }
        )
        console.log(`Email input is now enabled for ${userType}`)
      } catch (waitError) {
        console.log(
          `Failed to wait for email input to be enabled for ${userType}:`,
          waitError.message
        )
        // Try to force enable it by evaluating JavaScript
        await page.evaluate(() => {
          const emailInput = document.getElementById('email')
          const passwordInput = document.getElementById('password')
          const submitButton = document.querySelector('button[type="submit"]')
          if (emailInput) emailInput.disabled = false
          if (passwordInput) passwordInput.disabled = false
          if (submitButton) submitButton.disabled = false
          console.log('Force enabled form inputs and submit button')
        })
      }

      await emailInput.fill(email)
      await passwordInput.fill('MyReallyStr0ngPassw0rd!!!')

      // Look for the Firebase email sign-in button (not the Google button)
      // Handle both Dutch "Inloggen" and English "Sign In"
      const signInButton = page
        .locator('button[type="submit"]')
        .filter({ hasText: /(sign in|inloggen)/i })
      await signInButton.waitFor({ state: 'visible', timeout: 30000, enable: true })

      // Use Promise.race to either wait for navigation or timeout
      const navigationPromise = page
        .waitForNavigation({ timeout: 15000 })
        .catch(() => null)
      await signInButton.click()

      // Wait for either navigation to complete or timeout
      const navigationResult = await navigationPromise
      if (navigationResult) {
        console.log(`${userType} auth: Navigation completed to: ${page.url()}`)
      } else {
        console.log(
          `${userType} auth: No navigation detected after button click: ${page.url()}`
        )

        // Wait a bit more for potential delayed navigation
        await page.waitForTimeout(3000)
        console.log(`${userType} auth: URL after additional wait: ${page.url()}`)
      }
    } else {
      console.log(`Attempting Google sign-in for ${userType}`)

      // Try Google sign-in button
      const googleSignInButton = page.locator('button', {
        hasText: /continue with google/i,
      })
      await googleSignInButton.waitFor({ state: 'visible', timeout: 30000 })
      await googleSignInButton.click()
    }

    // Wait for successful authentication redirect
    try {
      if (userType === 'admin') {
        await page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 30000 })
      } else {
        await page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 30000 })
      }
    } catch (urlError) {
      const currentUrl = page.url()
      console.log(
        `${userType} authentication redirect failed. Current URL: ${currentUrl}`
      )
      throw urlError
    }

    await context.storageState({ path: authFilePath })
    console.log(`Successfully created ${userType} auth state`)
  } catch (error) {
    console.error(`${userType} authentication setup failed:`, error)

    // Take screenshot for debugging
    await page.screenshot({
      path: `./playwright/.auth/${userType}-setup-error.png`,
      fullPage: true,
    })

    // Get page content for debugging
    const content = await page.content()
    console.log(`Page content for ${userType} auth failure:`, content.slice(0, 500))

    throw error
  } finally {
    await context.close()
  }
}

export default globalSetup
