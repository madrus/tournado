// This is a basic service worker for development mode
self.addEventListener('install', event => {
  console.log('Service Worker installing.')
})

self.addEventListener('activate', event => {
  console.log('Service Worker activated.')
})

self.addEventListener('fetch', event => {
  // Skip session-related requests
  if (
    event.request.url.includes('_data=routes%2Fsignin') ||
    event.request.url.includes('signin') ||
    event.request.url.includes('signout')
  ) {
    return
  }

  console.log('Service Worker fetching:', event.request.url)
})
