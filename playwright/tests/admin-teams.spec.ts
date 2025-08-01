import { expect, test } from '@playwright/test'

import { AdminPanelPage } from '../pages/AdminPanelPage'
import { AdminTeamsPage } from '../pages/AdminTeamsPage'

// Admin Teams Tests - USES GLOBAL AUTHENTICATION from auth.json
test.describe('Admin Teams', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
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
    expect(bodyText!.length).toBeGreaterThan(50) // Should have substantial content
  })

  test('should access admin team details', async ({ page }) => {
    // Test accessing a specific team in admin view
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/test-team-id')

    // Should redirect to signin if team doesn't exist, but stay on admin route if authenticated
    // This tests that the admin route structure works with authentication
    const url = page.url()
    expect(url).toContain('/a7k9m2x5p8w1n4q6r3y8b5t1')

    // Should see some admin interface (either team details or error page)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should access teams via admin panel button', async ({ page }) => {
    const adminPanelPage = new AdminPanelPage(page)

    await adminPanelPage.goto()
    await adminPanelPage.expectTeamManagementVisible()
    await adminPanelPage.clickTeamManagement()

    // Should navigate to teams page
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
  })

  test('should display "Toevoegen" link for admin users on admin teams page', async ({
    page,
  }) => {
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
    await expect(page.getByRole('link', { name: 'Toevoegen' })).toBeVisible()
  })
})
