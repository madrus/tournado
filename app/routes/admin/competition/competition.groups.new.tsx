import type { Category } from '@prisma/client'
import type { JSX } from 'react'
import { redirect, useActionData, useLoaderData } from 'react-router'

import { CompetitionGroupStageForm } from '~/features/competition/components'
import { getServerT } from '~/i18n/i18n.server'
import { createGroupStage, getUnassignedTeamsByCategories } from '~/models/group.server'
import { getTournamentById } from '~/models/tournament.server'
import { adminPath } from '~/utils/adminRoutes'
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

	const categories = safeParseJSON<Category[]>(
		tournament.categories,
		`competition.groups.new - tournament ${tournamentId}`,
		[],
	)

	// Fetch all unassigned teams for the tournament in a single query
	const allTeams = await getUnassignedTeamsByCategories(tournamentId)

	// Count available teams by category
	const availableTeamsCount = {} as Record<Category, number>

	// Initialize all categories with 0
	for (const category of categories) {
		availableTeamsCount[category] = 0
	}

	// Count teams per category
	for (const team of allTeams) {
		// Only count teams that belong to the tournament's categories
		if (availableTeamsCount[team.category] !== undefined) {
			availableTeamsCount[team.category]++
		}
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
	const t = getServerT(request)

	// Get tournament ID from search params since competition is now top-level
	const url = new URL(request.url)
	const tournamentId = url.searchParams.get('tournament')
	invariant(tournamentId, 'Tournament ID is required')

	const formData = await request.formData()
	const name = formData.get('name')?.toString() || ''
	const selectedCategories = formData.getAll('categories') as string[]
	const configGroups = formData.get('configGroups')?.toString() || ''
	const configSlots = formData.get('configSlots')?.toString() || ''

	// Validation
	const errors = {} as NonNullable<ActionData['errors']>

	if (!name.trim()) {
		errors.name = t('errors.competition.nameRequired')
	}

	if (selectedCategories.length === 0) {
		errors.categories = t('errors.competition.categoriesRequired')
	}

	const groupsNum = parseInt(configGroups, 10)
	if (!configGroups || Number.isNaN(groupsNum) || groupsNum < 2 || groupsNum > 8) {
		errors.configGroups = t('errors.competition.groupsRange')
	}

	const slotsNum = parseInt(configSlots, 10)
	if (!configSlots || Number.isNaN(slotsNum) || slotsNum < 3 || slotsNum > 10) {
		errors.configSlots = t('errors.competition.slotsRange')
	}

	if (Object.keys(errors).length > 0) {
		return {
			errors,
			fieldValues: {
				name,
				categories: selectedCategories,
				configGroups,
				configSlots,
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
		})

		return redirect(
			adminPath(`/competition/groups/${groupStageId}?tournament=${tournamentId}`),
		)
	} catch (error) {
		console.error('Failed to create group stage:', error)
		return {
			errors: { general: t('errors.competition.createFailed') },
			fieldValues: {
				name,
				categories: selectedCategories,
				configGroups,
				configSlots,
			},
		}
	}
}

export default function CreateGroupStage(): JSX.Element {
	const { tournament, availableTeamsCount } = useLoaderData<LoaderData>()
	const actionData = useActionData<ActionData>()

	return (
		<CompetitionGroupStageForm
			tournament={tournament}
			availableTeamsCount={availableTeamsCount}
			actionData={actionData}
		/>
	)
}
