import { JSX, ReactNode } from 'react'
import { Link } from 'react-router'

import { type ColorAccent } from '~/lib/lib.types'
import {
  getDescriptionClasses,
  getPanelClasses,
  getTitleClasses,
  resolveColorAccent,
} from '~/styles/panel.styles'
import { cn } from '~/utils/misc'
import { getLatinTitleClass, getTypographyClasses } from '~/utils/rtlUtils'

type ActionLinkPanelProps = {
  title: string
  description: string
  icon: JSX.Element
  mainColor: ColorAccent
  hoverColor?: ColorAccent
  iconColor: ColorAccent
  to?: string
  onClick?: () => void
  children?: ReactNode
  language: string
}

export function ActionLinkPanel({
  title,
  description,
  icon,
  mainColor,
  hoverColor,
  iconColor,
  to,
  onClick,
  children,
  language,
}: ActionLinkPanelProps): JSX.Element {
  const typographyClasses = getTypographyClasses(language)

  // Always use mainColor as base (no more state switching)
  const mainPanelClasses = getPanelClasses(mainColor)
  const mainTitleClasses = getTitleClasses(mainColor)
  const mainDescriptionClasses = getDescriptionClasses(mainColor)

  // Generate hover overlay classes if hoverColor is provided
  const hoverPanelClasses = hoverColor ? getPanelClasses(hoverColor) : null
  const hoverTitleClasses = hoverColor ? getTitleClasses(hoverColor) : null
  const hoverDescriptionClasses = hoverColor ? getDescriptionClasses(hoverColor) : null

  // Calculate hover icon color
  const getHoverIconColor = () => {
    if (!hoverColor) return `text-${iconColor}-300`
    return hoverColor === 'brand' ? 'text-red-600' : `text-${hoverColor}-300`
  }
  const hoverIconColor = getHoverIconColor()
  const hoverIconBorderColor = hoverIconColor.replace('text-', 'border-')

  // Generate border colors based on resolved colors
  const getBorderColor = (color: ColorAccent, prefix = 'border') => {
    const resolvedColor = resolveColorAccent(color)
    return `${prefix}-${resolvedColor}-400/60`
  }

  const mainBorderColor = getBorderColor(mainColor)
  const hoverBorderColor = hoverColor ? getBorderColor(hoverColor, 'hover:border') : ''

  const panel = (
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl border shadow-xl transition-colors duration-750 ease-in-out',
        mainBorderColor,
        hoverBorderColor
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${title} panel`}
    >
      {/* Base panel background and glow */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-750 ease-in-out',
          hoverColor ? 'group-hover:opacity-0' : '',
          mainPanelClasses.background
        )}
        data-testid='panel-background'
      >
        <div className={mainPanelClasses.glow} />
      </div>

      {/* Base content layer - defines the height and layout */}
      <div
        className={cn(
          'relative z-20 flex flex-col items-start space-y-4 p-6 break-words transition-opacity duration-750 ease-in-out',
          typographyClasses.textAlign,
          hoverColor ? 'group-hover:opacity-0' : ''
        )}
      >
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent',
            iconColor === 'brand' ? 'text-red-600' : `text-${iconColor}-300`,
            iconColor === 'brand' ? 'border-red-600' : `border-${iconColor}-300`
          )}
          aria-label='panel icon'
        >
          {icon}
        </div>
        <h3 className={cn(mainTitleClasses, getLatinTitleClass(language))}>{title}</h3>
        <p className={mainDescriptionClasses}>{description}</p>
        {children}
      </div>

      {/* Hover overlay panel - only if hoverColor exists */}
      {hoverColor && hoverPanelClasses ? (
        <div
          className={cn(
            'absolute inset-0 z-10 opacity-0 transition-opacity duration-750 ease-in-out group-hover:opacity-100'
          )}
        >
          {/* Hover background */}
          <div className={cn('absolute inset-0', hoverPanelClasses.background)}>
            <div className={hoverPanelClasses.glow} />
          </div>

          {/* Hover content */}
          <div
            className={cn(
              'relative z-20 flex flex-col items-start space-y-4 p-6 break-words',
              typographyClasses.textAlign
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent',
                hoverIconColor,
                hoverIconBorderColor
              )}
              aria-label='panel icon'
            >
              {icon}
            </div>
            <h3 className={cn(hoverTitleClasses, getLatinTitleClass(language))}>
              {title}
            </h3>
            <p className={hoverDescriptionClasses ?? ''}>{description}</p>
            {children}
          </div>
        </div>
      ) : null}
    </div>
  )

  if (to) {
    return (
      <Link to={to} className='block'>
        {panel}
      </Link>
    )
  }
  return panel
}
