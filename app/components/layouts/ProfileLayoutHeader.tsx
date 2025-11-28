import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { LayoutHeader } from './LayoutHeader'

type ProfileLayoutHeaderProps = {
	className?: string
}

export function ProfileLayoutHeader({
	className,
}: ProfileLayoutHeaderProps): JSX.Element {
	const { t } = useTranslation()

	return (
		<LayoutHeader
			title={t('profile.title')}
			description={t('profile.description')}
			className={className}
			testId='profile-header'
		/>
	)
}
