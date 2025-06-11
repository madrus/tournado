/**
 * Alternative Division implementation as an object type
 * This demonstrates how we could replace the Prisma enum with a TypeScript object
 */

export const DIVISIONS = {
  PREMIER_DIVISION: {
    value: 'PREMIER_DIVISION',
    labels: { en: 'Premier Division', nl: 'Hoofdklasse' },
    order: 1,
  },
  FIRST_DIVISION: {
    value: 'FIRST_DIVISION',
    labels: { en: 'First Division', nl: '1ste klasse' },
    order: 2,
  },
  SECOND_DIVISION: {
    value: 'SECOND_DIVISION',
    labels: { en: 'Second Division', nl: '2de klasse' },
    order: 3,
  },
  THIRD_DIVISION: {
    value: 'THIRD_DIVISION',
    labels: { en: 'Third Division', nl: '3de klasse' },
    order: 4,
  },
  FOURTH_DIVISION: {
    value: 'FOURTH_DIVISION',
    labels: { en: 'Fourth Division', nl: '4de klasse' },
    order: 5,
  },
  FIFTH_DIVISION: {
    value: 'FIFTH_DIVISION',
    labels: { en: 'Fifth Division', nl: '5de klasse' },
    order: 6,
  },
} as const

// Type derivation from the object
export type DivisionKey = keyof typeof DIVISIONS
export type DivisionValue = (typeof DIVISIONS)[DivisionKey]['value']
export type Division = (typeof DIVISIONS)[DivisionKey]

// Helper functions
export const getDivisionByValue = (value: string): Division | undefined =>
  Object.values(DIVISIONS).find(division => division.value === value)

export const getDivisionLabel = (value: DivisionValue, locale: 'en' | 'nl'): string => {
  const division = getDivisionByValue(value)
  return division ? division.labels[locale] : value
}

export const getAllDivisions = (): Division[] => Object.values(DIVISIONS)

export const getDivisionValues = (): DivisionValue[] =>
  Object.values(DIVISIONS).map(d => d.value)

// For form usage
export const stringToDivision = (value: string | null): DivisionValue | undefined => {
  if (!value) return undefined

  const upperValue = value.toUpperCase() as DivisionValue
  return getDivisionValues().includes(upperValue) ? upperValue : undefined
}
