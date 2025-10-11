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

export type { User, UserAuditLog }
