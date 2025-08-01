import { JSX, ReactNode } from 'react'

import { Panel } from '~/components/Panel'
import { useLanguageSwitcher } from '~/hooks/useLanguageSwitcher'
import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

import {
  panelLayerOpacityVariants,
  panelLayerPositioningVariants,
} from './actionLinkPanel.variants'

export type PanelLayerProps = {
  title: string
  description: string
  icon: JSX.Element
  iconColor: ColorAccent
  mainColor: ColorAccent
  hoverColor?: ColorAccent
  isHover?: boolean
  textAlign: string
  children?: ReactNode
  className?: string
  'data-testid'?: string
}

export function PanelLayer({
  title,
  description,
  icon,
  iconColor,
  mainColor,
  hoverColor,
  isHover = false,
  textAlign,
  children,
  className,
  'data-testid': testId,
}: Readonly<PanelLayerProps>): JSX.Element {
  const { currentLanguage } = useLanguageSwitcher()

  // Determine which color to use for the panel
  const effectiveColor = isHover && hoverColor ? hoverColor : mainColor

  // For hover layers, change icon to the hover color (so brand hover makes icon red)
  // Pass iconColor directly to Panel component since it handles ColorAccent properly
  const effectiveIconColor = isHover && hoverColor ? hoverColor : iconColor

  // For childrenIconColor, use the original iconColor (Panel will handle the fallback)
  const effectiveChildrenIconColor = iconColor

  // Apply positioning based on hover state
  const positioningClasses = panelLayerPositioningVariants({
    isHover,
  })

  const opacityClasses = panelLayerOpacityVariants({
    isHover,
    isBaseLayerWithHoverColor: !isHover && !!hoverColor,
  })

  return (
    <div
      className={cn(positioningClasses, opacityClasses, className)}
      data-testid={testId ? `${testId}-wrapper` : undefined}
    >
      <Panel
        color={effectiveColor}
        variant='content'
        title={title}
        subtitle={description}
        icon={icon}
        iconColor={effectiveIconColor}
        childrenIconColor={effectiveChildrenIconColor}
        showGlow
        isHover={isHover}
        className={cn(
          textAlign,
          getLatinTitleClass(currentLanguage),
          className,
          'flex-grow',
          'h-full'
        )}
        data-testid={testId}
      >
        {children ? (
          <div className={`action-panel-${effectiveChildrenIconColor}`}>{children}</div>
        ) : null}
      </Panel>
    </div>
  )
}
