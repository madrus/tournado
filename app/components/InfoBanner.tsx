import { type VariantProps, cva } from 'class-variance-authority'
import type { JSX, ReactNode } from 'react'
import { cn } from '~/utils/misc'

/**
 * InfoBanner component for displaying informational messages
 * with semantic color variants.
 */

const infoBannerVariants = cva(
  ['my-4 rounded-md border p-3 text-sm transition-colors duration-200'],
  {
    variants: {
      variant: {
        info: [
          'border-info-700 bg-info-700/10 text-info-700',
          'dark:border-info-300 dark:bg-info-700/10 dark:text-info-300',
        ],
        warning: [
          'border-warning-700 bg-warning-700/10 text-warning-700',
          'dark:border-warning-300 dark:bg-warning-700/10 dark:text-warning-300',
        ],
        success: [
          'border-success-700 bg-success-700/10 text-success-700',
          'dark:border-success-300 dark:bg-success-700/10 dark:text-success-300',
        ],
        error: [
          'border-error-700 bg-error-700/10 text-error-700',
          'dark:border-error-300 dark:bg-error-700/10 dark:text-error-300',
        ],
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
)

export type InfoBannerProps = {
  children: ReactNode
  variant?: VariantProps<typeof infoBannerVariants>['variant']
  className?: string
}

export const InfoBanner = ({
  children,
  variant = 'info',
  className,
}: InfoBannerProps): JSX.Element => {
  // Use role="alert" for errors (implicit aria-live="assertive")
  // Use role="status" with aria-live="polite" for other variants
  const isError = variant === 'error'
  const ariaProps = isError
    ? { role: 'alert' as const }
    : { role: 'status' as const, 'aria-live': 'polite' as const }

  return (
    <div className={cn(infoBannerVariants({ variant }), className)} {...ariaProps}>
      {children}
    </div>
  )
}
