import { useEffect } from 'react'

import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import { Language } from '~/i18n/config'
import { isBrowser } from '~/lib/lib.helpers'

type Theme = 'light' | 'dark'

type StoreState = {
  theme: Theme
  language: Language
}

type Actions = {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setLanguage: (language: Language) => void
  resetStoreState: () => void
}

const storeName = 'UIPreferencesStore'

const initialStoreState: StoreState = {
  theme: 'light',
  language: 'nl',
}

// Server-side storage mock for when localStorage is not available
const createServerSideStorage = () => ({
  getItem: () => null,
  setItem: () => {
    // Server-side no-op
  },
  removeItem: () => {
    // Server-side no-op
  },
})

export const useSettingsStore = create<StoreState & Actions>()(
  devtools(
    persist(
      set => ({
        ...initialStoreState,
        resetStoreState: () => {
          set(initialStoreState, false, 'resetStoreState')
        },
        setTheme: theme => {
          // Persist to both localStorage and cookies for server-side access
          if (isBrowser) {
            document.cookie = `theme=${theme}; path=/; max-age=31536000`
          }
          set({ theme }, false, 'setTheme')
        },
        toggleTheme: () =>
          set(
            state => {
              const newTheme = state.theme === 'light' ? 'dark' : 'light'
              // Persist to cookies for server-side access
              if (isBrowser) {
                document.cookie = `theme=${newTheme}; path=/; max-age=31536000`
              }
              return { theme: newTheme }
            },
            false,
            'toggleTheme'
          ),
        setLanguage: language => {
          // Persist to both localStorage and cookies for server-side access
          if (isBrowser) {
            document.cookie = `lang=${language}; path=/; max-age=31536000`
          }
          set({ language }, false, 'setLanguage')
        },
      }),
      {
        name: 'settings-storage',
        // Use localStorage for UI preferences persistence (unlike auth which uses sessionStorage)
        storage: isBrowser
          ? createJSONStorage(() => localStorage)
          : createJSONStorage(createServerSideStorage),
        // Skip persistence completely on server-side
        skipHydration: !isBrowser,
        // Only persist when we're in the browser
        partialize: state => (isBrowser ? state : {}),
      }
    ),
    {
      name: storeName,
    }
  )
)

/**
 * Hook to handle UI preferences store rehydration in components
 * Use this in components that need the UI preferences store to be properly hydrated
 */
export const useSettingsStoreHydration = (): void => {
  useEffect(() => {
    if (isBrowser) {
      useSettingsStore.persist.rehydrate()
    }
  }, [])
}
