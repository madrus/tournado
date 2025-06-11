/* eslint-disable no-console */
import { faker } from '@faker-js/faker'
import type { User } from '@prisma/client'

import bcrypt from 'bcryptjs'

import { prisma } from '../../app/db.server'

// Clean database for tests - removes all test data
export const cleanDatabase = async (): Promise<void> => {
  try {
    console.log('🧹 Cleaning database for tests...')

    // Delete in correct order to respect foreign key constraints
    await prisma.matchScore.deleteMany()
    await prisma.match.deleteMany()
    await prisma.team.deleteMany()
    await prisma.tournament.deleteMany()
    await prisma.teamLeader.deleteMany()
    await prisma.password.deleteMany()
    await prisma.user.deleteMany()

    console.log('✅ Database cleaned successfully')
  } catch (error) {
    console.error('❌ Error cleaning database:', error)
    throw error
  }
}

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

// Create admin user for tests with unique email
export async function createAdminUser(): Promise<User> {
  const adminEmail = `admin-${faker.string.alphanumeric(8)}@test.com`

  console.log(`Creating admin user ${adminEmail}`)
  return await createUser({
    firstName: 'Test',
    lastName: 'Admin',
    email: adminEmail,
    role: 'ADMIN', // Ensure this is set to ADMIN role
    password: 'MyReallyStr0ngPassw0rd!!!',
  })
}

// Create regular user for tests
export const createRegularUser = async (): Promise<{ email: string; role: string }> => {
  const email = `user-${faker.string.alphanumeric(8)}@example.com`
  const user = await createUser({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email,
    role: 'PUBLIC',
    password: 'MyReallyStr0ngPassw0rd!!!',
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
