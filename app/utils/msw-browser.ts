import { setupWorker } from 'msw/browser'

// Dynamically import the handlers to avoid SSR issues
async function getFirebaseHandlers() {
	const { firebaseHandlers } = await import('../../test/mocks/handlers/firebase.js')
	return firebaseHandlers
}

// Set up MSW browser worker for E2E tests
export async function setupMSWBrowser(): Promise<undefined | null> {
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
			return HttpResponse.json({ success: true })
		})

		const worker = setupWorker(...firebaseHandlers, testHandler)

		return worker
			.start({
				onUnhandledRequest: 'bypass',
				serviceWorker: {
					url: '/mockServiceWorker.js',
				},
			})
			.then(() => {
				// Test that the worker is intercepting by logging all requests
				worker.listHandlers().forEach((handler) => {
					if ('info' in handler && handler.info) {
					} else {
					}
				})
			})
			.catch((_error) => {})
	} catch (_error) {
		return null
	}
}
