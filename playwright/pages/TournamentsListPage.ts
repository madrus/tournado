import type { Locator, Page } from '@playwright/test'

export class TournamentsListPage {
	readonly page: Page
	readonly heading: Locator
	readonly addButton: Locator
	readonly container: Locator

	constructor(page: Page) {
		this.page = page
		this.heading = page.getByRole('heading', { name: 'Toernooien beheer' })
		this.addButton = page.getByRole('link', { name: /toevoegen/i })
		this.container = page.getByTestId('admin-tournaments-layout-container')
	}

	async goto(): Promise<void> {
		await this.page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')
	}

	async waitForPageLoad(): Promise<void> {
		await this.page.waitForLoadState('networkidle')
		await this.page.waitForTimeout(2000) // Allow for hydration/rendering
	}
}
