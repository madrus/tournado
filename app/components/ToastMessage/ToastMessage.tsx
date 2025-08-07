import type { JSX } from 'react'

import {
  CloseIcon,
  ExclamationIcon,
  InfoLetterIcon,
  SuccessIcon,
  WarningIcon,
} from '~/components/icons'
import { cn } from '~/utils/misc'

import {
  toastCloseButtonVariants,
  toastIconVariants,
  toastMessageVariants,
  type ToastType,
} from './toastMessage.variants'

type ToastMessageProps = {
  type: ToastType
  title: string
  description?: string
  onClose?: () => void
}

const ToastIcon = ({ type }: { type: ToastType }): JSX.Element => {
  const iconSize = 24

  switch (type) {
    case 'success':
      // Success icon gets white circle wrapper (non-shaped icon)
      return (
        <div className={toastIconVariants({ hasBackground: true })}>
          <SuccessIcon
            className='h-[18px] w-[18px] text-emerald-700'
            size={18}
            weight={600}
          />
        </div>
      )
    case 'error':
      return (
        <div className={toastIconVariants({ hasBackground: false })}>
          <ExclamationIcon
            className='h-6 w-6 text-red-700'
            size={iconSize}
            weight={600}
          />
        </div>
      )
    case 'info':
      return (
        <div className={toastIconVariants({ hasBackground: false })}>
          <InfoLetterIcon
            className='h-6 w-6 text-sky-400'
            size={iconSize}
            weight={600}
          />
        </div>
      )
    case 'warning':
      return (
        <div className={toastIconVariants({ hasBackground: false })}>
          <WarningIcon
            className='h-6 w-6 text-orange-700'
            size={iconSize}
            weight={600}
          />
        </div>
      )
  }
}

const ToastCloseButton = ({
  type,
  onClose,
}: {
  type: ToastType
  onClose?: () => void
}): JSX.Element => (
  <button
    onClick={onClose}
    className={toastCloseButtonVariants({ type })}
    aria-label='Close'
  >
    <CloseIcon className='h-4 w-4' size={16} />
  </button>
)

export const ToastMessage = ({
  type,
  title,
  description,
  onClose,
}: Readonly<ToastMessageProps>): JSX.Element => (
  <div className={toastMessageVariants({ type })}>
    <ToastIcon type={type} />
    <div className='min-w-0 flex-1'>
      <p className='font-medium'>{title}</p>
      {description ? (
        <p className={cn('mt-1 text-sm opacity-90')}>{description}</p>
      ) : null}
    </div>
    <ToastCloseButton type={type} onClose={onClose} />
  </div>
)
