import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import type { User } from '@prisma/client'
import { Text } from '@radix-ui/themes'

import { datatableCellTextVariants } from '~/components/shared/datatable.variants'
import { useLanguageDirection } from '~/hooks/useLanguageDirection'
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
  const { latinFontClass } = useLanguageDirection()

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Only trigger if Enter or Space is pressed
    if (event.key === 'Enter' || event.key === ' ') {
      // Prevent default to avoid scrolling on Space
      event.preventDefault()
      // Don't trigger if the event came from the RoleDropdown or its children
      if (
        event.target === event.currentTarget ||
        !(event.target as HTMLElement).closest('[role="combobox"]')
      ) {
        onClick()
      }
    }
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Don't trigger onClick if clicking on the RoleDropdown
    if (!(event.target as HTMLElement).closest('[role="combobox"]')) {
      onClick()
    }
  }

  return (
    <div
      className='focus-visible:ring-primary-500 cursor-pointer px-6 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role='button'
      tabIndex={0}
      aria-label={t('users.viewUserDetails', {
        name: user.displayName || user.email,
      })}
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <Text
            size='2'
            weight='medium'
            className={cn(
              'block',
              datatableCellTextVariants({ variant: 'primary' }),
              latinFontClass
            )}
          >
            {user.displayName || user.email}
          </Text>
          {user.displayName ? (
            <Text
              size='1'
              className={cn(
                'mt-1 block',
                datatableCellTextVariants({ variant: 'secondary' }),
                latinFontClass
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
