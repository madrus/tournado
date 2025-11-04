import { promises as fs } from 'node:fs'

import { http, HttpResponse } from 'msw'

import {
  ensureOutboxDirAsync,
  OUTBOX_PATH,
  type TestEmailOutboxEntry,
} from '~/utils/email-testing.server'

import { createMutex } from '~test/utils/asyncLock'

// Helper to read the outbox file
async function readOutbox(): Promise<TestEmailOutboxEntry[]> {
  await ensureOutboxDirAsync()
  try {
    const content = await fs.readFile(OUTBOX_PATH, 'utf-8')
    return JSON.parse(content) as TestEmailOutboxEntry[]
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const err = error as { code?: string }
      if (err.code !== 'ENOENT') {
        console.error('Failed to read email outbox:', error)
      }
    }
    return []
  }
}

// Helper to write to the outbox file
async function writeOutbox(emails: TestEmailOutboxEntry[]): Promise<void> {
  await ensureOutboxDirAsync()
  try {
    await fs.writeFile(OUTBOX_PATH, JSON.stringify(emails, null, 2))
  } catch (error) {
    console.error('Failed to write email outbox:', error)
    throw error
  }
}

const runWithOutboxLock = createMutex()

export const emailHandlers = [
  // Intercepts Resend API calls during tests and captures emails to the file-based outbox.
  // This handler enables E2E tests to verify email sending without making real API calls.
  http.post('https://api.resend.com/emails', async ({ request }) => {
    const emailData = (await request.json()) as unknown
    try {
      const capturedEmail = await addEmailToOutbox(emailData as Record<string, unknown>)

      const typedEmailData = emailData as Record<string, unknown>
      console.info(
        `[MSW] Captured email to: ${typedEmailData.to}, subject: ${typedEmailData.subject}`
      )

      return HttpResponse.json({
        id: capturedEmail.id,
        from: capturedEmail.from,
        to: capturedEmail.to,
        created_at: capturedEmail.timestamp,
      })
    } catch (error) {
      console.error('Failed to capture email via MSW handler:', error)
      return HttpResponse.json({ error: 'Failed to capture email' }, { status: 500 })
    }
  }),
]

// Get all emails from the file system outbox
export const getEmailOutbox = () => runWithOutboxLock(() => readOutbox())

// Clear the file system outbox
export const clearEmailOutbox = () =>
  runWithOutboxLock(async () => {
    try {
      await fs.unlink(OUTBOX_PATH)
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        const err = error as { code?: string }
        if (err.code === 'ENOENT') {
          return
        }
      }
      console.error('Failed to clear email outbox:', error)
      throw error
    }
  })

// Add an email to the file system outbox
export const addEmailToOutbox = async (
  emailData: Record<string, unknown>
): Promise<TestEmailOutboxEntry> =>
  runWithOutboxLock(async (): Promise<TestEmailOutboxEntry> => {
    const outbox = await readOutbox()
    const capturedEmail: TestEmailOutboxEntry = {
      from: String(emailData.from || ''),
      to: emailData.to as string | string[],
      subject: String(emailData.subject || ''),
      html: String(emailData.html || ''),
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }
    outbox.push(capturedEmail)
    await writeOutbox(outbox)
    return capturedEmail
  })
