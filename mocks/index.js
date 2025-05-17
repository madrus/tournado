import { http, passthrough } from 'msw'
import { setupServer } from 'msw/node'

// put one-off handlers that don't really need an entire file to themselves here
const miscHandlers = [
  http.post(`${process.env.REACT_ROUTER_DEV_HTTP_ORIGIN}/ping`, () => passthrough()),
  // Pass through all session-related requests
  http.all('*', async ({ request }) => {
    if (
      request.url.includes('signin') ||
      request.url.includes('signout') ||
      request.url.includes('_data=routes%2Fsignin')
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
