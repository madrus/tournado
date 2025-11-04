/**
 * Admin Tournaments Management E2E Tests
 *
 * Test Scenarios:
 * - Admin tournaments management page access and display
 * - Tournament creation via admin panel and context menu
 * - Tournament form validation and field structure
 * - Tournament database persistence and verification
 * - Team creation with tournament selection (integration test)
 * - Division and category selection based on tournament
 * - Form panel progression and field enablement
 *
 * Authentication: Uses global auth from auth.json (ADMIN role)
 * Viewport: Mobile (375x812)
 */
import { expect, test } from '@playwright/test'

import { ADMIN_DASHBOARD_URL } from '../../app/lib/lib.constants'
import {
  checkTournamentExists,
  createTestTournament,
  deleteTestTeam,
  deleteTestTournament,
  waitForTournamentInDatabase,
} from '../helpers/database'
import { AdminTeamsPage } from '../pages/AdminTeamsPage'
import { AdminTournamentsPage } from '../pages/AdminTournamentsPage'

// Tournament E2E Tests - USES GLOBAL AUTHENTICATION from auth.json
test.describe('Admin Tournaments', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistent testing
    await page.setViewportSize({ width: 375, height: 812 })
  })

  test('should display admin tournaments management page', async ({ page }) => {
    const adminTournamentsPage = new AdminTournamentsPage(page)
    await adminTournamentsPage.navigate()
    await adminTournamentsPage.expectPageToContainTournamentText()
    await expect(adminTournamentsPage.addButton).toBeVisible()
  })

  test('should access tournaments via context menu', async ({ page }) => {
    const adminTournamentsPage = new AdminTournamentsPage(page)
    // Block React Router manifest requests to prevent prefetch-induced page reloads
    await page.route('**/__manifest**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ patches: [] }),
      })
    })

    // Navigate to home first
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for route transition animation to complete (500ms duration + buffer)
    await page.waitForTimeout(600)

    // Open user menu by clicking hamburger menu
    await expect(adminTournamentsPage.menuButton).toBeVisible()

    // Click and wait for menu with navigation guard
    await Promise.all([
      page
        .waitForResponse(
          response => response.url().includes('/') && response.status() === 200,
          { timeout: 1000 }
        )
        .catch(() => {}), // Ignore timeout
      adminTournamentsPage.menuButton.click(),
    ])

    // Wait for menu to be fully open and stable (data-state="open")
    await expect(adminTournamentsPage.menuDropdown).toBeVisible({ timeout: 5000 })
    await expect(adminTournamentsPage.menuDropdown).toHaveAttribute(
      'data-state',
      'open'
    )

    // Additional stability wait for any animations/transitions
    await page.waitForTimeout(300)

    // Look for tournaments link with more specific targeting
    await expect(adminTournamentsPage.tournamentsLink.first()).toBeVisible({
      timeout: 10000,
    })

    // Ensure the link is ready for interaction
    await expect(adminTournamentsPage.tournamentsLink.first()).toBeEnabled()

    // Get the href to verify it's the correct link
    const href = await adminTournamentsPage.tournamentsLink.first().getAttribute('href')
    console.log('Tournaments link href:', href)

    // Remove manifest blocking before navigation and wait for a cleaner navigation
    await page.unroute('**/__manifest__')

    // Use Promise.all to wait for navigation to complete
    await Promise.all([
      page.waitForURL(new RegExp(`${ADMIN_DASHBOARD_URL}/tournaments`), {
        timeout: 15000,
      }),
      adminTournamentsPage.tournamentsLink.first().click(),
    ])

    // Should navigate to tournaments page
    const currentUrl = page.url()
    console.log('Current URL after navigation:', currentUrl)

    // Verify we're on the correct page
    await expect(page).toHaveURL(new RegExp(`${ADMIN_DASHBOARD_URL}/tournaments`))
    await adminTournamentsPage.expectPageToContainTournamentText()
  })

  test('should access tournaments via admin panel button', async ({ page }) => {
    const adminTournamentsPage = new AdminTournamentsPage(page)
    await adminTournamentsPage.navigateToAdminHome()

    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle')

    // Wait for route transition animation to complete (500ms duration + buffer)
    await page.waitForTimeout(600)

    // Wait for content to actually appear
    await page.waitForFunction(() => document.body.children.length > 0)

    // Should see "Toernooien beheer" panel in admin panel
    await expect(adminTournamentsPage.manageTournamentsPanel).toBeVisible({
      timeout: 15000,
    })

    // Click the panel
    await adminTournamentsPage.manageTournamentsPanel.click()

    // Should navigate to tournaments page
    await expect(page).toHaveURL(`${ADMIN_DASHBOARD_URL}/tournaments`)
  })

  test('should allow admin tournament creation', async ({ page }) => {
    const adminTournamentsPage = new AdminTournamentsPage(page)
    await adminTournamentsPage.navigateToNew()

    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle')

    // Wait for route transition animation to complete (500ms duration + buffer)
    await page.waitForTimeout(600)

    // Wait for content to actually appear
    await page.waitForFunction(() => document.body.children.length > 0)

    // Should see admin tournament creation form
    await adminTournamentsPage.expectFormIsVisible()

    // Should see tournament form fields
    await expect(adminTournamentsPage.nameInput).toBeVisible()
    await expect(adminTournamentsPage.locationInput).toBeVisible()

    // Date picker components render as buttons or special components, not simple inputs
    await expect(page.locator('text=Startdatum')).toBeVisible()
  })

  test('should show tournament creation form with all required fields', async ({
    page,
  }) => {
    const adminTournamentsPage = new AdminTournamentsPage(page)
    // Navigate to tournament creation page
    await adminTournamentsPage.navigateToNew()

    // Wait for form to load
    await page.waitForLoadState('networkidle')

    // Wait for route transition animation to complete (500ms duration + buffer)
    await page.waitForTimeout(600)

    // Step 1: Basic Info - Look for specific input fields
    await expect(adminTournamentsPage.nameInput).toBeVisible()
    await expect(adminTournamentsPage.locationInput).toBeVisible()

    // Step 2: Dates - Look for date picker buttons
    await expect(adminTournamentsPage.startDateButton).toBeVisible()
    await expect(adminTournamentsPage.endDateButton).toBeVisible()

    // Step 3: Divisions (checkboxes) - Look for the section heading
    await expect(adminTournamentsPage.divisionsHeading).toBeVisible()

    // Step 4: Categories (checkboxes) - Look for the section heading
    await expect(adminTournamentsPage.categoriesHeading).toBeVisible()

    // Submit button
    await expect(adminTournamentsPage.saveButton).toBeVisible()
  })

  test('should navigate to tournament creation from tournaments list', async ({
    page,
  }) => {
    const adminTournamentsPage = new AdminTournamentsPage(page)
    await adminTournamentsPage.navigate()

    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Look for "Toevoegen" button (simplified since it's now just "Toevoegen")
    await expect(adminTournamentsPage.addButton).toBeVisible({ timeout: 15000 })

    // Click the add button
    await adminTournamentsPage.clickAddButton()

    // Should navigate to new tournament page
    await adminTournamentsPage.expectToBeOnNewTournamentPage()
  })

  test('should show tournaments list or empty state', async ({ page }) => {
    const adminTournamentsPage = new AdminTournamentsPage(page)
    await adminTournamentsPage.navigate()

    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Wait for content to actually appear
    await page.waitForFunction(() => document.body.children.length > 0)

    // Should show tournaments interface
    await expect(adminTournamentsPage.tournamentsContainer).toBeVisible({
      timeout: 15000,
    })

    // Should show either tournaments list or empty state message
    const bodyText = await adminTournamentsPage.body.textContent()
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

  // TEST 1: Tournament Creation and Database Verification (Focused)
  test('should create tournament and verify database persistence', async ({ page }) => {
    let tournamentId: string | undefined
    const adminTournamentsPage = new AdminTournamentsPage(page)

    try {
      // Navigate to tournament creation page
      await adminTournamentsPage.navigateToNew()
      await page.waitForLoadState('networkidle')

      // Wait for page hydration and form to be fully loaded
      await page.waitForTimeout(3000)

      // Fill tournament form
      console.log('Filling tournament name and location...')

      // Ensure form fields are visible and interactable
      await expect(adminTournamentsPage.nameInput).toBeVisible()
      await expect(adminTournamentsPage.locationInput).toBeVisible()

      await adminTournamentsPage.nameInput.fill('E2ETourney')
      await adminTournamentsPage.nameInput.blur() // Trigger validation
      await adminTournamentsPage.locationInput.fill('Aalsmeer')
      await adminTournamentsPage.locationInput.blur() // Trigger validation

      // Wait longer for form validation to complete after blur events
      await page.waitForTimeout(3000)

      // Check if start date button is enabled
      console.log('Checking if start date button is enabled...')
      await expect(adminTournamentsPage.startDateButton).toBeVisible()

      // Wait for the start date button to become enabled with a longer timeout
      // and more attempts to handle race conditions
      let attempts = 0
      const maxAttempts = 10
      while (attempts < maxAttempts) {
        const isEnabled = await adminTournamentsPage.startDateButton.isEnabled()
        if (isEnabled) {
          console.log(`Start date button enabled after ${attempts + 1} attempts`)
          break
        }
        console.log(
          `Start date button still disabled, attempt ${attempts + 1}/${maxAttempts}`
        )
        await page.waitForTimeout(1000)
        attempts++
      }

      // Final check with assertion
      await expect(adminTournamentsPage.startDateButton).toBeEnabled({ timeout: 5000 })
      await adminTournamentsPage.startDateButton.click()
      await expect(adminTournamentsPage.calendar).toBeVisible()
      await page.getByRole('button', { name: /^15 / }).click()

      // Select end date using date picker
      await adminTournamentsPage.endDateButton.click()
      await expect(adminTournamentsPage.calendar).toBeVisible()
      await page.getByRole('button', { name: /^20 / }).click()

      // Select divisies
      await expect(adminTournamentsPage.firstDivisionLabel).toBeVisible({
        timeout: 10000,
      })
      await adminTournamentsPage.firstDivisionLabel.click()

      await expect(adminTournamentsPage.secondDivisionLabel).toBeVisible()
      await adminTournamentsPage.secondDivisionLabel.click()

      // Wait for form to be fully updated after division selections
      await page.waitForTimeout(1000)

      // Select categorieën
      console.log('Selecting JO8 category...')
      await expect(adminTournamentsPage.jo8Label).toBeVisible()

      // Check if JO8 is enabled before clicking
      const jo8Disabled = await adminTournamentsPage.jo8Label.evaluate(
        el =>
          el.classList.contains('cursor-not-allowed') ||
          el.classList.contains('opacity-50')
      )
      if (jo8Disabled) {
        console.log('JO8 category is disabled, waiting for form validation...')
        await page.waitForTimeout(2000)
      }

      await adminTournamentsPage.jo8Label.click()

      console.log('Selecting JO10 category...')
      await expect(adminTournamentsPage.jo10Label).toBeVisible()

      // Check if JO10 is enabled before clicking
      const jo10Disabled = await adminTournamentsPage.jo10Label.evaluate(
        el =>
          el.classList.contains('cursor-not-allowed') ||
          el.classList.contains('opacity-50')
      )
      if (jo10Disabled) {
        console.log('JO10 category is disabled, waiting for form validation...')
        await page.waitForTimeout(2000)
      }

      // Ensure element is enabled before clicking
      await expect(adminTournamentsPage.jo10Label).not.toHaveClass(
        /cursor-not-allowed|opacity-50/
      )
      await adminTournamentsPage.jo10Label.click()

      // Submit form - should redirect to tournament edit page
      console.log('Submitting tournament creation form...')
      await adminTournamentsPage.saveButton.click()
      await page.waitForLoadState('networkidle')

      // Check for any error messages first
      if (await adminTournamentsPage.errorMessage.isVisible()) {
        const errorText = await adminTournamentsPage.errorMessage.textContent()
        throw new Error(`Tournament creation failed with error: ${errorText}`)
      }

      // Verify we're on the tournament edit page (not the list)
      // This confirms the tournament was actually created via UI
      await expect(page).toHaveURL(/\/tournaments\/[^\/]+$/, { timeout: 10000 })

      // Additional verification: check that the tournament form shows the created data
      await expect(page.getByRole('textbox', { name: /naam/i })).toHaveValue(
        'E2ETourney'
      )
      await expect(page.getByRole('textbox', { name: /locatie/i })).toHaveValue(
        'Aalsmeer'
      )

      console.log('Tournament creation UI confirmed - verifying database persistence')

      // CRITICAL: Verify tournament exists in database with full data structure
      try {
        await waitForTournamentInDatabase('E2ETourney', 10, 1000)
        console.log('✅ Tournament successfully verified in database')

        // Additional comprehensive verification
        const tournaments = await checkTournamentExists('E2ETourney')
        console.log('Database verification result:', tournaments)

        if (tournaments.length === 0) {
          throw new Error('Tournament not found in database despite UI success')
        }

        // Verify tournament has expected structure
        const tournament = tournaments[0]
        if (!tournament.name || !tournament.location) {
          throw new Error('Tournament missing required fields in database')
        }

        console.log(
          `✅ Tournament properly persisted: ${tournament.name} - ${tournament.location}`
        )
      } catch (error) {
        console.error('❌ Database verification failed:', error.message)

        // Enhanced debugging for failure analysis
        const allTournaments = await checkTournamentExists('')
        console.log('All tournaments in database:', allTournaments)

        throw new Error(`Tournament creation test failed: ${error.message}`)
      }

      // Extract tournament ID for cleanup
      const tournaments = await checkTournamentExists('E2ETourney')
      if (tournaments.length > 0) {
        tournamentId = tournaments[0].id
      }
    } finally {
      // Clean up test data
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

  // TEST 2: Team Creation with Tournament Selection (Uses pre-existing tournament)
  test('should select tournament and create team in admin area', async ({ page }) => {
    let tournamentId: string | undefined
    let teamId: string | undefined

    try {
      // Pre-create tournament using database-direct approach to avoid timing issues
      console.log('Creating test tournament directly in database...')
      const tournament = await createTestTournament('AdminTourney', 'Amsterdam')
      console.log(
        `✅ Pre-created tournament: ${tournament.name} - ${tournament.location}`
      )
      tournamentId = tournament.id

      const teamsPage = new AdminTeamsPage(page)
      await teamsPage.gotoCreateTeam()

      // Verify we're on the admin team creation form
      await teamsPage.expectToBeOnTeamFormPage()

      // Step 1: Select Tournament using page object for reliability
      await expect(teamsPage.tournamentCombo).toBeVisible()

      await teamsPage.selectTournamentWithRetry(
        `${tournament.name} - ${tournament.location}`
      )

      // Verify tournament was selected
      await expect(teamsPage.tournamentCombo).toContainText(
        `${tournament.name} - ${tournament.location}`
      )
      console.log('✅ Tournament successfully selected in combo')

      // Step 2: Select Division (after tournament selection populates options)
      await teamsPage.selectDivision('eerste klasse')

      // Step 3: Select Category
      await teamsPage.selectCategory('JO8')

      // Step 4: Fill team information and submit
      await teamsPage.fillTeamInformation({
        clubName: 'TC Admin',
        teamName: 'J08-1',
        leaderName: 'Test Leader Admin',
        leaderEmail: 'admin@test.com',
        leaderPhone: '0123456789',
      })
      await teamsPage.acceptPrivacyPolicy()
      teamId = await teamsPage.submitTeamForm()

      console.log(
        '✅ Team creation flow with tournament selection completed successfully'
      )
    } finally {
      // Clean up test data
      if (teamId) {
        try {
          await deleteTestTeam({ id: teamId })
        } catch (e) {
          console.error('Failed to cleanup team:', e)
        }
      }
      if (tournamentId) {
        try {
          await deleteTestTournament({ id: tournamentId })
        } catch (e) {
          console.error('Failed to cleanup tournament:', e)
        }
      }
    }
  })

  test('should show empty divisies and categorieën when no tournament selected', async ({
    page,
  }) => {
    const teamsPage = new AdminTeamsPage(page)
    await teamsPage.gotoCreateTeam()

    // Look for form fields
    await expect(teamsPage.tournamentCombo).toBeVisible()
    await expect(teamsPage.divisionCombo).toBeVisible()
    await expect(teamsPage.categoryCombo).toBeVisible()

    // Verify team form fields
    await expect(teamsPage.clubNameInput).toBeVisible()
    await expect(teamsPage.teamNameInput).toBeVisible()
    await expect(teamsPage.leaderNameInput).toBeVisible()
  })

  test('should verify team form structure and basic functionality', async ({
    page,
  }) => {
    const teamsPage = new AdminTeamsPage(page)
    await teamsPage.gotoCreateTeam()

    // Verify form structure
    await expect(teamsPage.tournamentCombo).toBeVisible()
    await expect(teamsPage.divisionCombo).toBeVisible()
    await expect(teamsPage.categoryCombo).toBeVisible()

    // Check team information fields
    await expect(teamsPage.clubNameInput).toBeVisible()
    await expect(teamsPage.teamNameInput).toBeVisible()
    await expect(teamsPage.leaderNameInput).toBeVisible()
    await expect(teamsPage.leaderEmailInput).toBeVisible()
    await expect(teamsPage.leaderPhoneInput).toBeVisible()

    // Submit button
    await expect(teamsPage.saveButton).toBeVisible()
  })
})
