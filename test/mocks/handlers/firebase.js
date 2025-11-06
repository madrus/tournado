import { http, HttpResponse } from 'msw'

// Mock Firebase Auth endpoints and Google OAuth flow for E2E tests
export const firebaseHandlers = [
  // Mock the local auth callback endpoint
  http.post('*/auth/callback', async ({ request }) => {
    const formData = await request.formData()
    const idToken = formData.get('idToken')
    const redirectTo = formData.get('redirectTo')

    const idTokenString = typeof idToken === 'string' ? idToken : undefined
    const redirectToString = typeof redirectTo === 'string' ? redirectTo : undefined

    console.log(
      'MSW handling auth callback with idToken:',
      idTokenString?.substring(0, 20) + '...'
    )

    // Validate mock token
    if (
      idTokenString &&
      idTokenString.startsWith('mock-jwt-header.payload.signature-')
    ) {
      // For new users (signup), always redirect to homepage
      const redirectUrl = redirectToString || '/'
      console.log('MSW auth callback successful, redirecting to:', redirectUrl)

      // Return redirect response
      return new HttpResponse(null, {
        status: 303,
        headers: {
          Location: redirectUrl,
          'Set-Cookie': 'mock-session=authenticated; Path=/; HttpOnly',
        },
      })
    } else {
      console.log('MSW auth callback failed - invalid token')
      return new HttpResponse(null, {
        status: 303,
        headers: {
          Location: '/auth/signin?error=invalid-token',
        },
      })
    }
  }),
  // Mock Google OAuth redirect endpoint
  http.get('https://accounts.google.com/oauth2/auth', () => {
    // In real flow, this would redirect to Google's OAuth page
    // For testing, we'll simulate a successful OAuth response
    return HttpResponse.redirect('http://localhost:5173/auth/callback', 302)
  }),

  // Mock Firebase Auth REST API endpoints
  http.post(
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp',
    async ({ request }) => {
      const body = await request.json()

      // Extract email from the mock request to determine test user
      const email = body.email || 'test-admin@example.com'

      // Return mock Firebase Auth response
      return HttpResponse.json({
        kind: 'identitytoolkit#VerifyAssertionResponse',
        localId:
          email === 'test-admin@example.com' ? 'admin-user-id' : 'regular-user-id',
        email,
        displayName: email === 'test-admin@example.com' ? 'Test Admin' : 'Test Manager',
        idToken: generateMockIdToken(email),
        refreshToken: 'mock-refresh-token',
        expiresIn: '3600',
        isNewUser: false,
      })
    }
  ),

  // Mock Firebase Auth email/password sign in
  http.post(
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
    async ({ request }) => {
      const body = await request.json()
      const { email, password } = body

      // For E2E tests, accept the test users with their expected passwords
      if (email && password === 'MyReallyStr0ngPassw0rd!!!') {
        return HttpResponse.json({
          kind: 'identitytoolkit#VerifyPasswordResponse',
          localId: email.includes('admin') ? 'admin-user-id' : 'regular-user-id',
          email,
          displayName: email.includes('admin') ? 'Test Admin' : 'Test Manager',
          idToken: generateMockIdToken(email),
          refreshToken: 'mock-refresh-token',
          expiresIn: '3600',
          registered: true,
        })
      }

      // Invalid credentials
      return HttpResponse.json(
        {
          error: {
            code: 400,
            message: 'INVALID_PASSWORD',
          },
        },
        { status: 400 }
      )
    }
  ),

  // Mock Firebase Auth email/password sign up
  http.post(
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp',
    async ({ request }) => {
      const body = await request.json()
      const { email, password } = body

      console.log('MSW: Firebase signup request intercepted:', { email, password })

      // For E2E tests, accept any email with the expected password
      if (email && password === 'MyReallyStr0ngPassw0rd!!!') {
        const response = {
          kind: 'identitytoolkit#SignupNewUserResponse',
          localId: `new-user-${Date.now()}`,
          email,
          displayName: email.split('@')[0], // Use part before @ as display name
          idToken: generateMockIdToken(email),
          refreshToken: 'mock-refresh-token',
          expiresIn: '3600',
        }
        console.log('MSW: Firebase signup successful, returning:', response)
        return HttpResponse.json(response)
      }

      // Invalid signup
      console.log('MSW: Firebase signup failed - weak password')
      return HttpResponse.json(
        {
          error: {
            code: 400,
            message: 'WEAK_PASSWORD',
          },
        },
        { status: 400 }
      )
    }
  ),

  // Mock Firebase Auth token refresh
  http.post('https://securetoken.googleapis.com/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      expires_in: '3600',
      token_type: 'Bearer',
      refresh_token: 'mock-refresh-token',
      id_token: generateMockIdToken('test-admin@example.com'),
      user_id: 'admin-user-id',
      project_id: 'mock-project',
    })
  }),

  // Mock our app's auth callback endpoint behavior
  http.post('http://localhost:8811/auth/callback', async ({ request }) => {
    const formData = await request.formData()
    const idToken = formData.get('idToken')
    const redirectTo = formData.get('redirectTo')

    const idTokenString = typeof idToken === 'string' ? idToken : undefined
    const redirectToString = typeof redirectTo === 'string' ? redirectTo : undefined

    console.log('MSW: Auth callback intercepted:', {
      idToken: idTokenString?.substring(0, 20) + '...',
      redirectTo: redirectToString,
    })

    // Verify we received a mock token
    if (idTokenString && idTokenString.startsWith('mock-jwt-')) {
      // Extract email from mock token
      const email = idTokenString.split('-').pop()
      console.log('MSW: Extracted email from token:', email)

      // For new users (signup), always redirect to homepage regardless of admin status
      const finalRedirect = redirectToString || '/'

      console.log('MSW: Redirecting to:', finalRedirect)
      return HttpResponse.redirect(`http://localhost:8811${finalRedirect}`, 303)
    }

    // Invalid token
    console.log('MSW: Invalid token, redirecting to signin')
    return HttpResponse.redirect(
      'http://localhost:8811/auth/signin?error=invalid-token',
      303
    )
  }),
]

/**
 * Generate a mock JWT-like token for testing
 * This is NOT a real JWT, just a mock format that our callback can recognize
 */
function generateMockIdToken(email) {
  const mockPayload = {
    iss: 'https://securetoken.google.com/mock-project',
    aud: 'mock-project',
    auth_time: Math.floor(Date.now() / 1000),
    user_id: email.includes('admin') ? 'admin-user-id' : 'regular-user-id',
    sub: email.includes('admin') ? 'admin-user-id' : 'regular-user-id',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    email,
    email_verified: true,
    firebase: {
      identities: {
        'google.com': ['google-user-id'],
        email: [email],
      },
      sign_in_provider: 'google.com',
    },
  }

  // Create a mock JWT format (not cryptographically signed, just for testing)
  const header = btoa(JSON.stringify({ alg: 'RS256', kid: 'mock-key-id', typ: 'JWT' }))
  const payload = btoa(JSON.stringify(mockPayload))
  const signature = 'mock-signature'

  return `mock-jwt-${header}.${payload}.${signature}-${email}`
}
