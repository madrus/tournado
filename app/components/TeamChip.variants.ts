import { cva, type VariantProps } from 'class-variance-authority'

export const teamChipVariants = cva(
  // Base classes for all team chips
  [
    'inline-flex h-10 items-center rounded-lg border',
    'font-semibold transition-all duration-300 ease-out relative overflow-hidden',
    'shadow-lg hover:shadow-xl',
    // Team chip ring system - matches getTeamChipRingClasses()
    // Light mode: red ring + white offset
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600 focus-visible:ring-offset-slate-50',
    'hover:ring-2 hover:ring-offset-2 hover:ring-red-600 hover:ring-offset-slate-50',
    'focus:ring-2 focus:ring-offset-2 focus:ring-red-600 focus:ring-offset-slate-50',
    // Dark mode: white ring + red offset (creates white-red-white pattern with white border)
    'focus-visible:dark:ring-slate-100 focus-visible:dark:ring-offset-red-600',
    'hover:dark:ring-slate-100 hover:dark:ring-offset-red-600',
    'focus:dark:ring-slate-100 focus:dark:ring-offset-red-600',
    'focus:outline-none',
  ],
  {
    variants: {
      interactive: {
        true: ['cursor-pointer', 'hover:scale-105 active:scale-95'],
        false: [],
      },
      hasActions: {
        true: [], // padding handled by chipClasses.container
        false: 'px-3',
      },
      color: {
        brand: [
          'border-red-600 dark:!border-slate-100',
          'bg-background dark:bg-brand-700',
          'text-brand',
          'shadow-brand/25 hover:shadow-brand/40',
          'hover:bg-accent hover:border-brand-accent dark:hover:bg-brand-700',
        ],
        // Could add other color variants for different chip types
        neutral: [
          'border-slate-600 dark:border-slate-400',
          'bg-background dark:bg-slate-700',
          'text-slate-700 dark:text-slate-100',
          'shadow-slate/25 hover:shadow-slate/40',
          'hover:bg-slate-50 hover:border-slate-700 dark:hover:bg-slate-600',
        ],
      },
    },
    defaultVariants: {
      interactive: false,
      hasActions: false,
      color: 'brand',
    },
  }
)

export const deleteButtonVariants = cva([
  'text-brand hover:bg-accent hover:text-brand-accent dark:hover:bg-brand-700',
  'flex-shrink-0 rounded-full p-1',
])

export type TeamChipVariants = VariantProps<typeof teamChipVariants>
export type DeleteButtonVariants = VariantProps<typeof deleteButtonVariants>
