import { PWA_UPDATE_INTERVAL } from '@/lib/lib.constants'

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Register the service worker
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(registration => {
          console.log('ServiceWorker registered:', registration)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (!newWorker) return

            newWorker.addEventListener('statechange', () => {
              // When the new service worker is installed and waiting
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // Notify the user about the update
                const event = new CustomEvent('serviceWorkerUpdateReady')
                window.dispatchEvent(event)
              }
            })
          })

          // Check for updates immediately
          registration.update()

          // Then check for updates every hour
          setInterval(() => {
            registration.update()
          }, PWA_UPDATE_INTERVAL)
        })
        .catch(error => {
          console.error('ServiceWorker registration failed:', error)
        })

      // Handle updates from existing service workers
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload the page when the new service worker takes control
        window.location.reload()
      })
    })
  }
}

export function updateServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      if (registration.waiting) {
        registration.waiting.postMessage('skipWaiting')
      }
    })
  }
}
