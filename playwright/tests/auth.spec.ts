import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { createAdminUser, createRegularUser } from '../helpers/database'
import { createValidTestEmail } from '../helpers/test-utils'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { SignupPage } from '../pages/SignupPage'

// This test file runs without stored auth state to test actual authentication
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistency
    await page.setViewportSize({ width: 375, height: 812 })

    // Language is handled by global config - no need to override here
    // The i18n config will use Dutch for Playwright tests
  })

  test('should register new user and sign in with redirect to admin panel', async ({
    page,
  }) => {
    const newUser = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: createValidTestEmail(),
      password: 'MyReallyStr0ngPassw0rd!!!',
    }

    // 1. Register new user using SignupPage
    const signupPage = new SignupPage(page)
    await signupPage.register(newUser)

    // 2. Sign in with newly created user using LoginPage
    const loginPage = new LoginPage(page)
    await loginPage.expectToBeOnLoginPage()
    await loginPage.login(newUser.email, newUser.password)

    // 3. Verify redirect to admin panel and authentication
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 5000 })
    await loginPage.verifyAuthentication()
  })

  test('should sign in as regular user and verify menu options', async ({ page }) => {
    // 1. Create regular user (non-admin)
    const regularUser = await createRegularUser()

    // 2. Sign in as regular user using LoginPage
    const loginPage = new LoginPage(page)
    await loginPage.login(regularUser.email, 'MyReallyStr0ngPassw0rd!!!')

    // 3. Verify redirect to admin panel (all users go to admin panel after login)
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 5000 })

    // 4. Verify authentication first (this will open menu)
    await loginPage.verifyAuthentication()

    // 5. Menu should be open now, verify regular user menu: should have sign out but NO tournaments management
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: 'Uitloggen' })).toBeVisible()

    // Check that tournaments management option is NOT visible for regular users
    await expect(
      page.getByTestId('user-menu-dropdown').getByText('Toernooien')
    ).not.toBeVisible()
  })

  test('should sign in as admin user and verify admin menu options', async ({
    page,
  }) => {
    // 1. Create admin user
    const adminUser = await createAdminUser()

    // 2. Sign in as admin user using LoginPage
    const loginPage = new LoginPage(page)
    await loginPage.login(adminUser.email, 'MyReallyStr0ngPassw0rd!!!')

    // 3. Verify redirect to admin panel
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 5000 })

    // 4. Verify authentication first (this will open menu)
    await loginPage.verifyAuthentication()

    // 5. Menu should be open now, verify admin menu: should have tournaments management option
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible({ timeout: 5000 })
    await expect(
      page.getByTestId('user-menu-dropdown').getByText('Toernooien')
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Uitloggen' })).toBeVisible()
  })

  test('should handle authentication with existing account from homepage', async ({
    page,
  }) => {
    // Create admin user
    const testUser = await createAdminUser()

    const homePage = new HomePage(page)
    const loginPage = new LoginPage(page)

    // 1. Start from homepage
    await homePage.goto()
    await homePage.expectToBeOnHomePage()

    // 2. Navigate to sign in from homepage menu
    // Wait for page to be fully loaded and interactive
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Allow for any hydration/JavaScript loading

    // Find and click the toggle menu button with better error handling
    const toggleButton = page.getByRole('button', { name: 'Toggle menu' })
    await toggleButton.waitFor({ state: 'visible', timeout: 10000 })
    await toggleButton.scrollIntoViewIfNeeded()

    // Ensure button is clickable
    await expect(toggleButton).toBeEnabled()
    await toggleButton.click()

    // Wait for menu to appear and then click login link
    await page.waitForTimeout(500) // Allow menu animation
    const loginLink = page.getByRole('link', { name: 'Inloggen' })
    await loginLink.waitFor({ state: 'visible', timeout: 5000 })
    await loginLink.click()

    // 3. Should be on signin page
    await loginPage.expectToBeOnLoginPage()

    // 4. Login with test user
    await loginPage.login(testUser.email, 'MyReallyStr0ngPassw0rd!!!')

    // 5. Verify authentication and redirect
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
    await loginPage.verifyAuthentication()

    // 6. Test sign out - menu should already be open from verifyAuthentication
    const userDropdown = page.getByTestId('user-menu-dropdown')
    const isDropdownVisible = await userDropdown.isVisible().catch(() => false)

    if (!isDropdownVisible) {
      await page.getByRole('button', { name: 'Toggle menu' }).click()
    }

    await page.getByRole('button', { name: 'Uitloggen' }).click()
    await expect(page).toHaveURL('/')
  })

  test('should sign out user and redirect to home page without login page', async ({
    page,
  }) => {
    // 1. Create and sign in a user using LoginPage
    const user = await createAdminUser()
    const loginPage = new LoginPage(page)

    await loginPage.login(user.email, 'MyReallyStr0ngPassw0rd!!!')

    // Verify we're signed in
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 5000 })

    // 2. Verify authentication first (this will open menu)
    await loginPage.verifyAuthentication()

    // 3. Menu should be open now, sign out directly
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Uitloggen' }).click()

    // 4. Verify redirect to home page (not login page)
    await expect(page).toHaveURL('/', { timeout: 5000 })

    // 5. Wait for page to settle and verify user is signed out
    await page.waitForLoadState('networkidle')

    // 6. Verify user is signed out by checking menu shows login option
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible({ timeout: 5000 })

    // Should see login link instead of user email
    await expect(page.getByRole('link', { name: 'Inloggen' })).toBeVisible()
    await expect(page.getByText(user.email)).not.toBeVisible()
  })
})
