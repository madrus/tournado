import { expect, Locator, Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class AdminTeamsPage extends BasePage {
  constructor(protected override page: Page) {
    super(page)
  }

  // Locators
  get layoutContainer(): Locator {
    return this.page.getByTestId('admin-teams-page-content')
  }

  get createTeamContainer(): Locator {
    return this.page.getByTestId('admin-new-team-container')
  }

  get pageTitle(): Locator {
    return this.page.getByRole('heading', { name: 'Alle teams' })
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

  // Tournament selection helper - handles database consistency timing
  async selectTournamentWithRetry(
    tournamentName: string,
    maxRetries = 3
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.page.reload() // Trigger fresh data fetch from root loader
        await this.page.waitForLoadState('networkidle')

        const combo = this.page.getByRole('combobox', {
          name: /toernooi.*select option|tournament.*select option/i,
        })
        await combo.click()

        const option = this.page.getByRole('option', {
          name: new RegExp(tournamentName, 'i'),
        })
        await expect(option).toBeVisible({ timeout: 2000 })

        await option.click()
        return // Success!
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error(
            `Tournament "${tournamentName}" not found after ${maxRetries} attempts. This may indicate a database consistency issue.`
          )
        }
        console.log(
          `Attempt ${attempt} failed to find tournament, retrying in 500ms...`
        )
        await this.page.waitForTimeout(500)
      }
    }
  }

  // Verification methods
  async expectToBeOnAdminTeamsPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/a7k9m2x5p8w1n4q6r3y8b5t1\/teams$/)
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 })
    await expect(this.layoutContainer).toBeVisible()
  }

  async expectToBeOnCreateTeamPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/a7k9m2x5p8w1n4q6r3y8b5t1\/teams\/new$/)
    await expect(this.createTeamContainer).toBeVisible()
  }

  async expectAdminTeamsInterface(): Promise<void> {
    await expect(this.layoutContainer).toBeVisible({ timeout: 15000 })
    await expect(this.bodyContent).toContainText(/team/i)
  }

  async expectPageLoaded(): Promise<void> {
    await expect(this.layoutContainer).toBeVisible()
  }
}
