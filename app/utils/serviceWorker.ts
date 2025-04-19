// @remix-run/client

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  // Delay registration until after the page has loaded
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')
      console.log('ServiceWorker registered:', registration)

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          // When the new service worker is installed and waiting
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Notify the user about the update
            const event = new CustomEvent('serviceWorkerUpdateReady')
            window.dispatchEvent(event)
          }
        })
      })

      // Handle updates from existing service workers
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload the page when the new service worker takes control
        window.location.reload()
      })
    } catch (error) {
      console.error('ServiceWorker registration failed:', error)
    }
  })
}

export function updateServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.ready
    .then(registration => {
      registration.waiting?.postMessage('skipWaiting')
    })
    .catch(error => {
      console.error('Failed to update service worker:', error)
    })
}
