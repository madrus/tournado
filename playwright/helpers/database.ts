/* eslint-disable no-console */
import { faker } from '@faker-js/faker'
import { PrismaClient, Role, type User } from '@prisma/client'

// Ensure Playwright helpers use the same DB as the E2E server
// When PLAYWRIGHT=true, always use test database regardless of DATABASE_URL in .env
// Fall back to the test DB path used by e2e-server.js
const testDbPath = 'file:./prisma/data-test.db?connection_limit=1'
const dbUrl =
  process.env.PLAYWRIGHT === 'true'
    ? testDbPath
    : process.env.DATABASE_URL || testDbPath

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
})

// Clean database for tests - removes test data but preserves auth users
export const cleanDatabase = async (): Promise<void> => {
  try {
    // Delete in correct order to respect foreign key constraints
    // NOTE: We preserve users to maintain authentication sessions
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
    await prisma.user.deleteMany()
  } catch (error) {
    // During Playwright tests, ignore all database errors during cleanup
    // The database might not exist yet (e2e-server creates it) or might be empty
    if (process.env.PLAYWRIGHT === 'true') {
      // Silently ignore - database will be created by e2e-server if needed
      return
    }
    // In non-test environments, report errors
    console.error('Error completely cleaning database:', error)
    throw error
  }
}

export async function createUser(
  userData: Pick<User, 'firstName' | 'lastName' | 'email' | 'role'> & {
    firebaseUid?: string
  }
): Promise<User> {
  return prisma.user.create({
    // eslint-disable-next-line id-blacklist
    data: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
      firebaseUid:
        userData.firebaseUid || `test-firebase-${faker.string.alphanumeric(8)}`,
    },
  })
}

function getSeedEmail(role: Role): string {
  return `user-${role.toLowerCase()}@test.com`
}

function getSeedFirebaseUid(role: Role): string {
  return `seed-${role.toLowerCase()}`
}

const defaultSeedNames: Record<Role, { firstName: string; lastName: string }> = {
  PUBLIC: { firstName: 'Test', lastName: 'Public' },
  REFEREE: { firstName: 'Test', lastName: 'Referee' },
  EDITOR: { firstName: 'Test', lastName: 'Editor' },
  BILLING: { firstName: 'Test', lastName: 'Billing' },
  MANAGER: { firstName: 'Test', lastName: 'Manager' },
  ADMIN: { firstName: 'Test', lastName: 'Admin' },
}

type SeedOptions = {
  firstName?: string
  lastName?: string
  firebaseUid?: string
}

export async function createUserForRole(
  role: Role,
  options: SeedOptions = {}
): Promise<User> {
  const email = getSeedEmail(role)
  const names = defaultSeedNames[role]
  const firebaseUid = options.firebaseUid ?? getSeedFirebaseUid(role)

  return prisma.user.upsert({
    where: { email },
    update: {
      role,
      firstName: options.firstName ?? names.firstName,
      lastName: options.lastName ?? names.lastName,
      firebaseUid,
    },
    create: {
      firstName: options.firstName ?? names.firstName,
      lastName: options.lastName ?? names.lastName,
      email,
      role,
      firebaseUid,
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

export const createManagerUser = async (): Promise<User> =>
  createUserForRole(Role.MANAGER)

export async function createAdminUser(
  options: { uniqueFirebaseUid?: boolean } = {}
): Promise<User> {
  const firebaseUid = options.uniqueFirebaseUid
    ? `admin-user-${faker.string.alphanumeric(8)}`
    : getSeedFirebaseUid(Role.ADMIN) // Default UID for global setup

  console.log(
    `[createAdminUser] Seeding admin user with email: ${getSeedEmail(
      Role.ADMIN
    )}, role: ADMIN, firebaseUid: ${firebaseUid}`
  )
  const user = await createUserForRole(Role.ADMIN, {
    firebaseUid,
  })

  console.log(
    `[createAdminUser] Seeded admin user: ${user.email}, role: ${user.role}, id: ${user.id}`
  )
  return user
}

export async function createRefereeUser(): Promise<User> {
  return await createUserForRole(Role.REFEREE)
}

export async function createEditorUser(): Promise<User> {
  return createUserForRole(Role.EDITOR)
}

export async function createBillingUser(): Promise<User> {
  return createUserForRole(Role.BILLING)
}

export async function createPublicUser(): Promise<User> {
  return createUserForRole(Role.PUBLIC)
}

export async function createUsersForAllRoles(): Promise<Record<Role, User>> {
  const [publicUser, refereeUser, editorUser, billingUser, managerUser, adminUser] =
    await Promise.all([
      createPublicUser(),
      createRefereeUser(),
      createEditorUser(),
      createBillingUser(),
      createManagerUser(),
      createAdminUser(),
    ])

  return {
    PUBLIC: publicUser,
    REFEREE: refereeUser,
    EDITOR: editorUser,
    BILLING: billingUser,
    MANAGER: managerUser,
    ADMIN: adminUser,
  }
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

  // Create and verify within a single transaction to avoid race conditions
  const tournament = await prisma.$transaction(async tx => {
    const created = await tx.tournament.create({
      data: {
        name,
        location,
        startDate,
        endDate,
        divisions: JSON.stringify(['FIRST_DIVISION', 'SECOND_DIVISION']),
        categories: JSON.stringify(['JO8', 'JO10']),
      },
    })

    const verify = await tx.tournament.findUnique({ where: { id: created.id } })
    if (!verify) {
      throw new Error(
        `Failed to create tournament "${name}" - not found during transactional verification`
      )
    }

    return created
  })

  // Best-effort post-commit verification (handles any async write lag)
  try {
    await waitForTournamentInDatabase(name, 5, 100)
  } catch (_e) {
    // Non-fatal: UI will still attempt to read; DB cleanup in parallel might remove it later
  }

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
