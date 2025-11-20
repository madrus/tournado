import { useEffect } from 'react'

import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import type { FirebaseUser } from '~/features/firebase/types'
import { isBrowser } from '~/lib/lib.helpers'
import type { User } from '~/models/user.server'

type StoreState = {
	user: User | null
	firebaseUser: FirebaseUser | null
	loading: boolean
	error: string | null
}

type Actions = {
	setUser: (user: User | null) => void
	setFirebaseUser: (user: FirebaseUser | null) => void
	setLoading: (loading: boolean) => void
	setError: (error: string | null) => void
	clearError: () => void
	resetStoreState: () => void
}

const storeName = 'AuthStore'

const initialStoreState: StoreState = {
	user: null,
	firebaseUser: null,
	loading: false,
	error: null,
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
			(set) => ({
				...initialStoreState,
				resetStoreState: () => {
					set(initialStoreState, false, 'resetStoreState')
				},
				setUser: (user) => set({ user }, false, 'setUser'),
				setFirebaseUser: (firebaseUser) => set({ firebaseUser }, false, 'setFirebaseUser'),
				setLoading: (loading) => set({ loading }, false, 'setLoading'),
				setError: (error) => set({ error }, false, 'setError'),
				clearError: () => set({ error: null }, false, 'clearError'),
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
				partialize: (state) => (isBrowser ? state : {}),
			},
		),
		{
			name: storeName,
		},
	),
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
