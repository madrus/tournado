// Use this to delete a user by their email
// Simply call this with:
// pnpm exec tsx ./cypress/support/delete-user.ts username@example.com,
// and that user will get deleted
import { installGlobals } from '@remix-run/node'

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import { prisma } from '~/db.server'

installGlobals()

async function deleteUser(email: string) {
  console.log(`Starting to delete user: ${email}`)

  if (!email) {
    console.error('Email required for login')
    process.exit(1)
  }
  if (!email.endsWith('@example.com')) {
    console.error('All test emails must end in @example.com')
    process.exit(1)
  }

  try {
    console.log('Connecting to database...')
    // First check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })
    console.log('Database query completed.')

    if (!user) {
      console.log('User not found, so no need to delete')
      return
    }

    console.log('Attempting to delete user...')
    // If user exists, delete it
    await prisma.user.delete({
      where: { email },
    })
    console.log('User deleted successfully')
  } catch (error) {
    console.log('Error encountered:', error)
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      console.log('User not found, so no need to delete')
    } else {
      console.error('Error deleting user:', error)
      process.exit(1)
    }
  } finally {
    console.log('Disconnecting from database...')
    await prisma.$disconnect()
    console.log('Database disconnected.')
    process.exit(0) // Force exit to ensure the script terminates
  }
}

deleteUser(process.argv[2])
