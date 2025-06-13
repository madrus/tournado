import { JSX, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type Platform =
  | 'ios-safari'
  | 'ios-chrome'
  | 'ios-firefox'
  | 'android-chrome'
  | 'android-firefox'
  | 'android-samsung'
  | 'other'

type PromptText = {
  [K in Platform]: {
    title: string
    instruction: string
    icon: string
  }
}

export function AddToHomeScreenPrompt(): JSX.Element | null {
  const { t } = useTranslation()
  const [isClient, setIsClient] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [platform, setPlatform] = useState<Platform>('other')
  const [storageKey, setStorageKey] = useState('')

  // Mark client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Get environment from the URL
    const getEnvironment = (): 'staging' | 'production' =>
      window.location.hostname.includes('staging') ? 'staging' : 'production'

    // Create environment-specific storage key
    function getStorageKey(): string {
      const env = getEnvironment()
      const baseKey = 'tournado'
      return env === 'staging'
        ? `${baseKey}-staging-pwa-prompt-dismissed`
        : `${baseKey}-pwa-prompt-dismissed`
    }

    const key = getStorageKey()
    setStorageKey(key)

    function detectPlatform(): Platform {
      const ua = navigator.userAgent.toLowerCase()
      const isIOS = /iphone|ipad|ipod/.test(ua)
      const isAndroid = /android/.test(ua)

      // More specific browser detection for iOS
      const isCriOS = /crios/.test(ua) // Chrome on iOS
      const isFirefoxiOS = /fxios/.test(ua) // Firefox on iOS
      const isSafari = /safari/.test(ua) && !isCriOS && !isFirefoxiOS

      // Android browsers
      const isFirefox = /firefox/.test(ua)
      const isSamsung = /samsungbrowser/.test(ua)
      const isChrome = /chrome/.test(ua) && !isSamsung

      if (isIOS) {
        if (isCriOS) return 'ios-chrome'
        if (isFirefoxiOS) return 'ios-firefox'
        if (isSafari) return 'ios-safari'
      }

      if (isAndroid) {
        if (isFirefox) return 'android-firefox'
        if (isSamsung) return 'android-samsung'
        if (isChrome) return 'android-chrome'
      }

      return 'other'
    }

    function shouldShowPrompt(): boolean {
      if (!key) return true

      const lastDismissed = localStorage.getItem(key)

      if (!lastDismissed) return true

      try {
        const lastDismissedDate = new Date(lastDismissed)
        const today = new Date()

        // Check if the last dismissed date is from a previous day
        return (
          lastDismissedDate.getDate() !== today.getDate() ||
          lastDismissedDate.getMonth() !== today.getMonth() ||
          lastDismissedDate.getFullYear() !== today.getFullYear()
        )
      } catch (_error) {
        // If there's any error parsing the date, clear the storage and show the prompt
        if (key) localStorage.removeItem(key)
        return true
      }
    }

    // Check if the app is running in standalone mode
    function isInStandaloneMode(): boolean {
      const nav = navigator as Navigator & { standalone?: boolean }
      return (
        nav.standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches
      )
    }

    // Check platform and standalone mode
    const detectedPlatform = detectPlatform()
    const standalone = isInStandaloneMode()

    setPlatform(detectedPlatform)

    // Only show prompt if:
    // 1. Device is mobile
    // 2. Not already in standalone mode
    // 3. Not already dismissed today
    if (detectedPlatform !== 'other' && !standalone && shouldShowPrompt()) {
      // Add slight delay to ensure proper initialization
      const timeoutId = setTimeout(() => setShowPrompt(true), 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [isClient])

  const handleDismiss = () => {
    setShowPrompt(false)
    if (storageKey) {
      localStorage.setItem(storageKey, new Date().toISOString())
    }
  }

  // Don't render anything during SSR
  if (!isClient) return null

  const promptText = {
    'ios-safari': {
      title: t('pwa.install.ios.title'),
      instruction: t('pwa.install.ios.safari'),
      icon: '↑',
    },
    'ios-chrome': {
      title: t('pwa.install.ios.title'),
      instruction: t('pwa.install.ios.chrome'),
      icon: '⋮',
    },
    'ios-firefox': {
      title: t('pwa.install.ios.title'),
      instruction: t('pwa.install.ios.firefox'),
      icon: '⋮',
    },
    'android-chrome': {
      title: t('pwa.install.android.title'),
      instruction: t('pwa.install.android.chrome'),
      icon: '⋮',
    },
    'android-firefox': {
      title: t('pwa.install.android.title'),
      instruction: t('pwa.install.android.firefox'),
      icon: '⋮',
    },
    'android-samsung': {
      title: t('pwa.install.android.title'),
      instruction: t('pwa.install.android.samsung'),
      icon: '⋮',
    },
    other: {
      title: t('pwa.install.other.title'),
      instruction: t('pwa.install.other.instruction'),
      icon: '⋮',
    },
  } as PromptText

  const showTopArrow = platform === 'ios-safari'
  const showMenuDots = !showTopArrow

  if (!showPrompt) return null

  return (
    <div className='safe-bottom fixed right-0 bottom-0 left-0 z-40 bg-emerald-50 p-4 shadow-lg'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-emerald-900'>
            {promptText[platform].title}
          </p>
          <div className='mt-1 flex items-center gap-2'>
            <p className='text-xs text-emerald-700'>
              {promptText[platform].instruction}
            </p>
            <div className='relative'>
              {showTopArrow ? (
                <div className='flex flex-col items-center'>
                  <svg
                    className='h-6 w-6 animate-bounce text-emerald-600'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z' />
                  </svg>
                  <div className='h-16 w-1 bg-gradient-to-b from-emerald-600/20 to-transparent' />
                </div>
              ) : null}
              {showMenuDots ? (
                <div className='flex flex-col items-center'>
                  <span className='animate-pulse text-lg font-bold text-emerald-600'>
                    {promptText[platform].icon}
                  </span>
                  <div className='h-16 w-1 bg-gradient-to-t from-emerald-600/20 to-transparent' />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className='rounded-full bg-emerald-100 p-2 text-emerald-500 hover:bg-emerald-200'
          aria-label='Close prompt'
        >
          <svg
            className='h-5 w-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
