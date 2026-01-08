import { type JSX, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { redirect, useActionData, useLoaderData } from 'react-router'

import { TournamentForm } from '~/features/tournaments/components/TournamentForm'
import { useTournamentFormActions } from '~/features/tournaments/stores/useTournamentFormStore'
import {
	createTournament,
	getAllCategories,
	getAllDivisions,
} from '~/models/tournament.server'
import { adminPath } from '~/utils/adminRoutes'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'

import type { Route } from './+types/tournaments.new'

// Route metadata - admin only
export const handle: RouteMetadata = {
	isPublic: false,
	auth: {
		required: true,
		redirectTo: '/auth/signin',
		preserveRedirect: true,
	},
	authorization: {
		requiredRoles: ['ADMIN'],
		roleMatchMode: 'any',
		redirectTo: '/unauthorized',
	},
}

export const meta: MetaFunction = () => [
	{ title: 'New Tournament | Admin | Tournado' },
	{
		name: 'description',
		content: 'Create a new tournament in the system with divisions and categories.',
	},
	{ property: 'og:title', content: 'New Tournament | Admin | Tournado' },
	{
		property: 'og:description',
		content: 'Create a new tournament in the system with divisions and categories.',
	},
	{ property: 'og:type', content: 'website' },
]

type LoaderData = {
	divisions: string[]
	categories: string[]
}

type ActionData = {
	errors?: {
		name?: string
		location?: string
		startDate?: string
		endDate?: string
		divisions?: string
		categories?: string
	}
	success?: boolean
	tournamentId?: string
	message?: string
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
	await requireUserWithMetadata(request, handle)

	const divisions = getAllDivisions()
	const categories = getAllCategories()

	return {
		divisions,
		categories,
	}
}

export async function action({
	request,
}: Route.ActionArgs): Promise<Response | ActionData> {
	await requireUserWithMetadata(request, handle)

	const formData = await request.formData()
	const name = formData.get('name')
	const location = formData.get('location')
	const startDate = formData.get('startDate')
	const endDate = formData.get('endDate')
	const divisions = formData.getAll('divisions') as string[]
	const categories = formData.getAll('categories') as string[]

	const errors: ActionData['errors'] = {}

	// Validation
	if (typeof name !== 'string' || name.length === 0) {
		errors.name = 'Tournament name is required'
	}

	if (typeof location !== 'string' || location.length === 0) {
		errors.location = 'Location is required'
	}

	if (typeof startDate !== 'string' || startDate.length === 0) {
		errors.startDate = 'Start date is required'
	}

	if (divisions.length === 0) {
		errors.divisions = 'At least one division must be selected'
	}

	if (categories.length === 0) {
		errors.categories = 'At least one category must be selected'
	}

	// Validate date format and logic
	if (startDate && typeof startDate === 'string') {
		const start = new Date(startDate)
		if (Number.isNaN(start.getTime())) {
			errors.startDate = 'Invalid start date format'
		}

		if (endDate && typeof endDate === 'string') {
			const end = new Date(endDate)
			if (Number.isNaN(end.getTime())) {
				errors.endDate = 'Invalid end date format'
			} else if (end < start) {
				errors.endDate = 'End date must be after start date'
			}
		}
	}

	if (Object.keys(errors).length > 0) {
		return { errors }
	}

	try {
		// Default endDate to startDate if not provided
		const finalEndDate =
			endDate && typeof endDate === 'string' ? endDate : (startDate as string)

		const tournament = await createTournament({
			name: name as string,
			location: location as string,
			startDate: new Date(startDate as string),
			endDate: new Date(finalEndDate),
			divisions,
			categories,
		})

		// Redirect to tournament detail page with success parameter
		return redirect(adminPath(`/tournaments/${tournament.id}?success=created`))
	} catch (_error) {
		return {
			errors: {
				name: 'Failed to create tournament. Please try again.',
			},
		}
	}
}

export default function NewTournamentPage(): JSX.Element {
	const { t } = useTranslation()
	const { divisions, categories } = useLoaderData<LoaderData>()
	const actionData = useActionData<ActionData>()
	const { resetForm } = useTournamentFormActions()
	const handleReset = useCallback(() => {
		resetForm()
	}, [resetForm])

	// Reset the form on every mount to ensure a clean slate
	useEffect(() => {
		handleReset()
	}, [handleReset])

	return (
		<div className='space-y-8'>
			<TournamentForm
				mode='create'
				variant='admin'
				divisions={divisions}
				categories={categories}
				errors={actionData?.errors || {}}
				submitButtonText={t('common.actions.save')}
			/>
		</div>
	)
}
