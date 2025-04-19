const VERSION = '0.1.0'
const CACHE_NAME = `tournado-v${VERSION}`
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon/site.webmanifest',
  '/favicon/android-chrome-192x192.png',
  '/favicon/android-chrome-512x512.png',
  '/favicon/favicon-16x16.png',
  '/favicon/favicon-32x32.png',
  '/favicon/apple-touch-icon.png',
]

// Install event - cache initial assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log(`[Service Worker] Installing version ${VERSION}`)
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached response if found
      if (response) {
        return response
      }

      // Clone the request because it can only be used once
      const fetchRequest = event.request.clone()

      // Make network request and cache the response
      return fetch(fetchRequest).then(response => {
        // Check if response is valid
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // Clone the response because it can only be used once
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    })
  )
})

// Message event - handle version updates
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    console.log(`[Service Worker] Skipping wait and activating version ${VERSION}`)
    self.skipWaiting()
  }
})
