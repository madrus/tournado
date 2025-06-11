/* eslint-disable no-console */
import { type Page } from '@playwright/test'

/**
 * Debug helpers for visual test debugging
 */

export async function takeDebugScreenshot(
  page: Page,
  name: string,
  step?: string
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `playwright-results/debug-${name}-${step || 'step'}-${timestamp}.png`
  console.log(`📸 Taking debug screenshot: ${filename}`)
  await page.screenshot({ path: filename, fullPage: true })
  console.log(`📸 Screenshot saved: ${filename}`)
}

export async function takeElementScreenshot(
  page: Page,
  selector: string,
  name: string
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `playwright-results/element-${name}-${timestamp}.png`
  console.log(`📸 Taking element screenshot: ${filename}`)
  await page.locator(selector).screenshot({ path: filename })
  console.log(`📸 Element screenshot saved: ${filename}`)
}

export async function logPageState(page: Page, context?: string): Promise<void> {
  const url = page.url()
  const title = await page.title()
  console.log(`🔍 Page State${context ? ` (${context})` : ''}:`)
  console.log(`   URL: ${url}`)
  console.log(`   Title: ${title}`)

  // Log any visible error messages
  const errors = await page
    .locator('[role="alert"], .error, .text-red-500')
    .allTextContents()
  if (errors.length > 0) {
    console.log(`   Errors: ${errors.join(', ')}`)
  }
}

export async function logFormState(page: Page, formSelector?: string): Promise<void> {
  const form = formSelector ? page.locator(formSelector) : page.locator('form').first()

  // Get all input values
  const inputs = await form.locator('input').all()
  console.log(`📝 Form State:`)

  for (const input of inputs) {
    const id = await input.getAttribute('id')
    const name = await input.getAttribute('name')
    const type = await input.getAttribute('type')
    const value = await input.inputValue()
    const identifier = id || name || type
    console.log(`   ${identifier}: "${value}"`)
  }
}

export async function waitAndScreenshot(
  page: Page,
  name: string,
  waitFor?: () => Promise<void>
): Promise<void> {
  if (waitFor) {
    await waitFor()
  }
  await takeDebugScreenshot(page, name)
}

export async function debugScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `debug-${name}-${timestamp}.png`
  console.log(`Taking debug screenshot: ${filename}`)
  await page.screenshot({ path: `test-results/debug/${filename}`, fullPage: true })
}

export async function debugPageContent(page: Page, step: string): Promise<void> {
  console.log(`\n=== DEBUG: ${step} ===`)
  console.log('Current URL:', page.url())

  // Log page title
  const title = await page.title()
  console.log('Page title:', title)

  // Take screenshot
  await debugScreenshot(page, step.toLowerCase().replace(/\s+/g, '-'))

  // Log any console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Page error:', msg.text())
    }
  })
}

export async function debugElement(
  page: Page,
  selector: string,
  description?: string
): Promise<void> {
  const element = page.locator(selector)
  const count = await element.count()

  console.log(`\n=== DEBUG ELEMENT: ${description || selector} ===`)
  console.log(`Selector: ${selector}`)
  console.log(`Count: ${count}`)

  if (count > 0) {
    const isVisible = await element.first().isVisible()
    const isEnabled = await element.first().isEnabled()
    console.log(`Visible: ${isVisible}`)
    console.log(`Enabled: ${isEnabled}`)

    try {
      const text = await element.first().textContent()
      console.log(`Text content: "${text}"`)
    } catch (error) {
      console.log(`Could not get text content: ${error}`)
    }
  }
}

export async function debugWaitForElement(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<void> {
  console.log(`\n=== WAITING FOR ELEMENT: ${selector} ===`)
  try {
    await page.waitForSelector(selector, { timeout })
    console.log(`✅ Element found: ${selector}`)
  } catch (error) {
    console.log(`❌ Element not found within ${timeout}ms: ${selector}`)
    await debugElement(page, selector)
    throw error
  }
}
