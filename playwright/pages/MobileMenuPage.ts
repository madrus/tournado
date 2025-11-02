import { expect, Page } from '@playwright/test'

export class MobileMenuPage {
  constructor(private page: Page) {}

  get toggleButton() {
    return this.page.getByRole('button', { name: /menu openen\/sluiten/i })
  }

  get menuDropdown() {
    return this.page.locator('[data-testid="user-menu-dropdown"]')
  }

  async openMenu() {
    await this.toggleButton.waitFor({ state: 'visible' })
    await this.toggleButton.click()
    await this.menuDropdown.waitFor({ state: 'visible' })
  }

  async expectMenuClosed() {
    await expect(this.menuDropdown).not.toBeVisible()
  }

  async expectMenuOpen() {
    await expect(this.menuDropdown).toBeVisible()
  }
}
