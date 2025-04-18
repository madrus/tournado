import { useEffect, useState } from 'react'

import { updateServiceWorker } from '@/utils/serviceWorker'

export function UpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  useEffect(() => {
    const handleUpdateFound = () => {
      setShowUpdatePrompt(true)
    }

    window.addEventListener('serviceWorkerUpdateReady', handleUpdateFound)

    return () => {
      window.removeEventListener('serviceWorkerUpdateReady', handleUpdateFound)
    }
  }, [])

  if (!showUpdatePrompt) return null

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-blue-50 p-4 shadow-lg'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-blue-900'>
            A new version is available
          </p>
          <p className='mt-1 text-xs text-blue-700'>Refresh to update the app</p>
        </div>
        <button
          onClick={() => {
            updateServiceWorker()
            setShowUpdatePrompt(false)
          }}
          className='rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200'
        >
          Update
        </button>
      </div>
    </div>
  )
}
