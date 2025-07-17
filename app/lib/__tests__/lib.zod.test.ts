import { z } from 'zod'

import { describe, expect, it, vi } from 'vitest'

import type { TFunction } from 'i18next'
import { TEST_TRANSLATIONS } from 'test/helpers/constants'

import {
  type CreateTeamData,
  type EditTeamData,
  extractTeamDataFromFormData,
  getTeamValidationSchema,
  type TeamFormData,
  validateTeamData,
} from '../lib.zod'

// Mock translation function
const createMockT = (): TFunction => {
  const mockFn = vi.fn(
    (key: string) => TEST_TRANSLATIONS[key as keyof typeof TEST_TRANSLATIONS] || key
  )

  // Add the required brand property for TFunction compatibility
  return Object.assign(mockFn, {
    $TFunctionBrand: 'translation' as const,
  }) as unknown as TFunction
}

describe('lib.zod', () => {
  describe('getTeamValidationSchema', () => {
    const mockT = createMockT()

    describe('create mode', () => {
      it('should return schema with privacy agreement for create mode', () => {
        const schema = getTeamValidationSchema('create', mockT)
        const result = schema.safeParse({
          tournamentId: 'tournament-1',
          clubName: 'Test Club',
          teamName: 'JO8-1',
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: '0612345678',
          teamLeaderEmail: 'john@example.com',
          privacyAgreement: true,
        })

        expect(result.success).toBe(true)
      })

      it('should require privacy agreement in create mode', () => {
        const schema = getTeamValidationSchema('create', mockT)
        const result = schema.safeParse({
          tournamentId: 'tournament-1',
          clubName: 'Test Club',
          teamName: 'JO8-1',
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: '0612345678',
          teamLeaderEmail: 'john@example.com',
          privacyAgreement: false,
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          const privacyError = result.error.issues.find(
            (err: z.ZodIssue) => err.path[0] === 'privacyAgreement'
          )
          expect(privacyError?.message).toBe('You must agree to the privacy policy')
        }
      })

      it('should validate all required fields in create mode', () => {
        const schema = getTeamValidationSchema('create', mockT)
        const result = schema.safeParse({})

        expect(result.success).toBe(false)
        if (!result.success) {
          const errorPaths = result.error.issues.map((err: z.ZodIssue) => err.path[0])
          expect(errorPaths).toContain('tournamentId')
          expect(errorPaths).toContain('clubName')
          expect(errorPaths).toContain('teamName')
          expect(errorPaths).toContain('division')
          expect(errorPaths).toContain('category')
          expect(errorPaths).toContain('teamLeaderName')
          expect(errorPaths).toContain('teamLeaderPhone')
          expect(errorPaths).toContain('teamLeaderEmail')
          expect(errorPaths).toContain('privacyAgreement')
        }
      })
    })

    describe('edit mode', () => {
      it('should return schema without privacy agreement for edit mode', () => {
        const schema = getTeamValidationSchema('edit', mockT)
        const result = schema.safeParse({
          tournamentId: 'tournament-1',
          clubName: 'Test Club',
          teamName: 'JO8-1',
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: '0612345678',
          teamLeaderEmail: 'john@example.com',
        })

        expect(result.success).toBe(true)
      })

      it('should not require privacy agreement in edit mode', () => {
        const schema = getTeamValidationSchema('edit', mockT)
        const result = schema.safeParse({
          tournamentId: 'tournament-1',
          clubName: 'Test Club',
          teamName: 'JO8-1',
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: '0612345678',
          teamLeaderEmail: 'john@example.com',
        })

        expect(result.success).toBe(true)
        if (result.success) {
          expect('privacyAgreement' in result.data).toBe(false)
        }
      })

      it('should validate all required fields except privacy agreement in edit mode', () => {
        const schema = getTeamValidationSchema('edit', mockT)
        const result = schema.safeParse({})

        expect(result.success).toBe(false)
        if (!result.success) {
          const errorPaths = result.error.issues.map((err: z.ZodIssue) => err.path[0])
          expect(errorPaths).toContain('tournamentId')
          expect(errorPaths).toContain('clubName')
          expect(errorPaths).toContain('teamName')
          expect(errorPaths).toContain('division')
          expect(errorPaths).toContain('category')
          expect(errorPaths).toContain('teamLeaderName')
          expect(errorPaths).toContain('teamLeaderPhone')
          expect(errorPaths).toContain('teamLeaderEmail')
          expect(errorPaths).not.toContain('privacyAgreement')
        }
      })
    })

    describe('field validation', () => {
      const createMockTFunction = createMockT

      it('should validate tournamentId field', () => {
        const schema = getTeamValidationSchema('create', createMockTFunction())

        // Empty tournamentId
        const emptyResult = schema.safeParse({
          tournamentId: '',
          clubName: 'Test Club',
          teamName: 'JO8-1',
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: '0612345678',
          teamLeaderEmail: 'john@example.com',
          privacyAgreement: true,
        })
        expect(emptyResult.success).toBe(false)
        if (!emptyResult.success) {
          const error = emptyResult.error.issues.find(
            (err: z.ZodIssue) => err.path[0] === 'tournamentId'
          )
          expect(error?.message).toBe('Tournament is required')
        }

        // Valid tournamentId
        const validResult = schema.safeParse({
          tournamentId: 'tournament-1',
          clubName: 'Test Club',
          teamName: 'JO8-1',
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: '0612345678',
          teamLeaderEmail: 'john@example.com',
          privacyAgreement: true,
        })
        expect(validResult.success).toBe(true)
      })

      it('should validate clubName field', () => {
        const schema = getTeamValidationSchema('create', createMockTFunction())

        // Empty clubName
        const emptyResult = schema.safeParse({
          tournamentId: 'tournament-1',
          clubName: '',
          teamName: 'JO8-1',
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: '0612345678',
          teamLeaderEmail: 'john@example.com',
          privacyAgreement: true,
        })
        expect(emptyResult.success).toBe(false)
        if (!emptyResult.success) {
          const error = emptyResult.error.issues.find(
            (err: z.ZodIssue) => err.path[0] === 'clubName'
          )
          expect(error?.message).toBe('Club name is required')
        }

        // Too long clubName
        const longClubName = 'a'.repeat(101)
        const longResult = schema.safeParse({
          tournamentId: 'tournament-1',
          clubName: longClubName,
          teamName: 'JO8-1',
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: '0612345678',
          teamLeaderEmail: 'john@example.com',
          privacyAgreement: true,
        })
        expect(longResult.success).toBe(false)
        if (!longResult.success) {
          const error = longResult.error.issues.find(
            (err: z.ZodIssue) => err.path[0] === 'clubName'
          )
          expect(error?.message).toBe('Club name must be less than 100 characters')
        }

        // Valid clubName
        const validResult = schema.safeParse({
          tournamentId: 'tournament-1',
          clubName: 'Test Club',
          teamName: 'JO8-1',
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: '0612345678',
          teamLeaderEmail: 'john@example.com',
          privacyAgreement: true,
        })
        expect(validResult.success).toBe(true)
      })

      it('should validate teamName field', () => {
        const schema = getTeamValidationSchema('create', createMockTFunction())

        // Empty teamName
        const emptyResult = schema.safeParse({
          tournamentId: 'tournament-1',
          clubName: 'Test Club',
          teamName: '',
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: '0612345678',
          teamLeaderEmail: 'john@example.com',
          privacyAgreement: true,
        })
        expect(emptyResult.success).toBe(false)
        if (!emptyResult.success) {
          const error = emptyResult.error.issues.find(
            (err: z.ZodIssue) => err.path[0] === 'teamName'
          )
          expect(error?.message).toBe('Team name is required')
        }

        // Too long teamName
        const longTeamName = 'a'.repeat(51)
        const longResult = schema.safeParse({
          tournamentId: 'tournament-1',
          clubName: 'Test Club',
          teamName: longTeamName,
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: '0612345678',
          teamLeaderEmail: 'john@example.com',
          privacyAgreement: true,
        })
        expect(longResult.success).toBe(false)
        if (!longResult.success) {
          const error = longResult.error.issues.find(
            (err: z.ZodIssue) => err.path[0] === 'teamName'
          )
          expect(error?.message).toBe('Team name must be less than 50 characters')
        }

        // Valid teamName
        const validResult = schema.safeParse({
          tournamentId: 'tournament-1',
          clubName: 'Test Club',
          teamName: 'JO8-1',
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: '0612345678',
          teamLeaderEmail: 'john@example.com',
          privacyAgreement: true,
        })
        expect(validResult.success).toBe(true)
      })

      it('should validate email field', () => {
        const schema = getTeamValidationSchema('create', createMockTFunction())

        // Invalid email format
        const invalidEmailResult = schema.safeParse({
          tournamentId: 'tournament-1',
          clubName: 'Test Club',
          teamName: 'JO8-1',
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: '0612345678',
          teamLeaderEmail: 'invalid-email',
          privacyAgreement: true,
        })
        expect(invalidEmailResult.success).toBe(false)
        if (!invalidEmailResult.success) {
          const error = invalidEmailResult.error.issues.find(
            (err: z.ZodIssue) => err.path[0] === 'teamLeaderEmail'
          )
          expect(error?.message).toBe('Please enter a valid email address')
        }

        // Valid email
        const validResult = schema.safeParse({
          tournamentId: 'tournament-1',
          clubName: 'Test Club',
          teamName: 'JO8-1',
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: '0612345678',
          teamLeaderEmail: 'john@example.com',
          privacyAgreement: true,
        })
        expect(validResult.success).toBe(true)
      })

      it('should validate phone field', () => {
        const schema = getTeamValidationSchema('create', createMockTFunction())

        // Invalid phone format (contains letters)
        const invalidPhoneResult = schema.safeParse({
          tournamentId: 'tournament-1',
          clubName: 'Test Club',
          teamName: 'JO8-1',
          division: 'FIRST_DIVISION',
          category: 'JO8',
          teamLeaderName: 'John Doe',
          teamLeaderPhone: 'abc123',
          teamLeaderEmail: 'john@example.com',
          privacyAgreement: true,
        })
        expect(invalidPhoneResult.success).toBe(false)
        if (!invalidPhoneResult.success) {
          const error = invalidPhoneResult.error.issues.find(
            (err: z.ZodIssue) => err.path[0] === 'teamLeaderPhone'
          )
          expect(error?.message).toBe('Please enter a valid phone number')
        }

        // Valid phone formats
        const validPhones = [
          '0612345678',
          '+31612345678',
          '06 12 34 56 78',
          '06-12-34-56-78',
          '(06) 12345678',
        ]

        validPhones.forEach(phone => {
          const validResult = schema.safeParse({
            tournamentId: 'tournament-1',
            clubName: 'Test Club',
            teamName: 'JO8-1',
            division: 'FIRST_DIVISION',
            category: 'JO8',
            teamLeaderName: 'John Doe',
            teamLeaderPhone: phone,
            teamLeaderEmail: 'john@example.com',
            privacyAgreement: true,
          })
          expect(validResult.success).toBe(true)
        })
      })
    })
  })

  describe('extractTeamDataFromFormData', () => {
    it('should extract all team data from FormData', () => {
      const formData = new FormData()
      formData.set('tournamentId', 'tournament-1')
      formData.set('clubName', 'Test Club')
      formData.set('teamName', 'JO8-1')
      formData.set('division', 'FIRST_DIVISION')
      formData.set('category', 'JO8')
      formData.set('teamLeaderName', 'John Doe')
      formData.set('teamLeaderPhone', '0612345678')
      formData.set('teamLeaderEmail', 'john@example.com')
      formData.set('privacyAgreement', 'on')

      const result = extractTeamDataFromFormData(formData)

      expect(result).toEqual({
        tournamentId: 'tournament-1',
        clubName: 'Test Club',
        teamName: 'JO8-1',
        division: 'FIRST_DIVISION',
        category: 'JO8',
        teamLeaderName: 'John Doe',
        teamLeaderPhone: '0612345678',
        teamLeaderEmail: 'john@example.com',
        privacyAgreement: true,
      })
    })

    it('should handle missing form data fields', () => {
      const formData = new FormData()
      formData.set('clubName', 'Test Club')
      // Missing other fields

      const result = extractTeamDataFromFormData(formData)

      expect(result).toEqual({
        tournamentId: '',
        clubName: 'Test Club',
        teamName: '',
        division: '',
        category: '',
        teamLeaderName: '',
        teamLeaderPhone: '',
        teamLeaderEmail: '',
        privacyAgreement: false,
      })
    })

    it('should handle privacyAgreement checkbox states', () => {
      // Checkbox checked
      const checkedFormData = new FormData()
      checkedFormData.set('privacyAgreement', 'on')
      const checkedResult = extractTeamDataFromFormData(checkedFormData)
      expect(checkedResult.privacyAgreement).toBe(true)

      // Checkbox not present (unchecked)
      const uncheckedFormData = new FormData()
      const uncheckedResult = extractTeamDataFromFormData(uncheckedFormData)
      expect(uncheckedResult.privacyAgreement).toBe(false)
    })

    it('should handle empty FormData', () => {
      const formData = new FormData()
      const result = extractTeamDataFromFormData(formData)

      expect(result).toEqual({
        tournamentId: '',
        clubName: '',
        teamName: '',
        division: '',
        category: '',
        teamLeaderName: '',
        teamLeaderPhone: '',
        teamLeaderEmail: '',
        privacyAgreement: false,
      })
    })
  })

  describe('validateTeamData', () => {
    const validTeamData = {
      tournamentId: 'tournament-1',
      clubName: 'Test Club',
      teamName: 'JO8-1',
      division: 'FIRST_DIVISION',
      category: 'JO8',
      teamLeaderName: 'John Doe',
      teamLeaderPhone: '0612345678',
      teamLeaderEmail: 'john@example.com',
      privacyAgreement: true,
    }

    describe('create mode', () => {
      it('should validate successfully with valid data', () => {
        const result = validateTeamData(validTeamData, 'create')
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toEqual(validTeamData)
        }
      })

      it('should require privacyAgreement in create mode', () => {
        const invalidData = { ...validTeamData, privacyAgreement: false }
        const result = validateTeamData(invalidData, 'create')
        expect(result.success).toBe(false)
        if (!result.success) {
          const privacyError = result.error.issues.find(
            (err: z.ZodIssue) => err.path[0] === 'privacyAgreement'
          )
          expect(privacyError).toBeDefined()
        }
      })

      it('should validate all required fields', () => {
        const emptyData = {}
        const result = validateTeamData(emptyData, 'create')
        expect(result.success).toBe(false)
        if (!result.success) {
          const errorPaths = result.error.issues.map((err: z.ZodIssue) => err.path[0])
          expect(errorPaths).toContain('tournamentId')
          expect(errorPaths).toContain('clubName')
          expect(errorPaths).toContain('teamName')
          expect(errorPaths).toContain('division')
          expect(errorPaths).toContain('category')
          expect(errorPaths).toContain('teamLeaderName')
          expect(errorPaths).toContain('teamLeaderPhone')
          expect(errorPaths).toContain('teamLeaderEmail')
          expect(errorPaths).toContain('privacyAgreement')
        }
      })

      it('should validate string length limits', () => {
        const invalidData = {
          ...validTeamData,
          clubName: 'a'.repeat(101), // Too long
          teamName: 'a'.repeat(51), // Too long
          teamLeaderName: 'a'.repeat(101), // Too long
        }
        const result = validateTeamData(invalidData, 'create')
        expect(result.success).toBe(false)
      })

      it('should validate email format', () => {
        const invalidData = { ...validTeamData, teamLeaderEmail: 'invalid-email' }
        const result = validateTeamData(invalidData, 'create')
        expect(result.success).toBe(false)
      })

      it('should validate phone format', () => {
        const invalidData = { ...validTeamData, teamLeaderPhone: 'abc123' }
        const result = validateTeamData(invalidData, 'create')
        expect(result.success).toBe(false)
      })
    })

    describe('edit mode', () => {
      it('should validate successfully with valid data (without privacy agreement)', () => {
        const editData = { ...validTeamData }
        delete (editData as Record<string, unknown>).privacyAgreement
        const result = validateTeamData(editData, 'edit')
        expect(result.success).toBe(true)
      })

      it('should not require privacyAgreement in edit mode', () => {
        const dataWithoutPrivacy = { ...validTeamData }
        delete (dataWithoutPrivacy as Record<string, unknown>).privacyAgreement
        const result = validateTeamData(dataWithoutPrivacy, 'edit')
        expect(result.success).toBe(true)
      })

      it('should validate all required fields except privacy agreement', () => {
        const emptyData = {}
        const result = validateTeamData(emptyData, 'edit')
        expect(result.success).toBe(false)
        if (!result.success) {
          const errorPaths = result.error.issues.map((err: z.ZodIssue) => err.path[0])
          expect(errorPaths).toContain('tournamentId')
          expect(errorPaths).toContain('clubName')
          expect(errorPaths).toContain('teamName')
          expect(errorPaths).toContain('division')
          expect(errorPaths).toContain('category')
          expect(errorPaths).toContain('teamLeaderName')
          expect(errorPaths).toContain('teamLeaderPhone')
          expect(errorPaths).toContain('teamLeaderEmail')
          expect(errorPaths).not.toContain('privacyAgreement')
        }
      })
    })

    describe('edge cases', () => {
      it('should handle null/undefined values', () => {
        const nullData = {
          tournamentId: null,
          clubName: undefined,
          teamName: '',
          division: null,
          category: undefined,
          teamLeaderName: '',
          teamLeaderPhone: null,
          teamLeaderEmail: undefined,
          privacyAgreement: null,
        }
        const result = validateTeamData(nullData, 'create')
        expect(result.success).toBe(false)
      })

      it('should handle non-string values', () => {
        const invalidTypeData = {
          tournamentId: 123,
          clubName: ['not', 'a', 'string'],
          teamName: { invalid: 'object' },
          division: true,
          category: Symbol('symbol'),
          teamLeaderName: 456,
          teamLeaderPhone: [],
          teamLeaderEmail: {},
          privacyAgreement: 'not-boolean',
        }
        const result = validateTeamData(invalidTypeData, 'create')
        expect(result.success).toBe(false)
      })
    })
  })

  describe('type exports', () => {
    it('should have correct TypeScript types', () => {
      // This is a compilation test to ensure types are exported correctly
      const teamFormData: TeamFormData = {
        tournamentId: 'tournament-1',
        clubName: 'Test Club',
        teamName: 'JO8-1',
        division: 'FIRST_DIVISION',
        category: 'JO8',
        teamLeaderName: 'John Doe',
        teamLeaderPhone: '0612345678',
        teamLeaderEmail: 'john@example.com',
        privacyAgreement: true,
      }

      const createTeamData: CreateTeamData = {
        tournamentId: 'tournament-1',
        clubName: 'Test Club',
        teamName: 'JO8-1',
        division: 'FIRST_DIVISION',
        category: 'JO8',
        teamLeaderName: 'John Doe',
        teamLeaderPhone: '0612345678',
        teamLeaderEmail: 'john@example.com',
        privacyAgreement: true,
      }

      const editTeamData: EditTeamData = {
        tournamentId: 'tournament-1',
        clubName: 'Test Club',
        teamName: 'JO8-1',
        division: 'FIRST_DIVISION',
        category: 'JO8',
        teamLeaderName: 'John Doe',
        teamLeaderPhone: '0612345678',
        teamLeaderEmail: 'john@example.com',
      }

      // Should compile without errors
      expect(teamFormData).toBeDefined()
      expect(createTeamData).toBeDefined()
      expect(editTeamData).toBeDefined()
    })
  })
})
