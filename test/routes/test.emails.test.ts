import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { action, loader } from '~/routes/test.emails'

const emailTestingMocks = vi.hoisted(() => ({
  getTestEmailOutbox: vi.fn(),
  clearTestEmailOutbox: vi.fn(),
}))

vi.mock('~/utils/email-testing.server', () => emailTestingMocks)

describe('test.emails.server route', () => {
  const originalPlaywright = process.env.PLAYWRIGHT

  beforeEach(() => {
    vi.clearAllMocks()
    emailTestingMocks.getTestEmailOutbox.mockReset()
    emailTestingMocks.clearTestEmailOutbox.mockReset()
    process.env.PLAYWRIGHT = 'true'
  })

  afterEach(() => {
    if (originalPlaywright === undefined) {
      delete process.env.PLAYWRIGHT
    } else {
      process.env.PLAYWRIGHT = originalPlaywright
    }
  })

  it('throws a 404 Response when not in Playwright environment', async () => {
    process.env.PLAYWRIGHT = 'false'

    await expect(loader()).rejects.toMatchObject({ status: 404 })
  })

  it('returns the email outbox when in Playwright environment', async () => {
    const mockEmails = [
      {
        id: 'mock-1',
        from: 'from@example.com',
        to: 'to@example.com',
        subject: 'Subject',
        html: '<p>Hello</p>',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    ]
    emailTestingMocks.getTestEmailOutbox.mockResolvedValue(mockEmails)

    const response = await loader()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    await expect(response.json()).resolves.toEqual(mockEmails)
    expect(emailTestingMocks.getTestEmailOutbox).toHaveBeenCalledTimes(1)
  })

  it('returns 405 when action receives a non-DELETE method', async () => {
    const request = new Request('http://example.com/test/emails', { method: 'POST' })

    const response = await action({ request })

    expect(response.status).toBe(405)
    expect(emailTestingMocks.clearTestEmailOutbox).not.toHaveBeenCalled()
  })

  it('clears the outbox and returns 204 on DELETE', async () => {
    const request = new Request('http://example.com/test/emails', { method: 'DELETE' })
    emailTestingMocks.clearTestEmailOutbox.mockResolvedValue(undefined)

    const response = await action({ request })

    expect(response.status).toBe(204)
    expect(emailTestingMocks.clearTestEmailOutbox).toHaveBeenCalledTimes(1)
  })
})
