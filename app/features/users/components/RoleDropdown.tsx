import { JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, useSubmit } from 'react-router'

import type { User } from '@prisma/client'

type RoleDropdownProps = {
  user: User
  disabled?: boolean
  onSubmitting?: (isSubmitting: boolean) => void
}

export function RoleDropdown({
  user,
  disabled = false,
  onSubmitting,
}: Readonly<RoleDropdownProps>): JSX.Element {
  const { t } = useTranslation()
  const submit = useSubmit()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <Form
      method='post'
      onChange={event => {
        const formData = new FormData(event.currentTarget)
        const newRole = formData.get('role') as string
        if (newRole !== user.role) {
          setIsSubmitting(true)
          onSubmitting?.(true)
          submit(event.currentTarget)
        }
      }}
    >
      <input type='hidden' name='intent' value='updateRole' />
      <input type='hidden' name='userId' value={user.id} />
      <select
        name='role'
        defaultValue={user.role}
        className='bg-background border-border rounded border px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50'
        onClick={event => event.stopPropagation()}
        disabled={disabled || isSubmitting}
        aria-busy={isSubmitting}
      >
        <option value='PUBLIC'>{t('roles.public')}</option>
        <option value='MANAGER'>{t('roles.manager')}</option>
        <option value='ADMIN'>{t('roles.admin')}</option>
        <option value='REFEREE'>{t('roles.referee')}</option>
        <option value='EDITOR'>{t('roles.editor')}</option>
        <option value='BILLING'>{t('roles.billing')}</option>
      </select>
    </Form>
  )
}
