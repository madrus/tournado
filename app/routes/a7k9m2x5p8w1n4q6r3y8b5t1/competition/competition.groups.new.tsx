import type { Category } from '@prisma/client'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { redirect, useActionData, useLoaderData, useNavigation } from 'react-router'
import { ActionButton } from '~/components/buttons/ActionButton'
import { TextInputField } from '~/components/inputs/TextInputField'
import { createGroupStage, getTeamsByCategories } from '~/models/group.server'
import { getTournamentById } from '~/models/tournament.server'
import { safeParseJSON } from '~/utils/json'
import { invariant } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'
import type { Route } from './+types/competition.groups.new'

type LoaderData = {
	readonly tournament: {
		readonly id: string
		readonly name: string
		readonly categories: readonly Category[]
	}
	readonly availableTeamsCount: Record<Category, number>
}

type ActionData = {
	readonly errors?: {
		name?: string
		categories?: string
		configGroups?: string
		configSlots?: string
		general?: string
	}
	readonly fieldValues?: {
		name: string
		categories: string[]
		configGroups: string
		configSlots: string
		autoFill: boolean
	}
}

export const handle: RouteMetadata = {
	isPublic: false,
	title: 'competition.groupStage.title',
	auth: {
		required: true,
		redirectTo: '/auth/signin',
		preserveRedirect: true,
	},
	authorization: {
		requiredRoles: ['ADMIN', 'MANAGER'],
		redirectTo: '/unauthorized',
	},
}

export async function loader({
	request,
	params: _params,
}: Route.LoaderArgs): Promise<LoaderData> {
	// Require user with role-based authorization for UI route access
	await requireUserWithMetadata(request, handle)

	// Get tournament ID from search params since competition is now top-level
	const url = new URL(request.url)
	const tournamentId = url.searchParams.get('tournament')
	invariant(tournamentId, 'Tournament ID is required')

	const tournament = await getTournamentById({ id: tournamentId })
	if (!tournament) {
		throw new Response('Tournament not found', { status: 404 })
	}

	// Count available teams by category
	const availableTeamsCount = {} as Record<Category, number>
	const categories = safeParseJSON<Category[]>(
		tournament.categories,
		`competition.groups.new - tournament ${tournamentId}`,
		[],
	)

	for (const category of categories) {
		const teams = await getTeamsByCategories(tournamentId, [category])
		availableTeamsCount[category] = teams.length
	}

	return {
		tournament: {
			id: tournament.id,
			name: tournament.name,
			categories,
		},
		availableTeamsCount,
	}
}

export async function action({
	request,
}: Route.ActionArgs): Promise<ActionData | Response> {
	// Require user with role-based authorization for group creation action
	await requireUserWithMetadata(request, handle)

	// Get tournament ID from search params since competition is now top-level
	const url = new URL(request.url)
	const tournamentId = url.searchParams.get('tournament')
	invariant(tournamentId, 'Tournament ID is required')

	const formData = await request.formData()
	const name = formData.get('name')?.toString() || ''
	const selectedCategories = formData.getAll('categories') as string[]
	const configGroups = formData.get('configGroups')?.toString() || ''
	const configSlots = formData.get('configSlots')?.toString() || ''
	const autoFill = formData.get('autoFill') === 'on'

	// Validation
	const errors = {} as NonNullable<ActionData['errors']>

	if (!name.trim()) {
		errors.name = 'Group set name is required'
	}

	if (selectedCategories.length === 0) {
		errors.categories = 'At least one category must be selected'
	}

	const groupsNum = parseInt(configGroups, 10)
	if (!configGroups || Number.isNaN(groupsNum) || groupsNum < 2 || groupsNum > 8) {
		errors.configGroups = 'Number of groups must be between 2 and 8'
	}

	const slotsNum = parseInt(configSlots, 10)
	if (!configSlots || Number.isNaN(slotsNum) || slotsNum < 3 || slotsNum > 10) {
		errors.configSlots = 'Teams per group must be between 3 and 10'
	}

	if (Object.keys(errors).length > 0) {
		return {
			errors,
			fieldValues: {
				name,
				categories: selectedCategories,
				configGroups,
				configSlots,
				autoFill,
			},
		}
	}

	try {
		const groupStageId = await createGroupStage({
			tournamentId,
			name: name.trim(),
			categories: selectedCategories as Category[],
			configGroups: groupsNum,
			configSlots: slotsNum,
			autoFill,
		})

		return redirect(
			`/a7k9m2x5p8w1n4q6r3y8b5t1/competition/groups/${groupStageId}?tournament=${tournamentId}`,
		)
	} catch (_error) {
		return {
			errors: { general: 'Failed to Create Group Stage. Please try again.' },
			fieldValues: {
				name,
				categories: selectedCategories,
				configGroups,
				configSlots,
				autoFill,
			},
		}
	}
}

export default function CreateGroupStage(): JSX.Element {
	const { tournament, availableTeamsCount } = useLoaderData<LoaderData>()
	const actionData = useActionData<ActionData>()
	const navigation = useNavigation()
	const { t } = useTranslation()

	const isSubmitting = navigation.state === 'submitting'

	// Calculate total teams for selected categories
	const selectedCategories = actionData?.fieldValues?.categories || []
	const totalSelectedTeams = selectedCategories.reduce(
		(sum, category) => sum + (availableTeamsCount[category as Category] || 0),
		0,
	)

	return (
		<div className='space-y-8'>
			<div>
				<h2 className='font-bold text-2xl'>{t('competition.createGroupStage')}</h2>
				<p className='mt-2 text-gray-600'>
					{t('competition.createGroupStageDescription', {
						tournamentName: tournament.name,
					})}
				</p>
			</div>

			<div className='max-w-2xl'>
				<form method='post' className='space-y-6'>
					{actionData?.errors?.general ? (
						<div className='rounded-md bg-red-50 p-4'>
							<p className='text-red-700 text-sm'>{actionData.errors.general}</p>
						</div>
					) : null}

					{/* Group Stage Name */}
					<TextInputField
						name='name'
						label={t('competition.groupStage.name')}
						placeholder={t('competition.groupStage.namePlaceholder')}
						defaultValue={actionData?.fieldValues?.name || ''}
						error={actionData?.errors?.name}
						required
					/>

					{/* Categories Selection */}
					<div>
						<h3 className='mb-3 block font-medium text-gray-700 text-sm'>
							{t('competition.groupStage.ageCategories')}
						</h3>
						<p className='mb-3 text-gray-500 text-sm'>
							{t('competition.groupStage.ageCategoriesDescription')}
						</p>
						<div className='space-y-2'>
							{tournament.categories.map((category) => (
								<label key={category} className='flex items-center space-x-3'>
									<input
										type='checkbox'
										name='categories'
										value={category}
										defaultChecked={actionData?.fieldValues?.categories?.includes(
											category,
										)}
										className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
									/>
									<span className='font-medium text-sm'>{category}</span>
									<span className='text-gray-500 text-xs'>
										(
										{t('competition.groupStage.teamsAvailable', {
											count: availableTeamsCount[category],
										})}
										)
									</span>
								</label>
							))}
						</div>
						{actionData?.errors?.categories ? (
							<p className='mt-1 text-red-600 text-sm'>
								{actionData.errors.categories}
							</p>
						) : null}
					</div>

					{/* Configuration */}
					<div className='grid grid-cols-2 gap-2'>
						<TextInputField
							name='configGroups'
							label={t('competition.groupStage.configGroups')}
							type='text'
							placeholder={t('competition.groupStage.configGroupsPlaceholder')}
							defaultValue={actionData?.fieldValues?.configGroups || ''}
							error={actionData?.errors?.configGroups}
							required
						/>

						<TextInputField
							name='configSlots'
							label={t('competition.groupStage.configSlots')}
							type='text'
							placeholder={t('competition.groupStage.configSlotsPlaceholder')}
							defaultValue={actionData?.fieldValues?.configSlots || ''}
							error={actionData?.errors?.configSlots}
							required
						/>
					</div>

					{/* Auto-fill Option */}
					<div>
						<label className='flex items-start space-x-3'>
							<input
								type='checkbox'
								name='autoFill'
								defaultChecked={actionData?.fieldValues?.autoFill ?? true}
								className='mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
							/>
							<div>
								<span className='font-medium text-sm'>
									{t('competition.groupStage.autoFillGroups')}
								</span>
								<p className='text-gray-500 text-xs'>
									{t('competition.groupStage.autoFillDescription')}
								</p>
							</div>
						</label>
					</div>

					{/* Summary */}
					{selectedCategories.length > 0 ? (
						<div className='rounded-lg bg-blue-50 p-4'>
							<h4 className='font-medium text-blue-900 text-sm'>
								{t('competition.groupStage.summary')}
							</h4>
							<p className='mt-1 text-blue-700 text-xs'>
								{t('competition.groupStage.summaryTeamsAvailable', {
									count: totalSelectedTeams,
								})}
							</p>
							{actionData?.fieldValues?.configGroups &&
							actionData?.fieldValues?.configSlots ? (
								<p className='text-blue-700 text-xs'>
									{t('competition.groupStage.summaryWillCreate', {
										groups: actionData.fieldValues.configGroups,
										slots: actionData.fieldValues.configSlots,
										total:
											parseInt(actionData.fieldValues.configGroups, 10) *
											parseInt(actionData.fieldValues.configSlots, 10),
									})}
								</p>
							) : null}
						</div>
					) : null}

					{/* Actions */}
					<div className='flex justify-end gap-2'>
						<ActionButton
							type='button'
							variant='secondary'
							onClick={() => window.history.back()}
						>
							{t('common.actions.cancel')}
						</ActionButton>
						<ActionButton type='submit' variant='primary' disabled={isSubmitting}>
							{isSubmitting ? t('common.actions.creating') : t('common.actions.create')}
						</ActionButton>
					</div>
				</form>
			</div>
		</div>
	)
}
