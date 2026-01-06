#!/usr/bin/env tsx
/**
 * Migration script to update admin roles based on SUPER_ADMIN_EMAILS
 * Run this after updating SUPER_ADMIN_EMAILS to sync existing users
 *
 * Usage:
 *   pnpm migrate:admin-roles
 */
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient, Role } from '@prisma/client'

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function migrateAdminRoles() {
	const superAdminEmails =
		process.env.SUPER_ADMIN_EMAILS?.split(',').map((e) => e.trim()) || []

	if (superAdminEmails.length === 0) {
		await new Promise((resolve) => setTimeout(resolve, 5000))
	}
	for (const email of superAdminEmails) {
		const user = await prisma.user.findUnique({ where: { email } })

		if (user && user.role !== Role.ADMIN) {
			await prisma.user.update({
				where: { email },
				data: { role: Role.ADMIN },
			})
		} else if (user) {
		} else {
		}
	}
	const currentAdmins = await prisma.user.findMany({
		where: { role: Role.ADMIN },
	})

	for (const admin of currentAdmins) {
		if (!superAdminEmails.includes(admin.email)) {
			await prisma.user.update({
				where: { id: admin.id },
				data: { role: Role.MANAGER },
			})
		}
	}

	// Summary
	const finalAdmins = await prisma.user.findMany({
		where: { role: Role.ADMIN },
		select: { email: true },
	})
	if (finalAdmins.length === 0) {
	} else {
		finalAdmins.forEach((_admin) => {})
	}
}

migrateAdminRoles()
	.catch((_error) => {
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())
