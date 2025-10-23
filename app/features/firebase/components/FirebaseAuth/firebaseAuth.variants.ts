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
