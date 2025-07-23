import { Division } from '@prisma/client'

import {
  getAllDivisions,
  getDivisionByValue,
  getDivisionLabel,
  getDivisionLabelByValue,
  getDivisionValues,
  isValidCategory,
  isValidDivision,
  sortTeams,
  stringToCategory,
  stringToDivision,
  stringToDivisionValue,
} from '../lib.helpers'

// Use our division values for tests
const TestDivision = {
  PREMIER_DIVISION: 'PREMIER_DIVISION',
  FIRST_DIVISION: 'FIRST_DIVISION',
  SECOND_DIVISION: 'SECOND_DIVISION',
  THIRD_DIVISION: 'THIRD_DIVISION',
  FOURTH_DIVISION: 'FOURTH_DIVISION',
  FIFTH_DIVISION: 'FIFTH_DIVISION',
} as const

describe('lib.helpers', () => {
  describe('getDivisionLabel', () => {
    it.each([
      [TestDivision.PREMIER_DIVISION, 'en', 'Premier Division'],
      [TestDivision.FIRST_DIVISION, 'en', 'First Division'],
      [TestDivision.SECOND_DIVISION, 'en', 'Second Division'],
      [TestDivision.THIRD_DIVISION, 'en', 'Third Division'],
      [TestDivision.FOURTH_DIVISION, 'en', 'Fourth Division'],
      [TestDivision.FIFTH_DIVISION, 'en', 'Fifth Division'],
    ])('should return correct English label for %s', (division, language, expected) => {
      expect(getDivisionLabel(division as Division, language)).toBe(expected)
    })

    it.each([
      [TestDivision.PREMIER_DIVISION, 'nl', 'Hoofdklasse'],
      [TestDivision.FIRST_DIVISION, 'nl', 'Eerste klasse'],
      [TestDivision.SECOND_DIVISION, 'nl', 'Tweede klasse'],
      [TestDivision.THIRD_DIVISION, 'nl', 'Derde klasse'],
      [TestDivision.FOURTH_DIVISION, 'nl', 'Vierde klasse'],
      [TestDivision.FIFTH_DIVISION, 'nl', 'Vijfde klasse'],
    ])('should return correct Dutch label for %s', (division, language, expected) => {
      expect(getDivisionLabel(division as Division, language)).toBe(expected)
    })

    it.each([
      [TestDivision.PREMIER_DIVISION, 'ar', 'الدرجة الأولى'],
      [TestDivision.FIRST_DIVISION, 'ar', 'الدرجة الثانية'],
      [TestDivision.SECOND_DIVISION, 'ar', 'الدرجة الثالثة'],
    ])('should return correct Arabic label for %s', (division, language, expected) => {
      expect(getDivisionLabel(division as Division, language)).toBe(expected)
    })

    it.each([
      [TestDivision.PREMIER_DIVISION, 'fr', 'Division Première'],
      [TestDivision.FIRST_DIVISION, 'fr', 'Première Division'],
      [TestDivision.SECOND_DIVISION, 'fr', 'Deuxième Division'],
    ])('should return correct French label for %s', (division, language, expected) => {
      expect(getDivisionLabel(division as Division, language)).toBe(expected)
    })

    it.each([
      [TestDivision.PREMIER_DIVISION, 'de', 'Hoofdklasse'],
      [TestDivision.FIRST_DIVISION, 'es', 'Eerste klasse'],
    ])(
      'should fallback to Dutch when language %s not available for %s',
      (division, language, expected) => {
        expect(getDivisionLabel(division as Division, language)).toBe(expected)
      }
    )

    it.each([
      [TestDivision.PREMIER_DIVISION, 'de', 'nl', 'Hoofdklasse'],
      [TestDivision.FIRST_DIVISION, 'es', 'nl', 'Eerste klasse'],
    ])(
      'should fallback to custom fallback language for %s',
      (division, language, fallback, expected) => {
        expect(getDivisionLabel(division as Division, language, fallback)).toBe(
          expected
        )
      }
    )

    it('should return division key when no language available', () => {
      // Test with a valid division but requesting a language that doesn't exist
      expect(
        getDivisionLabel(
          TestDivision.PREMIER_DIVISION as Division,
          'invalid_lang' as never
        )
      ).toBe('Hoofdklasse')
    })

    it('should use Dutch as default language', () => {
      expect(getDivisionLabel(TestDivision.PREMIER_DIVISION as Division)).toBe(
        'Hoofdklasse'
      )
    })
  })

  describe('stringToDivision', () => {
    it.each([
      ['PREMIER_DIVISION', TestDivision.PREMIER_DIVISION],
      ['FIRST_DIVISION', TestDivision.FIRST_DIVISION],
      ['SECOND_DIVISION', TestDivision.SECOND_DIVISION],
      ['THIRD_DIVISION', TestDivision.THIRD_DIVISION],
      ['FOURTH_DIVISION', TestDivision.FOURTH_DIVISION],
      ['FIFTH_DIVISION', TestDivision.FIFTH_DIVISION],
    ])('should convert valid string %s to Division', (input, expected) => {
      expect(stringToDivision(input)).toBe(expected)
    })

    it.each([
      ['premier_division', TestDivision.PREMIER_DIVISION],
      ['first_division', TestDivision.FIRST_DIVISION],
      ['second_division', TestDivision.SECOND_DIVISION],
    ])('should convert lowercase string %s to Division', (input, expected) => {
      expect(stringToDivision(input)).toBe(expected)
    })

    it.each([
      ['Premier_Division', TestDivision.PREMIER_DIVISION],
      ['First_DIVISION', TestDivision.FIRST_DIVISION],
    ])('should convert mixed case string %s to Division', (input, expected) => {
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
      expect(getDivisionLabelByValue(value as Division, language)).toBe(expected)
    })

    it.each<[string, 'en' | 'nl', string]>([
      ['PREMIER_DIVISION', 'nl', 'Hoofdklasse'],
      ['FIRST_DIVISION', 'nl', 'Eerste klasse'],
      ['SECOND_DIVISION', 'nl', 'Tweede klasse'],
    ])('should return correct Dutch label for %s', (value, language, expected) => {
      expect(getDivisionLabelByValue(value as Division, language)).toBe(expected)
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
        const labelFromValue = getDivisionLabelByValue(division.value as Division, 'en')
        expect(labelFromHelper).toBe(labelFromValue)

        // Test Dutch labels
        const nlLabelFromHelper = getDivisionLabel(division.value as Division, 'nl')
        const nlLabelFromValue = getDivisionLabelByValue(
          division.value as Division,
          'nl'
        )
        expect(nlLabelFromHelper).toBe(nlLabelFromValue)
      })
    })

    it('should maintain order consistency', () => {
      const divisions = getAllDivisions()
      const sortedByOrder = [...divisions].sort((a, b) => a.order - b.order)
      expect(divisions).toEqual(sortedByOrder)
    })
  })

  describe('stringToCategory', () => {
    // Valid Category enum values
    const validCategories = [
      'JO8',
      'JO9',
      'JO10',
      'JO11',
      'JO12',
      'JO13',
      'JO14',
      'JO15',
      'JO16',
      'JO17',
      'JO19',
      'MO8',
      'MO9',
      'MO10',
      'MO11',
      'MO12',
      'MO13',
      'MO14',
      'MO15',
      'MO16',
      'MO17',
      'MO19',
      'VETERANEN_35_PLUS',
      'VETERANEN_40_PLUS',
      'VETERANEN_45_PLUS',
      'VETERANEN_50_PLUS',
    ]

    validCategories.forEach(category => {
      it(`should convert valid string ${category} to Category enum`, () => {
        const result = stringToCategory(category)
        expect(result).toBe(category)
      })
    })

    // Case insensitive tests
    it('should convert lowercase string jo8 to Category enum', () => {
      const result = stringToCategory('jo8')
      expect(result).toBe('JO8')
    })

    it('should convert mixed case string Jo9 to Category enum', () => {
      const result = stringToCategory('Jo9')
      expect(result).toBe('JO9')
    })

    it('should convert lowercase string veteranen_35_plus to Category enum', () => {
      const result = stringToCategory('veteranen_35_plus')
      expect(result).toBe('VETERANEN_35_PLUS')
    })

    // Invalid inputs
    it('should return undefined for invalid string INVALID_CATEGORY', () => {
      const result = stringToCategory('INVALID_CATEGORY')
      expect(result).toBeUndefined()
    })

    it('should return undefined for invalid string random_string', () => {
      const result = stringToCategory('random_string')
      expect(result).toBeUndefined()
    })

    it('should return undefined for invalid string 123', () => {
      const result = stringToCategory('123')
      expect(result).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      const result = stringToCategory('')
      expect(result).toBeUndefined()
    })

    it('should return undefined for null input', () => {
      const result = stringToCategory(null)
      expect(result).toBeUndefined()
    })

    it('should return undefined for undefined input', () => {
      const result = stringToCategory(undefined as unknown as string | null)
      expect(result).toBeUndefined()
    })
  })

  describe('isValidCategory', () => {
    const validCategories = [
      'JO8',
      'JO9',
      'JO10',
      'JO11',
      'JO12',
      'JO13',
      'JO14',
      'JO15',
      'JO16',
      'JO17',
      'JO19',
      'MO8',
      'MO9',
      'MO10',
      'MO11',
      'MO12',
      'MO13',
      'MO14',
      'MO15',
      'MO16',
      'MO17',
      'MO19',
      'VETERANEN_35_PLUS',
      'VETERANEN_40_PLUS',
      'VETERANEN_45_PLUS',
      'VETERANEN_50_PLUS',
    ]

    validCategories.forEach(category => {
      it(`should return true for valid category string ${category}`, () => {
        const result = isValidCategory(category)
        expect(result).toBe(true)
      })
    })

    // Case insensitive tests
    it('should return true for valid category string jo8 in any case', () => {
      const result = isValidCategory('jo8')
      expect(result).toBe(true)
    })

    it('should return true for valid category string Mo9 in any case', () => {
      const result = isValidCategory('Mo9')
      expect(result).toBe(true)
    })

    it('should return true for valid category string veteranen_40_plus in any case', () => {
      const result = isValidCategory('veteranen_40_plus')
      expect(result).toBe(true)
    })

    // Invalid inputs
    it('should return false for invalid string INVALID_CATEGORY', () => {
      const result = isValidCategory('INVALID_CATEGORY')
      expect(result).toBe(false)
    })

    it('should return false for invalid string random_string', () => {
      const result = isValidCategory('random_string')
      expect(result).toBe(false)
    })

    it('should return false for invalid string 123', () => {
      const result = isValidCategory('123')
      expect(result).toBe(false)
    })

    it('should return false for empty string', () => {
      const result = isValidCategory('')
      expect(result).toBe(false)
    })

    it('should return false for null input', () => {
      const result = isValidCategory(null)
      expect(result).toBe(false)
    })

    it('should return false for undefined input', () => {
      const result = isValidCategory(undefined as unknown as string | null)
      expect(result).toBe(false)
    })
  })

  describe('sortTeams', () => {
    const mockTeams = [
      { id: '1', clubName: 'Ajax', name: 'Team A', category: 'JO12' },
      { id: '2', clubName: 'Feyenoord', name: 'Team B', category: 'JO8' },
      { id: '3', clubName: 'Ajax', name: 'Team C', category: 'JO10' },
      { id: '4', clubName: 'PSV', name: 'Team D', category: 'MO8' },
      { id: '5', clubName: 'Ajax', name: 'Team E', category: 'JO8' },
      { id: '6', clubName: 'PSV', name: 'Team F', category: 'MO12' },
      { id: '7', clubName: 'Feyenoord', name: 'Team G', category: 'JO12' },
      { id: '8', clubName: 'Ajax', name: 'Team H' }, // No category
      { id: '9', clubName: 'PSV', name: 'Team I', category: 'VETERANEN_35_PLUS' },
    ]

    describe('club name sorting', () => {
      it('should sort teams primarily by club name alphabetically', () => {
        const result = sortTeams(mockTeams)

        // Extract club names to verify ordering
        const clubNames = result.map(team => team.clubName)
        expect(clubNames).toEqual([
          'Ajax',
          'Ajax',
          'Ajax',
          'Ajax', // All Ajax teams first
          'Feyenoord',
          'Feyenoord', // Then Feyenoord
          'PSV',
          'PSV',
          'PSV', // Finally PSV
        ])
      })
    })

    describe('category sorting with numeric awareness', () => {
      it('should sort JO categories numerically (JO8 before JO10 before JO12)', () => {
        const ajaxTeams = mockTeams.filter(team => team.clubName === 'Ajax')
        const result = sortTeams(ajaxTeams)

        // Ajax teams should be ordered: JO8, JO10, JO12, then no category last
        expect(result).toEqual([
          expect.objectContaining({ name: 'Team E', category: 'JO8' }),
          expect.objectContaining({ name: 'Team C', category: 'JO10' }),
          expect.objectContaining({ name: 'Team A', category: 'JO12' }),
          expect.objectContaining({ name: 'Team H' }), // No category (property not present)
        ])
      })

      it('should sort different category prefixes alphabetically (JO before MO)', () => {
        const psvTeams = mockTeams.filter(team => team.clubName === 'PSV')
        const result = sortTeams(psvTeams)

        expect(result).toEqual([
          expect.objectContaining({ name: 'Team D', category: 'MO8' }),
          expect.objectContaining({ name: 'Team F', category: 'MO12' }),
          expect.objectContaining({
            name: 'Team I',
            category: 'VETERANEN_35_PLUS',
          }),
        ])
      })

      it('should handle teams without categories by placing them last', () => {
        const teamsWithoutCategory = [
          { id: '1', clubName: 'Ajax', name: 'Team Z', category: 'JO8' },
          { id: '2', clubName: 'Ajax', name: 'Team A' }, // No category
          { id: '3', clubName: 'Ajax', name: 'Team B', category: 'JO10' },
        ]

        const result = sortTeams(teamsWithoutCategory)

        expect(result).toEqual([
          expect.objectContaining({ name: 'Team Z', category: 'JO8' }),
          expect.objectContaining({ name: 'Team B', category: 'JO10' }),
          expect.objectContaining({ name: 'Team A' }), // No category (property not present)
        ])
      })
    })

    describe('team name sorting', () => {
      it('should sort by team name when club and category are the same', () => {
        const sameClubCategory = [
          { id: '1', clubName: 'Ajax', name: 'Team Z', category: 'JO8' },
          { id: '2', clubName: 'Ajax', name: 'Team A', category: 'JO8' },
          { id: '3', clubName: 'Ajax', name: 'Team M', category: 'JO8' },
        ]

        const result = sortTeams(sameClubCategory)

        expect(result.map(team => team.name)).toEqual(['Team A', 'Team M', 'Team Z'])
      })
    })

    describe('complex category formats', () => {
      it('should handle complex category names with suffixes', () => {
        const complexCategories = [
          { id: '1', clubName: 'Ajax', name: 'Team A', category: 'JO12_A' },
          { id: '2', clubName: 'Ajax', name: 'Team B', category: 'JO12_B' },
          { id: '3', clubName: 'Ajax', name: 'Team C', category: 'JO8_A' },
        ]

        const result = sortTeams(complexCategories)

        expect(result).toEqual([
          expect.objectContaining({ category: 'JO8_A' }), // JO8 before JO12
          expect.objectContaining({ category: 'JO12_A' }), // JO12_A before JO12_B (suffix sorting)
          expect.objectContaining({ category: 'JO12_B' }),
        ])
      })

      it('should handle non-numeric categories alphabetically', () => {
        const nonNumericCategories = [
          {
            id: '1',
            clubName: 'Ajax',
            name: 'Team A',
            category: 'VETERANEN_45_PLUS',
          },
          {
            id: '2',
            clubName: 'Ajax',
            name: 'Team B',
            category: 'VETERANEN_35_PLUS',
          },
          { id: '3', clubName: 'Ajax', name: 'Team C', category: 'AMATEUR' },
        ]

        const result = sortTeams(nonNumericCategories)

        expect(result).toEqual([
          expect.objectContaining({ category: 'AMATEUR' }), // Alphabetically first
          expect.objectContaining({ category: 'VETERANEN_35_PLUS' }), // 35 before 45
          expect.objectContaining({ category: 'VETERANEN_45_PLUS' }),
        ])
      })
    })

    describe('full integration sorting', () => {
      it('should apply all sorting rules correctly in order', () => {
        const result = sortTeams(mockTeams)

        // Verify the complete expected order
        expect(
          result.map(team => ({
            club: team.clubName,
            name: team.name,
            category: team.category || 'none',
          }))
        ).toEqual([
          { club: 'Ajax', name: 'Team E', category: 'JO8' },
          { club: 'Ajax', name: 'Team C', category: 'JO10' },
          { club: 'Ajax', name: 'Team A', category: 'JO12' },
          { club: 'Ajax', name: 'Team H', category: 'none' }, // No category last for Ajax
          { club: 'Feyenoord', name: 'Team B', category: 'JO8' },
          { club: 'Feyenoord', name: 'Team G', category: 'JO12' },
          { club: 'PSV', name: 'Team D', category: 'MO8' },
          { club: 'PSV', name: 'Team F', category: 'MO12' },
          { club: 'PSV', name: 'Team I', category: 'VETERANEN_35_PLUS' },
        ])
      })
    })

    describe('edge cases', () => {
      it('should handle empty array', () => {
        const result = sortTeams([])
        expect(result).toEqual([])
      })

      it('should handle single team', () => {
        const singleTeam = [
          { id: '1', clubName: 'Ajax', name: 'Team A', category: 'JO8' },
        ]
        const result = sortTeams(singleTeam)
        expect(result).toEqual(singleTeam)
      })

      it('should handle teams with empty string values', () => {
        const teamsWithEmptyStrings = [
          { id: '1', clubName: '', name: 'Team A', category: 'JO8' },
          { id: '2', clubName: 'Ajax', name: '', category: 'JO8' },
          { id: '3', clubName: 'Ajax', name: 'Team B', category: '' },
        ]

        const result = sortTeams(teamsWithEmptyStrings)

        // Should still sort without throwing errors
        expect(result).toHaveLength(3)
        expect(result[0].clubName).toBe('') // Empty string should come first alphabetically
      })
    })
  })
})
