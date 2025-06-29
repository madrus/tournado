import { JSX, ReactNode } from 'react'
import { Link } from 'react-router'

import { type ColorAccent } from '~/lib/lib.types'
import {
  getDescriptionClasses,
  getPanelClasses,
  getTitleClasses,
} from '~/styles/panel.styles'
import { cn } from '~/utils/misc'
import { getLatinTitleClass, getTypographyClasses } from '~/utils/rtlUtils'

type ActionLinkPanelProps = {
  title: string
  description: string
  icon: JSX.Element
  mainColor: ColorAccent
  hoverColor?: ColorAccent
  iconColor: string
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
    if (!hoverColor) return iconColor
    return hoverColor === 'brand' ? 'text-red-600' : `text-${hoverColor}-300`
  }
  const hoverIconColor = getHoverIconColor()
  const hoverIconBorderColor = hoverIconColor.replace('text-', 'border-')

  const panel = (
    <div className='group relative' onClick={onClick}>
      {/* Base panel - always mainColor */}
      <div className={mainPanelClasses.base}>
        {/* Base glow */}
        <div className={mainPanelClasses.glow} />

        {/* Base content */}
        <div
          className={cn(
            'relative z-10 flex flex-col items-start space-y-4 break-words',
            typographyClasses.textAlign
          )}
        >
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent transition-all duration-750 ease-in-out',
              iconColor,
              iconColor.replace('text-', 'border-')
            )}
          >
            {icon}
          </div>
          <h3 className={cn(mainTitleClasses, getLatinTitleClass(language))}>
            {title}
          </h3>
          <p className={mainDescriptionClasses}>{description}</p>
          {children}
        </div>
      </div>

      {/* Hover overlay panel - only if hoverColor exists */}
      {hoverColor && hoverPanelClasses ? (
        <div
          className={cn(
            hoverPanelClasses.base,
            'absolute inset-0 opacity-0 transition-opacity duration-750 ease-in-out group-hover:opacity-100'
          )}
        >
          {/* Hover glow */}
          <div className={hoverPanelClasses.glow} />

          {/* Hover content */}
          <div
            className={cn(
              'relative z-10 flex flex-col items-start space-y-4 break-words',
              typographyClasses.textAlign
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent',
                hoverIconColor,
                hoverIconBorderColor
              )}
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
