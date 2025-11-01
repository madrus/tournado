/* eslint-disable id-blacklist */
import type { Role, User } from '@prisma/client'

import { prisma } from '~/db.server'
import {
  disableFirebaseUser,
  enableFirebaseUser,
  revokeRefreshTokens,
} from '~/features/firebase/server'

export type { User } from '@prisma/client'

export const getUserById = async (id: User['id']): Promise<User | null> =>
  prisma.user.findUnique({ where: { id } })

export const getUserByEmail = async (email: User['email']): Promise<User | null> =>
  prisma.user.findUnique({ where: { email } })

// Legacy createUser function removed - use Firebase authentication instead

export const deleteUserByEmail = async (email: User['email']): Promise<User> =>
  prisma.user.delete({ where: { email } })

// Legacy verifySignin function removed - use Firebase authentication instead

export async function createUserFromFirebase({
  firebaseUid,
  email,
  displayName,
}: {
  firebaseUid: string
  email: string
  displayName?: string | null
}): Promise<User> {
  const [firstName, ...lastNameParts] = (displayName || email.split('@')[0]).split(' ')
  const lastName = lastNameParts.join(' ') || ''

  return prisma.user.create({
    data: {
      firebaseUid, // Now required field
      email,
      firstName: firstName || 'User',
      lastName: lastName || '',
      role: 'PUBLIC',
    },
  })
}

export const getUserByFirebaseUid = async (firebaseUid: string): Promise<User | null> =>
  prisma.user.findUnique({
    where: { firebaseUid },
  })

export async function updateUserFirebaseData({
  userId,
  firebaseUid,
  email,
  displayName,
}: {
  userId: string
  firebaseUid?: string
  email?: string
  displayName?: string | null
}): Promise<User> {
  const updateData: Partial<User> = {}

  if (firebaseUid !== undefined) updateData.firebaseUid = firebaseUid
  if (email !== undefined) updateData.email = email
  if (displayName !== undefined) {
    const [firstName, ...lastNameParts] = (displayName || '').split(' ')
    if (firstName) updateData.firstName = firstName
    if (lastNameParts.length > 0) updateData.lastName = lastNameParts.join(' ')
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
  })
}

export const getAllUsers = async (): Promise<User[]> =>
  prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

type UpdateUserRoleProps = {
  userId: string
  newRole: Role
  performedBy: string
  reason?: string
}

export const updateUserRole = async (
  props: Readonly<UpdateUserRoleProps>
): Promise<User> => {
  const { userId, newRole, performedBy, reason } = props

  // Update role in transaction with audit log
  return await prisma.$transaction(async tx => {
    // Fetch current user state inside transaction
    const currentUser = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    })

    if (!currentUser) {
      throw new Error('User not found')
    }

    // Short-circuit if role is already the desired value
    if (currentUser.role === newRole) {
      return (await tx.user.findUnique({ where: { id: userId } })) as User
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { role: newRole },
    })

    await tx.userAuditLog.create({
      data: {
        userId,
        performedBy,
        action: 'role_change',
        previousValue: currentUser.role,
        newValue: newRole,
        reason,
      },
    })

    return updatedUser
  })
}

type UpdateUserDisplayNameProps = {
  userId: string
  displayName: string
  performedBy: string
}

export const updateUserDisplayName = async (
  props: Readonly<UpdateUserDisplayNameProps>
): Promise<User> => {
  const { userId, displayName, performedBy } = props

  // Update display name in transaction with audit log
  return await prisma.$transaction(async tx => {
    // Fetch current user state inside transaction
    const currentUser = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true },
    })

    if (!currentUser) {
      throw new Error('User not found')
    }

    // Short-circuit if display name is already the desired value
    if (currentUser.displayName === displayName) {
      return (await tx.user.findUnique({ where: { id: userId } })) as User
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { displayName },
    })

    await tx.userAuditLog.create({
      data: {
        userId,
        performedBy,
        action: 'display_name_change',
        previousValue: currentUser.displayName || '',
        newValue: displayName,
      },
    })

    return updatedUser
  })
}

type DeactivateUserProps = {
  userId: string
  performedBy: string
  reason?: string
}

export const deactivateUser = async (
  props: Readonly<DeactivateUserProps>
): Promise<User> => {
  const { userId, performedBy, reason } = props

  return await prisma.$transaction(async tx => {
    // Fetch current user state inside transaction
    const currentUser = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, active: true, firebaseUid: true },
    })

    if (!currentUser) {
      throw new Error('User not found')
    }

    // Short-circuit if already inactive
    if (!currentUser.active) {
      return (await tx.user.findUnique({ where: { id: userId } })) as User
    }

    // Update database first
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { active: false },
    })

    await tx.userAuditLog.create({
      data: {
        userId,
        performedBy,
        action: 'deactivate',
        previousValue: String(currentUser.active),
        newValue: 'false',
        reason,
      },
    })

    // After successful database update, disable in Firebase and revoke tokens
    // These operations are performed outside the transaction to avoid Firebase errors
    // causing transaction rollback. If Firebase operations fail, the database
    // deactivation will remain (which is safer than the reverse).
    try {
      await disableFirebaseUser(currentUser.firebaseUid)
      await revokeRefreshTokens(currentUser.firebaseUid)
    } catch (_error) {
      // Silently catch Firebase errors - don't fail the entire operation
      // The user is deactivated in our database which is the source of truth
      // Firebase errors are logged within the Firebase server functions
    }

    return updatedUser
  })
}

type ReactivateUserProps = {
  userId: string
  performedBy: string
  reason?: string
}

export const reactivateUser = async (
  props: Readonly<ReactivateUserProps>
): Promise<User> => {
  const { userId, performedBy, reason } = props

  return await prisma.$transaction(async tx => {
    // Fetch current user state inside transaction
    const currentUser = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, active: true, firebaseUid: true },
    })

    if (!currentUser) {
      throw new Error('User not found')
    }

    // Short-circuit if already active
    if (currentUser.active) {
      return (await tx.user.findUnique({ where: { id: userId } })) as User
    }

    // Update database first
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { active: true },
    })

    await tx.userAuditLog.create({
      data: {
        userId,
        performedBy,
        action: 'reactivate',
        previousValue: String(currentUser.active),
        newValue: 'true',
        reason,
      },
    })

    // After successful database update, enable in Firebase
    // This operation is performed outside the transaction to avoid Firebase errors
    // causing transaction rollback. If Firebase operation fails, the database
    // reactivation will remain (which is safer than the reverse).
    try {
      await enableFirebaseUser(currentUser.firebaseUid)
    } catch (_error) {
      // Silently catch Firebase errors - don't fail the entire operation
      // The user is reactivated in our database which is the source of truth
      // Firebase errors are logged within the Firebase server functions
    }

    return updatedUser
  })
}

type GetUsersByRoleProps = {
  role: Role
}

export const getUsersByRole = async (
  props: Readonly<GetUsersByRoleProps>
): Promise<readonly User[]> => {
  const { role } = props

  return prisma.user.findMany({
    where: { role },
    orderBy: { createdAt: 'desc' },
  })
}

type SearchUsersProps = {
  query: string
  role?: Role
  limit?: number
}

export const searchUsers = async (
  props: Readonly<SearchUsersProps>
): Promise<readonly User[]> => {
  const { query, role, limit = 50 } = props

  // Note: SQLite doesn't support mode: 'insensitive' for case-insensitive search
  // Search is case-sensitive on SQLite, case-insensitive on PostgreSQL/MySQL
  return prisma.user.findMany({
    where: {
      AND: [
        role ? { role } : {},
        {
          OR: [{ email: { contains: query } }, { displayName: { contains: query } }],
        },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

type GetPendingApprovalUsersProps = Record<string, never>

export const getPendingApprovalUsers = async (
  _props: Readonly<GetPendingApprovalUsersProps> = {}
): Promise<readonly User[]> =>
  prisma.user.findMany({
    where: { role: 'PUBLIC' },
    orderBy: { createdAt: 'desc' },
  })

type GetAllUsersWithPaginationProps = {
  page?: number
  pageSize?: number
  role?: Role
}

export const getAllUsersWithPagination = async (
  props: Readonly<GetAllUsersWithPaginationProps>
): Promise<{ users: readonly User[]; total: number; totalPages: number }> => {
  const { page = 1, pageSize = 20, role } = props

  const where = role ? { role } : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ])

  return {
    users,
    total,
    totalPages: Math.ceil(total / pageSize),
  }
}

export const getActiveUsersCount = async (): Promise<number> =>
  prisma.user.count({
    where: { active: true },
  })
