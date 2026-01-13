import { type Locator, type Page, expect } from '@playwright/test'

export class HomePage {
	readonly page: Page
	readonly viewTeamsButton: Locator
	readonly actionLinks: Locator

	constructor(page: Page) {
		this.page = page
		this.viewTeamsButton = page.getByTestId('view-teams-button')
		this.actionLinks = page.locator('a[href*="/teams"], a[href*="/about"]')
	}

	get viewTeamsLink(): Locator {
		return this.viewTeamsButton
	}

	async goto(): Promise<void> {
		await this.page.goto('/')
	}

	async waitForPageLoad(): Promise<void> {
		await this.page.waitForLoadState('networkidle')
		await this.page.waitForTimeout(2000) // Allow for hydration/rendering
	}

	async clickViewTeamsButton(): Promise<void> {
		await this.viewTeamsLink.click()
		await expect(this.page).toHaveURL('/teams')
	}
}
