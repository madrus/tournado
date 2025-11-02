import { Page } from '@playwright/test'

export class PublicPage {
  constructor(readonly page: Page) {}

  async navigateToTeams(): Promise<void> {
    await this.page.goto('/teams')
  }

  async navigateToSignin(): Promise<void> {
    await this.page.goto('/auth/signin')
  }

  async navigateToAdminPanel(): Promise<void> {
    await this.page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')
  }

  async getAddTeamButton() {
    return this.page.getByRole('link', { name: 'Toevoegen' })
  }

  async getSigninButton() {
    return this.page.getByRole('button', { name: 'Inloggen' })
  }
}
