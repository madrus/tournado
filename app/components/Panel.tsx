import { type JSX, ReactNode } from 'react'

import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

type PanelProps = {
  children: ReactNode
  color?: ColorAccent
  className?: string
}

export function Panel({
  children,
  color = 'slate',
  className,
}: PanelProps): JSX.Element {
  // Static panel styling without hover animations - similar to teams route
  const getPanelClasses = (colorAccent: ColorAccent) => {
    const baseClasses = 'relative overflow-hidden rounded-2xl border shadow-xl p-6'

    // All colors use the same pattern
    const colorClasses = `border-${colorAccent}-400 bg-gradient-to-br from-${colorAccent}-50 via-${colorAccent}-100 to-${colorAccent}-50 dark:from-${colorAccent}-950 dark:via-${colorAccent}-900 dark:to-${colorAccent}-900`

    return cn(baseClasses, colorClasses)
  }

  const getGlowClasses = (colorAccent: ColorAccent) => {
    const baseClasses =
      'pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full blur-2xl opacity-90'

    // All colors use the same pattern
    const glowClass = `bg-${colorAccent}-400/30`

    return cn(baseClasses, glowClass)
  }

  return (
    <div className={cn(getPanelClasses(color), className)}>
      {/* Glow effect */}
      <div className={getGlowClasses(color)} />
      {/* Content */}
      <div className='relative z-20'>{children}</div>
    </div>
  )
}
