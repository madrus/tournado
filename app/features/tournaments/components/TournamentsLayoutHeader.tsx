import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionLinkButton } from '~/components/buttons/ActionLinkButton'
import { LayoutHeader } from '~/components/layouts/LayoutHeader'

type TournamentsLayoutHeaderProps = {
	variant: 'admin'
	addButtonTo?: string
	className?: string
}

export function TournamentsLayoutHeader({
	variant,
	addButtonTo = 'new',
	className,
}: TournamentsLayoutHeaderProps): JSX.Element {
	const { t } = useTranslation()

	const isAdmin = variant === 'admin'
	const title = isAdmin ? t('admin.tournament.title') : t('common.titles.tournaments')
	const description = isAdmin ? t('admin.tournament.description') : t('tournaments.description')

	return (
		<LayoutHeader
			title={title}
			description={description}
			actions={
				<ActionLinkButton
					to={addButtonTo}
					icon='newWindow'
					label={t('common.actions.add')}
					variant='primary'
					color='brand'
					permission='tournaments:create'
				/>
			}
			className={className}
			testId='tournaments-header-admin'
		/>
	)
}
