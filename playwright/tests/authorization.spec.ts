import { expect, test } from '@playwright/test'

import { createRegularUser } from '../helpers/database'

test.describe('Authorization - Role-based Access', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistency
    await page.setViewportSize({ width: 375, height: 812 })

    // Language is handled by global config - no need to override here
    // The i18n config will use Dutch for Playwright tests
  })

  test.describe('Regular User - Access Denied', () => {
    // These tests need fresh authentication with regular users
    test.use({ storageState: { cookies: [], origins: [] } })

    let regularUser: { email: string; role: string }

    test.beforeEach(async ({ page }) => {
      regularUser = await createRegularUser()

      await page.goto('/auth/signin')
      await page.locator('#email').fill(regularUser.email)
      await page.locator('#password').fill('MyReallyStr0ngPassw0rd!!!')
      await page.getByRole('button', { name: 'Inloggen' }).click()
      await expect(page).toHaveURL('/')
    })

    test('should be denied access to admin panel', async ({ page }) => {
      // Regular users should be denied access to the admin panel
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

      // Should be redirected to unauthorized page
      await expect(page).toHaveURL('/unauthorized')

      // Should see unauthorized message (check for Dutch text if available)
      await expect(
        page.getByRole('heading', { name: /unauthorized|toegang|onbevoegd/i })
      ).toBeVisible()
    })

    test('should be denied access to admin teams page', async ({ page }) => {
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')

      // Regular user should be denied access
      await expect(page).toHaveURL('/unauthorized')
    })

    test('should be denied access to admin team creation', async ({ page }) => {
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/new')

      // Regular user should be denied access
      await expect(page).toHaveURL('/unauthorized')
    })
  })

  test.describe('Public Access - No Authentication Required', () => {
    // These tests should run without authentication
    test.use({ storageState: { cookies: [], origins: [] } })

    test('should allow access to public teams page', async ({ page }) => {
      // Public teams page should be accessible without authentication
      await page.goto('/teams')

      await expect(page).toHaveURL('/teams')
      await expect(page.getByRole('link', { name: 'Team toevoegen' })).toBeVisible()
    })

    test('should redirect to signin when accessing protected routes', async ({
      page,
    }) => {
      // Try to access admin panel without authentication
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

      // Should be redirected to signin page
      await expect(page).toHaveURL(/\/auth\/signin/)
      await expect(page).toHaveURL(/redirectTo=/)
    })

    test('should allow access to signup and signin pages', async ({ page }) => {
      await page.goto('/auth/signin')
      await expect(page).toHaveURL('/auth/signin')
      await expect(page.getByRole('button', { name: 'Inloggen' })).toBeVisible()

      await page.goto('/auth/signup')
      await expect(page).toHaveURL('/auth/signup')
      await expect(page.getByRole('button', { name: 'Account aanmaken' })).toBeVisible()
    })
  })
})
