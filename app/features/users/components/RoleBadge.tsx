import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import type { User } from '@prisma/client'

import { cn } from '~/utils/misc'

import { getRoleBadgeVariant } from '../utils/roleUtils'

type RoleBadgeProps = {
  role: User['role']
  className?: string
}

export function RoleBadge({ role, className }: Readonly<RoleBadgeProps>): JSX.Element {
  const { t } = useTranslation()

  return (
    <span className={cn(getRoleBadgeVariant(role), className)}>
      {t(`roles.${role.toLowerCase()}`)}
    </span>
  )
}
