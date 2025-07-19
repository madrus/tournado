import { JSX, ReactNode } from 'react'

import { Panel } from '~/components/Panel'
import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

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
  // Determine which color to use for the panel
  const effectiveColor = isHover && hoverColor ? hoverColor : mainColor

  // For hover layers, change icon to the hover color (so brand hover makes icon red)
  // Pass iconColor directly to Panel component since it handles ColorAccent properly
  const effectiveIconColor = isHover && hoverColor ? hoverColor : iconColor

  // For childrenIconColor, use the original iconColor (Panel will handle the fallback)
  const effectiveChildrenIconColor = iconColor

  // Apply positioning based on hover state
  const positioningClasses = isHover
    ? 'absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-750 ease-in-out panel-hover-layer'
    : 'relative z-20 transition-opacity duration-750 ease-in-out'

  // Apply fade-out for base layer when hover color exists
  const opacityClasses =
    !isHover && hoverColor ? 'group-hover:opacity-0 panel-base-layer' : ''

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
        className={cn(textAlign, getLatinTitleClass(title), className)}
        data-testid={testId}
      >
        {children}
      </Panel>
    </div>
  )
}
