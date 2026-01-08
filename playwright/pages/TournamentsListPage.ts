import type { Locator, Page } from '@playwright/test'

import { adminPath } from '../../app/utils/adminRoutes'

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
		await this.page.goto(adminPath('/tournaments'))
	}

	async waitForPageLoad(): Promise<void> {
		await this.page.waitForLoadState('networkidle')
		await this.page.waitForTimeout(2000) // Allow for hydration/rendering
	}
}
