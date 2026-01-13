import { type ButtonHTMLAttributes, type JSX, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlocker } from 'react-router'
import { ConfirmDialog } from '~/components/ConfirmDialog'
import { ActionButton } from '~/components/buttons/ActionButton'
import { RestorePageIcon } from '~/components/icons'
import { cn } from '~/utils/misc'
import type { Permission } from '~/utils/rbac'

type FormActionFooterProps = {
  isDirty: boolean
  isValid?: boolean
  loading?: boolean
  mode?: 'create' | 'edit'
  primaryLabel?: string
  onPrimary?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
  buttonsDisabled?: boolean
  permission?: Permission
  onSecondary?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
}

export function FormActionFooter({
  isDirty,
  isValid = true,
  loading = false,
  mode = 'create',
  primaryLabel,
  onPrimary,
  buttonsDisabled,
  permission,
  onSecondary,
}: Readonly<FormActionFooterProps>): JSX.Element {
  const { t } = useTranslation()
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  )
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setIsConfirmOpen(true)
    }
  }, [blocker.state])

  function handleConfirmLeave(): void {
    setIsConfirmOpen(false)
    blocker.proceed?.()
  }

  function handleCancelLeave(): void {
    setIsConfirmOpen(false)
    blocker.reset?.()
  }

  // Derive label logic
  const primaryLabelText =
    primaryLabel ??
    (loading
      ? mode === 'edit'
        ? t('common.actions.updating')
        : t('common.actions.saving')
      : mode === 'edit'
        ? t('common.actions.update')
        : t('common.actions.save'))

  // Derive disabled states
  const isPrimaryDisabled =
    buttonsDisabled ?? (loading || !isValid || (mode === 'edit' && !isDirty))
  const isSecondaryDisabled = loading

  return (
    <>
      <div
        className={cn(
          'flex flex-col gap-2 md:flex-row md:items-center md:justify-between',
          !isDirty && 'md:justify-end',
        )}
      >
        {isDirty ? (
          <span
            className='text-sm text-warning-600 dark:text-warning-400'
            data-testid='form-unsaved-warning'
          >
            {t('common.confirm.unsavedChanges')}
          </span>
        ) : null}
        <div className='flex items-center gap-3'>
          <ActionButton
            type='button'
            variant='secondary'
            color='brand'
            onClick={onSecondary}
            disabled={isSecondaryDisabled}
            permission={permission}
            className='w-full hover:scale-100 md:w-fit md:hover:scale-105'
            data-testid='form-action-secondary'
          >
            <span className='flex items-center gap-2'>
              <RestorePageIcon className='h-6 w-6' size={24} />
              <span>{t('common.actions.cancel')}</span>
            </span>
          </ActionButton>
          <ActionButton
            type='submit'
            variant='primary'
            color='brand'
            icon='check_circle'
            onClick={onPrimary}
            disabled={isPrimaryDisabled}
            permission={permission}
            className='w-full hover:scale-100 md:w-fit md:hover:scale-105'
            data-testid='form-action-primary'
          >
            {primaryLabelText}
          </ActionButton>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={open => {
          if (!open) {
            handleCancelLeave()
          }
        }}
        onConfirm={handleConfirmLeave}
        title={t('common.confirm.unsavedTitle')}
        description={t('common.confirm.unsavedDescription')}
        confirmLabel={t('common.confirm.leaveAnyway')}
        cancelLabel={t('common.confirm.stayOnPage')}
        intent='warning'
      />
    </>
  )
}
