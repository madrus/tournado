import { type JSX, type ReactNode } from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '~/utils/misc'

const badgeVariants = cva(
  'inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium',
  {
    variants: {
      color: {
        blue: 'bg-blue-600 text-blue-50 dark:bg-blue-800 dark:text-blue-50',
        green: 'bg-green-600 text-green-50 dark:bg-green-800 dark:text-green-50',
        purple: 'bg-purple-600 text-purple-50 dark:bg-purple-800 dark:text-purple-50',
        red: 'bg-red-600 text-red-50 dark:bg-red-800 dark:text-red-50',
        sky: 'bg-sky-600 text-sky-50 dark:bg-sky-800 dark:text-sky-50',
        slate: 'bg-slate-600 text-slate-50 dark:bg-slate-800 dark:text-slate-50',
        yellow: 'bg-yellow-600 text-yellow-50 dark:bg-yellow-800 dark:text-yellow-50',
      },
    },
    defaultVariants: {
      color: 'slate',
    },
  }
)

export type BadgeProps = {
  children: ReactNode
  className?: string
} & VariantProps<typeof badgeVariants>

export const Badge = ({
  children,
  color,
  className,
}: Readonly<BadgeProps>): JSX.Element => (
  <span className={cn(badgeVariants({ color }), className)}>{children}</span>
)
