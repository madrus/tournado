import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import type { User } from '@prisma/client'
import { Text } from '@radix-ui/themes'

import { datatableCellTextVariants } from '~/components/shared/datatable.variants'
import { cn } from '~/utils/misc'

import { getRoleBadgeVariant } from '../utils/roleUtils'

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
      <div className='flex items-start justify-start'>
        <div className='min-w-0 flex-1'>
          <Text
            size='2'
            weight='medium'
            className={cn('block', datatableCellTextVariants({ variant: 'primary' }))}
          >
            {user.email}
          </Text>
          <Text
            size='1'
            className={cn(
              'mt-1 block',
              datatableCellTextVariants({ variant: 'secondary' })
            )}
          >
            {user.displayName || '-'}
          </Text>
        </div>
        <div className='ml-4 flex-shrink-0 text-right'>
          <span className={getRoleBadgeVariant(user.role)}>
            {t(`roles.${user.role.toLowerCase()}`)}
          </span>
        </div>
      </div>
    </div>
  )
}
