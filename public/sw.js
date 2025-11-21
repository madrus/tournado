const SW_DEBUG = false
// This is a basic service worker for development mode
self.addEventListener('install', (_event) => {})

self.addEventListener('activate', (_event) => {})

self.addEventListener('fetch', (event) => {
	// Skip session-related requests
	if (
		event.request.url.includes('_data=routes%2Fsignin') ||
		event.request.url.includes('signin') ||
		event.request.url.includes('signout')
	) {
		return
	}

	if (SW_DEBUG) {
	}
})
