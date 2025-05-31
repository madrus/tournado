#!/usr/bin/env tsx
// Test-specific wrapper for create-user that forces the test database
import { PrismaClient, Role } from '@prisma/client'

import bcrypt from 'bcryptjs'
import { parse } from 'cookie'
import { resolve } from 'path'

import { createUserSession } from '~/utils/session.server'

// Force the test database URL via environment variable
process.env.DATABASE_URL = `file:${resolve(process.cwd(), 'prisma/data-test.db')}?connection_limit=1`

const prisma = new PrismaClient()

async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: Role
) {
  const hashedPassword = await bcrypt.hash(password, 10)

  return prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      role,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })
}

async function createAndSignin(
  email: string,
  firstName?: string,
  lastName?: string,
  role?: Role
) {
  if (!email) {
    throw new Error('email required for signin')
  }
  if (!email.endsWith('@example.com')) {
    throw new Error('All test emails must end in @example.com')
  }

  // Extract a name from the email for test purposes
  const name = email.split('@')[0]
  const defaultFirstName = name.charAt(0).toUpperCase() + name.slice(1)
  const defaultLastName = 'TestUser'

  const user = await createUser(
    email,
    'myreallystrongpassword',
    firstName || defaultFirstName,
    lastName || defaultLastName,
    role || Role.PUBLIC // Default role for test users
  )

  const response = await createUserSession({
    request: new Request('test://test'),
    userId: user.id,
    remember: false,
    redirectTo: '/',
  })

  const cookieValue = response.headers.get('Set-Cookie')
  if (!cookieValue) {
    throw new Error('Cookie missing from createUserSession response')
  }
  const parsedCookie = parse(cookieValue)
  // we log it like this so our cypress command can parse it out and set it as
  // the cookie value.
  console.log(
    `
<cookie>
  ${parsedCookie.__session}
</cookie>
  `.trim()
  )
}

createAndSignin(
  process.argv[2],
  process.argv[3],
  process.argv[4],
  process.argv[5] as Role
).finally(() => {
  prisma.$disconnect()
})
