import { type JSX, type ReactNode } from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '~/utils/misc'

const badgeVariants = cva(
  'inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium',
  {
    variants: {
      color: {
        slate: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-50',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-50',
        red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-50',
        green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-50',
        purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-50',
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-50',
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
