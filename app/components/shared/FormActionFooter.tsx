import { type ButtonHTMLAttributes, type JSX, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlocker } from 'react-router'
import { ActionButton } from '~/components/buttons/ActionButton'
import { ConfirmDialog } from '~/components/ConfirmDialog'
import { RestorePageIcon } from '~/components/icons'
import { cn } from '~/utils/misc'
import type { Permission } from '~/utils/rbac'

type FormActionFooterProps = {
	isDirty: boolean
	primaryLabel: string
	onPrimary?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
	primaryDisabled?: boolean
	primaryPermission?: Permission
	secondaryLabel?: string
	onSecondary?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
	secondaryDisabled?: boolean
	secondaryPermission?: Permission
}

export function FormActionFooter({
	isDirty,
	primaryLabel,
	onPrimary,
	primaryDisabled,
	primaryPermission,
	secondaryLabel,
	onSecondary,
	secondaryDisabled,
	secondaryPermission,
}: FormActionFooterProps): JSX.Element {
	const { t } = useTranslation()
	const blocker = useBlocker(
		({ currentLocation, nextLocation }) =>
			isDirty && currentLocation.pathname !== nextLocation.pathname,
	)
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)

	useEffect(() => {
		if (blocker.state === 'blocked') {
			setIsConfirmOpen(true)
		}
	}, [blocker.state])

	const handleConfirmLeave = () => {
		setIsConfirmOpen(false)
		blocker.proceed?.()
	}

	const handleCancelLeave = () => {
		setIsConfirmOpen(false)
		blocker.reset?.()
	}

	return (
		<>
			<div
				className={cn(
					'flex flex-col gap-2 md:flex-row md:items-center md:justify-between',
					!isDirty && 'md:justify-end',
				)}
			>
				{isDirty ? (
					<span
						className='text-sm text-warning-600 dark:text-warning-400'
						data-testid='form-unsaved-warning'
					>
						{t('competition.groupAssignment.unsavedChanges')}
					</span>
				) : null}
				<div className='flex items-center gap-3'>
					<ActionButton
						type='button'
						variant='secondary'
						color='brand'
						onClick={onSecondary}
						disabled={secondaryDisabled}
						permission={secondaryPermission}
						className='w-full hover:scale-100 md:w-fit md:hover:scale-105'
						data-testid='form-action-secondary'
					>
						<span className='flex items-center gap-2'>
							<RestorePageIcon className='h-6 w-6' size={24} />
							<span>{secondaryLabel ?? t('common.actions.cancel')}</span>
						</span>
					</ActionButton>
					<ActionButton
						type='submit'
						variant='primary'
						color='brand'
						icon='check_circle'
						onClick={onPrimary}
						disabled={primaryDisabled}
						permission={primaryPermission}
						className='w-full hover:scale-100 md:w-fit md:hover:scale-105'
						data-testid='form-action-primary'
					>
						{primaryLabel}
					</ActionButton>
				</div>
			</div>

			<ConfirmDialog
				open={isConfirmOpen}
				onOpenChange={(open) => {
					if (!open) {
						handleCancelLeave()
					}
				}}
				onConfirm={handleConfirmLeave}
				title={t('competition.groupAssignment.unsavedTitle')}
				description={t('competition.groupAssignment.unsavedDescription')}
				confirmLabel={t('competition.groupAssignment.leaveAnyway')}
				cancelLabel={t('competition.groupAssignment.stayOnPage')}
				intent='warning'
			/>
		</>
	)
}
