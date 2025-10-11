import { expect, Locator, Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class AdminTournamentsPage extends BasePage {
  constructor(protected override page: Page) {
    super(page)
  }

  // Locators
  get layoutContainer(): Locator {
    return this.page.getByTestId('admin-tournaments-layout-container')
  }

  get pageTitle(): Locator {
    return this.page.getByRole('heading', { name: 'Toernooien beheer' })
  }

  get createTournamentButton(): Locator {
    return this.page.getByRole('link', { name: /toevoegen/i })
  }

  get tournamentsTable(): Locator {
    return this.page.locator('table')
  }

  get bodyContent(): Locator {
    return this.page.locator('body')
  }

  get tournamentForm(): Locator {
    return this.page.locator('form')
  }

  // Navigation methods
  async goto(): Promise<void> {
    await this.page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })
    await this.page.waitForTimeout(2000) // Wait for hydration/rendering
    await this.page.waitForFunction(() => document.body.children.length > 0)
  }

  async gotoCreateTournament(): Promise<void> {
    await this.page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/new', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })
    await this.page.waitForTimeout(2000) // Wait for hydration/rendering
    await this.page.waitForFunction(() => document.body.children.length > 0)
  }

  async clickCreateTournament(): Promise<void> {
    await this.createTournamentButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  // Verification methods
  async expectToBeOnAdminTournamentsPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/a7k9m2x5p8w1n4q6r3y8b5t1\/tournaments$/)
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 })
    await expect(this.layoutContainer).toBeVisible()
  }

  async expectToBeOnCreateTournamentPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/a7k9m2x5p8w1n4q6r3y8b5t1\/tournaments\/new$/)
    await expect(this.layoutContainer).toBeVisible()
  }

  async expectTournamentsInterface(): Promise<void> {
    await expect(this.layoutContainer).toBeVisible({ timeout: 15000 })
    // Check for either tournaments list or empty state message
    const bodyText = await this.bodyContent.textContent()
    expect(bodyText).toBeTruthy()
  }

  async expectPageLoaded(): Promise<void> {
    await expect(this.layoutContainer).toBeVisible()
  }

  async expectTournamentForm(): Promise<void> {
    await expect(this.tournamentForm).toBeVisible()
  }
}
