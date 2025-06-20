import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import {
  type ButtonColor,
  type ButtonVariant,
  buttonVariantClasses,
  commonButtonClasses,
} from '~/styles/button.styles'
import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { isRTL } from '~/utils/rtlUtils'

type ActionButtonProps = {
  onClick?: () => void
  children: React.ReactNode
  icon?: IconName
  variant?: ButtonVariant
  color?: ButtonColor
  size?: 'sm' | 'md'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

export function ActionButton({
  onClick,
  children,
  icon,
  variant = 'outline',
  color = 'red',
  size = 'md',
  type = 'button',
  disabled = false,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: Readonly<ActionButtonProps>): JSX.Element {
  const { i18n } = useTranslation()
  const rtl = isRTL(i18n.language)

  const iconElement = icon
    ? renderIcon(icon, {
        className: size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
      })
    : null

  const baseClasses = cn(
    // Only use flex direction from chipClasses, not the padding
    rtl ? 'flex-row-reverse' : 'flex-row',
    'inline-flex items-center justify-center rounded-lg font-semibold gap-2 min-h-12',
    'relative overflow-hidden transition-all duration-300 ease-out',
    'hover:scale-103 active:scale-95',
    'focus:ring-2 focus:ring-offset-2 focus:outline-none',
    'whitespace-nowrap',
    size === 'sm' ? 'py-2 px-3 text-sm' : 'py-2.5 px-4 text-sm',
    disabled && 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100'
  )

  return (
    <button
      type={type}
      onClick={disabled ? void 0 : onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        commonButtonClasses,
        buttonVariantClasses[variant][color],
        className
      )}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {rtl ? (
        <>
          {children}
          {iconElement}
        </>
      ) : (
        <>
          {iconElement}
          {children}
        </>
      )}
    </button>
  )
}
