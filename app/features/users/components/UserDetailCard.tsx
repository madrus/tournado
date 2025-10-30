import { type JSX, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'

import type { Role, User } from '@prisma/client'

import { Badge } from '~/components/Badge'
import { ActionButton } from '~/components/buttons/ActionButton'
import { ConfirmDialog } from '~/components/ConfirmDialog'
import { ComboField, type Option } from '~/components/inputs/ComboField'
import { TextInputField } from '~/components/inputs/TextInputField'
import { Panel } from '~/components/Panel'
import { VALID_ROLES } from '~/features/users/utils/roleUtils'
import { useLanguageDirection } from '~/hooks/useLanguageDirection'

const USER_ACTIVE_BUTTON_COLOR = 'red' as const
const USER_INACTIVE_BUTTON_COLOR = 'amber' as const

type UserDetailCardProps = {
  user: User
  isSubmitting?: boolean
}

export const UserDetailCard = (props: Readonly<UserDetailCardProps>): JSX.Element => {
  const { user, isSubmitting = false } = props
  const { t } = useTranslation()
  const { latinFontClass } = useLanguageDirection()
  const displayNameFormRef = useRef<HTMLFormElement>(null)
  const roleFormRef = useRef<HTMLFormElement>(null)
  const deactivateFormRef = useRef<HTMLFormElement>(null)
  const [displayName, setDisplayName] = useState(user.displayName || '')
  const [selectedRole, setSelectedRole] = useState<Role>(user.role)
  const buttonColor = user.active
    ? USER_ACTIVE_BUTTON_COLOR
    : USER_INACTIVE_BUTTON_COLOR

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

  const submitDeactivateForm = useCallback(() => {
    if (isSubmitting) {
      return
    }

    const form = deactivateFormRef.current
    if (!form) {
      return
    }

    form.requestSubmit()
  }, [isSubmitting])

  return (
    <Panel color='teal' variant='content-panel'>
      {/* Header with Deactivate/Reactivate Button */}
      <div className='mb-4 flex items-center justify-between gap-4'>
        <div className='flex flex-1 items-baseline gap-3'>
          <h2 className='text-xl font-semibold'>{t('users.titles.userInformation')}</h2>
          {!user.active ? (
            <Badge color='red'>{t('users.messages.deactivated')}</Badge>
          ) : null}
        </div>
        <div className='flex flex-shrink-0 items-center'>
          <Form ref={deactivateFormRef} method='post'>
            <input
              type='hidden'
              name='intent'
              value={user.active ? 'deactivate' : 'reactivate'}
            />
          </Form>
          <ConfirmDialog
            intent={user.active ? 'danger' : 'warning'}
            destructive={user.active}
            isLoading={isSubmitting}
            trigger={
              <ActionButton
                type='button'
                color={buttonColor}
                variant='primary'
                disabled={isSubmitting}
              >
                {user.active
                  ? t('users.actions.deactivateUser')
                  : t('users.actions.reactivateUser')}
              </ActionButton>
            }
            title={
              user.active
                ? t('users.titles.deactivateUser')
                : t('users.titles.reactivateUser')
            }
            description={
              user.active
                ? t('users.messages.confirmDeactivate')
                : t('users.messages.confirmReactivate')
            }
            confirmLabel={
              user.active
                ? t('users.actions.deactivateUser')
                : t('users.actions.reactivateUser')
            }
            cancelLabel={t('common.actions.cancel')}
            onConfirm={submitDeactivateForm}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <label className='text-foreground/80 text-sm font-medium'>
            {t('users.fields.email')}
          </label>
          <div className={`text-foreground mt-1 ${latinFontClass}`}>{user.email}</div>
        </div>

        <div>
          <label className='text-foreground/80 text-sm font-medium'>
            {t('users.fields.createdAt')}
          </label>
          <div className={`text-foreground mt-1 ${latinFontClass}`}>
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
            className={latinFontClass}
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
            label={t('users.fields.assignedRole')}
            options={roleOptions}
            value={selectedRole}
            onChange={handleRoleChange}
            disabled={isSubmitting}
            color='teal'
          />
        </Form>
      </div>
    </Panel>
  )
}
