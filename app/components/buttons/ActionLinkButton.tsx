import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionLink } from '~/components/PrefetchLink'
import {
  commonButtonClasses,
  type LinkButtonVariant,
  linkButtonVariantClasses,
} from '~/styles/button.styles'
import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { getChipClasses, isRTL } from '~/utils/rtlUtils'

type ActionLinkButtonProps = {
  to: string
  label: string
  icon: IconName
  variant?: LinkButtonVariant
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
    'inline-flex items-center justify-center rounded-lg border-0 py-2.5 text-sm font-semibold min-h-12',
    'ps-4 pe-4 transition-all duration-300 ease-out relative overflow-hidden',
    'hover:scale-103 active:scale-95',
    'focus:ring-2 focus:ring-offset-2 focus:outline-none',
    'before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-r before:-z-10'
  )

  return (
    <ActionLink
      to={to}
      className={cn(
        baseClasses,
        commonButtonClasses,
        linkButtonVariantClasses[variant],
        className
      )}
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
