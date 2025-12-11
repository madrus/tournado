import type { Role, User } from '@prisma/client'
import { Text } from '@radix-ui/themes'
import { type JSX, type KeyboardEvent, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { FetcherWithComponents } from 'react-router'

import { datatableCellTextVariants } from '~/components/DataTable/dataTable.variants'
import { ComboField, type Option } from '~/components/inputs/ComboField'
import { useLanguageDirection } from '~/hooks/useLanguageDirection'
import { cn } from '~/utils/misc'

const ROLES: Role[] = ['PUBLIC', 'MANAGER', 'ADMIN', 'REFEREE', 'EDITOR', 'BILLING']

type UserMobileRowProps = {
	user: User
	onClick: () => void
	fetcher: FetcherWithComponents<unknown>
	currentUserId: string
}

export function UserMobileRow({
	user,
	onClick,
	fetcher,
	currentUserId,
}: Readonly<UserMobileRowProps>): JSX.Element {
	const { t } = useTranslation()
	const { latinFontClass } = useLanguageDirection()

	const roleOptions: Option[] = ROLES.map((role) => ({
		value: role,
		label: t(`roles.${role.toLowerCase()}`),
	}))

	const handleUserInfoClick = useCallback(() => {
		onClick()
	}, [onClick])

	const handleUserInfoKeyDown = useCallback(
		(event: KeyboardEvent<HTMLButtonElement>) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault()
				onClick()
			}
		},
		[onClick],
	)

	const handleRoleChange = useCallback(
		(newRole: string) => {
			if (newRole !== user.role) {
				const formData = new FormData()
				formData.set('intent', 'updateRole')
				formData.set('userId', user.id)
				formData.set('role', newRole)
				fetcher.submit(formData, { method: 'post' })
			}
		},
		[user.role, user.id, fetcher],
	)

	return (
		<div className='flex items-start justify-between gap-2 px-6 py-4'>
			<button
				type='button'
				className='min-w-0 flex-1 cursor-pointer rounded text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
				onClick={handleUserInfoClick}
				onKeyDown={handleUserInfoKeyDown}
				aria-label={t('users.actions.viewDetails', {
					name: user.displayName || user.email,
				})}
			>
				<Text
					weight='medium'
					className={cn(
						'block',
						datatableCellTextVariants({ variant: 'primary' }),
						latinFontClass,
					)}
				>
					{user.displayName || user.email}
				</Text>
				{user.displayName ? (
					<Text
						className={cn(
							'mt-1 block',
							datatableCellTextVariants({ variant: 'secondary' }),
							latinFontClass,
						)}
					>
						{user.email}
					</Text>
				) : null}
			</button>
			<div className='flex shrink-0 items-center'>
				<ComboField
					name={`role-${user.id}`}
					options={roleOptions}
					value={user.role}
					onChange={handleRoleChange}
					disabled={!user.active || user.id === currentUserId}
					compact={true}
					color='slate'
					className='w-32'
				/>
			</div>
		</div>
	)
}
