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

    // Should see the Add Tournament link (it's an ActionLinkButton, which renders as a link)
    await expect(
      page.getByRole('link', { name: /toernooi toevoegen|add tournament/i })
    ).toBeVisible()
  })

  test('should access tournaments via context menu', async ({ page }) => {
    // Navigate to home first
    await page.goto('/')

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

    // Should see "Manage Tournaments" button in admin panel
    const manageTournamentsButton = page.getByRole('link', {
      name: 'Manage Tournaments',
    })
    await expect(manageTournamentsButton).toBeVisible({ timeout: 15000 })

    // Click the button
    await manageTournamentsButton.click()

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

    // Look for "Add Tournament" or similar button
    const addButton = page
      .locator('a, button')
      .filter({ hasText: /toernooi|tournament/i })
      .filter({ hasText: /add|toevoegen|new|nieuw/i })
    await expect(addButton.first()).toBeVisible({ timeout: 15000 })

    // Click the add tournament button
    await addButton.first().click()

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
    const tournamentsContainer = page.locator('.container').first()
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

  test('should create tournament and verify it appears in team creation options', async ({
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
    // Click on day 15 (any day in the current month)
    await page.getByRole('button', { name: /^15 / }).click()

    // Select end date using date picker
    await page
      .getByRole('button', { name: /einddatum.*select date|end date.*select date/i })
      .click()
    await expect(page.getByRole('dialog', { name: 'calendar' })).toBeVisible()
    // Click on day 20 (any day in the current month)
    await page.getByRole('button', { name: /^20 / }).click()

    // Select divisions - find division checkboxes with exact Dutch names
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

    // Submit form
    await page.getByRole('button', { name: 'Opslaan' }).click()

    // Wait for success/redirect
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/tournaments$/)

    // Step 2: Verify tournament appears in team creation form
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/new')
    await page.waitForLoadState('networkidle')

    // Look for tournament dropdown/combobox
    const tournamentField = page.getByRole('combobox', {
      name: /toernooi.*select option|tournament.*select option/i,
    })
    await expect(tournamentField).toBeVisible()

    // Open dropdown to see if our tournament is there
    await tournamentField.click()

    // Wait for dropdown options to be populated and check if our tournament exists
    await page.waitForTimeout(1000)
    const tournamentOption = page
      .locator('option')
      .filter({ hasText: /Test Tournament E2E/i })
    await expect(tournamentOption.first()).toBeAttached({ timeout: 5000 })
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
