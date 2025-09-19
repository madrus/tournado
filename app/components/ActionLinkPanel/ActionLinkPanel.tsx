import { JSX, ReactNode } from 'react'
import { Link } from 'react-router'

import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'
import { getTypographyClasses } from '~/utils/rtlUtils'

import {
  actionLinkPanelVariants,
  panelBackgroundVariants,
} from './actionLinkPanel.variants'
import ErrorBoundary from './ErrorBoundary'
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
  className?: string
  testId?: string
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
  className,
  testId,
}: ActionLinkPanelProps): JSX.Element {
  const typographyClasses = getTypographyClasses(language)

  const panel = (
    <ErrorBoundary>
      <div
        className={cn(
          actionLinkPanelVariants({
            color: mainColor,
          }),
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={`${title} panel`}
        data-testid={testId}
      >
        {/* Stable background layer */}
        <PanelBackground
          backgroundColor={panelBackgroundVariants({ color: mainColor })}
          data-testid='panel-background'
        />

        {/* Base panel layer (normal flow) */}
        <PanelLayer
          title={title}
          description={description}
          icon={icon}
          iconColor={iconColor} // always pass ColorAccent, not a Tailwind class string
          mainColor={mainColor}
          hoverColor={hoverColor}
          textAlign={typographyClasses.textAlign}
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
            textAlign={typographyClasses.textAlign}
            data-testid='hover-panel-layer'
          >
            {children}
          </PanelLayer>
        ) : null}
      </div>
    </ErrorBoundary>
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
