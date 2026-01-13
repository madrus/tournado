import type { UserAuditLog } from '@prisma/client'
import { prisma } from '~/db.server'

export type { UserAuditLog }

type CreateAuditLogProps = {
	userId: string
	performedBy: string
	action:
		| 'role_change'
		| 'approval'
		| 'rejection'
		| 'profile_update'
		| 'deactivate'
		| 'reactivate'
	previousValue?: string
	newValue?: string
	reason?: string
}

export const createAuditLog = async (
	props: Readonly<CreateAuditLogProps>,
): Promise<UserAuditLog> => {
	const { userId, performedBy, action, previousValue, newValue, reason } = props

	return prisma.userAuditLog.create({
		data: {
			userId,
			performedBy,
			action,
			previousValue,
			newValue,
			reason,
		},
	})
}

type GetUserAuditLogsProps = {
	userId: string
	limit?: number
}

export const getUserAuditLogs = async (
	props: Readonly<GetUserAuditLogsProps>,
): Promise<
	readonly (UserAuditLog & {
		admin: {
			id: string
			email: string
			displayName: string | null
		}
	})[]
> => {
	const { userId, limit = 50 } = props

	return prisma.userAuditLog.findMany({
		where: { userId },
		orderBy: { createdAt: 'desc' },
		take: limit,
		include: {
			admin: {
				select: {
					id: true,
					email: true,
					displayName: true,
				},
			},
		},
	})
}

type GetRecentAuditLogsProps = {
	limit?: number
}

export const getRecentAuditLogs = async (
	props: Readonly<GetRecentAuditLogsProps> = {},
): Promise<
	readonly (UserAuditLog & {
		user: {
			id: string
			email: string
			displayName: string | null
			role: string
		}
		admin: {
			id: string
			email: string
			displayName: string | null
		}
	})[]
> => {
	const { limit = 100 } = props

	return prisma.userAuditLog.findMany({
		orderBy: { createdAt: 'desc' },
		take: limit,
		include: {
			user: {
				select: {
					id: true,
					email: true,
					displayName: true,
					role: true,
				},
			},
			admin: {
				select: {
					id: true,
					email: true,
					displayName: true,
				},
			},
		},
	})
}
