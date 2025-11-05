import fs from 'node:fs'
import path from 'node:path'

import { z } from 'zod'

export const OUTBOX_DIR = path.join(process.cwd(), '.tmp')
export const OUTBOX_PATH = path.join(OUTBOX_DIR, 'email-outbox.json')

export const ensureOutboxDirAsync = async (): Promise<void> => {
  await fs.promises.mkdir(OUTBOX_DIR, { recursive: true })
}

export type TestEmailOutboxEntry = {
  from: string
  to: string | string[]
  subject: string
  html: string
  id: string
  timestamp: string
}

const testEmailOutboxEntrySchema = z.object({
  from: z.string(),
  to: z.union([z.string(), z.array(z.string())]),
  subject: z.string(),
  html: z.string(),
  id: z.string(),
  timestamp: z.string(),
})

const testEmailOutboxSchema = z.array(testEmailOutboxEntrySchema)

export const getTestEmailOutbox = async (): Promise<TestEmailOutboxEntry[]> => {
  await ensureOutboxDirAsync()
  try {
    const content = await fs.promises.readFile(OUTBOX_PATH, 'utf-8')
    const parsed = JSON.parse(content)
    const validationResult = testEmailOutboxSchema.safeParse(parsed)

    if (!validationResult.success) {
      // eslint-disable-next-line no-console
      console.error('Email outbox format is invalid:', validationResult.error)
      return []
    }

    return validationResult.data
  } catch (error) {
    // File doesn't exist or couldn't be read - return empty outbox
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return []
    }
    // eslint-disable-next-line no-console
    console.error('Failed to read email outbox:', error)
    return []
  }
}

export const clearTestEmailOutbox = async (): Promise<void> => {
  await ensureOutboxDirAsync()
  try {
    await fs.promises.unlink(OUTBOX_PATH)
  } catch (error) {
    // Silently ignore if file doesn't exist
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return
    }
    // eslint-disable-next-line no-console
    console.error('Failed to clear email outbox:', error)
  }
}

export const addEmailToOutbox = async (emailData: {
  from?: string
  to: string | string[]
  subject?: string
  html?: string
}): Promise<TestEmailOutboxEntry> => {
  await ensureOutboxDirAsync()

  // Read current outbox
  const outbox = await getTestEmailOutbox()

  // Create new email entry
  const capturedEmail: TestEmailOutboxEntry = {
    from: String(emailData.from || ''),
    to: emailData.to,
    subject: String(emailData.subject || ''),
    html: String(emailData.html || ''),
    id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }

  // Add to outbox
  outbox.push(capturedEmail)

  // Write back to file
  await fs.promises.writeFile(OUTBOX_PATH, JSON.stringify(outbox, null, 2))

  return capturedEmail
}
