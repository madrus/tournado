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

// Symmetric delete helpers for cleanup in specs
// These ensure test data is properly cleaned up to keep the database clean during test runs

export const deleteTournamentById = async (id: string): Promise<void> => {
  try {
    // Delete dependent records first (children before parent)
    // Delete matches that reference this tournament
    await prisma.match.deleteMany({ where: { tournamentId: id } })

    // Delete teams that reference this tournament
    await prisma.team.deleteMany({ where: { tournamentId: id } })

    // Finally delete the tournament itself
    // Use deleteMany to be idempotent (avoid P2025 if already deleted)
    await prisma.tournament.deleteMany({ where: { id } })
  } catch (error) {
    console.error(`Error deleting tournament ${id}:`, error)
    throw error
  }
}

export const deleteTeamById = async (id: string): Promise<void> => {
  try {
    // Delete dependent records first (children before parent)
    // Delete matches that reference this team (as home or away team)
    await prisma.match.deleteMany({
      where: {
        OR: [{ homeTeamId: id }, { awayTeamId: id }],
      },
    })
    // Fetch leader id before deleting team
    const current = await prisma.team.findUnique({
      where: { id },
      select: { teamLeaderId: true },
    })
    const leaderId = current?.teamLeaderId

    // Finally delete the team itself
    // Use deleteMany to be idempotent (avoid P2025 if already deleted)
    await prisma.team.deleteMany({ where: { id } })

    // Optionally delete the team leader if no other teams reference it
    if (leaderId) {
      const remainingTeams = await prisma.team.count({
        where: { teamLeaderId: leaderId },
      })
      if (remainingTeams === 0) {
        await prisma.teamLeader.deleteMany({ where: { id: leaderId } })
      }
    }
  } catch (error) {
    console.error(`Error deleting team ${id}:`, error)
    throw error
  }
}

// Thin wrappers for tests to use a stable API name
export const deleteTestTournament = async ({ id }: { id: string }): Promise<void> => {
  await deleteTournamentById(id)
}

export const deleteTestTeam = async ({ id }: { id: string }): Promise<void> => {
  await deleteTeamById(id)
}
