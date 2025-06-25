import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { createAdminUser, createRegularUser } from '../helpers/database'
import { createValidTestEmail } from '../helpers/test-utils'

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

    // 1. Register new user
    await page.goto('/auth/signup')
    await page.waitForLoadState('networkidle')

    // Screenshot: Signup page loaded
    await page.screenshot({
      path: 'playwright-results/01-signup-page.png',
      fullPage: true,
    })

    // Fill firstName using clean approach
    const firstNameField = page.locator('#firstName')
    await firstNameField.clear()
    await firstNameField.fill(newUser.firstName)
    await firstNameField.blur()

    // Verify firstName was filled correctly
    const actualFirstName = await firstNameField.inputValue()
    if (actualFirstName !== newUser.firstName) {
      console.log(
        `- firstName field mismatch. Expected: "${newUser.firstName}", Got: "${actualFirstName}"`
      )
      throw new Error(
        `FirstName field truncated. Expected: "${newUser.firstName}", Got: "${actualFirstName}"`
      )
    }
    console.log(`- firstName filled successfully: "${actualFirstName}"`)

    // Fill other fields normally
    await page.locator('#lastName').fill(newUser.lastName)
    await page.locator('#email').fill(newUser.email)
    await page.locator('#password').fill(newUser.password)

    // Verify all fields before submission
    await expect(page.locator('#firstName')).toHaveValue(newUser.firstName)
    await expect(page.locator('#lastName')).toHaveValue(newUser.lastName)

    // Screenshot: Form filled out
    await page.screenshot({
      path: 'playwright-results/02-form-filled.png',
      fullPage: true,
    })

    // Submit with proper wait - using Dutch text "Account aanmaken"
    await Promise.all([
      page.waitForURL('/auth/signin'),
      page.getByRole('button', { name: 'Account aanmaken' }).click(),
    ])

    // Screenshot: After signup redirect
    await page.screenshot({
      path: 'playwright-results/03-after-signup.png',
      fullPage: true,
    })

    // 2. Sign in with newly created user
    await page.locator('#email').fill(newUser.email)
    await page.locator('#password').fill(newUser.password)

    // Wait for form to be ready and submit
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Inloggen' }).click()

    // 3. Verify redirect to admin panel
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 5000 })

    // 4. Verify user is signed in by checking menu
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(
      page.getByTestId('user-menu-dropdown').getByText(newUser.email)
    ).toBeVisible({ timeout: 5000 })
  })

  test('should sign in as regular user and verify menu options', async ({ page }) => {
    // 1. Create regular user (non-admin)
    const regularUser = await createRegularUser()

    // 2. Sign in as regular user
    await page.goto('/auth/signin')
    await page.waitForLoadState('networkidle')

    await page.locator('#email').fill(regularUser.email)
    await page.locator('#password').fill('MyReallyStr0ngPassw0rd!!!')

    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Inloggen' }).click()

    // 3. Verify redirect to admin panel (all users go to admin panel after login)
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 5000 })

    // 4. Open context menu and verify menu options
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible({ timeout: 5000 })

    // 5. Verify regular user menu: should have sign out but NO tournaments management
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

    // 2. Sign in as admin user
    await page.goto('/auth/signin')
    await page.waitForLoadState('networkidle')

    await page.locator('#email').fill(adminUser.email)
    await page.locator('#password').fill('MyReallyStr0ngPassw0rd!!!')

    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Inloggen' }).click()

    // 3. Verify redirect to admin panel
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 5000 })

    // 4. Open context menu and verify admin menu options
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible({ timeout: 5000 })

    // 5. Verify admin menu: should have tournaments management option
    await expect(
      page.getByTestId('user-menu-dropdown').getByText('Toernooien')
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Uitloggen' })).toBeVisible()
  })

  test('should sign out user and redirect to home page without login page', async ({
    page,
  }) => {
    // 1. Create and sign in a user
    const user = await createAdminUser()

    await page.goto('/auth/signin')
    await page.waitForLoadState('networkidle')

    await page.locator('#email').fill(user.email)
    await page.locator('#password').fill('MyReallyStr0ngPassw0rd!!!')

    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Inloggen' }).click()

    // Verify we're signed in
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 5000 })

    // 2. Sign out
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: 'Uitloggen' }).click()

    // 3. Verify redirect to home page (not login page)
    await expect(page).toHaveURL('/', { timeout: 5000 })

    // 4. Wait for page to settle and verify user is signed out
    await page.waitForLoadState('networkidle')

    // 5. Verify user is signed out by checking menu shows login option
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible({ timeout: 5000 })

    // Should see login link instead of user email
    await expect(page.getByRole('link', { name: 'Inloggen' })).toBeVisible()
    await expect(page.getByText(user.email)).not.toBeVisible()
  })
})
