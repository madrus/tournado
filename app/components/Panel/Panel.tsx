import { type JSX, ReactNode } from 'react'

import { useLanguageSwitcher } from '~/hooks/useLanguageSwitcher'
import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

import {
  dashboardIconVariants,
  panelChildrenVariants,
  panelDescriptionVariants,
  panelGlowVariants,
  panelIconVariants,
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
  /** Children text color - defaults to iconColor */
  childrenIconColor?: ColorAccent
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
  variant = 'content-panel',
  className,
  title,
  subtitle,
  icon,
  iconColor,
  childrenIconColor,
  panelNumber,
  disabled = false,
  showGlow = false,
  'data-testid': testId,
}: PanelProps): JSX.Element {
  const { currentLanguage } = useLanguageSwitcher()
  const effectiveIconColor = iconColor || color
  const effectiveChildrenIconColor = childrenIconColor || effectiveIconColor

  // Icon styling using CVA variants
  const getIconClasses = () => panelIconVariants({ color: effectiveIconColor })

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
      {showGlow ? (
        <div
          className={panelGlowVariants({ color })}
          data-testid={testId ? `${testId}-glow` : undefined}
        />
      ) : null}

      {/* Content area */}
      {variant === 'dashboard-panel' ? (
        /* Dashboard variant: horizontal layout with icon + stats */
        <div className='dashboard-content'>
          {/* Icon section */}
          {icon ? (
            <div className='dashboard-icon'>
              <div className={dashboardIconVariants({ color: effectiveIconColor })}>
                {icon}
              </div>
            </div>
          ) : null}

          {/* Stats section */}
          <div className='dashboard-stats'>
            <dl>
              {title ? (
                <dt className='truncate text-sm font-medium opacity-75'>{title}</dt>
              ) : null}
              {children ? <dd className='text-lg font-medium'>{children}</dd> : null}
            </dl>
          </div>
        </div>
      ) : (
        /* Standard variants: content wrapper */
        <div
          className={cn(
            // Only apply structured layout for content-panel with icon/title
            variant === 'content-panel' && (icon || title)
              ? 'flex flex-col items-start'
              : '',
            'break-words',
            variant === 'hover' ? 'p-6' : ''
          )}
        >
          {/* Icon */}
          {icon ? (
            <div className={cn(getIconClasses(), 'mb-4')} aria-label='panel icon'>
              {icon}
            </div>
          ) : null}

          {/* Title */}
          {title ? (
            <h3
              className={cn(
                panelTitleVariants({ size: 'md', language: currentLanguage }),
                // Apply disabled styling for form panels
                disabled && variant === 'form-panel' ? 'text-foreground-lighter' : ''
              )}
            >
              {title}
            </h3>
          ) : null}

          {/* Subtitle */}
          {subtitle ? (
            <p
              className={cn(
                panelDescriptionVariants({ color }),
                'mb-4',
                // Apply disabled styling for form panels
                disabled && variant === 'form-panel' ? 'text-foreground-lighter' : ''
              )}
            >
              {subtitle}
            </p>
          ) : null}

          {/* Children */}
          {children ? (
            <div
              className={panelChildrenVariants({
                iconColor: effectiveChildrenIconColor,
              })}
              data-testid={testId ? `${testId}-children` : undefined}
            >
              {children}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
