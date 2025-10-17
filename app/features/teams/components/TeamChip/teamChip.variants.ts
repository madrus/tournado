import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Team chip variants for tournament team display components.
 *
 * Specialized chip design for team names with tournament-specific styling.
 * Features a complex focus ring system optimized for tournament interfaces.
 *
 * Design Features:
 * - Tournament-specific brand color (red) theming
 * - Complex focus ring system for accessibility
 * - Interactive states with scaling animations
 * - Optimized for team name display context
 *
 * Focus Ring System:
 * - Light mode: Red ring with white offset
 * - Dark mode: White ring with red offset (creates white-red-white pattern)
 *
 * @example
 * ```tsx
 * <div className={teamChipVariants({ color: 'brand', interactive: true })}>
 *   Team Amsterdam
 * </div>
 * ```
 */
export const teamChipVariants = cva(
  // Base classes for all team chips
  [
    'inline-flex h-10 items-center rounded-lg border px-2',
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
      /**
       * Color variants optimized for team display context.
       * Limited to brand and neutral for tournament-specific design.
       *
       * - brand: Tournament brand color (red) for primary teams
       * - neutral: Neutral styling for secondary/disabled teams
       */
      color: {
        brand: [
          'border-red-600 dark:!border-slate-100',
          'bg-background dark:bg-brand-700',
          'text-brand',
          'shadow-brand/25 hover:shadow-brand/40',
          'hover:bg-accent hover:border-brand-accent dark:hover:bg-brand-700',
        ],
        // Neutral variant for non-primary team display
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
      color: 'brand',
    },
  }
)

// TypeScript type exports for component prop typing

/**
 * Type definition for teamChipVariants props.
 * Use this when defining component props that accept team chip styling options.
 */
export type TeamChipVariants = VariantProps<typeof teamChipVariants>

/**
 * Team chip color variant type (limited to brand/neutral for tournament context).
 * Intentionally restricted compared to full ColorVariantKey for specialized use case.
 */
export type TeamChipColorVariant = 'brand' | 'neutral'
