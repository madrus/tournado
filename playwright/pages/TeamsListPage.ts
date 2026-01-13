import type { Locator, Page } from '@playwright/test'
import { adminPath } from '../../app/utils/adminRoutes'

export class TeamsListPage {
	readonly page: Page
	readonly heading: Locator
	readonly container: Locator

	constructor(page: Page) {
		this.page = page
		this.heading = page.getByRole('heading', { name: 'Teams beheer' })
		this.container = page.getByTestId('admin-teams-layout-container')
	}

	async goto(): Promise<void> {
		await this.page.goto(adminPath('/teams'))
	}

	async waitForPageLoad(): Promise<void> {
		await this.page.waitForLoadState('networkidle')
		await this.page.waitForTimeout(2000) // Allow for hydration/rendering
	}
}
