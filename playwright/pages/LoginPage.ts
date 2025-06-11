/* eslint-disable no-console */
import { expect, type Locator, type Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class LoginPage extends BasePage {
  private baseUrl: string
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly signInButton: Locator
  readonly errorMessage: Locator

  constructor(protected override page: Page) {
    super(page)
    this.baseUrl = 'http://localhost:5173'
    this.emailInput = page.locator('input[name="email"]')
    this.passwordInput = page.locator('input[name="password"]')
    this.signInButton = page.getByRole('button', { name: /sign in/i })
    this.errorMessage = page.locator('[data-testid="form-error"]')
  }

  async expectToBeOnLoginPage(): Promise<void> {
    console.log('- checking if on signin page...')
    await this.page.waitForURL(/.*\/auth\/signin.*/, { timeout: 10000 })
    await expect(this.page.getByRole('button', { name: /sign in/i })).toBeVisible()
  }

  async verifyAuthentication(): Promise<void> {
    console.log('- verifying authentication state...')

    // Try to verify authentication, retry if needed
    let retries = 3
    while (retries > 0) {
      try {
        // Wait for critical UI elements with explicit timeouts
        try {
          // Wait for user menu button - this is our key indicator of being logged in
          await this.userMenuButton.waitFor({ state: 'visible', timeout: 10000 })
          console.log('- UI verification successful')
          return
        } catch (uiError) {
          console.log(`- UI verification failed: ${uiError}`)
          retries--
          if (retries > 0) {
            await this.page.waitForTimeout(2000)
          }
          continue
        }
      } catch (error) {
        console.log(`- auth check error: ${error}, retries left: ${retries}`)
        retries--
        if (retries > 0) {
          await this.page.waitForTimeout(2000)
        }
      }
    }

    throw new Error('Failed to verify authentication after retries')
  }

  async login(email: string, password: string): Promise<void> {
    console.log('- performing login...')

    // Navigate to signin page
    await this.page.goto(`${this.baseUrl}/auth/signin`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })

    // Wait for page to stabilize
    await this.page.waitForLoadState('domcontentloaded')

    // Fill in credentials
    console.log('- filling credentials...')
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)

    // Wait for form stability
    await this.page.waitForTimeout(1000)

    // Submit login form
    console.log('- submitting login form...')
    await this.signInButton.click()

    // Wait for navigation to complete (successful login should redirect)
    try {
      await this.page.waitForURL(url => !url.toString().includes('/auth/signin'), {
        timeout: 15000,
      })
      console.log(`- redirected to: ${this.page.url()}`)
    } catch (_error) {
      console.log(`- no redirect occurred, still at: ${this.page.url()}`)

      // Take a screenshot for debugging
      await this.page.screenshot({
        path: 'playwright-results/login-failed.png',
        fullPage: true,
      })

      // Check for form errors
      const errorElements = await this.page
        .locator('[data-cy="form-error"], .error, [role="alert"]')
        .count()
      if (errorElements > 0) {
        const errorText = await this.page
          .locator('[data-cy="form-error"], .error, [role="alert"]')
          .first()
          .textContent()
        throw new Error(`Login form error: ${errorText}`)
      }
      throw new Error(`Login failed - no redirect and no visible errors`)
    }

    // Verify authentication by checking for user menu button
    await this.verifyAuthentication()
  }

  async expectLoginSuccess(): Promise<void> {
    console.log('🔍 Verifying login success (should redirect away from login)')
    // Wait for navigation away from login page
    await this.page.waitForURL(url => !url.toString().includes('/auth/signin'), {
      timeout: 10000,
    })
    console.log('✅ Successfully redirected away from login page')
  }

  async expectLoginError(expectedError?: string): Promise<void> {
    console.log('🔍 Verifying login error is displayed')
    await expect(this.errorMessage).toBeVisible()

    if (expectedError) {
      await expect(this.errorMessage).toContainText(expectedError)
      console.log(`✅ Expected error message found: ${expectedError}`)
    } else {
      console.log('✅ Error message is visible')
    }
  }
}
