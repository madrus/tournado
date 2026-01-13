import { describe, expect, it } from 'vitest'
import type { ZodIssue } from 'zod'
import type { Email } from '~/lib/lib.types'
import type { TeamFormData, TeamName } from '../types'
import {
	getFieldErrorTranslationKey,
	mapStoreFieldToZodField,
	validateEntireTeamForm,
	validateSingleTeamField,
} from '../validation'

describe('form-validation', () => {
	describe('mapStoreFieldToZodField', () => {
		it('should return the same field name', () => {
			const testCases = [
				'tournamentId',
				'clubName',
				'name',
				'division',
				'category',
				'teamLeaderName',
				'teamLeaderPhone',
				'teamLeaderEmail',
				'privacyAgreement',
			]

			testCases.forEach((fieldName) => {
				expect(mapStoreFieldToZodField(fieldName)).toBe(fieldName)
			})
		})

		it('should handle arbitrary field names', () => {
			expect(mapStoreFieldToZodField('someRandomField')).toBe('someRandomField')
			expect(mapStoreFieldToZodField('')).toBe('')
		})
	})

	describe('getFieldErrorTranslationKey', () => {
		describe('email validation errors', () => {
			it('should return email invalid key for teamLeaderEmail invalid_format errors', () => {
				const result = getFieldErrorTranslationKey('teamLeaderEmail', {
					code: 'invalid_format',
					format: 'email',
					path: ['teamLeaderEmail'],
					message: 'Invalid email address',
				})
				expect(result).toBe('messages.validation.emailInvalid')
			})
		})

		describe('custom validation errors', () => {
			it('should return phone invalid key for teamLeaderPhone custom errors', () => {
				const result = getFieldErrorTranslationKey('teamLeaderPhone', {
					code: 'custom',
					path: ['teamLeaderPhone'],
					message: 'Invalid phone number format',
				})
				expect(result).toBe('messages.validation.phoneNumberInvalid')
			})

			it('should fallback to default for other fields with custom errors', () => {
				const result = getFieldErrorTranslationKey('clubName', {
					code: 'custom',
					path: ['clubName'],
					message: 'Custom error',
				})
				expect(result).toBe('messages.team.clubNameRequired')
			})
		})

		describe('too_big validation errors', () => {
			it('should return name too long key for name too_big errors', () => {
				const issue: Partial<ZodIssue> = {
					code: 'too_big',
					maximum: 50,
					inclusive: true,
					path: ['name'],
					message: 'String must contain at most 50 character(s)',
				}
				const result = getFieldErrorTranslationKey('name', issue as ZodIssue)
				expect(result).toBe('messages.team.nameTooLong')
			})

			it('should return clubName too long key for clubName too_big errors', () => {
				const issue: Partial<ZodIssue> = {
					code: 'too_big',
					maximum: 100,
					inclusive: true,
					path: ['clubName'],
					message: 'String must contain at most 100 character(s)',
				}
				const result = getFieldErrorTranslationKey('clubName', issue as ZodIssue)
				expect(result).toBe('messages.team.clubNameTooLong')
			})

			it('should return teamLeaderName too long key for teamLeaderName too_big errors', () => {
				const issue: Partial<ZodIssue> = {
					code: 'too_big',
					maximum: 100,
					inclusive: true,
					path: ['teamLeaderName'],
					message: 'String must contain at most 100 character(s)',
				}
				const result = getFieldErrorTranslationKey('teamLeaderName', issue as ZodIssue)
				expect(result).toBe('messages.team.teamLeaderNameTooLong')
			})

			it('should fallback to default for other fields with too_big errors', () => {
				const issue: Partial<ZodIssue> = {
					code: 'too_big',
					maximum: 100,
					inclusive: true,
					path: ['division'],
					message: 'String must contain at most 100 character(s)',
				}
				const result = getFieldErrorTranslationKey('division', issue as ZodIssue)
				expect(result).toBe('messages.team.divisionRequired')
			})
		})

		describe('default required field errors', () => {
			it('should return correct translation keys for standard fields', () => {
				const expectedMappings = {
					tournamentId: 'messages.team.tournamentRequired',
					clubName: 'messages.team.clubNameRequired',
					name: 'messages.team.nameRequired',
					division: 'messages.team.divisionRequired',
					category: 'messages.team.categoryRequired',
					teamLeaderName: 'messages.team.teamLeaderNameRequired',
					teamLeaderPhone: 'messages.team.phoneNumberRequired',
					teamLeaderEmail: 'messages.validation.emailRequired',
					privacyAgreement: 'messages.team.privacyAgreementRequired',
				}

				Object.entries(expectedMappings).forEach(([fieldName, expectedKey]) => {
					expect(getFieldErrorTranslationKey(fieldName)).toBe(expectedKey)
				})
			})

			it('should return correct translation keys for legacy store field names', () => {
				const legacyMappings = {
					selectedTournamentId: 'messages.team.tournamentRequired',
					selectedDivision: 'messages.team.divisionRequired',
					selectedCategory: 'messages.team.categoryRequired',
				}

				Object.entries(legacyMappings).forEach(([fieldName, expectedKey]) => {
					expect(getFieldErrorTranslationKey(fieldName)).toBe(expectedKey)
				})
			})

			it('should return default key for unknown fields', () => {
				expect(getFieldErrorTranslationKey('unknownField')).toBe(
					'messages.validation.fieldRequired',
				)
				expect(getFieldErrorTranslationKey('')).toBe(
					'messages.validation.fieldRequired',
				)
			})
		})

		describe('with zodIssue parameter', () => {
			it('should handle undefined zodIssue', () => {
				expect(getFieldErrorTranslationKey('clubName', undefined)).toBe(
					'messages.team.clubNameRequired',
				)
			})

			it('should handle zodIssue without code', () => {
				const issue: Partial<ZodIssue> = {
					code: 'invalid_type',
					expected: 'string',
					path: ['clubName'],
					message: 'Required',
				}
				expect(getFieldErrorTranslationKey('clubName', issue as ZodIssue)).toBe(
					'messages.team.clubNameRequired',
				)
			})

			it('should handle unknown zodIssue codes', () => {
				const issue: Partial<ZodIssue> = {
					code: 'invalid_type',
					expected: 'string',
					path: ['clubName'],
					message: 'Expected string, received number',
				}
				expect(getFieldErrorTranslationKey('clubName', issue as ZodIssue)).toBe(
					'messages.team.clubNameRequired',
				)
			})
		})
	})

	describe('validateSingleField', () => {
		const validFormData: TeamFormData = {
			tournamentId: 'tournament-1',
			clubName: 'Test Club',
			name: 'JO8-1' as TeamName,
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
					'name',
					'division',
					'category',
					'teamLeaderName',
					'teamLeaderPhone',
					'teamLeaderEmail',
					'privacyAgreement',
				]

				fields.forEach((fieldName) => {
					const result = validateSingleTeamField(fieldName, validFormData, 'create')
					expect(result).toBeNull()
				})
			})

			it('should return error key for empty required fields', () => {
				const emptyFormData = {
					...validFormData,
					tournamentId: '',
					clubName: '',
					name: '' as TeamName,
				}

				expect(validateSingleTeamField('tournamentId', emptyFormData, 'create')).toBe(
					'messages.team.tournamentRequired',
				)
				expect(validateSingleTeamField('clubName', emptyFormData, 'create')).toBe(
					'messages.team.clubNameRequired',
				)
				expect(validateSingleTeamField('name', emptyFormData, 'create')).toBe(
					'messages.team.nameRequired',
				)
			})

			it('should return error key for privacy agreement in create mode', () => {
				const invalidFormData = { ...validFormData, privacyAgreement: false }
				const result = validateSingleTeamField(
					'privacyAgreement',
					invalidFormData,
					'create',
				)
				expect(result).toBe('messages.team.privacyAgreementRequired')
			})

			it('should return error key for invalid email format', () => {
				const invalidFormData = {
					...validFormData,
					teamLeaderEmail: 'invalid-email' as Email,
				}
				const result = validateSingleTeamField(
					'teamLeaderEmail',
					invalidFormData,
					'create',
				)
				expect(result).toBe('messages.validation.emailInvalid')
			})

			it('should return error key for invalid phone format', () => {
				const invalidFormData = {
					...validFormData,
					teamLeaderPhone: 'invalid',
				}
				const result = validateSingleTeamField(
					'teamLeaderPhone',
					invalidFormData,
					'create',
				)
				expect(result).toBe('messages.validation.phoneNumberInvalid')
			})

			it('should return error key for too long team name', () => {
				const invalidFormData = {
					...validFormData,
					name: 'This is a very long team name that exceeds the maximum allowed length' as TeamName,
				}
				const result = validateSingleTeamField('name', invalidFormData, 'create')
				expect(result).toBe('messages.team.nameTooLong')
			})
		})

		describe('edit mode', () => {
			it('should return null for valid fields', () => {
				const fields = [
					'tournamentId',
					'clubName',
					'name',
					'division',
					'category',
					'teamLeaderName',
					'teamLeaderPhone',
					'teamLeaderEmail',
				]

				fields.forEach((fieldName) => {
					const result = validateSingleTeamField(fieldName, validFormData, 'edit')
					expect(result).toBeNull()
				})
			})

			it('should not require privacy agreement in edit mode', () => {
				const invalidFormData = { ...validFormData, privacyAgreement: false }
				const result = validateSingleTeamField(
					'privacyAgreement',
					invalidFormData,
					'edit',
				)
				expect(result).toBeNull()
			})

			it('should return error key for empty required fields', () => {
				const emptyFormData = {
					...validFormData,
					tournamentId: '',
					clubName: '',
					name: '' as TeamName,
				}

				expect(validateSingleTeamField('tournamentId', emptyFormData, 'edit')).toBe(
					'messages.team.tournamentRequired',
				)
				expect(validateSingleTeamField('clubName', emptyFormData, 'edit')).toBe(
					'messages.team.clubNameRequired',
				)
				expect(validateSingleTeamField('name', emptyFormData, 'edit')).toBe(
					'messages.team.nameRequired',
				)
			})
		})

		describe('fallback validation', () => {
			it('should handle validation errors gracefully', () => {
				// Test with invalid form data that might cause validation to throw
				const invalidFormData = {} as TeamFormData
				const result = validateSingleTeamField('clubName', invalidFormData, 'create')
				expect(result).toBe('messages.team.clubNameRequired')
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
			name: 'JO8-1' as TeamName,
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
					name: '' as TeamName,
					division: '',
					category: '',
					teamLeaderName: '',
					teamLeaderPhone: '',
					teamLeaderEmail: '' as Email,
					privacyAgreement: false,
				}

				const result = validateEntireTeamForm(emptyFormData, 'create')

				expect(result).toEqual({
					tournamentId: 'messages.team.tournamentRequired',
					clubName: 'messages.team.clubNameRequired',
					name: 'messages.team.nameRequired',
					division: 'messages.team.divisionRequired',
					category: 'messages.team.categoryRequired',
					teamLeaderName: 'messages.team.teamLeaderNameRequired',
					teamLeaderPhone: 'messages.team.phoneNumberRequired',
					teamLeaderEmail: 'messages.validation.emailRequired',
					privacyAgreement: 'messages.team.privacyAgreementRequired',
				})
			})

			it('should return specific field errors for invalid data', () => {
				const invalidFormData = {
					...validFormData,
					teamLeaderEmail: 'invalid-email' as Email,
					teamLeaderPhone: 'invalid',
					name: 'This is a very long team name that exceeds the maximum allowed length' as TeamName,
				}

				const result = validateEntireTeamForm(invalidFormData, 'create')

				expect(result.teamLeaderEmail).toBe('messages.validation.emailInvalid')
				expect(result.teamLeaderPhone).toBe('messages.validation.phoneNumberInvalid')
				expect(result.name).toBe('messages.team.nameTooLong')
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
					name: '' as TeamName,
					division: '',
					category: '',
					teamLeaderName: '',
					teamLeaderPhone: '',
					teamLeaderEmail: '' as Email,
					privacyAgreement: false, // Should not be required in edit mode
				}

				const result = validateEntireTeamForm(emptyFormData, 'edit')

				expect(result).toEqual({
					tournamentId: 'messages.team.tournamentRequired',
					clubName: 'messages.team.clubNameRequired',
					name: 'messages.team.nameRequired',
					division: 'messages.team.divisionRequired',
					category: 'messages.team.categoryRequired',
					teamLeaderName: 'messages.team.teamLeaderNameRequired',
					teamLeaderPhone: 'messages.team.phoneNumberRequired',
					teamLeaderEmail: 'messages.validation.emailRequired',
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
				expect(result.tournamentId).toBe('messages.team.tournamentRequired')
			})

			it('should return empty object for unexpected errors', () => {
				// Test edge case scenarios
				const result = validateEntireTeamForm(null as unknown as TeamFormData, 'create')
				expect(result).toEqual({})
			})
		})
	})
})
