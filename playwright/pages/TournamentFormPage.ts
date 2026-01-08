import type { Locator, Page } from '@playwright/test'

import { adminPath } from '../../app/utils/adminRoutes'

export class TournamentFormPage {
	readonly page: Page
	readonly form: Locator
	readonly nameInput: Locator
	readonly locationInput: Locator
	readonly startDateButton: Locator
	readonly calendar: Locator

	constructor(page: Page) {
		this.page = page
		this.form = page.locator('form')
		this.nameInput = page.getByRole('textbox', { name: /naam/i })
		this.locationInput = page.getByRole('textbox', { name: /locatie/i })
		this.startDateButton = page.getByRole('button', { name: /startdatum/i })
		this.calendar = page.getByRole('dialog', { name: 'calendar' })
	}

	async goto(): Promise<void> {
		await this.page.goto(adminPath('/tournaments/new'))
	}

	async waitForPageLoad(): Promise<void> {
		await this.page.waitForLoadState('networkidle')
		await this.page.waitForTimeout(2000) // Allow for hydration/rendering
	}
}
