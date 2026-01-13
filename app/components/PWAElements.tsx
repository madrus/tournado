import { type JSX, useEffect, useState } from 'react'
import { registerServiceWorker } from '~/utils/serviceWorkerRegistration'
import { AddToHomeScreenPrompt } from './AddToHomeScreenPrompt'
import { UpdatePrompt } from './UpdatePrompt'

export function PWAElements(): JSX.Element | null {
  const [hydrated, setHydrated] = useState(false)

  // Wait for client-side hydration before registering SW and rendering prompts
  useEffect(() => {
    setHydrated(true)
    registerServiceWorker()
  }, [])

  if (!hydrated) {
    return null
  }

  return (
    <div id='pwa-prompts'>
      <AddToHomeScreenPrompt />
      <UpdatePrompt />
    </div>
  )
}
