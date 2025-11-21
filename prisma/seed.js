import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'

// Retry mechanism for Prisma Client initialization
async function createPrismaClient(maxRetries = 5, delay = 1000) {
	for (let i = 0; i < maxRetries; i++) {
		try {
			const databaseUrl = process.env.DATABASE_URL
			if (!databaseUrl) {
				throw new Error('DATABASE_URL is required for seeding')
			}

			// Normalize sqlite URL for the adapter (strip query params, keep file:)
			const normalizedUrl = databaseUrl.startsWith('file:')
				? `file:${databaseUrl.replace(/^file:/, '').split('?')[0]}`
				: databaseUrl

			const adapter = new PrismaBetterSqlite3({ url: normalizedUrl })
			const prisma = new PrismaClient({ adapter })
			// Test the connection
			await prisma.$connect()
			return prisma
		} catch (error) {
			if (i === maxRetries - 1) {
				throw error
			}
			await new Promise((resolve) => setTimeout(resolve, delay))
		}
	}
}

/**
 * Keep this file as .js for manual seeding on remote
 */
async function seed() {
	// Allow seeding during E2E tests - they need tournaments to test against
	// if (process.env.PLAYWRIGHT === 'true') {
	//   console.log('Skipping database seeding during E2E tests')
	//   return
	// }

	// Initialize Prisma Client with retry logic
	const prisma = await createPrismaClient()

	try {
		// Detect test environment (E2E tests or unit tests)
		const isTestEnv = process.env.PLAYWRIGHT === 'true' || process.env.NODE_ENV === 'test'

		// Test fixture users - ONLY created during test runs, NOT in regular development
		// In development, users authenticate via Firebase and are created that way
		const testFixtureUsers = isTestEnv
			? [
					{ email: 'user@example.com', role: 'PUBLIC' },
					{ email: 'admin1@example.com', role: 'MANAGER' },
					{ email: 'admin2@example.com', role: 'MANAGER' },
				]
			: []

		// Cleanup test fixture users
		await Promise.all(
			testFixtureUsers.map(({ email }) =>
				prisma.user.delete({ where: { email } }).catch(() => {
					// no worries if it doesn't exist yet
				}),
			),
		)

		// Cleanup existing tournaments (this will cascade delete teams and matches)
		await prisma.tournament.deleteMany({
			where: {
				name: {
					in: ['Spring Cup', 'Summer Cup'],
				},
			},
		})

		// Create test fixture users (only during test runs)
		if (testFixtureUsers.length > 0) {
			await Promise.all(
				testFixtureUsers.map(async ({ email, role }) => {
					const lastName = role === 'ADMIN' ? 'Admin' : role === 'MANAGER' ? 'Manager' : 'User'

					return prisma.user.create({
						data: {
							email,
							firstName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
							lastName,
							role,
							firebaseUid: `seed-${email.replace(/[@.]/g, '-')}`, // Placeholder for test fixture users
						},
					})
				}),
			)
		}

		const team1 = {
			name: 'JO8-1',
			category: 'JO8',
			division: 'PREMIER_DIVISION',
		}

		const team2 = {
			name: 'JO10-1',
			category: 'JO10',
			division: 'FIRST_DIVISION',
		}

		const team3 = {
			name: 'JO10-1',
			category: 'JO10',
			division: 'FIRST_DIVISION',
		}

		const team4 = {
			name: 'JO10-2',
			category: 'JO10',
			division: 'SECOND_DIVISION',
		}

		// Find or create a default team leader
		let teamLeader = await prisma.teamLeader.findFirst({
			where: { email: 'user@example.com' },
		})

		if (!teamLeader) {
			try {
				teamLeader = await prisma.teamLeader.create({
					data: {
						firstName: 'Madrusnl',
						lastName: 'Admin',
						email: 'user@example.com',
						phone: '+31 6 1234 5678',
					},
				})
			} catch (error) {
				// If creation fails due to unique constraint, try to find it again
				teamLeader = await prisma.teamLeader.findFirst({
					where: { email: 'user@example.com' },
				})

				if (!teamLeader) {
					throw error // Re-throw if we still can't find it
				}
			}
		}

		// Minimal two dummy tournaments
		const tournament1 = await prisma.tournament.create({
			data: {
				name: 'Spring Cup',
				location: 'Amsterdam',
				divisions: JSON.stringify(['PREMIER_DIVISION', 'FIRST_DIVISION', 'SECOND_DIVISION']),
				categories: JSON.stringify(['JO8', 'JO9', 'JO10', 'JO11']),
				startDate: new Date('2025-05-01'),
				endDate: new Date('2025-05-02'),
			},
		})

		const tournament2 = await prisma.tournament.create({
			data: {
				name: 'Summer Cup',
				location: 'Aalsmeer',
				divisions: JSON.stringify(['FIRST_DIVISION', 'SECOND_DIVISION', 'THIRD_DIVISION']),
				categories: JSON.stringify(['JO9', 'JO10', 'JO11', 'JO12']),
				startDate: new Date('2025-06-01'),
				endDate: new Date('2025-06-02'),
			},
		})

		// minimal two dummy teams playing in the 1st tournament
		const createdTeam1 = await prisma.team.create({
			data: {
				clubName: 'sv DIO',
				name: team1.name,
				category: team1.category,
				division: team1.division,
				teamLeaderId: teamLeader.id,
				tournamentId: tournament1.id,
			},
		})

		const createdTeam2 = await prisma.team.create({
			data: {
				clubName: 'sv DIO',
				name: team2.name,
				category: team2.category,
				division: team2.division,
				teamLeaderId: teamLeader.id,
				tournamentId: tournament1.id,
			},
		})

		// minimal two dummy teams playing in the 2nd tournament
		const createdTeam3 = await prisma.team.create({
			data: {
				clubName: 'sv DIO',
				name: team3.name,
				category: team3.category,
				division: team3.division,
				teamLeaderId: teamLeader.id,
				tournamentId: tournament2.id,
			},
		})

		const createdTeam4 = await prisma.team.create({
			data: {
				clubName: 'sv DIO',
				name: team4.name,
				category: team4.category,
				division: team4.division,
				teamLeaderId: teamLeader.id,
				tournamentId: tournament2.id,
			},
		})

		// Create 23 JO8 teams from different clubs for testing groups feature
		const clubNames = [
			'Arsenal',
			'Wolves',
			'Phoenix',
			'Thunder',
			'Lightning',
			'Eagles',
			'Lions',
			'Tigers',
			'Dragons',
			'Hawks',
			'Falcons',
			'Panthers',
			'Sharks',
			'Bulls',
			'Rams',
			'Bears',
			'Cobras',
			'Vipers',
			'Stallions',
			'Mustangs',
			'Cheetahs',
			'Leopards',
			'Jaguars',
		]

		const jo8Teams = []
		for (let i = 0; i < 23; i++) {
			const clubName = clubNames[i]
			// Each club can have JO8-1, JO8-2, etc. independently
			const teamName = i < 12 ? 'JO8-1' : i < 18 ? 'JO8-2' : 'JO8-3'

			const jo8Team = await prisma.team.create({
				data: {
					clubName,
					name: teamName,
					category: 'JO8',
					division: 'PREMIER_DIVISION',
					teamLeaderId: teamLeader.id,
					tournamentId: tournament1.id,
				},
			})
			jo8Teams.push(jo8Team)
		}

		// Note: GroupSets are NOT pre-created in seed data
		// Users create GroupSets via Competition → Groups → "Create Group Set" UI
		// This ensures all tournaments start with consistent empty state

		// Minimal two dummy matches
		await prisma.match.create({
			data: {
				date: new Date('2025-05-01'),
				time: new Date('2025-06-01T10:00:00Z'),
				location: 'Green Field',
				status: 'UPCOMING',
				tournamentId: tournament1.id,
				homeTeamId: createdTeam1.id,
				awayTeamId: createdTeam2.id,
			},
		})

		await prisma.match.create({
			data: {
				date: new Date('2025-06-01'),
				time: new Date('2025-06-01T10:00:00Z'),
				location: 'Red Field',
				status: 'UPCOMING',
				tournamentId: tournament2.id,
				homeTeamId: createdTeam4.id,
				awayTeamId: createdTeam3.id,
			},
		})
	} catch (_error) {
		process.exit(1)
	} finally {
		await prisma.$disconnect()
	}
}

seed()
