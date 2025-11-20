import { useEffect } from 'react'

import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import type { Language } from '~/i18n/config'
import { isBrowser } from '~/lib/lib.helpers'

type Theme = 'light' | 'dark'

type StoreState = {
	isRTL: boolean
	language: Language
	systemThemeDetected: boolean
	theme: Theme
}

type Actions = {
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
	setLanguage: (language: Language) => void
	resetSettingsStoreState: () => void
	detectSystemTheme: () => void
}

// Theme switching is now instant with no global transitions to manage

const storeName = 'UIPreferencesStore'

const initialStoreState: StoreState = {
	theme: 'light',
	isRTL: false,
	language: 'nl',
	systemThemeDetected: false,
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
			(set, _get) => ({
				...initialStoreState,
				resetSettingsStoreState: () => {
					set(initialStoreState, false, 'resetStoreState')
				},
				setTheme: (theme) => {
					// Persist to both localStorage and cookies for server-side access
					if (isBrowser) {
						document.cookie = `theme=${theme}; path=/; max-age=31536000`
					}
					// Mark as user override when manually setting theme
					set({ theme, systemThemeDetected: false }, false, 'setTheme')
				},
				toggleTheme: () => {
					set(
						(state) => {
							const newTheme = state.theme === 'light' ? 'dark' : 'light'
							// Persist to cookies for server-side access
							if (isBrowser) {
								document.cookie = `theme=${newTheme}; path=/; max-age=31536000`
							}
							// Mark as user override when manually toggling theme
							return { theme: newTheme, systemThemeDetected: false }
						},
						false,
						'toggleTheme',
					)
				},
				setLanguage: (language) => {
					// Persist to both localStorage and cookies for server-side access
					if (isBrowser) {
						document.cookie = `lang=${language}; path=/; max-age=31536000`
					}
					// Compute isRTL from language
					const isRTL = language.split('-')[0] === 'ar'
					set({ language, isRTL }, false, 'setLanguage')
				},
				detectSystemTheme: () => {
					if (!isBrowser) return

					const state = useSettingsStore.getState()
					// Only detect system theme if we haven't done so already
					if (state.systemThemeDetected) return

					const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
					const systemTheme: Theme = mediaQuery.matches ? 'dark' : 'light'

					// Set the theme and mark as detected
					set({ theme: systemTheme, systemThemeDetected: true }, false, 'detectSystemTheme')

					// Persist to cookies for server-side access
					document.cookie = `theme=${systemTheme}; path=/; max-age=31536000`

					// Listen for system theme changes
					const handleThemeChange = (event: MediaQueryListEvent) => {
						const newSystemTheme: Theme = event.matches ? 'dark' : 'light'
						const currentState = useSettingsStore.getState()

						// Only auto-update if user hasn't manually overridden
						if (currentState.systemThemeDetected) {
							useSettingsStore.getState().setTheme(newSystemTheme)
						}
					}

					mediaQuery.addEventListener('change', handleThemeChange)

					// Cleanup function would need to be handled by component using this
					return () => mediaQuery.removeEventListener('change', handleThemeChange)
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
				partialize: (state) => (isBrowser ? state : {}),
			},
		),
		{
			name: storeName,
		},
	),
)

/**
 * Hook to handle UI preferences store rehydration and system theme detection
 * Use this in components that need the UI preferences store to be properly hydrated
 */
export const useSettingsStoreHydration = (): void => {
	useEffect(() => {
		if (isBrowser) {
			useSettingsStore.persist.rehydrate()

			// Detect system theme on first app load
			const cleanup = useSettingsStore.getState().detectSystemTheme()

			// Return cleanup function
			return cleanup
		}
	}, [])
}
