import { type JSX, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'

import type { Role, User } from '@prisma/client'

import { ComboField, type Option } from '~/components/inputs/ComboField'
import { TextInputField } from '~/components/inputs/TextInputField'
import { Panel } from '~/components/Panel'
import { VALID_ROLES } from '~/features/users/utils/roleUtils'

type UserDetailCardProps = {
  user: User
  isSubmitting?: boolean
}

export const UserDetailCard = (props: Readonly<UserDetailCardProps>): JSX.Element => {
  const { user, isSubmitting = false } = props
  const { t } = useTranslation()
  const displayNameFormRef = useRef<HTMLFormElement>(null)
  const roleFormRef = useRef<HTMLFormElement>(null)
  const [displayName, setDisplayName] = useState(user.displayName || '')
  const [selectedRole, setSelectedRole] = useState<Role>(user.role)

  // Convert VALID_ROLES to ComboField options format
  const roleOptions: Option[] = VALID_ROLES.map(role => ({
    value: role,
    label: t(`roles.${role.toLowerCase()}`),
  }))

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole as Role)
    // Auto-submit the form when role changes to a different value
    if (newRole !== user.role) {
      // Use setTimeout to ensure the state is updated before submitting
      setTimeout(() => {
        roleFormRef.current?.requestSubmit()
      }, 0)
    }
  }

  return (
    <Panel color='teal' variant='content-panel'>
      <h2 className='mb-4 text-xl font-semibold'>
        {t('users.titles.userInformation')}
      </h2>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <label className='text-foreground/80 text-sm font-medium'>
            {t('users.fields.email')}
          </label>
          <div className='text-foreground mt-1'>{user.email}</div>
        </div>

        <div>
          <label className='text-foreground/80 text-sm font-medium'>
            {t('users.fields.createdAt')}
          </label>
          <div className='text-foreground mt-1'>
            {new Date(user.createdAt).toLocaleString()}
          </div>
        </div>

        <Form ref={displayNameFormRef} method='post'>
          <input type='hidden' name='intent' value='updateDisplayName' />
          <input type='hidden' name='userId' value={user.id} />

          <TextInputField
            name='displayName'
            label={t('users.fields.displayName')}
            value={displayName}
            onChange={value => setDisplayName(value)}
            placeholder={t('users.placeholders.displayName')}
            disabled={isSubmitting}
            color='teal'
            onBlur={event => {
              // Auto-submit on blur if value changed
              if (displayName !== (user.displayName || '')) {
                const form = event.currentTarget.closest('form')
                if (form && typeof form.requestSubmit === 'function') {
                  form.requestSubmit()
                }
              }
            }}
          />
        </Form>

        <Form ref={roleFormRef} method='post'>
          <input type='hidden' name='intent' value='updateRole' />

          <ComboField
            name='role'
            label={t('users.fields.assignRole')}
            options={roleOptions}
            value={selectedRole}
            onChange={handleRoleChange}
            disabled={isSubmitting}
            color='indigo'
          />
        </Form>
      </div>
    </Panel>
  )
}
