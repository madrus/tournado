import { JSX, ReactNode } from 'react'

import { type ColorAccent } from '~/lib/lib.types'
import {
  getDescriptionClasses,
  getPanelClasses,
  getTitleClasses,
} from '~/styles/panel.styles'
import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

import { panelChildrenVariants } from './actionLinkPanel1.variants'

export type PanelLayerProps = {
  title: string
  description: string
  icon: JSX.Element
  iconColor: ColorAccent | string
  mainColor: ColorAccent
  hoverColor?: ColorAccent
  isHover?: boolean
  language: string
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
  language,
  textAlign,
  children,
  className,
  'data-testid': testId,
}: Readonly<PanelLayerProps>): JSX.Element {
  // Determine which color to use for background/glow
  const effectiveColor = isHover && hoverColor ? hoverColor : mainColor
  const panelClasses = getPanelClasses(effectiveColor)
  const titleClasses = getTitleClasses(effectiveColor)
  const descriptionClasses = getDescriptionClasses(effectiveColor)

  // Icon color logic
  const getIconClasses = () => {
    if (isHover && hoverColor) {
      // Use hover icon color logic
      const hoverIconColor =
        hoverColor === 'brand' ? 'text-red-600' : `text-${hoverColor}-300`
      const hoverIconBorder = hoverIconColor.replace('text-', 'border-')
      return cn(
        'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent',
        hoverIconColor,
        hoverIconBorder
      )
    }

    // base layer: ColorAccent
    if (typeof iconColor === 'string' && iconColor.startsWith('text-')) {
      const borderClass = iconColor.replace('text-', 'border-')
      return cn(
        'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent',
        iconColor,
        borderClass
      )
    }
    return cn(
      'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent',
      iconColor === 'brand'
        ? 'text-red-600 border-red-600'
        : `text-${iconColor}-600 border-${iconColor}-600`
    )
  }

  return (
    <div
      className={cn('relative flex h-full flex-col', className)}
      data-testid={testId}
    >
      {/* Panel gradient background and glow */}
      <div
        className={cn('absolute inset-0', panelClasses.background)}
        data-testid={testId ? `${testId}-background` : undefined}
      >
        <div
          className={panelClasses.glow}
          data-testid={testId ? `${testId}-glow` : undefined}
        />
      </div>
      {/* Content */}
      <div
        className={cn(
          'relative z-20 flex flex-1 flex-col items-start space-y-4 p-6 break-words',
          textAlign
        )}
      >
        <div className={getIconClasses()} aria-label='panel icon'>
          {icon}
        </div>
        <h3 className={cn(titleClasses, getLatinTitleClass(language))}>{title}</h3>
        <p className={descriptionClasses}>{description}</p>
        {children ? (
          <div
            className={panelChildrenVariants({ iconColor: iconColor as ColorAccent })}
          >
            {children}
          </div>
        ) : null}
      </div>
    </div>
  )
}
