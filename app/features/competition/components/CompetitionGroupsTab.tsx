import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { ActionLinkButton } from '~/components/buttons/ActionLinkButton'
import { SportsIcon } from '~/components/icons'
import {
	formatCompetitionCategories,
	formatCompetitionDate,
} from '~/features/competition/utils/competitionFormatters'
import type { GroupStageListItem } from '~/models/group.server'

type CompetitionGroupsTabProps = {
	groupStages: readonly GroupStageListItem[]
	selectedTournamentId: string | undefined
}

export function CompetitionGroupsTab({
	groupStages,
	selectedTournamentId,
}: Readonly<CompetitionGroupsTabProps>): JSX.Element {
	const { t } = useTranslation()

	return (
		<div className='space-y-6'>
			{/* Header with Tournament Filter */}
			<div className='flex items-start justify-between'>
				<div className='text-start'>
					<h4 className='font-semibold text-foreground text-lg'>
						{t('admin.competition.groupStage')}
					</h4>
					<p className='mt-1 pr-2 text-foreground-light'>
						{t('admin.competition.groupStageDescription')}
					</p>
				</div>

				{selectedTournamentId ? (
					<ActionLinkButton
						to={`new?tournament=${selectedTournamentId}`}
						label={t('common.actions.create')}
						variant='primary'
						icon='add'
					/>
				) : null}
			</div>

			{/* Group Stage Grid */}
			{!selectedTournamentId ? (
				<div className='rounded-xl border-2 border-border border-dashed bg-neutral py-12 text-center'>
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
				<div className='rounded-xl border-2 border-border border-dashed bg-neutral py-12 text-center'>
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
							className='group relative rounded-lg border border-border bg-neutral p-4 shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2'
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
									<span className='w-28 font-medium text-foreground'>
										{t('competition.labels.categories')}
									</span>
									<span className='flex-1 text-foreground-light'>
										{formatCompetitionCategories(groupStage.categories)}
									</span>
								</div>
								<div className='flex items-center text-sm'>
									<span className='w-28 font-medium text-foreground'>
										{t('competition.labels.setup')}
									</span>
									<span className='text-foreground-light'>
										{t('competition.labels.setupSummary', {
											groups: groupStage.configGroups,
											teams: groupStage.configSlots,
										})}
									</span>
								</div>
								<div className='flex items-center text-sm'>
									<span className='w-28 font-medium text-foreground'>
										{t('competition.labels.autoFill')}
									</span>
									<span
										className={`inline-flex items-center rounded-full px-2 py-1 font-medium text-xs ${
											groupStage.autoFill
												? 'bg-green-100 text-green-800'
												: 'bg-neutral text-foreground-light'
										}`}
									>
										{groupStage.autoFill
											? t('competition.status.enabled')
											: t('competition.status.disabled')}
									</span>
								</div>
								<div className='flex items-center text-sm'>
									<span className='w-28 font-medium text-foreground'>
										{t('competition.labels.created')}
									</span>
									<span className='text-foreground-lighter text-xs'>
										{formatCompetitionDate(groupStage.createdAt)}
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
