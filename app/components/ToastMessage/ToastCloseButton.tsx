import type { JSX } from 'react'
import { useMemo } from 'react'
import { CloseIcon } from '~/components/icons'
import { type ToastType, toastCloseButtonVariants } from './toastMessage.variants'

// Icon size constants for consistency
const TOAST_CLOSE_ICON_SIZE = 16

export const ToastCloseButton = ({
  type,
  onClose,
}: Readonly<{
  type: ToastType
  onClose?: () => void
}>): JSX.Element => {
  const ariaLabel = useMemo((): string => {
    switch (type) {
      case 'success':
        return 'Close success notification'
      case 'error':
      case 'network':
      case 'permission':
      case 'server':
      case 'client':
      case 'unknown':
        return 'Close error notification'
      case 'info':
        return 'Close information notification'
      case 'warning':
      case 'validation':
        return 'Close warning notification'
      default:
        return 'Close notification'
    }
  }, [type])

  return (
    <button
      onClick={onClose}
      className={toastCloseButtonVariants()}
      type='button'
      aria-label={ariaLabel}
    >
      <CloseIcon className='h-4 w-4' size={TOAST_CLOSE_ICON_SIZE} />
    </button>
  )
}
