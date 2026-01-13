import { cva } from 'class-variance-authority'

/**
 * Auth page container variants
 * Main container for auth forms with centered layout
 */
export const authContainerVariants = cva(['mx-auto max-w-md space-y-6'])

/**
 * Auth page heading variants
 * Used for page titles on sign-in/sign-up pages
 */
export const authHeadingVariants = cva([
  'text-center font-bold text-2xl',
  'text-teal-700 dark:text-teal-50/80',
])

/**
 * Auth divider section variants
 * Creates the "OR" divider between auth methods
 */
export const authDividerContainerVariants = cva(['relative'])

export const authDividerLineContainerVariants = cva([
  'absolute inset-0 flex items-center',
])

export const authDividerLineVariants = cva(['w-full border-t'])

export const authDividerTextContainerVariants = cva([
  'relative flex justify-center text-xs uppercase',
])

export const authDividerTextVariants = cva(['bg-background px-2 text-muted-foreground'])

/**
 * Auth footer text variants
 * Used for bottom paragraph with navigation link
 */
export const authFooterTextVariants = cva([
  'text-center text-sm',
  'text-teal-700 dark:text-teal-50/80',
])

/**
 * Auth text spacing variants
 * Used for inline spacing before links (RTL-friendly)
 */
export const authTextSpacingVariants = cva(['me-1'])

/**
 * Auth page link variants
 * Used for navigation links between sign-in/sign-up pages
 */
export const authLinkVariants = cva([
  'underline',
  'text-amber-600 hover:text-amber-400/80',
  'dark:text-amber-400 dark:hover:text-amber-600/80',
])
