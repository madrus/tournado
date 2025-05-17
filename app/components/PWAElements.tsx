import { useEffect, useState } from 'react'

import { registerServiceWorker } from '~/utils/serviceWorkerRegistration'

import { AddToHomeScreenPrompt } from './AddToHomeScreenPrompt'
import { UpdatePrompt } from './UpdatePrompt'

export function PWAElements(): JSX.Element | null {
  const [mounted, setMounted] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // First effect: Mark hydration complete
  useEffect(() => {
    setHydrated(true)
  }, [])

  // Second effect: Only run after hydration is complete
  useEffect(() => {
    if (!hydrated) return

    setMounted(true)
    registerServiceWorker()
  }, [hydrated])

  if (!mounted || !hydrated) {
    return null
  }

  return (
    <div id='pwa-prompts'>
      <AddToHomeScreenPrompt />
      <UpdatePrompt />
    </div>
  )
}
