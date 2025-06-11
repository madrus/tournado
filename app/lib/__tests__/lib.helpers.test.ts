import { Division } from '@prisma/client'

import {
  getAllDivisions,
  getDivisionByValue,
  getDivisionLabel,
  getDivisionLabelByValue,
  getDivisionValues,
  isValidDivision,
  stringToDivision,
  stringToDivisionValue,
} from '../lib.helpers'
import type { DivisionValue } from '../lib.types'

describe('lib.helpers', () => {
  describe('getDivisionLabel', () => {
    it.each([
      [Division.PREMIER_DIVISION, 'en', 'Premier Division'],
      [Division.FIRST_DIVISION, 'en', 'First Division'],
      [Division.SECOND_DIVISION, 'en', 'Second Division'],
      [Division.THIRD_DIVISION, 'en', 'Third Division'],
      [Division.FOURTH_DIVISION, 'en', 'Fourth Division'],
      [Division.FIFTH_DIVISION, 'en', 'Fifth Division'],
    ])('should return correct English label for %s', (division, language, expected) => {
      expect(getDivisionLabel(division, language)).toBe(expected)
    })

    it.each([
      [Division.PREMIER_DIVISION, 'nl', 'Hoofdklasse'],
      [Division.FIRST_DIVISION, 'nl', 'Eerste klasse'],
      [Division.SECOND_DIVISION, 'nl', 'Tweede klasse'],
      [Division.THIRD_DIVISION, 'nl', 'Derde klasse'],
      [Division.FOURTH_DIVISION, 'nl', 'Vierde klasse'],
      [Division.FIFTH_DIVISION, 'nl', 'Vijfde klasse'],
    ])('should return correct Dutch label for %s', (division, language, expected) => {
      expect(getDivisionLabel(division, language)).toBe(expected)
    })

    it.each([
      [Division.PREMIER_DIVISION, 'ar', 'الدرجة الأولى'],
      [Division.FIRST_DIVISION, 'ar', 'الدرجة الثانية'],
      [Division.SECOND_DIVISION, 'ar', 'الدرجة الثالثة'],
    ])('should return correct Arabic label for %s', (division, language, expected) => {
      expect(getDivisionLabel(division, language)).toBe(expected)
    })

    it.each([
      [Division.PREMIER_DIVISION, 'fr', 'Premier Division'],
      [Division.FIRST_DIVISION, 'de', 'First Division'],
    ])(
      'should fallback to English when language %s not available for %s',
      (division, language, expected) => {
        expect(getDivisionLabel(division, language)).toBe(expected)
      }
    )

    it.each([
      [Division.PREMIER_DIVISION, 'fr', 'nl', 'Hoofdklasse'],
      [Division.FIRST_DIVISION, 'de', 'nl', 'Eerste klasse'],
    ])(
      'should fallback to custom fallback language for %s',
      (division, language, fallback, expected) => {
        expect(getDivisionLabel(division, language, fallback)).toBe(expected)
      }
    )

    it('should return division key when no language available', () => {
      // Test with a valid division but requesting a language that doesn't exist
      expect(getDivisionLabel(Division.PREMIER_DIVISION, 'invalid_lang' as never)).toBe(
        'Premier Division'
      )
    })

    it('should use English as default language', () => {
      expect(getDivisionLabel(Division.PREMIER_DIVISION)).toBe('Premier Division')
    })
  })

  describe('stringToDivision', () => {
    it.each([
      ['PREMIER_DIVISION', Division.PREMIER_DIVISION],
      ['FIRST_DIVISION', Division.FIRST_DIVISION],
      ['SECOND_DIVISION', Division.SECOND_DIVISION],
      ['THIRD_DIVISION', Division.THIRD_DIVISION],
      ['FOURTH_DIVISION', Division.FOURTH_DIVISION],
      ['FIFTH_DIVISION', Division.FIFTH_DIVISION],
    ])('should convert valid string %s to Division enum', (input, expected) => {
      expect(stringToDivision(input)).toBe(expected)
    })

    it.each([
      ['premier_division', Division.PREMIER_DIVISION],
      ['first_division', Division.FIRST_DIVISION],
      ['second_division', Division.SECOND_DIVISION],
    ])('should convert lowercase string %s to Division enum', (input, expected) => {
      expect(stringToDivision(input)).toBe(expected)
    })

    it.each([
      ['Premier_Division', Division.PREMIER_DIVISION],
      ['First_DIVISION', Division.FIRST_DIVISION],
    ])('should convert mixed case string %s to Division enum', (input, expected) => {
      expect(stringToDivision(input)).toBe(expected)
    })

    it.each([['INVALID_DIVISION'], ['random_string'], ['123'], ['']])(
      'should return undefined for invalid string %s',
      input => {
        expect(stringToDivision(input)).toBeUndefined()
      }
    )

    it.each([[null], [undefined]])('should return undefined for %s input', input => {
      expect(stringToDivision(input as unknown as string | null)).toBeUndefined()
    })
  })

  describe('isValidDivision', () => {
    it.each([
      ['PREMIER_DIVISION'],
      ['FIRST_DIVISION'],
      ['SECOND_DIVISION'],
      ['THIRD_DIVISION'],
      ['FOURTH_DIVISION'],
      ['FIFTH_DIVISION'],
    ])('should return true for valid division string %s', input => {
      expect(isValidDivision(input)).toBe(true)
    })

    it.each([['premier_division'], ['First_Division'], ['SECOND_division']])(
      'should return true for valid division string %s in any case',
      input => {
        expect(isValidDivision(input)).toBe(true)
      }
    )

    it.each([['INVALID_DIVISION'], ['random_string'], ['123'], ['']])(
      'should return false for invalid string %s',
      input => {
        expect(isValidDivision(input)).toBe(false)
      }
    )

    it.each([[null], [undefined]])('should return false for %s input', input => {
      expect(isValidDivision(input as unknown as string | null)).toBe(false)
    })
  })

  describe('getDivisionByValue', () => {
    it.each([
      ['PREMIER_DIVISION', 'PREMIER_DIVISION', 'Premier Division', 'Hoofdklasse', 1],
      ['FIRST_DIVISION', 'FIRST_DIVISION', 'First Division', 'Eerste klasse', 2],
    ])(
      'should return correct division object for %s',
      (input, value, enLabel, nlLabel, order) => {
        const division = getDivisionByValue(input)
        expect(division).toBeDefined()
        expect(division?.value).toBe(value)
        expect(division?.labels.en).toBe(enLabel)
        expect(division?.labels.nl).toBe(nlLabel)
        expect(division?.order).toBe(order)
      }
    )

    it.each([['INVALID_DIVISION'], ['random_string'], ['']])(
      'should return undefined for invalid value %s',
      input => {
        expect(getDivisionByValue(input)).toBeUndefined()
      }
    )

    it.each([['premier_division'], ['Premier_Division']])(
      'should be case sensitive for %s',
      input => {
        expect(getDivisionByValue(input)).toBeUndefined()
      }
    )
  })

  describe('getDivisionLabelByValue', () => {
    it.each<[string, 'en' | 'nl', string]>([
      ['PREMIER_DIVISION', 'en', 'Premier Division'],
      ['FIRST_DIVISION', 'en', 'First Division'],
      ['SECOND_DIVISION', 'en', 'Second Division'],
    ])('should return correct English label for %s', (value, language, expected) => {
      expect(getDivisionLabelByValue(value as DivisionValue, language)).toBe(expected)
    })

    it.each<[string, 'en' | 'nl', string]>([
      ['PREMIER_DIVISION', 'nl', 'Hoofdklasse'],
      ['FIRST_DIVISION', 'nl', 'Eerste klasse'],
      ['SECOND_DIVISION', 'nl', 'Tweede klasse'],
    ])('should return correct Dutch label for %s', (value, language, expected) => {
      expect(getDivisionLabelByValue(value as DivisionValue, language)).toBe(expected)
    })

    it.each<[string, 'en' | 'nl', string]>([
      ['INVALID_DIVISION', 'en', 'INVALID_DIVISION'],
      ['random_string', 'nl', 'random_string'],
    ])(
      'should return the value itself when division %s not found',
      (value, language, expected) => {
        expect(getDivisionLabelByValue(value as never, language)).toBe(expected)
      }
    )
  })

  describe('getAllDivisions', () => {
    it('should return all division objects', () => {
      const divisions = getAllDivisions()
      expect(divisions).toHaveLength(6)

      const values = divisions.map(d => d.value)
      const expectedValues = [
        'PREMIER_DIVISION',
        'FIRST_DIVISION',
        'SECOND_DIVISION',
        'THIRD_DIVISION',
        'FOURTH_DIVISION',
        'FIFTH_DIVISION',
      ]

      expectedValues.forEach(expectedValue => {
        expect(values).toContain(expectedValue)
      })
    })

    it('should return divisions with correct structure', () => {
      const divisions = getAllDivisions()
      divisions.forEach(division => {
        expect(division).toHaveProperty('value')
        expect(division).toHaveProperty('labels')
        expect(division).toHaveProperty('order')
        expect(division.labels).toHaveProperty('en')
        expect(division.labels).toHaveProperty('nl')
        expect(typeof division.value).toBe('string')
        expect(typeof division.labels.en).toBe('string')
        expect(typeof division.labels.nl).toBe('string')
        expect(typeof division.order).toBe('number')
      })
    })

    it('should return divisions in correct order', () => {
      const divisions = getAllDivisions()
      const orders = divisions.map(d => d.order)
      expect(orders).toEqual([1, 2, 3, 4, 5, 6])
    })
  })

  describe('getDivisionValues', () => {
    it('should return all division values', () => {
      const values = getDivisionValues()
      expect(values).toHaveLength(6)

      const expectedValues = [
        'PREMIER_DIVISION',
        'FIRST_DIVISION',
        'SECOND_DIVISION',
        'THIRD_DIVISION',
        'FOURTH_DIVISION',
        'FIFTH_DIVISION',
      ]

      expectedValues.forEach(expectedValue => {
        expect(values).toContain(expectedValue)
      })
    })

    it('should return only string values', () => {
      const values = getDivisionValues()
      values.forEach(value => {
        expect(typeof value).toBe('string')
      })
    })
  })

  describe('stringToDivisionValue', () => {
    it.each([
      ['PREMIER_DIVISION', 'PREMIER_DIVISION'],
      ['FIRST_DIVISION', 'FIRST_DIVISION'],
      ['SECOND_DIVISION', 'SECOND_DIVISION'],
      ['THIRD_DIVISION', 'THIRD_DIVISION'],
      ['FOURTH_DIVISION', 'FOURTH_DIVISION'],
      ['FIFTH_DIVISION', 'FIFTH_DIVISION'],
    ])('should convert valid string %s to DivisionValue', (input, expected) => {
      expect(stringToDivisionValue(input)).toBe(expected)
    })

    it.each([
      ['premier_division', 'PREMIER_DIVISION'],
      ['first_division', 'FIRST_DIVISION'],
      ['second_division', 'SECOND_DIVISION'],
    ])('should convert lowercase string %s to DivisionValue', (input, expected) => {
      expect(stringToDivisionValue(input)).toBe(expected)
    })

    it.each([
      ['Premier_Division', 'PREMIER_DIVISION'],
      ['First_DIVISION', 'FIRST_DIVISION'],
    ])('should convert mixed case string %s to DivisionValue', (input, expected) => {
      expect(stringToDivisionValue(input)).toBe(expected)
    })

    it.each([['INVALID_DIVISION'], ['random_string'], ['123'], ['']])(
      'should return undefined for invalid string %s',
      input => {
        expect(stringToDivisionValue(input)).toBeUndefined()
      }
    )

    it.each([[null], [undefined]])('should return undefined for %s input', input => {
      expect(stringToDivisionValue(input as unknown as string | null)).toBeUndefined()
    })
  })

  describe('Integration tests', () => {
    it('should have consistent behavior between string conversion functions', () => {
      const testStrings = ['PREMIER_DIVISION', 'first_division', 'Second_DIVISION']

      testStrings.forEach(testString => {
        const prismaResult = stringToDivision(testString)
        const valueResult = stringToDivisionValue(testString)
        const isValid = isValidDivision(testString)

        if (prismaResult && valueResult) {
          expect(isValid).toBe(true)
          expect(prismaResult).toBe(valueResult)
        } else {
          expect(isValid).toBe(false)
          expect(prismaResult).toBeUndefined()
          expect(valueResult).toBeUndefined()
        }
      })
    })

    it('should have consistent labels between different implementations', () => {
      const divisions = getAllDivisions()

      divisions.forEach(division => {
        // Test English labels
        const labelFromHelper = getDivisionLabel(division.value as Division, 'en')
        const labelFromValue = getDivisionLabelByValue(division.value, 'en')
        expect(labelFromHelper).toBe(labelFromValue)

        // Test Dutch labels
        const nlLabelFromHelper = getDivisionLabel(division.value as Division, 'nl')
        const nlLabelFromValue = getDivisionLabelByValue(division.value, 'nl')
        expect(nlLabelFromHelper).toBe(nlLabelFromValue)
      })
    })

    it('should maintain order consistency', () => {
      const divisions = getAllDivisions()
      const sortedByOrder = [...divisions].sort((a, b) => a.order - b.order)
      expect(divisions).toEqual(sortedByOrder)
    })
  })
})
