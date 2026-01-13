/**
 * Lazy-Loading i18n Configuration
 *
 * Performance-optimized i18n setup that only loads the chosen language.
 * This reduces initial bundle size significantly.
 */
import { type i18n as I18nType, type Resource, createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { loadTranslationCached, translationCache, warmCache } from './cache'

export const defaultNS = 'root'

export const SUPPORTED_LANGUAGES = [
	{ code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
	{ code: 'en', name: 'English', flag: '🇬🇧' },
	{ code: 'de', name: 'Deutsch', flag: '🇩🇪' },
	{ code: 'fr', name: 'Français', flag: '🇫🇷' },
	{ code: 'ar', name: 'العربية', flag: '🇲🇦' },
	{ code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
] as const

/**
 * Load only the requested language translation with caching
 */
const loadTranslation = async (language: string): Promise<unknown> =>
	loadTranslationCached(language, async (lang: string) => {
		try {
			let translationModule: { default: unknown }

			// Dynamic import - only the requested language
			switch (lang) {
				case 'nl':
					translationModule = await import('./locales/nl.json')
					break
				case 'en':
					translationModule = await import('./locales/en.json')
					break
				case 'de':
					translationModule = await import('./locales/de.json')
					break
				case 'fr':
					translationModule = await import('./locales/fr.json')
					break
				case 'ar':
					translationModule = await import('./locales/ar.json')
					break
				case 'tr':
					translationModule = await import('./locales/tr.json')
					break
				default:
					// Fallback to Dutch
					translationModule = await import('./locales/nl.json')
			}

			return translationModule.default || translationModule
		} catch (error) {
			// Fallback to Dutch
			if (lang !== 'nl') {
				const fallback = await import('./locales/nl.json')
				return fallback.default || fallback
			}

			throw error
		}
	})

/**
 * Initialize i18n with lazy loading - only loads the chosen language
 */
export async function initI18nLazy(language: string): Promise<I18nType> {
	const instance = createInstance()

	// Load only the requested language
	const initialTranslation = await loadTranslation(language)

	const resources = {
		[language]: {
			[defaultNS]: initialTranslation,
		},
	} as Resource

	instance.use(initReactI18next)

	await instance.init({
		compatibilityJSON: 'v4',
		resources,
		defaultNS,
		fallbackLng: language, // Use chosen language as fallback
		lng: language,
		interpolation: {
			escapeValue: false,
		},
		initImmediate: false,
	})

	// Enhanced language switching with lazy loading
	const originalChangeLanguage = instance.changeLanguage.bind(instance)
	instance.changeLanguage = async (lng: string) => {
		// Only load if we don't have this language yet
		if (!instance.hasResourceBundle(lng, defaultNS)) {
			try {
				const newTranslation = await loadTranslation(lng)
				instance.addResourceBundle(lng, defaultNS, newTranslation)
			} catch (error) {
				return Promise.reject(error)
			}
		}
		return originalChangeLanguage(lng)
	}

	return instance
}

/**
 * Calculate bundle size savings
 */
export function getBundleSavings(): {
	lazySize: number
	fullSize: number
	savings: string
} {
	// Estimate: each locale is ~8KB, we have 6 locales
	const estimatedLocaleSize = 8 * 1024 // 8KB per locale
	const totalLocales = SUPPORTED_LANGUAGES.length

	const fullSize = estimatedLocaleSize * totalLocales // All locales loaded
	const lazySize = estimatedLocaleSize // Only one locale loaded

	const savingsBytes = fullSize - lazySize
	const savingsPercent = ((savingsBytes / fullSize) * 100).toFixed(1)

	return {
		lazySize,
		fullSize,
		savings: `${(savingsBytes / 1024).toFixed(1)}KB (${savingsPercent}%)`,
	}
}

/**
 * Warm cache with critical languages (e.g., user's preferred + fallback)
 */
export async function warmCriticalLanguages(primaryLanguage: string): Promise<void> {
	const criticalLanguages = [primaryLanguage]

	// Add Dutch as fallback if not primary
	if (primaryLanguage !== 'nl') {
		criticalLanguages.push('nl')
	}

	await warmCache(criticalLanguages, loadTranslation)
}

/**
 * Get cache performance statistics
 */
export const getCacheStats = (): CacheStats & { hitRate: number } => ({
	...translationCache.getStats(),
	hitRate: translationCache.getHitRate(),
})

// Development utilities
if (process.env.NODE_ENV === 'development') {
	const _savings = getBundleSavings()

	// Log cache stats periodically
	setInterval(() => {
		const stats = getCacheStats()
		if (stats.size > 0) {
		}
	}, 30000) // Every 30 seconds
}

interface CacheStats {
	hits: number
	misses: number
	size: number
	memoryUsage: number
	languages: string[]
}
