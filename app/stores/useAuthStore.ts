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

export const useAuthStore = create<StoreState & Actions>()(
  devtools(
    persist(
      set => ({
        ...initialStoreState,
        setAuth: (authenticated, username) => set({ authenticated, username }),
      }),
      {
        name: 'auth-store-storage',
        storage: createJSONStorage(() => sessionStorage),
      }
    ),
    {
      name: storeName,
    }
  )
)
