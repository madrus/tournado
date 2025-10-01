import { http, HttpResponse } from 'msw'

// In-memory email storage for testing
const emailOutbox = []

export const emailHandlers = [
  // Intercept Resend API calls - this is the key MSW functionality
  http.post('https://api.resend.com/emails', async ({ request }) => {
    const emailData = await request.json()

    // Store the captured email
    const capturedEmail = {
      ...emailData,
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }

    emailOutbox.push(capturedEmail)

    console.info(
      `[MSW] Captured email to: ${emailData.to}, subject: ${emailData.subject}`
    )

    // Return successful Resend API response format
    return HttpResponse.json({
      id: capturedEmail.id,
      from: emailData.from,
      to: emailData.to,
      created_at: capturedEmail.timestamp,
    })
  }),
]

// Export functions for direct access in tests
export const getEmailOutbox = () => [...emailOutbox]
export const clearEmailOutbox = () => {
  emailOutbox.length = 0
}

// Export function to add emails directly (for server-side testing)
export const addEmailToOutbox = emailData => {
  const capturedEmail = {
    ...emailData,
    id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }
  emailOutbox.push(capturedEmail)
  return capturedEmail
}
