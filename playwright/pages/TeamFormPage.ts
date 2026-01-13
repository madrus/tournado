import type { Locator, Page } from '@playwright/test'
import { adminPath } from '../../app/utils/adminRoutes'

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
		await this.page.goto(adminPath('/teams/new'))
	}

	async waitForPageLoad(): Promise<void> {
		await this.page.waitForLoadState('networkidle')
		await this.page.waitForTimeout(2000) // Allow for hydration/rendering
	}
}
