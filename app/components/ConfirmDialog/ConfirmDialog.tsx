import { type JSX, type ReactNode, useRef } from 'react'

import * as Dialog from '@radix-ui/react-dialog'

import { ActionButton } from '~/components/buttons/ActionButton'
import { renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'

import { getDefaultColorsForIntent, getIconForIntent } from './dialog.utils'
import {
  dialogContentVariants,
  type DialogIntent,
  dialogOverlayVariants,
  iconColorVariants,
  iconContainerVariants,
  titleColorVariants,
} from './dialog.variants'

type ConfirmDialogProps = {
  // Trigger-based dialog (no open/onOpenChange needed)
  trigger: ReactNode

  // Enhanced intent-based theming
  intent?: DialogIntent

  // Content
  title: string
  description?: string

  // Button labels
  confirmLabel: string
  cancelLabel: string

  // Actions
  onConfirm?: () => void

  // Behavior
  destructive?: boolean
}

export function ConfirmDialog({
  trigger,
  intent = 'warning',
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  destructive = false,
}: Readonly<ConfirmDialogProps>): JSX.Element {
  const cancelContainerRef = useRef<HTMLDivElement | null>(null)
  const confirmContainerRef = useRef<HTMLDivElement | null>(null)

  // Get intent-driven defaults
  const intentColors = getDefaultColorsForIntent(intent)
  const finalIcon = getIconForIntent(intent)
  const finalConfirmColor = intentColors.confirm
  const finalCancelColor = intentColors.cancel

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={dialogOverlayVariants()} />

        <Dialog.Content
          role='alertdialog'
          aria-describedby={description ? 'dialog-description' : undefined}
          className={dialogContentVariants({ intent, size: 'md' })}
          onOpenAutoFocus={event => {
            // Prevent default autofocus and set custom focus after a delay
            event.preventDefault()
            const target = destructive
              ? cancelContainerRef.current
              : confirmContainerRef.current
            const button = target?.querySelector('button') as HTMLButtonElement | null

            // Add delay for smoother animation
            setTimeout(() => {
              button?.focus()
            }, 200)
          }}
        >
          <div className='flex items-start gap-5'>
            <div aria-hidden='true' className={iconContainerVariants({ intent })}>
              {renderIcon(finalIcon, {
                className: iconColorVariants({ intent }),
              })}
            </div>

            <div className='min-w-0 flex-1 pt-1'>
              <Dialog.Title
                className={cn(
                  'mb-2 text-2xl leading-tight font-semibold',
                  titleColorVariants({ intent })
                )}
              >
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description
                  id='dialog-description'
                  className='text-base leading-relaxed text-slate-600 dark:text-slate-400'
                >
                  {description}
                </Dialog.Description>
              ) : null}

              <div className='mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:gap-4'>
                <div ref={cancelContainerRef} className='sm:order-1'>
                  <Dialog.Close asChild>
                    <ActionButton
                      variant='secondary'
                      color={finalCancelColor}
                      size='md'
                      className='w-full min-w-[120px] sm:w-auto'
                      aria-label={cancelLabel}
                    >
                      {cancelLabel}
                    </ActionButton>
                  </Dialog.Close>
                </div>

                <div ref={confirmContainerRef} className='sm:order-2'>
                  <Dialog.Close asChild>
                    <ActionButton
                      variant='primary'
                      color={finalConfirmColor}
                      size='md'
                      onClick={onConfirm}
                      className='w-full min-w-[120px] sm:w-auto'
                      aria-label={confirmLabel}
                    >
                      {confirmLabel}
                    </ActionButton>
                  </Dialog.Close>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
