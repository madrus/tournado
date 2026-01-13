import type { JSX, ReactNode } from 'react'
import { Link } from 'react-router'
import type { ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'
import { getTypographyClasses } from '~/utils/rtlUtils'
import { ErrorBoundary } from './ErrorBoundary'
import { PanelBackground } from './PanelBackground'
import { PanelLayer } from './PanelLayer'
import {
  actionLinkPanelVariants,
  panelBackgroundVariants,
} from './actionLinkPanel.variants'

type ActionLinkPanelProps = {
  title: string
  description: string
  icon: JSX.Element
  mainColor: ColorAccent
  hoverColor?: ColorAccent
  iconColor: ColorAccent
  to?: string
  onClick?: () => void
  children?: ReactNode
  className?: string
  testId?: string
}

export function ActionLinkPanel({
  title,
  description,
  icon,
  mainColor,
  hoverColor,
  iconColor,
  to,
  onClick,
  children,
  className,
  testId,
}: Readonly<ActionLinkPanelProps>): JSX.Element {
  const typographyClasses = getTypographyClasses()

  // Error handler for panel errors - logs and can be extended for telemetry
  const handlePanelError = (
    error: Error,
    errorInfo: { componentStack?: string | null },
  ): void => {
    // Log detailed error information
    console.error('ActionLinkPanel component error:', {
      title,
      to,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })

    // TODO: Send to telemetry service (e.g., Sentry, LogRocket)
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } })
  }

  const panel = (
    <ErrorBoundary onError={handlePanelError}>
      <div
        className={cn(
          actionLinkPanelVariants({
            color: mainColor,
          }),
          className,
        )}
        {...(onClick && {
          onClick,
          onKeyDown: event => {
            // Check if event came from a child interactive element (not the panel itself)
            const target = event.target as HTMLElement
            const currentTarget = event.currentTarget as HTMLElement
            const interactiveElement = target.closest(
              'button, input, select, textarea, a, [role="button"], [role="combobox"], [role="tab"]',
            )
            // Only prevent activation if the interactive element is NOT the panel itself
            const isChildInteractive =
              interactiveElement && interactiveElement !== currentTarget

            if (event.key === 'Enter' && !isChildInteractive) {
              event.preventDefault()
              onClick()
            }

            // Handle Space on keyDown to prevent page scroll
            if (
              (event.key === ' ' || event.key === 'Spacebar') &&
              !isChildInteractive
            ) {
              event.preventDefault()
              onClick()
            }
          },
          role: 'button',
          tabIndex: 0,
          'aria-label': `${title} panel`,
        })}
        data-testid={testId}
      >
        {/* Stable background layer */}
        <PanelBackground
          backgroundColor={panelBackgroundVariants({ color: mainColor })}
          data-testid='panel-background'
        />

        {/* Base panel layer (normal flow) */}
        <PanelLayer
          title={title}
          description={description}
          icon={icon}
          iconColor={iconColor} // always pass ColorAccent, not a Tailwind class string
          mainColor={mainColor}
          hoverColor={hoverColor}
          textAlign={typographyClasses.textAlign}
          data-testid='main-panel-layer'
        >
          {children}
        </PanelLayer>

        {/* Hover overlay panel - absolutely positioned overlay */}
        {hoverColor ? (
          <PanelLayer
            title={title}
            description={description}
            icon={icon}
            iconColor={iconColor} // keep original iconColor for consistency
            mainColor={mainColor}
            hoverColor={hoverColor}
            isHover
            textAlign={typographyClasses.textAlign}
            data-testid='hover-panel-layer'
          >
            {children}
          </PanelLayer>
        ) : null}
      </div>
    </ErrorBoundary>
  )

  if (to) {
    return (
      <Link to={to} className='block'>
        {panel}
      </Link>
    )
  }
  return panel
}
