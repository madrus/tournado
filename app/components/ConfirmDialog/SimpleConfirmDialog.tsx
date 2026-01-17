import * as Dialog from '@radix-ui/react-dialog'
import type { JSX, ReactNode } from 'react'
import { ActionButton } from '~/components/buttons/ActionButton'
import { renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import {
  getCancelButtonColor,
  getDefaultColorsForIntent,
  getIconForIntent,
} from './dialog.utils'
import {
  type DialogIntent,
  dialogContentVariants,
  dialogOverlayVariants,
  iconColorVariants,
  iconContainerVariants,
  titleColorVariants,
} from './dialog.variants'

/**
 * SimpleConfirmDialog - Uncontrolled confirmation dialog component
 *
 * This component operates in **uncontrolled mode only**:
 * - Provide a `trigger` element (button, link, etc.)
 * - Dialog manages its own open/close state internally
 * - Buttons automatically close the dialog when clicked
 * - No external state management required
 *
 * @example
 * ```tsx
 * <SimpleConfirmDialog
 *   trigger={<Button>Delete</Button>}
 *   intent="danger"
 *   title="Delete item"
 *   description="Are you sure? This action cannot be undone."
 *   confirmLabel="Yes, delete"
 *   cancelLabel="Cancel"
 *   destructive
 *   onConfirm={handleDelete}
 * />
 * ```
 *
 * **When to use**:
 * - Simple confirmation dialogs that don't need loading states
 * - Quick yes/no confirmations
 * - Fire-and-forget actions where dialog closes immediately
 *
 * **When NOT to use**:
 * - Need to prevent dialog from closing during async operations
 * - Need to programmatically control open/close state
 * - Need loading indicators in the dialog
 * → Use `ConfirmDialog` (controlled mode) instead
 */
type SimpleConfirmDialogProps = {
  // Trigger element that opens the dialog
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

export function SimpleConfirmDialog({
  trigger,
  intent = 'warning',
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  destructive = false,
}: Readonly<SimpleConfirmDialogProps>): JSX.Element {
  // Get intent-driven defaults
  const intentColors = getDefaultColorsForIntent(intent)
  const finalIcon = getIconForIntent(intent)
  const finalConfirmColor = intentColors.confirm
  const finalCancelColor = getCancelButtonColor()
  const buttonClassName = 'w-full h-auto min-h-[3rem] px-4 whitespace-normal'

  const handleConfirm = (): void => {
    onConfirm?.()
    // Dialog.Close handles closing the dialog automatically
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={dialogOverlayVariants()} />

        <Dialog.Content
          role='alertdialog'
          aria-describedby={description ? 'dialog-description' : undefined}
          className={dialogContentVariants({ intent, size: 'md' })}
        >
          <div className='flex items-start gap-5'>
            <div
              aria-hidden='true'
              className={iconContainerVariants({ intent })}
              data-testid='simple-confirm-dialog-icon-container'
            >
              {renderIcon(finalIcon, {
                className: iconColorVariants({ intent }),
                'data-testid': 'simple-confirm-dialog-icon',
              })}
            </div>

            <div className='min-w-0 flex-1 pt-1'>
              <Dialog.Title
                className={cn(
                  'mb-2 font-semibold text-2xl leading-tight',
                  titleColorVariants({ intent }),
                )}
              >
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description
                  id='dialog-description'
                  className='text-base text-slate-600 leading-relaxed dark:text-slate-400'
                >
                  {description}
                </Dialog.Description>
              ) : null}

              <div className='mt-8 flex flex-col-reverse gap-3 sm:flex-row'>
                <div className='w-full sm:flex-1'>
                  <Dialog.Close asChild>
                    <ActionButton
                      variant='secondary'
                      color={finalCancelColor}
                      size='md'
                      className={buttonClassName}
                      aria-label={cancelLabel}
                      autoFocus={destructive}
                    >
                      {cancelLabel}
                    </ActionButton>
                  </Dialog.Close>
                </div>

                <div className='w-full sm:flex-1'>
                  <Dialog.Close asChild>
                    <ActionButton
                      variant='primary'
                      color={finalConfirmColor}
                      size='md'
                      onClick={handleConfirm}
                      className={buttonClassName}
                      aria-label={confirmLabel}
                      autoFocus={!destructive}
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
