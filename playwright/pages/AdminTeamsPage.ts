import { expect, Locator, Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class AdminTeamsPage extends BasePage {
  constructor(protected override page: Page) {
    super(page)
  }

  // Locators
  get layoutContainer(): Locator {
    return this.page.getByTestId('admin-teams-layout-container')
  }

  get pageTitle(): Locator {
    return this.page.getByRole('heading', { name: 'Teams beheer' })
  }

  get createTeamButton(): Locator {
    return this.page.getByRole('link', { name: /toevoegen|add/i })
  }

  get teamsTable(): Locator {
    return this.page.locator('table')
  }

  get bodyContent(): Locator {
    return this.page.locator('body')
  }

  // Navigation methods
  async goto(): Promise<void> {
    await this.page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })
    await this.page.waitForTimeout(2000) // Wait for hydration/rendering
    await this.page.waitForFunction(() => document.body.children.length > 0)
  }

  async gotoCreateTeam(): Promise<void> {
    await this.page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/new', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })
    await this.page.waitForTimeout(2000) // Wait for hydration/rendering
    await this.page.waitForFunction(() => document.body.children.length > 0)
  }

  async clickCreateTeam(): Promise<void> {
    await this.createTeamButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  // Verification methods
  async expectToBeOnAdminTeamsPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/a7k9m2x5p8w1n4q6r3y8b5t1\/teams$/)
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 })
    await expect(this.layoutContainer).toBeVisible()
  }

  async expectToBeOnCreateTeamPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/a7k9m2x5p8w1n4q6r3y8b5t1\/teams\/new$/)
    await expect(this.layoutContainer).toBeVisible()
  }

  async expectAdminTeamsInterface(): Promise<void> {
    await expect(this.layoutContainer).toBeVisible({ timeout: 15000 })
    await expect(this.bodyContent).toContainText(/team/i)
  }

  async expectPageLoaded(): Promise<void> {
    await expect(this.layoutContainer).toBeVisible()
  }
}
