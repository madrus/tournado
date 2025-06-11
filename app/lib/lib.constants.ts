// Division constants
import { Division } from '@prisma/client'

export const PWA_UPDATE_INTERVAL = 60 * 60 * 1000

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
    labels: { en: 'First Division', nl: 'Eerste klasse' },
    order: 2,
  },
  SECOND_DIVISION: {
    value: 'SECOND_DIVISION',
    labels: { en: 'Second Division', nl: 'Tweede klasse' },
    order: 3,
  },
  THIRD_DIVISION: {
    value: 'THIRD_DIVISION',
    labels: { en: 'Third Division', nl: 'Derde klasse' },
    order: 4,
  },
  FOURTH_DIVISION: {
    value: 'FOURTH_DIVISION',
    labels: { en: 'Fourth Division', nl: 'Vierde klasse' },
    order: 5,
  },
  FIFTH_DIVISION: {
    value: 'FIFTH_DIVISION',
    labels: { en: 'Fifth Division', nl: 'Vijfde klasse' },
    order: 6,
  },
} as const
