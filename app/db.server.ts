import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

declare global {
  var __db__: PrismaClient
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// In production we'll have a single connection to the DB.
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient()
  }
  prisma = global.__db__
  prisma.$connect()
}

// Re-export types from Prisma client
// Since pnpm's module resolution can cause issues with direct imports,
// we re-export them here for consistent access across the app
export type { Category, Division } from '@prisma/client'

export { prisma }
