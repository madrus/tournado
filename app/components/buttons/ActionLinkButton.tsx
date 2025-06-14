import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionLink } from '~/components/PrefetchLink'
import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { getChipClasses, isRTL } from '~/utils/rtlUtils'

type ActionLinkButtonProps = {
  to: string
  label: string
  icon: IconName
  variant?: 'primary' | 'secondary' | 'emerald'
  className?: string
}

export function ActionLinkButton({
  to,
  label,
  icon,
  variant = 'primary',
  className,
}: Readonly<ActionLinkButtonProps>): JSX.Element {
  const { i18n } = useTranslation()
  const rtl = isRTL(i18n.language)
  const chipClasses = getChipClasses(i18n.language)

  const iconElement = renderIcon(icon, {
    className: 'h-5 w-5',
  })

  const labelText = <span>{label}</span>

  const baseClasses = cn(
    chipClasses.container,
    'inline-flex items-center justify-center rounded-md border py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none',
    'ps-4 pe-4',
    // 3D button effects
    'shadow-lg transform transition-all duration-150 ease-in-out',
    'hover:shadow-lg hover:-translate-y-0.5',
    'active:shadow-md active:translate-y-0 active:scale-95',
    'focus:ring-4'
  )

  const variantClasses = {
    primary:
      'bg-brand hover:bg-brand-dark focus:ring-brand border-transparent text-white shadow-brand/30 hover:shadow-brand/40',
    secondary:
      'border-gray-300 bg-white text-gray-700 hover:bg-gray-50/30 focus:ring-gray-500 shadow-gray-300/50 hover:shadow-gray-400/60',
    emerald:
      'bg-emerald-600 hover:bg-emerald-500/90 focus:ring-emerald-600 border-transparent text-white shadow-emerald-500/40 hover:shadow-emerald-400/50',
  }

  return (
    <ActionLink
      to={to}
      className={cn(baseClasses, variantClasses[variant], className)}
      aria-label={label}
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
