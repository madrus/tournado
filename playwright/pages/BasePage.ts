import { expect, Locator, Page } from '@playwright/test'

export class BasePage {
  constructor(protected page: Page) {}

  // Navigation locators
  protected get bottomNavigation(): Locator {
    return this.page.locator('[data-testid="bottom-navigation"]')
  }

  protected get teamsNavButton(): Locator {
    return this.bottomNavigation.locator('[data-testid="nav-teams"]')
  }

  protected get homeNavButton(): Locator {
    return this.bottomNavigation.locator('[data-testid="nav-home"]')
  }

  protected get moreNavButton(): Locator {
    return this.bottomNavigation.locator('[data-testid="nav-more"]')
  }

  // User menu locators
  protected get userMenuButton(): Locator {
    return this.page.getByRole('button', { name: /menu openen\/sluiten/i })
  }

  protected get userMenuDropdown(): Locator {
    return this.page.getByTestId('user-menu-dropdown')
  }

  protected get signOutButton(): Locator {
    return this.page.getByRole('button', { name: 'Uitloggen' })
  }

  protected get loginLink(): Locator {
    return this.page.getByRole('link', { name: 'Inloggen' })
  }

  // User menu interaction methods
  async openUserMenu(): Promise<void> {
    await this.userMenuButton.waitFor({ state: 'visible' })
    await this.userMenuButton.click()
    await expect(this.userMenuDropdown).toBeVisible({ timeout: 5000 })
  }

  async clickSignOut(): Promise<void> {
    await this.signOutButton.click()
  }

  // User menu assertion methods
  async expectUserMenuVisible(): Promise<void> {
    await expect(this.userMenuDropdown).toBeVisible({ timeout: 5000 })
  }

  async expectLoginLinkVisible(): Promise<void> {
    await expect(this.loginLink).toBeVisible()
  }

  async expectToBeOnHomePage(): Promise<void> {
    await expect(this.page).toHaveURL('/', { timeout: 5000 })
  }
}
