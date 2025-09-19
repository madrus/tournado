import { expect, test } from '@playwright/test'

import { getFirebaseMockScript } from '../helpers/firebase-mock'

// This test file runs without stored auth state to test role-based redirects
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Role-based redirects', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistency
    await page.setViewportSize({ width: 375, height: 812 })

    // Set the test flag and inject Firebase mocks
    await page.addInitScript(() => {
      window.playwrightTest = true
      window.localStorage.setItem('playwrightTest', 'true')
      // Use Dutch language in localStorage (app's natural default)
      window.localStorage.setItem('i18nextLng', 'nl')
      window.localStorage.setItem('language', 'nl')
      // Set Dutch language cookie
      document.cookie = 'lang=nl; path=/; domain=localhost'
    })

    // Inject Firebase mocks before navigation
    await page.addInitScript(getFirebaseMockScript())
  })

  test('admin user should redirect to admin panel after sign-in', async ({ page }) => {
    await page.goto('/auth/signin')

    // Sign in with admin credentials (email contains 'admin')
    await page.fill('#email', 'admin@test.com')
    await page.fill('#password', 'MyReallyStr0ngPassw0rd!!!')
    await page.click('button[type="submit"]')

    // Admin users should be redirected to admin panel
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 10000 })

    // Should see admin panel content
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible()
  })

  test('manager user should redirect to admin panel after sign-in', async ({
    page,
  }) => {
    await page.goto('/auth/signin')

    // Sign in with manager credentials (email contains 'manager')
    await page.fill('#email', 'manager@test.com')
    await page.fill('#password', 'MyReallyStr0ngPassw0rd!!!')
    await page.click('button[type="submit"]')

    // Manager users should be redirected to admin panel
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 10000 })

    // Should see admin panel content
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible()
  })

  test('public user should redirect to homepage after sign-in', async ({ page }) => {
    await page.goto('/auth/signin')

    // Sign in with public user credentials (no special role keyword)
    await page.fill('#email', 'user@test.com')
    await page.fill('#password', 'MyReallyStr0ngPassw0rd!!!')
    await page.click('button[type="submit"]')

    // Public users should be redirected to homepage
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Should see homepage content
    await expect(
      page.getByRole('heading', { name: /welcome|tournaments/i })
    ).toBeVisible()
  })

  test('new signup should always redirect to homepage regardless of email', async ({
    page,
  }) => {
    // Set bypass flag for this signup test specifically
    await page.addInitScript(() => {
      window.localStorage.setItem('bypassAuthCallback', 'true')
    })

    await page.goto('/auth/signup')

    // Sign up with admin-looking email (but should still go to homepage for new users)
    const newUser = {
      email: 'admin-new@test.com', // Contains 'admin' but is a new signup
      password: 'MyReallyStr0ngPassw0rd!!!',
    }

    await page.fill('#email', newUser.email)
    await page.fill('#password', newUser.password)
    await page.fill('#confirmPassword', newUser.password)
    await page.click('button[type="submit"]')

    // New signups should always go to homepage (PUBLIC role)
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Should see homepage content
    await expect(
      page.getByRole('heading', { name: /welcome|tournaments/i })
    ).toBeVisible()
  })

  test('custom redirect parameter should be respected for public users', async ({
    page,
  }) => {
    const customRedirect = '/teams'
    await page.goto(`/auth/signin?redirectTo=${encodeURIComponent(customRedirect)}`)

    // Sign in with public user credentials
    await page.fill('#email', 'user@test.com')
    await page.fill('#password', 'MyReallyStr0ngPassw0rd!!!')
    await page.click('button[type="submit"]')

    // Public users should be redirected to custom destination
    await expect(page).toHaveURL(customRedirect, { timeout: 10000 })
  })

  test('admin users should override custom redirect and go to admin panel', async ({
    page,
  }) => {
    const customRedirect = '/teams'
    await page.goto(`/auth/signin?redirectTo=${encodeURIComponent(customRedirect)}`)

    // Sign in with admin credentials
    await page.fill('#email', 'admin@test.com')
    await page.fill('#password', 'MyReallyStr0ngPassw0rd!!!')
    await page.click('button[type="submit"]')

    // Admin users should be redirected to admin panel, ignoring custom redirect
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 10000 })
  })
})
