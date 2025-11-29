import { cva } from 'class-variance-authority'

import type { ColorVariantKey } from '~/components/shared/colorVariants'

export const badgeVariants = cva(
	'inline-flex items-center rounded-full px-3 py-0.5 font-medium text-sm',
	{
		variants: {
			color: {
				// Functional Semantics (7)
				brand: 'bg-red-600 text-red-50 dark:bg-red-800 dark:text-red-50',
				primary:
					'bg-emerald-600 text-emerald-50 dark:bg-emerald-800 dark:text-emerald-50',
				success: 'bg-green-600 text-green-50 dark:bg-green-800 dark:text-green-50',
				error: 'bg-red-600 text-red-50 dark:bg-red-800 dark:text-red-50',
				warning: 'bg-yellow-600 text-yellow-50 dark:bg-yellow-800 dark:text-yellow-50',
				info: 'bg-blue-600 text-blue-50 dark:bg-blue-800 dark:text-blue-50',
				disabled: 'bg-slate-600 text-slate-50 dark:bg-slate-800 dark:text-slate-50',

				// Visual Accents (6)
				'accent-amber':
					'bg-amber-600 text-amber-50 dark:bg-amber-800 dark:text-amber-50',
				'accent-indigo':
					'bg-indigo-600 text-indigo-50 dark:bg-indigo-800 dark:text-indigo-50',
				'accent-fuchsia':
					'bg-fuchsia-600 text-fuchsia-50 dark:bg-fuchsia-800 dark:text-fuchsia-50',
				'accent-teal': 'bg-teal-600 text-teal-50 dark:bg-teal-800 dark:text-teal-50',
				'accent-sky': 'bg-sky-600 text-sky-50 dark:bg-sky-800 dark:text-sky-50',
				'accent-purple':
					'bg-purple-600 text-purple-50 dark:bg-purple-800 dark:text-purple-50',

				// Real Colors (13)
				emerald:
					'bg-emerald-600 text-emerald-50 dark:bg-emerald-800 dark:text-emerald-50',
				blue: 'bg-blue-600 text-blue-50 dark:bg-blue-800 dark:text-blue-50',
				slate: 'bg-slate-600 text-slate-50 dark:bg-slate-800 dark:text-slate-50',
				teal: 'bg-teal-600 text-teal-50 dark:bg-teal-800 dark:text-teal-50',
				red: 'bg-red-600 text-red-50 dark:bg-red-800 dark:text-red-50',
				yellow: 'bg-yellow-600 text-yellow-50 dark:bg-yellow-800 dark:text-yellow-50',
				green: 'bg-green-600 text-green-50 dark:bg-green-800 dark:text-green-50',
				amber: 'bg-amber-600 text-amber-50 dark:bg-amber-800 dark:text-amber-50',
				sky: 'bg-sky-600 text-sky-50 dark:bg-sky-800 dark:text-sky-50',
				indigo: 'bg-indigo-600 text-indigo-50 dark:bg-indigo-800 dark:text-indigo-50',
				purple: 'bg-purple-600 text-purple-50 dark:bg-purple-800 dark:text-purple-50',
				fuchsia:
					'bg-fuchsia-600 text-fuchsia-50 dark:bg-fuchsia-800 dark:text-fuchsia-50',
				lime: 'bg-lime-600 text-lime-50 dark:bg-lime-800 dark:text-lime-50',
			} satisfies Record<ColorVariantKey, string>,
		},
		defaultVariants: {
			color: 'slate',
		},
	},
)
