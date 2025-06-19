import { describe, expect, it } from 'vitest'

import {
  getFieldErrorTranslationKey,
  mapStoreFieldToZodField,
  validateEntireForm,
  validateSingleField,
} from '../lib.form'
import type { Email, TeamFormData, TeamName } from '../lib.types'

describe('lib.form', () => {
  describe('mapStoreFieldToZodField', () => {
    it('should return the same field name', () => {
      const testCases = [
        'tournamentId',
        'clubName',
        'teamName',
        'division',
        'category',
        'teamLeaderName',
        'teamLeaderPhone',
        'teamLeaderEmail',
        'privacyAgreement',
      ]

      testCases.forEach(fieldName => {
        expect(mapStoreFieldToZodField(fieldName)).toBe(fieldName)
      })
    })

    it('should handle arbitrary field names', () => {
      expect(mapStoreFieldToZodField('someRandomField')).toBe('someRandomField')
      expect(mapStoreFieldToZodField('')).toBe('')
    })
  })

  describe('getFieldErrorTranslationKey', () => {
    describe('custom validation errors', () => {
      it('should return email invalid key for teamLeaderEmail custom errors', () => {
        const result = getFieldErrorTranslationKey('teamLeaderEmail', {
          code: 'custom',
        })
        expect(result).toBe('teams.form.errors.emailInvalid')
      })

      it('should return phone invalid key for teamLeaderPhone custom errors', () => {
        const result = getFieldErrorTranslationKey('teamLeaderPhone', {
          code: 'custom',
        })
        expect(result).toBe('teams.form.errors.phoneNumberInvalid')
      })

      it('should fallback to default for other fields with custom errors', () => {
        const result = getFieldErrorTranslationKey('clubName', { code: 'custom' })
        expect(result).toBe('teams.form.errors.clubNameRequired')
      })
    })

    describe('too_big validation errors', () => {
      it('should return teamName too long key for teamName too_big errors', () => {
        const result = getFieldErrorTranslationKey('teamName', { code: 'too_big' })
        expect(result).toBe('teams.form.errors.teamNameTooLong')
      })

      it('should return clubName too long key for clubName too_big errors', () => {
        const result = getFieldErrorTranslationKey('clubName', { code: 'too_big' })
        expect(result).toBe('teams.form.errors.clubNameTooLong')
      })

      it('should return teamLeaderName too long key for teamLeaderName too_big errors', () => {
        const result = getFieldErrorTranslationKey('teamLeaderName', {
          code: 'too_big',
        })
        expect(result).toBe('teams.form.errors.teamLeaderNameTooLong')
      })

      it('should fallback to default for other fields with too_big errors', () => {
        const result = getFieldErrorTranslationKey('division', { code: 'too_big' })
        expect(result).toBe('teams.form.errors.divisionRequired')
      })
    })

    describe('default required field errors', () => {
      it('should return correct translation keys for standard fields', () => {
        const expectedMappings = {
          tournamentId: 'teams.form.errors.tournamentRequired',
          clubName: 'teams.form.errors.clubNameRequired',
          teamName: 'teams.form.errors.teamNameRequired',
          division: 'teams.form.errors.divisionRequired',
          category: 'teams.form.errors.categoryRequired',
          teamLeaderName: 'teams.form.errors.teamLeaderNameRequired',
          teamLeaderPhone: 'teams.form.errors.phoneNumberRequired',
          teamLeaderEmail: 'teams.form.errors.emailRequired',
          privacyAgreement: 'teams.form.errors.privacyAgreementRequired',
        }

        Object.entries(expectedMappings).forEach(([fieldName, expectedKey]) => {
          expect(getFieldErrorTranslationKey(fieldName)).toBe(expectedKey)
        })
      })

      it('should return correct translation keys for legacy store field names', () => {
        const legacyMappings = {
          selectedTournamentId: 'teams.form.errors.tournamentRequired',
          selectedDivision: 'teams.form.errors.divisionRequired',
          selectedCategory: 'teams.form.errors.categoryRequired',
        }

        Object.entries(legacyMappings).forEach(([fieldName, expectedKey]) => {
          expect(getFieldErrorTranslationKey(fieldName)).toBe(expectedKey)
        })
      })

      it('should return default key for unknown fields', () => {
        expect(getFieldErrorTranslationKey('unknownField')).toBe(
          'teams.form.errors.fieldRequired'
        )
        expect(getFieldErrorTranslationKey('')).toBe('teams.form.errors.fieldRequired')
      })
    })

    describe('with zodIssue parameter', () => {
      it('should handle undefined zodIssue', () => {
        expect(getFieldErrorTranslationKey('clubName', undefined)).toBe(
          'teams.form.errors.clubNameRequired'
        )
      })

      it('should handle zodIssue without code', () => {
        expect(getFieldErrorTranslationKey('clubName', {})).toBe(
          'teams.form.errors.clubNameRequired'
        )
      })

      it('should handle unknown zodIssue codes', () => {
        expect(getFieldErrorTranslationKey('clubName', { code: 'unknown' })).toBe(
          'teams.form.errors.clubNameRequired'
        )
      })
    })
  })

  describe('validateSingleField', () => {
    const validFormData: TeamFormData = {
      tournamentId: 'tournament-1',
      clubName: 'Test Club',
      teamName: 'JO8-1' as TeamName,
      division: 'FIRST_DIVISION',
      category: 'JO8',
      teamLeaderName: 'John Doe',
      teamLeaderPhone: '0612345678',
      teamLeaderEmail: 'john@example.com' as Email,
      privacyAgreement: true,
    }

    describe('create mode', () => {
      it('should return null for valid fields', () => {
        const fields = [
          'tournamentId',
          'clubName',
          'teamName',
          'division',
          'category',
          'teamLeaderName',
          'teamLeaderPhone',
          'teamLeaderEmail',
          'privacyAgreement',
        ]

        fields.forEach(fieldName => {
          const result = validateSingleField(fieldName, validFormData, 'create')
          expect(result).toBeNull()
        })
      })

      it('should return error key for empty required fields', () => {
        const emptyFormData = {
          ...validFormData,
          tournamentId: '',
          clubName: '',
          teamName: '' as TeamName,
        }

        expect(validateSingleField('tournamentId', emptyFormData, 'create')).toBe(
          'teams.form.errors.tournamentRequired'
        )
        expect(validateSingleField('clubName', emptyFormData, 'create')).toBe(
          'teams.form.errors.clubNameRequired'
        )
        expect(validateSingleField('teamName', emptyFormData, 'create')).toBe(
          'teams.form.errors.teamNameRequired'
        )
      })

      it('should return error key for privacy agreement in create mode', () => {
        const invalidFormData = { ...validFormData, privacyAgreement: false }
        const result = validateSingleField(
          'privacyAgreement',
          invalidFormData,
          'create'
        )
        expect(result).toBe('teams.form.errors.privacyAgreementRequired')
      })

      it('should return error key for invalid email format', () => {
        const invalidFormData = {
          ...validFormData,
          teamLeaderEmail: 'invalid-email' as Email,
        }
        const result = validateSingleField('teamLeaderEmail', invalidFormData, 'create')
        expect(result).toBe('teams.form.errors.emailInvalid')
      })

      it('should return error key for invalid phone format', () => {
        const invalidFormData = { ...validFormData, teamLeaderPhone: 'abc123' }
        const result = validateSingleField('teamLeaderPhone', invalidFormData, 'create')
        expect(result).toBe('teams.form.errors.phoneNumberInvalid')
      })

      it('should return error key for fields that are too long', () => {
        const longFormData = {
          ...validFormData,
          clubName: 'a'.repeat(101),
          teamName: 'a'.repeat(51) as TeamName,
          teamLeaderName: 'a'.repeat(101),
        }

        expect(validateSingleField('clubName', longFormData, 'create')).toBe(
          'teams.form.errors.clubNameTooLong'
        )
        expect(validateSingleField('teamName', longFormData, 'create')).toBe(
          'teams.form.errors.teamNameTooLong'
        )
        expect(validateSingleField('teamLeaderName', longFormData, 'create')).toBe(
          'teams.form.errors.teamLeaderNameTooLong'
        )
      })
    })

    describe('edit mode', () => {
      it('should return null for valid fields in edit mode', () => {
        const editFormData = { ...validFormData }
        delete (editFormData as Record<string, unknown>).privacyAgreement

        const fields = [
          'tournamentId',
          'clubName',
          'teamName',
          'division',
          'category',
          'teamLeaderName',
          'teamLeaderPhone',
          'teamLeaderEmail',
        ]

        fields.forEach(fieldName => {
          const result = validateSingleField(fieldName, editFormData, 'edit')
          expect(result).toBeNull()
        })
      })

      it('should not validate privacy agreement in edit mode', () => {
        const editFormData = { ...validFormData }
        delete (editFormData as Record<string, unknown>).privacyAgreement

        const result = validateSingleField('privacyAgreement', editFormData, 'edit')
        expect(result).toBeNull()
      })

      it('should still validate other fields in edit mode', () => {
        const invalidEditFormData = {
          ...validFormData,
          clubName: '',
          teamLeaderEmail: 'invalid-email' as Email,
        }
        delete (invalidEditFormData as Record<string, unknown>).privacyAgreement

        expect(validateSingleField('clubName', invalidEditFormData, 'edit')).toBe(
          'teams.form.errors.clubNameRequired'
        )
        expect(
          validateSingleField('teamLeaderEmail', invalidEditFormData, 'edit')
        ).toBe('teams.form.errors.emailInvalid')
      })
    })

    describe('edge cases', () => {
      it('should handle validation errors gracefully', () => {
        const invalidFormData = {
          ...validFormData,
          // This will cause validation to fail in a different way
          tournamentId: null as unknown as string,
          clubName: undefined as unknown as string,
        }

        // Should not throw and should return error keys
        const tournamentResult = validateSingleField(
          'tournamentId',
          invalidFormData,
          'create'
        )
        const clubResult = validateSingleField('clubName', invalidFormData, 'create')

        expect(typeof tournamentResult).toBe('string')
        expect(typeof clubResult).toBe('string')
      })

      it('should handle unknown field names', () => {
        const result = validateSingleField('unknownField', validFormData, 'create')
        // Should not throw - either null or a fallback error key
        expect(result === null || typeof result === 'string').toBe(true)
      })
    })
  })

  describe('validateEntireForm', () => {
    const validFormData: TeamFormData = {
      tournamentId: 'tournament-1',
      clubName: 'Test Club',
      teamName: 'JO8-1' as TeamName,
      division: 'FIRST_DIVISION',
      category: 'JO8',
      teamLeaderName: 'John Doe',
      teamLeaderPhone: '0612345678',
      teamLeaderEmail: 'john@example.com' as Email,
      privacyAgreement: true,
    }

    describe('create mode', () => {
      it('should return empty object for valid form data', () => {
        const result = validateEntireForm(validFormData, 'create')
        expect(result).toEqual({})
      })

      it('should return all validation errors for empty form data', () => {
        const emptyFormData = {} as TeamFormData
        const result = validateEntireForm(emptyFormData, 'create')

        expect(result).toHaveProperty('tournamentId')
        expect(result).toHaveProperty('clubName')
        expect(result).toHaveProperty('teamName')
        expect(result).toHaveProperty('division')
        expect(result).toHaveProperty('category')
        expect(result).toHaveProperty('teamLeaderName')
        expect(result).toHaveProperty('teamLeaderPhone')
        expect(result).toHaveProperty('teamLeaderEmail')
        expect(result).toHaveProperty('privacyAgreement')

        expect(result.tournamentId).toBe('teams.form.errors.tournamentRequired')
        expect(result.clubName).toBe('teams.form.errors.clubNameRequired')
        expect(result.teamName).toBe('teams.form.errors.teamNameRequired')
        expect(result.division).toBe('teams.form.errors.divisionRequired')
        expect(result.category).toBe('teams.form.errors.categoryRequired')
        expect(result.teamLeaderName).toBe('teams.form.errors.teamLeaderNameRequired')
        expect(result.teamLeaderPhone).toBe('teams.form.errors.phoneNumberRequired')
        expect(result.teamLeaderEmail).toBe('teams.form.errors.emailRequired')
        expect(result.privacyAgreement).toBe(
          'teams.form.errors.privacyAgreementRequired'
        )
      })

      it('should return multiple validation errors for partially invalid form data', () => {
        const partiallyInvalidFormData = {
          ...validFormData,
          clubName: '',
          teamLeaderEmail: 'invalid-email' as Email,
          teamLeaderPhone: 'abc123',
          privacyAgreement: false,
        }

        const result = validateEntireForm(partiallyInvalidFormData, 'create')

        expect(result.clubName).toBe('teams.form.errors.clubNameRequired')
        expect(result.teamLeaderEmail).toBe('teams.form.errors.emailInvalid')
        expect(result.teamLeaderPhone).toBe('teams.form.errors.phoneNumberInvalid')
        expect(result.privacyAgreement).toBe(
          'teams.form.errors.privacyAgreementRequired'
        )

        // Valid fields should not have errors
        expect(result.tournamentId).toBeUndefined()
        expect(result.teamName).toBeUndefined()
        expect(result.division).toBeUndefined()
        expect(result.category).toBeUndefined()
        expect(result.teamLeaderName).toBeUndefined()
      })

      it('should return length validation errors', () => {
        const longFormData = {
          ...validFormData,
          clubName: 'a'.repeat(101),
          teamName: 'a'.repeat(51) as TeamName,
          teamLeaderName: 'a'.repeat(101),
        }

        const result = validateEntireForm(longFormData, 'create')

        expect(result.clubName).toBe('teams.form.errors.clubNameTooLong')
        expect(result.teamName).toBe('teams.form.errors.teamNameTooLong')
        expect(result.teamLeaderName).toBe('teams.form.errors.teamLeaderNameTooLong')
      })
    })

    describe('edit mode', () => {
      it('should return empty object for valid form data in edit mode', () => {
        const editFormData = { ...validFormData }
        delete (editFormData as Record<string, unknown>).privacyAgreement

        const result = validateEntireForm(editFormData, 'edit')
        expect(result).toEqual({})
      })

      it('should not require privacy agreement in edit mode', () => {
        const editFormData = { ...validFormData }
        delete (editFormData as Record<string, unknown>).privacyAgreement

        const result = validateEntireForm(editFormData, 'edit')
        expect(result.privacyAgreement).toBeUndefined()
      })

      it('should return all validation errors except privacy agreement for empty form data', () => {
        const emptyFormData = {} as TeamFormData
        const result = validateEntireForm(emptyFormData, 'edit')

        expect(result).toHaveProperty('tournamentId')
        expect(result).toHaveProperty('clubName')
        expect(result).toHaveProperty('teamName')
        expect(result).toHaveProperty('division')
        expect(result).toHaveProperty('category')
        expect(result).toHaveProperty('teamLeaderName')
        expect(result).toHaveProperty('teamLeaderPhone')
        expect(result).toHaveProperty('teamLeaderEmail')
        expect(result).not.toHaveProperty('privacyAgreement')
      })

      it('should still validate other fields in edit mode', () => {
        const invalidEditFormData = {
          ...validFormData,
          clubName: '',
          teamLeaderEmail: 'invalid-email' as Email,
          teamLeaderPhone: 'abc123',
        }
        delete (invalidEditFormData as Record<string, unknown>).privacyAgreement

        const result = validateEntireForm(invalidEditFormData, 'edit')

        expect(result.clubName).toBe('teams.form.errors.clubNameRequired')
        expect(result.teamLeaderEmail).toBe('teams.form.errors.emailInvalid')
        expect(result.teamLeaderPhone).toBe('teams.form.errors.phoneNumberInvalid')
        expect(result.privacyAgreement).toBeUndefined()
      })
    })

    describe('edge cases', () => {
      it('should handle validation exceptions gracefully', () => {
        const invalidFormData = {
          tournamentId: null as unknown as string,
          clubName: undefined as unknown as string,
          teamName: Symbol('invalid') as unknown as TeamName,
          division: 123 as unknown as string,
          category: ['invalid'] as unknown as string,
          teamLeaderName: { invalid: 'object' } as unknown as string,
          teamLeaderPhone: true as unknown as string,
          teamLeaderEmail: false as unknown as Email,
          privacyAgreement: 'not-boolean' as unknown as boolean,
        }

        // Should not throw
        const result = validateEntireForm(invalidFormData, 'create')
        expect(typeof result).toBe('object')
      })

      it('should handle null/undefined form data', () => {
        // Should not throw
        const result1 = validateEntireForm(null as unknown as TeamFormData, 'create')
        const result2 = validateEntireForm(
          undefined as unknown as TeamFormData,
          'create'
        )

        expect(typeof result1).toBe('object')
        expect(typeof result2).toBe('object')
      })
    })
  })

  describe('integration with zod validation', () => {
    it('should properly integrate field mappings with zod validation', () => {
      const formData: TeamFormData = {
        tournamentId: 'tournament-1',
        clubName: 'Test Club',
        teamName: 'JO8-1' as TeamName,
        division: 'FIRST_DIVISION',
        category: 'JO8',
        teamLeaderName: 'John Doe',
        teamLeaderPhone: '0612345678',
        teamLeaderEmail: 'john@example.com' as Email,
        privacyAgreement: true,
      }

      // Test that field mapping works correctly with validation
      const clubNameField = mapStoreFieldToZodField('clubName')
      expect(clubNameField).toBe('clubName')

      const clubNameError = validateSingleField(
        'clubName',
        { ...formData, clubName: '' },
        'create'
      )
      expect(clubNameError).toBe('teams.form.errors.clubNameRequired')

      const allErrors = validateEntireForm(
        { ...formData, clubName: '', teamName: '' as TeamName },
        'create'
      )
      expect(allErrors.clubName).toBe('teams.form.errors.clubNameRequired')
      expect(allErrors.teamName).toBe('teams.form.errors.teamNameRequired')
    })

    it('should handle legacy field names consistently', () => {
      const legacyFields = [
        'selectedTournamentId',
        'selectedDivision',
        'selectedCategory',
      ]

      legacyFields.forEach(field => {
        const mappedField = mapStoreFieldToZodField(field)
        const translationKey = getFieldErrorTranslationKey(field)

        expect(typeof mappedField).toBe('string')
        expect(translationKey).toContain('teams.form.errors.')
      })
    })
  })
})
