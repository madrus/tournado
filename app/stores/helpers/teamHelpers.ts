import type { TournamentData } from '~/lib/lib.types'
import type { FormFields } from '~/stores/helpers/teamFormTypes'

import { TEAM_PANELS_FIELD_MAP } from './teamConstants'

/**
 * Checks if the specified panel is complete and valid.
 *
 * HYBRID VALIDATION APPROACH:
 * - Panel enabling: Based on field values and validity (no blur requirement)
 * - Error display: Still requires blur (handled in validateField function)
 * This gives users immediate feedback when panels become available
 * while maintaining good UX for error messaging
 *
 * In edit mode, only checks if field values are present (ignores display errors)
 * since the data comes from the database and should be valid.
 * In create mode, checks both field values and display errors.
 */
export function isPanelValid(
  panelNumber: 1 | 2 | 3 | 4,
  formFields: FormFields,
  displayErrors: Record<string, string>,
  mode: 'create' | 'edit'
): boolean {
  const panelFields = TEAM_PANELS_FIELD_MAP[panelNumber]
  if (!panelFields) return false

  if (mode === 'edit') {
    return panelFields.every(field => !!formFields[field as keyof FormFields])
  }
  return panelFields.every(
    field => !!formFields[field as keyof FormFields] && !displayErrors[field]
  )
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
 * Computes available divisions and categories for the selected tournament.
 * Returns empty arrays if no tournament is selected.
 */
export function computeAvailableOptions(
  tournaments: TournamentData[],
  tournamentId: string
): { divisions: string[]; categories: string[] } {
  const selectedTournament = tournaments.find(t => t.id === tournamentId)
  return {
    divisions: selectedTournament?.divisions || [],
    categories: selectedTournament?.categories || [],
  }
}

/**
 * Determines which dependent fields should be reset when a field changes.
 * Used to clear division/category when tournament or division changes.
 */
export function getDependentFieldResets(fieldName: string): Partial<FormFields> {
  if (fieldName === 'tournamentId') {
    return { division: '', category: '' }
  }
  if (fieldName === 'division') {
    return { category: '' }
  }
  return {}
}

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
 * Checks if all fields in a panel are blurred and valid.
 * Used to determine if a panel is complete for progressive form navigation.
 */
export function isPanelComplete(
  panelNumber: 1 | 2 | 3 | 4,
  formFields: FormFields,
  blurredFields: Record<string, boolean>,
  displayErrors: Record<string, string>
): boolean {
  const panelFields = TEAM_PANELS_FIELD_MAP[panelNumber]
  if (!panelFields) return false
  const allFieldsBlurred = panelFields.every(field => blurredFields[field])
  const allFieldsValid = panelFields.every(
    field => !!formFields[field as keyof FormFields] && !displayErrors[field]
  )
  return allFieldsBlurred && allFieldsValid
}

/**
 * Maps flexible form data (from API or partial forms) to strict FormFields shape.
 * Used for bulk form data setting and pre-population.
 */
export function mapFlexibleToFormData(
  flexibleData: Partial<{
    tournamentId?: string
    division?: string
    category?: string
    clubName?: string
    teamName?: string
    teamLeaderName?: string
    teamLeaderPhone?: string
    teamLeaderEmail?: string
    privacyAgreement?: boolean
  }>
): Partial<FormFields> {
  const mappedData: Partial<FormFields> = {}
  if (flexibleData.tournamentId !== undefined) {
    mappedData.tournamentId = flexibleData.tournamentId
  }
  if (flexibleData.division !== undefined) mappedData.division = flexibleData.division
  if (flexibleData.category !== undefined) mappedData.category = flexibleData.category
  if (flexibleData.clubName !== undefined) mappedData.clubName = flexibleData.clubName
  if (flexibleData.teamName !== undefined) mappedData.teamName = flexibleData.teamName
  if (flexibleData.teamLeaderName !== undefined) {
    mappedData.teamLeaderName = flexibleData.teamLeaderName
  }
  if (flexibleData.teamLeaderPhone !== undefined) {
    mappedData.teamLeaderPhone = flexibleData.teamLeaderPhone
  }
  if (flexibleData.teamLeaderEmail !== undefined) {
    mappedData.teamLeaderEmail = flexibleData.teamLeaderEmail
  }
  if (flexibleData.privacyAgreement !== undefined) {
    mappedData.privacyAgreement = flexibleData.privacyAgreement
  }
  return mappedData
}

/**
 * Returns the panel number (1-4) for a given field name, or 0 if not found.
 */
export const getPanelNumberForField = (fieldName: keyof FormFields): number =>
  Number(
    Object.entries(TEAM_PANELS_FIELD_MAP).find(([, fields]) =>
      (fields as readonly (keyof FormFields)[]).includes(fieldName)
    )?.[0] ?? 0
  )
