import { describe, expect, it, vi } from 'vitest'

import { translateUserError } from '../userErrorUtils'

// Mock i18next
vi.mock('i18next', () => ({
	default: {
		t: (key: string) => `translated:${key}`,
	},
}))

describe('userErrorUtils', () => {
	describe('translateUserError', () => {
		it('should translate known user error keys', () => {
			const knownErrorKeys = [
				'userNotFound',
				'requestFailed',
				'requestFailedRefresh',
				'displayNameRequired',
				'cannotChangeOwnRole',
				'cannotDeactivateOwnAccount',
				'cannotReactivateOwnAccount',
				'unknownError',
			]

			knownErrorKeys.forEach((key) => {
				const result = translateUserError(key)
				expect(result).toBe(`translated:messages.user.${key}`)
			})
		})

		it('should return raw error message for unknown keys', () => {
			const unknownErrors = [
				'someRandomError',
				'database connection failed',
				'Network timeout',
				'Something went wrong',
			]

			unknownErrors.forEach((error) => {
				const result = translateUserError(error)
				expect(result).toBe(error)
			})
		})

		it('should return raw error for technical error messages', () => {
			const technicalErrors = [
				'Error: Database connection failed',
				'TypeError: Cannot read property of undefined',
				'Network request failed with status 500',
			]

			technicalErrors.forEach((error) => {
				const result = translateUserError(error)
				expect(result).toBe(error)
			})
		})

		it('should handle empty string', () => {
			const result = translateUserError('')
			expect(result).toBe('')
		})

		it('should handle strings with spaces', () => {
			const errorWithSpaces = 'An unexpected error occurred'
			const result = translateUserError(errorWithSpaces)
			expect(result).toBe(errorWithSpaces)
		})

		it('should be case-sensitive for error keys', () => {
			// These should NOT be translated because they don't match exactly
			const result1 = translateUserError('UserNotFound') // Capital U
			const result2 = translateUserError('USERNOTFOUND') // All caps
			const result3 = translateUserError('user_not_found') // Snake case

			expect(result1).toBe('UserNotFound')
			expect(result2).toBe('USERNOTFOUND')
			expect(result3).toBe('user_not_found')
		})

		it('should handle strings that partially match error keys', () => {
			// These contain known error keys but are longer strings
			const result1 = translateUserError('userNotFound in database')
			const result2 = translateUserError('Error: userNotFound')

			expect(result1).toBe('userNotFound in database')
			expect(result2).toBe('Error: userNotFound')
		})
	})
})
