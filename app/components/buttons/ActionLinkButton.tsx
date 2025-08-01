import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionLink } from '~/components/PrefetchLink'
import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
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
}: Readonly<ActionLinkButtonProps>): JSX.Element {
  const { i18n } = useTranslation()
  const rtl = isRTL(i18n.language)

  const iconElement = renderIcon(icon, {
    className: size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
  })

  const labelText = <span>{label}</span>

  const buttonClasses = cn(buttonVariants({ variant, color, size }), className)

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
