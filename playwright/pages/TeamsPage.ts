import { expect, Locator, Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class TeamsPage extends BasePage {
  constructor(protected override page: Page) {
    super(page)
  }

  get addTeamButton(): Locator {
    return this.page.getByRole('link', { name: 'Toevoegen' })
  }

  get teamsContainer(): Locator {
    return this.page.locator('[data-testid="teams-layout"]')
  }

  get registrationForm(): Locator {
    return this.page.locator('form')
  }

  get clubNameField(): Locator {
    return this.page.locator('[name="clubName"]')
  }

  get teamNameField(): Locator {
    return this.page.locator('[name="name"]')
  }

  async goto(): Promise<void> {
    await this.page.goto('/teams')
  }

  async gotoNewTeam(): Promise<void> {
    await this.addTeamButton.click()
  }

  async expectToBeOnTeamsPage(): Promise<void> {
    await expect(this.page).toHaveURL('/teams')
  }

  async expectToBeOnNewTeamPage(): Promise<void> {
    await expect(this.page).toHaveURL('/teams/new')
  }
}
