import { type JSX, ReactNode } from 'react'

import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'
import { getTypographyClasses } from '~/utils/rtlUtils'

import {
  panelContentVariants,
  panelDescriptionVariants,
  panelGlowVariants,
  panelNumberVariants,
  panelTitleVariants,
  panelVariants,
} from './panel.variants'

export type PanelProps = {
  children: ReactNode
  color?: ColorAccent
  className?: string
  /** Optional hover color that creates a hover overlay effect */
  hoverColor?: ColorAccent
  /** Optional title displayed in the panel */
  title?: string
  /** Optional subtitle/description displayed below the title */
  subtitle?: string
  /** Optional icon displayed with the title */
  icon?: JSX.Element
  /** Icon color - defaults to the same as panel color */
  iconColor?: ColorAccent
  /** Optional step/section number displayed in a colored badge */
  panelNumber?: number | string
  /** If true, the panel is disabled (pointer events are disabled) */
  disabled?: boolean
  /** Language for RTL support */
  language?: string
  /** Test ID for testing purposes */
  'data-testid'?: string
}

export function Panel({
  children,
  color = 'brand',
  className,
  hoverColor,
  title,
  subtitle,
  icon,
  iconColor,
  panelNumber,
  disabled = false,
  language = 'en',
  'data-testid': testId,
}: PanelProps): JSX.Element {
  const typographyClasses = getTypographyClasses(language)
  const effectiveIconColor = iconColor || color

  // Icon styling using CVA approach
  const getIconClasses = (isHover = false) => {
    const currentColor = isHover && hoverColor ? hoverColor : effectiveIconColor
    const baseClasses =
      'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent transition-[border-color,background-color,color] duration-500 ease-in-out'

    if (currentColor === 'brand') {
      return cn(baseClasses, 'text-red-600 border-red-600')
    }
    if (currentColor === 'primary') {
      return cn(baseClasses, 'text-emerald-600 border-emerald-600')
    }
    return cn(baseClasses, `text-${currentColor}-600 border-${currentColor}-600`)
  }

  const containerClasses = cn(
    'group relative overflow-hidden rounded-2xl border shadow-xl',
    hoverColor && 'cursor-pointer',
    disabled && 'opacity-20 pointer-events-none',
    className
  )

  return (
    <div className={containerClasses} data-testid={testId}>
      {/* Optional numbered badge */}
      {panelNumber !== undefined ? (
        <div className={panelNumberVariants({ color })}>{panelNumber}</div>
      ) : null}

      {/* Layer 1: Static background (prevents color flash) */}
      <div className={cn('absolute inset-0', panelVariants({ color }))} />

      {/* Layer 2: Base content container */}
      <div
        className={cn(
          panelContentVariants(),
          'transition-opacity duration-750 ease-in-out',
          hoverColor && 'group-hover:opacity-0'
        )}
        data-testid={testId ? `${testId}-base-content` : undefined}
      >
        {/* Glow effect */}
        <div className={panelGlowVariants({ color })} />

        {/* Content */}
        <div
          className={cn(
            'relative z-20 flex flex-col space-y-4 p-6',
            typographyClasses.textAlign
          )}
        >
          {/* Icon */}
          {icon ? (
            <div className={getIconClasses()} aria-label='panel icon'>
              {icon}
            </div>
          ) : null}

          {/* Title */}
          {title ? (
            <h3 className={panelTitleVariants({ color, size: 'md' })}>{title}</h3>
          ) : null}

          {/* Subtitle */}
          {subtitle ? <p className={panelDescriptionVariants()}>{subtitle}</p> : null}

          {/* Children */}
          {children}
        </div>
      </div>

      {/* Layer 3: Optional hover overlay */}
      {hoverColor ? (
        <div
          className={cn(
            'absolute inset-0 z-30 opacity-0 transition-opacity duration-750 ease-in-out group-hover:opacity-100',
            panelVariants({ color: hoverColor })
          )}
          data-testid={testId ? `${testId}-hover-overlay` : undefined}
        >
          {/* Hover glow effect */}
          <div className={panelGlowVariants({ color: hoverColor })} />

          {/* Hover content */}
          <div
            className={cn(
              'relative z-20 flex flex-col space-y-4 p-6',
              typographyClasses.textAlign
            )}
          >
            {/* Hover icon */}
            {icon ? (
              <div className={getIconClasses(true)} aria-label='panel icon'>
                {icon}
              </div>
            ) : null}

            {/* Hover title */}
            {title ? (
              <h3 className={panelTitleVariants({ color: hoverColor, size: 'md' })}>
                {title}
              </h3>
            ) : null}

            {/* Hover subtitle */}
            {subtitle ? <p className={panelDescriptionVariants()}>{subtitle}</p> : null}

            {/* Hover children */}
            {children}
          </div>
        </div>
      ) : null}
    </div>
  )
}
