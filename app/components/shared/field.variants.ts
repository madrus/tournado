import { cva, type VariantProps } from 'class-variance-authority'

// Field validation checkmark styling
export const fieldCheckmarkVariants = cva(
  [
    'absolute -top-2 right-1 flex h-6 w-6 items-center justify-center rounded-full rtl:right-auto rtl:left-1',
  ],
  {
    variants: {
      color: {
        brand: 'checkmark-brand',
        primary: 'checkmark-primary',
        emerald: 'checkmark-emerald',
        blue: 'checkmark-blue',
        slate: 'checkmark-slate',
        teal: 'checkmark-teal',
        red: 'checkmark-red',
        cyan: 'checkmark-cyan',
        yellow: 'checkmark-yellow',
        green: 'checkmark-green',
        violet: 'checkmark-violet',
        zinc: 'checkmark-zinc',
        orange: 'checkmark-orange',
        amber: 'checkmark-amber',
        lime: 'checkmark-lime',
        sky: 'checkmark-sky',
        indigo: 'checkmark-indigo',
        purple: 'checkmark-purple',
        fuchsia: 'checkmark-fuchsia',
        pink: 'checkmark-pink',
        rose: 'checkmark-rose',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  }
)

// Field validation error icon styling
export const fieldErrorIconVariants = cva(
  [
    'absolute -top-2 right-1 flex h-6 w-6 items-center justify-center rounded-full rtl:right-auto rtl:left-1',
    'field-error-icon', // Semantic class for error styling
  ],
  {
    variants: {
      color: {
        // All colors use the same error styling, but we keep the variants
        // for consistency with the checkmark pattern
        brand: '',
        primary: '',
        emerald: '',
        blue: '',
        slate: '',
        teal: '',
        red: '',
        cyan: '',
        yellow: '',
        green: '',
        violet: '',
        zinc: '',
        orange: '',
        amber: '',
        lime: '',
        sky: '',
        indigo: '',
        purple: '',
        fuchsia: '',
        pink: '',
        rose: '',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  }
)

export type FieldCheckmarkVariants = VariantProps<typeof fieldCheckmarkVariants>
export type FieldErrorIconVariants = VariantProps<typeof fieldErrorIconVariants>
