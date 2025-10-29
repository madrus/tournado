import { type JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'

import type { Role, User } from '@prisma/client'

import { ActionButton } from '~/components/buttons/ActionButton'
import { Panel } from '~/components/Panel'
import { VALID_ROLES } from '~/features/users/utils/roleUtils'

type UserAssignRoleProps = {
  user: User
  isSubmitting: boolean
}

export const UserAssignRole = (props: Readonly<UserAssignRoleProps>): JSX.Element => {
  const { user, isSubmitting } = props
  const { t } = useTranslation()
  const [selectedRole, setSelectedRole] = useState<Role>(user.role)

  const isRoleUnchanged = selectedRole === user.role

  return (
    <Panel color='indigo' variant='content-panel'>
      <Form method='post'>
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
    </Panel>
  )
}
