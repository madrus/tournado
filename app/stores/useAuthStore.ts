import { useEffect } from 'react'

import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import { isBrowser } from '~/lib/lib.helpers'

type StoreState = {
  authenticated: boolean
  username: string
}

type Actions = {
  setAuth: (authenticated: boolean, username: string) => void
  resetStoreState: () => void
}

const storeName = 'AuthStore'

const initialStoreState: StoreState = {
  authenticated: false,
  username: '',
}

// Server-side storage mock for when sessionStorage is not available
const createServerSideStorage = () => ({
  getItem: () => null,
  setItem: () => {
    // Server-side no-op
  },
  removeItem: () => {
    // Server-side no-op
  },
})

export const useAuthStore = create<StoreState & Actions>()(
  devtools(
    persist(
      set => ({
        ...initialStoreState,
        resetStoreState: () => {
          set(initialStoreState, false, 'resetStoreState')
        },
        setAuth: (authenticated, username) =>
          set({ authenticated, username }, false, 'setAuth'),
      }),
      {
        name: 'auth-storage',
        // Only use sessionStorage if we're in the browser
        storage: isBrowser
          ? createJSONStorage(() => sessionStorage)
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
 * Hook to handle auth store rehydration in components
 * Use this in components that need the auth store to be properly hydrated
 */
export const useAuthStoreHydration = (): void => {
  useEffect(() => {
    if (isBrowser) {
      useAuthStore.persist.rehydrate()
    }
  }, [])
}
