import { clearEmailOutbox, getEmailOutbox } from '../../mocks/handlers/emails.js'

// This route is only available in the Playwright test environment.
// In any other environment, it will return a 404 response.
if (process.env.PLAYWRIGHT !== 'true') {
  throw new Response('Not Found', { status: 404 })
}

/**
 * Handles GET requests to /test/emails.
 * Reads the email outbox from the file system and returns it as JSON.
 */
export async function loader({ request }: { request: Request }): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }
  const emails = getEmailOutbox()
  return new Response(JSON.stringify(emails), {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Handles DELETE requests to /test/emails.
 * Clears the email outbox on the file system.
 */
export async function action({ request }: { request: Request }): Promise<Response> {
  if (request.method !== 'DELETE') {
    return new Response('Method not allowed', { status: 405 })
  }
  clearEmailOutbox()
  return new Response(null, { status: 204 })
}
