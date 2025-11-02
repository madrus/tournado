import { expect, type Locator, type Page } from '@playwright/test'

export class TeamsListPage {
  readonly page: Page
  readonly heading: Locator
  readonly container: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Teams beheer' })
    this.container = page.getByTestId('admin-teams-layout-container')
  }

  async goto() {
    await this.page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(2000) // Allow for hydration/rendering
  }
}
