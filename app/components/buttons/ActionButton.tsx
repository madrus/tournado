import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import {
  type ButtonColor,
  type ButtonVariant,
  getButtonClasses,
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
  variant = 'primary',
  color = 'emerald',
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

  const buttonClasses = cn(
    getButtonClasses(variant, color),
    size === 'sm' && 'min-h-10 min-w-24 py-2 px-3 text-xs',
    className
  )

  return (
    <button
      type={type}
      onClick={disabled ? void 0 : onClick}
      disabled={disabled}
      className={buttonClasses}
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
