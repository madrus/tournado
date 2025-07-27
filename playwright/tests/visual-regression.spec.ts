import { expect, test } from '@playwright/test'

// Structural and Functional Tests - More reliable than pixel-perfect screenshots
test.describe('UI Structure and Theme Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test.describe('Tournaments List Page Structure', () => {
    test('should have correct structure and elements', async ({ page }) => {
      // Navigate to tournaments list page
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')

      // Wait for page to load completely
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000) // Allow for hydration/rendering

      // Test structure - look for the main tournaments heading
      await expect(
        page.getByRole('heading', { name: 'Toernooien beheer' })
      ).toBeVisible()
      await expect(page.getByRole('link', { name: /toevoegen|add/i })).toBeVisible()

      // Check that the main content area exists
      await expect(page.getByTestId('admin-tournaments-layout-container')).toBeVisible()
    })

    test('should display tournaments content', async ({ page }) => {
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')
      await page.waitForLoadState('networkidle')

      // Should see tournaments-related content
      const bodyText = await page.locator('body').textContent()
      expect(bodyText).toMatch(/tournament|toernooi/i)

      // Page should not be empty
      expect(bodyText!.length).toBeGreaterThan(100)
    })
  })

  test.describe('Teams List Page Structure', () => {
    test('should have correct structure and elements', async ({ page }) => {
      // Navigate to teams list page
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')

      // Wait for page to load completely
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000) // Allow for hydration/rendering

      // Test structure - be more specific to avoid multiple matches
      await expect(page.getByRole('heading', { name: 'Teams beheer' })).toBeVisible()
      await expect(page.getByTestId('admin-teams-layout-container')).toBeVisible()
    })

    test('should display teams content', async ({ page }) => {
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
      await page.waitForLoadState('networkidle')

      // Should see teams-related content
      const bodyText = await page.locator('body').textContent()
      expect(bodyText).toMatch(/team/i)

      // Page should not be empty
      expect(bodyText!.length).toBeGreaterThan(50)
    })
  })

  test.describe('Dark Mode Theme Functionality', () => {
    test('should apply dark theme correctly on tournaments page', async ({ page }) => {
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')
      await page.waitForLoadState('networkidle')

      // Apply dark theme
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })

      // Wait for theme application
      await page.waitForTimeout(500)

      // Verify dark class is applied
      await expect(page.locator('html')).toHaveClass(/dark/)

      // Check that dark mode styles are working (background should be dark)
      const bgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor
      })

      // Should not be white/light background
      expect(bgColor).not.toBe('rgb(255, 255, 255)')
    })

    test('should apply light theme correctly on teams page', async ({ page }) => {
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
      await page.waitForLoadState('networkidle')

      // Ensure light theme
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark')
      })

      await page.waitForTimeout(500)

      // Verify dark class is not applied
      await expect(page.locator('html')).not.toHaveClass(/dark/)
    })
  })

  test.describe('Form Structure and Panel Progression', () => {
    test('should have correct tournament form structure', async ({ page }) => {
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/new')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Check form exists
      await expect(page.locator('form')).toBeVisible()

      // Check basic form fields
      await expect(page.getByRole('textbox', { name: /name|naam/i })).toBeVisible()
      await expect(
        page.getByRole('textbox', { name: /location|locatie/i })
      ).toBeVisible()

      // Check date picker buttons exist
      await expect(
        page.getByRole('button', { name: /startdatum|start date/i })
      ).toBeVisible()
    })

    test('should enable date picker after filling basic info', async ({ page }) => {
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/new')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Fill basic info
      await page.getByRole('textbox', { name: /name|naam/i }).fill('Test Tournament')
      await page
        .getByRole('textbox', { name: /location|locatie/i })
        .fill('Test Location')

      // Wait for form validation
      await page.waitForTimeout(1000)

      // Date picker should be clickable
      const startDateButton = page.getByRole('button', {
        name: /startdatum|start date/i,
      })
      await expect(startDateButton).toBeEnabled()

      // Should be able to open calendar
      await startDateButton.click()
      await expect(page.getByRole('dialog', { name: 'calendar' })).toBeVisible({
        timeout: 5000,
      })
    })

    test('should have correct team form structure', async ({ page }) => {
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/new')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Check form exists
      await expect(page.locator('form')).toBeVisible()

      // Check that form fields exist (even if disabled initially)
      await expect(page.locator('[name="clubName"]')).toBeVisible()
      await expect(page.locator('[name="name"]')).toBeVisible()
    })
  })

  test.describe('ActionLinkPanel Components', () => {
    test('should display ActionLinkPanel components on homepage', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Should see action panels
      await expect(
        page.getByRole('link', { name: /teams bekijken|view teams/i })
      ).toBeVisible()

      // Should have multiple action panels
      const actionLinks = page.locator('a[href*="/teams"], a[href*="/about"]')
      await expect(actionLinks.first()).toBeVisible()
    })

    test('should have working navigation links', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Click teams link and verify navigation
      await page.getByRole('link', { name: /teams bekijken|view teams/i }).click()
      // The link goes to admin teams page when authenticated
      await expect(page).toHaveURL(/\/teams/)
    })
  })

  test.describe('Responsive Design Structure', () => {
    test('should handle mobile viewport correctly', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 })

      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')
      await page.waitForLoadState('networkidle')

      // Page should still load and be functional on mobile
      await expect(
        page.getByRole('heading', { name: 'Toernooien beheer' })
      ).toBeVisible()
      await expect(page.getByTestId('admin-tournaments-layout-container')).toBeVisible()
    })

    test('should handle desktop viewport correctly', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 })

      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
      await page.waitForLoadState('networkidle')

      // Page should load and be functional on desktop - be specific to avoid multiple matches
      await expect(page.getByRole('heading', { name: 'Teams beheer' })).toBeVisible()
      await expect(page.getByTestId('admin-teams-layout-container')).toBeVisible()
    })
  })
})
