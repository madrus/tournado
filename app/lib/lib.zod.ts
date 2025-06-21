import { z } from 'zod'

import type { TFunction } from 'i18next'

import type {
  ExtractedTeamData,
  TeamFormSchemaType,
  TeamValidationInput,
  TeamValidationSafeParseResult,
} from './lib.types'

// More comprehensive email validation regex
// This regex validates:
// - Local part: alphanumeric, dots, hyphens, underscores, plus signs
// - @ symbol (required)
// - Domain: alphanumeric with hyphens (but not at start/end)
// - At least one dot in domain
// - TLD: at least 2 characters, letters only
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Base team schema without translations (for server-side validation)
const baseTeamSchema = z.object({
  tournamentId: z.string().min(1),
  clubName: z.string().min(1).max(100),
  teamName: z.string().min(1).max(50),
  division: z.string().min(1),
  category: z.string().min(1),
  teamLeaderName: z.string().min(1).max(100),
  teamLeaderPhone: z
    .string()
    .min(1)
    .refine(val => val.length === 0 || /^[\+]?[0-9\s\-\(\)]+$/.test(val)),
  teamLeaderEmail: z
    .string()
    .min(1)
    .refine(val => val.length === 0 || EMAIL_REGEX.test(val)),
  privacyAgreement: z.boolean().refine(val => val),
})

// Schema for create mode (includes privacy agreement)
const createTeamSchema = baseTeamSchema

// Schema for edit mode (omits privacy agreement)
const editTeamSchema = baseTeamSchema.omit({ privacyAgreement: true })

// Factory function for creating schemas with translated error messages (internal use only)
const createTeamFormSchema = (t: TFunction): TeamFormSchemaType =>
  z.object({
    // Tournament selection (required for create mode)
    tournamentId: z.string().min(1, t('teams.form.errors.tournamentRequired')),

    // Basic team information
    clubName: z
      .string()
      .min(1, t('teams.form.errors.clubNameRequired'))
      .max(100, t('teams.form.errors.clubNameTooLong')),
    teamName: z
      .string()
      .min(1, t('teams.form.errors.teamNameRequired'))
      .max(50, t('teams.form.errors.teamNameTooLong')),
    division: z.string().min(1, t('teams.form.errors.divisionRequired')),
    category: z.string().min(1, t('teams.form.errors.categoryRequired')),

    // Team leader information (required for create mode)
    teamLeaderName: z
      .string()
      .min(1, t('teams.form.errors.teamLeaderNameRequired'))
      .max(100, t('teams.form.errors.teamLeaderNameTooLong')),
    teamLeaderPhone: z
      .string()
      .min(1, t('teams.form.errors.phoneNumberRequired'))
      .refine(
        val => val.length === 0 || /^[\+]?[0-9\s\-\(\)]+$/.test(val),
        t('teams.form.errors.phoneNumberInvalid')
      ),
    teamLeaderEmail: z
      .string()
      .min(1, t('teams.form.errors.emailRequired'))
      .refine(
        val => val.length === 0 || EMAIL_REGEX.test(val),
        t('teams.form.errors.emailInvalid')
      ),

    // Privacy agreement (required for public create mode)
    privacyAgreement: z
      .boolean()
      .refine(val => val, t('teams.form.errors.privacyAgreementRequired')),
  })

// Factory for getting appropriate schema based on mode
export function getTeamValidationSchema(
  mode: 'create' | 'edit',
  t: TFunction
): TeamFormSchemaType | ReturnType<TeamFormSchemaType['omit']> {
  const schema = createTeamFormSchema(t)
  return mode === 'create' ? schema : schema.omit({ privacyAgreement: true })
}

// Utility to extract team data from FormData
export const extractTeamDataFromFormData = (formData: FormData): ExtractedTeamData => ({
  tournamentId: (formData.get('tournamentId') as string) || '',
  clubName: (formData.get('clubName') as string) || '',
  teamName: (formData.get('teamName') as string) || '',
  division: (formData.get('division') as string) || '',
  category: (formData.get('category') as string) || '',
  teamLeaderName: (formData.get('teamLeaderName') as string) || '',
  teamLeaderPhone: (formData.get('teamLeaderPhone') as string) || '',
  teamLeaderEmail: (formData.get('teamLeaderEmail') as string) || '',
  privacyAgreement: formData.get('privacyAgreement') === 'on',
})

// Utility for server-side validation without translations - with proper overloads
export function validateTeamData(
  teamData: TeamValidationInput,
  mode: 'create'
): TeamValidationSafeParseResult<'create'>
export function validateTeamData(
  teamData: TeamValidationInput,
  mode: 'edit'
): TeamValidationSafeParseResult<'edit'>
export function validateTeamData(
  teamData: TeamValidationInput,
  mode: 'create' | 'edit'
): TeamValidationSafeParseResult<'create'> | TeamValidationSafeParseResult<'edit'> {
  const schema = mode === 'create' ? createTeamSchema : editTeamSchema
  return schema.safeParse(teamData)
}

// Type exports
export type TeamFormData = z.infer<typeof baseTeamSchema>
export type CreateTeamData = z.infer<typeof createTeamSchema>
export type EditTeamData = z.infer<typeof editTeamSchema>
