import { expect, test } from '@playwright/test'

// Tournament E2E Tests - USES GLOBAL AUTHENTICATION from auth.json
test.describe('Admin Tournaments', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistent testing
    await page.setViewportSize({ width: 375, height: 812 })
  })

  test('should display admin tournaments management page', async ({ page }) => {
    // Navigate to admin tournaments
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')

    // Should see page content indicating tournaments (checking Dutch content since interface is in Dutch)
    await expect(page.locator('body')).toContainText(/toernooi/i, { timeout: 15000 })

    // Should see the Add button (it's an ActionLinkButton, which renders as a link)
    await expect(page.getByRole('link', { name: /^toevoegen$|^add$/i })).toBeVisible()
  })

  test('should access tournaments via context menu', async ({ page }) => {
    // Navigate to home first
    await page.goto('/')

    // Wait for navigation to settle completely to avoid interference
    // with the dropdown's navigation state effect
    await page.waitForLoadState('networkidle')
    await page.waitForLoadState('domcontentloaded')

    // Give React a moment to finish any hydration/navigation state updates
    await page.waitForTimeout(100)

    // Ensure we are at top so AppBar is visible (header may auto-hide in CI)
    await page.evaluate(() => window.scrollTo(0, 0))

    // Wait for potential header bounce animation (600ms) to complete
    // await page.waitForTimeout(700)

    // Open user menu by clicking hamburger menu
    await page.getByRole('button', { name: 'Toggle menu' }).click()

    // Wait for the dropdown menu to be visible
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible()

    // Look for tournaments link using text content (more flexible)
    const tournamentsLink = page.locator('a').filter({ hasText: /toernooien/i })
    await expect(tournamentsLink.first()).toBeVisible({ timeout: 10000 })

    // Click tournaments link
    await tournamentsLink.first().click()

    // Should navigate to tournaments page
    await expect(page).toHaveURL(/\/tournaments/)
    await expect(page.locator('body')).toContainText(/toernooi/i)
  })

  test('should access tournaments via admin panel button', async ({ page }) => {
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Wait for content to actually appear
    await page.waitForFunction(() => document.body.children.length > 0)

    // Should see "Tournament Management" panel in admin panel
    const manageTournamentsPanel = page.getByRole('link', {
      name: 'Tournament Management',
    })
    await expect(manageTournamentsPanel).toBeVisible({ timeout: 15000 })

    // Click the panel
    await manageTournamentsPanel.click()

    // Should navigate to tournaments page
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')
  })

  test('should allow admin tournament creation', async ({ page }) => {
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/new')

    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for hydration/rendering

    // Wait for content to actually appear
    await page.waitForFunction(() => document.body.children.length > 0)

    // Should see admin tournament creation form
    await expect(page.locator('form')).toBeVisible({ timeout: 15000 })

    // Should see tournament form fields
    await expect(page.locator('[name="name"]')).toBeVisible()
    await expect(page.locator('[name="location"]')).toBeVisible()

    // Date picker components render as buttons or special components, not simple inputs
    await expect(
      page
        .locator('text=Start Date')
        .or(page.locator('text=startDate'))
        .or(page.locator('text=Startdatum'))
    ).toBeVisible()
  })

  test('should show tournament creation form with all required fields', async ({
    page,
  }) => {
    // Navigate to tournament creation page
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/new')

    // Wait for form to load
    await page.waitForLoadState('networkidle')

    // Step 1: Basic Info - Look for specific input fields
    await expect(page.getByRole('textbox', { name: /name|naam/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /location|locatie/i })).toBeVisible()

    // Step 2: Dates - Look for date picker buttons
    await expect(
      page.getByRole('button', {
        name: /startdatum.*select date|start date.*select date/i,
      })
    ).toBeVisible()
    await expect(
      page.getByRole('button', {
        name: /einddatum.*select date|end date.*select date/i,
      })
    ).toBeVisible()

    // Step 3: Divisions (checkboxes) - Look for the section heading
    await expect(
      page.getByRole('heading', { name: /divisions|divisies/i })
    ).toBeVisible()

    // Step 4: Categories (checkboxes) - Look for the section heading
    await expect(
      page.getByRole('heading', { name: /categories|categorieën/i })
    ).toBeVisible()

    // Submit button
    await expect(page.getByRole('button', { name: 'Opslaan' })).toBeVisible()
  })

  test('should navigate to tournament creation from tournaments list', async ({
    page,
  }) => {
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Look for "Add" button (simplified since it's now just "Add")
    const addButton = page.getByRole('link', { name: /^toevoegen$|^add$/i })
    await expect(addButton).toBeVisible({ timeout: 15000 })

    // Click the add button
    await addButton.click()

    // Should navigate to new tournament page
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/new')
  })

  test('should show tournaments list or empty state', async ({ page }) => {
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Wait for content to actually appear
    await page.waitForFunction(() => document.body.children.length > 0)

    // Should show tournaments interface
    const tournamentsContainer = page.getByTestId('admin-tournaments-layout-container')
    await expect(tournamentsContainer).toBeVisible({ timeout: 15000 })

    // Should show either tournaments list or empty state message
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toBeTruthy()
    expect(bodyText!.length).toBeGreaterThan(50) // Should have substantial content
  })
})

// Special Integration Test: Tournament Creation → Team Creation
test.describe('Tournament-Team Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistent testing
    await page.setViewportSize({ width: 375, height: 812 })
  })

  test('should create tournament and verify combo field integration in team creation', async ({
    page,
  }) => {
    // Step 1: Create a tournament
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/new')
    await page.waitForLoadState('networkidle')

    // Fill tournament form
    await page.getByRole('textbox', { name: /name|naam/i }).fill('Test Tournament E2E')
    await page.getByRole('textbox', { name: /location|locatie/i }).fill('Test Location')

    // Select start date using date picker
    await page
      .getByRole('button', { name: /startdatum.*select date|start date.*select date/i })
      .click()
    await expect(page.getByRole('dialog', { name: 'calendar' })).toBeVisible()
    await page.getByRole('button', { name: /^15 / }).click()

    // Select end date using date picker
    await page
      .getByRole('button', { name: /einddatum.*select date|end date.*select date/i })
      .click()
    await expect(page.getByRole('dialog', { name: 'calendar' })).toBeVisible()
    await page.getByRole('button', { name: /^20 / }).click()

    // Select divisions
    const firstDivisionLabel = page
      .locator('label')
      .filter({ hasText: /eerste klasse/i })
    await expect(firstDivisionLabel).toBeVisible({ timeout: 10000 })
    await firstDivisionLabel.click()

    const secondDivisionLabel = page
      .locator('label')
      .filter({ hasText: /tweede klasse/i })
    await expect(secondDivisionLabel).toBeVisible()
    await secondDivisionLabel.click()

    // Select categories
    const jo8Label = page.locator('label').filter({ hasText: /JO8/i })
    await expect(jo8Label).toBeVisible()
    await jo8Label.click()

    const jo10Label = page.locator('label').filter({ hasText: /JO10/i })
    await expect(jo10Label).toBeVisible()
    await jo10Label.click()

    // Submit form - should redirect to tournament edit page
    await page.getByRole('button', { name: 'Opslaan' }).click()
    await page.waitForLoadState('networkidle')

    // Verify we're on the tournament edit page (not the list)
    await expect(page).toHaveURL(/\/tournaments\/[^\/]+$/) // Should be /tournaments/{id}

    // Step 2: Navigate to teams route
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
    await page.waitForLoadState('networkidle')

    // Step 3: Navigate to new team route
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/new')
    await page.waitForLoadState('networkidle')

    // Step 4: Open tournament combo and select the newly created tournament
    const tournamentCombo = page.getByRole('combobox', {
      name: /toernooi.*select option|tournament.*select option/i,
    })
    await expect(tournamentCombo).toBeVisible()

    // Try to open dropdown and find tournament, with one retry if it fails
    let tournamentFound = false

    try {
      // First attempt: Open dropdown and wait for tournament option
      await tournamentCombo.click()
      const tournamentDropdown = page.locator('[data-radix-select-content]').last()
      await expect(tournamentDropdown).toBeVisible({ timeout: 3000 })

      const tournamentOption = tournamentDropdown.getByRole('option', {
        name: /Test Tournament E2E - Test Location/i,
      })
      await expect(tournamentOption).toBeVisible({ timeout: 10000 })

      // Tournament found, select it
      await tournamentOption.click()
      tournamentFound = true
    } catch (error) {
      console.log('First attempt failed, closing and reopening dropdown...')

      // Close dropdown and try once more to give database more time
      await page.keyboard.press('Escape')
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Second attempt: Get fresh combo reference after reload and reopen dropdown
      const refreshedTournamentCombo = page.getByRole('combobox', {
        name: /toernooi.*select option|tournament.*select option/i,
      })
      await expect(refreshedTournamentCombo).toBeVisible()
      await refreshedTournamentCombo.click()

      const tournamentDropdown = page.locator('[data-radix-select-content]').last()
      await expect(tournamentDropdown).toBeVisible({ timeout: 3000 })

      // Debug: Log what options are actually available
      const allOptions = await tournamentDropdown.locator('[role="option"]').all()
      const optionTexts = await Promise.all(
        allOptions.map(option => option.textContent())
      )
      console.log('Available tournament options:', optionTexts)

      const tournamentOption = tournamentDropdown.getByRole('option', {
        name: /Test Tournament E2E - Test Location/i,
      })
      await expect(tournamentOption).toBeVisible({ timeout: 10000 })

      // Tournament found on retry, select it
      await tournamentOption.click()
      tournamentFound = true
    }

    if (!tournamentFound) {
      throw new Error('Tournament option not found after retry')
    }

    // Step 5: Open divisions combo, verify list, and select first division
    const divisionCombo = page.getByRole('combobox', {
      name: /teamklasse.*select option|division.*select option/i,
    })
    await expect(divisionCombo).toBeVisible()
    await divisionCombo.click()
    const divisionDropdown = page.locator('[data-radix-select-content]').last()
    await expect(divisionDropdown).toBeVisible({ timeout: 3000 })
    const firstDivisionOption = divisionDropdown.getByRole('option', {
      name: /eerste klasse|first division/i,
    })
    await expect(firstDivisionOption).toBeVisible({ timeout: 3000 })
    await firstDivisionOption.click()

    // Step 6: Open categories combo and verify the list
    const categoryCombo = page.getByRole('combobox', {
      name: /categorie.*select option|category.*select option/i,
    })
    await expect(categoryCombo).toBeVisible()
    await categoryCombo.click()
    const categoryDropdown = page.locator('[data-radix-select-content]').last()
    await expect(categoryDropdown).toBeVisible({ timeout: 3000 })
    const jo8Option = categoryDropdown.getByRole('option', { name: /JO8/i })
    const jo10Option = categoryDropdown.getByRole('option', { name: /JO10/i })
    await expect(jo8Option).toBeVisible({ timeout: 3000 })
    await expect(jo10Option).toBeVisible({ timeout: 3000 })
  })

  test('should show empty divisions and categories when no tournament selected', async ({
    page,
  }) => {
    // Navigate to team creation form
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/new')
    await page.waitForLoadState('networkidle')

    // Look for form fields using the correct Dutch translations
    await expect(
      page.getByRole('combobox', {
        name: /toernooi.*select option|tournament.*select option/i,
      })
    ).toBeVisible()
    await expect(
      page.getByRole('combobox', {
        name: /teamklasse.*select option|division.*select option/i,
      })
    ).toBeVisible()
    await expect(
      page.getByRole('combobox', {
        name: /categorie.*select option|category.*select option/i,
      })
    ).toBeVisible()

    // Verify team form fields with more specific selectors
    await expect(
      page.getByRole('textbox', { name: /clubnaam|club.*name/i })
    ).toBeVisible()
    await expect(
      page.getByRole('textbox', { name: /teamnaam|team.*name/i })
    ).toBeVisible()
    await expect(page.getByRole('textbox', { name: /naam teamleider/i })).toBeVisible()
  })

  test('should verify team form structure and basic functionality', async ({
    page,
  }) => {
    // Navigate to team creation form
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/new')
    await page.waitForLoadState('networkidle')

    // Verify form structure using the correct Dutch translations
    await expect(
      page.getByRole('combobox', {
        name: /toernooi.*select option|tournament.*select option/i,
      })
    ).toBeVisible()
    await expect(
      page.getByRole('combobox', {
        name: /teamklasse.*select option|division.*select option/i,
      })
    ).toBeVisible()
    await expect(
      page.getByRole('combobox', {
        name: /categorie.*select option|category.*select option/i,
      })
    ).toBeVisible()

    // Check team information fields with more specific selectors
    await expect(
      page.getByRole('textbox', { name: /clubnaam|club.*name/i })
    ).toBeVisible()
    await expect(
      page.getByRole('textbox', { name: /teamnaam|team.*name/i })
    ).toBeVisible()
    await expect(page.getByRole('textbox', { name: /naam teamleider/i })).toBeVisible()
    await expect(
      page.getByRole('textbox', { name: /e-mail teamleider/i })
    ).toBeVisible()
    await expect(
      page.getByRole('textbox', { name: /telefoon teamleider/i })
    ).toBeVisible()

    // Submit button
    await expect(page.getByRole('button', { name: 'Opslaan' })).toBeVisible()
  })
})
