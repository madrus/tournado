import { Division } from '@prisma/client'

/**
 * Division display labels for internationalization
 * Currently supports: English (en), Dutch (nl), Arabic (ar)
 */
export const divisionLabels: Record<Division, Record<string, string>> = {
  PREMIER_DIVISION: {
    en: 'Premier Division',
    nl: 'Hoofdklasse',
    ar: 'الدرجة الأولى',
  },
  FIRST_DIVISION: {
    en: 'First Division',
    nl: 'Eerste klasse',
    ar: 'الدرجة الثانية',
  },
  SECOND_DIVISION: {
    en: 'Second Division',
    nl: 'Tweede klasse',
    ar: 'الدرجة الثالثة',
  },
  THIRD_DIVISION: {
    en: 'Third Division',
    nl: 'Derde klasse',
    ar: 'الدرجة الرابعة',
  },
  FOURTH_DIVISION: {
    en: 'Fourth Division',
    nl: 'Vierde klasse',
    ar: 'الدرجة الخامسة',
  },
  FIFTH_DIVISION: {
    en: 'Fifth Division',
    nl: 'Vijfde klasse',
    ar: 'الدرجة السادسة',
  },
}

/**
 * Gets the localized label for a division
 * @param division - The division enum value
 * @param language - The current language code (e.g., 'en', 'nl', 'fr')
 * @param fallbackLanguage - Fallback language if the requested language is not available
 * @returns The localized division label
 */
export const getDivisionLabel = (
  division: Division,
  language = 'en',
  fallbackLanguage = 'en'
): string => {
  const labels = divisionLabels[division]

  // Return the requested language if available
  if (labels[language]) {
    return labels[language]
  }

  // Fallback to the fallback language
  if (labels[fallbackLanguage]) {
    return labels[fallbackLanguage]
  }

  // Last resort: return the division key itself
  return division
}

/**
 * Converts a string value to a Division enum value
 * @param value - The string value from form data
 * @returns Division enum value or undefined if invalid
 */
export const stringToDivision = (value: string | null): Division | undefined => {
  if (!value) return undefined

  const upperValue = value.toUpperCase() as Division
  if (Object.values(Division).includes(upperValue)) {
    return upperValue
  }

  return undefined
}

/**
 * Validates if a string is a valid Division enum value
 * @param value - The string value to validate
 * @returns true if valid Division enum value
 */
export const isValidDivision = (value: string | null): value is Division =>
  stringToDivision(value) !== undefined
