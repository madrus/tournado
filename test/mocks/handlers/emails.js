import { promises as fs } from 'node:fs'
import path from 'node:path'

import { http, HttpResponse } from 'msw'

import { createMutex } from '../utils/asyncLock.js'

const OUTBOX_DIR = path.join(process.cwd(), '.tmp')
const OUTBOX_PATH = path.join(OUTBOX_DIR, 'email-outbox.json')

const ensureOutboxDir = async () => {
  await fs.mkdir(OUTBOX_DIR, { recursive: true })
}

// Helper to read the outbox file
async function readOutbox() {
  await ensureOutboxDir()
  try {
    const content = await fs.readFile(OUTBOX_PATH, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      console.error('Failed to read email outbox:', error)
    }
    return []
  }
}

// Helper to write to the outbox file
async function writeOutbox(emails) {
  await ensureOutboxDir()
  try {
    await fs.writeFile(OUTBOX_PATH, JSON.stringify(emails, null, 2))
  } catch (error) {
    console.error('Failed to write email outbox:', error)
    throw error
  }
}

const runWithOutboxLock = createMutex()

export const emailHandlers = [
  // This handler is not strictly needed for the file-based approach but can be kept
  // if MSW is used for other purposes (e.g., client-side interception).
  http.post('https://api.resend.com/emails', async ({ request }) => {
    const emailData = await request.json()
    try {
      const capturedEmail = await addEmailToOutbox(emailData)

      console.info(
        `[MSW] Captured email to: ${emailData.to}, subject: ${emailData.subject}`
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
      if (error && error.code === 'ENOENT') {
        return
      }
      console.error('Failed to clear email outbox:', error)
      throw error
    }
  })

// Add an email to the file system outbox
export const addEmailToOutbox = async emailData =>
  runWithOutboxLock(async () => {
    const outbox = await readOutbox()
    const capturedEmail = {
      ...emailData,
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }
    outbox.push(capturedEmail)
    await writeOutbox(outbox)
    return capturedEmail
  })
