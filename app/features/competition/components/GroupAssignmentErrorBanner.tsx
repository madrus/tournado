import type { JSX } from 'react'

import { errorBannerVariants } from './groupAssignment.variants'

type GroupAssignmentErrorBannerProps = {
	error: string | null
	onDismiss: () => void
	dismissLabel: string
}

const ErrorIcon = ({ className }: Readonly<{ className?: string }>): JSX.Element => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 20 20'
		fill='currentColor'
		className={className}
		aria-hidden='true'
	>
		<path
			fillRule='evenodd'
			d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z'
			clipRule='evenodd'
		/>
	</svg>
)

const CloseIcon = ({ className }: Readonly<{ className?: string }>): JSX.Element => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 20 20'
		fill='currentColor'
		className={className}
		aria-hidden='true'
	>
		<path d='M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z' />
	</svg>
)

export const GroupAssignmentErrorBanner = ({
	error,
	onDismiss,
	dismissLabel,
}: Readonly<GroupAssignmentErrorBannerProps>): JSX.Element | null =>
	error ? (
		<div className={errorBannerVariants({ variant: 'error' })}>
			<ErrorIcon className='w-4 h-4 shrink-0' />
			<span>{error}</span>
			<button
				type='button'
				onClick={onDismiss}
				className='ms-auto text-error-600 hover:text-error-700 dark:text-error-400'
				aria-label={dismissLabel}
			>
				<CloseIcon className='w-4 h-4' />
			</button>
		</div>
	) : null
