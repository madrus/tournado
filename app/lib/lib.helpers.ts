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
import { Division } from '@prisma/client'

import { DIVISIONS } from './lib.constants'
import type {
  DivisionObject,
  DivisionValue,
  Email,
  TeamClass,
  TeamName,
} from './lib.types'

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

// Helper functions for the alternative DIVISIONS object implementation
export const getDivisionByValue = (value: string): DivisionObject | undefined =>
  Object.values(DIVISIONS).find(division => division.value === value)

export const getDivisionLabelByValue = (
  value: DivisionValue,
  locale: 'en' | 'nl' | 'ar' | 'tr'
): string => {
  const division = getDivisionByValue(value)
  return division ? division.labels[locale] : value
}

export const getAllDivisions = (): DivisionObject[] => Object.values(DIVISIONS)

export const getDivisionValues = (): DivisionValue[] =>
  Object.values(DIVISIONS).map(d => d.value)

// For form usage
export const stringToDivisionValue = (
  value: string | null
): DivisionValue | undefined => {
  if (!value) return undefined

  const upperValue = value.toUpperCase() as DivisionValue
  return getDivisionValues().includes(upperValue) ? upperValue : undefined
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
