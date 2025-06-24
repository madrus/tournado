/**
 * @fileoverview Type Conversion Utilities and Division Helpers
 *
 * This file contains helper functions for the centralized type system, including:
 * - Division-related utility functions with localization support
 * - Type conversion functions for database-to-strict-type transformations
 * - Validation functions for type safety
 *
 * Key features:
 * - Database compatibility through controlled type conversion
 * - Localized division labels with fallback support
 * - Future-ready validation framework
 *
 * For detailed documentation, see: docs/development/type-system.md
 */
import { Category, Division } from '@prisma/client'

import { CATEGORIES, DIVISIONS } from './lib.constants'
import type {
  CategoryObject,
  DivisionObject,
  Email,
  TeamClass,
  TeamName,
} from './lib.types'

// Check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined'

/**
 * Gets the localized label for a division
 * @param division - The division enum value
 * @param language - The current language code (e.g., 'en', 'nl', 'ar', 'tr')
 * @param fallbackLanguage - Fallback language if the requested language is not available
 * @returns The localized division label
 */
export const getDivisionLabel = (
  division: Division,
  language = 'en',
  fallbackLanguage = 'en'
): string => {
  const divisionObject = DIVISIONS[division as keyof typeof DIVISIONS]

  if (!divisionObject) {
    return division // Return the division key if not found
  }

  const labels = divisionObject.labels

  // Return the requested language if available
  if (labels[language as keyof typeof labels]) {
    return labels[language as keyof typeof labels]
  }

  // Fallback to the fallback language
  if (labels[fallbackLanguage as keyof typeof labels]) {
    return labels[fallbackLanguage as keyof typeof labels]
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
  const validDivisions = getDivisionValues()
  if (validDivisions.includes(upperValue)) {
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

// Helper functions for the alternative DIVISIONS object implementation
export const getDivisionByValue = (value: string): DivisionObject | undefined =>
  Object.values(DIVISIONS).find(division => division.value === value)

export const getDivisionLabelByValue = (
  value: Division,
  locale: 'en' | 'nl' | 'ar' | 'tr'
): string => {
  const division = getDivisionByValue(value)
  return division ? division.labels[locale] : value
}

export const getAllDivisions = (): DivisionObject[] => Object.values(DIVISIONS)

export const getDivisionValues = (): Division[] => Object.values(Division)

// For form usage
export const stringToDivisionValue = (value: string | null): Division | undefined => {
  if (!value) return undefined

  const upperValue = value.toUpperCase() as Division
  return getDivisionValues().includes(upperValue) ? upperValue : undefined
}

// ============================================================================
// Category Helper Functions
// ============================================================================

/**
 * Gets the category object by its value
 * @param value - The category value (e.g., 'JO8', 'VETERANEN_35_PLUS')
 * @returns CategoryObject or undefined if not found
 */
export const getCategoryByValue = (value: string): CategoryObject | undefined =>
  Object.values(CATEGORIES).find(category => category.value === value)

/**
 * Gets the localized label for a category by its value
 * @param value - The category value (e.g., 'JO8', 'VETERANEN_35_PLUS')
 * @param locale - The current language code (e.g., 'en', 'nl', 'ar', 'tr')
 * @returns The localized category label
 */
export const getCategoryLabelByValue = (
  value: Category,
  locale: 'en' | 'nl' | 'ar' | 'tr'
): string => {
  const category = getCategoryByValue(value)
  return category ? category.labels[locale] : value
}

/**
 * Gets all category objects
 * @returns Array of all CategoryObject instances
 */
export const getAllCategories = (): CategoryObject[] => Object.values(CATEGORIES)

/**
 * Gets all category values
 * @returns Array of all Category enum values
 */
export const getCategoryValues = (): Category[] => Object.values(Category)

/**
 * Converts a string to Category enum value with validation
 * @param value - The string value from form data
 * @returns Category enum value or undefined if invalid
 */
export const stringToCategoryValue = (value: string | null): Category | undefined => {
  if (!value) return undefined

  const upperValue = value.toUpperCase() as Category
  return getCategoryValues().includes(upperValue) ? upperValue : undefined
}

// ============================================================================
// Type Conversion Helpers
// ============================================================================

/**
 * Converts a string to TeamName type with validation
 */
export const stringToTeamName = (
  value: string
): TeamName => // For now, we'll use type assertion since the database should contain valid team names
  // In the future, this could include validation logic
  value as TeamName

/**
 * Converts a string to Email type with validation
 */
export const stringToEmail = (
  value: string
): Email => // For now, we'll use type assertion since the database should contain valid emails
  // In the future, this could include validation logic
  value as Email

/**
 * Converts a string to TeamClass type (TeamClass is just string, so no conversion needed)
 */
export const stringToTeamClass = (value: string): TeamClass => value as TeamClass

/**
 * Converts a string value to a Category enum value
 * @param value - The string value from form data
 * @returns Category enum value or undefined if invalid
 */
export const stringToCategory = (value: string | null): Category | undefined => {
  if (!value) return undefined

  const upperValue = value.toUpperCase() as Category
  const validCategories = getCategoryValues()
  if (validCategories.includes(upperValue)) {
    return upperValue
  }

  return undefined
}

/**
 * Validates if a string is a valid Category enum value
 * @param value - The string value to validate
 * @returns true if valid Category enum value
 */
export const isValidCategory = (value: string | null): value is Category =>
  stringToCategory(value) !== undefined

/**
 * Custom team sorting function that handles category names with numbers properly
 * e.g., JO8 comes before JO10, MO12 comes before MO14, etc.
 *
 * Sorting order:
 * 1. Club name (alphabetical)
 * 2. Category (with numeric awareness for formats like JO8, MO12, etc.)
 * 3. Team name (alphabetical)
 */
export const sortTeams = <
  T extends { clubName: string; teamName: string; category?: string },
>(
  teams: T[]
): T[] =>
  teams.sort((a, b) => {
    // First sort by club name
    const clubComparison = a.clubName.localeCompare(b.clubName)
    if (clubComparison !== 0) return clubComparison

    // Then sort by category with numeric awareness
    if (a.category && b.category) {
      const categoryComparison = smartCategorySort(a.category, b.category)
      if (categoryComparison !== 0) return categoryComparison
    } else if (a.category && !b.category) {
      return -1 // Teams with categories come first
    } else if (!a.category && b.category) {
      return 1 // Teams without categories come last
    }

    // Finally sort by team name
    return a.teamName.localeCompare(b.teamName)
  })

/**
 * Smart category sorting that handles numeric parts in category names
 * Examples: JO8, JO10, MO12, MO14, etc.
 */
function smartCategorySort(categoryA: string, categoryB: string): number {
  // Extract the prefix (letters) and number from each category
  const parseCategory = (category: string) => {
    const match = category.match(/^([A-Za-z]+)(\d+)(.*)$/)
    if (match) {
      return {
        prefix: match[1].toLowerCase(),
        number: parseInt(match[2], 10),
        suffix: match[3].toLowerCase(),
        original: category.toLowerCase(),
      }
    }
    return {
      prefix: category.toLowerCase(),
      number: 0,
      suffix: '',
      original: category.toLowerCase(),
    }
  }

  const parsedA = parseCategory(categoryA)
  const parsedB = parseCategory(categoryB)

  // First compare the prefix (JO vs MO etc.)
  const prefixComparison = parsedA.prefix.localeCompare(parsedB.prefix)
  if (prefixComparison !== 0) return prefixComparison

  // Then compare the numbers numerically
  const numberComparison = parsedA.number - parsedB.number
  if (numberComparison !== 0) return numberComparison

  // Then compare the suffix
  const suffixComparison = parsedA.suffix.localeCompare(parsedB.suffix)
  if (suffixComparison !== 0) return suffixComparison

  // Finally, fall back to original string comparison
  return parsedA.original.localeCompare(parsedB.original)
}
