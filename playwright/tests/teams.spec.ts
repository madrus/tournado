import { expect, test } from '@playwright/test'

import { createTestTournament } from '../helpers/database'

// Public Teams Tests - NO AUTHENTICATION REQUIRED
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Public Teams', () => {
  test.beforeEach(async ({ page }) => {
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

  test('should display existing teams publicly', async ({ page }) => {
    await page.goto('/teams')

    // Should show teams list or empty state message
    // This is public viewing of teams
    const teamsContainer = page.locator('[data-testid="teams-layout"]')
    await expect(teamsContainer).toBeVisible()
  })

  test('should create team with tournament selection in public area', async ({
    page,
  }) => {
    // Pre-create a tournament to ensure reliable test data
    console.log('Creating test tournament directly in database...')
    const tournament = await createTestTournament(
      'Public Test Tournament',
      'Public Test Location'
    )
    console.log(
      `✅ Pre-created tournament: ${tournament.name} - ${tournament.location}`
    )

    // Navigate to public team creation form
    await page.goto('/teams/new')
    await page.waitForLoadState('networkidle')

    // Verify we're on the public team creation form
    await expect(page).toHaveURL('/teams/new')
    await expect(page.locator('form')).toBeVisible()

    // Step 1: Select Tournament
    const tournamentCombo = page.getByRole('combobox', {
      name: /toernooi.*select option|tournament.*select option/i,
    })
    await expect(tournamentCombo).toBeVisible()
    await tournamentCombo.click()

    // Wait for dropdown to open and select our tournament
    const tournamentOption = page.getByRole('option', {
      name: `${tournament.name} - ${tournament.location}`,
    })
    await expect(tournamentOption).toBeVisible({ timeout: 5000 })
    await tournamentOption.click()

    // Verify tournament was selected
    await expect(tournamentCombo).toContainText(
      `${tournament.name} - ${tournament.location}`
    )
    console.log('✅ Tournament successfully selected in public form')

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
    await page
      .getByRole('textbox', { name: /clubnaam|club.*name/i })
      .fill('Test Club Public')
    await page
      .getByRole('textbox', { name: /teamnaam|team.*name/i })
      .fill('Test Team Public')

    // Step 5: Fill Team Leader Information
    await page.getByRole('textbox', { name: /naam teamleider/i }).fill('Test Leader')
    await page
      .getByRole('textbox', { name: /e-mail teamleider/i })
      .fill('test@example.com')
    await page.getByRole('textbox', { name: /telefoon teamleider/i }).fill('0123456789')

    // Step 6: Accept Privacy Agreement
    const privacyCheckbox = page.getByRole('checkbox', { name: /privacy/i })
    await expect(privacyCheckbox).toBeVisible()
    await privacyCheckbox.check()
    console.log('✅ Privacy agreement accepted')

    // Step 7: Submit Form
    const submitButton = page.getByRole('button', { name: 'Opslaan' })
    await expect(submitButton).toBeVisible()
    await submitButton.click()

    // Step 8: Verify Success
    // Should redirect to team details page (the success parameter gets removed immediately by the page)
    await expect(page).toHaveURL(/\/teams\/[^\/]+$/, { timeout: 10000 })

    // The page shows team details with our created team data
    await expect(page.locator('body')).toContainText(
      /Test Team Public|Test Club Public/i,
      {
        timeout: 5000,
      }
    )

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
