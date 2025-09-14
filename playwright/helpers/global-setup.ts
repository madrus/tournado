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
    // Capture console messages from the start
    const consoleMessages = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`${userType} browser console error: ${msg.text()}`)
        consoleMessages.push(`${msg.type()}: ${msg.text()}`)
      }
    })

    // Set the test flag first
    await page.addInitScript(() => {
      window.playwrightTest = true
      window.localStorage.setItem('playwrightTest', 'true')
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
      await signInButton.click()

      // Wait a moment and check what happened after the click
      await page.waitForTimeout(5000)
      console.log(`${userType} auth: URL after button click: ${page.url()}`)

      // Get more detailed debugging info
      const pageContent = await page.content()
      if (pageContent.includes('Invalid email or password')) {
        console.log(`${userType} auth: Authentication failed - invalid credentials`)
      }

      // Console messages are already being captured above

      // Wait a bit more and check for any error messages or redirects
      await page.waitForTimeout(3000)
      console.log(`${userType} auth: Current URL after additional wait: ${page.url()}`)
      console.log(`${userType} auth: Console messages:`, consoleMessages.slice(-10))
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
