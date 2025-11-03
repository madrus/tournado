import type { JSX, ReactNode } from 'react'

import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { type Permission } from '~/utils/rbac'

import {
  buttonVariants,
  type ButtonVariants,
  DARK_MODE_DARKER_CLASSES,
} from './button.variants'
import { useActionButton } from './useActionButton'

type ActionButtonProps = {
  onClick?: () => void
  children: ReactNode
  icon?: IconName
  variant?: ButtonVariants['variant']
  color?: ButtonVariants['color']
  size?: ButtonVariants['size']
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
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
  /**
   * Whether to use darker background in dark mode for better contrast (default: false)
   * When true, uses -800 weight instead of default -600 for backgrounds
   */
  darkerInDarkMode?: boolean
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
  'data-testid': testId,
  permission,
  hideWhenDisabled = false,
  darkerInDarkMode = false,
}: Readonly<ActionButtonProps>): JSX.Element | null {
  const { isHidden, isDisabled } = useActionButton({
    permission,
    hideWhenDisabled,
    disabled,
  })

  // Hide button if user lacks permission and hideWhenDisabled is true
  if (isHidden) {
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
          'icon-spacing flex items-center justify-center rounded-full border-2 bg-transparent',
          size === 'sm' ? 'h-5 w-5' : 'h-6 w-6',
          color === 'brand' && 'border-brand-600/70',
          color === 'primary' && 'border-primary-600/70',
          color === 'emerald' && 'border-emerald-600/70',
          color === 'blue' && 'border-blue-600/70',
          color === 'slate' && 'border-slate-600/70',
          color === 'teal' && 'border-teal-600/70',
          color === 'red' && 'border-red-600/70',
          color === 'yellow' && 'border-yellow-600/70',
          color === 'green' && 'border-green-600/70',
          color === 'violet' && 'border-violet-600/70',
          color === 'zinc' && 'border-zinc-600/70',
          color === 'orange' && 'border-orange-600/70',
          color === 'amber' && 'border-amber-600/70',
          color === 'lime' && 'border-lime-600/70',
          color === 'sky' && 'border-sky-600/70',
          color === 'indigo' && 'border-indigo-600/70',
          color === 'purple' && 'border-purple-600/70',
          color === 'fuchsia' && 'border-fuchsia-600/70',
          color === 'pink' && 'border-pink-600/70',
          color === 'rose' && 'border-rose-600/70'
        )}
        aria-hidden='true'
      >
        {rawIcon}
      </span>
    ) : (
      <span className='icon-spacing' aria-hidden='true'>
        {rawIcon}
      </span>
    )
  ) : null

  // Apply darker background in dark mode if requested
  // Uses shared constant from button.variants.ts for consistency
  const darkModeClasses =
    darkerInDarkMode && color ? DARK_MODE_DARKER_CLASSES[color] || '' : ''

  const buttonClasses = cn(
    buttonVariants({ variant, color, size }),
    darkModeClasses,
    className
  )

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={buttonClasses}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      data-testid={testId}
    >
      {iconElement}
      {children}
    </button>
  )
}
