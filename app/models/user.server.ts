import type { User } from '@prisma/client'

import bcrypt from 'bcryptjs'

import { prisma } from '~/db.server'

export type { User } from '@prisma/client'

export const getUserById = async (id: User['id']): Promise<User | null> =>
  prisma.user.findUnique({ where: { id } })

export const getUserByEmail = async (email: User['email']): Promise<User | null> =>
  prisma.user.findUnique({ where: { email } })

export async function createUser(
  email: User['email'],
  password: string,
  firstName: User['firstName'],
  lastName: User['lastName'],
  role: User['role']
): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10)

  return prisma.user.create({
    // eslint-disable-next-line id-blacklist
    data: {
      email,
      firstName,
      lastName,
      role,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })
}

export const deleteUserByEmail = async (email: User['email']): Promise<User> =>
  prisma.user.delete({ where: { email } })

export async function verifySignin(
  email: User['email'],
  password: string
): Promise<Omit<User & { password: { hash: string } }, 'password'> | null> {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  })

  if (!userWithPassword || !userWithPassword.password) {
    return null
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

  if (!isValid) {
    return null
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword

  return userWithoutPassword
}

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
      firebaseUid,
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
