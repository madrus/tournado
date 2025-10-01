import type { User } from '@prisma/client'

import { prisma } from '~/db.server'

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
    // eslint-disable-next-line id-blacklist
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
    // eslint-disable-next-line id-blacklist
    data: updateData,
  })
}

export const getAllUsers = async (): Promise<User[]> =>
  prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

export const updateUserRole = async (
  userId: User['id'],
  role: User['role']
): Promise<User> =>
  prisma.user.update({
    where: { id: userId },
    // eslint-disable-next-line id-blacklist
    data: { role },
  })
