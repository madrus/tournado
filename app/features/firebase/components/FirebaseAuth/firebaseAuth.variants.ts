import { cva } from 'class-variance-authority'

/**
 * Form wrapper variants for Firebase authentication forms
 */
export const firebaseAuthFormVariants = cva('flex w-full flex-col gap-4', {
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
export const firebaseAuthLabelVariants = cva('', {
	variants: {
		color: {
			brand: 'text-red-700 dark:text-red-50/80',
			primary: 'text-emerald-700 dark:text-emerald-50/80',
			teal: 'text-teal-700 dark:text-teal-50/80',
			blue: 'text-blue-700 dark:text-blue-50/80',
			slate: 'text-slate-700 dark:text-slate-50/80',
			cyan: 'text-cyan-700 dark:text-cyan-50/80',
			indigo: 'text-indigo-700 dark:text-indigo-50/80',
		},
	},
	defaultVariants: {
		color: 'teal',
	},
})
