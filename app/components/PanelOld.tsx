import { type JSX, ReactNode } from 'react'

import {
  panelContentVariants,
  panelGlowVariants,
  panelNumberVariants,
  panelVariants,
} from '~/components/shared/panel.variants'
import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

type PanelOldProps = {
  children: ReactNode
  color?: ColorAccent
  className?: string
  /** Optional step/section number displayed in a colored badge */
  panelNumber?: number | string
  /** If true, the panel is disabled (pointer events are disabled) */
  disabled?: boolean
}

export function PanelOld({
  children,
  color = 'slate',
  className,
  panelNumber,
  disabled = false,
}: PanelOldProps): JSX.Element {
  const containerClasses = cn(
    panelVariants({ color }),
    disabled === true && 'opacity-20 pointer-events-none',
    className
  )

  return (
    <div className={containerClasses}>
      {/* Optional numbered badge */}
      {panelNumber !== undefined ? (
        <div className={panelNumberVariants({ color })}>{panelNumber}</div>
      ) : null}

      <div className={panelContentVariants()}>
        {/* Glow effect */}
        <div className={panelGlowVariants({ color })} />
        {/* Content */}
        <div className='relative z-20'>{children}</div>
      </div>
    </div>
  )
}
