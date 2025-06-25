import { expect, type Locator, type Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class SignupPage extends BasePage {
  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly signupButton: Locator
  readonly errorMessage: Locator

  constructor(protected override page: Page) {
    super(page)
    this.firstNameInput = page.locator('#firstName')
    this.lastNameInput = page.locator('#lastName')
    this.emailInput = page.locator('#email')
    this.passwordInput = page.locator('#password')
    this.signupButton = page.getByRole('button', { name: 'Account aanmaken' }) // Dutch text
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
    firstName: string
    lastName: string
    email: string
    password: string
  }): Promise<void> {
    // Fill firstName using clean approach (has been problematic in tests)
    await this.firstNameInput.clear()
    await this.firstNameInput.fill(userData.firstName)
    await this.firstNameInput.blur()

    // Verify firstName was filled correctly
    const actualFirstName = await this.firstNameInput.inputValue()
    if (actualFirstName !== userData.firstName) {
      throw new Error(
        `FirstName field truncated. Expected: "${userData.firstName}", Got: "${actualFirstName}"`
      )
    }

    // Fill other fields normally
    await this.lastNameInput.fill(userData.lastName)
    await this.emailInput.fill(userData.email)
    await this.passwordInput.fill(userData.password)

    // Verify all fields before submission
    await expect(this.firstNameInput).toHaveValue(userData.firstName)
    await expect(this.lastNameInput).toHaveValue(userData.lastName)
    await expect(this.emailInput).toHaveValue(userData.email)
    await expect(this.passwordInput).toHaveValue(userData.password)
  }

  async submitRegistration(): Promise<void> {
    await Promise.all([this.page.waitForURL('/auth/signin'), this.signupButton.click()])
  }

  async register(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }): Promise<void> {
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
