import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { LayoutHeader } from './LayoutHeader'

type AboutLayoutHeaderProps = {
	className?: string
}

export function AboutLayoutHeader({ className }: AboutLayoutHeaderProps): JSX.Element {
	const { t } = useTranslation()

	return (
		<LayoutHeader
			title={t('about.title')}
			description={t('about.description')}
			className={className}
			testId='about-header'
			breakpoint='md'
		/>
	)
}
