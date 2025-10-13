import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import type { User } from '@prisma/client'
import { Text } from '@radix-ui/themes'

import { datatableCellTextVariants } from '~/components/shared/datatable.variants'
import { cn } from '~/utils/misc'

import { getRoleBadgeVariant } from '../utils/roleUtils'
import { RoleDropdown } from './RoleDropdown'

type UserMobileRowProps = {
  user: User
  onClick: () => void
}

export function UserMobileRow({
  user,
  onClick,
}: Readonly<UserMobileRowProps>): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className='cursor-pointer px-6 py-4' onClick={onClick}>
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <Text
            size='2'
            weight='medium'
            className={cn('block', datatableCellTextVariants({ variant: 'primary' }))}
          >
            {user.displayName || user.email}
          </Text>
          {user.displayName ? (
            <Text
              size='1'
              className={cn(
                'mt-1 block',
                datatableCellTextVariants({ variant: 'secondary' })
              )}
            >
              {user.email}
            </Text>
          ) : null}
          <div className='mt-2'>
            <span className={getRoleBadgeVariant(user.role)}>
              {t(`roles.${user.role.toLowerCase()}`)}
            </span>
          </div>
        </div>
        <div className='flex-shrink-0'>
          <RoleDropdown user={user} />
        </div>
      </div>
    </div>
  )
}
