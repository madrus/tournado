import { expect, Locator, Page } from '@playwright/test'

import { waitForTournamentInDatabase } from '../helpers/database'
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

  // Tournament selection helper - ensures database consistency before UI interaction
  async selectTournamentWithRetry(
    tournamentName: string,
    maxRetries = 3
  ): Promise<void> {
    // Step 1: Wait for tournament to exist in database (critical for CI consistency)
    console.log(`Waiting for tournament "${tournamentName}" to exist in database...`)
    // Extract just the tournament name part (before " - ") for database search
    const nameForDbSearch = tournamentName.split(' - ')[0]
    await waitForTournamentInDatabase(nameForDbSearch, 10, 500)
    console.log(
      `Tournament "${tournamentName}" confirmed in database, proceeding with UI selection...`
    )

    // Step 2: Now that we know the tournament exists in DB, try to select it in UI
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Force a navigation to refresh the root loader and get fresh tournament data
        await this.page.goto(this.page.url(), { waitUntil: 'networkidle' })
        await this.page.waitForTimeout(500) // Additional wait for React to render

        const combo = this.page.getByRole('combobox', {
          name: /toernooi.*select option|tournament.*select option/i,
        })
        await combo.click()

        const option = this.page.getByRole('option', {
          // Playwright string name matching is substring & case-insensitive by default.
          name: tournamentName,
        })
        await expect(option).toBeVisible({ timeout: 2000 })

        await option.click()
        console.log(`Tournament "${tournamentName}" successfully selected in UI`)
        return // Success!
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error(
            `Tournament "${tournamentName}" exists in database but not found in UI after ${maxRetries} attempts. This indicates a data loading issue between database and UI.`
          )
        }
        console.log(
          `UI selection attempt ${attempt} failed for tournament "${tournamentName}", retrying in 500ms...`
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
