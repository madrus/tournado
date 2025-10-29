import { type JSX, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'

import type { User } from '@prisma/client'

import { ActionButton } from '~/components/buttons/ActionButton'
import { ConfirmDialog } from '~/components/ConfirmDialog'
import { Panel } from '~/components/Panel'

type UserDeactivationFormProps = {
  user: User
  isSubmitting: boolean
}

export const UserDeactivationForm = (
  props: Readonly<UserDeactivationFormProps>
): JSX.Element => {
  const { user, isSubmitting } = props
  const { t } = useTranslation()
  const formRef = useRef<HTMLFormElement | null>(null)

  const submitForm = useCallback(() => {
    if (isSubmitting) {
      return
    }

    const form = formRef.current
    if (!form) {
      return
    }

    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit()
      return
    }

    form.submit()
  }, [isSubmitting])

  return (
    <Panel color='fuchsia' variant='content-panel'>
      <h3 className='mb-4 text-lg font-semibold'>
        {user.active
          ? t('users.titles.deactivateUser')
          : t('users.titles.reactivateUser')}
      </h3>
      <Form method='post' ref={formRef}>
        <input
          type='hidden'
          name='intent'
          value={user.active ? 'deactivate' : 'reactivate'}
        />

        <div className='space-y-4'>
          <div>
            <label
              htmlFor='deactivate-reason'
              className='mb-2 block text-sm font-medium'
            >
              {t('users.fields.reason')} {t('common.optional')}
            </label>
            <textarea
              id='deactivate-reason'
              name='reason'
              rows={3}
              maxLength={200}
              className='bg-background border-border w-full rounded-md border px-3 py-2'
              placeholder={
                user.active
                  ? t('users.placeholders.reasonForDeactivation')
                  : t('users.placeholders.reasonForReactivation')
              }
              disabled={isSubmitting}
            />
          </div>

          {user.active ? (
            <ConfirmDialog
              intent='danger'
              destructive
              title={t('users.titles.deactivateUser')}
              confirmLabel={t('users.actions.deactivateUser')}
              cancelLabel={t('common.actions.cancel')}
              onConfirm={submitForm}
              trigger={
                <ActionButton
                  type='button'
                  variant='primary'
                  color='red'
                  disabled={isSubmitting}
                  className='w-full'
                >
                  {t('users.actions.deactivateUser')}
                </ActionButton>
              }
            />
          ) : (
            <ActionButton
              type='submit'
              variant='primary'
              color='emerald'
              disabled={isSubmitting}
              className='w-full'
            >
              {t('users.actions.reactivateUser')}
            </ActionButton>
          )}
        </div>
      </Form>
      {!user.active ? (
        <div className='bg-warning/10 text-warning border-warning/20 mt-4 rounded-md border p-3 text-sm'>
          {t('users.messages.userIsDeactivated')}
        </div>
      ) : null}
    </Panel>
  )
}
