import type { JSX } from 'react'

import {
  ExclamationIcon,
  InfoLetterIcon,
  SuccessIcon,
  WarningIcon,
} from '~/components/icons'

import { toastIconVariants, type ToastType } from './toastMessage.variants'

// Icon size constants for consistency
const TOAST_ICON_SIZE = 24
const TOAST_SUCCESS_ICON_SIZE = 18

export const ToastIcon = ({ type }: Readonly<{ type: ToastType }>): JSX.Element => {
  switch (type) {
    case 'success':
      // Success icon gets white circle wrapper (non-shaped icon)
      return (
        <div
          className={toastIconVariants({ hasBackground: true, type })}
          aria-hidden='true'
          data-testid='success-wrapper'
        >
          <SuccessIcon
            className='h-4 w-4'
            size={TOAST_SUCCESS_ICON_SIZE}
            weight={600}
          />
        </div>
      )
    case 'error':
    case 'network':
    case 'permission':
    case 'server':
    case 'client':
    case 'unknown':
      return (
        <div
          className={toastIconVariants({ hasBackground: false, type })}
          aria-hidden='true'
          data-testid='error-wrapper'
        >
          <ExclamationIcon className='h-6 w-6' size={TOAST_ICON_SIZE} weight={600} />
        </div>
      )
    case 'info':
      return (
        <div
          className={toastIconVariants({ hasBackground: false, type })}
          aria-hidden='true'
          data-testid='info-wrapper'
        >
          <InfoLetterIcon className='h-6 w-6' size={TOAST_ICON_SIZE} weight={600} />
        </div>
      )
    case 'warning':
    case 'validation':
      return (
        <div
          className={toastIconVariants({ hasBackground: false, type })}
          aria-hidden='true'
          data-testid='warning-wrapper'
        >
          <WarningIcon className='h-6 w-6' size={TOAST_ICON_SIZE} weight={600} />
        </div>
      )
  }
}
