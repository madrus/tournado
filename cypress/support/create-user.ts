// Use this to create a new user and login with that user
// Simply call this with:
// pnpm exec tsx ./cypress/support/create-user.ts username@example.com,
// and it will log out the cookie value you can use to interact with the server
// as that new user.
import { installGlobals } from '@remix-run/node'

import { Role } from '@prisma/client'

import { parse } from 'cookie'

import { createUser } from '@/models/user.server'
import { createUserSession } from '@/utils/session.server'

installGlobals()

async function createAndLogin(
  email: string,
  firstName?: string,
  lastName?: string,
  role?: Role
) {
  if (!email) {
    throw new Error('email required for login')
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

createAndLogin(
  process.argv[2],
  process.argv[3],
  process.argv[4],
  process.argv[5] as Role
)
