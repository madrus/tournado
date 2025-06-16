import { useEffect } from 'react'

import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StoreState = {
  authenticated: boolean
  username: string
}

type Actions = {
  setAuth: (authenticated: boolean, username: string) => void
}

const storeName = 'AuthStore'

const initialStoreState: StoreState = {
  authenticated: false,
  username: '',
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

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
        setAuth: (authenticated, username) => set({ authenticated, username }),
      }),
      {
        name: 'auth-store-storage',
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
