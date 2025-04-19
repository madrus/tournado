// @remix-run/client
import { useEffect, useState } from 'react'

import { registerServiceWorker } from '@/utils/serviceWorker'

import { AddToHomeScreenPrompt } from './AddToHomeScreenPrompt'
import { UpdatePrompt } from './UpdatePrompt'

export function PWAElements() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    registerServiceWorker()
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      <AddToHomeScreenPrompt />
      <UpdatePrompt />
    </>
  )
}
