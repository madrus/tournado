import { expect, type Locator, type Page } from '@playwright/test'

export class MobileMenuPage {
  constructor(private page: Page) {}

  get toggleButton(): Locator {
    return this.page.getByRole('button', { name: /menu openen\/sluiten/i })
  }

  get menuDropdown(): Locator {
    return this.page.locator('[data-testid="user-menu-dropdown"]')
  }

  async openMenu(): Promise<void> {
    await this.toggleButton.waitFor({ state: 'visible' })
    await this.toggleButton.click()
    await this.menuDropdown.waitFor({ state: 'visible' })
  }

  async expectMenuClosed(): Promise<void> {
    await expect(this.menuDropdown).not.toBeVisible()
  }

  async expectMenuOpen(): Promise<void> {
    await expect(this.menuDropdown).toBeVisible()
  }
}
