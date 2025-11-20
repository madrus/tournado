import type { TFunction } from 'i18next'
import { z } from 'zod'

import {
	createIsoDateSchema,
	createRequiredStringArraySchema,
	createRequiredStringSchema,
} from '~/lib/validation'

// Base tournament schema without translations (for server-side validation)
const baseTournamentSchema = z
	.object({
		name: createRequiredStringSchema(100),
		location: createRequiredStringSchema(100),
		startDate: createIsoDateSchema(),
		endDate: createIsoDateSchema(),
		divisions: createRequiredStringArraySchema(),
		categories: createRequiredStringArraySchema(),
	})
	.refine((formData) => formData.endDate >= formData.startDate, {
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
			name: createRequiredStringSchema(
				100,
				t('messages.tournament.nameRequired'),
				t('messages.tournament.nameTooLong'),
			),
			location: createRequiredStringSchema(
				100,
				t('messages.tournament.locationRequired'),
				t('messages.tournament.locationTooLong'),
			),
			startDate: createIsoDateSchema(t('messages.tournament.invalidDateFormat')),
			endDate: createIsoDateSchema(t('messages.tournament.invalidDateFormat')),
			divisions: createRequiredStringArraySchema(t('messages.tournament.divisionsRequired')),
			categories: createRequiredStringArraySchema(t('messages.tournament.categoriesRequired')),
		})
		.refine((formData) => formData.endDate >= formData.startDate, {
			error: t('messages.tournament.endDateBeforeStartDate'),
			path: ['endDate'],
		})

// Factory for getting appropriate tournament schema based on mode
export function getTournamentValidationSchema(
	t: TFunction,
): ReturnType<typeof createTournamentFormSchema> {
	const schema = createTournamentFormSchema(t)
	return schema // Same schema for both create and edit modes for tournaments
}

// Utility for server-side tournament validation without translations
export function validateTournamentData(
	tournamentData: z.infer<typeof baseTournamentSchema>,
	mode: 'create' | 'edit',
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
