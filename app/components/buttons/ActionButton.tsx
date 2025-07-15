import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { isRTL } from '~/utils/rtlUtils'

import { buttonVariants, type ButtonVariants } from './button.variants'

type ActionButtonProps = {
  onClick?: () => void
  children: React.ReactNode
  icon?: IconName
  variant?: ButtonVariants['variant']
  color?: ButtonVariants['color']
  size?: ButtonVariants['size']
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
  color = 'brand',
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
        'data-testid': 'action-button-icon',
      })
    : null

  const buttonClasses = cn(buttonVariants({ variant, color, size }), className)

  return (
    <button
      type={type}
      role='button'
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
