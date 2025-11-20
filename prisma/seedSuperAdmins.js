import { PrismaClient } from '@prisma/client'

// Idempotent seeding of SUPER_ADMIN_EMAILS into User table
// Usage:
//   node prisma/seedSuperAdmins.js
// Environment:
//   SUPER_ADMIN_EMAILS="a@example.com,b@example.com"

async function run() {
	const prisma = new PrismaClient()
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
				await prisma.user.create({
					data: {
						email,
						firstName,
						lastName: 'Admin',
						role: 'ADMIN',
					},
				})
			}
		}
	} catch (_error) {
		process.exitCode = 1
	} finally {
		await prisma.$disconnect()
	}
}

run()
