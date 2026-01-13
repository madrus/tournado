import { FALLBACK_LANGUAGE } from '~/i18n/config'
import { getCategoryValues } from '~/lib/lib.helpers'
import type { Category } from '~/lib/lib.types'

export const formatCompetitionCategories = (
  categories: string | readonly Category[],
): string => {
  const categoryValues = getCategoryValues()

  // If categories is a string, parse it
  if (typeof categories === 'string') {
    try {
      const parsed = JSON.parse(categories)
      // Validate it's an array
      if (Array.isArray(parsed)) {
        const isValid = parsed.every(item => categoryValues.includes(item as Category))
        return isValid ? parsed.join(', ') : ''
      }
      return ''
    } catch {
      return ''
    }
  }

  // If it's already an array, join it
  const isValid = categories.every(item => categoryValues.includes(item))
  return isValid ? categories.join(', ') : ''
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
