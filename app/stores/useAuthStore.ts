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

// Client-side only storage to prevent SSR issues
const getStorage = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage
  }
  // Return a mock storage for SSR
  return {
    getItem: () => null,
    setItem: () => void 0,
    removeItem: () => void 0,
  }
}

export const useAuthStore = create<StoreState & Actions>()(
  devtools(
    persist(
      set => ({
        ...initialStoreState,
        setAuth: (authenticated, username) => set({ authenticated, username }),
      }),
      {
        name: 'auth-store-storage',
        storage: createJSONStorage(() => getStorage()),
        // Skip hydration on server side
        skipHydration: typeof window === 'undefined',
      }
    ),
    {
      name: storeName,
    }
  )
)
