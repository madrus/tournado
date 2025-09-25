// Direct access to MSW email handlers - no HTTP requests needed!
import { clearEmailOutbox, getEmailOutbox } from '../../mocks/handlers/emails.js'

export type CapturedEmail = {
  to: string | string[]
  from: string
  subject: string
  html: string
  id: string
  timestamp: string
}

export async function fetchCapturedEmails(): Promise<CapturedEmail[]> {
  return getEmailOutbox()
}

export async function clearCapturedEmails(): Promise<void> {
  clearEmailOutbox()
}

export async function waitForEmailsCount(
  expectedCount: number,
  timeoutMs: number = 5000
): Promise<CapturedEmail[]> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeoutMs) {
    const emails = getEmailOutbox()
    if (emails.length >= expectedCount) {
      return emails
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const emails = getEmailOutbox()
  throw new Error(
    `Timeout waiting for ${expectedCount} emails. Found ${emails.length} emails after ${timeoutMs}ms`
  )
}
