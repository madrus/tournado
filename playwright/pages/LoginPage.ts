/* eslint-disable no-console */
import { expect, type Locator, type Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class LoginPage extends BasePage {
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

  async expectToBeOnLoginPage(): Promise<void> {
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

  async login(email: string, password: string): Promise<void> {
    console.log('- performing login...')
    console.log(`CI DEBUG: Target email to fill: "${email}"`)
    console.log(`CI DEBUG: Browser context: ${process.env.CI ? 'CI' : 'LOCAL'}`)

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

    // CI DEBUG: Check initial state
    const initialValue = await emailLocator.inputValue()
    console.log(`CI DEBUG: Initial email input value: "${initialValue}"`)

    // For React controlled inputs, try clearing first then typing
    console.log(`CI DEBUG: Clearing email field...`)
    await emailLocator.clear()

    // CI DEBUG: Verify clear worked
    const valueAfterClear = await emailLocator.inputValue()
    console.log(`CI DEBUG: Email value after clear: "${valueAfterClear}"`)

    await this.page.waitForTimeout(100) // Brief pause after clear

    // Try different approaches for filling in case of React controlled inputs
    try {
      console.log(`CI DEBUG: Attempting to fill with standard fill()...`)
      // Method 1: Standard fill
      await emailLocator.fill(email || '')

      // CI DEBUG: Immediate check after fill
      const immediateValueAfterFill = await emailLocator.inputValue()
      console.log(`CI DEBUG: IMMEDIATE value after fill: "${immediateValueAfterFill}"`)

      // CI DEBUG: Wait a bit and check again (React might update state)
      await this.page.waitForTimeout(200)
      const delayedValueAfterFill = await emailLocator.inputValue()
      console.log(
        `CI DEBUG: DELAYED value after fill (200ms): "${delayedValueAfterFill}"`
      )

      // Check if standard fill worked
      const valueAfterFill = await emailLocator.inputValue()

      if (valueAfterFill !== email) {
        console.log(`CI DEBUG: Standard fill failed, trying pressSequentially...`)

        // Method 2: Clear and type sequentially (better for React)
        await emailLocator.clear()
        console.log(`CI DEBUG: Cleared before pressSequentially`)

        await emailLocator.pressSequentially(email, { delay: 50 })
        console.log(`CI DEBUG: Completed pressSequentially`)

        // CI DEBUG: Check value after pressSequentially
        const valueAfterSequential = await emailLocator.inputValue()
        console.log(
          `CI DEBUG: Value after pressSequentially: "${valueAfterSequential}"`
        )

        // CI DEBUG: Wait and check again
        await this.page.waitForTimeout(200)
        const delayedValueAfterSequential = await emailLocator.inputValue()
        console.log(
          `CI DEBUG: DELAYED value after pressSequentially (200ms): "${delayedValueAfterSequential}"`
        )
      }
    } catch (error) {
      console.log(`CI DEBUG: Error during email fill: ${error}`)
      throw error
    }

    // CI DEBUG: Final check before verification
    const preVerificationValue = await emailLocator.inputValue()
    console.log(`CI DEBUG: Pre-verification email value: "${preVerificationValue}"`)

    // Verify email was filled correctly using the same locator we filled
    const actualEmail = await emailLocator.inputValue()

    if (actualEmail !== email) {
      // CI DEBUG: Extended debugging for failure case
      console.log(`CI DEBUG: EMAIL FILL VERIFICATION FAILED!`)
      console.log(`CI DEBUG: Expected: "${email}"`)
      console.log(`CI DEBUG: Actual: "${actualEmail}"`)

      // Check input properties
      const isDisabled = await emailLocator.isDisabled()
      const isEditable = await emailLocator.isEditable()
      const isVisible = await emailLocator.isVisible()
      const readonly = await emailLocator.getAttribute('readonly')
      const inputType = await emailLocator.getAttribute('type')
      const inputName = await emailLocator.getAttribute('name')

      console.log(
        `CI DEBUG: Input state - disabled: ${isDisabled}, editable: ${isEditable}, visible: ${isVisible}`
      )
      console.log(
        `CI DEBUG: Input attrs - readonly: ${readonly}, type: ${inputType}, name: ${inputName}`
      )

      // Try one more fill attempt with detailed logging
      console.log(`CI DEBUG: Attempting recovery fill...`)
      await emailLocator.clear()
      await this.page.waitForTimeout(100)
      await emailLocator.fill(email)
      await this.page.waitForTimeout(300)

      const recoveryValue = await emailLocator.inputValue()
      console.log(`CI DEBUG: Recovery fill result: "${recoveryValue}"`)

      throw new Error(
        `Email field truncated. Expected: "${email}", Got: "${actualEmail}"`
      )
    }
    console.log(`- email filled successfully: "${actualEmail}"`)

    const passcode = this.page.locator('input[name="password"]')
    await expect(passcode).toBeVisible({ timeout: 3000 })

    console.log(`CI DEBUG: Filling password field...`)
    await this.page.waitForTimeout(100) // Brief pause after clear
    await passcode.fill(password || '')

    // CI DEBUG: Check password fill
    const passwordValue = await passcode.inputValue()
    console.log(`CI DEBUG: Password filled, length: ${passwordValue.length}`)

    // Verify password was filled correctly
    const actualPassword = await this.passwordInput.inputValue()
    if (actualPassword !== password) {
      console.log(
        `CI DEBUG: Password verification failed - Expected length: ${password.length}, Got length: ${actualPassword.length}`
      )
      throw new Error(
        `Password field truncated. Expected: "${password}", Got: "${actualPassword}"`
      )
    }
    console.log(`- password filled successfully`)

    await this.page.waitForTimeout(100) // wait for any async effects

    // CI DEBUG: Final pre-submit verification
    console.log(`CI DEBUG: Pre-submit verification...`)
    const finalEmailCheck = await this.emailInput.inputValue()
    const finalPasswordCheck = await this.passwordInput.inputValue()
    console.log(`CI DEBUG: Final email value: "${finalEmailCheck}"`)
    console.log(`CI DEBUG: Final password length: ${finalPasswordCheck.length}`)

    // Final verification that both fields are correctly filled
    try {
      await expect(this.emailInput).toHaveValue(email)
      console.log(`CI DEBUG: Email verification passed`)
    } catch (error) {
      console.log(`CI DEBUG: EMAIL VERIFICATION FAILED at final check!`)
      const failureValue = await this.emailInput.inputValue()
      console.log(
        `CI DEBUG: Failed verification - expected: "${email}", got: "${failureValue}"`
      )
      throw error
    }

    try {
      await expect(this.passwordInput).toHaveValue(password)
      console.log(`CI DEBUG: Password verification passed`)
    } catch (error) {
      console.log(`CI DEBUG: PASSWORD VERIFICATION FAILED at final check!`)
      throw error
    }

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
