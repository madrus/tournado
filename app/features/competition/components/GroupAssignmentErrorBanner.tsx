import type { JSX } from 'react'
import { renderIcon } from '~/utils/iconUtils'
import { errorBannerVariants } from './groupAssignment.variants'

type GroupAssignmentErrorBannerProps = {
	error: string | null
	onDismiss: () => void
	dismissLabel: string
}

export const GroupAssignmentErrorBanner = ({
	error,
	onDismiss,
	dismissLabel,
}: Readonly<GroupAssignmentErrorBannerProps>): JSX.Element | null =>
	error ? (
		<div className={errorBannerVariants({ variant: 'error' })}>
			{renderIcon('error', { className: 'w-4 h-4 shrink-0' })}
			<span>{error}</span>
			<button
				type='button'
				onClick={onDismiss}
				className='ms-auto text-error-600 hover:text-error-700 dark:text-error-400'
				aria-label={dismissLabel}
			>
				{renderIcon('close', { className: 'w-4 h-4' })}
			</button>
		</div>
	) : null
