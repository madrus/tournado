/**
 * User Management Workflow E2E Tests
 *
 * Test Scenarios:
 * - Admin users management page display
 * - Users list interface and table visibility
 * - User detail page navigation
 * - User information display on detail page
 * - Update user display name
 * - Change user role (with validation)
 * - Deactivate and reactivate users
 * - Audit log list display
 * - Self-role change prevention
 * - Self-deactivation prevention
 * - Direct URL navigation to user details
 * - Accessibility verification (headings, form structure, ARIA)
 *
 * Authentication: Uses global auth from auth.json (ADMIN role)
 * Viewport: Mobile (375x812)
 * Note: Comprehensive user management workflow testing
 */
import { expect, test } from '@playwright/test'

import { AdminUsersPage } from '../pages/AdminUsersPage'

// User Management E2E Tests - USES GLOBAL AUTHENTICATION from auth.json
// Tests the complete user management workflow including:
// - Viewing user list
// - Viewing user details
// - Updating user display name
// - Changing user role
// - Deactivating/reactivating users
// - Viewing audit logs
// - Self-edit prevention

test.describe('User Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
  })

  test('should display admin users management page', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page)

    await adminUsersPage.goto()
    await adminUsersPage.expectToBeOnUsersPage()
  })

  test('should show users interface', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page)

    await adminUsersPage.goto()
    await adminUsersPage.expectUsersInterface()
  })

  test('should display users in the list', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page)

    await adminUsersPage.goto()
    await adminUsersPage.expectPageLoaded()

    // Verify that the users table is visible
    await expect(adminUsersPage.usersTable).toBeVisible()

    // Page should have substantial content
    const bodyText = await adminUsersPage.bodyContent.textContent()
    expect(bodyText).toBeTruthy()
    expect(bodyText!.length).toBeGreaterThan(50)
  })

  test('should navigate to user detail page', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page)

    await adminUsersPage.goto()
    await adminUsersPage.expectPageLoaded()

    // Get the first user row from the table
    const firstRow = page.locator('table tbody tr').first()
    await expect(firstRow).toBeVisible()

    // Click on the first user row
    await firstRow.click()
    await page.waitForLoadState('networkidle')

    // Should navigate to user detail page
    await expect(page.url()).toContain('/a7k9m2x5p8w1n4q6r3y8b5t1/users/')

    // Should show user detail card
    await expect(adminUsersPage.userDetailCard).toBeVisible()
  })

  test('should display user information on detail page', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page)

    await adminUsersPage.goto()
    await adminUsersPage.expectPageLoaded()

    // Navigate to first user
    const firstRow = page.locator('table tbody tr').first()
    await firstRow.click()
    await page.waitForLoadState('networkidle')

    // Verify user detail card elements are visible
    await expect(adminUsersPage.userDetailCard).toBeVisible()
    await expect(adminUsersPage.displayNameInput).toBeVisible()
    await expect(adminUsersPage.roleCombobox).toBeVisible()

    // Either deactivate or reactivate button should be visible depending on user status
    const deactivateVisible = await adminUsersPage.deactivateButton.isVisible()
    const reactivateVisible = await adminUsersPage.reactivateButton.isVisible()
    expect(deactivateVisible || reactivateVisible).toBe(true)
  })

  test('should update user display name', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page)

    await adminUsersPage.goto()
    await adminUsersPage.expectPageLoaded()

    // Navigate to first user
    const firstRow = page.locator('table tbody tr').first()
    await firstRow.click()
    await page.waitForLoadState('networkidle')

    // Get current display name
    const currentName = await adminUsersPage.displayNameInput.inputValue()

    // Update display name
    const newName = `Updated Name ${Date.now()}`
    await adminUsersPage.displayNameInput.clear()
    await adminUsersPage.displayNameInput.fill(newName)
    await adminUsersPage.displayNameInput.blur()

    // Wait for the update to complete
    await page.waitForTimeout(1000)

    // Verify success redirect or toast message
    const url = page.url()
    expect(url).toContain('success=displayName')

    // Verify the display name was updated
    await expect(adminUsersPage.displayNameInput).toHaveValue(newName)

    // Restore original name
    await adminUsersPage.displayNameInput.clear()
    await adminUsersPage.displayNameInput.fill(currentName)
    await adminUsersPage.displayNameInput.blur()
  })

  test('should display audit log list', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page)

    await adminUsersPage.goto()
    await adminUsersPage.expectPageLoaded()

    // Navigate to first user
    const firstRow = page.locator('table tbody tr').first()
    await firstRow.click()
    await page.waitForLoadState('networkidle')

    // Verify audit log is visible
    await adminUsersPage.expectAuditLogVisible()
  })

  test('should change user role', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page)

    await adminUsersPage.goto()
    await adminUsersPage.expectPageLoaded()

    // Find a user who is not the current admin (to avoid self-role change)
    const rows = page.locator('table tbody tr')
    const rowCount = await rows.count()

    let targetRow = null
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const roleCell = row.locator('td').nth(1) // Assuming role is in second column
      const roleText = await roleCell.textContent()

      // Skip if this is an ADMIN (to avoid testing on current user)
      if (!roleText?.includes('ADMIN')) {
        targetRow = row
        break
      }
    }

    if (targetRow) {
      await targetRow.click()
      await page.waitForLoadState('networkidle')

      // Get current role
      const currentRole = await adminUsersPage.roleCombobox.inputValue()

      // Change role to a different value
      const newRole = currentRole === 'PUBLIC' ? 'MANAGER' : 'PUBLIC'
      await adminUsersPage.roleCombobox.selectOption(newRole)

      // Wait for the update to complete
      await page.waitForTimeout(1000)

      // Verify success redirect
      const url = page.url()
      expect(url).toContain('success=role')

      // Restore original role
      await adminUsersPage.roleCombobox.selectOption(currentRole)
    }
  })

  test('should deactivate and reactivate user', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page)

    await adminUsersPage.goto()
    await adminUsersPage.expectPageLoaded()

    // Find an active user who is not ADMIN (to avoid deactivating current user)
    const rows = page.locator('table tbody tr')
    const rowCount = await rows.count()

    let targetRow = null
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const roleCell = row.locator('td').nth(1)
      const roleText = await roleCell.textContent()

      if (!roleText?.includes('ADMIN')) {
        targetRow = row
        break
      }
    }

    if (targetRow) {
      await targetRow.click()
      await page.waitForLoadState('networkidle')

      // Check if deactivate button is visible (user is active)
      const isActive = await adminUsersPage.deactivateButton.isVisible()

      if (isActive) {
        // Test deactivation
        await adminUsersPage.deactivateButton.click()
        await adminUsersPage.confirmButton.click()
        await page.waitForLoadState('networkidle')

        // Verify success redirect
        let url = page.url()
        expect(url).toContain('success=deactivate')

        // Verify user is deactivated
        await adminUsersPage.expectUserDeactivated()

        // Test reactivation
        await adminUsersPage.reactivateButton.click()
        await adminUsersPage.confirmButton.click()
        await page.waitForLoadState('networkidle')

        // Verify success redirect
        url = page.url()
        expect(url).toContain('success=reactivate')

        // Verify user is reactivated
        await adminUsersPage.expectUserActivated()
      } else {
        // User is inactive, test reactivation first
        await adminUsersPage.reactivateButton.click()
        await adminUsersPage.confirmButton.click()
        await page.waitForLoadState('networkidle')

        // Verify success redirect
        let url = page.url()
        expect(url).toContain('success=reactivate')

        // Verify user is reactivated
        await adminUsersPage.expectUserActivated()

        // Then test deactivation
        await adminUsersPage.deactivateButton.click()
        await adminUsersPage.confirmButton.click()
        await page.waitForLoadState('networkidle')

        // Verify success redirect
        url = page.url()
        expect(url).toContain('success=deactivate')

        // Verify user is deactivated
        await adminUsersPage.expectUserDeactivated()

        // Restore to active state
        await adminUsersPage.reactivateButton.click()
        await adminUsersPage.confirmButton.click()
      }
    }
  })

  test('should prevent self-role change', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page)

    // The test user is an ADMIN, so we need to navigate to their own user detail page
    // Since we're authenticated as ADMIN, we can test self-role change prevention

    await adminUsersPage.goto()
    await adminUsersPage.expectPageLoaded()

    // Find the row for the current ADMIN user
    const rows = page.locator('table tbody tr')
    const rowCount = await rows.count()

    let adminRow = null
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const roleCell = row.locator('td').nth(1)
      const roleText = await roleCell.textContent()

      if (roleText?.includes('ADMIN')) {
        adminRow = row
        break
      }
    }

    if (adminRow) {
      await adminRow.click()
      await page.waitForLoadState('networkidle')

      // Try to change own role
      const currentRole = await adminUsersPage.roleCombobox.inputValue()
      const newRole = currentRole === 'ADMIN' ? 'PUBLIC' : 'ADMIN'

      await adminUsersPage.roleCombobox.selectOption(newRole)
      await page.waitForTimeout(1000)

      // Should stay on the same page or show error (not redirect with success)
      const url = page.url()
      expect(url).not.toContain('success=role')

      // Role should not have changed
      const roleAfterAttempt = await adminUsersPage.roleCombobox.inputValue()
      expect(roleAfterAttempt).toBe(currentRole)
    }
  })

  test('should prevent self-deactivation', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page)

    await adminUsersPage.goto()
    await adminUsersPage.expectPageLoaded()

    // Find the current ADMIN user
    const rows = page.locator('table tbody tr')
    const rowCount = await rows.count()

    let adminRow = null
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const roleCell = row.locator('td').nth(1)
      const roleText = await roleCell.textContent()

      if (roleText?.includes('ADMIN')) {
        adminRow = row
        break
      }
    }

    if (adminRow) {
      await adminRow.click()
      await page.waitForLoadState('networkidle')

      // Check if user is active
      const isActive = await adminUsersPage.deactivateButton.isVisible()

      if (isActive) {
        // Try to deactivate self
        await adminUsersPage.deactivateButton.click()
        await adminUsersPage.confirmButton.click()
        await page.waitForTimeout(1000)

        // Should not redirect with success
        const url = page.url()
        expect(url).not.toContain('success=deactivate')

        // User should still be active
        await expect(adminUsersPage.deactivateButton).toBeVisible()
      }
    }
  })

  test('should handle direct URL navigation to user detail', async ({ page }) => {
    // Test accessing a specific user via direct URL
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/users/test-user-id')

    // Should stay on admin route structure (might show error if user doesn't exist)
    const url = page.url()
    expect(url).toContain('/a7k9m2x5p8w1n4q6r3y8b5t1/users')

    // Should see some interface (either user details or error page)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should maintain proper accessibility on users list page', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page)

    await adminUsersPage.goto()
    await adminUsersPage.expectPageLoaded()

    // Check for proper heading hierarchy
    const heading = page.getByRole('heading', { name: /gebruikers beheer/i, level: 1 })
    await expect(heading).toBeVisible()

    // Verify table has proper ARIA structure
    await expect(adminUsersPage.usersTable).toHaveAttribute('role', 'table')
  })

  test('should maintain proper accessibility on user detail page', async ({ page }) => {
    const adminUsersPage = new AdminUsersPage(page)

    await adminUsersPage.goto()
    await adminUsersPage.expectPageLoaded()

    // Navigate to first user
    const firstRow = page.locator('table tbody tr').first()
    await firstRow.click()
    await page.waitForLoadState('networkidle')

    // Check for proper form structure
    await expect(adminUsersPage.displayNameInput).toHaveAttribute('name', 'displayName')
    await expect(adminUsersPage.roleCombobox).toHaveAttribute('name', 'role')

    // Verify buttons have proper accessibility
    const actionButton = page.getByRole('button').first()
    await expect(actionButton).toBeVisible()
  })
})
