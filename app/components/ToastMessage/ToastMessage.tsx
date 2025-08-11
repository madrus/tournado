import { type JSX, useMemo } from 'react'

import { cn } from '~/utils/misc'

import { ToastCloseButton } from './ToastCloseButton'
import { ToastIcon } from './ToastIcon'
import { toastMessageVariants, type ToastType } from './toastMessage.variants'

type ToastMessageProps = {
  type: ToastType
  title: string
  description?: string
  onClose?: () => void
}

export const ToastMessage = ({
  type,
  title,
  description,
  onClose,
}: Readonly<ToastMessageProps>): JSX.Element => {
  const role = useMemo((): string => {
    switch (type) {
      case 'success':
        return 'status'
      case 'error':
      case 'network':
      case 'permission':
      case 'server':
      case 'client':
      case 'unknown':
        return 'alert'
      case 'info':
        return 'status'
      case 'warning':
      case 'validation':
        return 'alert'
      default:
        return 'status'
    }
  }, [type])

  const ariaLive = useMemo((): 'polite' | 'assertive' => {
    switch (type) {
      case 'error':
      case 'network':
      case 'permission':
      case 'server':
      case 'client':
      case 'unknown':
      case 'warning':
      case 'validation':
        return 'assertive'
      case 'success':
      case 'info':
        return 'polite'
      default:
        return 'polite'
    }
  }, [type])

  return (
    <div
      className={toastMessageVariants({ type })}
      role={role}
      aria-live={ariaLive}
      aria-atomic='true'
    >
      <ToastIcon type={type} />
      <div className='min-w-0 flex-1'>
        <p className='font-medium'>{title}</p>
        {description ? <p className={cn('mt-1 text-sm')}>{description}</p> : null}
      </div>
      <ToastCloseButton type={type} onClose={onClose} />
    </div>
  )
}
