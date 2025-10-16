import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { useLanguageDirection } from '~/hooks/useLanguageDirection'
import { cn } from '~/utils/misc'

type UsersLayoutHeaderProps = {
  className?: string
}

export function UsersLayoutHeader({ className }: UsersLayoutHeaderProps): JSX.Element {
  const { t } = useTranslation()
  const { latinFontClass } = useLanguageDirection()

  const title = t('users.titles.userManagement')
  const description = t('users.descriptions.manageUsersAndRoles')

  return (
    <div
      className={cn('border-button-neutral-secondary-border border-b pb-6', className)}
      data-testid='users-header-admin'
    >
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className={cn('text-3xl font-bold', latinFontClass)}>{title}</h1>
          <p className={cn('text-foreground mt-1', latinFontClass)}>{description}</p>
        </div>
      </div>
    </div>
  )
}
