import type { User, UserAuditLog } from '@prisma/client'
import type { JSX } from 'react'
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
	useLoaderData,
	useNavigation,
} from 'react-router'

import { UserAuditLogList } from '~/features/users/components/UserAuditLogList'
import { UserDetailCard } from '~/features/users/components/UserDetailCard'
import { useUserActionFeedback } from '~/features/users/hooks/useUserActionFeedback'
import { validateRole } from '~/features/users/utils/roleUtils'
import {
	deactivateUser,
	getUserById,
	reactivateUser,
	updateUserDisplayName,
	updateUserRole,
} from '~/models/user.server'
import { getUserAuditLogs } from '~/models/userAuditLog.server'
import { STATS_PANEL_MIN_WIDTH } from '~/styles/constants'
import { adminPath } from '~/utils/adminRoutes'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'

export const handle: RouteMetadata = {
	authorization: {
		requiredRoles: ['ADMIN'],
	},
}

type LoaderData = {
	targetUser: User
	currentUserId: string
	auditLogs: readonly (UserAuditLog & {
		admin: {
			id: string
			email: string
			displayName: string | null
		}
	})[]
}

export const loader = async ({
	request,
	params,
}: LoaderFunctionArgs): Promise<LoaderData> => {
	const currentUser = await requireUserWithMetadata(request, handle)

	const { userId } = params
	if (!userId) {
		throw new Response('User ID required', { status: 400 })
	}

	const [targetUser, auditLogs] = await Promise.all([
		getUserById(userId),
		getUserAuditLogs({ userId, limit: 50 }),
	])

	if (!targetUser) {
		throw new Response('User not found', { status: 404 })
	}

	return { targetUser, currentUserId: currentUser.id, auditLogs }
}

export const action = async ({
	request,
	params,
}: ActionFunctionArgs): Promise<Response> => {
	const currentUser = await requireUserWithMetadata(request, handle)

	const { userId } = params
	if (!userId) {
		return redirect(adminPath('/users?error=userNotFound'))
	}

	const formData = await request.formData()
	const intent = formData.get('intent')
	const roleValue = formData.get('role')
	const formUserId = formData.get('userId')

	const requiresUserId = intent === 'deactivate' || intent === 'reactivate'
	if (requiresUserId) {
		if (typeof formUserId !== 'string' || !formUserId.trim()) {
			return redirect(adminPath(`/users/${userId}?error=requestFailed`))
		}

		if (formUserId !== userId) {
			return redirect(adminPath(`/users/${userId}?error=requestFailedRefresh`))
		}
	}

	try {
		if (intent === 'updateDisplayName') {
			const displayName = (formData.get('displayName') as string) || ''

			if (!displayName.trim()) {
				return redirect(adminPath(`/users/${userId}?error=displayNameRequired`))
			}

			await updateUserDisplayName({
				userId,
				displayName,
				performedBy: currentUser.id,
			})

			return redirect(adminPath(`/users/${userId}?success=displayName`))
		}

		if (intent === 'updateRole') {
			// Prevent users from changing their own role
			if (userId === currentUser.id) {
				return redirect(adminPath(`/users/${userId}?error=cannotChangeOwnRole`))
			}

			const newRole = validateRole(roleValue)

			await updateUserRole({
				userId,
				newRole,
				performedBy: currentUser.id,
			})

			return redirect(adminPath(`/users/${userId}?success=role`))
		}

		if (intent === 'deactivate') {
			// Prevent users from deactivating themselves
			if (userId === currentUser.id) {
				return redirect(adminPath(`/users/${userId}?error=cannotDeactivateOwnAccount`))
			}

			await deactivateUser({
				userId,
				performedBy: currentUser.id,
			})

			return redirect(adminPath(`/users/${userId}?success=deactivate`))
		}

		if (intent === 'reactivate') {
			// Prevent users from reactivating themselves (this should never happen since they're active)
			if (userId === currentUser.id) {
				return redirect(adminPath(`/users/${userId}?error=cannotReactivateOwnAccount`))
			}

			await reactivateUser({
				userId,
				performedBy: currentUser.id,
			})

			return redirect(adminPath(`/users/${userId}?success=reactivate`))
		}

		throw new Response('Invalid intent', { status: 400 })
	} catch (error) {
		if (error instanceof Response) {
			throw error
		}
		const errorMessage = error instanceof Error ? error.message : 'unknownError'
		return redirect(
			adminPath(`/users/${userId}?error=${encodeURIComponent(errorMessage)}`),
		)
	}
}

export default function UserDetailRoute(): JSX.Element {
	const { targetUser, currentUserId, auditLogs } = useLoaderData<typeof loader>()
	const navigation = useNavigation()

	const isSubmitting = navigation.state === 'submitting'

	useUserActionFeedback()

	return (
		<div className={cn('w-full max-w-4xl space-y-6', STATS_PANEL_MIN_WIDTH)}>
			<UserDetailCard
				user={targetUser}
				currentUserId={currentUserId}
				isSubmitting={isSubmitting}
			/>
			<UserAuditLogList auditLogs={auditLogs} />
		</div>
	)
}
