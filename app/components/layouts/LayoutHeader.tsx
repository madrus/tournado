import { JSX, ReactNode } from 'react'

import { cn } from '~/utils/misc'
import { getArabicTextClass } from '~/utils/rtlUtils'

/**
 * Reusable layout header component with RTL support and responsive breakpoints.
 * Renders a title, description, and optional action buttons.
 *
 * Note: Uses <h2> for the title because the primary <h1> is in the AppBar navigation.
 * This follows SPA best practices where the persistent navigation contains the main heading.
 */
type LayoutHeaderProps = {
  /** Title text or translation key */
  title: string
  /** Description text, translation key, or ReactNode for complex content (e.g., Trans component) */
  description: string | ReactNode
  /** Optional action components to render on the right side (buttons, filters, etc.) */
  actions?: ReactNode
  /** Custom className for the container */
  className?: string
  /** Test ID for the container */
  testId?: string
  /** Responsive breakpoint for flex direction change (default: 'sm') */
  breakpoint?: 'sm' | 'md' | 'lg'
}

export function LayoutHeader({
  title,
  description,
  actions,
  className,
  testId,
  breakpoint = 'sm',
}: LayoutHeaderProps): JSX.Element {
  const breakpointClasses = {
    sm: 'sm:flex-row sm:items-center sm:justify-between',
    md: 'md:flex-row md:items-center md:justify-between',
    lg: 'lg:flex-row lg:items-center lg:justify-between',
  }

  const arabicClass = getArabicTextClass()

  return (
    <div
      className={cn('border-button-neutral-secondary-border border-b pb-6', className)}
      data-testid={testId}
    >
      <div className={cn('flex flex-col gap-4', breakpointClasses[breakpoint])}>
        <div>
          <h2 className={cn('text-3xl font-bold', arabicClass)}>{title}</h2>
          {typeof description === 'string' ? (
            <p className={cn('text-foreground mt-1', arabicClass)}>{description}</p>
          ) : (
            <div className='text-foreground mt-1'>{description}</div>
          )}
        </div>

        {actions ? (
          <div className='flex justify-end gap-4 md:justify-end rtl:justify-start rtl:md:justify-start'>
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  )
}
