import type { Category } from '@prisma/client'

import { FALLBACK_LANGUAGE } from '~/i18n/config'

export const formatCompetitionCategories = (
	categories: string | readonly Category[],
): string => {
	// If categories is a string, parse it
	if (typeof categories === 'string') {
		try {
			const parsed = JSON.parse(categories)
			// Validate it's an array
			if (Array.isArray(parsed)) {
				return parsed.join(', ')
			}
			return ''
		} catch {
			return ''
		}
	}

	// If it's already an array, join it
	return categories.join(', ')
}

export const formatCompetitionDate = (date: Date, locale?: string): string => {
	const userLocale = locale || FALLBACK_LANGUAGE
	return new Intl.DateTimeFormat(userLocale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date)
}
