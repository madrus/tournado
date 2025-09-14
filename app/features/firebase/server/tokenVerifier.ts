import type { DecodedIdToken } from '../server'
import { verifyIdToken } from '../server'
import { extractEmailFromMockToken, isE2EServer, isMockToken } from '../utils/env'

export async function verifyIdTokenWithEnv(
  idToken: string,
  request: Request
): Promise<DecodedIdToken> {
  if (isE2EServer(request) && isMockToken(idToken)) {
    const email = extractEmailFromMockToken(idToken)
    const isAdmin = email.includes('admin')

    const decoded: DecodedIdToken = {
      iss: 'https://securetoken.google.com/mock-project',
      aud: 'mock-project',
      auth_time: Math.floor(Date.now() / 1000),
      user_id: isAdmin ? 'admin-user-id' : 'regular-user-id',
      sub: isAdmin ? 'admin-user-id' : 'regular-user-id',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      email,
      email_verified: true,
      firebase: {
        identities: {
          'google.com': ['google-user-id'],
          email: [email],
        },
        sign_in_provider: 'password',
      },
      uid: isAdmin ? 'admin-user-id' : 'regular-user-id',
      name: isAdmin ? 'Test Admin' : 'Test Manager',
      picture: undefined,
    }

    return decoded
  }

  return verifyIdToken(idToken)
}
