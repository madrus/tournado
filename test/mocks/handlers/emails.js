import { http, HttpResponse } from 'msw'

import {
  clearTestEmailOutbox,
  getTestEmailOutbox,
  addEmailToOutbox as storeEmailInOutbox,
} from '~/utils/email-testing.server'

export const emailHandlers = [
  // Intercepts Resend API calls during tests and captures emails to the in-memory outbox.
  // This handler enables E2E tests to verify email sending without making real API calls.
  http.post('https://api.resend.com/emails', async ({ request }) => {
    const emailData = await request.json()
    try {
      const capturedEmail = await storeEmailInOutbox(emailData)

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

// Get all emails from the in-memory outbox
export const getEmailOutbox = () => getTestEmailOutbox()

// Clear the in-memory outbox
export const clearEmailOutbox = () => clearTestEmailOutbox()

// Add an email to the in-memory outbox
export const addEmailToOutbox = emailData => storeEmailInOutbox(emailData)
