import { expect, test } from '@playwright/test'

import { clearCapturedEmails, waitForEmailsCount } from '../helpers/test-emails'

// Public Team Creation Test - NO AUTHENTICATION REQUIRED
// Isolated to prevent database concurrency issues
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Public Teams - Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await clearCapturedEmails()
  })

  test.afterEach(async () => {
    await clearCapturedEmails()
  })

  test('should create team with tournament selection in public area', async ({
    page,
  }) => {
    let tournamentId: string | undefined
    let teamId: string | undefined

    try {
      // Use unique names to prevent conflicts during concurrent test execution
      const uniqueId = Math.random().toString(36).substring(2, 8)

      // Use well-known seeded tournament instead of creating one
      const tournament = {
        name: 'Spring Cup',
        location: 'Amsterdam',
      }

      // Wait a moment for database to be ready
      await page.waitForTimeout(500)

      // Navigate to public team creation form
      await page.goto('/teams/new')
      await page.waitForLoadState('networkidle')

      // Wait for any client-side stores to hydrate properly and form to be ready
      await page.waitForTimeout(3000)

      // Verify we're on the public team creation form
      await expect(page).toHaveURL('/teams/new')
      await expect(page.locator('form')).toBeVisible()

      // === PANEL 1: Tournament Selection (tournamentId, division, category) ===

      // Step 1a: Select Tournament
      const tournamentField = page.locator('[data-testid="tournamentId-combo-field"]')
      await expect(tournamentField).toBeVisible({ timeout: 10000 })

      const tournamentCombo = tournamentField.locator('button[role="combobox"]')
      await expect(tournamentCombo).toBeVisible({ timeout: 5000 })
      await expect(tournamentCombo).toBeEnabled()

      await tournamentCombo.click()
      await page.waitForTimeout(1500)

      const tournamentOption = page
        .locator('[data-radix-select-content]')
        .locator('text="Spring Cup - Amsterdam"')
        .first()
      await expect(tournamentOption).toBeVisible({ timeout: 10000 })
      await tournamentOption.click()

      await expect(tournamentCombo).toContainText(
        `${tournament.name} - ${tournament.location}`
      )

      // Step 1b: Select Division (should now be enabled)
      const divisionField = page.locator('[data-testid="division-combo-field"]')
      const divisionCombo = divisionField.locator('button[role="combobox"]')

      await expect(divisionCombo).toBeEnabled({ timeout: 5000 })
      await divisionCombo.click()

      const firstDivision = page.getByRole('option', { name: /eerste klasse/i })
      await expect(firstDivision).toBeVisible({ timeout: 3000 })
      await firstDivision.click()

      // Step 1c: Select Category (should now be enabled)
      const categoryField = page.locator('[data-testid="category-combo-field"]')
      const categoryCombo = categoryField.locator('button[role="combobox"]')

      await expect(categoryCombo).toBeEnabled({ timeout: 5000 })
      await categoryCombo.click()

      const firstCategory = page.getByRole('option', { name: /JO8/i })
      await expect(firstCategory).toBeVisible({ timeout: 3000 })
      await firstCategory.click()

      // Wait for Panel 1 to be completed and Panel 2 to become enabled
      await page.waitForTimeout(2000)

      // === PANEL 2: Team Information (clubName, name) ===

      // Scroll to ensure the next section is visible
      await page.locator('form').scrollIntoViewIfNeeded()

      // Find Panel 2 fields using different selectors since role-based might not work
      const clubNameInput = page.locator('[name="clubName"]')
      const teamNameInput = page.locator('[name="name"]')

      // Wait for Panel 2 fields to become enabled (they should be enabled now that Panel 1 is complete)
      await expect(clubNameInput).toBeEnabled({ timeout: 10000 })
      await expect(teamNameInput).toBeEnabled({ timeout: 5000 })

      await clubNameInput.scrollIntoViewIfNeeded()
      await clubNameInput.fill(`TC Public ${uniqueId}`)
      await teamNameInput.fill(`J08-1-${uniqueId}`)

      // Wait for Panel 2 to be completed and Panel 3 to become enabled
      await page.waitForTimeout(1000)

      // === PANEL 3: Team Leader Information (teamLeaderName, teamLeaderPhone, teamLeaderEmail) ===

      const leaderNameInput = page.locator('[name="teamLeaderName"]')
      const leaderEmailInput = page.locator('[name="teamLeaderEmail"]')
      const leaderPhoneInput = page.locator('[name="teamLeaderPhone"]')

      // Wait for Panel 3 fields to become enabled
      await expect(leaderNameInput).toBeEnabled({ timeout: 10000 })
      await expect(leaderEmailInput).toBeEnabled({ timeout: 5000 })
      await expect(leaderPhoneInput).toBeEnabled({ timeout: 5000 })

      await leaderNameInput.scrollIntoViewIfNeeded()
      await leaderNameInput.fill('Test Leader')
      const leaderEmail = `test-${uniqueId}@example.com`
      await leaderEmailInput.fill(leaderEmail)
      await leaderPhoneInput.fill('0123456789')

      // === PANEL 4: Privacy Agreement (privacyAgreement) ===

      const privacyCheckbox = page.locator('[name="privacyAgreement"]')
      await expect(privacyCheckbox).toBeVisible()
      await privacyCheckbox.scrollIntoViewIfNeeded()
      await privacyCheckbox.check()

      // === FORM SUBMISSION ===

      const submitButton = page.getByRole('button', { name: 'Opslaan' })
      await expect(submitButton).toBeVisible()
      await expect(submitButton).toBeEnabled()

      await Promise.all([
        page.waitForURL(/\/teams\/[^\/]+$/, { timeout: 15000 }),
        submitButton.click(),
      ])

      // === VERIFICATION ===

      await expect(page).toHaveURL(/\/teams\/[^\/]+$/, { timeout: 10000 })

      // Extract team ID from URL for cleanup
      const url = page.url()
      const match = url.match(/\/teams\/([^\/]+)$/)
      if (match) {
        teamId = match[1]
      }

      await expect(page.locator('body')).toContainText(
        new RegExp(`J08-1-${uniqueId}|TC Public ${uniqueId}`, 'i'),
        {
          timeout: 5000,
        }
      )

      // Add some time for server-side email processing
      await page.waitForTimeout(2000)
    } finally {
      // Clean up test data
      if (teamId) {
        const { deleteTeamById } = await import('../helpers/database')
        try {
          await deleteTeamById(teamId)
        } catch (error) {
          console.error('Failed to cleanup team:', error)
        }
      }
      // No tournament cleanup needed since we use seeded data
    }
  })
})
