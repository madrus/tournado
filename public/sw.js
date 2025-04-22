// This is a basic service worker for development mode
self.addEventListener('install', event => {
  console.log('Service Worker installing.')
})

self.addEventListener('activate', event => {
  console.log('Service Worker activated.')
})

self.addEventListener('fetch', event => {
  console.log('Service Worker fetching:', event.request.url)
})
