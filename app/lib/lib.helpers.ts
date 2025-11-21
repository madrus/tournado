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

import type { TeamClass, TeamName } from '~/features/teams/types'
import { useSettingsStore } from '~/stores/useSettingsStore'

import { CATEGORIES, DIVISIONS } from './lib.constants'
import type { CategoryObject, DivisionObject, Email } from './lib.types'

// Check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined'

/**
 * Gets the localized label for a division
 * @param division - The division enum value
 * @param language - The current language code (e.g., 'en', 'nl', 'ar', 'tr', 'fr')
 * @param fallbackLanguage - Fallback language if the requested language is not available
 * @returns The localized division label
 */
export const getDivisionLabel = (
	division: Division,
	language = 'nl',
	fallbackLanguage = 'nl',
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
	Object.values(DIVISIONS).find((division) => division.value === value)

export const getDivisionLabelByValue = (
	value: Division,
	locale: 'nl' | 'en' | 'de' | 'fr' | 'ar' | 'tr',
): string => {
	const division = getDivisionByValue(value)
	return division ? division.labels[locale] : value
}

/**
 * Gets the localized label for a division using the current language from settings store
 * Follows the same pattern as rtlUtils helpers (parameter-free, reads from store)
 * @param value - The division value
 * @returns The localized division label
 */
export const getCurrentDivisionLabel = (value: Division): string => {
	const language = useSettingsStore.getState().language
	return getDivisionLabelByValue(value, language)
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
	Object.values(CATEGORIES).find((category) => category.value === value)

/**
 * Gets the localized label for a category by its value
 * @param value - The category value (e.g., 'JO8', 'VETERANEN_35_PLUS')
 * @param locale - The current language code (e.g., 'en', 'nl', 'ar', 'tr', 'fr')
 * @returns The localized category label
 */
export const getCategoryLabelByValue = (
	value: Category,
	locale: 'nl' | 'en' | 'de' | 'fr' | 'ar' | 'tr',
): string => {
	const category = getCategoryByValue(value)
	return category ? category.labels[locale] : value
}

/**
 * Gets the localized label for a category using the current language from settings store
 * Follows the same pattern as rtlUtils helpers (parameter-free, reads from store)
 * @param value - The category value
 * @returns The localized category label
 */
export const getCurrentCategoryLabel = (value: Category): string => {
	const language = useSettingsStore.getState().language
	return getCategoryLabelByValue(value, language)
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
export const stringToTeamName = (value: string): TeamName =>
	// For now, we'll use type assertion since the database should contain valid team names
	// In the future, this could include validation logic
	value as TeamName

/**
 * Converts a string to Email type with validation
 */
export const stringToEmail = (value: string): Email =>
	// For now, we'll use type assertion since the database should contain valid emails
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
export const sortTeams = <T extends { name: string; clubName: string; category?: string }>(
	teams: T[],
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
		return a.name.localeCompare(b.name)
	})

/**
 * Smart category sorting that handles numeric values within category names
 * e.g., JO8, JO10, JO12 will be sorted numerically rather than alphabetically
 */
function smartCategorySort(a: string, b: string): number {
	// Regular expression to match category structure: prefix + number + optional suffix
	const categoryRegex = /^([A-Z]+)(\d+)(.*)$/i

	const matchA = a.match(categoryRegex)
	const matchB = b.match(categoryRegex)

	// If neither matches the pattern, fall back to alphabetical sort
	if (!matchA && !matchB) return a.localeCompare(b)

	// If only one matches the pattern, prioritize the structured one
	if (!matchA) return 1
	if (!matchB) return -1

	// Both match: compare prefix first
	const [, prefixA, numStrA, suffixA] = matchA
	const [, prefixB, numStrB, suffixB] = matchB

	const prefixComparison = prefixA.localeCompare(prefixB)
	if (prefixComparison !== 0) return prefixComparison

	// Same prefix: compare numbers numerically
	const numericA = parseInt(numStrA, 10)
	const numericB = parseInt(numStrB, 10)
	const numericComparison = numericA - numericB
	if (numericComparison !== 0) return numericComparison

	// Same prefix and number: compare suffix
	return suffixA.localeCompare(suffixB)
}

/**
 * Determines the validation status for a form field to display appropriate status icons
 *
 * This utility function provides consistent validation logic across different form components
 * for determining when to show success (green checkmark), error (red cross), or neutral (no icon) states.
 *
 * @param fieldValue - The current value of the field (string, array, or boolean)
 * @param hasError - Whether the field currently has a validation error
 * @param isRequired - Whether the field is required
 * @param isDisabled - Whether the field is disabled
 * @returns The status to display: 'success' (green checkmark), 'error' (red cross), or 'neutral' (no icon)
 *
 * @example
 * ```typescript
 * // Required text field with value and no error
 * getFieldStatus('John Doe', false, true, false) // returns 'success'
 *
 * // Required empty field with error
 * getFieldStatus('', true, true, false) // returns 'error'
 *
 * // Optional empty field
 * getFieldStatus('', false, false, false) // returns 'neutral'
 *
 * // Disabled field
 * getFieldStatus('', true, true, true) // returns 'neutral'
 *
 * // Array field (like toggle chips)
 * getFieldStatus(['item1', 'item2'], false, true, false) // returns 'success'
 * ```
 */
export function getFieldStatus(
	fieldValue: string | string[] | boolean,
	hasError: boolean,
	isRequired: boolean,
	isDisabled = false,
): 'success' | 'error' | 'neutral' {
	if (isDisabled) return 'neutral'

	// Determine if field has a value based on type
	const hasValue = Array.isArray(fieldValue) ? fieldValue.length > 0 : Boolean(fieldValue)

	// For required fields: show error if empty, success if filled
	if (isRequired) {
		if (hasValue && !hasError) return 'success'
		if (hasError) return 'error'
		return 'neutral'
	}

	// For optional fields: only show success if filled, never show error for being empty
	if (hasValue && !hasError) return 'success'
	if (hasError) return 'error'
	return 'neutral'
}

// ============================================================================
// i18n Helper Functions
// ============================================================================

/**
 * Recursively gets all keys from a nested object.
 * @param obj - The object to extract keys from.
 * @param prefix - The prefix for the keys.
 * @returns An array of all keys.
 */
export function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
	const keys: string[] = []

	for (const [key, value] of Object.entries(obj)) {
		const fullKey = prefix ? `${prefix}.${key}` : key

		if (typeof value === 'object' && value !== null) {
			keys.push(...getAllKeys(value as Record<string, unknown>, fullKey))
		} else {
			keys.push(fullKey)
		}
	}

	return keys.sort()
}

/**
 * Gets the keys that are in the reference array but not in the compare array.
 * @param referenceKeys - The array of reference keys.
 * @param compareKeys - The array of keys to compare.
 * @returns An array of missing keys.
 */
export const getMissingKeys = (referenceKeys: string[], compareKeys: string[]): string[] =>
	referenceKeys.filter((key) => !compareKeys.includes(key))

/**
 * Gets the keys that are in the compare array but not in the reference array.
 * @param referenceKeys - The array of reference keys.
 * @param compareKeys - The array of keys to compare.
 * @returns An array of extra keys.
 */
export const getExtraKeys = (referenceKeys: string[], compareKeys: string[]): string[] =>
	compareKeys.filter((key) => !referenceKeys.includes(key))
