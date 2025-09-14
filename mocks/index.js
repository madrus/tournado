import { http, passthrough } from 'msw'
import { setupServer } from 'msw/node'

import { firebaseHandlers } from './handlers/firebase.js'

// put one-off handlers that don't really need an entire file to themselves here
const miscHandlers = [
  http.post(`${process.env.REACT_ROUTER_DEV_HTTP_ORIGIN}/ping`, () => passthrough()),
  // Pass through all session-related requests (except auth callback which is handled by Firebase mocks)
  http.all('*', async ({ request }) => {
    if (
      (request.url.includes('signin') ||
        request.url.includes('signout') ||
        request.url.includes('_data=routes%2Fsignin')) &&
      !request.url.includes('/auth/callback')
    ) {
      return passthrough()
    }
  }),
]

// Include Firebase handlers only in test environment
const allHandlers =
  process.env.PLAYWRIGHT_TEST === 'true'
    ? [...firebaseHandlers, ...miscHandlers]
    : miscHandlers

const server = setupServer(...allHandlers)

server.listen({
  onUnhandledRequest: 'bypass',
})
console.info('Mock server running')

process.once('SIGINT', () => server.close())
process.once('SIGTERM', () => server.close())
