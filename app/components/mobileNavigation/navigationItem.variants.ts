import { cva, type VariantProps } from 'class-variance-authority'

export const navigationItemVariants = cva(
  // Base classes - common navigation item styling
  ['flex flex-col items-center transition-colors duration-200'],
  {
    variants: {
      color: {
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
      active: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      color: 'brand',
      active: false,
    },
  }
)

export const navigationIconVariants = cva(
  // Base classes for navigation icons
  ['transition-colors duration-200'],
  {
    variants: {
      color: {
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
      active: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Brand color active/inactive states
      {
        color: 'brand',
        active: true,
        class: 'text-adaptive-brand',
      },
      {
        color: 'brand',
        active: false,
        class: 'text-primary-foreground',
      },
      // Primary color active/inactive states
      {
        color: 'primary',
        active: true,
        class: 'text-adaptive-emerald',
      },
      {
        color: 'primary',
        active: false,
        class: 'text-primary-foreground',
      },
      // Additional color variants can be added as needed
    ],
    defaultVariants: {
      color: 'brand',
      active: false,
    },
  }
)

export const navigationLabelVariants = cva(
  // Base classes for navigation labels
  ['mt-1 text-xs transition-colors duration-200'],
  {
    variants: {
      color: {
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
      active: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Brand color active/inactive states
      {
        color: 'brand',
        active: true,
        class: 'text-adaptive-brand font-bold',
      },
      {
        color: 'brand',
        active: false,
        class: 'text-primary-foreground',
      },
      // Primary color active/inactive states
      {
        color: 'primary',
        active: true,
        class: 'text-adaptive-emerald font-bold',
      },
      {
        color: 'primary',
        active: false,
        class: 'text-primary-foreground',
      },
      // Additional color variants can be added as needed
    ],
    defaultVariants: {
      color: 'brand',
      active: false,
    },
  }
)

export type NavigationItemVariants = VariantProps<typeof navigationItemVariants>
export type NavigationIconVariants = VariantProps<typeof navigationIconVariants>
export type NavigationLabelVariants = VariantProps<typeof navigationLabelVariants>
