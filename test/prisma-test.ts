import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  try {
    const users = await prisma.user.findMany()
    // eslint-disable-next-line no-console
    console.log('Users:', users)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Prisma error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
