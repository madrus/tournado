import { expect, type Locator, type Page } from '@playwright/test'

import { ADMIN_SLUG } from '../../app/lib/lib.constants'
import { BasePage } from './BasePage'

export class AdminPanelPage extends BasePage {
	constructor(protected override page: Page) {
		super(page)
	}

	// Locators
	get teamManagementPanel(): Locator {
		return this.page.getByRole('link', { name: 'Teams beheer' })
	}

	get tournamentManagementPanel(): Locator {
		return this.page.getByRole('link', { name: 'Toernooien beheer' })
	}

	get bodyContent(): Locator {
		return this.page.locator('body')
	}

	// Navigation methods
	async goto(): Promise<void> {
		await this.page.goto(ADMIN_SLUG, {
			waitUntil: 'networkidle',
			timeout: 30000,
		})
		await this.page.waitForTimeout(2000) // Wait for hydration/rendering
		await this.page.waitForFunction(() => document.body.children.length > 0)
	}

	async gotoAdminTeams(): Promise<void> {
		await this.page.goto(`${ADMIN_SLUG}/teams`)
	}

	async gotoAdminTeamNew(): Promise<void> {
		await this.page.goto(`${ADMIN_SLUG}/teams/new`)
	}

	async gotoTeamEdit(teamId: string): Promise<void> {
		await this.page.goto(`${ADMIN_SLUG}/teams/${teamId}`)
	}

	async gotoTournamentNew(): Promise<void> {
		await this.page.goto(`${ADMIN_SLUG}/tournaments/new`)
	}

	async clickTeamManagement(): Promise<void> {
		await this.teamManagementPanel.click()
		await this.page.waitForLoadState('networkidle')
	}

	async clickTournamentManagement(): Promise<void> {
		await this.tournamentManagementPanel.click()
		await this.page.waitForLoadState('networkidle')
	}

	// Verification methods
	async expectToBeOnAdminPanel(): Promise<void> {
		await expect(this.page).toHaveURL(ADMIN_SLUG)
	}

	async expectToBeOnAdminTeams(): Promise<void> {
		await expect(this.page).toHaveURL(`${ADMIN_SLUG}/teams`)
	}

	async expectToBeOnAdminTeamNew(): Promise<void> {
		await expect(this.page).toHaveURL(`${ADMIN_SLUG}/teams/new`)
	}

	async expectToBeOnUnauthorizedPage(): Promise<void> {
		await expect(this.page).toHaveURL('/unauthorized')
	}

	async expectTeamManagementVisible(): Promise<void> {
		await expect(this.teamManagementPanel).toBeVisible({ timeout: 15000 })
	}

	async expectTournamentManagementVisible(): Promise<void> {
		await expect(this.tournamentManagementPanel).toBeVisible({
			timeout: 15000,
		})
	}
}
