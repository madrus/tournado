import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { TournamentFilter } from '~/features/tournaments/components/TournamentFilter'
import type { TournamentListItem } from '~/features/tournaments/types'

import { LayoutHeader } from './LayoutHeader'

type CompetitionLayoutHeaderProps = {
	variant: 'admin'
	tournamentListItems: readonly TournamentListItem[]
	selectedTournamentId?: string
	className?: string
}

export function CompetitionLayoutHeader({
	variant,
	tournamentListItems,
	selectedTournamentId,
	className,
}: CompetitionLayoutHeaderProps): JSX.Element {
	const { t } = useTranslation()

	const isAdmin = variant === 'admin'
	const title = isAdmin ? t('admin.competition.title') : t('common.titles.competition')
	const description = isAdmin
		? t('admin.competition.description')
		: t('competition.description')

	return (
		<LayoutHeader
			title={title}
			description={description}
			actions={
				<TournamentFilter
					tournamentListItems={tournamentListItems}
					selectedTournamentId={selectedTournamentId}
					showAllOption={false}
					basePath='/a7k9m2x5p8w1n4q6r3y8b5t1/competition/groups'
				/>
			}
			className={className}
			testId='competition-header-admin'
		/>
	)
}
