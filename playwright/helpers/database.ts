import { faker } from '@faker-js/faker'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient, Role, type User } from '@prisma/client'

// Ensure Playwright helpers use the same DB as the E2E server
// When PLAYWRIGHT=true, always use test database regardless of DATABASE_URL in .env
// Fall back to the test DB path used by e2e-server.js
const testDbPath = 'file:./prisma/data-test.db?connection_limit=1'
const dbUrl =
  process.env.PLAYWRIGHT === 'true'
    ? testDbPath
    : process.env.DATABASE_URL || testDbPath

// Prisma 7.x requires adapter for SQLite (same pattern as app/db.server.ts)
let prisma: PrismaClient

function createPrismaClient(): PrismaClient {
  const databaseUrl = dbUrl
  const normalizedUrl = databaseUrl.startsWith('file:')
    ? `file:${databaseUrl.replace(/^file:/, '').split('?')[0]}`
    : databaseUrl

  const adapter = new PrismaBetterSqlite3({ url: normalizedUrl })
  return new PrismaClient({ adapter })
}

function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = createPrismaClient()
  }
  return prisma
}

// Clean database for tests - removes test data but preserves auth users
export const cleanDatabase = (): Promise<void> => {
  const db = getPrisma()
  // Delete in correct order to respect foreign key constraints
  // NOTE: We preserve users to maintain authentication sessions
  return Promise.all([
    db.matchScore.deleteMany(),
    db.match.deleteMany(),
    db.team.deleteMany(),
    db.tournament.deleteMany(),
    db.teamLeader.deleteMany(),
  ]).then(() => {})
}

// Full clean database for global setup/teardown - removes everything including auth users
export const cleanDatabaseCompletely = async (): Promise<void> => {
  const db = getPrisma()
  try {
    // Delete in correct order to respect foreign key constraints
    await db.matchScore.deleteMany()
    await db.match.deleteMany()
    await db.team.deleteMany()
    await db.tournament.deleteMany()
    await db.teamLeader.deleteMany()
    await db.user.deleteMany()
  } catch (error) {
    // During Playwright tests, ignore all database errors during cleanup
    // The database might not exist yet (e2e-server creates it) or might be empty
    if (process.env.PLAYWRIGHT === 'true') {
      // Silently ignore - database will be created by e2e-server if needed
      return
    }
    throw error
  }
}

export async function createUser(
  userData: Pick<User, 'firstName' | 'lastName' | 'email' | 'role'> & {
    firebaseUid?: string
  },
): Promise<User> {
  const db = getPrisma()
  return db.user.create({
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
  options: SeedOptions = {},
): Promise<User> {
  const email = getSeedEmail(role)
  const names = defaultSeedNames[role]
  const firebaseUid = options.firebaseUid ?? getSeedFirebaseUid(role)

  return getPrisma().user.upsert({
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
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const db = getPrisma()
  return db.user.findUnique({
    where: { email },
  })
}

// Delete a user by email
export const deleteUserByEmail = async (email: string): Promise<void> => {
  const db = getPrisma()
  await db.user.delete({
    where: { email },
  })
}

export const createManagerUser = async (): Promise<User> =>
  createUserForRole(Role.MANAGER)

export async function createAdminUser(
  options: { uniqueFirebaseUid?: boolean } = {},
): Promise<User> {
  const firebaseUid = options.uniqueFirebaseUid
    ? `admin-user-${faker.string.alphanumeric(8)}`
    : getSeedFirebaseUid(Role.ADMIN) // Default UID for global setup
  const user = await createUserForRole(Role.ADMIN, {
    firebaseUid,
  })
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
    const db = getPrisma()
    const tournaments = await db.tournament.findMany({
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
  } catch (_error) {
    return []
  }
}

export const waitForTournamentInDatabase = async (
  tournamentName: string,
  maxAttempts = 20,
  delayMs = 1000,
): Promise<void> => {
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const db = getPrisma()
      const tournament = await db.tournament.findFirst({
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
    } catch (_error) {
      attempts++

      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }

  throw new Error(
    `Tournament "${tournamentName}" not found in database after ${maxAttempts} attempts`,
  )
}

export const createTestTournament = async (
  name: string,
  location: string,
): Promise<{ id: string; name: string; location: string }> => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 7)

  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 10)

  // Create and verify within a single transaction to avoid race conditions
  const db = getPrisma()
  const tournament = await db.$transaction(async tx => {
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

    const verify = await tx.tournament.findUnique({
      where: { id: created.id },
    })
    if (!verify) {
      throw new Error(
        `Failed to create tournament "${name}" - not found during transactional verification`,
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

  return {
    id: tournament.id,
    name: tournament.name,
    location: tournament.location,
  }
}

// Symmetric delete helpers for cleanup in specs
// These ensure test data is properly cleaned up to keep the database clean during test runs

export const deleteTournamentById = async (id: string): Promise<void> => {
  const db = getPrisma()
  // Delete dependent records first (children before parent)
  // Delete matches that reference this tournament
  await db.match.deleteMany({ where: { tournamentId: id } })

  // Delete teams that reference this tournament
  await db.team.deleteMany({ where: { tournamentId: id } })

  // Finally delete the tournament itself
  // Use deleteMany to be idempotent (avoid P2025 if already deleted)
  await db.tournament.deleteMany({ where: { id } })
}

export const deleteTeamById = async (id: string): Promise<void> => {
  const db = getPrisma()
  // Delete dependent records first (children before parent)
  // Delete matches that reference this team (as home or away team)
  await db.match.deleteMany({
    where: {
      OR: [{ homeTeamId: id }, { awayTeamId: id }],
    },
  })
  // Fetch leader id before deleting team
  const current = await db.team.findUnique({
    where: { id },
    select: { teamLeaderId: true },
  })
  const leaderId = current?.teamLeaderId

  // Finally delete the team itself
  // Use deleteMany to be idempotent (avoid P2025 if already deleted)
  await db.team.deleteMany({ where: { id } })

  // Optionally delete the team leader if no other teams reference it
  if (leaderId) {
    const remainingTeams = await db.team.count({
      where: { teamLeaderId: leaderId },
    })
    if (remainingTeams === 0) {
      await db.teamLeader.deleteMany({ where: { id: leaderId } })
    }
  }
}

// Thin wrappers for tests to use a stable API name
export const deleteTestTournament = async ({ id }: { id: string }): Promise<void> => {
  await deleteTournamentById(id)
}

export const deleteTestTeam = async ({ id }: { id: string }): Promise<void> => {
  await deleteTeamById(id)
}

// Group stage test data helpers
export const createTestGroupStage = async (params: {
  tournamentId: string
  name: string
  groupCount?: number
  slotsPerGroup?: number
  categories?: string[]
}): Promise<{
  groupStageId: string
  groupIds: string[]
  tournament: { id: string; name: string; location: string }
}> => {
  const {
    tournamentId,
    name,
    groupCount = 2,
    slotsPerGroup = 4,
    categories = ['JO10'],
  } = params
  const db = getPrisma()

  // Get tournament info
  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true, name: true, location: true },
  })

  if (!tournament) {
    throw new Error(`Tournament ${tournamentId} not found`)
  }

  // Create group stage
  const groupStage = await db.groupStage.create({
    data: {
      name,
      tournamentId,
      categories: JSON.stringify(categories),
      configGroups: groupCount,
      configSlots: slotsPerGroup,
      autoFill: false, // Manual assignment for testing
    },
  })

  // Create groups with empty slots
  const groupIds: string[] = []
  for (let i = 0; i < groupCount; i++) {
    const group = await db.group.create({
      data: {
        name: `Group ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
        groupStageId: groupStage.id,
        order: i,
      },
    })
    groupIds.push(group.id)

    // Create empty slots for this group
    for (let slotIdx = 0; slotIdx < slotsPerGroup; slotIdx++) {
      await db.groupSlot.create({
        data: {
          groupStageId: groupStage.id,
          groupId: group.id,
          slotIndex: slotIdx,
          teamId: null, // Empty slot
        },
      })
    }
  }

  return {
    groupStageId: groupStage.id,
    groupIds,
    tournament: {
      id: tournament.id,
      name: tournament.name,
      location: tournament.location,
    },
  }
}

export const createTestTeam = async (params: {
  tournamentId: string
  name: string
  division?: string
  category?: string
  clubName?: string
}): Promise<{ id: string; name: string }> => {
  const {
    tournamentId,
    name,
    division = 'FIRST_DIVISION',
    category = 'JO10',
    clubName = 'Test Club',
  } = params
  const db = getPrisma()

  // Create team leader first
  const teamLeader = await db.teamLeader.create({
    data: {
      firstName: 'Test',
      lastName: 'Leader',
      email: `${name.toLowerCase().replace(/\s+/g, '-')}@test.com`,
      phone: '+31612345678',
    },
  })

  // Create team
  const team = await db.team.create({
    data: {
      name,
      tournamentId,
      division,
      category,
      teamLeaderId: teamLeader.id,
      clubName,
    },
  })

  return {
    id: team.id,
    name: team.name,
  }
}

export const deleteTestGroupStage = async (groupStageId: string): Promise<void> => {
  const db = getPrisma()

  // Delete in order: group slots -> groups -> group stage
  const groups = await db.group.findMany({
    where: { groupStageId },
    select: { id: true },
  })

  for (const group of groups) {
    await db.groupSlot.deleteMany({ where: { groupId: group.id } })
  }

  await db.group.deleteMany({ where: { groupStageId } })
  await db.groupStage.deleteMany({ where: { id: groupStageId } })
}
