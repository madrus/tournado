import type { Category } from '@prisma/client'

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

export const formatCompetitionDate = (date: Date): string =>
	new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date)
