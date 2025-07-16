import { type JSX, ReactNode } from 'react'

import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

type PanelProps = {
  children: ReactNode
  color?: ColorAccent
  className?: string
  /** Optional step/section number displayed in a colored badge */
  panelNumber?: number | string
  /** If true, the panel is disabled (pointer events are disabled) */
  disabled?: boolean
}

export function Panel({
  children,
  color = 'slate',
  className,
  panelNumber,
  disabled = false,
}: PanelProps): JSX.Element {
  // Static panel styling without hover animations - similar to teams route
  const getPanelClasses = (colorAccent: ColorAccent) => {
    const baseClasses = 'relative overflow-visible rounded-2xl border shadow-xl p-6'

    // All colors use the same pattern
    const colorClasses = `border-${colorAccent}-400 bg-gradient-to-br from-${colorAccent}-50 via-${colorAccent}-100 to-${colorAccent}-50 dark:from-${colorAccent}-950 dark:via-${colorAccent}-900 dark:to-${colorAccent}-900`

    return cn(baseClasses, colorClasses)
  }

  const getGlowClasses = (colorAccent: ColorAccent) => {
    const baseClasses =
      'pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full blur-2xl opacity-60'

    // All colors use the same pattern
    const glowClass = `bg-${colorAccent}-400/30`

    return cn(baseClasses, glowClass)
  }

  const getNumberClasses = (colorAccent: ColorAccent) => {
    const baseClasses =
      'text-primary-foreground absolute top-8 -left-4 z-30 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-lg lg:-left-6 rtl:-right-4 rtl:left-auto lg:rtl:-right-6'
    const colorClass = `bg-${colorAccent}-600`

    return cn(baseClasses, colorClass)
  }

  const containerClasses = cn(
    getPanelClasses(color),
    className,
    disabled && 'pointer-events-none opacity-20'
  )

  return (
    <div className={containerClasses}>
      {/* Optional numbered badge */}
      {panelNumber !== undefined ? (
        <div className={getNumberClasses(color)}>{panelNumber}</div>
      ) : null}
      {/* Glow effect */}
      <div className={getGlowClasses(color)} />
      {/* Content */}
      <div className='relative z-20'>{children}</div>
    </div>
  )
}
