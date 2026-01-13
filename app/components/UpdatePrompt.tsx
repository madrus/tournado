import { type JSX, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { updateServiceWorker } from '~/utils/serviceWorkerRegistration'
import { toast } from '~/utils/toastUtils'

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
      // Also show toast using the new toast system
      toast.info(t('pwa.update.title'), {
        description: t('pwa.update.instruction'),
        duration: 7500,
      })
    }

    window.addEventListener('serviceWorkerUpdateReady', handleUpdateFound)

    return () => {
      window.removeEventListener('serviceWorkerUpdateReady', handleUpdateFound)
    }
  }, [isClient, t])

  // Don't render anything during SSR
  if (!isClient) return null

  if (!showUpdatePrompt) return null

  return (
    <div
      data-testid='pwa-update-prompt'
      className='safe-bottom fixed right-0 bottom-0 left-0 z-40 bg-neutral p-4 shadow-lg'
    >
      <div className='flex items-center justify-between gap-4'>
        <div className='flex-1'>
          <p className='font-medium text-foreground-darker text-sm'>
            {t('pwa.update.title')}
          </p>
          <p className='mt-1 text-brand text-xs'>{t('pwa.update.instruction')}</p>
        </div>
        <button
          type='button'
          onClick={() => {
            updateServiceWorker()
            setShowUpdatePrompt(false)
          }}
          className='rounded-md bg-background px-4 py-2 font-medium text-brand text-sm hover:bg-background-hover'
        >
          {t('pwa.update.button')}
        </button>
      </div>
    </div>
  )
}
