import { describe, expect, it } from 'vitest'

import type { Email, TeamFormData, TeamName } from '~/lib/lib.types'

import {
  getFieldErrorTranslationKey,
  mapStoreFieldToZodField,
  validateEntireTeamForm,
  validateSingleTeamField,
} from '../form-validation'

describe('form-validation', () => {
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
        expect(getFieldErrorTranslationKey('clubName', { code: 'invalid_type' })).toBe(
          'teams.form.errors.clubNameRequired'
        )
      })

      it('should handle unknown zodIssue codes', () => {
        expect(getFieldErrorTranslationKey('clubName', { code: 'invalid_type' })).toBe(
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
          const result = validateSingleTeamField(fieldName, validFormData, 'create')
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

        expect(validateSingleTeamField('tournamentId', emptyFormData, 'create')).toBe(
          'teams.form.errors.tournamentRequired'
        )
        expect(validateSingleTeamField('clubName', emptyFormData, 'create')).toBe(
          'teams.form.errors.clubNameRequired'
        )
        expect(validateSingleTeamField('teamName', emptyFormData, 'create')).toBe(
          'teams.form.errors.teamNameRequired'
        )
      })

      it('should return error key for privacy agreement in create mode', () => {
        const invalidFormData = { ...validFormData, privacyAgreement: false }
        const result = validateSingleTeamField(
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
        const result = validateSingleTeamField(
          'teamLeaderEmail',
          invalidFormData,
          'create'
        )
        expect(result).toBe('teams.form.errors.emailInvalid')
      })

      it('should return error key for invalid phone format', () => {
        const invalidFormData = { ...validFormData, teamLeaderPhone: 'invalid' }
        const result = validateSingleTeamField(
          'teamLeaderPhone',
          invalidFormData,
          'create'
        )
        expect(result).toBe('teams.form.errors.phoneNumberInvalid')
      })

      it('should return error key for too long team name', () => {
        const invalidFormData = {
          ...validFormData,
          teamName:
            'This is a very long team name that exceeds the maximum allowed length' as TeamName,
        }
        const result = validateSingleTeamField('teamName', invalidFormData, 'create')
        expect(result).toBe('teams.form.errors.teamNameTooLong')
      })
    })

    describe('edit mode', () => {
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
        ]

        fields.forEach(fieldName => {
          const result = validateSingleTeamField(fieldName, validFormData, 'edit')
          expect(result).toBeNull()
        })
      })

      it('should not require privacy agreement in edit mode', () => {
        const invalidFormData = { ...validFormData, privacyAgreement: false }
        const result = validateSingleTeamField(
          'privacyAgreement',
          invalidFormData,
          'edit'
        )
        expect(result).toBeNull()
      })

      it('should return error key for empty required fields', () => {
        const emptyFormData = {
          ...validFormData,
          tournamentId: '',
          clubName: '',
          teamName: '' as TeamName,
        }

        expect(validateSingleTeamField('tournamentId', emptyFormData, 'edit')).toBe(
          'teams.form.errors.tournamentRequired'
        )
        expect(validateSingleTeamField('clubName', emptyFormData, 'edit')).toBe(
          'teams.form.errors.clubNameRequired'
        )
        expect(validateSingleTeamField('teamName', emptyFormData, 'edit')).toBe(
          'teams.form.errors.teamNameRequired'
        )
      })
    })

    describe('fallback validation', () => {
      it('should handle validation errors gracefully', () => {
        // Test with invalid form data that might cause validation to throw
        const invalidFormData = {} as TeamFormData
        const result = validateSingleTeamField('clubName', invalidFormData, 'create')
        expect(result).toBe('teams.form.errors.clubNameRequired')
      })

      it('should handle unknown field names', () => {
        const result = validateSingleTeamField('unknownField', validFormData, 'create')
        expect(result).toBeNull()
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
      it('should return empty errors for valid form data', () => {
        const result = validateEntireTeamForm(validFormData, 'create')
        expect(result).toEqual({})
      })

      it('should return all field errors for empty form data', () => {
        const emptyFormData = {
          tournamentId: '',
          clubName: '',
          teamName: '' as TeamName,
          division: '',
          category: '',
          teamLeaderName: '',
          teamLeaderPhone: '',
          teamLeaderEmail: '' as Email,
          privacyAgreement: false,
        }

        const result = validateEntireTeamForm(emptyFormData, 'create')

        expect(result).toEqual({
          tournamentId: 'teams.form.errors.tournamentRequired',
          clubName: 'teams.form.errors.clubNameRequired',
          teamName: 'teams.form.errors.teamNameRequired',
          division: 'teams.form.errors.divisionRequired',
          category: 'teams.form.errors.categoryRequired',
          teamLeaderName: 'teams.form.errors.teamLeaderNameRequired',
          teamLeaderPhone: 'teams.form.errors.phoneNumberRequired',
          teamLeaderEmail: 'teams.form.errors.emailRequired',
          privacyAgreement: 'teams.form.errors.privacyAgreementRequired',
        })
      })

      it('should return specific field errors for invalid data', () => {
        const invalidFormData = {
          ...validFormData,
          teamLeaderEmail: 'invalid-email' as Email,
          teamLeaderPhone: 'invalid',
          teamName:
            'This is a very long team name that exceeds the maximum allowed length' as TeamName,
        }

        const result = validateEntireTeamForm(invalidFormData, 'create')

        expect(result.teamLeaderEmail).toBe('teams.form.errors.emailInvalid')
        expect(result.teamLeaderPhone).toBe('teams.form.errors.phoneNumberInvalid')
        expect(result.teamName).toBe('teams.form.errors.teamNameTooLong')
      })
    })

    describe('edit mode', () => {
      it('should return empty errors for valid form data', () => {
        const result = validateEntireTeamForm(validFormData, 'edit')
        expect(result).toEqual({})
      })

      it('should not require privacy agreement in edit mode', () => {
        const formDataWithoutPrivacy = {
          ...validFormData,
          privacyAgreement: false,
        }

        const result = validateEntireTeamForm(formDataWithoutPrivacy, 'edit')
        expect(result.privacyAgreement).toBeUndefined()
      })

      it('should return errors for other required fields in edit mode', () => {
        const emptyFormData = {
          tournamentId: '',
          clubName: '',
          teamName: '' as TeamName,
          division: '',
          category: '',
          teamLeaderName: '',
          teamLeaderPhone: '',
          teamLeaderEmail: '' as Email,
          privacyAgreement: false, // Should not be required in edit mode
        }

        const result = validateEntireTeamForm(emptyFormData, 'edit')

        expect(result).toEqual({
          tournamentId: 'teams.form.errors.tournamentRequired',
          clubName: 'teams.form.errors.clubNameRequired',
          teamName: 'teams.form.errors.teamNameRequired',
          division: 'teams.form.errors.divisionRequired',
          category: 'teams.form.errors.categoryRequired',
          teamLeaderName: 'teams.form.errors.teamLeaderNameRequired',
          teamLeaderPhone: 'teams.form.errors.phoneNumberRequired',
          teamLeaderEmail: 'teams.form.errors.emailRequired',
        })
      })
    })

    describe('error handling', () => {
      it('should handle validation errors gracefully', () => {
        // Test with invalid form data that might cause validation to throw
        const invalidFormData = {} as TeamFormData
        const result = validateEntireTeamForm(invalidFormData, 'create')
        // Empty form data should still return validation errors for required fields
        expect(Object.keys(result).length).toBeGreaterThan(0)
        expect(result.tournamentId).toBe('teams.form.errors.tournamentRequired')
      })

      it('should return empty object for unexpected errors', () => {
        // Test edge case scenarios
        const result = validateEntireTeamForm(null as unknown as TeamFormData, 'create')
        expect(result).toEqual({})
      })
    })
  })
})
