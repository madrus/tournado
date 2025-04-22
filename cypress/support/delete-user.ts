// Use this to delete a user by their email
// Simply call this with:
// pnpm exec tsx ./cypress/support/delete-user.ts username@example.com,
// and that user will get deleted
import { installGlobals } from '@remix-run/node'

import { prisma } from '@/db.server'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

installGlobals()

async function deleteUser(email: string) {
  if (!email) {
    console.error('Email required for login')
    process.exit(1)
  }
  if (!email.endsWith('@example.com')) {
    console.error('All test emails must end in @example.com')
    process.exit(1)
  }

  try {
    // First check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log('User not found, so no need to delete')
      return
    }

    // If user exists, delete it
    await prisma.user.delete({
      where: { email },
    })
    console.log('User deleted successfully')
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      console.log('User not found, so no need to delete')
    } else {
      console.error('Error deleting user:', error)
      process.exit(1)
    }
  } finally {
    await prisma.$disconnect()
  }
}

deleteUser(process.argv[2])
