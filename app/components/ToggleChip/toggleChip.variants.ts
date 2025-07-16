import { cva, type VariantProps } from 'class-variance-authority'

export const toggleChipVariants = cva(
  [
    'flex cursor-pointer items-center rounded-lg border-2 p-3 transition-all duration-200',
  ],
  {
    variants: {
      variant: {
        divisions: [
          // Unselected state
          'border-slate-200 bg-white hover:border-lime-300 hover:bg-lime-50',
          // Selected state will be overridden by selected variant
        ],
        categories: [
          // Unselected state
          'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50',
          // Selected state will be overridden by selected variant
        ],
      },
      selected: {
        true: '',
        false: '',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
    },
    compoundVariants: [
      // Selected divisions styling
      {
        variant: 'divisions',
        selected: true,
        className: 'border-lime-500 bg-lime-50 text-lime-800',
      },
      // Selected categories styling
      {
        variant: 'categories',
        selected: true,
        className: 'border-purple-500 bg-purple-50 text-purple-800',
      },
    ],
    defaultVariants: {
      variant: 'divisions',
      selected: false,
      disabled: false,
    },
  }
)

export const toggleChipTextVariants = cva(['text-base font-medium'], {
  variants: {},
  defaultVariants: {},
})

export type ToggleChipVariants = VariantProps<typeof toggleChipVariants>
export type ToggleChipTextVariants = VariantProps<typeof toggleChipTextVariants>
