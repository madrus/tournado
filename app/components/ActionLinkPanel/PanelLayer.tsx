import { JSX, ReactNode } from 'react'

import { type ColorAccent } from '~/lib/lib.types'
import {
  getDescriptionClasses,
  getPanelClasses,
  getTitleClasses,
} from '~/styles/panel.styles'
import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

type PanelLayerProps = {
  title: string
  description: string
  icon: JSX.Element
  iconColor: ColorAccent | string
  color: ColorAccent
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
  color,
  language,
  textAlign,
  children,
  className,
  'data-testid': testId,
}: Readonly<PanelLayerProps>): JSX.Element {
  const panelClasses = getPanelClasses(color)
  const titleClasses = getTitleClasses(color)
  const descriptionClasses = getDescriptionClasses(color)

  // Icon color logic (string for hover, ColorAccent for base)
  const getIconClasses = () => {
    if (typeof iconColor === 'string' && iconColor.startsWith('text-')) {
      // hover layer: text-xxx-300 or text-red-600
      const borderClass = iconColor.replace('text-', 'border-')
      return cn(
        'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent',
        iconColor,
        borderClass
      )
    }
    // base layer: ColorAccent
    return cn(
      'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent',
      iconColor === 'brand'
        ? 'text-red-600 border-red-600'
        : `text-${iconColor}-300 border-${iconColor}-300`
    )
  }

  return (
    <div className={cn('absolute inset-0', className)} data-testid={testId}>
      {/* Panel gradient background and glow */}
      <div className={panelClasses.background}>
        <div className={panelClasses.glow} />
      </div>
      {/* Content */}
      <div
        className={cn(
          'relative z-20 flex flex-col items-start space-y-4 p-6 break-words',
          textAlign
        )}
      >
        <div className={getIconClasses()} aria-label='panel icon'>
          {icon}
        </div>
        <h3 className={cn(titleClasses, getLatinTitleClass(language))}>{title}</h3>
        <p className={descriptionClasses}>{description}</p>
        {children}
      </div>
    </div>
  )
}

export default PanelLayer
