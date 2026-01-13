import type { User } from '@prisma/client'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '~/components/Badge'
import { roleColors } from '../utils/roleUtils'

type RoleBadgeProps = {
	role: User['role']
	className?: string
}

export function RoleBadge({ role, className }: Readonly<RoleBadgeProps>): JSX.Element {
	const { t } = useTranslation()

	return (
		<Badge color={roleColors[role]} className={className}>
			{t(`roles.${role.toLowerCase()}`)}
		</Badge>
	)
}
