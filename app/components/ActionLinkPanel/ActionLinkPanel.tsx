import { JSX, ReactNode } from 'react'
import { Link } from 'react-router'

import { type ColorAccent } from '~/lib/lib.types'
import { resolveColorAccent } from '~/styles/panel.styles'
import { cn } from '~/utils/misc'
import { getTypographyClasses } from '~/utils/rtlUtils'

import { PanelBackground } from './PanelBackground'
import { PanelLayer } from './PanelLayer'

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

  // Generate border colors based on resolved colors
  const getBorderColor = (color: ColorAccent, prefix = 'border') => {
    const resolvedColor = resolveColorAccent(color)
    return `${prefix}-${resolvedColor}-400`
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
      {/* Stable background layer */}
      <PanelBackground
        backgroundColor={`bg-panel-bg-${resolveColorAccent(mainColor)}`}
        data-testid='panel-background'
      />

      {/* Base panel layer (normal flow) */}
      <PanelLayer
        title={title}
        description={description}
        icon={icon}
        iconColor={iconColor} // always pass ColorAccent, not a Tailwind class string
        mainColor={mainColor}
        language={language}
        textAlign={typographyClasses.textAlign}
        className={cn(
          'relative z-20 transition-opacity duration-750 ease-in-out',
          hoverColor ? 'group-hover:opacity-0' : ''
        )}
        data-testid='main-panel-layer'
      >
        {children}
      </PanelLayer>

      {/* Hover overlay panel - absolutely positioned overlay */}
      {hoverColor ? (
        <PanelLayer
          title={title}
          description={description}
          icon={icon}
          iconColor={iconColor} // keep original iconColor for consistency
          mainColor={mainColor}
          hoverColor={hoverColor}
          isHover
          language={language}
          textAlign={typographyClasses.textAlign}
          className={cn(
            'absolute inset-0 z-30 opacity-0 transition-opacity duration-750 ease-in-out group-hover:opacity-100'
          )}
          data-testid='hover-panel-layer'
        >
          {children}
        </PanelLayer>
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

export default ActionLinkPanel
