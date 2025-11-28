import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TournamentData } from '~/features/tournaments/types'

import { useTeamFormStore } from '../useTeamFormStore'

// Helper to access store state
const state = useTeamFormStore.getState

// Mock the clearStorage method
const mockClearStorage = vi.fn()
useTeamFormStore.persist.clearStorage = mockClearStorage

// Mock data
const mockTournaments: TournamentData[] = [
	{
		id: 'tournament1',
		name: 'Summer Tournament',
		location: 'Stadium A',
		startDate: '2024-06-01',
		endDate: '2024-06-03',
		divisions: ['FIRST_DIVISION', 'SECOND_DIVISION'],
		categories: ['JO8', 'JO9', 'JO10'],
	},
	{
		id: 'tournament2',
		name: 'Winter Cup',
		location: 'Stadium B',
		startDate: '2024-12-01',
		endDate: null,
		divisions: ['FIRST_DIVISION'],
		categories: ['JO9', 'JO11'],
	},
]

describe('useTeamFormStore', () => {
	beforeEach(() => {
		// Reset store to initial state
		state().resetForm()

		// Clear mocks
		vi.clearAllMocks()
		mockClearStorage.mockClear()
	})

	describe('Initial State', () => {
		it('should initialize with default form field values', () => {
			expect(state().formFields.tournamentId).toBe('')
			expect(state().formFields.division).toBe('')
			expect(state().formFields.category).toBe('')
			expect(state().formFields.clubName).toBe('')
			expect(state().formFields.name).toBe('')
			expect(state().formFields.teamLeaderName).toBe('')
			expect(state().formFields.teamLeaderPhone).toBe('')
			expect(state().formFields.teamLeaderEmail).toBe('')
			expect(state().formFields.privacyAgreement).toBe(false)
		})

		it('should initialize with default validation state', () => {
			expect(state().validation.errors).toEqual({})
			expect(state().validation.displayErrors).toEqual({})
			expect(state().validation.blurredFields).toEqual({})
			expect(state().validation.submitAttempted).toBe(false)
			expect(state().validation.forceShowAllErrors).toBe(false)
		})

		it('should initialize with default form metadata', () => {
			expect(state().formMeta.mode).toBe('create')
			expect(state().formMeta.isSubmitting).toBe(false)
			expect(state().formMeta.isValid).toBe(false)
			expect(state().availableOptions.tournaments).toEqual([])
			expect(state().availableOptions.divisions).toEqual([])
			expect(state().availableOptions.categories).toEqual([])
		})
	})

	describe('Form Field Management', () => {
		it('should set individual form fields', () => {
			state().setFormField('clubName', 'Test Club')
			state().setFormField('name', 'Test Team')
			state().setFormField('teamLeaderName', 'John Doe')
			state().setFormField('teamLeaderPhone', '+1234567890')
			state().setFormField('teamLeaderEmail', 'john@example.com')
			state().setFormField('privacyAgreement', true)

			expect(state().formFields.clubName).toBe('Test Club')
			expect(state().formFields.name).toBe('Test Team')
			expect(state().formFields.teamLeaderName).toBe('John Doe')
			expect(state().formFields.teamLeaderPhone).toBe('+1234567890')
			expect(state().formFields.teamLeaderEmail).toBe('john@example.com')
			expect(state().formFields.privacyAgreement).toBe(true)
		})

		it('should set bulk form data', () => {
			const formData = {
				clubName: 'Bulk Club',
				name: 'JO8-1' as const,
				teamLeaderName: 'Jane Doe',
				teamLeaderEmail: 'jane@example.com' as const,
			}

			state().setFormData(formData)

			expect(state().formFields.clubName).toBe('Bulk Club')
			expect(state().formFields.name).toBe('JO8-1')
			expect(state().formFields.teamLeaderName).toBe('Jane Doe')
			expect(state().formFields.teamLeaderEmail).toBe('jane@example.com')
		})

		it('should reset form to initial state', () => {
			// Set some form data
			state().setFormField('clubName', 'Test Club')
			state().setFormField('tournamentId', 'tournament1')
			state().setValidationField('displayErrors', { clubName: 'Test error' })

			// Reset form
			state().resetForm()

			// Check that form fields are reset
			expect(state().formFields.clubName).toBe('')
			expect(state().formFields.tournamentId).toBe('')
			expect(state().validation.displayErrors).toEqual({})
		})
	})

	describe('Field Value Helper', () => {
		it('should get current field values correctly', () => {
			// Set some values
			state().setFormField('clubName', 'Test Club')
			state().setFormField('tournamentId', 'tournament1')
			state().setFormField('privacyAgreement', true)

			expect(state().formFields.clubName).toBe('Test Club')
			expect(state().formFields.tournamentId).toBe('tournament1')
			expect(state().formFields.privacyAgreement).toBe(true)
		})
	})

	describe('Tournament and Cascade Logic', () => {
		beforeEach(() => {
			state().setAvailableOptionsField('tournaments', mockTournaments)
		})

		it('should set selected tournament and reset dependent fields', () => {
			// First set some values
			state().setFormField('division', 'FIRST_DIVISION')
			state().setFormField('category', 'JO8')

			// Then change tournament - should reset dependent fields
			state().setFormField('tournamentId', 'tournament1')

			expect(state().formFields.tournamentId).toBe('tournament1')
			expect(state().formFields.division).toBe('') // Should be reset
			expect(state().formFields.category).toBe('') // Should be reset
			expect(state().availableOptions.divisions).toEqual([
				'FIRST_DIVISION',
				'SECOND_DIVISION',
			])
			expect(state().availableOptions.categories).toEqual(['JO8', 'JO9', 'JO10'])
		})

		it('should set selected division and reset category', () => {
			// First set tournament and category
			state().setFormField('tournamentId', 'tournament1')
			state().setFormField('category', 'JO8')

			// Then change division - should reset category
			state().setFormField('division', 'FIRST_DIVISION')

			expect(state().formFields.tournamentId).toBe('tournament1') // Should preserve
			expect(state().formFields.division).toBe('FIRST_DIVISION')
			expect(state().formFields.category).toBe('') // Should be reset
		})

		it('should set category without affecting other fields', () => {
			state().setFormField('tournamentId', 'tournament1')
			state().setFormField('division', 'FIRST_DIVISION')
			state().setFormField('category', 'JO8')

			expect(state().formFields.tournamentId).toBe('tournament1')
			expect(state().formFields.division).toBe('FIRST_DIVISION')
			expect(state().formFields.category).toBe('JO8')
		})

		it('should update available options when tournament changes', () => {
			state().setFormField('tournamentId', 'tournament2')

			expect(state().availableOptions.divisions).toEqual(['FIRST_DIVISION'])
			expect(state().availableOptions.categories).toEqual(['JO9', 'JO11'])
		})
	})

	describe('Reactive Validation System', () => {
		it('should validate field immediately when touched', () => {
			// Mark field as touched - should trigger validation immediately
			state().setFieldBlurred('clubName')

			// Since clubName is empty and now touched, should show error
			expect(state().validation.displayErrors.clubName).toBe(
				'messages.team.clubNameRequired',
			)
			expect(state().validation.blurredFields.clubName).toBe(true)
		})

		it('should not show validation errors for untouched fields', () => {
			// Validate field without touching it first
			state().validateField('clubName')

			// Should NOT show error because field is not touched and no flags are set
			expect(state().validation.displayErrors.clubName).toBeUndefined()
		})

		it('should validate field when forceShowAllErrors is true', () => {
			// Set force show all errors
			state().setValidationField('forceShowAllErrors', true)

			// Now validation should work even for untouched fields
			state().validateField('clubName')
			expect(state().validation.displayErrors.clubName).toBe(
				'messages.team.clubNameRequired',
			)
		})

		it('should validate field when submitAttempted is true', () => {
			// Set submit attempted
			state().setValidationField('submitAttempted', true)

			// Now validation should work even for untouched fields
			state().validateField('clubName')
			expect(state().validation.displayErrors.clubName).toBe(
				'messages.team.clubNameRequired',
			)
		})

		it('should clear error when field becomes valid', () => {
			// Touch field and trigger error
			state().setFieldBlurred('clubName')
			expect(state().validation.displayErrors.clubName).toBe(
				'messages.team.clubNameRequired',
			)

			// Set valid value and validate again
			state().setFormField('clubName', 'Valid Club')
			state().validateField('clubName')

			// Error should be cleared
			expect(state().validation.displayErrors.clubName).toBeUndefined()
		})

		it('should validate all touched fields', () => {
			// Touch multiple fields
			state().setFieldBlurred('clubName')
			state().setFieldBlurred('name')
			state().setFieldBlurred('teamLeaderName')

			// Validate all touched fields - this method was removed, so we'll validate individually
			state().validateField('clubName')
			state().validateField('name')
			state().validateField('teamLeaderName')

			// All touched fields should show errors
			expect(state().validation.displayErrors.clubName).toBe(
				'messages.team.clubNameRequired',
			)
			expect(state().validation.displayErrors.name).toBe('messages.team.nameRequired')
			expect(state().validation.displayErrors.teamLeaderName).toBe(
				'messages.team.teamLeaderNameRequired',
			)

			// Untouched fields should not show errors
			expect(state().validation.displayErrors.tournamentId).toBeUndefined()
		})
	})

	describe('Form Validation as Collection of Field Validations', () => {
		it('should validate entire form and show all required field errors', () => {
			// Form with missing required fields should be invalid
			const isValid = state().validateForm()

			expect(isValid).toBe(false)
			expect(state().formMeta.isValid).toBe(false)
			expect(state().validation.forceShowAllErrors).toBe(true) // Should be set during form validation

			// All required fields should show errors
			expect(state().validation.displayErrors.tournamentId).toBe(
				'messages.team.tournamentRequired',
			)
			expect(state().validation.displayErrors.clubName).toBe(
				'messages.team.clubNameRequired',
			)
			expect(state().validation.displayErrors.name).toBe('messages.team.nameRequired')
			expect(state().validation.displayErrors.division).toBe(
				'messages.team.divisionRequired',
			)
			expect(state().validation.displayErrors.category).toBe(
				'messages.team.categoryRequired',
			)
			expect(state().validation.displayErrors.teamLeaderName).toBe(
				'messages.team.teamLeaderNameRequired',
			)
			expect(state().validation.displayErrors.teamLeaderPhone).toBe(
				'messages.team.phoneNumberRequired',
			)
			expect(state().validation.displayErrors.teamLeaderEmail).toBe(
				'messages.validation.emailRequired',
			)
			expect(state().validation.displayErrors.privacyAgreement).toBe(
				'messages.team.privacyAgreementRequired',
			)
		})

		it('should validate form as valid when all required fields are filled', () => {
			// Fill all required fields
			state().setFormField('tournamentId', 'tournament1')
			state().setFormField('clubName', 'Test Club')
			state().setFormField('name', 'JO8-1')
			state().setFormField('division', 'FIRST_DIVISION')
			state().setFormField('category', 'JO8')
			state().setFormField('teamLeaderName', 'John Doe')
			state().setFormField('teamLeaderPhone', '+1234567890')
			state().setFormField('teamLeaderEmail', 'john@example.com')
			state().setFormField('privacyAgreement', true)

			// Validate form
			const isValid = state().validateForm()

			expect(isValid).toBe(true)
			expect(state().formMeta.isValid).toBe(true)
			expect(Object.keys(state().validation.displayErrors)).toHaveLength(0)
		})

		it('should not require privacy agreement in edit mode', () => {
			// Set to edit mode
			state().setFormMetaField('mode', 'edit')

			// Fill required fields except privacy agreement
			state().setFormField('tournamentId', 'tournament1')
			state().setFormField('clubName', 'Test Club')
			state().setFormField('name', 'JO8-1')
			state().setFormField('division', 'FIRST_DIVISION')
			state().setFormField('category', 'JO8')
			state().setFormField('teamLeaderName', 'John Doe')
			state().setFormField('teamLeaderPhone', '+1234567890')
			state().setFormField('teamLeaderEmail', 'john@example.com')
			// Note: NOT setting privacy agreement

			// Validate form
			const isValid = state().validateForm()

			expect(isValid).toBe(true)
			expect(state().validation.displayErrors.privacyAgreement).toBeUndefined()
		})
	})

	describe('Field Error Management', () => {
		it('should set and clear field errors', () => {
			state().setFieldError('clubName', 'messages.team.clubNameRequired')
			expect(state().validation.displayErrors.clubName).toBe(
				'messages.team.clubNameRequired',
			)

			state().clearFieldError('clubName')
			expect(state().validation.displayErrors.clubName).toBeUndefined()
		})

		it('should set validation errors in bulk', () => {
			const errors = {
				clubName: 'Required',
				name: 'Too long',
			}

			state().setValidationField('errors', errors)
			expect(state().validation.errors).toEqual(errors)
		})

		it('should set display errors in bulk', () => {
			const errors = {
				clubName: 'messages.team.clubNameRequired',
				name: 'messages.team.nameRequired',
			}

			state().setValidationField('displayErrors', errors)
			expect(state().validation.displayErrors).toEqual(errors)
		})
	})

	describe('Form Metadata', () => {
		it('should set form mode', () => {
			state().setFormMetaField('mode', 'edit')
			expect(state().formMeta.mode).toBe('edit')
		})

		it('should set submitting state', () => {
			state().setFormMetaField('isSubmitting', true)
			expect(state().formMeta.isSubmitting).toBe(true)
		})

		it('should set form validity', () => {
			state().setFormMetaField('isValid', true)
			expect(state().formMeta.isValid).toBe(true)
		})

		it('should set submit attempted flag', () => {
			state().setValidationField('submitAttempted', true)
			expect(state().validation.submitAttempted).toBe(true)
		})

		it('should set force show all errors flag', () => {
			state().setValidationField('forceShowAllErrors', true)
			expect(state().validation.forceShowAllErrors).toBe(true)
		})
	})

	describe('Form Data Extraction', () => {
		it('should return current form data in TeamFormData format', () => {
			// Set up form data
			state().setFormField('tournamentId', 'tournament1')
			state().setFormField('clubName', 'Test Club')
			state().setFormField('name', 'JO8-1')
			state().setFormField('division', 'FIRST_DIVISION')
			state().setFormField('category', 'JO8')
			state().setFormField('teamLeaderName', 'John Doe')
			state().setFormField('teamLeaderPhone', '+1234567890')
			state().setFormField('teamLeaderEmail', 'john@example.com')
			state().setFormField('privacyAgreement', true)

			const formData = state().getFormData()

			expect(formData).toEqual({
				tournamentId: 'tournament1',
				clubName: 'Test Club',
				name: 'JO8-1',
				division: 'FIRST_DIVISION',
				category: 'JO8',
				teamLeaderName: 'John Doe',
				teamLeaderPhone: '+1234567890',
				teamLeaderEmail: 'john@example.com',
				privacyAgreement: true,
			})
		})
	})

	describe('Persistence', () => {
		it('should persist form data to sessionStorage', () => {
			state().setFormField('clubName', 'Persistent Club')
			state().setFormField('tournamentId', 'tournament1')

			// Get the persisted data from sessionStorage
			const persistedDataString = sessionStorage.getItem('team-form-storage')
			expect(persistedDataString).not.toBeNull()

			if (persistedDataString) {
				const persistedData = JSON.parse(persistedDataString)

				// Zustand persist middleware wraps the state in a 'state' key and adds a version
				expect(persistedData).toHaveProperty('state')
				expect(persistedData).toHaveProperty('version')

				// Check that the persisted state contains the expected values
				expect(persistedData.state.formFields.clubName).toBe('Persistent Club')
				expect(persistedData.state.formFields.tournamentId).toBe('tournament1')

				// Validation state should NOT be persisted
				expect(persistedData.state.validation).toBeUndefined()
			}
		})
	})

	describe('Complex Reactive Scenarios', () => {
		beforeEach(() => {
			state().setAvailableOptionsField('tournaments', mockTournaments)
		})

		it('should handle reactive validation during form completion flow', () => {
			// Start form - no errors visible
			expect(Object.keys(state().validation.displayErrors)).toHaveLength(0)

			// User clicks on club name field and tabs away empty - should show error
			state().setFieldBlurred('clubName')
			expect(state().validation.displayErrors.clubName).toBe(
				'messages.team.clubNameRequired',
			)

			// User types in club name - error should clear
			state().setFormField('clubName', 'Test Club')
			state().validateField('clubName')
			expect(state().validation.displayErrors.clubName).toBeUndefined()

			// User touches team name but leaves empty - should show error
			state().setFieldBlurred('name')
			expect(state().validation.displayErrors.name).toBe('messages.team.nameRequired')

			// Other untouched fields should still not show errors
			expect(state().validation.displayErrors.tournamentId).toBeUndefined()
			expect(state().validation.displayErrors.teamLeaderEmail).toBeUndefined()
		})

		it('should handle cascade validation with tournament changes', () => {
			// User selects tournament and division, marks them as touched
			state().setFieldBlurred('tournamentId')
			state().setFormField('tournamentId', 'tournament1')
			state().setFieldBlurred('division')
			state().setFormField('division', 'FIRST_DIVISION')

			// Both should be valid now
			expect(state().validation.displayErrors.tournamentId).toBeUndefined()
			expect(state().validation.displayErrors.division).toBeUndefined()

			// User changes tournament - division is reset but validation should handle gracefully
			state().setFormField('tournamentId', 'tournament2')
			expect(state().formFields.division).toBe('') // Reset by cascade

			// Since division field was previously touched, it should show error now that it's empty
			state().validateField('division')
			expect(state().validation.displayErrors.division).toBe(
				'messages.team.divisionRequired',
			)
		})

		it('should handle form submission with mixed touched/untouched fields', () => {
			// User only touches and fills some fields
			state().setFieldBlurred('clubName')
			state().setFormField('clubName', 'Test Club')
			state().setFieldBlurred('name')
			state().setFormField('name', 'JO8-1')

			// Only touched fields show errors currently
			expect(Object.keys(state().validation.displayErrors)).toHaveLength(0)

			// User submits form - should validate ALL fields regardless of touched state
			const isValid = state().validateForm()

			expect(isValid).toBe(false)
			expect(state().validation.forceShowAllErrors).toBe(true)

			// Now ALL required fields should show errors
			expect(state().validation.displayErrors.tournamentId).toBe(
				'messages.team.tournamentRequired',
			)
			expect(state().validation.displayErrors.division).toBe(
				'messages.team.divisionRequired',
			)
			expect(state().validation.displayErrors.privacyAgreement).toBe(
				'messages.team.privacyAgreementRequired',
			)

			// Previously valid touched fields should remain valid
			expect(state().validation.displayErrors.clubName).toBeUndefined()
			expect(state().validation.displayErrors.teamName).toBeUndefined()
		})
	})

	describe('Session Storage Management', () => {
		it('should clear session storage when clearSessionStorage is called', () => {
			state().clearSessionStorage()
			expect(mockClearStorage).toHaveBeenCalledTimes(1)
		})

		it('should call clearSessionStorage when resetStoreState is called', () => {
			state().resetStoreState()
			expect(mockClearStorage).toHaveBeenCalledTimes(1)
		})

		it('should call clearSessionStorage when resetForm is called', () => {
			state().resetForm()
			expect(mockClearStorage).toHaveBeenCalledTimes(1)
		})

		it('should reset store state and clear session storage', () => {
			// Set some form data
			state().setFormField('clubName', 'Test Club')
			state().setFormField('tournamentId', 'tournament1')
			state().setValidationField('displayErrors', { clubName: 'Test error' })

			// Reset store state
			state().resetStoreState()

			// Check that form fields are reset
			expect(state().formFields.clubName).toBe('')
			expect(state().formFields.tournamentId).toBe('')
			expect(state().validation.displayErrors).toEqual({})

			// Check that clearSessionStorage was called
			expect(mockClearStorage).toHaveBeenCalledTimes(1)
		})
	})
})
