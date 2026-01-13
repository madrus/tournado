import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

const normalizedUrl = databaseUrl.startsWith('file:')
  ? `file:${databaseUrl.replace(/^file:/, '').split('?')[0]}`
  : databaseUrl

const adapter = new PrismaBetterSqlite3({ url: normalizedUrl })
const prisma = new PrismaClient({ adapter })

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
