import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useTournamentFormStore } from '../useTournamentFormStore'

// Mock the form validation utilities
vi.mock('~/utils/form-validation', () => ({
  validateSingleTournamentField: vi.fn(() => null),
  validateEntireTournamentForm: vi.fn(() => ({})),
}))

// Helper to access store state
const state = useTournamentFormStore.getState

describe('useTournamentFormStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    state().resetStoreState()

    // Clear sessionStorage
    sessionStorage.clear()

    // Clear mocks
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default form field values', () => {
      expect(state().formFields.name).toBe('')
      expect(state().formFields.location).toBe('')
      expect(state().formFields.startDate).toBe('')
      expect(state().formFields.endDate).toBe('')
      expect(state().formFields.divisions).toEqual([])
      expect(state().formFields.categories).toEqual([])
    })

    it('should initialize with default validation state', () => {
      expect(state().validation.errors).toEqual({})
      expect(state().validation.displayErrors).toEqual({})
      expect(state().validation.serverErrors).toEqual({})
      expect(state().validation.blurredFields).toEqual({})
      expect(state().validation.submitAttempted).toBe(false)
      expect(state().validation.forceShowAllErrors).toBe(false)
    })

    it('should initialize with default form metadata', () => {
      expect(state().formMeta.mode).toBe('create')
      expect(state().formMeta.isValid).toBe(false)
      expect(state().availableOptions.divisions).toEqual([])
      expect(state().availableOptions.categories).toEqual([])
    })
  })

  describe('Form Field Management', () => {
    it('should set individual form fields', () => {
      state().setFormField('name', 'Test Tournament')
      state().setFormField('location', 'Test Location')
      state().setFormField('startDate', '2024-01-01')
      state().setFormField('endDate', '2024-01-03')
      state().setFormField('divisions', ['FIRST_DIVISION', 'SECOND_DIVISION'])
      state().setFormField('categories', ['JO8', 'JO9'])

      expect(state().formFields.name).toBe('Test Tournament')
      expect(state().formFields.location).toBe('Test Location')
      expect(state().formFields.startDate).toBe('2024-01-01')
      expect(state().formFields.endDate).toBe('2024-01-03')
      expect(state().formFields.divisions).toEqual([
        'FIRST_DIVISION',
        'SECOND_DIVISION',
      ])
      expect(state().formFields.categories).toEqual(['JO8', 'JO9'])
    })

    it('should set bulk form data', () => {
      const formData = {
        name: 'Bulk Tournament',
        location: 'Bulk Location',
        startDate: '2024-06-01',
        divisions: ['FIRST_DIVISION'],
      }

      state().setFormData(formData)

      expect(state().formFields.name).toBe('Bulk Tournament')
      expect(state().formFields.location).toBe('Bulk Location')
      expect(state().formFields.startDate).toBe('2024-06-01')
      expect(state().formFields.divisions).toEqual(['FIRST_DIVISION'])
    })

    it('should reset form to initial state', () => {
      // Set some form data
      state().setFormField('name', 'Test Tournament')
      state().setFormField('location', 'Test Location')
      state().setValidationField('displayErrors', { name: 'Test error' })

      // Reset form
      state().resetStoreState()

      // Check that form fields are reset
      expect(state().formFields.name).toBe('')
      expect(state().formFields.location).toBe('')
      expect(state().validation.displayErrors).toEqual({})
    })

    it('should clear field error when setting form field', () => {
      // Set an error first
      state().setFieldError('name', 'Name is required')
      expect(state().validation.displayErrors.name).toBe('Name is required')

      // Set form field value should clear the error
      state().setFormField('name', 'Test Tournament')
      expect(state().validation.displayErrors.name).toBeUndefined()
    })
  })

  describe('Field Value Helper', () => {
    it('should get current field values correctly', () => {
      // Set some values
      state().setFormField('name', 'Test Tournament')
      state().setFormField('location', 'Test Location')
      state().setFormField('divisions', ['FIRST_DIVISION'])

      expect(state().formFields.name).toBe('Test Tournament')
      expect(state().formFields.location).toBe('Test Location')
      expect(state().formFields.divisions).toEqual(['FIRST_DIVISION'])
    })
  })

  describe('Reactive Validation System', () => {
    it('should validate field immediately when touched', async () => {
      // Mock validation to return error for empty field
      const { validateSingleTournamentField } = vi.mocked(
        await import('~/utils/form-validation')
      )
      vi.mocked(validateSingleTournamentField).mockReturnValue(
        'tournaments.form.errors.nameRequired'
      )

      // Mark field as touched - should trigger validation immediately
      state().validateFieldOnBlur('name')

      // Since name is empty and now touched, should show error
      expect(state().validation.displayErrors.name).toBe(
        'tournaments.form.errors.nameRequired'
      )
      expect(state().validation.blurredFields.name).toBe(true)
    })

    it('should not show validation errors for untouched fields', () => {
      // Validate field without touching it first
      state().validateField('name')

      // Should NOT show error because field is not touched and no flags are set
      expect(state().validation.displayErrors.name).toBeUndefined()
    })

    it('should validate field when forceShowAllErrors is true', async () => {
      // Mock validation to return error
      const { validateSingleTournamentField } = vi.mocked(
        await import('~/utils/form-validation')
      )
      vi.mocked(validateSingleTournamentField).mockReturnValue(
        'tournaments.form.errors.nameRequired'
      )

      // Set force show all errors
      state().setValidationField('forceShowAllErrors', true)

      // Now validation should work even for untouched fields
      state().validateField('name')
      expect(state().validation.displayErrors.name).toBe(
        'tournaments.form.errors.nameRequired'
      )
    })

    it('should validate field when submitAttempted is true', async () => {
      // Mock validation to return error
      const { validateSingleTournamentField } = vi.mocked(
        await import('~/utils/form-validation')
      )
      vi.mocked(validateSingleTournamentField).mockReturnValue(
        'tournaments.form.errors.nameRequired'
      )

      // Set submit attempted
      state().setValidationField('submitAttempted', true)

      // Now validation should work even for untouched fields
      state().validateField('name')
      expect(state().validation.displayErrors.name).toBe(
        'tournaments.form.errors.nameRequired'
      )
    })

    it('should clear error when field becomes valid', async () => {
      // Mock validation to first return error, then null
      const { validateSingleTournamentField } = vi.mocked(
        await import('~/utils/form-validation')
      )
      vi.mocked(validateSingleTournamentField).mockReturnValueOnce(
        'tournaments.form.errors.nameRequired'
      )

      // Touch field and trigger error
      state().validateFieldOnBlur('name')
      expect(state().validation.displayErrors.name).toBe(
        'tournaments.form.errors.nameRequired'
      )

      // Mock validation to return null for valid value
      vi.mocked(validateSingleTournamentField).mockReturnValueOnce(null)

      // Set valid value and validate again
      state().setFormField('name', 'Valid Tournament')
      state().validateField('name')

      // Error should be cleared
      expect(state().validation.displayErrors.name).toBeUndefined()
    })
  })

  describe('Form Validation as Collection of Field Validations', () => {
    it('should validate entire form and show all required field errors', async () => {
      // Mock form validation to return errors for required fields
      const { validateEntireTournamentForm } = vi.mocked(
        await import('~/utils/form-validation')
      )
      const mockErrors = {
        name: 'tournaments.form.errors.nameRequired',
        location: 'tournaments.form.errors.locationRequired',
        startDate: 'tournaments.form.errors.startDateRequired',
        divisions: 'tournaments.form.errors.divisionsRequired',
        categories: 'tournaments.form.errors.categoriesRequired',
      }
      vi.mocked(validateEntireTournamentForm).mockReturnValue(mockErrors)

      // Form with missing required fields should be invalid
      const isValid = state().validateForm()

      expect(isValid).toBe(false)
      expect(state().formMeta.isValid).toBe(false)
      expect(state().validation.forceShowAllErrors).toBe(true) // Should be set during form validation

      // All required fields should show errors
      expect(state().validation.displayErrors.name).toBe(
        'tournaments.form.errors.nameRequired'
      )
      expect(state().validation.displayErrors.location).toBe(
        'tournaments.form.errors.locationRequired'
      )
      expect(state().validation.displayErrors.startDate).toBe(
        'tournaments.form.errors.startDateRequired'
      )
      expect(state().validation.displayErrors.divisions).toBe(
        'tournaments.form.errors.divisionsRequired'
      )
      expect(state().validation.displayErrors.categories).toBe(
        'tournaments.form.errors.categoriesRequired'
      )
    })

    it('should validate form as valid when all required fields are filled', async () => {
      // Mock form validation to return no errors
      const { validateEntireTournamentForm } = vi.mocked(
        await import('~/utils/form-validation')
      )
      vi.mocked(validateEntireTournamentForm).mockReturnValue({})

      // Fill all required fields
      state().setFormField('name', 'Test Tournament')
      state().setFormField('location', 'Test Location')
      state().setFormField('startDate', '2024-01-01')
      state().setFormField('divisions', ['FIRST_DIVISION'])
      state().setFormField('categories', ['JO8'])

      // Validate form
      const isValid = state().validateForm()

      expect(isValid).toBe(true)
      expect(state().formMeta.isValid).toBe(true)
      expect(Object.keys(state().validation.displayErrors)).toHaveLength(0)
    })
  })

  describe('Field Error Management', () => {
    it('should set and clear field errors', () => {
      state().setFieldError('name', 'tournaments.form.errors.nameRequired')
      expect(state().validation.displayErrors.name).toBe(
        'tournaments.form.errors.nameRequired'
      )

      state().clearFieldError('name')
      expect(state().validation.displayErrors.name).toBeUndefined()
    })

    it('should set validation errors in bulk', () => {
      const errors = {
        name: 'Required',
        location: 'Too long',
      }

      state().setValidationField('errors', errors)
      expect(state().validation.errors).toEqual(errors)
    })

    it('should set display errors in bulk', () => {
      const errors = {
        name: 'tournaments.form.errors.nameRequired',
        location: 'tournaments.form.errors.locationRequired',
      }

      state().setValidationField('displayErrors', errors)
      expect(state().validation.displayErrors).toEqual(errors)
    })

    it('should clear all errors', () => {
      // Set multiple errors
      state().setFieldError('name', 'Name is required')
      state().setFieldError('location', 'Location is required')

      // Clear all
      state().clearAllErrors()

      expect(state().validation.errors).toEqual({})
      expect(state().validation.displayErrors).toEqual({})
      expect(state().validation.serverErrors).toEqual({})
    })
  })

  describe('Form Metadata', () => {
    it('should set form mode', () => {
      state().setFormMetaField('mode', 'edit')
      expect(state().formMeta.mode).toBe('edit')
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

  describe('Server Errors', () => {
    it('should set server errors', () => {
      const serverErrors = { name: 'Server error', location: 'Another error' }

      state().setServerErrors(serverErrors)

      expect(state().validation.serverErrors).toEqual(serverErrors)
      expect(state().validation.displayErrors).toEqual(serverErrors)
    })

    it('should merge server errors with existing display errors', () => {
      // Set display error first
      state().setFieldError('name', 'Client error')

      // Set server errors - this will merge with existing display errors
      const serverErrors = { location: 'Server error' }
      state().setServerErrors(serverErrors)

      // Server errors are merged with existing display errors
      expect(state().validation.displayErrors).toEqual({
        name: 'Client error',
        location: 'Server error',
      })
      expect(state().validation.serverErrors).toEqual({
        location: 'Server error',
      })
    })
  })

  describe('Form Data Extraction', () => {
    it('should return current form data in TournamentFormData format', () => {
      // Set up form data
      state().setFormField('name', 'Test Tournament')
      state().setFormField('location', 'Test Location')
      state().setFormField('startDate', '2024-01-01')
      state().setFormField('endDate', '2024-01-03')
      state().setFormField('divisions', ['FIRST_DIVISION'])
      state().setFormField('categories', ['JO8'])

      const formData = state().getFormData()

      expect(formData).toEqual({
        name: 'Test Tournament',
        location: 'Test Location',
        startDate: '2024-01-01',
        endDate: '2024-01-03',
        divisions: ['FIRST_DIVISION'],
        categories: ['JO8'],
      })
    })
  })

  describe('Form State Helpers', () => {
    it('should detect dirty form', () => {
      // Initially not dirty
      expect(state().isDirty()).toBe(false)

      // Set data makes it dirty
      state().setFormField('name', 'Test Tournament')
      expect(state().isDirty()).toBe(true)
    })

    it('should not be dirty after setting form data', () => {
      // setFormData updates both formFields and oldFormFields
      state().setFormData({ name: 'Test Tournament' })

      expect(state().isDirty()).toBe(false)
    })
  })

  describe('Panel Validity', () => {
    it('should check if panel is valid', () => {
      // Panel validity depends on implementation - test basic functionality
      const isPanel1Valid = state().isPanelValid(1)
      expect(typeof isPanel1Valid).toBe('boolean')
    })

    it('should check if panel is enabled', () => {
      // Panel enabled status depends on implementation - test basic functionality
      const isPanel1Enabled = state().isPanelEnabled(1)
      expect(typeof isPanel1Enabled).toBe('boolean')
    })

    it('should check if form is ready for submission', () => {
      // Form submission readiness depends on implementation - test basic functionality
      const isReady = state().isFormReadyForSubmission()
      expect(typeof isReady).toBe('boolean')
    })
  })

  describe('Persistence', () => {
    it('should persist form data to sessionStorage', () => {
      state().setFormField('name', 'Persistent Tournament')
      state().setFormField('location', 'Persistent Location')

      // Get the persisted data from sessionStorage
      const persistedDataString = sessionStorage.getItem('TournamentFormStore')
      expect(persistedDataString).not.toBeNull()

      if (persistedDataString) {
        const persistedData = JSON.parse(persistedDataString)

        // Zustand persist middleware wraps the state in a 'state' key and adds a version
        expect(persistedData).toHaveProperty('state')
        expect(persistedData).toHaveProperty('version')

        // Check that the persisted state contains the expected values
        expect(persistedData.state.formFields.name).toBe('Persistent Tournament')
        expect(persistedData.state.formFields.location).toBe('Persistent Location')

        // Validation state should NOT be persisted
        expect(persistedData.state.validation).toBeUndefined()
      }
    })

    it('should only persist specific fields', () => {
      state().setFormField('name', 'Test Tournament')
      state().setFieldError('location', 'Required')

      const persistedDataString = sessionStorage.getItem('TournamentFormStore')

      if (persistedDataString) {
        const persistedData = JSON.parse(persistedDataString)

        // Should persist formFields and oldFormFields and formMeta.mode
        expect(persistedData.state).toHaveProperty('formFields')
        expect(persistedData.state).toHaveProperty('oldFormFields')
        expect(persistedData.state).toHaveProperty('formMeta')
        expect(persistedData.state.formMeta).toHaveProperty('mode')

        // Should NOT persist validation state
        expect(persistedData.state).not.toHaveProperty('validation')
      }
    })
  })
})
