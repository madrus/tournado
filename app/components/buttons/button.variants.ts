import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  // Base classes - all the common button styling
  [
    'inline-flex items-center justify-center rounded-lg font-semibold gap-2',
    'min-h-12 min-w-32 py-2.5 px-4 text-sm uppercase',
    'relative transition-all duration-300 ease-out whitespace-nowrap',
    'shadow-lg hover:shadow-xl disabled:hover:shadow-lg',
    'hover:scale-103 active:scale-95 disabled:hover:scale-100',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'disabled:bg-button-neutral-background disabled:text-button-neutral-text disabled:border-button-neutral-secondary-border',
    'focus:outline-none',
    // Ring system base classes
    'disabled:hover:ring-0 disabled:hover:ring-offset-0 disabled:focus-visible:ring-0 disabled:focus-visible:ring-offset-0 disabled:focus:ring-0 disabled:focus:ring-offset-0',
  ],
  {
    variants: {
      variant: {
        primary: ['text-white'],
        secondary: ['bg-transparent', 'border'],
      },
      color: {
        brand: [],
        primary: [],
        emerald: [],
        red: [],
        teal: [],
        cyan: [],
        yellow: [],
        green: [],
        violet: [],
        gray: [],
        slate: [],
      },
      size: {
        sm: 'min-h-10 min-w-24 py-2 px-3 text-xs',
        md: '', // Default size, no additional classes
      },
    },
    compoundVariants: [
      // Primary variant + colors
      {
        variant: 'primary',
        color: 'brand',
        class: [
          'bg-brand-600',
          'border border-brand-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-brand-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-brand-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-brand-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-brand-600',
          'shadow-brand-700/40 hover:shadow-brand-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'primary',
        class: [
          'bg-primary-600',
          'border border-primary-600',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-primary-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 focus:ring-offset-slate-50',
          'shadow-primary-700/40 hover:shadow-primary-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      // Secondary variant + colors
      {
        variant: 'secondary',
        color: 'brand',
        class: [
          'text-brand-600',
          'border-brand-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-brand-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-brand-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-brand-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-brand-600',
          'shadow-brand-700/40 hover:shadow-brand-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'primary',
        class: [
          'text-primary-600',
          'border-primary-600',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-primary-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 focus:ring-offset-slate-50',
          'shadow-primary-700/40 hover:shadow-primary-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
    ],
    defaultVariants: {
      variant: 'primary',
      color: 'brand',
      size: 'md',
    },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
export type ButtonVariant = NonNullable<ButtonVariants['variant']>
export type ButtonColor = NonNullable<ButtonVariants['color']>
export type ButtonSize = NonNullable<ButtonVariants['size']>
