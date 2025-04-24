import { http, passthrough } from 'msw'

import { setupServer } from 'msw/node'

// put one-off handlers that don't really need an entire file to themselves here
const miscHandlers = [
  http.post(`${process.env.REMIX_DEV_HTTP_ORIGIN}/ping`, () => passthrough()),
  // Pass through all session-related requests
  http.all('*', async ({ request }) => {
    if (
      request.url.includes('login') ||
      request.url.includes('logout') ||
      request.url.includes('_data=routes%2Flogin')
    ) {
      return passthrough()
    }
  }),
]

const server = setupServer(...miscHandlers)

server.listen({
  onUnhandledRequest: 'bypass',
  // Disable session tracking in MSW
  disableSession: true,
})
console.info('🔶 Mock server running')

process.once('SIGINT', () => server.close())
process.once('SIGTERM', () => server.close())
