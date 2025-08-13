import { type JSX, type ReactNode, useEffect, useRef } from 'react'

import * as Dialog from '@radix-ui/react-dialog'

import { ActionButton } from '~/components/buttons/ActionButton'
import type { ButtonVariants } from '~/components/buttons/button.variants'
import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'

import { getIconForIntent, getDefaultColorsForIntent } from './dialog.utils'
import {
  dialogContentVariants,
  type DialogIntent,
  dialogOverlayVariants,
  type DialogSize,
  iconColorVariants,
  iconContainerVariants,
  titleColorVariants,
} from './dialog.variants'

type ConfirmDialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode

  // Enhanced intent-based theming
  intent?: DialogIntent
  dialogSize?: DialogSize

  // Icon customization
  icon?: IconName
  hideIcon?: boolean

  // Content
  title: string
  description?: string

  // Button labels
  confirmLabel: string
  cancelLabel: string

  // Actions
  onConfirm?: () => void
  onCancel?: () => void

  // Button styling (with smart defaults based on intent)
  confirmVariant?: NonNullable<ButtonVariants['variant']>
  confirmColor?: NonNullable<ButtonVariants['color']>
  cancelVariant?: NonNullable<ButtonVariants['variant']>
  cancelColor?: NonNullable<ButtonVariants['color']>
  size?: NonNullable<ButtonVariants['size']>

  // Behavior
  destructive?: boolean
  preventBackgroundClose?: boolean

  // Styling
  className?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  trigger,

  // Enhanced props with smart defaults
  intent = 'warning',
  dialogSize = 'md',

  icon,
  hideIcon = false,

  title,
  description,

  confirmLabel,
  cancelLabel,

  onConfirm,
  onCancel,

  // Button styling (colors driven by intent)
  confirmVariant = 'primary',
  confirmColor,
  cancelVariant = 'secondary',
  cancelColor,
  size = 'md',

  destructive = false,
  preventBackgroundClose = false,

  className,
}: Readonly<ConfirmDialogProps>): JSX.Element {
  const cancelContainerRef = useRef<HTMLDivElement | null>(null)
  const confirmContainerRef = useRef<HTMLDivElement | null>(null)

  // Get intent-driven defaults
  const intentColors = getDefaultColorsForIntent(intent)
  const finalIcon = getIconForIntent(intent, icon)
  const finalConfirmColor = confirmColor || intentColors.confirm
  const finalCancelColor = cancelColor || intentColors.cancel

  useEffect(() => {
    if (open) {
      const target = destructive
        ? cancelContainerRef.current
        : confirmContainerRef.current
      const button = target?.querySelector('button') as HTMLButtonElement | null

      // Add delay for smoother animation
      const timeoutId = setTimeout(() => {
        button?.focus()
      }, 200)

      return () => clearTimeout(timeoutId)
    }
  }, [open, destructive])

  return (
    <Dialog.Root
      open={open}
      onOpenChange={preventBackgroundClose ? undefined : onOpenChange}
    >
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}

      <Dialog.Portal>
        <Dialog.Overlay className={dialogOverlayVariants()} />

        <Dialog.Content
          role='alertdialog'
          aria-describedby={description ? 'dialog-description' : undefined}
          className={cn(dialogContentVariants({ intent, size: dialogSize }), className)}
        >
          {/* Screen reader announcement */}
          <div className='sr-only' aria-live='polite'>
            {open ? `${title}. ${description || ''}` : ''}
          </div>

          <div className='flex items-start gap-5'>
            {!hideIcon ? (
              <div aria-hidden='true' className={iconContainerVariants({ intent })}>
                {renderIcon(finalIcon, {
                  className: iconColorVariants({ intent }),
                })}
              </div>
            ) : null}

            <div className={cn('min-w-0 flex-1', !hideIcon && 'pt-1')}>
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
                      variant={cancelVariant}
                      color={finalCancelColor}
                      size={size}
                      onClick={onCancel}
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
                      variant={confirmVariant}
                      color={finalConfirmColor}
                      size={size}
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
