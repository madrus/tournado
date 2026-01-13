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
    return []
  }
  return validationResult.data
}

export const getTestEmailOutbox = async (): Promise<TestEmailOutboxEntry[]> =>
  validateOutbox(inMemoryOutbox).map(email => ({ ...email }))

export const clearTestEmailOutbox = async (): Promise<void> => {
  inMemoryOutbox = []
}

export const addEmailToOutbox = async (emailData: {
  from?: string
  to: string | string[]
  subject?: string
  html?: string
}): Promise<TestEmailOutboxEntry> => {
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

  return capturedEmail
}
