import { expect, Locator, Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class AdminPanelPage extends BasePage {
  constructor(protected override page: Page) {
    super(page)
  }

  // Locators
  get teamManagementPanel(): Locator {
    return this.page.getByRole('link', { name: 'Teams beheer' })
  }

  get tournamentManagementPanel(): Locator {
    return this.page.getByRole('link', { name: 'Toernooien beheer' })
  }

  get bodyContent(): Locator {
    return this.page.locator('body')
  }

  // Navigation methods
  async goto(): Promise<void> {
    await this.page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })
    await this.page.waitForTimeout(2000) // Wait for hydration/rendering
    await this.page.waitForFunction(() => document.body.children.length > 0)
  }

  async clickTeamManagement(): Promise<void> {
    await this.teamManagementPanel.click()
    await this.page.waitForLoadState('networkidle')
  }

  async clickTournamentManagement(): Promise<void> {
    await this.tournamentManagementPanel.click()
    await this.page.waitForLoadState('networkidle')
  }

  // Verification methods
  async expectToBeOnAdminPanel(): Promise<void> {
    await expect(this.page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
  }

  async expectTeamManagementVisible(): Promise<void> {
    await expect(this.teamManagementPanel).toBeVisible({ timeout: 15000 })
  }

  async expectTournamentManagementVisible(): Promise<void> {
    await expect(this.tournamentManagementPanel).toBeVisible({ timeout: 15000 })
  }
}
