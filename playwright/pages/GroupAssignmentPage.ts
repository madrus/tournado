import { expect, type Locator, type Page } from '@playwright/test'

import { ADMIN_SLUG } from '../../app/lib/lib.constants'
import { BasePage } from './BasePage'

/**
 * Page Object for the Group Assignment Board
 * Handles drag-and-drop team assignments and dirty state testing
 */
export class GroupAssignmentPage extends BasePage {
	constructor(protected override page: Page) {
		super(page)
	}

	// Locators for groups section
	get groupCards(): Locator {
		return this.page.locator('[data-testid^="group-card-"]')
	}

	// Get a specific group card by group ID
	groupCard(groupId: string): Locator {
		return this.page.locator(`[data-testid="group-card-${groupId}"]`)
	}

	// Get slots within a group
	groupSlots(groupId: string): Locator {
		return this.groupCard(groupId).locator('[data-testid^="group-slot-"]')
	}

	// Get a specific slot within a group
	groupSlot(groupId: string, slotIndex: number): Locator {
		return this.groupCard(groupId).locator(`[data-testid="group-slot-${slotIndex}"]`)
	}

	// Locators for confirmed pool
	get confirmedPool(): Locator {
		return this.page.locator('[data-testid="confirmed-pool"]')
	}

	get confirmedTeams(): Locator {
		return this.confirmedPool.locator('[data-testid^="team-chip-"]')
	}

	// Get a specific team chip by team ID
	teamChip(teamId: string): Locator {
		return this.page.locator(`[data-testid="team-chip-${teamId}"]`)
	}

	// Locators for waitlist pool
	get waitlistPool(): Locator {
		return this.page.locator('[data-testid="waitlist-pool"]')
	}

	get waitlistTeams(): Locator {
		return this.waitlistPool.locator('[data-testid^="team-chip-"]')
	}

	// Action buttons
	get saveButton(): Locator {
		return this.page.getByTestId('group-assignment-save')
	}

	get cancelButton(): Locator {
		return this.page.getByTestId('group-assignment-cancel')
	}

	// Dirty state indicator
	get unsavedChangesWarning(): Locator {
		return this.page.getByTestId('group-assignment-unsaved-warning')
	}

	// Navigation blocker dialog
	get navigationBlockerDialog(): Locator {
		return this.page.getByRole('alertdialog').filter({ hasText: /niet-opgeslagen/i })
	}

	get stayOnPageButton(): Locator {
		return this.navigationBlockerDialog.getByRole('button', {
			name: /op pagina blijven/i,
		})
	}

	get leaveAnywayButton(): Locator {
		return this.navigationBlockerDialog.getByRole('button', { name: /toch verlaten/i })
	}

	// Error banner
	get errorBanner(): Locator {
		return this.page.locator('[role="alert"]').filter({ hasText: /fout/i })
	}

	// Navigation
	async goto(groupStageId: string): Promise<void> {
		await this.page.goto(`${ADMIN_SLUG}/competition/groups/${groupStageId}`)
		// Wait for page to be fully loaded by checking for the save button
		await this.saveButton.waitFor({ state: 'visible', timeout: 10000 })
	}

	// Drag-and-drop action
	async dragTeamToSlot(
		teamId: string,
		groupId: string,
		slotIndex: number,
	): Promise<void> {
		const sourceTeam = this.teamChip(teamId)
		const targetSlot = this.groupSlot(groupId, slotIndex)

		// Wait for both elements to be visible
		await sourceTeam.waitFor({ state: 'visible' })
		await targetSlot.waitFor({ state: 'visible' })

		// Get bounding boxes
		const sourceBox = await sourceTeam.boundingBox()
		const targetBox = await targetSlot.boundingBox()

		if (!sourceBox || !targetBox) {
			throw new Error('Could not get bounding boxes for drag operation')
		}

		// Perform drag-and-drop using mouse actions
		await this.page.mouse.move(
			sourceBox.x + sourceBox.width / 2,
			sourceBox.y + sourceBox.height / 2,
		)
		await this.page.mouse.down()

		// Move to target
		await this.page.mouse.move(
			targetBox.x + targetBox.width / 2,
			targetBox.y + targetBox.height / 2,
			{ steps: 10 }, // Smooth movement
		)

		// Small delay to ensure hover state is registered
		await this.page.waitForTimeout(100)

		await this.page.mouse.up()

		// Wait for any animations to complete
		await this.page.waitForTimeout(300)
	}

	// Save changes
	async save(): Promise<void> {
		await expect(this.saveButton).toBeEnabled()
		await this.saveButton.click()
		// Wait for save to complete (no pending state, clean UI)
		await expect(this.saveButton).toHaveText(/opslaan\.{3}/i, { timeout: 10000 })
		await expect(this.saveButton).toBeDisabled({ timeout: 10000 })
		await expect(this.saveButton).toHaveText(/^\s*opslaan\s*$/i, {
			timeout: 10000,
		})
		await expect(this.unsavedChangesWarning).not.toBeVisible()
	}

	// Cancel changes
	async cancel(): Promise<void> {
		await this.cancelButton.click()
	}

	// Note: use link clicks for navigation blocker tests; page.goto bypasses React Router.
	async attemptNavigation(url: string): Promise<void> {
		await this.page.goto(url)
	}

	// Assertions
	async expectSaveButtonEnabled(): Promise<void> {
		await expect(this.saveButton).toBeEnabled()
	}

	async expectSaveButtonDisabled(): Promise<void> {
		await expect(this.saveButton).toBeDisabled()
	}

	async expectCancelButtonEnabled(): Promise<void> {
		await expect(this.cancelButton).toBeEnabled()
	}

	async expectCancelButtonDisabled(): Promise<void> {
		await expect(this.cancelButton).toBeDisabled()
	}

	async expectUnsavedChangesWarningVisible(): Promise<void> {
		await expect(this.unsavedChangesWarning).toBeVisible()
	}

	async expectUnsavedChangesWarningHidden(): Promise<void> {
		await expect(this.unsavedChangesWarning).not.toBeVisible()
	}

	async expectNavigationBlockerVisible(): Promise<void> {
		await expect(this.navigationBlockerDialog).toBeVisible({ timeout: 5000 })
	}

	async expectNavigationBlockerHidden(): Promise<void> {
		await expect(this.navigationBlockerDialog).not.toBeVisible()
	}

	async expectErrorBannerVisible(): Promise<void> {
		await expect(this.errorBanner).toBeVisible()
	}

	async expectErrorBannerHidden(): Promise<void> {
		await expect(this.errorBanner).not.toBeVisible()
	}

	async expectTeamInSlot(
		teamId: string,
		groupId: string,
		slotIndex: number,
	): Promise<void> {
		const slot = this.groupSlot(groupId, slotIndex)
		const teamInSlot = slot.locator(`[data-testid="team-chip-${teamId}"]`)
		await expect(teamInSlot).toBeVisible()
	}

	async expectTeamInConfirmedPool(teamId: string): Promise<void> {
		const team = this.confirmedPool.locator(`[data-testid="team-chip-${teamId}"]`)
		await expect(team).toBeVisible()
	}

	// Check dirty state is clean (save/cancel disabled, no warning)
	async expectCleanState(): Promise<void> {
		await this.expectSaveButtonDisabled()
		await this.expectCancelButtonDisabled()
		await this.expectUnsavedChangesWarningHidden()
	}

	// Check dirty state is active (save/cancel enabled, warning visible)
	async expectDirtyState(): Promise<void> {
		await this.expectSaveButtonEnabled()
		await this.expectCancelButtonEnabled()
		await this.expectUnsavedChangesWarningVisible()
	}
}
