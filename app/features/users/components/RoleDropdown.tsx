import { JSX, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useFetcher } from 'react-router'

import type { Role, User } from '@prisma/client'
import * as Select from '@radix-ui/react-select'

import { ExpandMoreIcon } from '~/components/icons'

type RoleDropdownProps = {
  user: User
  disabled?: boolean
  onSubmitting?: (isSubmitting: boolean) => void
}

const ROLES: Role[] = ['PUBLIC', 'MANAGER', 'ADMIN', 'REFEREE', 'EDITOR', 'BILLING']

export function RoleDropdown({
  user,
  disabled = false,
  onSubmitting,
}: Readonly<RoleDropdownProps>): JSX.Element {
  const { t } = useTranslation()
  const fetcher = useFetcher()

  // Derive submitting state from fetcher - only for this specific user
  const isSubmitting =
    fetcher.state !== 'idle' && fetcher.formData?.get('userId') === user.id

  // Notify parent component of submitting state changes
  useEffect(() => {
    onSubmitting?.(isSubmitting)
  }, [isSubmitting, onSubmitting])

  const handleValueChange = (newRole: string) => {
    if (newRole !== user.role) {
      const formData = new FormData()
      formData.set('intent', 'updateRole')
      formData.set('userId', user.id)
      formData.set('role', newRole)

      fetcher.submit(formData, { method: 'post' })
    }
  }

  return (
    <div onClick={event => event.stopPropagation()}>
      <Select.Root
        value={user.role}
        onValueChange={handleValueChange}
        disabled={disabled || isSubmitting}
      >
        <Select.Trigger
          className='bg-background border-border inline-flex w-32 items-center justify-between gap-2 rounded border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50'
          aria-label={t('users.selectRole')}
        >
          <Select.Value />
          <Select.Icon>
            <ExpandMoreIcon size={16} />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className='bg-background border-border z-50 overflow-hidden rounded-md border shadow-lg'
            position='popper'
            sideOffset={5}
          >
            <Select.Viewport className='p-1'>
              {ROLES.map(role => (
                <Select.Item
                  key={role}
                  value={role}
                  className='hover:bg-accent relative flex cursor-pointer items-center rounded px-8 py-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                >
                  <Select.ItemText>{t(`roles.${role.toLowerCase()}`)}</Select.ItemText>
                  <Select.ItemIndicator className='absolute left-2 inline-flex h-4 w-4 items-center justify-center'>
                    ✓
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
