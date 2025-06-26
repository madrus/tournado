import { JSX, ReactNode } from 'react'
import { Link } from 'react-router'

import { cn } from '~/utils/misc'
import { getLatinTitleClass, getTypographyClasses } from '~/utils/rtlUtils'

type ColorScheme = 'emerald' | 'blue' | 'gray' | 'red'

type AdminPanelProps = {
  title: string
  description: string
  icon: JSX.Element
  colorScheme: ColorScheme
  to?: string
  onClick?: () => void
  children?: ReactNode
  language: string
}

const colorClasses = {
  emerald: {
    border: 'border-emerald-600',
    hoverBorder: 'hover:border-emerald-300',
    hoverBg: 'hover:bg-emerald-50/30',
    focus: 'focus:ring-emerald-500',
    iconBorder: 'border-emerald-600',
    iconHoverBorder: 'group-hover:border-emerald-700',
    iconHoverBg: 'group-hover:bg-emerald-50',
    titleHover: 'group-hover:text-emerald-700',
    textHover: 'group-hover:text-emerald-600',
  },
  blue: {
    border: 'border-blue-600',
    hoverBorder: 'hover:border-blue-300',
    hoverBg: 'hover:bg-blue-50/30',
    focus: 'focus:ring-blue-500',
    iconBorder: 'border-blue-600',
    iconHoverBorder: 'group-hover:border-blue-700',
    iconHoverBg: 'group-hover:bg-blue-50',
    titleHover: 'group-hover:text-blue-700',
    textHover: 'group-hover:text-blue-600',
  },
  gray: {
    border: 'border-gray-600',
    hoverBorder: 'hover:border-gray-300',
    hoverBg: 'hover:bg-gray-50/30',
    focus: 'focus:ring-gray-500',
    iconBorder: 'border-gray-600',
    iconHoverBorder: 'group-hover:border-gray-700',
    iconHoverBg: 'group-hover:bg-gray-50',
    titleHover: 'group-hover:text-gray-700',
    textHover: 'group-hover:text-gray-600',
  },
  red: {
    border: 'border-red-600',
    hoverBorder: 'hover:border-red-300',
    hoverBg: 'hover:bg-red-50/30',
    focus: 'focus:ring-red-500',
    iconBorder: 'border-red-600',
    iconHoverBorder: 'group-hover:border-red-700',
    iconHoverBg: 'group-hover:bg-red-50',
    titleHover: 'group-hover:text-red-700',
    textHover: 'group-hover:text-red-600',
  },
}

export function AdminPanel({
  title,
  description,
  icon,
  colorScheme,
  to,
  onClick,
  children,
  language,
}: AdminPanelProps): JSX.Element {
  const typographyClasses = getTypographyClasses(language)
  const colors = colorClasses[colorScheme]

  const baseClassName = cn(
    'group rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md',
    colors.hoverBorder,
    colors.hoverBg
  )

  const content = (
    <div
      className={cn(
        'flex flex-col items-start space-y-4 break-words',
        typographyClasses.textAlign
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent transition-all',
          colors.iconBorder,
          colors.iconHoverBorder,
          colors.iconHoverBg
        )}
      >
        {icon}
      </div>
      <h3
        className={cn(
          'text-lg font-semibold break-words transition-colors',
          colors.titleHover,
          getLatinTitleClass(language)
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          'text-foreground-light break-words transition-colors',
          colors.textHover
        )}
      >
        {description}
      </p>
      {children}
    </div>
  )

  if (to) {
    return (
      <Link
        to={to}
        className={cn(
          baseClassName,
          colors.focus,
          'focus:ring-2 focus:ring-offset-2 focus:outline-none'
        )}
      >
        {content}
      </Link>
    )
  }

  return (
    <div className={cn(baseClassName, 'cursor-pointer')} onClick={onClick}>
      {content}
    </div>
  )
}
