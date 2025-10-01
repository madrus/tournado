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
    const userId = isAdmin ? 'admin-user-id' : 'regular-user-id'

    // Mock E2E token simulating Google OAuth sign-in
    const decoded: DecodedIdToken = {
      iss: 'https://securetoken.google.com/mock-project',
      aud: 'mock-project',
      auth_time: Math.floor(Date.now() / 1000),
      user_id: userId, // Both user_id and uid are required by DecodedIdToken
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      email,
      email_verified: true,
      firebase: {
        identities: {
          'google.com': ['google-user-id'],
          email: [email],
        },
        sign_in_provider: 'google.com', // Match identities provider
      },
      uid: userId, // Both user_id and uid are required by DecodedIdToken
      name: isAdmin ? 'Test Admin' : 'Test Manager',
      picture: undefined,
    }

    return decoded
  }

  return verifyIdToken(idToken)
}
