import { Division } from '@prisma/client'

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

/**
 * Division display labels for internationalization
 */
export const divisionLabels: Record<Division, { en: string; nl: string }> = {
  PREMIER_DIVISION: { en: 'Premier Division', nl: 'Hoofdklasse' },
  FIRST_DIVISION: { en: 'First Division', nl: '1ste klasse' },
  SECOND_DIVISION: { en: 'Second Division', nl: '2de klasse' },
  THIRD_DIVISION: { en: 'Third Division', nl: '3de klasse' },
  FOURTH_DIVISION: { en: 'Fourth Division', nl: '4de klasse' },
  FIFTH_DIVISION: { en: 'Fifth Division', nl: '5de klasse' },
}
