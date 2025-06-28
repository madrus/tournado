import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionLink } from '~/components/PrefetchLink'
import {
  type ButtonColor,
  type ButtonVariant,
  getButtonClasses,
} from '~/styles/button.styles'
import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { isRTL } from '~/utils/rtlUtils'

type ActionLinkButtonProps = {
  to: string
  label: string
  icon: IconName
  variant?: ButtonVariant
  color?: ButtonColor
  className?: string
}

export function ActionLinkButton({
  to,
  label,
  icon,
  variant = 'primary',
  color = 'brand',
  className,
}: Readonly<ActionLinkButtonProps>): JSX.Element {
  const { i18n } = useTranslation()
  const rtl = isRTL(i18n.language)

  const iconElement = renderIcon(icon, {
    className: 'h-5 w-5',
  })

  const labelText = <span>{label}</span>

  const buttonClasses = cn(getButtonClasses(variant, color), className)

  return (
    <ActionLink to={to} className={buttonClasses} aria-label={label}>
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
