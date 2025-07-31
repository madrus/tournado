import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Sign-in page container variants
 * Provides consistent styling for the main signin page layout
 */
export const signinContainerVariants = cva(['flex min-h-screen flex-col'])

/**
 * Sign-in form container variants
 * Controls the positioning and sizing of the signin form
 */
export const signinFormContainerVariants = cva([
  'flex flex-1 flex-col items-center justify-start px-6 pt-24',
])

/**
 * Sign-in form wrapper variants
 * Sets the maximum width and overall form structure
 */
export const signinFormWrapperVariants = cva(['w-full max-w-md'])

/**
 * Sign-in form variants
 * Controls spacing between form elements
 */
export const signinFormVariants = cva(['space-y-6'])

/**
 * Sign-in button container variants
 * Provides consistent spacing for the submit button
 */
export const signinButtonContainerVariants = cva([
  'mt-12 mb-2', // mt-12 for spacing from fields, mb-2 for INPUT_LABEL_SPACING
])

/**
 * Sign-in button variants
 * Brand-styled submit button with proper states
 */
export const signinButtonVariants = cva(
  [
    'w-full rounded-md px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50',
  ],
  {
    variants: {
      /**
       * Button color variants
       */
      color: {
        brand: 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600',
        primary:
          'bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600',
        teal: 'bg-teal-600 hover:bg-teal-700 focus-visible:outline-teal-600',
      },
      /**
       * Button size variants
       */
      size: {
        md: 'px-4 py-3 text-sm',
        lg: 'px-6 py-4 text-base',
      },
    },
    defaultVariants: {
      color: 'brand',
      size: 'md',
    },
  }
)

/**
 * Sign-in form footer variants
 * Container for remember me checkbox and signup link
 */
export const signinFormFooterVariants = cva(['flex items-center justify-between'])

/**
 * Sign-in checkbox container variants
 * Wrapper for remember me checkbox and label
 */
export const signinCheckboxContainerVariants = cva(['flex items-center gap-1.5'])

/**
 * Sign-in checkbox variants
 * Styled checkbox input with brand colors
 */
export const signinCheckboxVariants = cva(
  [
    'relative h-4 w-4 appearance-none rounded-sm border-2 bg-transparent transition-colors',
    'checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center',
    'checked:after:text-xs checked:after:content-["✓"]',
    'hover:ring-2 focus:ring-2',
  ],
  {
    variants: {
      /**
       * Checkbox color themes
       */
      theme: {
        teal: [
          'border-teal-600 dark:border-teal-400',
          'checked:border-teal-600 checked:bg-teal-600',
          'dark:checked:border-teal-400 dark:checked:bg-teal-400',
          'checked:after:text-white dark:checked:after:text-teal-900',
          'hover:ring-teal-500/20 focus:ring-teal-500/20',
          'dark:hover:ring-teal-300/20 dark:focus:ring-teal-300/20',
        ],
        emerald: [
          'border-emerald-600 dark:border-emerald-400',
          'checked:border-emerald-600 checked:bg-emerald-600',
          'dark:checked:border-emerald-400 dark:checked:bg-emerald-400',
          'checked:after:text-white dark:checked:after:text-emerald-900',
          'hover:ring-emerald-500/20 focus:ring-emerald-500/20',
          'dark:hover:ring-emerald-300/20 dark:focus:ring-emerald-300/20',
        ],
      },
    },
    defaultVariants: {
      theme: 'teal',
    },
  }
)

/**
 * Sign-in checkbox label variants with RTL support
 * Label styling for the remember me text
 */
/**
 * Sign-in form label variants with RTL support
 * Styling for form field labels
 */
export const signinFormLabelVariants = cva(
  ['text-foreground block text-sm font-medium'],
  {
    variants: {
      /**
       * Language-aware text alignment and typography
       */
      language: {
        nl: 'text-left',
        en: 'text-left',
        de: 'text-left',
        fr: 'text-left',
        ar: 'text-right font-arabic',
        tr: 'text-left',
      } as const,
    },
    defaultVariants: {
      language: 'nl',
    },
  }
)

export const signinCheckboxLabelVariants = cva(['text-foreground block text-sm'], {
  variants: {
    /**
     * Language-aware text alignment and typography
     */
    language: {
      nl: 'text-left',
      en: 'text-left',
      de: 'text-left',
      fr: 'text-left',
      ar: 'text-right font-arabic',
      tr: 'text-left',
    } as const,
  },
  defaultVariants: {
    language: 'nl',
  },
})

/**
 * Sign-in secondary text variants with RTL support
 * Styling for "Don't have an account?" text
 */
export const signinSecondaryTextVariants = cva(['text-center text-sm'], {
  variants: {
    /**
     * Text prominence levels
     */
    prominence: {
      normal: 'text-foreground',
      muted: 'text-foreground-light dark:text-foreground-lighter',
    },
    /**
     * Language-aware text alignment and typography
     */
    language: {
      nl: 'text-center',
      en: 'text-center',
      de: 'text-center',
      fr: 'text-center',
      ar: 'text-center font-arabic',
      tr: 'text-center',
    } as const,
  },
  defaultVariants: {
    prominence: 'muted',
    language: 'nl',
  },
})

/**
 * Sign-in link variants
 * Styling for the "Sign up" link with theme support
 */
export const signinLinkVariants = cva(['font-medium underline transition-colors'], {
  variants: {
    /**
     * Link color themes
     */
    theme: {
      teal: 'text-teal-600 hover:text-teal-700 dark:text-teal-300 dark:hover:text-teal-200',
      emerald:
        'text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200',
      brand:
        'text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200',
    },
  },
  defaultVariants: {
    theme: 'teal',
  },
})

// TypeScript type exports

export type SigninContainerVariants = VariantProps<typeof signinContainerVariants>
export type SigninFormContainerVariants = VariantProps<
  typeof signinFormContainerVariants
>
export type SigninFormWrapperVariants = VariantProps<typeof signinFormWrapperVariants>
export type SigninFormVariants = VariantProps<typeof signinFormVariants>
export type SigninButtonContainerVariants = VariantProps<
  typeof signinButtonContainerVariants
>
export type SigninButtonVariants = VariantProps<typeof signinButtonVariants>
export type SigninFormFooterVariants = VariantProps<typeof signinFormFooterVariants>
export type SigninCheckboxContainerVariants = VariantProps<
  typeof signinCheckboxContainerVariants
>
export type SigninCheckboxVariants = VariantProps<typeof signinCheckboxVariants>
export type SigninFormLabelVariants = VariantProps<typeof signinFormLabelVariants>
export type SigninCheckboxLabelVariants = VariantProps<
  typeof signinCheckboxLabelVariants
>
export type SigninSecondaryTextVariants = VariantProps<
  typeof signinSecondaryTextVariants
>
export type SigninLinkVariants = VariantProps<typeof signinLinkVariants>
