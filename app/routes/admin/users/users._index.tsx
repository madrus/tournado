import type { User } from '@prisma/client'
import type { SortingState } from '@tanstack/react-table'
import { type JSX, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import {
	redirect,
	useFetcher,
	useLoaderData,
	useNavigate,
	useSearchParams,
} from 'react-router'

import { DataTable, DataTablePagination } from '~/components/DataTable'
import { GroupIcon } from '~/components/icons'
import { Panel } from '~/components/Panel'
import { createUserColumns, UserMobileRow } from '~/features/users/components'
import { validateRole } from '~/features/users/utils/roleUtils'
import { useLanguageDirection } from '~/hooks/useLanguageDirection'
import { getServerT } from '~/i18n/i18n.server'
import { getAllUsersWithPagination, updateUserRole } from '~/models/user.server'
import { STATS_PANEL_MIN_WIDTH } from '~/styles/constants'
import { adminPath } from '~/utils/adminRoutes'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'
import { toast } from '~/utils/toastUtils'

import type { Route } from './+types/users._index'

// Local constants
const PANEL_COLOR = 'teal' as const

// Route metadata - requires users read permission
export const handle: RouteMetadata = {
	isPublic: false,
	auth: {
		required: true,
		redirectTo: '/auth/signin',
		preserveRedirect: true,
	},
	authorization: {
		requiredRoles: ['ADMIN'],
		redirectTo: '/unauthorized',
	},
}

export const meta: MetaFunction = () => [
	{ title: 'User Management | Admin | Tournado' },
	{
		name: 'description',
		content:
			'Manage all users in the system. View, edit user roles and oversee user accounts.',
	},
	{ property: 'og:title', content: 'User Management | Admin | Tournado' },
	{
		property: 'og:description',
		content:
			'Manage all users in the system. View, edit user roles and oversee user accounts.',
	},
	{ property: 'og:type', content: 'website' },
]

type LoaderData = {
	users: readonly User[]
	total: number
	currentUserId: string
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
	// Require user with role-based authorization for UI route access
	const currentUser = await requireUserWithMetadata(request, handle)

	// Get pagination parameters from URL search params
	const url = new URL(request.url)
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
	const pageSize = 50 // Reasonable page size for performance

	const { users, total } = await getAllUsersWithPagination({
		page,
		pageSize,
	})

	return { users, total, currentUserId: currentUser.id }
}

export async function action({ request }: Route.ActionArgs): Promise<Response> {
	// Require user with role-based authorization for role assignment action
	const currentUser = await requireUserWithMetadata(request, handle)
	const t = getServerT(request) // Get translation function for user's language

	const formData = await request.formData()
	const intent = formData.get('intent')

	if (intent === 'updateRole') {
		const userId = formData.get('userId') as string
		const roleValue = formData.get('role')

		if (!userId) {
			return redirect(
				adminPath('?error=') + encodeURIComponent(t('messages.user.missingUserId')),
			)
		}

		// Prevent users from changing their own role
		if (userId === currentUser.id) {
			return redirect(
				adminPath('?error=') +
					encodeURIComponent(t('messages.user.cannotChangeOwnRole')),
			)
		}

		try {
			const newRole = validateRole(roleValue)

			await updateUserRole({
				userId,
				newRole,
				performedBy: currentUser.id,
				// No reason provided for quick role updates from user list
				// Admin can view full audit trail on user detail page
			})
			return redirect(adminPath('?success=true'))
		} catch (error) {
			if (error instanceof Response) {
				throw error
			}
			const errorMessage =
				error instanceof Error ? error.message : t('messages.user.failedToUpdateRole')
			return redirect(adminPath(`?error=${encodeURIComponent(errorMessage)}`))
		}
	}

	return redirect(adminPath(`?error=${encodeURIComponent('Invalid action')}`))
}

export function AdminUsersIndexPage(): JSX.Element {
	const { t, i18n } = useTranslation()
	const { users, total, currentUserId } = useLoaderData<LoaderData>()
	const [searchParams, setSearchParams] = useSearchParams()
	const navigate = useNavigate()
	const { latinFontClass } = useLanguageDirection()
	const fetcher = useFetcher()

	// Sorting state
	const [sorting, setSorting] = useState<SortingState>([])

	// Handle success and error toasts
	useEffect(() => {
		const success = searchParams.get('success')
		const error = searchParams.get('error')

		if (success === 'true') {
			toast.success(t('users.messages.roleUpdatedSuccessfully'))
		}

		if (error) {
			toast.error(decodeURIComponent(error))
		}

		// Clean up search params after showing toasts
		if (success || error) {
			searchParams.delete('success')
			searchParams.delete('error')
			setSearchParams(searchParams, { replace: true })
		}
	}, [searchParams, setSearchParams, t])

	const handleUserClick = (userId: string) => {
		navigate(adminPath(`/users/${userId}`))
	}

	// Pagination calculations
	const pageSize = 50
	const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
	const totalPages = Math.ceil(total / pageSize)
	const hasNextPage = currentPage < totalPages
	const hasPrevPage = currentPage > 1

	const formatDate = useCallback(
		(date: Date | string): string => {
			const dateObj = typeof date === 'string' ? new Date(date) : date
			return dateObj.toLocaleDateString(i18n.language, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			})
		},
		[i18n.language],
	)

	// Create columns with memoization to prevent unnecessary re-renders
	// biome-ignore lint/correctness/useExhaustiveDependencies: We want to memoize the columns to prevent unnecessary re-renders
	const columns = useMemo(
		() =>
			createUserColumns({
				t,
				formatDate,
				onEdit: handleUserClick,
				latinFontClass,
				fetcher,
				currentUserId,
			}),
		[t, formatDate, latinFontClass, fetcher, currentUserId],
	)

	return (
		<div className='space-y-6' data-testid='admin-users-page-content'>
			{/* Stats using optimized dashboard panels */}
			<div
				className={cn('grid w-full max-w-4xl grid-cols-1 gap-5', STATS_PANEL_MIN_WIDTH)}
			>
				<Panel
					color={PANEL_COLOR}
					variant='dashboard-panel'
					icon={<GroupIcon size={24} variant='outlined' />}
					iconColor='brand'
					title={t('users.titles.totalUsers', 'Total Users')}
					showGlow
					data-testid='users-total-stat'
				>
					{total}
				</Panel>
			</div>

			{/* Users List */}
			<div className={cn('mb-6 w-full max-w-4xl', STATS_PANEL_MIN_WIDTH)}>
				<Panel color={PANEL_COLOR} variant='content-panel'>
					<DataTable
						data={[...users]}
						columns={columns}
						sorting={sorting}
						onSortingChange={setSorting}
						onRowClick={(row) => handleUserClick(row.id)}
						renderMobileRow={(row) => (
							<UserMobileRow
								key={row.id}
								user={row}
								onClick={() => handleUserClick(row.id)}
								fetcher={fetcher}
								currentUserId={currentUserId}
							/>
						)}
						emptyState={
							users.length === 0 ? (
								<div className='py-12 text-center'>
									<div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100'>
										<GroupIcon className='text-slate-400' size={24} />
									</div>
									<p className='mb-2 font-medium text-base text-slate-900'>
										{t('users.messages.noUsers', 'No users found')}
									</p>
									<p className='mb-6 text-slate-600 text-sm'>
										{t(
											'users.messages.noUsersDescription',
											'No users have been created yet.',
										)}
									</p>
								</div>
							) : undefined
						}
					/>

					{/* Pagination Controls - Using ShadCN pattern */}
					{users.length > 0 ? (
						<DataTablePagination
							currentPage={currentPage}
							totalPages={totalPages}
							pageSize={pageSize}
							total={total}
							hasPrevPage={hasPrevPage}
							hasNextPage={hasNextPage}
						/>
					) : null}
				</Panel>
			</div>
		</div>
	)
}

// Default export for React Router
export default AdminUsersIndexPage
