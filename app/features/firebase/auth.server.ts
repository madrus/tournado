import { redirect } from 'react-router'
import type { User } from '~/models/user.server'
import { getUser } from '~/utils/session.server'

/**
 * Require Firebase authentication with redirect on failure
 * This function ensures the user is authenticated via Firebase or legacy session
 */
export async function requireFirebaseAuth(
  request: Request,
  redirectTo?: string,
): Promise<User> {
  const user = await getUser(request)

  if (!user) {
    const url = new URL(request.url)
    const currentPath = `${url.pathname}${url.search}`
    const searchParams = new URLSearchParams([
      ['redirectTo', redirectTo || currentPath],
    ])
    throw redirect(`/auth/signin?${searchParams}`)
  }

  return user
}
