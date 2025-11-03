import { type Locator, type Page } from '@playwright/test'

export class TeamFormPage {
  readonly page: Page
  readonly form: Locator
  readonly clubNameInput: Locator
  readonly nameInput: Locator

  constructor(page: Page) {
    this.page = page
    this.form = page.locator('form')
    this.clubNameInput = page.locator('[name="clubName"]')
    this.nameInput = page.locator('[name="name"]')
  }

  async goto(): Promise<void> {
    await this.page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/new')
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(2000) // Allow for hydration/rendering
  }
}
