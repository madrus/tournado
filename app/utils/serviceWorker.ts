export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Register the service worker
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
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
      registration.waiting?.postMessage('skipWaiting')
    })
  }
}
