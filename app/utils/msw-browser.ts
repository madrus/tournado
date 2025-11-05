/* eslint-disable no-console */
import { setupWorker } from 'msw/browser'

// Dynamically import the handlers to avoid SSR issues
async function getFirebaseHandlers() {
  const { firebaseHandlers } = await import('~test/mocks/handlers/firebase.js')
  return firebaseHandlers
}

// Set up MSW browser worker for E2E tests
export async function setupMSWBrowser(): Promise<void | null> {
  if (typeof window === 'undefined') {
    return null
  }

  // Only enable in E2E test environment
  if (window.location.hostname !== 'localhost' || !window.playwrightTest) {
    return null
  }

  try {
    const firebaseHandlers = await getFirebaseHandlers()

    // Add a test handler to verify MSW is working
    const { http, HttpResponse } = await import('msw')
    const testHandler = http.get('/msw-test', () => {
      console.log('MSW test handler called!')
      return HttpResponse.json({ success: true })
    })

    const worker = setupWorker(...firebaseHandlers, testHandler)

    console.log('Starting MSW browser worker for E2E tests...')

    return worker
      .start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      })
      .then(() => {
        console.log('MSW browser worker started successfully')
        // Test that the worker is intercepting by logging all requests
        worker.listHandlers().forEach(handler => {
          if ('info' in handler && handler.info) {
            console.log('MSW handler registered:', handler.info.header)
          } else {
            console.log('MSW handler registered (no info available)')
          }
        })
      })
      .catch(error => {
        console.error('Failed to start MSW browser worker:', error)
      })
  } catch (error) {
    console.error('Failed to load Firebase handlers:', error)
    return null
  }
}
