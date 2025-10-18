import { z } from 'zod'

import type { TFunction } from 'i18next'

// Base tournament schema without translations (for server-side validation)
const baseTournamentSchema = z
  .object({
    name: z.string().min(1).max(100),
    location: z.string().min(1).max(100),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    divisions: z.array(z.string()).min(1),
    categories: z.array(z.string()).min(1),
  })
  .refine(formData => formData.endDate >= formData.startDate, {
    error: 'End date must be on or after start date',
    path: ['endDate'],
  })

// Schema for create mode
const createTournamentSchema = baseTournamentSchema

// Schema for edit mode (same as create for tournaments)
const editTournamentSchema = baseTournamentSchema

// Factory function for creating schemas with translated error messages (internal use only)
const createTournamentFormSchema = (t: TFunction) =>
  z
    .object({
      name: z
        .string()
        .min(1, t('messages.tournament.nameRequired'))
        .max(100, t('messages.tournament.nameTooLong')),
      location: z
        .string()
        .min(1, t('messages.tournament.locationRequired'))
        .max(100, t('messages.tournament.locationTooLong')),
      startDate: z.iso.date({
        error: t('messages.tournament.invalidDateFormat'),
      }),
      endDate: z.iso.date({
        error: t('messages.tournament.invalidDateFormat'),
      }),
      divisions: z.array(z.string()).min(1, t('messages.tournament.divisionsRequired')),
      categories: z
        .array(z.string())
        .min(1, t('messages.tournament.categoriesRequired')),
    })
    .refine(formData => formData.endDate >= formData.startDate, {
      error: t('messages.tournament.endDateBeforeStartDate'),
      path: ['endDate'],
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
):
  | { success: true; result: z.infer<typeof baseTournamentSchema> }
  | { success: false; error: z.ZodError } {
  const schema = mode === 'create' ? createTournamentSchema : editTournamentSchema
  const parseResult = schema.safeParse(tournamentData)

  if (parseResult.success) {
    return { success: true, result: parseResult.data }
  }
  return { success: false, error: parseResult.error }
}

// Tournament type exports
export type TournamentFormData = z.infer<typeof baseTournamentSchema>
export type CreateTournamentData = z.infer<typeof createTournamentSchema>
export type EditTournamentData = z.infer<typeof editTournamentSchema>
