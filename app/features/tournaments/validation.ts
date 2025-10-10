import { z } from 'zod'

import type { TFunction } from 'i18next'

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
