import { type JSX, ReactNode } from 'react'

import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

import {
  panelDescriptionVariants,
  panelGlowVariants,
  panelNumberVariants,
  panelTitleVariants,
  panelVariants,
  type PanelVariants,
} from './panel.variants'

export type PanelProps = {
  children?: ReactNode
  color?: ColorAccent
  variant?: PanelVariants['variant']
  className?: string
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
  /** Include glow effect */
  showGlow?: boolean
  /** Test ID for testing purposes */
  'data-testid'?: string
}

export function Panel({
  children,
  color = 'brand',
  variant = 'content',
  className,
  title,
  subtitle,
  icon,
  iconColor,
  panelNumber,
  disabled = false,
  showGlow = false,
  'data-testid': testId,
}: PanelProps): JSX.Element {
  const effectiveIconColor = iconColor || color

  // Icon styling using consistent approach
  const getIconClasses = () => {
    const baseClasses =
      'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent transition-[border-color,background-color,color] duration-500 ease-in-out'

    if (effectiveIconColor === 'brand') {
      return cn(baseClasses, 'text-red-600 border-red-600')
    }
    if (effectiveIconColor === 'primary') {
      return cn(baseClasses, 'text-emerald-600 border-emerald-600')
    }
    return cn(
      baseClasses,
      `text-${effectiveIconColor}-600 border-${effectiveIconColor}-600`
    )
  }

  const containerClasses = cn(
    panelVariants({ color, variant }),
    disabled && 'opacity-20 pointer-events-none',
    className
  )

  return (
    <div className={containerClasses} data-testid={testId}>
      {/* Optional numbered badge */}
      {panelNumber !== undefined ? (
        <div className={panelNumberVariants({ color })}>{panelNumber}</div>
      ) : null}

      {/* Optional glow effect */}
      {showGlow ? <div className={panelGlowVariants({ color })} /> : null}

      {/* Content area */}
      <div className='flex flex-col items-start space-y-4 break-words'>
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
  )
}
