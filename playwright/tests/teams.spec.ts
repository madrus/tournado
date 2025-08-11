import { expect, test } from '@playwright/test'

import { createTestTournament, waitForTournamentInDatabase } from '../helpers/database'

// Public Teams Tests - NO AUTHENTICATION REQUIRED
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Public Teams', () => {
  test.beforeEach(async ({ page }) => {
    // Clean database before each test to ensure proper test isolation
    const { cleanDatabase } = await import('../helpers/database')
    await cleanDatabase()

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })

    // Language is handled by global config - no need to override here
    // The i18n config will use Dutch for Playwright tests
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
    // Pre-create a tournament to ensure reliable test data
    console.log('Creating test tournament directly in database...')
    const tournament = await createTestTournament('PubTourney', 'Utrecht')
    console.log(
      `✅ Pre-created tournament: ${tournament.name} - ${tournament.location}`
    )

    // Navigate to public team creation form
    await page.goto('/teams/new')
    await page.waitForLoadState('networkidle')

    // Verify we're on the public team creation form
    await expect(page).toHaveURL('/teams/new')
    await expect(page.locator('form')).toBeVisible()

    // Step 1: Select Tournament with retry logic for database-UI sync
    console.log(`Waiting for tournament "${tournament.name}" to exist in database...`)
    await waitForTournamentInDatabase(tournament.name, 20, 1000) // More CI-friendly params
    console.log('Tournament confirmed in database, attempting UI selection...')

    let tournamentSelected = false
    for (let attempt = 1; attempt <= 5; attempt++) {
      // Increased retries for CI
      try {
        // Reload page to get fresh tournament data from root loader
        await page.reload({ waitUntil: 'networkidle' })
        await page.waitForTimeout(1000) // Longer wait for CI

        const tournamentCombo = page.getByRole('combobox', {
          name: /toernooi.*select option|tournament.*select option/i,
        })
        await expect(tournamentCombo).toBeVisible()
        await tournamentCombo.click()

        // Wait for dropdown to open and select our tournament
        const tournamentOption = page.getByRole('option', {
          name: `${tournament.name} - ${tournament.location}`,
        })
        await expect(tournamentOption).toBeVisible({ timeout: 5000 }) // Increased timeout for CI
        await tournamentOption.click()

        // Verify tournament was selected
        await expect(tournamentCombo).toContainText(
          `${tournament.name} - ${tournament.location}`
        )

        // Debug: Check tournament selection value
        const tournamentSelectValue = await page
          .locator('select[name="tournamentId"]')
          .inputValue()
        console.log(`🔍 Selected tournament ID: "${tournamentSelectValue}"`)

        tournamentSelected = true
        console.log('✅ Tournament successfully selected in public form')
        break
      } catch (error) {
        console.log(`Tournament selection attempt ${attempt} failed, retrying...`)
        if (attempt === 5) {
          throw error
        }
        await page.waitForTimeout(1000) // Longer retry delay for CI
      }
    }

    // Step 2: Select Division (after tournament selection populates options)
    const divisionCombo = page.getByRole('combobox', {
      name: /teamklasse.*select option|division.*select option/i,
    })
    await expect(divisionCombo).toBeVisible()
    await divisionCombo.click()

    // Select first available division
    const firstDivision = page.getByRole('option', { name: /eerste klasse/i })
    await expect(firstDivision).toBeVisible({ timeout: 3000 })
    await firstDivision.click()
    console.log('✅ Division successfully selected')

    // Step 3: Select Category
    const categoryCombo = page.getByRole('combobox', {
      name: /categorie.*select option|category.*select option/i,
    })
    await expect(categoryCombo).toBeVisible()
    await categoryCombo.click()

    // Select first available category
    const firstCategory = page.getByRole('option', { name: /JO8/i })
    await expect(firstCategory).toBeVisible({ timeout: 3000 })
    await firstCategory.click()
    console.log('✅ Category successfully selected')

    // Step 4: Fill Team Information
    const clubNameInput = page.getByRole('textbox', { name: /clubnaam|club.*name/i })
    const teamNameInput = page.getByRole('textbox', { name: /teamnaam|team.*name/i })

    // Debug: Check if inputs are enabled
    const clubNameEnabled = await clubNameInput.isEnabled()
    const teamNameEnabled = await teamNameInput.isEnabled()
    console.log(`🔍 Club name input enabled: ${clubNameEnabled}`)
    console.log(`🔍 Team name input enabled: ${teamNameEnabled}`)

    await expect(clubNameInput).toBeEnabled()
    await expect(teamNameInput).toBeEnabled()

    await clubNameInput.fill('TC Public')
    await teamNameInput.fill('J08-1')

    // Debug: Verify values were set
    const clubNameValue = await clubNameInput.inputValue()
    const teamNameValue = await teamNameInput.inputValue()
    console.log(`🔍 Club name value: "${clubNameValue}"`)
    console.log(`🔍 Team name value: "${teamNameValue}"`)

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

    // Debug: Verify team leader values were set
    const leaderNameValue = await leaderNameInput.inputValue()
    const leaderEmailValue = await leaderEmailInput.inputValue()
    const leaderPhoneValue = await leaderPhoneInput.inputValue()
    console.log(`🔍 Leader name value: "${leaderNameValue}"`)
    console.log(`🔍 Leader email value: "${leaderEmailValue}"`)
    console.log(`🔍 Leader phone value: "${leaderPhoneValue}"`)

    // Step 6: Accept Privacy Agreement
    const privacyCheckbox = page.getByRole('checkbox', {
      name: /privacy|privacybeleid/i,
    })
    await expect(privacyCheckbox).toBeVisible()
    await privacyCheckbox.check()
    console.log('✅ Privacy agreement accepted')

    // Step 7: Submit Form
    // Debug: Check tournament ID value in the hidden select
    const hiddenSelect = page.locator('select[name="tournamentId"]')
    const tournamentIdValue = await hiddenSelect.inputValue()
    console.log(`🔍 Tournament ID value before submission: "${tournamentIdValue}"`)

    // Set up network interception to debug server response
    let serverResponse: any = null
    let serverError: any = null

    page.on('response', async response => {
      if (
        response.url().includes('/teams/new') &&
        response.request().method() === 'POST'
      ) {
        console.log(`🔍 Server response status: ${response.status()}`)
        console.log(`🔍 Server response headers:`, await response.allHeaders())

        try {
          if (response.status() >= 400) {
            const responseText = await response.text()
            console.log(`🔍 Server error response:`, responseText)
            serverError = responseText
          } else {
            const responseBody = await response.text()
            console.log(`🔍 Server success response:`, responseBody)
            serverResponse = responseBody
          }
        } catch (e) {
          console.log(`🔍 Could not read response body:`, e)
        }
      }
    })

    // Look for Save button in both Dutch and English
    const submitButton = page.getByRole('button', { name: /^(Opslaan|Save)$/i })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    // Wait for form submission to start processing
    await page.waitForTimeout(2000) // Increased wait to capture response

    // Step 8: Verify Success
    // Should redirect to team details page (the success parameter gets removed immediately by the page)
    await expect(page).toHaveURL(/\/teams\/[^\/]+$/, { timeout: 10000 })

    // The page shows team details with our created team data
    await expect(page.locator('body')).toContainText(/J08-1|TC Public/i, {
      timeout: 5000,
    })

    // Optional: Try to catch the success toast if it's still visible
    // The toast appears and disappears quickly when the success parameter is processed
    const successToast = page
      .locator('[data-sonner-toast]')
      .filter({ hasText: /success/i })
    if (await successToast.isVisible()) {
      console.log('✅ Success toast detected')
    }

    console.log('✅ Public team creation completed successfully')
  })
})
