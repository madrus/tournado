import { getApiClient } from '../utils/api-client'

const TEST_EMAIL_URL = 'http://localhost:8811/test/emails'

export type CapturedEmail = {
  to: string | string[]
  from: string
  subject: string
  html: string
  id: string
  timestamp: string
}

/**
 * Fetches captured emails from the server's test endpoint.
 */
export async function fetchCapturedEmails(): Promise<CapturedEmail[]> {
  const apiClient = await getApiClient()
  const response = await apiClient.get(TEST_EMAIL_URL)
  if (!response.ok()) {
    const status = response.status()
    const statusText = response.statusText()
    const body = await response.text()
    const message = `Failed to fetch emails (${status} ${statusText}): ${body}`
    throw new Error(message)
  }
  return response.json()
}

/**
 * Clears captured emails on the server via the test endpoint.
 */
export async function clearCapturedEmails(): Promise<void> {
  const apiClient = await getApiClient()
  await apiClient.delete(TEST_EMAIL_URL)
}

/**
 * Waits for a specific number of emails to be captured.
 * Polls the test endpoint until the condition is met or timeout occurs.
 */
export async function waitForEmailsCount(
  expectedCount: number,
  timeoutMs: number = 10000, // Increased timeout for network requests
): Promise<CapturedEmail[]> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeoutMs) {
    const emails = await fetchCapturedEmails()
    if (emails.length >= expectedCount) {
      return emails
    }
    await new Promise(resolve => setTimeout(resolve, 250)) // Poll every 250ms
  }

  const emails = await fetchCapturedEmails()
  throw new Error(
    `Timeout waiting for ${expectedCount} emails. Found ${emails.length} emails after ${timeoutMs}ms`,
  )
}
