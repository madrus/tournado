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
          className={toastIconVariants({ hasBackground: true })}
          aria-hidden='true'
          data-testid='success-wrapper'
        >
          <SuccessIcon
            className='h-[18px] w-[18px] text-emerald-700'
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
          className={toastIconVariants({ hasBackground: false })}
          aria-hidden='true'
          data-testid='error-wrapper'
        >
          <ExclamationIcon
            className='h-6 w-6 text-red-700'
            size={TOAST_ICON_SIZE}
            weight={600}
          />
        </div>
      )
    case 'info':
      return (
        <div
          className={toastIconVariants({ hasBackground: false })}
          aria-hidden='true'
          data-testid='info-wrapper'
        >
          <InfoLetterIcon
            className='h-6 w-6 text-sky-400'
            size={TOAST_ICON_SIZE}
            weight={600}
          />
        </div>
      )
    case 'warning':
    case 'validation':
      return (
        <div
          className={toastIconVariants({ hasBackground: false })}
          aria-hidden='true'
          data-testid='warning-wrapper'
        >
          <WarningIcon
            className='h-6 w-6 text-orange-700'
            size={TOAST_ICON_SIZE}
            weight={600}
          />
        </div>
      )
  }
}
