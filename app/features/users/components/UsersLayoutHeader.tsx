import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/utils/misc'

type UsersLayoutHeaderProps = {
  className?: string
}

export function UsersLayoutHeader({ className }: UsersLayoutHeaderProps): JSX.Element {
  const { t } = useTranslation()

  const title = t('users.titles.userManagement')
  const description = t('users.descriptions.manageUsersAndRoles')

  return (
    <div
      className={cn('border-button-neutral-secondary-border border-b pb-6', className)}
      data-testid='users-header-admin'
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>{title}</h1>
          <p className='text-foreground mt-1'>{description}</p>
        </div>
      </div>
    </div>
  )
}
