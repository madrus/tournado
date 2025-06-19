import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TournamentData } from '~/lib/lib.types'

import { useTeamFormStore } from '../useTeamFormStore'

// Helper to access store state
const state = useTeamFormStore.getState

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
  })

  describe('Initial State', () => {
    it('should initialize with default form field values', () => {
      expect(state().tournamentId).toBe('')
      expect(state().division).toBe('')
      expect(state().category).toBe('')
      expect(state().clubName).toBe('')
      expect(state().teamName).toBe('')
      expect(state().teamLeaderName).toBe('')
      expect(state().teamLeaderPhone).toBe('')
      expect(state().teamLeaderEmail).toBe('')
      expect(state().privacyAgreement).toBe(false)
    })

    it('should initialize with default validation state', () => {
      expect(state().validationErrors).toEqual({})
      expect(state().displayErrors).toEqual({})
      expect(state().touchedFields).toEqual({})
      expect(state().submitAttempted).toBe(false)
      expect(state().forceShowAllErrors).toBe(false)
    })

    it('should initialize with default form metadata', () => {
      expect(state().mode).toBe('create')
      expect(state().isSubmitting).toBe(false)
      expect(state().isValid).toBe(false)
      expect(state().availableTournaments).toEqual([])
      expect(state().availableDivisions).toEqual([])
      expect(state().availableCategories).toEqual([])
    })
  })

  describe('Form Field Management', () => {
    it('should set individual form fields', () => {
      state().setClubName('Test Club')
      state().setTeamName('Test Team')
      state().setTeamLeaderName('John Doe')
      state().setTeamLeaderPhone('+1234567890')
      state().setTeamLeaderEmail('john@example.com')
      state().setPrivacyAgreement(true)

      expect(state().clubName).toBe('Test Club')
      expect(state().teamName).toBe('Test Team')
      expect(state().teamLeaderName).toBe('John Doe')
      expect(state().teamLeaderPhone).toBe('+1234567890')
      expect(state().teamLeaderEmail).toBe('john@example.com')
      expect(state().privacyAgreement).toBe(true)
    })

    it('should set bulk form data', () => {
      const formData = {
        clubName: 'Bulk Club',
        teamName: 'JO8-1' as const,
        teamLeaderName: 'Jane Doe',
        teamLeaderEmail: 'jane@example.com' as const,
      }

      state().setFormData(formData)

      expect(state().clubName).toBe('Bulk Club')
      expect(state().teamName).toBe('JO8-1')
      expect(state().teamLeaderName).toBe('Jane Doe')
      expect(state().teamLeaderEmail).toBe('jane@example.com')
    })

    it('should reset form to initial state', () => {
      // Set some form data
      state().setClubName('Test Club')
      state().setTournamentId('tournament1')
      state().setFieldError('clubName', 'Test error')

      // Reset form
      state().resetForm()

      // Check that form fields are reset
      expect(state().clubName).toBe('')
      expect(state().tournamentId).toBe('')
      expect(state().displayErrors).toEqual({})
    })
  })

  describe('Field Value Helper', () => {
    it('should get current field values correctly', () => {
      // Set some values
      state().setClubName('Test Club')
      state().setTournamentId('tournament1')
      state().setPrivacyAgreement(true)

      // Test getFieldValue helper
      expect(state().getFieldValue('clubName')).toBe('Test Club')
      expect(state().getFieldValue('tournamentId')).toBe('tournament1') // Should work with alias
      expect(state().getFieldValue('privacyAgreement')).toBe(true)
      expect(state().getFieldValue('nonexistent')).toBe('')
    })
  })

  describe('Tournament and Cascade Logic', () => {
    beforeEach(() => {
      state().setAvailableTournaments(mockTournaments)
    })

    it('should set selected tournament and reset dependent fields', () => {
      // First set some values
      state().setDivision('FIRST_DIVISION')
      state().setCategory('JO8')

      // Then change tournament - should reset dependent fields
      state().setTournamentId('tournament1')

      expect(state().tournamentId).toBe('tournament1')
      expect(state().division).toBe('') // Should be reset
      expect(state().category).toBe('') // Should be reset
      expect(state().availableDivisions).toEqual(['FIRST_DIVISION', 'SECOND_DIVISION'])
      expect(state().availableCategories).toEqual(['JO8', 'JO9', 'JO10'])
    })

    it('should set selected division and reset category', () => {
      // First set tournament and category
      state().setTournamentId('tournament1')
      state().setCategory('JO8')

      // Then change division - should reset category
      state().setDivision('FIRST_DIVISION')

      expect(state().tournamentId).toBe('tournament1') // Should preserve
      expect(state().division).toBe('FIRST_DIVISION')
      expect(state().category).toBe('') // Should be reset
    })

    it('should set category without affecting other fields', () => {
      state().setTournamentId('tournament1')
      state().setDivision('FIRST_DIVISION')
      state().setCategory('JO8')

      expect(state().tournamentId).toBe('tournament1')
      expect(state().division).toBe('FIRST_DIVISION')
      expect(state().category).toBe('JO8')
    })

    it('should update available options when tournament changes', () => {
      state().setTournamentId('tournament2')

      expect(state().availableDivisions).toEqual(['FIRST_DIVISION'])
      expect(state().availableCategories).toEqual(['JO9', 'JO11'])
    })
  })

  describe('Reactive Validation System', () => {
    it('should validate field immediately when touched', () => {
      // Mark field as touched - should trigger validation immediately
      state().setFieldTouched('clubName')

      // Since clubName is empty and now touched, should show error
      expect(state().displayErrors.clubName).toBe('teams.form.errors.clubNameRequired')
      expect(state().touchedFields.clubName).toBe(true)
    })

    it('should not show validation errors for untouched fields', () => {
      // Validate field without touching it first
      state().validateField('clubName')

      // Should NOT show error because field is not touched and no flags are set
      expect(state().displayErrors.clubName).toBeUndefined()
    })

    it('should validate field when forceShowAllErrors is true', () => {
      // Set force show all errors
      state().setForceShowAllErrors(true)

      // Now validation should work even for untouched fields
      state().validateField('clubName')
      expect(state().displayErrors.clubName).toBe('teams.form.errors.clubNameRequired')
    })

    it('should validate field when submitAttempted is true', () => {
      // Set submit attempted
      state().setSubmitAttempted(true)

      // Now validation should work even for untouched fields
      state().validateField('clubName')
      expect(state().displayErrors.clubName).toBe('teams.form.errors.clubNameRequired')
    })

    it('should clear error when field becomes valid', () => {
      // Touch field and trigger error
      state().setFieldTouched('clubName')
      expect(state().displayErrors.clubName).toBe('teams.form.errors.clubNameRequired')

      // Set valid value and validate again
      state().setClubName('Valid Club')
      state().validateField('clubName')

      // Error should be cleared
      expect(state().displayErrors.clubName).toBeUndefined()
    })

    it('should validate all touched fields', () => {
      // Touch multiple fields
      state().setFieldTouched('clubName')
      state().setFieldTouched('teamName')
      state().setFieldTouched('teamLeaderName')

      // Validate all touched fields
      state().validateAllTouchedFields()

      // All touched fields should show errors
      expect(state().displayErrors.clubName).toBe('teams.form.errors.clubNameRequired')
      expect(state().displayErrors.teamName).toBe('teams.form.errors.teamNameRequired')
      expect(state().displayErrors.teamLeaderName).toBe(
        'teams.form.errors.teamLeaderNameRequired'
      )

      // Untouched fields should not show errors
      expect(state().displayErrors.tournamentId).toBeUndefined()
    })
  })

  describe('Form Validation as Collection of Field Validations', () => {
    it('should validate entire form and show all required field errors', () => {
      // Form with missing required fields should be invalid
      const isValid = state().validateForm()

      expect(isValid).toBe(false)
      expect(state().isValid).toBe(false)
      expect(state().forceShowAllErrors).toBe(true) // Should be set during form validation

      // All required fields should show errors
      expect(state().displayErrors.tournamentId).toBe(
        'teams.form.errors.tournamentRequired'
      )
      expect(state().displayErrors.clubName).toBe('teams.form.errors.clubNameRequired')
      expect(state().displayErrors.teamName).toBe('teams.form.errors.teamNameRequired')
      expect(state().displayErrors.division).toBe('teams.form.errors.divisionRequired')
      expect(state().displayErrors.category).toBe('teams.form.errors.categoryRequired')
      expect(state().displayErrors.teamLeaderName).toBe(
        'teams.form.errors.teamLeaderNameRequired'
      )
      expect(state().displayErrors.teamLeaderPhone).toBe(
        'teams.form.errors.phoneNumberRequired'
      )
      expect(state().displayErrors.teamLeaderEmail).toBe(
        'teams.form.errors.emailRequired'
      )
      expect(state().displayErrors.privacyAgreement).toBe(
        'teams.form.errors.privacyAgreementRequired'
      )
    })

    it('should validate form as valid when all required fields are filled', () => {
      // Fill all required fields
      state().setTournamentId('tournament1')
      state().setClubName('Test Club')
      state().setTeamName('JO8-1')
      state().setDivision('FIRST_DIVISION')
      state().setCategory('JO8')
      state().setTeamLeaderName('John Doe')
      state().setTeamLeaderPhone('+1234567890')
      state().setTeamLeaderEmail('john@example.com')
      state().setPrivacyAgreement(true)

      // Validate form
      const isValid = state().validateForm()

      expect(isValid).toBe(true)
      expect(state().isValid).toBe(true)
      expect(Object.keys(state().displayErrors)).toHaveLength(0)
    })

    it('should not require privacy agreement in edit mode', () => {
      // Set to edit mode
      state().setMode('edit')

      // Fill required fields except privacy agreement
      state().setTournamentId('tournament1')
      state().setClubName('Test Club')
      state().setTeamName('JO8-1')
      state().setDivision('FIRST_DIVISION')
      state().setCategory('JO8')
      state().setTeamLeaderName('John Doe')
      state().setTeamLeaderPhone('+1234567890')
      state().setTeamLeaderEmail('john@example.com')
      // Note: NOT setting privacy agreement

      // Validate form
      const isValid = state().validateForm()

      expect(isValid).toBe(true)
      expect(state().displayErrors.privacyAgreement).toBeUndefined()
    })
  })

  describe('Field Error Management', () => {
    it('should set and clear field errors', () => {
      state().setFieldError('clubName', 'teams.form.errors.clubNameRequired')
      expect(state().displayErrors.clubName).toBe('teams.form.errors.clubNameRequired')

      state().clearFieldError('clubName')
      expect(state().displayErrors.clubName).toBeUndefined()
    })

    it('should set validation errors in bulk', () => {
      const errors = {
        clubName: 'Required',
        teamName: 'Too long',
      }

      state().setValidationErrors(errors)
      expect(state().validationErrors).toEqual(errors)
    })

    it('should set display errors in bulk', () => {
      const errors = {
        clubName: 'teams.form.errors.clubNameRequired',
        teamName: 'teams.form.errors.teamNameRequired',
      }

      state().setDisplayErrors(errors)
      expect(state().displayErrors).toEqual(errors)
    })
  })

  describe('Form Metadata', () => {
    it('should set form mode', () => {
      state().setMode('edit')
      expect(state().mode).toBe('edit')
    })

    it('should set submitting state', () => {
      state().setSubmitting(true)
      expect(state().isSubmitting).toBe(true)
    })

    it('should set form validity', () => {
      state().setValid(true)
      expect(state().isValid).toBe(true)
    })

    it('should set submit attempted flag', () => {
      state().setSubmitAttempted(true)
      expect(state().submitAttempted).toBe(true)
    })

    it('should set force show all errors flag', () => {
      state().setForceShowAllErrors(true)
      expect(state().forceShowAllErrors).toBe(true)
    })
  })

  describe('Form Data Extraction', () => {
    it('should return current form data in TeamFormData format', () => {
      // Set up form data
      state().setTournamentId('tournament1')
      state().setClubName('Test Club')
      state().setTeamName('JO8-1')
      state().setDivision('FIRST_DIVISION')
      state().setCategory('JO8')
      state().setTeamLeaderName('John Doe')
      state().setTeamLeaderPhone('+1234567890')
      state().setTeamLeaderEmail('john@example.com')
      state().setPrivacyAgreement(true)

      const formData = state().getFormData()

      expect(formData).toEqual({
        tournamentId: 'tournament1',
        clubName: 'Test Club',
        teamName: 'JO8-1',
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
      state().setClubName('Persistent Club')
      state().setTournamentId('tournament1')

      // Get the persisted data from sessionStorage
      const persistedDataString = sessionStorage.getItem('team-form-storage')
      expect(persistedDataString).not.toBeNull()

      if (persistedDataString) {
        const persistedData = JSON.parse(persistedDataString)

        // Zustand persist middleware wraps the state in a 'state' key and adds a version
        expect(persistedData).toHaveProperty('state')
        expect(persistedData).toHaveProperty('version')

        // Check that the persisted state contains the expected values
        expect(persistedData.state.clubName).toBe('Persistent Club')
        expect(persistedData.state.tournamentId).toBe('tournament1')

        // Validation state should NOT be persisted
        expect(persistedData.state.displayErrors).toBeUndefined()
        expect(persistedData.state.touchedFields).toBeUndefined()
      }
    })
  })

  describe('Complex Reactive Scenarios', () => {
    beforeEach(() => {
      state().setAvailableTournaments(mockTournaments)
    })

    it('should handle reactive validation during form completion flow', () => {
      // Start form - no errors visible
      expect(Object.keys(state().displayErrors)).toHaveLength(0)

      // User clicks on club name field and tabs away empty - should show error
      state().setFieldTouched('clubName')
      expect(state().displayErrors.clubName).toBe('teams.form.errors.clubNameRequired')

      // User types in club name - error should clear
      state().setClubName('Test Club')
      state().validateField('clubName')
      expect(state().displayErrors.clubName).toBeUndefined()

      // User touches team name but leaves empty - should show error
      state().setFieldTouched('teamName')
      expect(state().displayErrors.teamName).toBe('teams.form.errors.teamNameRequired')

      // Other untouched fields should still not show errors
      expect(state().displayErrors.tournamentId).toBeUndefined()
      expect(state().displayErrors.teamLeaderEmail).toBeUndefined()
    })

    it('should handle cascade validation with tournament changes', () => {
      // User selects tournament and division, marks them as touched
      state().setFieldTouched('tournamentId')
      state().setTournamentId('tournament1')
      state().setFieldTouched('division')
      state().setDivision('FIRST_DIVISION')

      // Both should be valid now
      expect(state().displayErrors.tournamentId).toBeUndefined()
      expect(state().displayErrors.division).toBeUndefined()

      // User changes tournament - division is reset but validation should handle gracefully
      state().setTournamentId('tournament2')
      expect(state().division).toBe('') // Reset by cascade

      // Since division field was previously touched, it should show error now that it's empty
      state().validateField('division')
      expect(state().displayErrors.division).toBe('teams.form.errors.divisionRequired')
    })

    it('should handle form submission with mixed touched/untouched fields', () => {
      // User only touches and fills some fields
      state().setFieldTouched('clubName')
      state().setClubName('Test Club')
      state().setFieldTouched('teamName')
      state().setTeamName('JO8-1')

      // Only touched fields show errors currently
      expect(Object.keys(state().displayErrors)).toHaveLength(0)

      // User submits form - should validate ALL fields regardless of touched state
      const isValid = state().validateForm()

      expect(isValid).toBe(false)
      expect(state().forceShowAllErrors).toBe(true)

      // Now ALL required fields should show errors
      expect(state().displayErrors.tournamentId).toBe(
        'teams.form.errors.tournamentRequired'
      )
      expect(state().displayErrors.division).toBe('teams.form.errors.divisionRequired')
      expect(state().displayErrors.privacyAgreement).toBe(
        'teams.form.errors.privacyAgreementRequired'
      )

      // Previously valid touched fields should remain valid
      expect(state().displayErrors.clubName).toBeUndefined()
      expect(state().displayErrors.teamName).toBeUndefined()
    })
  })
})
