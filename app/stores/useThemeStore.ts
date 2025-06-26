import { useEffect } from 'react'

import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import { isBrowser } from '~/lib/lib.helpers'

type Theme = 'light' | 'dark'

type StoreState = {
  theme: Theme
}

type Actions = {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  resetStoreState: () => void
}

const storeName = 'ThemeStore'

const initialStoreState: StoreState = {
  theme: 'light',
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

export const useThemeStore = create<StoreState & Actions>()(
  devtools(
    persist(
      set => ({
        ...initialStoreState,
        resetStoreState: () => {
          set(initialStoreState, false, 'resetStoreState')
        },
        setTheme: theme => set({ theme }, false, 'setTheme'),
        toggleTheme: () =>
          set(
            state => ({ theme: state.theme === 'light' ? 'dark' : 'light' }),
            false,
            'toggleTheme'
          ),
      }),
      {
        name: 'theme-storage',
        // Use localStorage for theme persistence (unlike auth which uses sessionStorage)
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
 * Hook to handle theme store rehydration in components
 * Use this in components that need the theme store to be properly hydrated
 */
export const useThemeStoreHydration = (): void => {
  useEffect(() => {
    if (isBrowser) {
      useThemeStore.persist.rehydrate()
    }
  }, [])
}
