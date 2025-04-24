// @remix-run/client
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { updateServiceWorker } from '@/utils/serviceWorkerRegistration'

export function UpdatePrompt() {
  const { t } = useTranslation()
  const [isClient, setIsClient] = useState(false)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  // Mark client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const handleUpdateFound = () => {
      setShowUpdatePrompt(true)
    }

    window.addEventListener('serviceWorkerUpdateReady', handleUpdateFound)

    return () => {
      window.removeEventListener('serviceWorkerUpdateReady', handleUpdateFound)
    }
  }, [isClient])

  // Don't render anything during SSR
  if (!isClient) return null

  if (!showUpdatePrompt) return null

  return (
    <div className='safe-bottom fixed right-0 bottom-0 left-0 z-50 bg-blue-50 p-4 shadow-lg'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-blue-900'>{t('pwa.update.title')}</p>
          <p className='mt-1 text-xs text-blue-700'>{t('pwa.update.instruction')}</p>
        </div>
        <button
          onClick={() => {
            updateServiceWorker()
            setShowUpdatePrompt(false)
          }}
          className='rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200'
        >
          {t('pwa.update.button')}
        </button>
      </div>
    </div>
  )
}
