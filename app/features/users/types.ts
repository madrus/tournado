import type { User, UserAuditLog } from '@prisma/client'

export type UserWithAuditLogs = User & {
	auditLogs: UserAuditLog[]
}

export type AuditLogWithAdmin = UserAuditLog & {
	admin: {
		id: string
		email: string
		displayName: string | null
	}
}

/**
 * User management action response data
 */
export type UserActionData = {
	success?: boolean
	errors?: {
		role?: string
		displayName?: string
		deactivate?: string
		general?: string
	}
}

export type { User, UserAuditLog }
