/* eslint-disable no-console */
import { expect, type Locator, type Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class SignInPage extends BasePage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly signInButton: Locator
  readonly errorMessage: Locator

  constructor(protected override page: Page) {
    super(page)
    this.emailInput = page.locator('#email')
    this.passwordInput = page.locator('#password')
    this.signInButton = page.getByRole('button', { name: 'Inloggen' }) // Dutch text
    this.errorMessage = page.locator(
      '[data-testid="form-error"], .error, [role="alert"]'
    )
  }

  async expectToBeOnSignInPage(): Promise<void> {
    console.log('- checking if on signin page...')
    await this.page.waitForURL(/.*\/auth\/signin.*/, { timeout: 10000 })
    await expect(this.signInButton).toBeVisible()
  }

  async verifyAuthentication(): Promise<void> {
    console.log('- verifying authentication state...')

    // Wait for page to fully stabilize after navigation
    await this.page.waitForLoadState('domcontentloaded')
    await this.page.waitForLoadState('networkidle', { timeout: 10000 })

    // First check if the dropdown is already open (context menu might be open from previous interaction)
    const userDropdown = this.page.getByTestId('user-menu-dropdown')
    const isDropdownAlreadyVisible = await userDropdown.isVisible().catch(() => false)

    if (isDropdownAlreadyVisible) {
      console.log('- dropdown is already open, authentication verified!')
      return
    }

    // Wait for the menu button to be present and visible
    const userMenuButton = this.page.getByRole('button', { name: 'Toggle menu' })
    await userMenuButton.waitFor({ state: 'visible', timeout: 10000 })

    console.log('- menu button found, clicking to verify dropdown...')

    // Ensure button is in viewport and clickable
    await userMenuButton.scrollIntoViewIfNeeded()

    // Wait for JavaScript to be loaded and handlers attached
    await this.page.waitForFunction(
      () => window.React !== undefined || document.readyState === 'complete'
    )

    // Debug: Check if button is enabled and not covered
    const isEnabled = await userMenuButton.isEnabled()
    console.log(`- menu button enabled: ${isEnabled}`)

    // Try multiple click approaches since normal clicks aren't working
    try {
      // First try: normal click
      await userMenuButton.click()
      await this.page.waitForTimeout(500)
    } catch (error) {
      console.log('- normal click failed, trying force click...')
      try {
        // Second try: force click
        await userMenuButton.click({ force: true })
        await this.page.waitForTimeout(500)
      } catch (error2) {
        console.log('- force click failed, trying dispatch event...')
        // Third try: dispatch event directly
        await userMenuButton.dispatchEvent('click')
        await this.page.waitForTimeout(500)
      }
    }

    await userDropdown.waitFor({ state: 'visible', timeout: 5000 })

    console.log('- UI verification successful')
  }

  async signIn(email: string, password: string): Promise<void> {
    console.log('- performing sign in...')

    // Use relative URL - Playwright will use the configured baseURL
    await this.page.goto('/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })

    // Wait for page to stabilize
    await this.page.waitForLoadState('domcontentloaded')

    // Fill credentials using approach compatible with controlled inputs
    console.log('- filling credentials...')

    // Use the primary locator defined in constructor for consistency
    const emailLocator = this.emailInput
    await expect(emailLocator).toBeVisible({ timeout: 3000 })

    // For React controlled inputs, try clearing first then typing
    await emailLocator.clear()
    await this.page.waitForTimeout(100) // Brief pause after clear

    // Try different approaches for filling in case of React controlled inputs
    try {
      // Method 1: Standard fill
      await emailLocator.fill(email || '')

      // Wait for React to process the input change
      await this.page.waitForTimeout(200)

      // Check if standard fill worked after React processing
      const valueAfterFill = await emailLocator.inputValue()

      if (valueAfterFill !== email) {
        // Method 2: Clear and type sequentially (better for React)
        await emailLocator.clear()
        await emailLocator.pressSequentially(email, { delay: 50 })

        // Wait for React to process sequential input
        await this.page.waitForTimeout(200)
      }
    } catch (error) {
      throw error
    }

    // Use Playwright's built-in waiting for the value to be correct
    await expect(emailLocator).toHaveValue(email, { timeout: 3000 })
    console.log(`- email filled successfully`)

    // Fill password
    const passcode = this.page.locator('input[name="password"]')
    await expect(passcode).toBeVisible({ timeout: 3000 })

    await this.page.waitForTimeout(100) // Brief pause before password
    await passcode.fill(password || '')

    // Wait for password to be processed and verify
    await expect(this.passwordInput).toHaveValue(password, { timeout: 3000 })
    console.log(`- password filled successfully`)

    // Wait for any async effects to complete
    await this.page.waitForTimeout(100)

    // Final verification with built-in waits
    await expect(this.emailInput).toHaveValue(email, { timeout: 2000 })
    await expect(this.passwordInput).toHaveValue(password, { timeout: 2000 })

    // Wait for button to be enabled
    await expect(this.signInButton).toBeEnabled()

    // Wait for form stability
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(500)

    // Submit login form with better click handling
    console.log('- submitting login form...')

    // Ensure the button is in viewport and clickable
    await this.signInButton.scrollIntoViewIfNeeded()

    // Click the login button
    await this.signInButton.click()

    // Wait for navigation
    await this.page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 30000 })
    console.log(`- redirected to: ${this.page.url()}`)

    // Allow extra time for the authentication state to propagate
    await this.page.waitForTimeout(2000)

    // Verify authentication
    await this.verifyAuthentication()
  }

  async loginWithTestUser(): Promise<void> {
    console.log('- using pre-created test user...')

    // Use the createAdminUser helper
    const { createAdminUser } = await import('../helpers/database')
    const testUser = await createAdminUser()

    await this.login(testUser.email, 'MyReallyStr0ngPassw0rd!!!')
  }

  async expectLoginSuccess(): Promise<void> {
    console.log('🔍 Verifying login success (should redirect to admin panel)')
    await this.page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 10000 })
    console.log('✅ Successfully redirected to admin panel')
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
