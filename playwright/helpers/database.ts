/* eslint-disable no-console */
import { faker } from '@faker-js/faker'
import type { User } from '@prisma/client'

import bcrypt from 'bcryptjs'

import { prisma } from '../../app/db.server'

export async function createUser(
  userData: Pick<User, 'firstName' | 'lastName' | 'email' | 'role'> & {
    password: string
  }
): Promise<User> {
  const hashedPassword = await bcrypt.hash(userData.password, 10)

  return prisma.user.create({
    // eslint-disable-next-line id-blacklist
    data: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })
}

// Find a user by email
export const findUserByEmail = async (email: string): Promise<User | null> =>
  prisma.user.findUnique({
    where: { email },
  })

// Delete a user by email
export const deleteUserByEmail = async (email: string): Promise<void> => {
  await prisma.user.delete({
    where: { email },
  })
}

// Create admin user for tests
export async function createAdminUser(): Promise<User> {
  const adminEmail = 'admin@test.com'

  try {
    // First try to find existing admin user
    const existingUser = await findUserByEmail(adminEmail)
    if (existingUser) {
      console.log(`Admin user ${adminEmail} already exists`)
      return existingUser
    }

    console.log(`Creating admin user ${adminEmail}`)
    return await createUser({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      role: 'ADMIN',
      password: 'admin123',
    })
  } catch (error) {
    console.error('Error creating admin user:', error)
    throw error
  }
}

// Create regular user for tests
export const createRegularUser = async (): Promise<{ email: string; role: string }> => {
  const email = `user-${faker.string.alphanumeric(8)}@example.com`
  const user = await createUser({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email,
    role: 'PUBLIC',
    password: 'myreallystrongpassword',
  })

  return {
    email: user.email,
    role: 'PUBLIC',
  }
}

// Cleanup user by email (for test cleanup)
export const cleanupUser = async (email: string): Promise<void> => {
  try {
    await deleteUserByEmail(email)
    console.log(`Test user ${email} cleaned up`)
  } catch (_error) {
    // User might not exist, which is fine
    console.log(`Test user ${email} cleanup skipped (not found)`)
  }
}
