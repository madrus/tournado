// @remix-run/client
import { useEffect, useState } from 'react'

import { registerServiceWorker } from '@/utils/serviceWorkerRegistration'

import { AddToHomeScreenPrompt } from './AddToHomeScreenPrompt'
import { UpdatePrompt } from './UpdatePrompt'

export function PWAElements() {
  const [mounted, setMounted] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  console.log(
    '[PWAElements] Rendering, mounted:',
    mounted,
    'hydrated:',
    hydrated,
    'isServer:',
    typeof window === 'undefined'
  )

  // First effect: Mark hydration complete
  useEffect(() => {
    console.log('[PWAElements] Hydration effect running')
    setHydrated(true)
  }, [])

  // Second effect: Only run after hydration is complete
  useEffect(() => {
    if (!hydrated) return

    console.log('[PWAElements] Mount effect running (post-hydration)')
    setMounted(true)
    registerServiceWorker()

    return () => {
      console.log('[PWAElements] Cleanup effect running')
    }
  }, [hydrated])

  // Log state updates
  useEffect(() => {
    console.log(
      '[PWAElements] State updated - mounted:',
      mounted,
      'hydrated:',
      hydrated
    )
  }, [mounted, hydrated])

  if (!mounted || !hydrated) {
    console.log('[PWAElements] Returning null (not ready)')
    return null
  }

  console.log('[PWAElements] Rendering PWA components')
  return (
    <div id='pwa-prompts'>
      <AddToHomeScreenPrompt />
      <UpdatePrompt />
    </div>
  )
}
