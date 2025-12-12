import type { Category } from '@prisma/client'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, type MetaFunction, useLoaderData } from 'react-router'

import { ActionLinkButton } from '~/components/buttons/ActionLinkButton'
import { SportsIcon } from '~/components/icons'
import type { TournamentListItem } from '~/features/tournaments/types'
import type { GroupStageListItem } from '~/models/group.server'
import { getTournamentGroupStages } from '~/models/group.server'
import { getAllTournaments } from '~/models/tournament.server'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'

import type { Route } from './+types/competition.groups'

type LoaderData = {
	readonly groupStages: readonly GroupStageListItem[]
	readonly tournamentListItems: readonly TournamentListItem[]
	readonly selectedTournamentId: string | undefined
}

export const meta: MetaFunction<typeof loader> = () => [
	{ title: 'Groups Management | Tournado' },
	{
		name: 'description',
		content: 'Manage tournament groups and team assignments',
	},
]

export const handle: RouteMetadata = {
	authorization: {
		requiredRoles: ['REFEREE', 'MANAGER', 'ADMIN'],
	},
}

export async function loader({
	request,
	params: _params,
}: Route.LoaderArgs): Promise<LoaderData> {
	await requireUserWithMetadata(request, handle)

	// Get tournament ID from search params
	const url = new URL(request.url)
	const tournamentId = url.searchParams.get('tournament')

	// Load tournament list and group stage in parallel
	const [tournamentListItemsRaw, groupStages] = await Promise.all([
		getAllTournaments(),
		tournamentId ? getTournamentGroupStages(tournamentId) : Promise.resolve([]),
	])

	// Serialize dates to ISO strings for JSON transport
	const tournamentListItems = tournamentListItemsRaw.map((tournament) => ({
		...tournament,
		startDate: tournament.startDate.toISOString(),
		endDate: tournament.endDate?.toISOString() || null,
	}))

	return {
		groupStages,
		tournamentListItems,
		selectedTournamentId: tournamentId || undefined,
	}
}

const formatCategories = (categories: readonly Category[]): string =>
	categories.join(', ')

const formatDate = (date: Date): string =>
	new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date)

export default function GroupsTab(): JSX.Element {
	const { groupStages, selectedTournamentId } = useLoaderData<LoaderData>()
	const { t } = useTranslation()

	return (
		<div className='space-y-6'>
			{/* Header with Tournament Filter */}
			<div className='flex items-center justify-between'>
				<div className='text-start'>
					<h4 className='font-semibold text-foreground text-lg'>
						{t('admin.competition.groupStage')}
					</h4>
					<p className='mt-1 text-foreground-light'>
						{t('admin.competition.groupStageDescription')}
					</p>
				</div>

				{selectedTournamentId ? (
					<ActionLinkButton
						to={`new?tournament=${selectedTournamentId}`}
						label={t('competition.createGroupStage')}
						variant='primary'
						icon='add'
					/>
				) : null}
			</div>

			{/* Group Stage Grid */}
			{!selectedTournamentId ? (
				<div className='rounded-xl border-2 border-border border-dashed bg-accent py-12 text-center'>
					<div className='mx-auto max-w-md'>
						<SportsIcon className='mx-auto h-12 w-12 text-foreground-lighter' />
						<h3 className='mt-4 font-semibold text-foreground text-lg'>
							{t('competition.selectTournament')}
						</h3>
						<p className='mt-2 text-foreground-light'>
							{t('competition.selectTournamentDescription')}
						</p>
					</div>
				</div>
			) : groupStages.length === 0 ? (
				<div className='rounded-xl border-2 border-border border-dashed bg-accent py-12 text-center'>
					<div className='mx-auto max-w-md'>
						<SportsIcon className='mx-auto h-12 w-12 text-foreground-lighter' />
						<h3 className='mt-4 font-semibold text-foreground text-lg'>
							{t('competition.noGroupStages')}
						</h3>
						<p className='mt-2 text-foreground-light'>
							{t('competition.noGroupStagesDescription')}
						</p>
					</div>
				</div>
			) : (
				<div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
					{groupStages.map((groupStage) => (
						<Link
							key={groupStage.id}
							to={`${groupStage.id}?tournament=${selectedTournamentId}`}
							className='group relative rounded-lg border border-border bg-background p-4 shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2'
						>
							{/* Header with icon and badge */}
							<div className='flex items-start justify-between'>
								<div className='flex items-center'>
									<div className='rounded-lg bg-fuchsia-50 p-2 transition-colors group-hover:bg-fuchsia-100'>
										<SportsIcon className='h-5 w-5 text-fuchsia-600' />
									</div>
									<h3 className='ml-3 font-semibold text-base text-foreground transition-colors group-hover:text-fuchsia-600'>
										{groupStage.name}
									</h3>
								</div>
								<div className='rounded-full bg-fuchsia-50 px-2 py-1 font-medium text-fuchsia-700 text-xs'>
									{t('competition.groupsCount', { count: groupStage.configGroups })}
								</div>
							</div>

							{/* Content */}
							<div className='mt-4 space-y-2'>
								<div className='flex items-center text-sm'>
									<span className='w-20 font-medium text-foreground'>
										{t('competition.labels.categories')}
									</span>
									<span className='flex-1 text-foreground-light'>
										{formatCategories(groupStage.categories)}
									</span>
								</div>
								<div className='flex items-center text-sm'>
									<span className='w-20 font-medium text-foreground'>
										{t('competition.labels.setup')}
									</span>
									<span className='text-foreground-light'>
										{groupStage.configGroups} groups × {groupStage.configSlots} teams
									</span>
								</div>
								<div className='flex items-center text-sm'>
									<span className='w-20 font-medium text-foreground'>
										{t('competition.labels.autoFill')}
									</span>
									<span
										className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs ${
											groupStage.autoFill
												? 'bg-green-100 text-green-800'
												: 'bg-accent text-foreground-light'
										}`}
									>
										{groupStage.autoFill
											? t('competition.status.enabled')
											: t('competition.status.disabled')}
									</span>
								</div>
								<div className='flex items-center text-sm'>
									<span className='w-20 font-medium text-foreground'>
										{t('competition.labels.created')}
									</span>
									<span className='text-foreground-lighter text-xs'>
										{formatDate(groupStage.createdAt)}
									</span>
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
