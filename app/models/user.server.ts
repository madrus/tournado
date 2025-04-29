import type { User } from '@prisma/client'

import bcrypt from 'bcryptjs'

import { prisma } from '@/db.server'

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

export async function verifyLogin(
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
