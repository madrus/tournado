import { expect, Locator, Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class ProfilePage extends BasePage {
  constructor(protected override page: Page) {
    super(page)
  }

  // Locators
  get accountSettingsHeading(): Locator {
    return this.page.getByText('Account Settings')
  }

  get tournamentAccessHeading(): Locator {
    return this.page.getByText('Tournament Access')
  }

  get profileLink(): Locator {
    return this.page.getByRole('link', { name: /profiel/i })
  }

  get userMenuDropdown(): Locator {
    return this.page.getByTestId('user-menu-dropdown')
  }

  // Navigation methods
  async goto(): Promise<void> {
    await this.page.goto('/profile', {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })
  }

  async navigateViaMenu(): Promise<void> {
    await this.userMenuButton.click()
    await expect(this.userMenuDropdown).toBeVisible({ timeout: 5000 })
    await this.profileLink.click()
  }

  // Verification methods
  async expectToBeOnProfilePage(): Promise<void> {
    await expect(this.page).toHaveURL('/profile')
    await expect(this.accountSettingsHeading).toBeVisible()
  }

  async expectProfileContentVisible(): Promise<void> {
    await expect(this.accountSettingsHeading).toBeVisible()
    await expect(this.tournamentAccessHeading).toBeVisible()
  }

  async expectToBeRedirectedToSignin(): Promise<void> {
    await expect(this.page).toHaveURL(/\/auth\/signin/)
    await expect(this.page).toHaveURL(/redirectTo=%2Fprofile/)
  }

  async expectToBeRedirectedToUnauthorized(): Promise<void> {
    await expect(this.page).toHaveURL('/unauthorized')
  }
}
