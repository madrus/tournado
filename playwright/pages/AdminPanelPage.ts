import { expect, type Locator, type Page } from '@playwright/test'

import { adminPath } from '../../app/utils/adminRoutes'
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
		await this.page.goto(adminPath(), {
			waitUntil: 'networkidle',
			timeout: 30000,
		})
		await expect(this.teamManagementPanel).toBeVisible({ timeout: 10000 })
	}

	async gotoAdminTeams(): Promise<void> {
		await this.page.goto(adminPath('/teams'))
	}

	async gotoAdminTeamNew(): Promise<void> {
		await this.page.goto(adminPath('/teams/new'))
	}

	async gotoTeamEdit(teamId: string): Promise<void> {
		await this.page.goto(adminPath(`/teams/${teamId}`))
	}

	async gotoTournamentNew(): Promise<void> {
		await this.page.goto(adminPath('/tournaments/new'))
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
		await expect(this.page).toHaveURL(adminPath())
	}

	async expectToBeOnAdminTeams(): Promise<void> {
		await expect(this.page).toHaveURL(adminPath('/teams'))
	}

	async expectToBeOnAdminTeamNew(): Promise<void> {
		await expect(this.page).toHaveURL(adminPath('/teams/new'))
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
