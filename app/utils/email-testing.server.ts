/* eslint-disable no-console */
import { z } from 'zod'

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

let inMemoryOutbox: TestEmailOutboxEntry[] = []

const validateOutbox = (emails: TestEmailOutboxEntry[]): TestEmailOutboxEntry[] => {
  const validationResult = testEmailOutboxSchema.safeParse(emails)
  if (!validationResult.success) {
    // eslint-disable-next-line no-console
    console.error('Email outbox format is invalid:', validationResult.error)
    return []
  }
  return validationResult.data
}

export const getTestEmailOutbox = async (): Promise<TestEmailOutboxEntry[]> => {
  console.log(
    '[email-testing] getTestEmailOutbox called. Current count:',
    inMemoryOutbox.length
  )
  return validateOutbox(inMemoryOutbox).map(email => ({ ...email }))
}

export const clearTestEmailOutbox = async (): Promise<void> => {
  console.log('[email-testing] clearTestEmailOutbox called')
  inMemoryOutbox = []
}

export const addEmailToOutbox = async (emailData: {
  from?: string
  to: string | string[]
  subject?: string
  html?: string
}): Promise<TestEmailOutboxEntry> => {
  console.log('[email-testing] addEmailToOutbox called with:', {
    to: emailData.to,
    subject: emailData.subject,
  })
  const outbox = [...inMemoryOutbox]

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

  // Persist in memory for subsequent requests
  inMemoryOutbox = outbox
  console.log('[email-testing] Stored email. New outbox length:', inMemoryOutbox.length)

  return capturedEmail
}
