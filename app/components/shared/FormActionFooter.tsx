import { type ButtonHTMLAttributes, type JSX, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlocker } from 'react-router'
import { ActionButton } from '~/components/buttons/ActionButton'
import { ConfirmDialog } from '~/components/ConfirmDialog'
import { RestorePageIcon } from '~/components/icons'
import type { IconName } from '~/utils/iconUtils'
import type { Permission } from '~/utils/rbac'

type FormActionFooterProps = {
	isDirty: boolean
	primaryLabel: string
	onPrimary?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
	primaryDisabled?: boolean
	primaryType?: ButtonHTMLAttributes<HTMLButtonElement>['type']
	primaryPermission?: Permission
	primaryDataTestId?: string
	primaryClassName?: string
	primaryIcon?: IconName
	secondaryLabel?: string
	onSecondary?: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
	secondaryDisabled?: boolean
	secondaryPermission?: Permission
	secondaryDataTestId?: string
	secondaryClassName?: string
	confirmTitle?: string
	confirmDescription?: string
	confirmProceedLabel?: string
	confirmCancelLabel?: string
}

export function FormActionFooter({
	isDirty,
	primaryLabel,
	onPrimary,
	primaryDisabled,
	primaryType = 'button',
	primaryPermission,
	primaryDataTestId,
	primaryClassName,
	primaryIcon = 'check_circle',
	secondaryLabel,
	onSecondary,
	secondaryDisabled,
	secondaryPermission,
	secondaryDataTestId,
	secondaryClassName,
	confirmTitle,
	confirmDescription,
	confirmProceedLabel,
	confirmCancelLabel,
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
			<div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
				{isDirty ? (
					<span
						className='text-sm text-warning-600 dark:text-warning-400'
						data-testid='form-unsaved-warning'
					>
						{t('competition.groupAssignment.unsavedChanges')}
					</span>
				) : null}
				<div className='ms-auto flex items-center gap-3 rtl:flex-row-reverse rtl:ms-0 rtl:me-auto'>
					<ActionButton
						type='button'
						variant='secondary'
						color='brand'
						onClick={onSecondary}
						disabled={secondaryDisabled}
						permission={secondaryPermission}
						className={secondaryClassName}
						data-testid={secondaryDataTestId ?? 'form-action-secondary'}
					>
						<span className='flex items-center gap-2 rtl:flex-row-reverse'>
							<RestorePageIcon className='h-6 w-6 order-1 rtl:order-2' size={24} />
							<span className='order-2 rtl:order-1'>
								{secondaryLabel ?? t('common.actions.cancel')}
							</span>
						</span>
					</ActionButton>
					<ActionButton
						type={primaryType}
						variant='primary'
						color='brand'
						icon={primaryIcon}
						onClick={onPrimary}
						disabled={primaryDisabled}
						permission={primaryPermission}
						className={primaryClassName}
						data-testid={primaryDataTestId ?? 'form-action-primary'}
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
				title={confirmTitle ?? t('competition.groupAssignment.unsavedTitle')}
				description={
					confirmDescription ?? t('competition.groupAssignment.unsavedDescription')
				}
				confirmLabel={
					confirmProceedLabel ?? t('competition.groupAssignment.leaveAnyway')
				}
				cancelLabel={confirmCancelLabel ?? t('competition.groupAssignment.stayOnPage')}
				intent='warning'
			/>
		</>
	)
}
