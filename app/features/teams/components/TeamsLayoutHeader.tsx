import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionLinkButton } from '~/components/buttons/ActionLinkButton'
import { LayoutHeader } from '~/components/layouts/LayoutHeader'

type TeamsLayoutHeaderProps = {
	variant: 'public' | 'admin'
	addButtonTo?: string
	className?: string
}

export function TeamsLayoutHeader({
	variant,
	addButtonTo = 'new',
	className,
}: TeamsLayoutHeaderProps): JSX.Element {
	const { t } = useTranslation()

	const isAdmin = variant === 'admin'

	const title = isAdmin ? t('admin.teams.title') : t('common.titles.teams')
	const description = isAdmin ? t('admin.teams.description') : t('teams.description')

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
					permission={isAdmin ? 'teams:create' : undefined}
				/>
			}
			className={className}
			testId={isAdmin ? 'teams-header-admin' : 'teams-header-public'}
		/>
	)
}
