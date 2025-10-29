import { type JSX } from 'react'
import { useTranslation } from 'react-i18next'

import type { User } from '@prisma/client'

import { Panel } from '~/components/Panel'
import { getRoleBadgeVariant } from '~/features/users/utils/roleUtils'

type UserDetailCardProps = {
  user: User
}

export const UserDetailCard = (props: Readonly<UserDetailCardProps>): JSX.Element => {
  const { user } = props
  const { t } = useTranslation()

  return (
    <Panel color='teal' variant='content-panel'>
      <h2 className='mb-4 text-xl font-semibold'>
        {t('users.titles.userInformation')}
      </h2>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <label className='text-foreground/60 text-sm font-medium'>
            {t('users.fields.email')}
          </label>
          <div className='text-foreground mt-1'>{user.email}</div>
        </div>

        <div>
          <label className='text-foreground/60 text-sm font-medium'>
            {t('users.fields.displayName')}
          </label>
          <div className='text-foreground mt-1'>{user.displayName || '-'}</div>
        </div>

        <div>
          <label className='text-foreground/60 text-sm font-medium'>
            {t('users.fields.currentRole')}
          </label>
          <div className='mt-1'>
            <span className={getRoleBadgeVariant(user.role)}>
              {t(`roles.${user.role.toLowerCase()}`)}
            </span>
          </div>
        </div>

        <div>
          <label className='text-foreground/60 text-sm font-medium'>
            {t('users.fields.createdAt')}
          </label>
          <div className='text-foreground mt-1'>
            {new Date(user.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
    </Panel>
  )
}
