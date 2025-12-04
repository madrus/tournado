import { type JSX, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import {
	redirect,
	useActionData,
	useLoaderData,
	useSearchParams,
	useSubmit,
} from 'react-router'

import { ActionButton } from '~/components/buttons/ActionButton'
import { ActionLinkButton } from '~/components/buttons/ActionLinkButton'
import { SimpleConfirmDialog } from '~/components/ConfirmDialog'
import { Panel } from '~/components/Panel'
import { TournamentForm } from '~/features/tournaments/components/TournamentForm'
import { useTournamentFormStore } from '~/features/tournaments/stores/useTournamentFormStore'
import type { Tournament } from '~/models/tournament.server'
import {
	deleteTournamentById,
	getAllCategories,
	getAllDivisions,
	getTournamentById,
	updateTournament,
} from '~/models/tournament.server'
import { safeParseJSON } from '~/utils/json'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'
import { toast } from '~/utils/toastUtils'

import type { Route } from './+types/tournaments.$tournamentId'

export const handle: RouteMetadata = {
	isPublic: false,
	title: 'common.titles.tournament',
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

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const tournamentName = (data as LoaderData)?.tournament?.name || 'Tournament'
	return [
		{ title: `${tournamentName} | Admin | Tournado` },
		{
			name: 'description',
			content: `Edit tournament: ${tournamentName} details and settings.`,
		},
		{
			property: 'og:title',
			content: `${tournamentName} | Admin | Tournado`,
		},
		{
			property: 'og:description',
			content: `Edit tournament: ${tournamentName} details and settings.`,
		},
		{ property: 'og:type', content: 'website' },
	]
}

type LoaderData = {
	tournament: Tournament | null
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
	message?: string
}

export async function loader({
	request,
	params,
}: Route.LoaderArgs): Promise<LoaderData> {
	await requireUserWithMetadata(request, handle)

	const { tournamentId } = params
	if (!tournamentId) {
		throw new Response('Tournament ID is required', { status: 400 })
	}

	const tournament = await getTournamentById({ id: tournamentId })
	if (!tournament) {
		throw new Response('Tournament not found', { status: 404 })
	}

	const divisions = getAllDivisions()
	const categories = getAllCategories()

	return {
		tournament,
		divisions,
		categories,
	}
}

export async function action({
	request,
	params,
}: Route.ActionArgs): Promise<Response | ActionData> {
	await requireUserWithMetadata(request, handle)

	const { tournamentId } = params
	if (!tournamentId) {
		throw new Response('Tournament ID is required', { status: 400 })
	}

	const formData = await request.formData()
	const intent = formData.get('intent')

	// Handle delete
	if (intent === 'delete') {
		await deleteTournamentById({ id: tournamentId })
		return redirect('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')
	}

	// Handle update
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

		await updateTournament({
			id: tournamentId,
			name: name as string,
			location: location as string,
			startDate: new Date(startDate as string),
			endDate: new Date(finalEndDate),
			divisions,
			categories,
		})

		return redirect(
			`/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/${tournamentId}?success=updated`,
		)
	} catch (_error) {
		return {
			errors: {
				name: 'Failed to update tournament. Please try again.',
			},
		}
	}
}

export default function EditTournamentPage(): JSX.Element {
	const { t } = useTranslation()
	const { tournament, divisions, categories } = useLoaderData<LoaderData>()
	const actionData = useActionData<ActionData>()
	const [searchParams, setSearchParams] = useSearchParams()
	const submit = useSubmit()
	const setFormData = useTournamentFormStore((state) => state.setFormData)

	// Check for success parameter and show toast
	useEffect(() => {
		const success = searchParams.get('success')
		if (success === 'created') {
			// Smooth scroll to top for better UX after successful create
			window.scrollTo({ top: 0, behavior: 'smooth' })
			toast.success(t('messages.tournament.registrationSuccess'), {
				description: t('messages.tournament.registrationSuccessDesc'),
			})

			// Remove the success parameter from URL
			const next = new URLSearchParams(searchParams)
			next.delete('success')
			setSearchParams(next, { replace: true })
		} else if (success === 'updated') {
			// Smooth scroll to top for better UX after successful update
			window.scrollTo({ top: 0, behavior: 'smooth' })
			toast.success(t('messages.tournament.updateSuccess'), {
				description: t('messages.tournament.updateSuccessDesc'),
			})

			// Sync the store with latest loader data so UI reflects persisted update
			if (!tournament) return
			setFormData({
				name: tournament.name,
				location: tournament.location,
				startDate: new Date(tournament.startDate).toISOString().split('T')[0],
				endDate: tournament.endDate
					? new Date(tournament.endDate).toISOString().split('T')[0]
					: '',
				divisions: Array.isArray(tournament.divisions)
					? (tournament.divisions as string[])
					: safeParseJSON<string[]>(
							String(tournament.divisions || '[]'),
							`useEffect - tournament ${tournament.id} divisions`,
							[],
						),
				categories: Array.isArray(tournament.categories)
					? (tournament.categories as string[])
					: safeParseJSON<string[]>(
							String(tournament.categories || '[]'),
							`useEffect - tournament ${tournament.id} categories`,
							[],
						),
			})

			// Remove the success parameter from URL
			searchParams.delete('success')
			setSearchParams(searchParams, { replace: true })
		}
	}, [searchParams, setSearchParams, t, setFormData, tournament])

	if (!tournament) {
		return (
			<div className='py-12 text-center'>
				<h2 className='font-semibold text-foreground text-xl'>Tournament not found</h2>
				<p className='mt-2 text-foreground'>
					The tournament you're looking for doesn't exist.
				</p>
			</div>
		)
	}

	const submitDelete = () => {
		const fd = new FormData()
		fd.set('intent', 'delete')
		submit(fd, { method: 'post' })
	}

	// Format dates for form inputs (YYYY-MM-DD format)
	const formatDateForInput = (date: Date | string): string => {
		const dateObj = typeof date === 'string' ? new Date(date) : date
		return dateObj.toISOString().split('T')[0]
	}

	// Parse JSON fields safely
	const parsedDivisions = tournament.divisions
		? typeof tournament.divisions === 'string'
			? safeParseJSON<string[]>(
					tournament.divisions,
					`TournamentDetailPage - tournament ${tournament.id} divisions`,
					[],
				)
			: tournament.divisions
		: []

	const parsedCategories = tournament.categories
		? typeof tournament.categories === 'string'
			? safeParseJSON<string[]>(
					tournament.categories,
					`TournamentDetailPage - tournament ${tournament.id} categories`,
					[],
				)
			: tournament.categories
		: []

	const formData = {
		id: tournament.id,
		name: tournament.name,
		location: tournament.location,
		startDate: formatDateForInput(tournament.startDate),
		endDate: tournament.endDate ? formatDateForInput(tournament.endDate) : '',
		divisions: parsedDivisions,
		categories: parsedCategories,
	}

	return (
		<div className='w-full'>
			{/* Admin Header with Action Buttons */}
			<Panel color='sky' className='mb-8'>
				<div className='flex items-start justify-between gap-4 md:items-center'>
					<div className='flex-1'>
						<h2 className='latin-text font-bold text-2xl'>
							{tournament.name || t('tournaments.form.tournamentRegistration')}
						</h2>
						<p className='latin-text mt-2 text-foreground'>
							{tournament.location
								? `${t('tournaments.form.location')} ${tournament.location}`
								: t('tournaments.form.fillOutForm')}
						</p>
					</div>
					{/* Action Buttons */}
					<div className='flex flex-col items-stretch gap-3 md:flex-row md:items-center'>
						{/* Manage Competition Button */}
						<ActionLinkButton
							to={`/a7k9m2x5p8w1n4q6r3y8b5t1/competition?tournament=${tournament.id}`}
							label={t('tournaments.actions.manageCompetition')}
							icon='trophy'
							variant='primary'
						/>

						{/* Delete Button */}
						<SimpleConfirmDialog
							intent='danger'
							trigger={
								<ActionButton icon='delete' variant='secondary'>
									{t('common.actions.delete')}
								</ActionButton>
							}
							title={t('tournaments.confirmations.deleteTitle', 'Delete tournament')}
							description={t(
								'tournaments.confirmations.deleteDescription',
								'Are you sure you want to delete this tournament? This action cannot be undone.',
							)}
							confirmLabel={t('common.actions.confirm', 'Yes, delete')}
							cancelLabel={t('common.actions.cancel', 'Cancel')}
							destructive
							onConfirm={submitDelete}
						/>
					</div>
				</div>
			</Panel>

			{/* Success Message */}
			{actionData?.success ? (
				<div className='mb-8 rounded-md bg-green-50 p-4'>
					<div className='flex'>
						<div className='shrink-0'>
							<svg
								className='h-5 w-5 text-green-400'
								viewBox='0 0 20 20'
								fill='currentColor'
							>
								<title>Success</title>
								<path
									fillRule='evenodd'
									d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
									clipRule='evenodd'
								/>
							</svg>
						</div>
						<div className='ml-3'>
							<p className='font-medium text-green-800 text-sm'>{actionData.message}</p>
						</div>
					</div>
				</div>
			) : null}

			{/* Tournament Form */}
			<TournamentForm
				mode='edit'
				variant='admin'
				formData={formData}
				divisions={divisions}
				categories={categories}
				errors={actionData?.errors || {}}
				isSuccess={actionData?.success || false}
				successMessage={actionData?.message}
				submitButtonText={t('common.actions.update')}
				intent='update'
			/>
		</div>
	)
}
