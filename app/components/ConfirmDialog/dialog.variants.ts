import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Dialog intent type for contextual theming
 */
export type DialogIntent = 'warning' | 'danger' | 'info' | 'success'

/**
 * Dialog size variants
 */
export type DialogSize = 'sm' | 'md' | 'lg'

/**
 * Dialog content variants with intent-based theming
 */
export const dialogContentVariants = cva(
  [
    // Base styling with enhanced visual design
    'fixed top-1/2 left-1/2 z-50 w-[92vw] -translate-x-1/2 -translate-y-1/2',
    'rounded-3xl backdrop-blur-xl shadow-2xl',

    // Enhanced animations
    'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-96',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',

    // Dark mode base
    'dark:shadow-slate-950/25',
  ],
  {
    variants: {
      intent: {
        warning: [
          'bg-amber-50 border border-white',
          'dark:bg-slate-700/60 dark:border-slate-700',
        ],
        danger: [
          'bg-brand-50 border border-white',
          'dark:bg-slate-700/60 dark:border-slate-700',
        ],
        info: [
          'bg-cyan-50 border border-white',
          'dark:bg-slate-700/60 dark:border-slate-700',
        ],
        success: [
          'bg-emerald-50 border border-white',
          'dark:bg-slate-700/60 dark:border-slate-700',
        ],
      },
      size: {
        sm: 'max-w-sm p-6',
        md: 'max-w-md p-8',
        lg: 'max-w-lg p-10',
      },
    },
    defaultVariants: {
      intent: 'warning',
      size: 'md',
    },
  }
)

/**
 * Dialog overlay variants with enhanced backdrop
 */
export const dialogOverlayVariants = cva([
  'fixed inset-0 z-50',
  'bg-slate-900/20 backdrop-blur-md backdrop-saturate-150',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
  'dark:bg-slate-950/40',
])

/**
 * Icon container variants - no background, just size
 */
export const iconContainerVariants = cva('flex items-center justify-center', {
  variants: {
    intent: {
      warning: '',
      danger: '',
      info: '',
      success: '',
    },
  },
  defaultVariants: {
    intent: 'warning',
  },
})

/**
 * Icon color variants matching intent theming - larger size without container
 */
export const iconColorVariants = cva('h-14 w-14', {
  variants: {
    intent: {
      warning: 'text-amber-600 dark:text-amber-600',
      danger: 'text-brand-600 dark:text-brand-600',
      info: 'text-cyan-600 dark:text-cyan-600',
      success: 'text-emerald-600 dark:text-emerald-600',
    },
  },
  defaultVariants: {
    intent: 'warning',
  },
})

/**
 * Title color variants matching icon colors for visual cohesion
 */
export const titleColorVariants = cva('', {
  variants: {
    intent: {
      warning: 'text-amber-600 dark:text-amber-600',
      danger: 'text-brand-600 dark:text-brand-600',
      info: 'text-cyan-600 dark:text-cyan-600',
      success: 'text-emerald-600 dark:text-emerald-600',
    },
  },
  defaultVariants: {
    intent: 'warning',
  },
})

/**
 * TypeScript type exports for component prop typing
 */
export type DialogContentVariants = VariantProps<typeof dialogContentVariants>
export type IconContainerVariants = VariantProps<typeof iconContainerVariants>
export type IconColorVariants = VariantProps<typeof iconColorVariants>
export type TitleColorVariants = VariantProps<typeof titleColorVariants>
