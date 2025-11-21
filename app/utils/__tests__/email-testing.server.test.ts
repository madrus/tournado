import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { addEmailToOutbox, clearTestEmailOutbox, getTestEmailOutbox } from '../email-testing.server'

describe('Email Testing Architecture', () => {
	beforeEach(async () => {
		await clearTestEmailOutbox()
	})

	afterEach(async () => {
		await clearTestEmailOutbox()
	})

	it('should add email to outbox and retrieve it', async () => {
		const testEmail = {
			from: 'test@example.com',
			to: 'recipient@example.com',
			subject: 'Test Email',
			html: '<p>Test content</p>',
		}

		// Add email to outbox
		const added = await addEmailToOutbox(testEmail)

		expect(added).toMatchObject({
			from: testEmail.from,
			to: testEmail.to,
			subject: testEmail.subject,
			html: testEmail.html,
		})
		expect(added.id).toMatch(/^mock-/)
		expect(added.timestamp).toBeTruthy()

		// Retrieve from outbox
		const outbox = await getTestEmailOutbox()
		expect(outbox).toHaveLength(1)
		expect(outbox[0]).toMatchObject({
			from: testEmail.from,
			to: testEmail.to,
			subject: testEmail.subject,
			html: testEmail.html,
		})
	})

	it('should handle multiple emails', async () => {
		await addEmailToOutbox({
			from: 'sender1@example.com',
			to: 'recipient1@example.com',
			subject: 'Email 1',
			html: '<p>Content 1</p>',
		})

		await addEmailToOutbox({
			from: 'sender2@example.com',
			to: 'recipient2@example.com',
			subject: 'Email 2',
			html: '<p>Content 2</p>',
		})

		const outbox = await getTestEmailOutbox()
		expect(outbox).toHaveLength(2)
	})

	it('should clear outbox', async () => {
		await addEmailToOutbox({
			from: 'test@example.com',
			to: 'recipient@example.com',
			subject: 'Test',
			html: '<p>Test</p>',
		})

		let outbox = await getTestEmailOutbox()
		expect(outbox).toHaveLength(1)

		await clearTestEmailOutbox()

		outbox = await getTestEmailOutbox()
		expect(outbox).toHaveLength(0)
	})
})
