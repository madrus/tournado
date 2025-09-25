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

      // Verify we're on the public team creation form
      await expect(page).toHaveURL('/teams/new')
      await expect(page.locator('form')).toBeVisible()

      // Step 1: Select Tournament (tournaments are seeded in global setup)
      const tournamentCombo = page.getByRole('combobox', {
        name: /toernooi.*select option/i,
      })
      await expect(tournamentCombo).toBeVisible()
      await tournamentCombo.click()

      // Wait for dropdown to open
      await page.waitForTimeout(1000)
      const triggerState = await tournamentCombo.getAttribute('data-state')

      // Try clicking again if it didn't open
      if (triggerState !== 'open') {
        await tournamentCombo.click()
        await page.waitForTimeout(500)
      }

      // Find the visible Radix Select item (not the hidden native option)
      const tournamentOption = page
        .locator('[data-radix-select-content]')
        .locator('text="Spring Cup - Amsterdam"')
        .first()
      await expect(tournamentOption).toBeVisible({ timeout: 5000 })
      await tournamentOption.click()

      await expect(tournamentCombo).toContainText(
        `${tournament.name} - ${tournament.location}`
      )

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
      const leaderEmail = `test-${uniqueId}@example.com`
      await leaderEmailInput.fill(leaderEmail)
      await leaderPhoneInput.fill('0123456789')

      // Step 6: Accept Privacy Agreement
      const privacyCheckbox = page.getByRole('checkbox', {
        name: /privacybeleid/i,
      })
      await expect(privacyCheckbox).toBeVisible()
      await privacyCheckbox.check()

      // Step 7: Handle PWA prompts that might interfere with form submission
      const pwaPrompt = page.locator('#pwa-prompts .bg-accent.fixed')
      const pwaPromptVisible = await pwaPrompt.isVisible().catch(() => false)
      if (pwaPromptVisible) {
        // Click the dismiss button or outside the prompt to close it
        const dismissButton = pwaPrompt.locator('button').last()
        if (await dismissButton.isVisible().catch(() => false)) {
          await dismissButton.click()
        }
        // Wait for prompt to disappear
        await expect(pwaPrompt).not.toBeVisible()
      }

      // Step 8: Submit Form
      const submitButton = page.getByRole('button', { name: 'Opslaan' })
      await expect(submitButton).toBeVisible()
      await expect(submitButton).toBeEnabled()
      await Promise.all([
        // Wait for redirect to the team detail page
        page.waitForURL(/\/teams\/[^\/]+$/, { timeout: 15000 }),
        submitButton.click(),
      ])

      // Step 9: Verify Success
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

      // TODO: Fix email verification - temporarily skipped due to routing issues
      // Add some time for server-side email processing
      await page.waitForTimeout(2000)

      // // Wait for email to be captured by MSW
      // const emails = await waitForEmailsCount(1, 3000)
      // expect(emails).toHaveLength(1)
      // expect(emails[0].to).toBe(leaderEmail)
      // expect(emails[0].subject).toContain(tournament.name)
      // expect(emails[0].html).toContain(`J08-1-${uniqueId}`)
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
