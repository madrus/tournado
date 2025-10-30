import type { JSX, ReactNode } from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

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
          'bg-sky-700/10 text-sky-700 border-sky-700',
          'dark:bg-sky-700/10 dark:text-sky-300 dark:border-sky-300',
        ],
        warning: [
          'bg-orange-700/10 text-orange-700 border-orange-700',
          'dark:bg-orange-700/10 dark:text-orange-300 dark:border-orange-300',
        ],
        success: [
          'bg-emerald-700/10 text-emerald-700 border-emerald-700',
          'dark:bg-emerald-700/10 dark:text-emerald-300 dark:border-emerald-300',
        ],
        error: [
          'bg-red-700/10 text-red-700 border-red-700',
          'dark:bg-red-700/10 dark:text-red-300 dark:border-red-300',
        ],
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
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
}: InfoBannerProps): JSX.Element => (
  <div className={cn(infoBannerVariants({ variant }), className)}>{children}</div>
)
