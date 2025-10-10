import { describe, expect, it } from 'vitest'

import {
  getPanelNumberForField,
  isFormDirty,
  isPanelComplete,
  isPanelEnabled,
  isPanelValid,
  mapFlexibleToFormData,
  mergeErrors,
  resetStatePreserving,
  shouldValidateField,
} from '../tournamentFormHelpers'
import type { FormFields, StoreState, ValidationState } from '../tournamentFormTypes'

describe('tournamentFormHelpers', () => {
  const mockFormFields: FormFields = {
    name: 'Test Tournament',
    location: 'Amsterdam',
    startDate: '2024-03-01',
    endDate: '2024-03-03',
    divisions: ['PREMIER_DIVISION', 'FIRST_DIVISION'],
    categories: ['JO8', 'JO10', 'JO12'],
  }

  const mockEmptyFormFields: FormFields = {
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    divisions: [],
    categories: [],
  }

  const mockDisplayErrors = {
    name: 'Name is required',
    location: 'Location is required',
  }

  const mockValidationState: ValidationState = {
    errors: {},
    displayErrors: {},
    blurredFields: {},
    serverErrors: {},
    submitAttempted: false,
    forceShowAllErrors: false,
  }

  describe('isPanelValid', () => {
    it('should return true for panel 1 when name and location are valid in create mode', () => {
      const result = isPanelValid(1, mockFormFields, {}, 'create')
      expect(result).toBe(true)
    })

    it('should return false for panel 1 when name is missing in create mode', () => {
      const fieldsWithoutName = { ...mockFormFields, name: '' }
      const result = isPanelValid(1, fieldsWithoutName, {}, 'create')
      expect(result).toBe(false)
    })

    it('should return false for panel 1 when there are display errors in create mode', () => {
      const result = isPanelValid(1, mockFormFields, mockDisplayErrors, 'create')
      expect(result).toBe(false)
    })

    it('should return true for panel 2 when dates are valid in create mode', () => {
      const result = isPanelValid(2, mockFormFields, {}, 'create')
      expect(result).toBe(true)
    })

    it('should return false for panel 2 when startDate is missing in create mode', () => {
      const fieldsWithoutStartDate = { ...mockFormFields, startDate: '' }
      const result = isPanelValid(2, fieldsWithoutStartDate, {}, 'create')
      expect(result).toBe(false)
    })

    it('should return true for panel 3 when divisions are selected in create mode', () => {
      const result = isPanelValid(3, mockFormFields, {}, 'create')
      expect(result).toBe(true)
    })

    it('should return false for panel 3 when divisions array is empty in create mode', () => {
      const fieldsWithoutDivisions = { ...mockFormFields, divisions: [] }
      const result = isPanelValid(3, fieldsWithoutDivisions, {}, 'create')
      expect(result).toBe(false)
    })

    it('should return true for panel 4 when categories are selected in create mode', () => {
      const result = isPanelValid(4, mockFormFields, {}, 'create')
      expect(result).toBe(true)
    })

    it('should return false for panel 4 when categories array is empty in create mode', () => {
      const fieldsWithoutCategories = { ...mockFormFields, categories: [] }
      const result = isPanelValid(4, fieldsWithoutCategories, {}, 'create')
      expect(result).toBe(false)
    })

    it('should return true for all panels in edit mode when fields have values', () => {
      expect(isPanelValid(1, mockFormFields, mockDisplayErrors, 'edit')).toBe(true)
      expect(isPanelValid(2, mockFormFields, mockDisplayErrors, 'edit')).toBe(true)
      expect(isPanelValid(3, mockFormFields, mockDisplayErrors, 'edit')).toBe(true)
      expect(isPanelValid(4, mockFormFields, mockDisplayErrors, 'edit')).toBe(true)
    })

    it('should return false for invalid panel number', () => {
      const result = isPanelValid(5 as 1 | 2 | 3 | 4, mockFormFields, {}, 'create')
      expect(result).toBe(false)
    })
  })

  describe('isPanelEnabled', () => {
    const mockIsPanelValid = (panel: 1 | 2 | 3 | 4) => panel <= 2

    it('should always enable all panels in edit mode', () => {
      expect(isPanelEnabled(1, 'edit', mockIsPanelValid)).toBe(true)
      expect(isPanelEnabled(2, 'edit', mockIsPanelValid)).toBe(true)
      expect(isPanelEnabled(3, 'edit', mockIsPanelValid)).toBe(true)
      expect(isPanelEnabled(4, 'edit', mockIsPanelValid)).toBe(true)
    })

    it('should always enable panel 1 in create mode', () => {
      const result = isPanelEnabled(1, 'create', mockIsPanelValid)
      expect(result).toBe(true)
    })

    it('should enable panel 2 when panel 1 is valid in create mode', () => {
      const result = isPanelEnabled(2, 'create', mockIsPanelValid)
      expect(result).toBe(true)
    })

    it('should enable panel 3 when panel 2 is valid in create mode', () => {
      const result = isPanelEnabled(3, 'create', mockIsPanelValid)
      expect(result).toBe(true)
    })

    it('should not enable panel 4 when panel 3 is invalid in create mode', () => {
      const result = isPanelEnabled(4, 'create', mockIsPanelValid)
      expect(result).toBe(false)
    })

    it('should return false for invalid panel number', () => {
      const result = isPanelEnabled(5 as 1 | 2 | 3 | 4, 'create', mockIsPanelValid)
      expect(result).toBe(false)
    })
  })

  describe('isFormDirty', () => {
    it('should return false when form fields are identical', () => {
      const result = isFormDirty(mockFormFields, mockFormFields)
      expect(result).toBe(false)
    })

    it('should return true when form fields are different', () => {
      const modifiedFields = { ...mockFormFields, name: 'Modified Tournament' }
      const result = isFormDirty(modifiedFields, mockFormFields)
      expect(result).toBe(true)
    })

    it('should return true when array fields are different', () => {
      const modifiedFields = { ...mockFormFields, divisions: ['PREMIER_DIVISION'] }
      const result = isFormDirty(modifiedFields, mockFormFields)
      expect(result).toBe(true)
    })

    it('should return false when comparing empty forms', () => {
      const result = isFormDirty(mockEmptyFormFields, mockEmptyFormFields)
      expect(result).toBe(false)
    })
  })

  describe('mergeErrors', () => {
    it('should merge display and server errors with server errors taking priority', () => {
      const displayErrors = {
        name: 'Display error',
        location: 'Display location error',
      }
      const serverErrors = { name: 'Server error', email: 'Server email error' }

      const result = mergeErrors(displayErrors, serverErrors)

      expect(result).toEqual({
        name: 'Server error', // Server error takes priority
        location: 'Display location error',
        email: 'Server email error',
      })
    })

    it('should handle empty error objects', () => {
      expect(mergeErrors({}, {})).toEqual({})
      expect(mergeErrors({ name: 'Error' }, {})).toEqual({ name: 'Error' })
      expect(mergeErrors({}, { name: 'Error' })).toEqual({ name: 'Error' })
    })
  })

  describe('mapFlexibleToFormData', () => {
    it('should map all provided fields correctly', () => {
      const flexibleData = {
        name: 'Test Tournament',
        location: 'Amsterdam',
        startDate: '2024-03-01',
        endDate: '2024-03-03',
        divisions: ['PREMIER_DIVISION'],
        categories: ['JO8', 'JO10'],
      }

      const result = mapFlexibleToFormData(flexibleData)

      expect(result).toEqual({
        name: 'Test Tournament',
        location: 'Amsterdam',
        startDate: '2024-03-01',
        endDate: '2024-03-03',
        divisions: ['PREMIER_DIVISION'],
        categories: ['JO8', 'JO10'],
      })
    })

    it('should handle partial data', () => {
      const flexibleData = {
        name: 'Test Tournament',
        divisions: ['PREMIER_DIVISION'],
      }

      const result = mapFlexibleToFormData(flexibleData)

      expect(result).toEqual({
        name: 'Test Tournament',
        divisions: ['PREMIER_DIVISION'],
      })
    })

    it('should handle empty data', () => {
      const result = mapFlexibleToFormData({})
      expect(result).toEqual({})
    })

    it('should handle undefined and null values correctly', () => {
      const flexibleData = {
        name: undefined,
        location: '',
        startDate: undefined,
        divisions: [],
      }

      const result = mapFlexibleToFormData(flexibleData)

      expect(result).toEqual({
        location: '',
        divisions: [],
      })
    })
  })

  describe('getPanelNumberForField', () => {
    it('should return correct panel number for panel 1 fields', () => {
      expect(getPanelNumberForField('name')).toBe(1)
      expect(getPanelNumberForField('location')).toBe(1)
    })

    it('should return correct panel number for panel 2 fields', () => {
      expect(getPanelNumberForField('startDate')).toBe(2)
      expect(getPanelNumberForField('endDate')).toBe(2)
    })

    it('should return correct panel number for panel 3 fields', () => {
      expect(getPanelNumberForField('divisions')).toBe(3)
    })

    it('should return correct panel number for panel 4 fields', () => {
      expect(getPanelNumberForField('categories')).toBe(4)
    })

    it('should return 0 for unknown fields', () => {
      const result = getPanelNumberForField('unknownField' as keyof FormFields)
      expect(result).toBe(0)
    })
  })

  describe('shouldValidateField', () => {
    it('should return true when field is blurred', () => {
      const validation = { ...mockValidationState, blurredFields: { name: true } }
      const result = shouldValidateField('name', validation)
      expect(result).toBe(true)
    })

    it('should return true when forceShowAllErrors is true', () => {
      const validation = { ...mockValidationState, forceShowAllErrors: true }
      const result = shouldValidateField('name', validation)
      expect(result).toBe(true)
    })

    it('should return true when submitAttempted is true', () => {
      const validation = { ...mockValidationState, submitAttempted: true }
      const result = shouldValidateField('name', validation)
      expect(result).toBe(true)
    })

    it('should return false when none of the conditions are met', () => {
      const result = shouldValidateField('name', mockValidationState)
      expect(result).toBe(false)
    })

    it('should return true when multiple conditions are met', () => {
      const validation = {
        ...mockValidationState,
        blurredFields: { name: true },
        submitAttempted: true,
      }
      const result = shouldValidateField('name', validation)
      expect(result).toBe(true)
    })
  })

  describe('resetStatePreserving', () => {
    const mockStoreState: StoreState = {
      formFields: mockFormFields,
      oldFormFields: mockEmptyFormFields,
      validation: mockValidationState,
      formMeta: {
        mode: 'create',
        isSubmitting: false,
        isValid: false,
      },
      availableOptions: {
        divisions: ['PREMIER_DIVISION'],
        categories: ['JO8'],
      },
    }

    const mockGet = () => mockStoreState

    it('should preserve specified keys', () => {
      const result = resetStatePreserving(['availableOptions'], mockGet)

      expect(result).toEqual({
        availableOptions: {
          divisions: ['PREMIER_DIVISION'],
          categories: ['JO8'],
        },
      })
    })

    it('should preserve multiple keys', () => {
      const result = resetStatePreserving(['formMeta', 'availableOptions'], mockGet)

      expect(result).toEqual({
        formMeta: {
          mode: 'create',
          isSubmitting: false,
          isValid: false,
        },
        availableOptions: {
          divisions: ['PREMIER_DIVISION'],
          categories: ['JO8'],
        },
      })
    })

    it('should return empty object when preserving no keys', () => {
      const result = resetStatePreserving([], mockGet)
      expect(result).toEqual({})
    })
  })

  describe('isPanelComplete', () => {
    const mockBlurredFields = {
      name: true,
      location: true,
      startDate: true,
      endDate: true,
    }

    it('should return true when all panel fields are blurred and valid', () => {
      const result = isPanelComplete(1, mockFormFields, mockBlurredFields, {})
      expect(result).toBe(true)
    })

    it('should return false when panel fields are not all blurred', () => {
      const partialBlurredFields = { name: true } // location not blurred
      const result = isPanelComplete(1, mockFormFields, partialBlurredFields, {})
      expect(result).toBe(false)
    })

    it('should return false when panel fields have errors', () => {
      const result = isPanelComplete(
        1,
        mockFormFields,
        mockBlurredFields,
        mockDisplayErrors
      )
      expect(result).toBe(false)
    })

    it('should return false when panel fields are empty', () => {
      const result = isPanelComplete(1, mockEmptyFormFields, mockBlurredFields, {})
      expect(result).toBe(false)
    })

    it('should handle array fields correctly', () => {
      const blurredFields = { divisions: true }
      const validFormFields = { ...mockFormFields }

      const result = isPanelComplete(3, validFormFields, blurredFields, {})
      expect(result).toBe(true)
    })

    it('should return false for array fields when they are empty', () => {
      const blurredFields = { divisions: true }
      const emptyDivisionsFields = { ...mockFormFields, divisions: [] }

      const result = isPanelComplete(3, emptyDivisionsFields, blurredFields, {})
      expect(result).toBe(false)
    })

    it('should return false for invalid panel number', () => {
      const result = isPanelComplete(
        5 as 1 | 2 | 3 | 4,
        mockFormFields,
        mockBlurredFields,
        {}
      )
      expect(result).toBe(false)
    })
  })
})
