/* eslint-disable no-console */
import { clearTestEmailOutbox, getTestEmailOutbox } from '~/utils/email-testing.server'

const isPlaywrightEnv = (): boolean => process.env.PLAYWRIGHT === 'true'

const notFound = (): Response => new Response('Not Found', { status: 404 })

/**
 * Handles GET requests to /test/emails.
 * Reads the email outbox from the file system and returns it as JSON.
 */
export async function loader(): Promise<Response> {
  console.log('[test.emails.loader] invoked. PLAYWRIGHT=', process.env.PLAYWRIGHT)
  if (!isPlaywrightEnv()) {
    console.error('[test.emails.loader] Not in Playwright env, returning 404')
    throw notFound()
  }
  console.log('[test.emails.loader] Fetching current outbox')
  const emails = await getTestEmailOutbox()
  console.log('[test.emails.loader] Returning emails count:', emails.length)
  return new Response(JSON.stringify(emails), {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Handles DELETE requests to /test/emails.
 * Clears the email outbox on the file system.
 */
export async function action({ request }: { request: Request }): Promise<Response> {
  console.log('[test.emails.action] invoked. Method=', request.method)
  if (!isPlaywrightEnv()) {
    console.error('[test.emails.action] Not in Playwright env, returning 404')
    throw notFound()
  }
  if (request.method !== 'DELETE') {
    console.error(
      '[test.emails.action] Unsupported method, returning 405:',
      request.method
    )
    return new Response('Method not allowed', { status: 405 })
  }
  console.log('[test.emails.action] Clearing outbox')
  await clearTestEmailOutbox()
  console.log('[test.emails.action] Outbox cleared')
  return new Response(null, { status: 204 })
}
