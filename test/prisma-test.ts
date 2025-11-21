import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
	try {
		const _users = await prisma.user.findMany()
	} catch (_error) {
		process.exit(1)
	} finally {
		await prisma.$disconnect()
	}
}

main()
