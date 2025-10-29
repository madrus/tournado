import { type JSX, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'

import type { User } from '@prisma/client'

import { ActionButton } from '~/components/buttons/ActionButton'
import { ConfirmDialog } from '~/components/ConfirmDialog'
import { InfoBanner } from '~/components/InfoBanner'
import { TextAreaInputField } from '~/components/inputs/TextAreaInputField'
import { Panel } from '~/components/Panel'

type UserDeactivateProps = {
  user: User
  isSubmitting: boolean
}

export const UserDeactivate = (props: Readonly<UserDeactivateProps>): JSX.Element => {
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

  const panelColor = user.active ? 'red' : 'lime'
  const buttonColor = user.active ? 'red' : 'emerald'

  return (
    <Panel color={panelColor} variant='content-panel'>
      <h3 className='mb-4 text-lg font-semibold'>
        {user.active
          ? t('users.titles.deactivateUser')
          : t('users.titles.reactivateUser')}
      </h3>

      {!user.active ? (
        <InfoBanner variant='warning'>
          {t('users.messages.userIsDeactivated')}
        </InfoBanner>
      ) : null}

      <Form key={user.active.toString()} method='post' ref={formRef}>
        <input
          type='hidden'
          name='intent'
          value={user.active ? 'deactivate' : 'reactivate'}
        />

        <div className='space-y-4'>
          <TextAreaInputField
            name='reason'
            label={t('users.fields.reason')}
            rows={3}
            maxLength={200}
            defaultValue=''
            placeholder={
              user.active
                ? t('users.placeholders.reasonForDeactivation')
                : t('users.placeholders.reasonForReactivation')
            }
            disabled={isSubmitting}
            color={panelColor}
          />

          <div className='flex md:justify-center'>
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
                    color={buttonColor}
                    disabled={isSubmitting}
                    className='w-full hover:scale-100 md:w-fit md:hover:scale-105'
                  >
                    {t('users.actions.deactivateUser')}
                  </ActionButton>
                }
              />
            ) : (
              <ActionButton
                type='submit'
                variant='primary'
                color={buttonColor}
                disabled={isSubmitting}
                className='w-full hover:scale-100 md:w-fit md:hover:scale-105'
              >
                {t('users.actions.reactivateUser')}
              </ActionButton>
            )}
          </div>
        </div>
      </Form>
    </Panel>
  )
}
