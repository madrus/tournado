import { useEffect } from 'react'
import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { Language } from '~/i18n/config'
import { isBrowser } from '~/lib/lib.helpers'
import { setCookie } from './utils'

type Theme = 'light' | 'dark'

type StoreState = {
	isRTL: boolean
	language: Language
	theme: Theme
}

type Actions = {
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
	setLanguage: (language: Language) => void
	resetSettingsStoreState: () => void
}

// Theme switching is now instant with no global transitions to manage

const storeName = 'UIPreferencesStore'

const initialStoreState: StoreState = {
	theme: 'light',
	isRTL: false,
	language: 'nl',
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

const useSettingsStoreBase = create<StoreState & Actions>()(
	devtools(
		persist(
			(set, _get) => ({
				...initialStoreState,
				resetSettingsStoreState: () => {
					set(initialStoreState, false, 'resetSettingsStoreState')
				},
				setTheme: (theme) => {
					set({ theme }, false, 'setTheme')
					// Persist to cookies for server-side access
					if (isBrowser) {
						setCookie('theme', theme)
					}
				},
				toggleTheme: () => {
					set(
						(state) => {
							const newTheme = state.theme === 'light' ? 'dark' : 'light'
							// Persist to cookies for server-side access
							if (isBrowser) {
								setCookie('theme', newTheme)
							}
							return { theme: newTheme }
						},
						false,
						'toggleTheme',
					)
				},
				setLanguage: (language) => {
					// Compute isRTL from language
					const isRTL = language.split('-')[0] === 'ar'
					set({ language, isRTL }, false, 'setLanguage')
					// Persist to cookies for server-side access
					if (isBrowser) {
						setCookie('lang', language)
					}
				},
			}),
			{
				name: storeName,
				// Use sessionStorage for UI preferences (survives refreshes, not new tabs)
				storage: isBrowser
					? createJSONStorage(() => sessionStorage)
					: createJSONStorage(createServerSideStorage),
				// Skip persistence completely on server-side
				skipHydration: !isBrowser,
				// Only persist theme; language/isRTL come from cookie+loader to avoid hydration flashes
				partialize: (state) => (isBrowser ? { theme: state.theme } : {}),
				// Merge persisted state without overriding language/isRTL from the server cookie
				merge: (persistedState, currentState) => ({
					...currentState,
					theme: (persistedState as Partial<StoreState>)?.theme ?? currentState.theme,
				}),
			},
		),
		{
			name: storeName,
		},
	),
)

type SettingsStore = StoreState & Actions
type SettingsSelector<T> = (state: SettingsStore) => T
type SettingsStoreApi = {
	getState: typeof useSettingsStoreBase.getState
	setState: typeof useSettingsStoreBase.setState
	subscribe: typeof useSettingsStoreBase.subscribe
	persist: typeof useSettingsStoreBase.persist
}

export const useSettingsStore = Object.assign(
	<T>(selector: SettingsSelector<T>) => useSettingsStoreBase(selector),
	{
		getState: useSettingsStoreBase.getState,
		setState: useSettingsStoreBase.setState,
		subscribe: useSettingsStoreBase.subscribe,
		persist: useSettingsStoreBase.persist,
	},
) as SettingsStoreApi & (<T>(selector: SettingsSelector<T>) => T)

export const useSettingsTheme = () => useSettingsStore((state) => state.theme)

export const useSettingsLanguage = () => useSettingsStore((state) => state.language)

export const useSettingsIsRTL = () => useSettingsStore((state) => state.isRTL)

export const useSettingsActions = () =>
	useSettingsStore(
		useShallow((state) => ({
			setTheme: state.setTheme,
			toggleTheme: state.toggleTheme,
			setLanguage: state.setLanguage,
			resetSettingsStoreState: state.resetSettingsStoreState,
		})),
	)

/**
 * Hook to handle UI preferences store rehydration
 * Use this in components that need the UI preferences store to be properly hydrated
 */
export const useSettingsStoreHydration = (): void => {
	useEffect(() => {
		if (isBrowser) {
			useSettingsStore.persist.rehydrate()
		}
	}, [])
}
