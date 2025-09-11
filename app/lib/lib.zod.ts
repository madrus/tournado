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
  name: z.string().min(1).max(50),
  clubName: z.string().min(1).max(100),
  division: z.string().min(1),
  category: z.string().min(1),
  teamLeaderName: z.string().min(1).max(100),
  teamLeaderPhone: z
    .string()
    .min(1)
    .refine(val => val.length === 0 || /^[\+]?[0-9\s\-\(\)]+$/.test(val), {
      message: 'Invalid phone number format',
    }),
  teamLeaderEmail: z
    .string()
    .min(1)
    .refine(val => val.length === 0 || EMAIL_REGEX.test(val), {
      message: 'Invalid email address',
    }),
  privacyAgreement: z.boolean().refine(val => val, {
    message: 'Privacy agreement is required',
  }),
})

// Schema for create mode (includes privacy agreement)
const createTeamSchema = baseTeamSchema

// Schema for edit mode (omits privacy agreement)
const editTeamSchema = baseTeamSchema.omit({ privacyAgreement: true })

// Factory function for creating schemas with translated error messages (internal use only)
const createTeamFormSchema = (t: TFunction): TeamFormSchemaType =>
  z.object({
    // Tournament selection (required for create mode)
    tournamentId: z.string().min(1, t('messages.team.tournamentRequired')),

    // Basic team information
    name: z
      .string()
      .min(1, t('messages.team.nameRequired'))
      .max(50, t('messages.team.nameTooLong')),
    clubName: z
      .string()
      .min(1, t('messages.team.clubNameRequired'))
      .max(100, t('messages.team.clubNameTooLong')),
    division: z.string().min(1, t('messages.team.divisionRequired')),
    category: z.string().min(1, t('messages.team.categoryRequired')),

    // Team leader information (required for create mode)
    teamLeaderName: z
      .string()
      .min(1, t('messages.team.teamLeaderNameRequired'))
      .max(100, t('messages.team.teamLeaderNameTooLong')),
    teamLeaderPhone: z
      .string()
      .min(1, t('messages.team.phoneNumberRequired'))
      .refine(val => val.length === 0 || /^[\+]?[0-9\s\-\(\)]+$/.test(val), {
        message: t('messages.team.phoneNumberInvalid'),
      }),
    teamLeaderEmail: z
      .string()
      .min(1, t('messages.validation.emailRequired'))
      .refine(val => val.length === 0 || EMAIL_REGEX.test(val), {
        message: t('messages.validation.emailInvalid'),
      }),

    // Privacy agreement (required for public create mode)
    privacyAgreement: z.boolean().refine(val => val, {
      message: t('messages.team.privacyAgreementRequired'),
    }),
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
  name: (formData.get('name') as string) || '',
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

// ===== TOURNAMENT VALIDATION SCHEMAS =====

// Base tournament schema without translations (for server-side validation)
const baseTournamentSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  divisions: z.array(z.string()).min(1),
  categories: z.array(z.string()).min(1),
})

// Schema for create mode
const createTournamentSchema = baseTournamentSchema

// Schema for edit mode (same as create for tournaments)
const editTournamentSchema = baseTournamentSchema

// Factory function for creating schemas with translated error messages (internal use only)
const createTournamentFormSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, t('messages.tournament.nameRequired'))
      .max(100, t('messages.tournament.nameTooLong')),
    location: z
      .string()
      .min(1, t('messages.tournament.locationRequired'))
      .max(100, t('messages.tournament.locationTooLong')),
    startDate: z.string().min(1, t('messages.tournament.startDateRequired')),
    endDate: z.string().min(1, t('messages.tournament.endDateRequired')),
    divisions: z.array(z.string()).min(1, t('messages.tournament.divisionsRequired')),
    categories: z.array(z.string()).min(1, t('messages.tournament.categoriesRequired')),
  })

// Factory for getting appropriate tournament schema based on mode
export function getTournamentValidationSchema(
  t: TFunction
): ReturnType<typeof createTournamentFormSchema> {
  const schema = createTournamentFormSchema(t)
  return schema // Same schema for both create and edit modes for tournaments
}

// Utility for server-side tournament validation without translations
export function validateTournamentData(
  tournamentData: z.infer<typeof baseTournamentSchema>,
  mode: 'create' | 'edit'
): // eslint-disable-next-line id-blacklist
| { success: true; data: z.infer<typeof baseTournamentSchema> }
  | { success: false; error: z.ZodError } {
  const schema = mode === 'create' ? createTournamentSchema : editTournamentSchema
  return schema.safeParse(tournamentData)
}

// Tournament type exports
export type TournamentFormData = z.infer<typeof baseTournamentSchema>
export type CreateTournamentData = z.infer<typeof createTournamentSchema>
export type EditTournamentData = z.infer<typeof editTournamentSchema>
