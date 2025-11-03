import { clearTestEmailOutbox, getTestEmailOutbox } from '~/utils/email-testing.server'

const isPlaywrightEnv = (): boolean => process.env.PLAYWRIGHT === 'true'

const notFound = (): Response => new Response('Not Found', { status: 404 })

/**
 * Handles GET requests to /test/emails.
 * Reads the email outbox from the file system and returns it as JSON.
 */
export async function loader(): Promise<Response> {
  if (!isPlaywrightEnv()) {
    throw notFound()
  }
  const emails = getTestEmailOutbox()
  return new Response(JSON.stringify(emails), {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Handles DELETE requests to /test/emails.
 * Clears the email outbox on the file system.
 */
export async function action({ request }: { request: Request }): Promise<Response> {
  if (!isPlaywrightEnv()) {
    throw notFound()
  }
  if (request.method !== 'DELETE') {
    return new Response('Method not allowed', { status: 405 })
  }
  clearTestEmailOutbox()
  return new Response(null, { status: 204 })
}
