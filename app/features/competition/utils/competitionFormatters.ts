import type { Category } from '@prisma/client'

export const formatCompetitionCategories = (categories: readonly Category[]): string =>
	categories.join(', ')

export const formatCompetitionDate = (date: Date): string =>
	new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date)
