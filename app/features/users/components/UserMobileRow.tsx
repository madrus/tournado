import type { Role, User } from '@prisma/client'
import { Text } from '@radix-ui/themes'
import type { JSX, MouseEvent } from 'react'
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

	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		// Don't trigger onClick if clicking on the combo field
		if (!(event.target as HTMLElement).closest('[role="combobox"]')) {
			onClick()
		}
	}

	return (
		<div
			className='cursor-pointer px-6 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
			onClick={handleClick}
			role='button'
			tabIndex={0}
			aria-label={t('users.viewUserDetails', {
				name: user.displayName || user.email,
			})}
		>
			<div className='flex items-start justify-between gap-4'>
				<div className='min-w-0 flex-1'>
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
				</div>
				<div className='flex-shrink-0' onClick={(event) => event.stopPropagation()}>
					<ComboField
						name={`role-${user.id}`}
						options={roleOptions}
						value={user.role}
						onChange={(newRole) => {
							if (newRole !== user.role) {
								const formData = new FormData()
								formData.set('intent', 'updateRole')
								formData.set('userId', user.id)
								formData.set('role', newRole)
								fetcher.submit(formData, { method: 'post' })
							}
						}}
						disabled={!user.active || user.id === currentUserId}
						compact={true}
						color='slate'
						className='w-32'
					/>
				</div>
			</div>
		</div>
	)
}
