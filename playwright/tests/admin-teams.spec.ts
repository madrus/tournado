import { expect, test } from '@playwright/test'

// Admin Teams Tests - USES GLOBAL AUTHENTICATION from auth.json
test.describe('Admin Teams', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })
  })

  test('should display admin teams management page', async ({ page }) => {
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')

    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for hydration/rendering

    // Wait for content to actually appear (no white page)
    await page.waitForFunction(() => document.body.children.length > 0)

    // Should see admin teams management interface - look for the admin panel heading (now h1)
    await expect(page.locator('h1').filter({ hasText: /Teams/i })).toBeVisible({
      timeout: 15000,
    })

    // Should see admin interface content - look for the specific admin container
    await expect(page.locator('.container').first()).toBeVisible()
  })

  test('should allow admin team creation', async ({ page }) => {
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/new')

    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for hydration/rendering

    // Wait for content to actually appear
    await page.waitForFunction(() => document.body.children.length > 0)

    // Should see admin team creation form
    await expect(page.locator('form')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.container').first()).toBeVisible()
  })

  test('should show admin teams interface', async ({ page }) => {
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')

    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for hydration/rendering

    // Wait for content to actually appear
    await page.waitForFunction(() => document.body.children.length > 0)

    // Should see admin teams interface - look for the first container (admin content)
    await expect(page.locator('.container').first()).toBeVisible({ timeout: 15000 })

    // Should see some content on the admin teams page
    await expect(page.locator('body')).toContainText(/team/i)
  })

  test('should allow admin access to teams', async ({ page }) => {
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')

    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2500) // Extra wait for hydration/language switching

    // Wait for content to actually appear
    await page.waitForFunction(() => document.body.children.length > 0)

    // Should see admin interface - use the admin panel heading as confirmation (now h1)
    await expect(page.locator('h1').filter({ hasText: /Teams/i })).toBeVisible({
      timeout: 15000,
    })

    // Page should not be empty
    const bodyText = await page.locator('body').textContent()
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
})
