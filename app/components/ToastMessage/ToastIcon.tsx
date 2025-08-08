import type { JSX } from 'react'

import { ExclamationMarkIcon, InfoLetterIcon, SuccessIcon } from '~/components/icons'
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

// Normalize all extended toast types to base types for rendering - optimized mapping
const TYPE_MAPPING: Record<ToastType, BaseToastType> = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  validation: 'warning',
  error: 'error',
  network: 'error',
  permission: 'error',
  server: 'error',
  client: 'error',
  unknown: 'error',
} as const

const normalizeType = (type: ToastType): BaseToastType => TYPE_MAPPING[type]

const ICONS: Record<BaseToastType, ToastIconConfig> = {
  success: {
    Icon: SuccessIcon,
    iconTestId: 'success-icon',
    wrapperTestId: 'success-wrapper',
    iconClass: 'h-4 w-4 text-emerald-800/60',
    size: TOAST_SUCCESS_ICON_SIZE,
    weight: 600,
    wrapperHasBackground: true,
  },
  error: {
    Icon: ExclamationMarkIcon,
    iconTestId: 'error-icon',
    wrapperTestId: 'error-wrapper',
    iconClass: 'h-6 w-6 text-red-800/50',
    size: TOAST_ICON_SIZE,
    weight: 600,
    wrapperHasBackground: true,
  },
  info: {
    Icon: InfoLetterIcon,
    iconTestId: 'info-icon',
    wrapperTestId: 'info-wrapper',
    iconClass: 'h-6 w-6 text-sky-800/60',
    size: TOAST_ICON_SIZE,
    weight: 600,
    wrapperHasBackground: true,
  },
  warning: {
    Icon: ExclamationMarkIcon,
    iconTestId: 'warning-icon',
    wrapperTestId: 'warning-wrapper',
    iconClass: 'h-6 w-6 text-orange-800/50',
    size: TOAST_ICON_SIZE,
    weight: 600,
    wrapperHasBackground: true,
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
