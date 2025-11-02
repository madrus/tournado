import { clearEmailOutbox, getEmailOutbox } from 'test/mocks/handlers/emails.js'

const isPlaywright = process.env.PLAYWRIGHT === 'true'

const notFound = (): Response => new Response('Not Found', { status: 404 })

/**
 * Handles GET requests to /test/emails.
 * Reads the email outbox from the file system and returns it as JSON.
 */
export async function loader({ request }: { request: Request }): Promise<Response> {
  if (!isPlaywright) {
    return notFound()
  }
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
  if (!isPlaywright) {
    return notFound()
  }
  if (request.method !== 'DELETE') {
    return new Response('Method not allowed', { status: 405 })
  }
  clearEmailOutbox()
  return new Response(null, { status: 204 })
}
