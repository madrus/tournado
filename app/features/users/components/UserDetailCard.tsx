import { type JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'

import type { Role, User } from '@prisma/client'

import { ActionButton } from '~/components/buttons/ActionButton'
import { getRoleBadgeVariant, VALID_ROLES } from '~/features/users/utils/roleUtils'

type UserDetailCardProps = {
  user: User
  isSubmitting: boolean
}

export const UserDetailCard = (props: Readonly<UserDetailCardProps>): JSX.Element => {
  const { user, isSubmitting } = props
  const { t } = useTranslation()
  const [selectedRole, setSelectedRole] = useState<Role>(user.role)

  const isRoleUnchanged = selectedRole === user.role

  return (
    <div className='bg-card rounded-lg p-6 shadow'>
      <h2 className='mb-4 text-xl font-semibold'>
        {t('users.titles.userInformation')}
      </h2>

      <div className='space-y-4'>
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

      {/* Role Update Form */}
      <Form method='post' className='mt-6'>
        <input type='hidden' name='intent' value='updateRole' />

        <div className='space-y-4'>
          <div>
            <label htmlFor='role' className='mb-2 block text-sm font-medium'>
              {t('users.fields.assignRole')}
            </label>
            <select
              id='role'
              name='role'
              value={selectedRole}
              onChange={event => setSelectedRole(event.target.value as Role)}
              className='bg-background border-border w-full rounded-md border px-3 py-2'
              disabled={isSubmitting}
            >
              {VALID_ROLES.map(role => (
                <option key={role} value={role}>
                  {t(`roles.${role.toLowerCase()}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor='reason' className='mb-2 block text-sm font-medium'>
              {t('users.fields.reason')} {t('common.optional')}
            </label>
            <textarea
              id='reason'
              name='reason'
              rows={3}
              className='bg-background border-border w-full rounded-md border px-3 py-2'
              placeholder={t('users.placeholders.reasonForChange')}
              disabled={isSubmitting}
            />
          </div>

          <ActionButton
            type='submit'
            variant='primary'
            disabled={isSubmitting || isRoleUnchanged}
            className='w-full'
          >
            {t('users.actions.updateRole')}
          </ActionButton>
        </div>
      </Form>
    </div>
  )
}
