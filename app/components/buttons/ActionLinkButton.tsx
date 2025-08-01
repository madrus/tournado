import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionLink } from '~/components/PrefetchLink'
import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { canAccess, type Permission } from '~/utils/rbac'
import { isRTL } from '~/utils/rtlUtils'
import { useOptionalUser } from '~/utils/utils'

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

  // Get current user and check permissions
  let user = null
  try {
    user = useOptionalUser()
  } catch (_error) {
    // Fallback for test environments or when router context is not available
    user = null
  }

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
    isDisabled && 'pointer-events-none opacity-50 cursor-not-allowed',
    className
  )

  return (
    <ActionLink
      to={isDisabled ? '#' : to}
      className={buttonClasses}
      aria-label={label}
      aria-disabled={isDisabled}
      data-testid={testId}
      onClick={isDisabled ? event => event.preventDefault() : undefined}
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
