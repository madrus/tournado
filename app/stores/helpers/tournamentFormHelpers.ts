import { TOURNAMENT_PANELS_FIELD_MAP } from './tournamentFormConstants'
import type {
  FormFieldName,
  FormFields,
  StoreState,
  ValidationState,
} from './tournamentFormTypes'

/**
 * Checks if the specified panel is complete and valid.
 *
 * For tournaments, all fields are required so we check:
 * - Field values are present and valid
 * - For arrays (divisions/categories), they must have at least one selection
 * - No display errors exist
 */
export function isPanelValid(
  panelNumber: 1 | 2 | 3 | 4,
  formFields: FormFields,
  displayErrors: Record<string, string>,
  mode: 'create' | 'edit'
): boolean {
  const panelFields = TOURNAMENT_PANELS_FIELD_MAP[panelNumber]
  if (!panelFields) return false

  if (mode === 'edit') {
    return panelFields.every(field => {
      const value = formFields[field as keyof FormFields]
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return !!value
    })
  }

  return panelFields.every(field => {
    const value = formFields[field as keyof FormFields]
    let hasValue = false

    if (Array.isArray(value)) {
      hasValue = value.length > 0
    } else {
      hasValue = !!value
    }

    return hasValue && !displayErrors[field]
  })
}

/**
 * Determines if a panel should be enabled (interactive) based on the current mode and previous panel validity.
 *
 * In edit mode, all panels are enabled since data is pre-populated.
 * In create mode, uses progressive enabling logic:
 *   - Panel 1 is always enabled
 *   - Panel 2 enables when panel 1 is complete
 *   - Panel 3 enables when panel 2 is complete
 *   - Panel 4 enables when panel 3 is complete
 */
export function isPanelEnabled(
  panelNumber: 1 | 2 | 3 | 4,
  mode: 'create' | 'edit',
  isPanelValidFn: (panel: 1 | 2 | 3 | 4) => boolean
): boolean {
  if (mode === 'edit') return true
  switch (panelNumber) {
    case 1:
      return true
    case 2:
      return isPanelValidFn(1)
    case 3:
      return isPanelValidFn(2)
    case 4:
      return isPanelValidFn(3)
    default:
      return false
  }
}

/**
 * Checks if the form is dirty (has been modified) by comparing current and old form fields.
 */
export const isFormDirty = (
  formFields: FormFields,
  oldFormFields: FormFields
): boolean => JSON.stringify(formFields) !== JSON.stringify(oldFormFields)

/**
 * Merges display and server errors, with server errors taking priority.
 */
export const mergeErrors = (
  displayErrors: Record<string, string>,
  serverErrors: Record<string, string>
): Record<string, string> => ({
  ...displayErrors,
  ...serverErrors,
})

/**
 * Maps flexible form data (from API or partial forms) to strict FormFields shape.
 * Used for bulk form data setting and pre-population.
 */
export function mapFlexibleToFormData(
  flexibleData: Partial<{
    name?: string
    location?: string
    startDate?: string
    endDate?: string
    divisions?: string[]
    categories?: string[]
  }>
): Partial<FormFields> {
  const mappedData: Partial<FormFields> = {}

  if (flexibleData.name !== undefined) mappedData.name = flexibleData.name
  if (flexibleData.location !== undefined) mappedData.location = flexibleData.location
  if (flexibleData.startDate !== undefined)
    mappedData.startDate = flexibleData.startDate
  if (flexibleData.endDate !== undefined) mappedData.endDate = flexibleData.endDate
  if (flexibleData.divisions !== undefined)
    mappedData.divisions = flexibleData.divisions
  if (flexibleData.categories !== undefined)
    mappedData.categories = flexibleData.categories

  return mappedData
}

/**
 * Returns the panel number (1-4) for a given field name, or 0 if not found.
 */
export const getPanelNumberForField = (fieldName: keyof FormFields): number =>
  Number(
    Object.entries(TOURNAMENT_PANELS_FIELD_MAP).find(([, fields]) =>
      (fields as readonly (keyof FormFields)[]).includes(fieldName)
    )?.[0] ?? 0
  )

/**
 * Helper to determine if a field should be validated
 */
export const shouldValidateField = (
  fieldName: FormFieldName,
  validation: ValidationState
): boolean =>
  validation.blurredFields[fieldName] ||
  validation.forceShowAllErrors ||
  validation.submitAttempted

/**
 * Helper to reset state while preserving specified keys
 */
export function resetStatePreserving<T extends keyof StoreState>(
  preserveKeys: T[],
  get: () => StoreState
): Pick<StoreState, T> {
  const currentState = get()
  const preservedState = {} as Pick<StoreState, T>

  preserveKeys.forEach(key => {
    preservedState[key] = currentState[key]
  })

  return preservedState
}
