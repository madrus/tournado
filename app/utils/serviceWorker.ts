// @remix-run/client

export async function registerServiceWorker() {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    process.env.NODE_ENV !== 'production'
  ) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')

    // Check for updates immediately
    registration.update()

    // Check for updates periodically
    setInterval(
      () => {
        registration.update()
      },
      60 * 60 * 1000
    ) // Check every hour

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New content is available, trigger update event
          window.dispatchEvent(new Event('serviceWorkerUpdateReady'))
        }
      })
    })
  } catch (error) {
    console.error('Service worker registration failed:', error)
  }
}

export async function updateServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return

  await registration.update()
  window.location.reload()
}
