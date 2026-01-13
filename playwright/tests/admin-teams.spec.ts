/**
 * Admin Teams Management E2E Tests
 *
 * Test Scenarios:
 * - Admin teams management page access and display
 * - Admin team creation access
 * - Teams interface visibility and content
 * - Team details access via admin view
 * - Navigation to teams via admin panel button
 * - Add team button visibility for admin users
 *
 * Authentication: Uses global auth from auth.json (ADMIN role)
 * Viewport: Mobile (375x812)
 */
import { expect, test } from '@playwright/test'
import { adminPath } from '../../app/utils/adminRoutes'
import {
  createTestTeam,
  createTestTournament,
  deleteTestTeam,
  deleteTestTournament,
} from '../helpers/database'
import { AdminPanelPage } from '../pages/AdminPanelPage'
import { AdminTeamsPage } from '../pages/AdminTeamsPage'

// Admin Teams Tests - USES GLOBAL AUTHENTICATION from auth.json
test.describe('Admin Teams', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(adminPath('/teams'))
  })

  test('should display admin teams management page', async ({ page }) => {
    const adminTeamsPage = new AdminTeamsPage(page)

    await adminTeamsPage.goto()
    await adminTeamsPage.expectToBeOnAdminTeamsPage()
  })

  test('should allow admin team creation', async ({ page }) => {
    const adminTeamsPage = new AdminTeamsPage(page)

    await adminTeamsPage.gotoCreateTeam()
    await adminTeamsPage.expectToBeOnCreateTeamPage()
  })

  test('should show admin teams interface', async ({ page }) => {
    const adminTeamsPage = new AdminTeamsPage(page)

    await adminTeamsPage.goto()
    await adminTeamsPage.expectAdminTeamsInterface()
  })

  test('should allow admin access to teams', async ({ page }) => {
    const adminTeamsPage = new AdminTeamsPage(page)

    await adminTeamsPage.goto()
    await adminTeamsPage.expectToBeOnAdminTeamsPage()

    // Page should not be empty
    const bodyText = await adminTeamsPage.bodyContent.textContent()
    expect(bodyText).toBeTruthy()
    expect(bodyText?.length).toBeGreaterThan(50) // Should have substantial content
  })

  test('should access admin team details', async ({ page }) => {
    const tournament = await createTestTournament(
      'Admin Teams Details Tournament',
      'Test Location',
    )
    const team = await createTestTeam({
      tournamentId: tournament.id,
      name: 'Admin Team Details',
      division: 'FIRST_DIVISION',
      category: 'JO10',
    })

    try {
      // Test accessing a specific team in admin view
      await page.goto(adminPath(`/teams/${team.id}`))

      // Should redirect to signin if team doesn't exist, but stay on admin route if authenticated
      // This tests that the admin route structure works with authentication
      const url = page.url()
      expect(url).toContain(adminPath())

      // Should see some admin interface (either team details or error page)
      await expect(page.locator('body')).toBeVisible()
    } finally {
      await deleteTestTeam({ id: team.id })
      await deleteTestTournament({ id: tournament.id })
    }
  })

  test('should access teams via admin panel button', async ({ page }) => {
    const adminPanelPage = new AdminPanelPage(page)

    await adminPanelPage.goto()
    await adminPanelPage.expectTeamManagementVisible()
    await adminPanelPage.clickTeamManagement()

    // Should navigate to teams page
    await expect(page).toHaveURL(adminPath('/teams'))
  })

  test('should display "Toevoegen" link for admin users on admin teams page', async ({
    page,
  }) => {
    await page.goto(adminPath('/teams'))
    await expect(page.getByRole('link', { name: 'Toevoegen' })).toBeVisible()
  })
})
