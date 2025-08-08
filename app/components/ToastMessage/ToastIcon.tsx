import type { JSX } from 'react'

import {
  ExclamationIcon,
  InfoLetterIcon,
  SuccessIcon,
  WarningIcon,
} from '~/components/icons'
import type { IconProps as AppIconProps } from '~/lib/lib.types'

import { toastIconVariants, type ToastType } from './toastMessage.variants'

// Base types used for icon mapping
type BaseToastType = 'success' | 'error' | 'info' | 'warning'

// Type for the ICONS mapping values (second type parameter)
type ToastIconConfig = {
  Icon: (props: AppIconProps) => JSX.Element
  iconTestId: string
  wrapperTestId: string
  iconClass: string
  size: number
  weight: number
  wrapperHasBackground: boolean
}

// Icon size constants for consistency
const TOAST_ICON_SIZE = 24
const TOAST_SUCCESS_ICON_SIZE = 18

// Normalize all extended toast types to base types for rendering
const normalizeType = (type: ToastType): BaseToastType => {
  if (type === 'success' || type === 'info') return type
  if (type === 'warning' || type === 'validation') return 'warning'
  // error-like aliases
  return 'error'
}

const ICONS: Record<BaseToastType, ToastIconConfig> = {
  success: {
    Icon: SuccessIcon,
    iconTestId: 'success-icon',
    wrapperTestId: 'success-wrapper',
    iconClass: 'h-4 w-4',
    size: TOAST_SUCCESS_ICON_SIZE,
    weight: 600,
    wrapperHasBackground: true,
  },
  error: {
    Icon: ExclamationIcon,
    iconTestId: 'error-icon',
    wrapperTestId: 'error-wrapper',
    iconClass: 'h-6 w-6',
    size: TOAST_ICON_SIZE,
    weight: 600,
    wrapperHasBackground: false,
  },
  info: {
    Icon: InfoLetterIcon,
    iconTestId: 'info-icon',
    wrapperTestId: 'info-wrapper',
    iconClass: 'h-6 w-6',
    size: TOAST_ICON_SIZE,
    weight: 600,
    wrapperHasBackground: false,
  },
  warning: {
    Icon: WarningIcon,
    iconTestId: 'warning-icon',
    wrapperTestId: 'warning-wrapper',
    iconClass: 'h-6 w-6',
    size: TOAST_ICON_SIZE,
    weight: 600,
    wrapperHasBackground: false,
  },
}

export const ToastIcon = ({ type }: Readonly<{ type: ToastType }>): JSX.Element => {
  const base = normalizeType(type)
  const cfg = ICONS[base]

  return (
    <div
      className={toastIconVariants({ hasBackground: cfg.wrapperHasBackground, type })}
      aria-hidden='true'
      data-testid={cfg.wrapperTestId}
    >
      <cfg.Icon
        data-testid={cfg.iconTestId}
        className={cfg.iconClass}
        size={cfg.size as AppIconProps['size']}
        weight={cfg.weight as AppIconProps['weight']}
      />
    </div>
  )
}
