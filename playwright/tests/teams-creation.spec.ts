import { expect, test } from '@playwright/test'

import { createTestTournament, waitForTournamentInDatabase } from '../helpers/database'

// Public Team Creation Test - NO AUTHENTICATION REQUIRED
// Isolated to prevent database concurrency issues
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Public Teams - Creation', () => {
  test.beforeEach(async ({ page }) => {
    const { cleanDatabase } = await import('../helpers/database')
    await cleanDatabase()

    await page.setViewportSize({ width: 375, height: 812 })
  })

  test('should create team with tournament selection in public area', async ({
    page,
  }) => {
    let tournamentId: string | undefined
    let teamId: string | undefined

    try {
      // Use unique names to prevent conflicts during concurrent test execution
      const uniqueId = Math.random().toString(36).substring(2, 8)
      const tournament = await createTestTournament(`PubTourney-${uniqueId}`, 'Utrecht')
      tournamentId = tournament.id

      // Navigate to public team creation form
      await page.goto('/teams/new')
      await page.waitForLoadState('networkidle')

      // Verify we're on the public team creation form
      await expect(page).toHaveURL('/teams/new')
      await expect(page.locator('form')).toBeVisible()

      // Step 1: Select Tournament (tournament already verified to exist)

      let tournamentSelected = false
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          await page.reload({ waitUntil: 'networkidle' })
          await page.waitForTimeout(1000)

          const tournamentCombo = page.getByRole('combobox', {
            name: /toernooi.*select option/i,
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
        name: /teamklasse.*select option/i,
      })
      await expect(divisionCombo).toBeVisible()
      await divisionCombo.click()

      const firstDivision = page.getByRole('option', { name: /eerste klasse/i })
      await expect(firstDivision).toBeVisible({ timeout: 3000 })
      await firstDivision.click()

      // Step 3: Select Category
      const categoryCombo = page.getByRole('combobox', {
        name: /categorie.*select option/i,
      })
      await expect(categoryCombo).toBeVisible()
      await categoryCombo.click()

      const firstCategory = page.getByRole('option', { name: /JO8/i })
      await expect(firstCategory).toBeVisible({ timeout: 3000 })
      await firstCategory.click()

      // Step 4: Fill Team Information
      const clubNameInput = page.getByRole('textbox', { name: /clubnaam/i })
      const teamNameInput = page.getByRole('textbox', { name: /teamnaam/i })

      await expect(clubNameInput).toBeEnabled()
      await expect(teamNameInput).toBeEnabled()

      await clubNameInput.fill(`TC Public ${uniqueId}`)
      await teamNameInput.fill(`J08-1-${uniqueId}`)

      // Step 5: Fill Team Leader Information
      const leaderNameInput = page.getByRole('textbox', {
        name: /naam teamleider/i,
      })
      const leaderEmailInput = page.getByRole('textbox', {
        name: /e-mail teamleider/i,
      })
      const leaderPhoneInput = page.getByRole('textbox', {
        name: /telefoon teamleider/i,
      })

      await leaderNameInput.fill('Test Leader')
      await leaderEmailInput.fill(`test-${uniqueId}@example.com`)
      await leaderPhoneInput.fill('0123456789')

      // Step 6: Accept Privacy Agreement
      const privacyCheckbox = page.getByRole('checkbox', {
        name: /privacybeleid/i,
      })
      await expect(privacyCheckbox).toBeVisible()
      await privacyCheckbox.check()

      // Step 7: Submit Form
      const submitButton = page.getByRole('button', { name: 'Opslaan' })
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

      await expect(page.locator('body')).toContainText(
        new RegExp(`J08-1-${uniqueId}|TC Public ${uniqueId}`, 'i'),
        {
          timeout: 5000,
        }
      )
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
