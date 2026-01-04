import {
	FALLBACK_LANGUAGE,
	initI18n,
	type Language,
	SUPPORTED_LANGUAGE_CODES,
} from '~/i18n/config'

/**
 * Extracts the user's language preference from the request cookies
 * @param request - The incoming request
 * @returns The user's preferred language or fallback to the default language
 */
export function getLanguageFromRequest(request: Request): Language {
	const cookieHeader = request.headers.get('Cookie') || ''
	const langMatch = cookieHeader.match(/lang=([^;]+)/)
	const rawLanguage = langMatch?.[1]?.trim()

	// Return the language if supported, otherwise fallback to default
	return SUPPORTED_LANGUAGE_CODES.includes(rawLanguage as Language)
		? (rawLanguage as Language)
		: FALLBACK_LANGUAGE
}

/**
 * Gets a translation function (t) for server-side use
 * @param request - The incoming request
 * @returns Translation function bound to the user's language
 */
export function getServerT(request: Request): ReturnType<typeof initI18n>['t'] {
	const language = getLanguageFromRequest(request)
	const i18n = initI18n(language)
	return i18n.t.bind(i18n)
}
