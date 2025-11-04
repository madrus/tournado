import { type JSX, type ReactNode } from 'react'

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

/**
 * Wrapper component that conditionally wraps children in Dialog.Close
 * Only wraps when shouldAutoClose is true (for cancel button in controlled mode)
 * Confirm button should NOT be wrapped so parent can close dialog after async operation
 */
const DialogCloseWrapper = ({
  shouldAutoClose,
  children,
}: {
  shouldAutoClose: boolean
  children: ReactNode
}): JSX.Element =>
  shouldAutoClose ? <Dialog.Close asChild>{children}</Dialog.Close> : <>{children}</>

/**
 * ConfirmDialog - Fully controlled confirmation dialog component
 *
 * This component operates in **controlled mode only**:
 * - Parent component manages dialog state via `open` and `onOpenChange`
 * - Supports loading states via `isLoading` to prevent premature closure
 * - Parent must provide trigger button separately
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false)
 * const [loading, setLoading] = useState(false)
 *
 * const handleConfirm = async () => {
 *   setLoading(true)
 *   await performAsyncOperation()
 *   setLoading(false)
 *   setOpen(false) // Close after completion
 * }
 *
 * <>
 *   <Button onClick={() => setOpen(true)}>Delete</Button>
 *   <ConfirmDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     intent="danger"
 *     title="Delete item"
 *     description="This action cannot be undone."
 *     confirmLabel="Yes, delete"
 *     cancelLabel="Cancel"
 *     onConfirm={handleConfirm}
 *     destructive
 *     isLoading={loading}
 *   />
 * </>
 * ```
 *
 * **When to use**:
 * - Need to prevent dialog from closing during async operations
 * - Need programmatic control over dialog open/close
 * - Need loading indicators in the dialog
 *
 * **When NOT to use**:
 * - Simple confirmations without async operations
 * → Use `SimpleConfirmDialog` (uncontrolled) instead
 */
type ConfirmDialogProps = {
  // Required controlled mode props
  open: boolean
  onOpenChange: (open: boolean) => void

  // Content
  title: string
  description?: string
  intent?: DialogIntent

  // Button labels
  confirmLabel: string
  cancelLabel: string

  // Actions and behavior
  onConfirm?: () => void
  destructive?: boolean
  isLoading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  intent = 'warning',
  confirmLabel,
  cancelLabel,
  onConfirm,
  destructive = false,
  isLoading = false,
}: Readonly<ConfirmDialogProps>): JSX.Element {
  // Get intent-driven defaults
  const intentColors = getDefaultColorsForIntent(intent)
  const finalIcon = getIconForIntent(intent)
  const finalConfirmColor = intentColors.confirm
  const finalCancelColor = 'brand'
  const sharedButtonClasses = 'w-full sm:w-auto h-12 px-6'

  const handleConfirm = (): void => {
    onConfirm?.()
    // Parent is responsible for calling onOpenChange(false) when async operation completes
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
              data-testid='confirm-dialog-icon-container'
            >
              {renderIcon(finalIcon, {
                className: iconColorVariants({ intent }),
                'data-testid': 'confirm-dialog-icon',
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
                <div className='sm:order-1'>
                  <DialogCloseWrapper shouldAutoClose={true}>
                    <ActionButton
                      variant='secondary'
                      color={finalCancelColor}
                      size='md'
                      className={sharedButtonClasses}
                      aria-label={cancelLabel}
                      autoFocus={destructive}
                      disabled={isLoading}
                    >
                      {cancelLabel}
                    </ActionButton>
                  </DialogCloseWrapper>
                </div>

                <div className='sm:order-2'>
                  <ActionButton
                    variant='primary'
                    color={finalConfirmColor}
                    size='md'
                    onClick={handleConfirm}
                    className={sharedButtonClasses}
                    aria-label={confirmLabel}
                    autoFocus={!destructive}
                    disabled={isLoading}
                  >
                    {confirmLabel}
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
