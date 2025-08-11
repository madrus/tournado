/* eslint-disable no-console */
import { faker } from '@faker-js/faker'
import type { User } from '@prisma/client'

import bcrypt from 'bcryptjs'

import { prisma } from '../../app/db.server'

// Clean database for tests - removes test data but preserves auth users
export const cleanDatabase = async (): Promise<void> => {
  try {
    // Delete in correct order to respect foreign key constraints
    // NOTE: We preserve users and passwords to maintain authentication sessions
    await prisma.matchScore.deleteMany()
    await prisma.match.deleteMany()
    await prisma.team.deleteMany()
    await prisma.tournament.deleteMany()
    await prisma.teamLeader.deleteMany()
  } catch (error) {
    console.error('Error cleaning database:', error)
    throw error
  }
}

// Full clean database for global setup/teardown - removes everything including auth users
export const cleanDatabaseCompletely = async (): Promise<void> => {
  try {
    // Delete in correct order to respect foreign key constraints
    await prisma.matchScore.deleteMany()
    await prisma.match.deleteMany()
    await prisma.team.deleteMany()
    await prisma.tournament.deleteMany()
    await prisma.teamLeader.deleteMany()
    await prisma.password.deleteMany()
    await prisma.user.deleteMany()
  } catch (error) {
    console.error('Error completely cleaning database:', error)
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

export const createManagerUser = async (): Promise<{ email: string; role: string }> => {
  const email = `manager-${faker.string.alphanumeric(8)}@test.com`

  const user = await createUser({
    firstName: 'Test',
    lastName: 'Manager',
    email,
    role: 'MANAGER',
    password: 'MyReallyStr0ngPassw0rd!!!',
  })

  return {
    email: user.email,
    role: 'MANAGER',
  }
}

export async function createAdminUser(): Promise<User> {
  const adminEmail = `admin-${faker.string.alphanumeric(8)}@test.com`

  return await createUser({
    firstName: 'Test',
    lastName: 'Admin',
    email: adminEmail,
    role: 'ADMIN',
    password: 'MyReallyStr0ngPassw0rd!!!',
  })
}

export async function createRefereeUser(): Promise<User> {
  const refereeEmail = `referee-${faker.string.alphanumeric(8)}@test.com`

  return await createUser({
    firstName: 'Test',
    lastName: 'Referee',
    email: refereeEmail,
    role: 'REFEREE',
    password: 'MyReallyStr0ngPassw0rd!!!',
  })
}

export const cleanupUser = async (email: string): Promise<void> => {
  try {
    await deleteUserByEmail(email)
  } catch (_error) {
    // User might not exist, which is fine
  }
}

export const checkTournamentExists = async (namePattern: string) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: namePattern
        ? {
            name: {
              contains: namePattern,
            },
          }
        : {},
      select: {
        id: true,
        name: true,
        location: true,
        createdAt: true,
      },
    })

    return tournaments
  } catch (error) {
    return []
  }
}

export const waitForTournamentInDatabase = async (
  tournamentName: string,
  maxAttempts = 20,
  delayMs = 1000
): Promise<void> => {
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const tournament = await prisma.tournament.findFirst({
        where: {
          name: {
            contains: tournamentName,
          },
        },
      })

      if (tournament) {
        return
      }

      attempts++

      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    } catch (error) {
      attempts++

      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }

  throw new Error(
    `Tournament "${tournamentName}" not found in database after ${maxAttempts} attempts`
  )
}

export const createTestTournament = async (
  name: string,
  location: string
): Promise<{ id: string; name: string; location: string }> => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 7)

  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 10)

  const tournament = await prisma.tournament.create({
    data: {
      name,
      location,
      startDate,
      endDate,
      divisions: ['FIRST_DIVISION', 'SECOND_DIVISION'],
      categories: ['JO8', 'JO10'],
    },
  })

  await new Promise(resolve => setTimeout(resolve, 500))

  return { id: tournament.id, name: tournament.name, location: tournament.location }
}
