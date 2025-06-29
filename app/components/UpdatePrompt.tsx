import { JSX, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { updateServiceWorker } from '~/utils/serviceWorkerRegistration'

export function UpdatePrompt(): JSX.Element | null {
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
    <div className='safe-bottom bg-accent fixed right-0 bottom-0 left-0 z-40 p-4 shadow-lg'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex-1'>
          <p className='text-foreground-darker text-sm font-medium'>
            {t('pwa.update.title')}
          </p>
          <p className='text-brand mt-1 text-xs'>{t('pwa.update.instruction')}</p>
        </div>
        <button
          onClick={() => {
            updateServiceWorker()
            setShowUpdatePrompt(false)
          }}
          className='bg-background text-brand hover:bg-background-hover rounded-md px-4 py-2 text-sm font-medium'
        >
          {t('pwa.update.button')}
        </button>
      </div>
    </div>
  )
}
