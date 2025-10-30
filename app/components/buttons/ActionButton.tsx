import type { JSX, ReactNode } from 'react'

import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { type Permission } from '~/utils/rbac'

import { buttonVariants, type ButtonVariants } from './button.variants'
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
          color === 'cyan' && 'border-cyan-600/70',
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
  // Must use explicit class names for Tailwind JIT to detect them
  const darkModeClassMap: Record<string, string> = {
    brand: 'dark:bg-red-700 dark:border-red-700',
    primary: 'dark:bg-emerald-700 dark:border-emerald-700',
    emerald: 'dark:bg-emerald-700 dark:border-emerald-700',
    blue: 'dark:bg-blue-700 dark:border-blue-700',
    slate: 'dark:bg-slate-700 dark:border-slate-700',
    teal: 'dark:bg-teal-700 dark:border-teal-700',
    red: 'dark:bg-red-700 dark:border-red-700',
    cyan: 'dark:bg-cyan-700 dark:border-cyan-700',
    yellow: 'dark:bg-yellow-700 dark:border-yellow-700',
    green: 'dark:bg-green-700 dark:border-green-700',
    violet: 'dark:bg-violet-700 dark:border-violet-700',
    zinc: 'dark:bg-zinc-700 dark:border-zinc-700',
    orange: 'dark:bg-orange-700 dark:border-orange-700',
    amber: 'dark:bg-amber-700 dark:border-amber-700',
    lime: 'dark:bg-lime-700 dark:border-lime-700',
    sky: 'dark:bg-sky-700 dark:border-sky-700',
    indigo: 'dark:bg-indigo-700 dark:border-indigo-700',
    purple: 'dark:bg-purple-700 dark:border-purple-700',
    fuchsia: 'dark:bg-fuchsia-700 dark:border-fuchsia-700',
    pink: 'dark:bg-pink-700 dark:border-pink-700',
    rose: 'dark:bg-rose-700 dark:border-rose-700',
  }

  const darkModeClasses = darkerInDarkMode && color ? darkModeClassMap[color] || '' : ''

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
