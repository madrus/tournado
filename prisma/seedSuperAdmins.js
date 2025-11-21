import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'

// Idempotent seeding of SUPER_ADMIN_EMAILS into User table
// Usage:
//   node prisma/seedSuperAdmins.js
// Environment:
//   SUPER_ADMIN_EMAILS="a@example.com,b@example.com"

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

async function run() {
	const prisma = await createPrismaClient()
	try {
		const raw = process.env.SUPER_ADMIN_EMAILS || ''
		const emails = raw
			.split(',')
			.map((e) => e.trim())
			.filter(Boolean)

		if (emails.length === 0) {
			return
		}

		for (const email of emails) {
			// If user exists, update role to ADMIN; otherwise create minimal ADMIN user
			const existing = await prisma.user.findUnique({ where: { email } })
			if (existing) {
				if (existing.role !== 'ADMIN') {
					await prisma.user.update({
						where: { id: existing.id },
						data: { role: 'ADMIN' },
					})
				} else {
				}
			} else {
				const [firstNameRaw] = email.split('@')
				const firstName = firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1)
				// Generate a placeholder firebaseUid for seed users
				const firebaseUid = `seed-admin-${email.replace(/[^a-z0-9]/gi, '-')}`
				await prisma.user.create({
					data: {
						email,
						firebaseUid,
						firstName,
						lastName: 'Admin',
						role: 'ADMIN',
					},
				})
			}
		}
	} catch (error) {
		console.error('Error seeding super admins:', error)
		process.exitCode = 1
	} finally {
		await prisma.$disconnect()
	}
}

run()
