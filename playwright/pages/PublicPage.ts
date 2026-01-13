import type { Locator, Page } from '@playwright/test'
import { adminPath } from '../../app/utils/adminRoutes'

export class PublicPage {
	constructor(readonly page: Page) {}

	async navigateToTeams(): Promise<void> {
		await this.page.goto('/teams')
	}

	async navigateToSignin(): Promise<void> {
		await this.page.goto('/auth/signin')
	}

	async navigateToSignup(): Promise<void> {
		await this.page.goto('/auth/signup')
	}

	async navigateToAdminPanel(): Promise<void> {
		await this.page.goto(adminPath())
	}

	async navigateToAdminTeams(): Promise<void> {
		await this.page.goto(adminPath('/teams'))
	}

	async getAddTeamButton(): Promise<Locator> {
		return this.page.getByRole('link', { name: 'Toevoegen' })
	}

	async getSigninButton(): Promise<Locator> {
		return this.page.getByRole('button', { name: 'Inloggen' })
	}

	async getSignupButton(): Promise<Locator> {
		return this.page.getByRole('button', { name: 'Registreren' })
	}

	async waitForHydration(): Promise<void> {
		await this.page.waitForLoadState('networkidle')
		await this.page.waitForFunction(
			() => document.documentElement.getAttribute('data-hydrated') === 'true',
		)
	}
}
