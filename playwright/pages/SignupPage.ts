import { expect, type Locator, type Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class SignupPage extends BasePage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly confirmPasswordInput: Locator
  readonly signupButton: Locator
  readonly errorMessage: Locator

  constructor(protected override page: Page) {
    super(page)
    this.emailInput = page.locator('#email')
    this.passwordInput = page.locator('#password')
    this.confirmPasswordInput = page.locator('#confirmPassword')
    this.signupButton = page.getByRole('button', { name: 'Registreren' }) // Dutch text for "Sign up"
    this.errorMessage = page.locator(
      '[data-testid="form-error"], .error, [role="alert"]'
    )
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/signup')
    await this.page.waitForLoadState('networkidle')
  }

  async expectToBeOnSignupPage(): Promise<void> {
    await this.page.waitForURL(/.*\/auth\/signup.*/, { timeout: 10000 })
    await expect(this.signupButton).toBeVisible()
  }

  async fillRegistrationForm(userData: {
    email: string
    password: string
  }): Promise<void> {
    // Fill email and password fields
    await this.emailInput.fill(userData.email)
    await this.passwordInput.fill(userData.password)
    await this.confirmPasswordInput.fill(userData.password)

    // Verify all fields before submission
    await expect(this.emailInput).toHaveValue(userData.email)
    await expect(this.passwordInput).toHaveValue(userData.password)
    await expect(this.confirmPasswordInput).toHaveValue(userData.password)
  }

  async submitRegistration(): Promise<void> {
    // Debug: Check what button is actually visible
    const buttonText = await this.signupButton.textContent()
    console.log('Found button with text:', buttonText)

    // Check if the button is visible and enabled
    await expect(this.signupButton).toBeVisible()
    await expect(this.signupButton).toBeEnabled()

    // Check for any error messages before submitting
    const errorElements = await this.page
      .locator('.text-destructive, [role="alert"], .error')
      .count()
    if (errorElements > 0) {
      const errorText = await this.page
        .locator('.text-destructive, [role="alert"], .error')
        .first()
        .textContent()
      console.log('Found error message before submit:', errorText)
    }

    // Test if MSW is working by making a test request
    console.log('Testing MSW...')
    await this.page.evaluate(() => {
      fetch('/msw-test')
        .then(response => {
          console.log('MSW test response:', response.status)
          if (response.ok) {
            console.log('MSW is working!')
          } else {
            console.log('MSW test failed')
          }
        })
        .catch(error => {
          console.log('MSW test error:', error)
        })
    })

    // Firebase signup might redirect differently, so let's wait for any navigation
    await this.signupButton.click()
    console.log('Button clicked, waiting for navigation...')

    // Wait a moment and check for error messages after clicking
    await this.page.waitForTimeout(1000)
    const postClickErrors = await this.page
      .locator('.text-destructive, [role="alert"], .error')
      .count()
    if (postClickErrors > 0) {
      const errorText = await this.page
        .locator('.text-destructive, [role="alert"], .error')
        .first()
        .textContent()
      console.log('Found error message after submit:', errorText)
    } else {
      console.log('No error messages found after submit')
    }

    // Wait for any navigation after clicking submit
    await this.page.waitForLoadState('networkidle')
    console.log('Navigation complete, current URL:', this.page.url())
  }

  async register(userData: { email: string; password: string }): Promise<void> {
    await this.goto()
    await this.expectToBeOnSignupPage()
    await this.fillRegistrationForm(userData)
    await this.submitRegistration()
  }

  async expectRegistrationSuccess(): Promise<void> {
    await this.page.waitForURL('/auth/signin', { timeout: 10000 })
  }

  async expectRegistrationError(expectedError?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible()

    if (expectedError) {
      await expect(this.errorMessage).toContainText(expectedError)
    }
  }
}
