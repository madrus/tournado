import { cva } from 'class-variance-authority'

/**
 * Form wrapper variants for Firebase authentication forms
 */
export const firebaseAuthFormVariants = cva('flex flex-col gap-4 w-full', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/**
 * Label text variants for Firebase authentication form inputs
 */
export const firebaseAuthLabelVariants = cva('text-teal-700 dark:text-teal-50/80')
