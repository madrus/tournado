import { expect, Page } from '@playwright/test'

export async function dismissPwaPromptIfVisible(page: Page): Promise<void> {
  const pwaUpdatePrompt = page.locator('[data-testid="pwa-update-prompt"]')
  const pwaUpdateVisible = await pwaUpdatePrompt.isVisible().catch(() => false)
  if (pwaUpdateVisible) {
    const dismissButton = pwaUpdatePrompt.locator('button').first()
    if (await dismissButton.isVisible().catch(() => false)) {
      await dismissButton.click()
    }
    await expect(pwaUpdatePrompt).not.toBeVisible()
  }
}
