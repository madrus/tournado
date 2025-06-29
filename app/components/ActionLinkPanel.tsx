import { JSX, ReactNode, useState } from 'react'
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
  const [isHovered, setIsHovered] = useState<boolean>(false)

  const typographyClasses = getTypographyClasses(language)

  // Calculate current effective color scheme based on hover state
  const currentColor = isHovered && hoverColor ? hoverColor : mainColor

  // Calculate current icon color based on hover state and hoverColor
  const getHoverIconColor = () => {
    if (!hoverColor) return 'text-emerald-300'
    return hoverColor === 'brand' ? 'text-red-600' : `text-${hoverColor}-300`
  }

  const currentIconColor = isHovered ? getHoverIconColor() : iconColor

  // Calculate icon border color to match icon text color
  const getIconBorderColor = (iconTextColor: string) =>
    iconTextColor.replace('text-', 'border-')

  const currentIconBorderColor = getIconBorderColor(currentIconColor)

  const panelClasses = getPanelClasses(currentColor)
  const titleClasses = getTitleClasses(currentColor)
  const descriptionClasses = getDescriptionClasses(currentColor)

  const handleMouseEnter = () => {
    if (hoverColor) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const content = (
    <div
      className={cn(
        'relative z-10 flex flex-col items-start space-y-4 break-words',
        typographyClasses.textAlign
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-1000 ease-in-out',
          currentIconColor,
          currentIconBorderColor,
          'bg-transparent'
        )}
      >
        {icon}
      </div>
      <h3 className={cn(titleClasses, getLatinTitleClass(language))}>{title}</h3>
      <p className={descriptionClasses}>{description}</p>
      {children}
    </div>
  )

  const panel = (
    <div
      className={panelClasses.base}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Glow in the top-right corner */}
      <div className={panelClasses.glow} />
      {content}
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
