import { expect, test } from '@playwright/test'

test.describe('Profile - User Journey (PUBLIC Role)', () => {
  test('PUBLIC user can access profile from menu', async ({ page }) => {
    const { createTestSession } = await import('../helpers/test-auth')
    const { cookie } = await createTestSession('PUBLIC')

    const cookieMatch = cookie.match(/__session=([^;]+)/)
    if (!cookieMatch) throw new Error('Failed to parse session cookie')

    await page.context().addCookies([
      {
        name: '__session',
        value: cookieMatch[1],
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ])

    // Start at home page
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open user menu
    await page.getByRole('button', { name: /menu/i }).click()
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible({ timeout: 5000 })

    // Click profile link
    await page.getByRole('link', { name: /profiel/i }).click()

    // Verify we're on profile page
    await expect(page).toHaveURL('/profile', { timeout: 5000 })
    await expect(page.getByText('Account Settings')).toBeVisible()
  })

  test('PUBLIC user can navigate directly to profile URL', async ({ page }) => {
    const { createTestSession } = await import('../helpers/test-auth')
    const { cookie } = await createTestSession('PUBLIC')

    const cookieMatch = cookie.match(/__session=([^;]+)/)
    if (!cookieMatch) throw new Error('Failed to parse session cookie')

    await page.context().addCookies([
      {
        name: '__session',
        value: cookieMatch[1],
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ])

    // Navigate directly to profile
    await page.goto('/profile')

    // Should stay on profile page
    await expect(page).toHaveURL('/profile')

    // Verify profile content is visible
    await expect(page.getByText('Account Settings')).toBeVisible()
    await expect(page.getByText('Tournament Access')).toBeVisible()
  })

  test('Unauthenticated user redirected to signin when accessing profile', async ({
    page,
  }) => {
    // Clear any existing cookies
    await page.context().clearCookies()

    // Try to access profile without authentication
    await page.goto('/profile')

    // Should be redirected to signin page
    await expect(page).toHaveURL(/\/auth\/signin/)

    // Should have redirectTo parameter
    await expect(page).toHaveURL(/redirectTo=%2Fprofile/)
  })
})
