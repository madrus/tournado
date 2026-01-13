import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutHeader } from '~/components/layouts/LayoutHeader'

type UsersLayoutHeaderProps = {
  className?: string
}

export function UsersLayoutHeader({ className }: UsersLayoutHeaderProps): JSX.Element {
  const { t } = useTranslation()

  const title = t('users.titles.userManagement')
  const description = t('users.descriptions.manageUsersAndRoles')

  return (
    <LayoutHeader
      title={title}
      description={description}
      className={className}
      testId='users-header-admin'
      breakpoint='md'
    />
  )
}
