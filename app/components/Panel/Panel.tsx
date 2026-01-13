import type { JSX, ReactNode } from 'react'
import { useLanguageDirection } from '~/hooks/useLanguageDirection'
import { useLanguageSwitcher } from '~/hooks/useLanguageSwitcher'
import type { ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'
import {
  type PanelVariants,
  dashboardIconVariants,
  panelChildrenVariants,
  panelDescriptionVariants,
  panelGlowVariants,
  panelIconVariants,
  panelNumberVariants,
  panelTitleVariants,
  panelVariants,
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
  /** Let children manage their own text colors */
  inheritChildrenText?: boolean
  /** Optional step/section number displayed in a colored badge */
  panelNumber?: number | string
  /** If true, the panel is disabled (pointer events are disabled) */
  disabled?: boolean
  /** Include glow effect */
  showGlow?: boolean
  /** Whether this is a hover state panel */
  isHover?: boolean
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
  inheritChildrenText = false,
  panelNumber,
  disabled = false,
  showGlow = false,
  isHover = false,
  'data-testid': testId,
}: PanelProps): JSX.Element {
  const { latinFontClass } = useLanguageDirection()
  const { currentLanguage } = useLanguageSwitcher()
  const effectiveIconColor = iconColor || color
  const effectiveChildrenIconColor = childrenIconColor || effectiveIconColor

  const containerClasses = cn(panelVariants({ color, variant, disabled }), className)

  return (
    <div className={containerClasses} data-testid={testId}>
      {/* Optional numbered badge */}
      {panelNumber !== undefined ? (
        <div className={panelNumberVariants({ color, disabled })}>{panelNumber}</div>
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
                <dt className='truncate font-medium text-base opacity-75'>{title}</dt>
              ) : null}
              {children ? (
                <dd className={cn('font-medium text-lg', latinFontClass, 'text-start')}>
                  {children}
                </dd>
              ) : null}
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
            variant === 'hover' ? 'p-6' : '',
            // Wrapper uses logical start for overall flow
            'text-start',
          )}
        >
          {/* Icon */}
          {icon ? (
            <div
              className={cn(panelIconVariants({ color: effectiveIconColor }), 'mb-4')}
              aria-hidden='true'
            >
              {icon}
            </div>
          ) : null}

          {/* Title */}
          {title ? (
            <h3
              className={cn(
                panelTitleVariants({ size: 'md', language: currentLanguage }),
                // Explicit logical alignment for RTL right
                'text-start',
                // Apply disabled styling for form panels
                disabled && variant === 'form-panel' ? 'text-foreground-lighter' : '',
              )}
            >
              {title}
            </h3>
          ) : null}

          {/* Subtitle */}
          {subtitle ? (
            <p
              className={cn(
                // For non-hover state, use text-foreground. For hover state, use adaptive colors
                isHover ? panelDescriptionVariants({ color }) : 'text-foreground',
                // Explicit logical alignment for RTL right
                'text-start',
                'mb-4',
                // Apply disabled styling for form panels
                disabled && variant === 'form-panel' ? 'text-foreground-lighter' : '',
              )}
            >
              {subtitle}
            </p>
          ) : null}

          {/* Children */}
          {children ? (
            <div
              className={cn(
                inheritChildrenText
                  ? ''
                  : panelChildrenVariants({
                      iconColor: effectiveChildrenIconColor,
                    }),
                // Explicit logical alignment for RTL right
                'text-start',
              )}
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
