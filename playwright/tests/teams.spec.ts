import { expect, test } from '@playwright/test'

import { createTestTournament, waitForTournamentInDatabase } from '../helpers/database'

// Public Teams Tests - NO AUTHENTICATION REQUIRED
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Public Teams', () => {
  test.beforeEach(async ({ page }) => {
    const { cleanDatabase } = await import('../helpers/database')
    await cleanDatabase()

    await page.setViewportSize({ width: 375, height: 812 })
  })

  test('should display teams page publicly', async ({ page }) => {
    // Navigate to teams page (public access)
    await page.goto('/teams')

    // Should be able to view teams page without authentication
    await expect(page).toHaveURL('/teams')

    // Should see the "Toevoegen" button (new simplified text)
    await expect(page.getByRole('link', { name: 'Toevoegen' })).toBeVisible()
  })

  test('should display existing teams publicly', async ({ page }) => {
    await page.goto('/teams')

    // Should show teams list or empty state message
    // This is public viewing of teams
    const teamsContainer = page.locator('[data-testid="teams-layout"]')
    await expect(teamsContainer).toBeVisible()
  })

  test('should allow public team registration', async ({ page }) => {
    await page.goto('/teams')

    // Click "Toevoegen" button (public team registration)
    await page.getByRole('link', { name: 'Toevoegen' }).click()

    // Should navigate to new team page
    await expect(page).toHaveURL('/teams/new')

    // Should see team registration form (public access)
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('[name="clubName"]')).toBeVisible()
    await expect(page.locator('[name="name"]')).toBeVisible()
  })

  test('should create team with tournament selection in public area', async ({
    page,
  }) => {
    let tournamentId: string | undefined
    let teamId: string | undefined

    try {
      const tournament = await createTestTournament('PubTourney', 'Utrecht')
      tournamentId = tournament.id

      // Navigate to public team creation form
      await page.goto('/teams/new')
      await page.waitForLoadState('networkidle')

      // Verify we're on the public team creation form
      await expect(page).toHaveURL('/teams/new')
      await expect(page.locator('form')).toBeVisible()

      // Step 1: Select Tournament with retry logic for database-UI sync
      await waitForTournamentInDatabase(tournament.name, 20, 1000)

      let tournamentSelected = false
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          await page.reload({ waitUntil: 'networkidle' })
          await page.waitForTimeout(1000)

          const tournamentCombo = page.getByRole('combobox', {
            name: /toernooi.*select option|tournament.*select option/i,
          })
          await expect(tournamentCombo).toBeVisible()
          await tournamentCombo.click()

          const tournamentOption = page.getByRole('option', {
            name: `${tournament.name} - ${tournament.location}`,
          })
          await expect(tournamentOption).toBeVisible({ timeout: 5000 })
          await tournamentOption.click()

          await expect(tournamentCombo).toContainText(
            `${tournament.name} - ${tournament.location}`
          )

          tournamentSelected = true
          break
        } catch (error) {
          if (attempt === 5) {
            throw error
          }
          await page.waitForTimeout(1000)
        }
      }

      // Step 2: Select Division (after tournament selection populates options)
      const divisionCombo = page.getByRole('combobox', {
        name: /teamklasse.*select option|division.*select option/i,
      })
      await expect(divisionCombo).toBeVisible()
      await divisionCombo.click()

      const firstDivision = page.getByRole('option', { name: /eerste klasse/i })
      await expect(firstDivision).toBeVisible({ timeout: 3000 })
      await firstDivision.click()

      // Step 3: Select Category
      const categoryCombo = page.getByRole('combobox', {
        name: /categorie.*select option|category.*select option/i,
      })
      await expect(categoryCombo).toBeVisible()
      await categoryCombo.click()

      const firstCategory = page.getByRole('option', { name: /JO8/i })
      await expect(firstCategory).toBeVisible({ timeout: 3000 })
      await firstCategory.click()

      // Step 4: Fill Team Information
      const clubNameInput = page.getByRole('textbox', { name: /clubnaam|club.*name/i })
      const teamNameInput = page.getByRole('textbox', { name: /teamnaam|team.*name/i })

      await expect(clubNameInput).toBeEnabled()
      await expect(teamNameInput).toBeEnabled()

      await clubNameInput.fill('TC Public')
      await teamNameInput.fill('J08-1')

      // Step 5: Fill Team Leader Information
      const leaderNameInput = page.getByRole('textbox', {
        name: /naam teamleider|team.*leader.*name/i,
      })
      const leaderEmailInput = page.getByRole('textbox', {
        name: /e-mail teamleider|team.*leader.*email/i,
      })
      const leaderPhoneInput = page.getByRole('textbox', {
        name: /telefoon teamleider|team.*leader.*phone/i,
      })

      await leaderNameInput.fill('Test Leader')
      await leaderEmailInput.fill('test@example.com')
      await leaderPhoneInput.fill('0123456789')

      // Step 6: Accept Privacy Agreement
      const privacyCheckbox = page.getByRole('checkbox', {
        name: /privacy|privacybeleid/i,
      })
      await expect(privacyCheckbox).toBeVisible()
      await privacyCheckbox.check()

      // Step 7: Submit Form
      const submitButton = page.getByRole('button', { name: /^(Opslaan|Save)$/i })
      await expect(submitButton).toBeVisible()
      await expect(submitButton).toBeEnabled()
      await Promise.all([
        // Wait for redirect to the team detail page
        page.waitForURL(/\/teams\/[^\/]+$/, { timeout: 15000 }),
        submitButton.click(),
      ])

      // Step 8: Verify Success
      await expect(page).toHaveURL(/\/teams\/[^\/]+$/, { timeout: 10000 })

      // Extract team ID from URL for cleanup
      const url = page.url()
      const match = url.match(/\/teams\/([^\/]+)$/)
      if (match) {
        teamId = match[1]
      }

      await expect(page.locator('body')).toContainText(/J08-1|TC Public/i, {
        timeout: 5000,
      })
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
      if (tournamentId) {
        const { deleteTournamentById } = await import('../helpers/database')
        try {
          await deleteTournamentById(tournamentId)
        } catch (error) {
          console.error('Failed to cleanup tournament:', error)
        }
      }
    }
  })
})
