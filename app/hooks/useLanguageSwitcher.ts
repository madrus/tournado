import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Language } from '~/i18n/config'
import { useSettingsStore } from '~/stores/useSettingsStore'

type UseLanguageSwitcherReturn = {
	switchLanguage: (langCode: Language) => void
	currentLanguage: Language
}

/**
 * Hook for switching languages in the application.
 * Updates the theme store which acts as the single source of truth.
 * The store handles cookie and localStorage persistence automatically.
 * The i18n instance will be updated automatically when the store changes.
 */
export function useLanguageSwitcher(): UseLanguageSwitcherReturn {
	const { i18n } = useTranslation()
	const { language: storeLanguage, setLanguage } = useSettingsStore()

	const [isHydrated, setIsHydrated] = useState(false)

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

	const effectiveLanguage = isHydrated ? storeLanguage : getCookieLang()

	const switchLanguage = (lang: Language) => {
		i18n.changeLanguage(lang)
		setLanguage(lang)
	}

	return {
		currentLanguage: effectiveLanguage,
		switchLanguage,
	}
}
