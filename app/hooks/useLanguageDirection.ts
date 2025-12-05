import { useEffect, useMemo, useState } from 'react'
import type { Language } from '~/i18n/config'
import { useSettingsStore } from '~/stores/useSettingsStore'
import {
	getDirection,
	getLatinFontFamily,
	getSwipeRowConfig,
	type SwipeRowConfig,
} from '~/utils/rtlUtils'

export type LanguageDirection = {
	/** Direction attribute value: 'rtl' or 'ltr' */
	direction: 'rtl' | 'ltr'
	/** Latin font class for overriding Arabic font in RTL context */
	latinFontClass: string
	/** Configuration for swipeable rows with direction multiplier */
	swipeConfig: SwipeRowConfig
	/** Whether the app is fully hydrated (use for conditional rendering if needed) */
	isHydrated: boolean
}

/**
 * Hook that provides all language direction-related utilities
 * Uses SSR window vars until hydrated to prevent mismatch/flash
 */
export function useLanguageDirection(): LanguageDirection {
	const [isHydrated, setIsHydrated] = useState(false)
	const currentLanguage = useSettingsStore((state) => state.language)

	useEffect(() => {
		setIsHydrated(true)
	}, [])

	// Direct cookie read for accuracy until hydrated
	const getCookieLang = (): Language => {
		if (typeof document === 'undefined') return 'nl'
		const match = document.cookie.match(/lang=([^;]+)/)
		const raw = match ? match[1] : null
		if (!raw) return 'nl'
		// Normalize Arabic variants to 'ar' (e.g., 'ar-SA' -> 'ar')
		const normalized = raw.startsWith('ar') ? 'ar' : raw
		if (!normalized) return 'nl'
		// Validate against supported (include 'ar' explicitly)
		const supported = ['nl', 'en', 'de', 'fr', 'tr', 'ar']
		return supported.includes(normalized) ? (normalized as Language) : 'nl'
	}

	const effectiveLanguage = isHydrated ? currentLanguage : getCookieLang()

	return useMemo(
		() => ({
			direction: getDirection(effectiveLanguage),
			latinFontClass: getLatinFontFamily(effectiveLanguage),
			swipeConfig: getSwipeRowConfig(effectiveLanguage),
			isHydrated,
		}),
		[effectiveLanguage, isHydrated],
	)
}
