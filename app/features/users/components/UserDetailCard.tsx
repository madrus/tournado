import type { Role, User } from '@prisma/client'
import { type JSX, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'react-router'
import { Badge } from '~/components/Badge'
import { ConfirmDialog } from '~/components/ConfirmDialog'
import { Panel } from '~/components/Panel'
import { ActionButton } from '~/components/buttons/ActionButton'
import { ComboField, type Option } from '~/components/inputs/ComboField'
import { TextInputField } from '~/components/inputs/TextInputField'
import { VALID_ROLES } from '~/features/users/utils/roleUtils'
import { useLanguageDirection } from '~/hooks/useLanguageDirection'

const USER_ACTIVE_BUTTON_COLOR = 'error' as const
const USER_INACTIVE_BUTTON_COLOR = 'warning' as const

type UserDetailCardProps = {
	user: User
	currentUserId: string
	isSubmitting?: boolean
}

export const UserDetailCard = (props: Readonly<UserDetailCardProps>): JSX.Element => {
	const { user, currentUserId, isSubmitting = false } = props
	const { t } = useTranslation()
	const { latinFontClass } = useLanguageDirection()
	const displayNameFormRef = useRef<HTMLFormElement>(null)
	const roleFormRef = useRef<HTMLFormElement>(null)
	const deactivateFormRef = useRef<HTMLFormElement>(null)
	const [displayName, setDisplayName] = useState(user.displayName || '')
	const [selectedRole, setSelectedRole] = useState<Role>(user.role)
	const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
	const isViewingOwnProfile = user.id === currentUserId
	const isDeactivated = !user.active
	const buttonColor = user.active
		? USER_ACTIVE_BUTTON_COLOR
		: USER_INACTIVE_BUTTON_COLOR

	// Sync local state when user prop changes (e.g., browser back/forward navigation)
	useEffect(() => {
		setDisplayName(user.displayName || '')
		setSelectedRole(user.role)
	}, [user.displayName, user.role])

	// Close dialog when submission completes
	const wasSubmittingRef = useRef(false)
	useEffect(() => {
		if (wasSubmittingRef.current && !isSubmitting) {
			setIsDeactivateDialogOpen(false)
		}
		wasSubmittingRef.current = isSubmitting
	}, [isSubmitting])

	// Convert VALID_ROLES to ComboField options format
	const roleOptions: Option[] = VALID_ROLES.map((role) => ({
		value: role,
		label: t(`roles.${role.toLowerCase()}`),
	}))

	const handleRoleChange = (newRole: string) => {
		setSelectedRole(newRole as Role)
		// Auto-submit the form when role changes to a different value
		if (newRole !== user.role) {
			// Use setTimeout to ensure the state is updated before submitting
			setTimeout(() => {
				roleFormRef.current?.requestSubmit()
			}, 0)
		}
	}

	const submitDeactivateForm = useCallback(() => {
		if (isSubmitting) {
			return
		}

		const form = deactivateFormRef.current
		if (!form) {
			return
		}

		form.requestSubmit()
	}, [isSubmitting])

	return (
		<Panel color='teal' variant='content-panel'>
			{/* Header with Deactivate/Reactivate Button */}
			<div className='mb-4 flex items-center justify-between gap-4'>
				<div className='flex flex-1 items-baseline gap-3'>
					<h2 className='font-semibold text-xl'>{t('users.titles.userInformation')}</h2>
					{!user.active ? (
						<Badge color='error'>{t('users.messages.deactivated')}</Badge>
					) : null}
				</div>
				<div className='flex shrink-0 items-center'>
					<Form
						ref={deactivateFormRef}
						method='post'
						data-testid='user-detail-deactivate-form'
					>
						<input
							type='hidden'
							name='intent'
							value={user.active ? 'deactivate' : 'reactivate'}
						/>
						<input type='hidden' name='userId' value={user.id} />
					</Form>
					<ActionButton
						type='button'
						color={buttonColor}
						variant='primary'
						disabled={isSubmitting || isViewingOwnProfile}
						onClick={() => setIsDeactivateDialogOpen(true)}
					>
						{user.active
							? t('users.actions.deactivateUser')
							: t('users.actions.reactivateUser')}
					</ActionButton>
					<ConfirmDialog
						open={isDeactivateDialogOpen}
						onOpenChange={setIsDeactivateDialogOpen}
						title={
							user.active
								? t('users.titles.deactivateUser')
								: t('users.titles.reactivateUser')
						}
						description={
							user.active
								? t('users.messages.confirmDeactivate')
								: t('users.messages.confirmReactivate')
						}
						intent={user.active ? 'danger' : 'warning'}
						confirmLabel={
							user.active
								? t('users.actions.deactivateUser')
								: t('users.actions.reactivateUser')
						}
						cancelLabel={t('common.actions.cancel')}
						onConfirm={submitDeactivateForm}
						destructive={user.active}
						isLoading={isSubmitting}
					/>
				</div>
			</div>

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				<div>
					<div className='font-medium text-foreground/80 text-sm'>
						{t('users.fields.email')}
					</div>
					<div className={`mt-1 text-foreground ${latinFontClass}`}>{user.email}</div>
				</div>

				<div>
					<div className='font-medium text-foreground/80 text-sm'>
						{t('users.fields.createdAt')}
					</div>
					<div className={`mt-1 text-foreground ${latinFontClass}`}>
						{new Date(user.createdAt).toLocaleString()}
					</div>
				</div>

				<Form
					ref={displayNameFormRef}
					method='post'
					data-testid='user-detail-display-name-form'
				>
					<input type='hidden' name='intent' value='updateDisplayName' />
					<input type='hidden' name='userId' value={user.id} />

					<TextInputField
						name='displayName'
						label={t('users.fields.displayName')}
						value={displayName}
						onChange={(value) => setDisplayName(value)}
						placeholder={t('users.placeholders.displayName')}
						disabled={isSubmitting || isDeactivated}
						color='teal'
						className={latinFontClass}
						onBlur={(event) => {
							// Auto-submit on blur if value changed
							if (displayName !== (user.displayName || '')) {
								const form = event.currentTarget.closest('form')
								if (form && typeof form.requestSubmit === 'function') {
									form.requestSubmit()
								}
							}
						}}
					/>
				</Form>

				<Form ref={roleFormRef} method='post' data-testid='user-detail-role-form'>
					<input type='hidden' name='intent' value='updateRole' />

					<ComboField
						name='role'
						label={t('users.fields.assignedRole')}
						options={roleOptions}
						value={selectedRole}
						onChange={handleRoleChange}
						disabled={isSubmitting || isViewingOwnProfile || isDeactivated}
						color='teal'
					/>
				</Form>
			</div>
		</Panel>
	)
}
