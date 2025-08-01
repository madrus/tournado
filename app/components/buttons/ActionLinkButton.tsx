import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionLink } from '~/components/PrefetchLink'
import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { canAccess, type Permission } from '~/utils/rbac'
import { useUser } from '~/utils/routeUtils'
import { isRTL } from '~/utils/rtlUtils'

import { buttonVariants, type ButtonVariants } from './button.variants'

type ActionLinkButtonProps = {
  to: string
  label: string
  icon: IconName
  variant?: ButtonVariants['variant']
  color?: ButtonVariants['color']
  size?: ButtonVariants['size']
  className?: string
  'data-testid'?: string
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

export function ActionLinkButton({
  to,
  label,
  icon,
  variant = 'primary',
  color = 'brand',
  size = 'md',
  className,
  'data-testid': testId,
  permission,
  hideWhenDisabled = false,
}: Readonly<ActionLinkButtonProps>): JSX.Element | null {
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

  const iconElement = renderIcon(icon, {
    className: size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
  })

  const labelText = <span>{label}</span>

  // Disable button if user lacks permission
  const isDisabled = permission && !hasRequiredPermission
  const buttonClasses = cn(
    buttonVariants({ variant, color, size }),
    isDisabled && 'pointer-events-none', // Only add pointer-events-none, other disabled styles handled by buttonVariants
    className
  )

  // Render as button when disabled for better UX and semantics
  if (isDisabled) {
    return (
      <button
        type='button'
        className={buttonClasses}
        aria-label={label}
        aria-disabled={true}
        disabled={true}
        data-testid={testId}
      >
        {rtl ? (
          <>
            {labelText}
            {iconElement}
          </>
        ) : (
          <>
            {iconElement}
            {labelText}
          </>
        )}
      </button>
    )
  }

  // Render as link when enabled
  return (
    <ActionLink
      to={to}
      className={buttonClasses}
      aria-label={label}
      data-testid={testId}
    >
      {rtl ? (
        <>
          {labelText}
          {iconElement}
        </>
      ) : (
        <>
          {iconElement}
          {labelText}
        </>
      )}
    </ActionLink>
  )
}
