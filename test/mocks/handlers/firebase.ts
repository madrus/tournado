import { HttpResponse, type JsonBodyType, http } from 'msw'

type MockUserRecord = {
  uid: string
  email?: string
  emailVerified: boolean
  displayName?: string
  disabled: boolean
}

const mockUsers: Record<string, MockUserRecord> = {}

type SignInPayload = {
  email?: string
  password?: string
}

type SignUpPayload = {
  email?: string
}

function generateMockIdToken(email: string): string {
  return Buffer.from(
    JSON.stringify({
      email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    }),
  ).toString('base64url')
}

export const firebaseHandlers = [
  http.post(
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
    async ({ request }): Promise<HttpResponse<JsonBodyType>> => {
      const { email, password } = (await request.json()) as SignInPayload

      if (!email || !password) {
        return HttpResponse.json(
          { error: { message: 'INVALID_EMAIL_OR_PASSWORD' } },
          { status: 400 },
        )
      }

      const user = Object.values(mockUsers).find(
        u =>
          u.email?.toLowerCase() === String(email).toLowerCase() &&
          password === 'password',
      )

      if (!user) {
        return HttpResponse.json(
          { error: { message: 'EMAIL_NOT_FOUND' } },
          { status: 400 },
        )
      }

      return HttpResponse.json({
        idToken: generateMockIdToken(user.email ?? ''),
        refreshToken: 'mock-refresh-token',
        expiresIn: '3600',
        localId: user.uid,
        email: user.email,
      })
    },
  ),
  http.post(
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp',
    async ({ request }): Promise<HttpResponse<JsonBodyType>> => {
      const { email } = (await request.json()) as SignUpPayload

      if (!email) {
        return HttpResponse.json(
          { error: { message: 'INVALID_EMAIL' } },
          { status: 400 },
        )
      }

      const uid = `mock-${Object.keys(mockUsers).length + 1}`
      const user: MockUserRecord = {
        uid,
        email,
        emailVerified: false,
        disabled: false,
      }
      mockUsers[uid] = user

      return HttpResponse.json({
        idToken: generateMockIdToken(email),
        refreshToken: 'mock-refresh-token',
        expiresIn: '3600',
        localId: uid,
        email,
      })
    },
  ),
]
