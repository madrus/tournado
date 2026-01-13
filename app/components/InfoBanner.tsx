import { type VariantProps, cva } from 'class-variance-authority'
import type { JSX, ReactNode } from 'react'
import { cn } from '~/utils/misc'

/**
 * InfoBanner component for displaying informational messages
 * with semantic color variants.
 */

const infoBannerVariants = cva(
	['my-4 rounded-md border p-3 text-sm transition-colors duration-200'],
	{
		variants: {
			variant: {
				info: [
					'border-sky-700 bg-sky-700/10 text-sky-700',
					'dark:border-sky-300 dark:bg-sky-700/10 dark:text-sky-300',
				],
				warning: [
					'border-orange-700 bg-orange-700/10 text-orange-700',
					'dark:border-orange-300 dark:bg-orange-700/10 dark:text-orange-300',
				],
				success: [
					'border-emerald-700 bg-emerald-700/10 text-emerald-700',
					'dark:border-emerald-300 dark:bg-emerald-700/10 dark:text-emerald-300',
				],
				error: [
					'border-red-700 bg-red-700/10 text-red-700',
					'dark:border-red-300 dark:bg-red-700/10 dark:text-red-300',
				],
			},
		},
		defaultVariants: {
			variant: 'info',
		},
	},
)

export type InfoBannerProps = {
	children: ReactNode
	variant?: VariantProps<typeof infoBannerVariants>['variant']
	className?: string
}

export const InfoBanner = ({
	children,
	variant = 'info',
	className,
}: InfoBannerProps): JSX.Element => {
	// Use role="alert" for errors (implicit aria-live="assertive")
	// Use role="status" with aria-live="polite" for other variants
	const isError = variant === 'error'
	const ariaProps = isError
		? { role: 'alert' as const }
		: { role: 'status' as const, 'aria-live': 'polite' as const }

	return (
		<div className={cn(infoBannerVariants({ variant }), className)} {...ariaProps}>
			{children}
		</div>
	)
}
