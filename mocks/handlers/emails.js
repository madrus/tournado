import fs from 'node:fs'
import path from 'node:path'

import { http, HttpResponse } from 'msw'

const OUTBOX_DIR = path.join(process.cwd(), '.tmp')
const OUTBOX_PATH = path.join(OUTBOX_DIR, 'email-outbox.json')

// Ensure the .tmp directory exists
if (!fs.existsSync(OUTBOX_DIR)) {
  fs.mkdirSync(OUTBOX_DIR, { recursive: true })
}

// Helper to read the outbox file
function readOutbox() {
  if (!fs.existsSync(OUTBOX_PATH)) {
    return []
  }
  const content = fs.readFileSync(OUTBOX_PATH, 'utf-8')
  return JSON.parse(content)
}

// Helper to write to the outbox file
function writeOutbox(emails) {
  fs.writeFileSync(OUTBOX_PATH, JSON.stringify(emails, null, 2))
}

export const emailHandlers = [
  // This handler is not strictly needed for the file-based approach but can be kept
  // if MSW is used for other purposes (e.g., client-side interception).
  http.post('https://api.resend.com/emails', async ({ request }) => {
    const emailData = await request.json()
    addEmailToOutbox(emailData)

    console.info(
      `[MSW] Captured email to: ${emailData.to}, subject: ${emailData.subject}`
    )

    return HttpResponse.json({
      id: `mock-${Date.now()}`,
      from: emailData.from,
      to: emailData.to,
      created_at: new Date().toISOString(),
    })
  }),
]

// Get all emails from the file system outbox
export const getEmailOutbox = () => {
  return readOutbox()
}

// Clear the file system outbox
export const clearEmailOutbox = () => {
  if (fs.existsSync(OUTBOX_PATH)) {
    fs.unlinkSync(OUTBOX_PATH)
  }
}

// Add an email to the file system outbox
export const addEmailToOutbox = emailData => {
  const outbox = readOutbox()
  const capturedEmail = {
    ...emailData,
    id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }
  outbox.push(capturedEmail)
  writeOutbox(outbox)
  return capturedEmail
}
