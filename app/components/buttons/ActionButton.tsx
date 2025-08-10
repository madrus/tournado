import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { canAccess, type Permission } from '~/utils/rbac'
import { useUser } from '~/utils/routeUtils'
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
  /**
   * Required permission to access this action.
   * If provided, the button will be disabled if user lacks this permission.
   */
  permission?: Permission
  /**
   * Whether to hide the button entirely when user lacks permission (default: false)
   * If false, the button will be disabled but visible
   */
  hideWhenDisabled?: boolean
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
  permission,
  hideWhenDisabled = false,
}: Readonly<ActionButtonProps>): JSX.Element | null {
  const { i18n } = useTranslation()
  const rtl = isRTL(i18n.language)

  // Get current user with fallback handling
  const user = useUser()

  // Check if user has required permission
  const hasRequiredPermission = permission ? canAccess(user, permission) : true

  // Hide button if user lacks permission and hideWhenDisabled is true
  if (permission && !hasRequiredPermission && hideWhenDisabled) {
    return null
  }

  // Determine if the icon should be wrapped in a circle with colored border (transparent fill)
  const iconNeedsCircle =
    icon === 'exclamation_mark' || icon === 'info_letter' || icon === 'check'

  const rawIcon = icon
    ? renderIcon(icon, {
        className: cn(
          iconNeedsCircle ? 'h-[18px] w-[18px]' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
        ),
        weight: iconNeedsCircle ? 600 : undefined,
        'data-testid': 'action-button-icon',
      })
    : null

  const iconElement = rawIcon ? (
    iconNeedsCircle ? (
      <span
        className={cn(
          'me-1.5 flex items-center justify-center rounded-full border-2 bg-transparent',
          size === 'sm' ? 'h-5 w-5' : 'h-6 w-6',
          color === 'emerald' && 'border-emerald-600/70',
          color === 'red' && 'border-red-600/70',
          color === 'yellow' && 'border-yellow-600/70',
          color === 'cyan' && 'border-cyan-600/70',
          color === 'green' && 'border-green-600/70',
          color === 'teal' && 'border-teal-600/70',
          color === 'violet' && 'border-violet-600/70',
          color === 'slate' && 'border-slate-600/70',
          color === 'primary' && 'border-primary-600/70',
          color === 'brand' && 'border-brand-600/70'
        )}
        aria-hidden='true'
      >
        {rawIcon}
      </span>
    ) : (
      <span className='me-1.5' aria-hidden='true'>
        {rawIcon}
      </span>
    )
  ) : null

  // Combine permission-based disabled state with explicit disabled prop
  const isDisabled = disabled || (permission && !hasRequiredPermission)
  const buttonClasses = cn(buttonVariants({ variant, color, size }), className)

  return (
    <button
      type={type}
      role='button'
      onClick={isDisabled ? void 0 : onClick}
      disabled={isDisabled}
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
