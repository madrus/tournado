import { HttpResponse, type JsonBodyType, http } from 'msw'
import {
	clearTestEmailOutbox,
	getTestEmailOutbox,
	addEmailToOutbox as storeEmailInOutbox,
} from '../../../app/utils/email-testing.server.ts'

export const emailHandlers = [
	// Intercepts Resend API calls during tests and captures emails to the in-memory outbox.
	// This handler enables E2E tests to verify email sending without making real API calls.
	http.post(
		'https://api.resend.com/emails',
		async ({ request }): Promise<HttpResponse<JsonBodyType>> => {
			const emailData = (await request.json()) as {
				from?: string
				to: string | string[]
				subject?: string
				html?: string
			}
			try {
				const capturedEmail = await storeEmailInOutbox(emailData)

				return HttpResponse.json({
					id: capturedEmail.id,
					from: capturedEmail.from,
					to: capturedEmail.to,
					created_at: capturedEmail.timestamp,
				})
			} catch (_error) {
				return HttpResponse.json({ error: 'Failed to capture email' }, { status: 500 })
			}
		},
	),
]

// Get all emails from the in-memory outbox
export const getEmailOutbox = () => getTestEmailOutbox()

// Clear the in-memory outbox
export const clearEmailOutbox = () => clearTestEmailOutbox()

// Add an email to the in-memory outbox
export const addEmailToOutbox = (emailData: {
	from?: string
	to: string | string[]
	subject?: string
	html?: string
}) => storeEmailInOutbox(emailData)
