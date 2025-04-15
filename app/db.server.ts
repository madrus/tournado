import { PrismaClient } from '@prisma/client'

import { singleton } from './singleton.server'

// Hard-code a unique key, so we can look up the client when this module gets re-imported
const prisma = singleton('prisma', () => new PrismaClient())

// Connect to the database with error handling
prisma.$connect().catch((error) => {
  console.error('Failed to connect to database:', error)
  // Don't throw here, let the application continue
})

export { prisma }
