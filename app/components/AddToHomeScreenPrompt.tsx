// @remix-run/client
import { useEffect, useState } from 'react'

type Platform =
  | 'ios-safari'
  | 'ios-chrome'
  | 'ios-firefox'
  | 'android-chrome'
  | 'android-firefox'
  | 'android-samsung'
  | 'other'

export function AddToHomeScreenPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [platform, setPlatform] = useState<Platform>('other')
  const [storageKey, setStorageKey] = useState('')

  useEffect(() => {
    // Get environment from the URL
    function getEnvironment(): 'staging' | 'production' {
      return window.location.hostname.includes('staging') ? 'staging' : 'production'
    }

    // Create environment-specific storage key
    function getStorageKey(): string {
      const env = getEnvironment()
      const baseKey = 'tournado'
      return env === 'staging'
        ? `${baseKey}-staging-pwa-prompt-dismissed`
        : `${baseKey}-pwa-prompt-dismissed`
    }

    // Set the storage key
    setStorageKey(getStorageKey())

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
      const lastDismissed = localStorage.getItem(storageKey)

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
      } catch (error) {
        // If there's any error parsing the date, clear the storage and show the prompt
        localStorage.removeItem(storageKey)
        return true
      }
    }

    // Check if the app is running in standalone mode
    function isInStandaloneMode(): boolean {
      const nav = navigator as any // Type assertion for iOS Safari standalone property
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
  }, [storageKey])

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem(storageKey, new Date().toISOString())
  }

  if (!showPrompt) return null

  const promptText = {
    'ios-safari': {
      title: 'Install this app on your iPhone',
      instruction: 'Tap the share button and then "Add to Home Screen"',
      icon: '↑',
    },
    'ios-chrome': {
      title: 'Install this app on your iPhone',
      instruction: 'Tap the share button and then "Add to Home Screen"',
      icon: '⋮',
    },
    'ios-firefox': {
      title: 'Install this app on your iPhone',
      instruction: 'Tap the hamburger menu then "Share" and "Add to Home Screen"',
      icon: '⋮',
    },
    'android-chrome': {
      title: 'Install this app on your device',
      instruction: 'Tap the menu (⋮) and select "Install app"',
      icon: '⋮',
    },
    'android-firefox': {
      title: 'Install this app on your device',
      instruction: 'Tap the menu (⋮) and select "Install"',
      icon: '⋮',
    },
    'android-samsung': {
      title: 'Install this app on your device',
      instruction: 'Tap the menu (⋮) and select "Add page to" then "Home screen"',
      icon: '⋮',
    },
    other: {
      title: 'Install this app on your device',
      instruction: 'Open browser menu and select "Add to Home Screen"',
      icon: '⋮',
    },
  }

  const showTopArrow = platform === 'ios-safari'
  const showMenuDots = platform !== 'ios-safari'

  return (
    <div className='safe-bottom fixed bottom-0 left-0 right-0 z-50 bg-emerald-50 p-4 shadow-lg'>
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
              {showTopArrow && (
                <>
                  <svg
                    className='h-6 w-6 animate-bounce text-emerald-600'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z' />
                  </svg>
                  <div className='absolute -top-1 left-1/2 h-16 w-1 -translate-x-1/2 bg-gradient-to-b from-emerald-600/20 to-transparent' />
                </>
              )}
              {showMenuDots && (
                <div className='flex flex-col items-center'>
                  <span className='animate-pulse text-lg font-bold text-emerald-600'>
                    {promptText[platform].icon}
                  </span>
                  <div className='h-16 w-1 bg-gradient-to-t from-emerald-600/20 to-transparent' />
                </div>
              )}
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
