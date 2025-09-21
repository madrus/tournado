# Authentication in Tournado

## Overview

Tournado implements Firebase Authentication with multiple sign-in methods to accommodate different user preferences and use cases. The system provides a unified authentication experience while supporting diverse authentication flows for tournament participants, referees, managers, and administrators.

## Current Authentication Methods

### 1. Google OAuth Authentication

**Primary method for users with Google accounts:**

- One-click authentication using Google OAuth 2.0
- Seamless integration with existing Google accounts
- No additional password management required
- Automatic profile information retrieval (name, email, avatar)

**Implementation:**

```typescript
// Firebase Google OAuth
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

import { auth, googleProvider } from '~/features/firebase/client'

const signInWithGoogle = async () => {
   try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      // Automatic session cookie creation via callback
      return user
   } catch (error) {
      console.error('Google sign-in failed:', error)
      throw error
   }
}
```

### 2. Email/Password Authentication

**Traditional method for users preferring email-based accounts:**

- Firebase email/password authentication
- Custom password requirements and validation
- Password reset functionality
- Account verification via email

**Implementation:**

```typescript
// Firebase Email/Password Authentication
import {
   createUserWithEmailAndPassword,
   signInWithEmailAndPassword,
} from 'firebase/auth'

import { auth } from '~/features/firebase/client'

// Sign up with email/password
const signUpWithEmail = async (email: string, password: string) => {
   try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      return result.user
   } catch (error) {
      console.error('Email sign-up failed:', error)
      throw error
   }
}

// Sign in with email/password
const signInWithEmail = async (email: string, password: string) => {
   try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
   } catch (error) {
      console.error('Email sign-in failed:', error)
      throw error
   }
}
```

## Future Authentication Considerations

### Phone Number Authentication (Future Enhancement)

**Potential benefits for specific use cases:**

- SMS-based verification code delivery
- Quick access for referees during tournaments
- Preferred method in certain international markets
- Direct communication channel for urgent notifications

**Use cases where phone auth could be valuable:**

- **Referees**: Quick authentication without email dependency
- **International tournaments**: Some regions prefer phone-first authentication
- **Emergency communications**: Direct contact for tournament updates
- **Less tech-savvy users**: Familiar SMS-based authentication

**Implementation challenges to consider:**

- **SMS costs**: Can accumulate with many users, especially international
- **Regional reliability**: SMS delivery varies by country and carrier
- **User privacy**: Some users resistant to sharing phone numbers
- **Complexity**: Additional authentication flow to maintain
- **Security concerns**: SIM swapping attacks and SMS interception risks

**Technical implementation (when implemented):**

```typescript
// Firebase Phone Authentication
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

import { auth } from '~/features/firebase/client'

// Initialize reCAPTCHA verifier
const recaptchaVerifier = new RecaptchaVerifier(
   'recaptcha-container',
   {
      size: 'invisible',
      callback: () => {
         // reCAPTCHA solved, enable phone auth
      },
   },
   auth
)

// Send SMS verification code
const sendVerificationCode = async (phoneNumber: string) => {
   try {
      const confirmationResult = await signInWithPhoneNumber(
         auth,
         phoneNumber,
         recaptchaVerifier
      )
      return confirmationResult
   } catch (error) {
      console.error('SMS verification failed:', error)
      throw error
   }
}

// Verify SMS code
const verifyPhoneCode = async (confirmationResult: any, code: string) => {
   try {
      const result = await confirmationResult.confirm(code)
      return result.user
   } catch (error) {
      console.error('Phone verification failed:', error)
      throw error
   }
}
```

**Additional implementation considerations:**

```typescript
// Complete phone authentication flow
export const usePhoneAuth = () => {
   const [verificationId, setVerificationId] = useState<string | null>(null)
   const [confirmationResult, setConfirmationResult] = useState<any>(null)

   const setupRecaptcha = () => {
      if (!window.recaptchaVerifier) {
         window.recaptchaVerifier = new RecaptchaVerifier(
            'recaptcha-container',
            {
               size: 'invisible',
               callback: () => {
                  // reCAPTCHA solved - can proceed with phone auth
               },
               'expired-callback': () => {
                  // Response expired - ask user to solve reCAPTCHA again
               },
            },
            auth
         )
      }
   }

   const sendOTP = async (phoneNumber: string) => {
      try {
         setupRecaptcha()
         const confirmation = await signInWithPhoneNumber(
            auth,
            phoneNumber,
            window.recaptchaVerifier
         )
         setConfirmationResult(confirmation)
         return confirmation
      } catch (error) {
         console.error('Error sending OTP:', error)
         throw error
      }
   }

   const verifyOTP = async (otp: string) => {
      try {
         if (confirmationResult) {
            const result = await confirmationResult.confirm(otp)
            return result.user
         }
         throw new Error('No confirmation result available')
      } catch (error) {
         console.error('Error verifying OTP:', error)
         throw error
      }
   }

   return { sendOTP, verifyOTP }
}
```

**Current decision**: Postponed in favor of focusing on core tournament management features. Can be added incrementally if user demand or international expansion requires it.

## Environment Separation Strategy

### Firebase Project Architecture

**Environment-specific Firebase projects:**

Tournado maintains separate Firebase projects for each environment to ensure proper isolation, security, and testing:

| Deployment Context      | Firebase Project   | Purpose                | Authentication Strategy                   |
| ----------------------- | ------------------ | ---------------------- | ----------------------------------------- |
| **CI (GitHub Actions)** | `ci-dummy-project` | E2E testing            | Dummy values, no real Firebase connection |
| **Development (Local)** | `tournado-dev`     | Local development      | Real Firebase, shared config with Staging |
| **Staging**             | `tournado-dev`     | Testing and acceptance | Real Firebase, shared config with Local   |
| **Production**          | `tournado-prod`    | Live application       | Real Firebase with production users       |

### Environment-Specific Configuration

**CI Environment (Testing)**:

```bash
# Dummy Firebase configuration for testing
VITE_FIREBASE_API_KEY="ci-dummy-api-key"
VITE_FIREBASE_AUTH_DOMAIN="ci-dummy.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="ci-dummy-project"
VITE_FIREBASE_STORAGE_BUCKET="ci-dummy-project.appspot.com"

# Firebase Admin (bypassed in tests)
FIREBASE_ADMIN_PROJECT_ID="ci-dummy-project"
FIREBASE_ADMIN_CLIENT_EMAIL="ci-dummy@ci-dummy-project.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nCI_DUMMY_PRIVATE_KEY_FOR_TESTING_ONLY\n-----END PRIVATE KEY-----"
```

**Development and Staging Environments**:

```bash
# Real Firebase configuration (shared by Local development and Staging deployment)
VITE_FIREBASE_PROJECT_ID="tournado-dev"
VITE_FIREBASE_AUTH_DOMAIN="tournado-dev.firebaseapp.com"
VITE_FIREBASE_STORAGE_BUCKET="tournado-dev.firebasestorage.app"

# Real Firebase Admin credentials (shared by Local development and Staging deployment)
FIREBASE_ADMIN_PROJECT_ID="tournado-dev"
FIREBASE_ADMIN_CLIENT_EMAIL="[service-account]@tournado-dev.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="[real-private-key]"

# Note: Only DATABASE_URL, BASE_URL, and configuration method differ between Local and Staging
```

**Production Environment**:

```bash
# Real Firebase configuration for production
VITE_FIREBASE_PROJECT_ID="tournado-prod"
VITE_FIREBASE_AUTH_DOMAIN="tournado-prod.firebaseapp.com"
VITE_FIREBASE_STORAGE_BUCKET="tournado-prod.firebasestorage.app"

# Real Firebase Admin credentials
FIREBASE_ADMIN_PROJECT_ID="tournado-prod"
FIREBASE_ADMIN_CLIENT_EMAIL="[service-account]@tournado-prod.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="[real-private-key]"
```

### Environment Setup Process

**Automated Setup Scripts**:

1. **CI Environment Setup** (`setup-github-secrets.sh`):
   - Sets dummy Firebase values in GitHub Actions secrets
   - Configures testing environment with non-functional Firebase config
   - Enables E2E tests to bypass Firebase entirely

2. **Staging/Production Setup** (`setup-flyio-secrets.sh`):
   - Configures real Firebase credentials for Fly.io environments
   - Sets up proper service account authentication
   - Manages environment-specific database URLs and email configuration

**Firebase Project Setup**:

```bash
# Initial Firebase project creation and configuration
firebase projects:create tournado-dev
firebase projects:create tournado-prod

# Enable Authentication and required services
firebase use tournado-dev
firebase auth:enable email-password google.com

firebase use tournado-prod
firebase auth:enable email-password google.com
```

### Testing Environment Strategy

**E2E Testing Approach**:

Our E2E tests follow the principle "Test your code, not third-party services":

- **Firebase Authentication Bypass**: Tests use session cookies directly, bypassing Firebase entirely
- **Dummy Firebase Configuration**: CI environment uses non-functional Firebase values
- **Session Cookie Testing**: Authentication state managed via server-side sessions
- **Database Isolation**: Separate test database (`prisma/data-test.db`) for all E2E tests

**Benefits of Environment Separation**:

✅ **Security**: Production Firebase never exposed to CI/testing
✅ **Reliability**: Tests don't depend on external Firebase service availability
✅ **Speed**: No network calls to Firebase during testing
✅ **Isolation**: Each environment has dedicated Firebase project and data

**See detailed testing strategy**: [E2E Firebase Strategy Guide](../testing/e2e-firebase-strategy.md)

### Environment Variable Management

**Complete environment variable reference**: [Environment Variables Documentation](../environment-variables.md)

**Key principles**:

- Never share secrets between environments
- Use environment-specific Firebase projects
- Rotate secrets regularly, especially for production
- Use minimum required permissions for service accounts

## Architecture & Session Management

### Firebase Session Cookie Bridging

**Server-side session management:**

- Firebase ID tokens converted to HTTP-only session cookies
- SSR-compatible authentication state
- Secure session validation for protected routes

```typescript
// Session cookie bridging
// app/features/firebase/session.server.ts
export async function createSessionCookie(idToken: string) {
   if (!adminAuth) throw new Error('Firebase Admin not initialized')

   const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 5 * 1000, // 5 days
   })

   return sessionCookie
}

export async function validateSessionCookie(sessionCookie: string) {
   if (!adminAuth) return null

   try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
      return decodedClaims
   } catch {
      return null
   }
}
```

### Role-Based Access Control (RBAC)

**Automatic role assignment:**

- Super admins via `SUPER_ADMIN_EMAILS` environment variable
- Default `PUBLIC` role for new users
- Admin-managed role assignments for existing users

**Roles hierarchy:**

- `PUBLIC`: Basic read access to tournaments and teams
- `REFEREE`: Match scoring and assigned tournament access
- `MANAGER`: Tournament and team management within scope
- `ADMIN`: Full system access and user role management

## User Experience Flows

### Multi-Method Sign-in Page

**Current authentication interface:**

```tsx
// app/routes/auth.signin.tsx
export default function SignIn() {
   return (
      <div className='auth-container'>
         <h1>Sign In to Tournado</h1>

         {/* Google OAuth - Primary option */}
         <FirebaseSignIn variant='primary' />

         <div className='divider'>or</div>

         {/* Email/Password - Alternative */}
         <FirebaseEmailSignIn mode='signin' />

         <p>
            Don't have an account? <Link to='/auth/signup'>Sign up</Link>
         </p>
      </div>
   )
}
```

### Registration Flow Options

**Current signup paths:**

1. **Google OAuth**: Instant account creation with Google profile
2. **Email/Password**: Traditional registration with profile completion

## Security Features

### Multi-Factor Authentication (MFA)

**Enhanced security for sensitive roles:**

- Optional MFA for ADMIN and MANAGER roles
- Phone number or authenticator app as second factor
- Required for critical tournament management operations

### Session Security

**Comprehensive security measures:**

- HTTP-only session cookies (XSS protection)
- Secure cookie flags for HTTPS
- Session expiration and refresh handling
- Logout invalidates both client and server sessions

### Rate Limiting

**Authentication attempt protection:**

- IP-based rate limiting for sign-in attempts
- Progressive delays for failed authentication
- Account lockout protection for repeated failures

## Use Case Recommendations

### For Tournament Organizers (ADMIN/MANAGER)

**Recommended**: Email/Password or Google OAuth

- Reliable, professional authentication methods
- Easy account recovery and management
- Suitable for desktop/mobile tournament management

### For Referees

**Recommended**: Google OAuth or Email/Password

- Quick access during tournaments
- Mobile-optimized authentication flow
- Familiar authentication methods

### For Team Leaders

**Recommended**: Email/Password or Google OAuth

- Flexible options based on technical comfort
- Reliable contact methods for tournament communications
- Profile information for team management

### For Public Users

**Recommended**: Google OAuth or Email/Password

- Convenient authentication for following tournaments
- Easy account creation for registration
- Social login familiarity

## Implementation Status

**Completed:**

- ✅ Firebase setup and configuration
- ✅ Google OAuth authentication
- ✅ Session cookie bridging
- ✅ Server-side authentication validation
- ✅ Role-based access control middleware

**Current (TASK-0004):**

- 🔄 Email/password authentication implementation
- 🔄 Legacy authentication system removal
- 🔄 Multi-super-admin configuration

**Future Enhancements:**

- Phone number authentication (see detailed section above)
- Multi-factor authentication (MFA)
- Social login providers (GitHub, Microsoft)
- SAML/SSO integration for organizations
- Biometric authentication for mobile apps

## Technical Architecture

### Firebase Configuration

**Client-side setup:**

```typescript
// app/features/firebase/client.ts
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
   apiKey: process.env.VITE_FIREBASE_API_KEY,
   authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
   projectId: process.env.VITE_FIREBASE_PROJECT_ID,
   // ... other config
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
```

**Server-side setup:**

```typescript
// app/features/firebase/server.ts
import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const adminApp = initializeApp({
   credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
   }),
})

export const adminAuth = getAuth(adminApp)
```

## Best Practices

### Security

- Always validate sessions server-side
- Use HTTPS for all authentication flows
- Implement proper CSRF protection
- Regular security audits and updates

### User Experience

- Clear authentication method explanations
- Graceful error handling and messaging
- Consistent UI across authentication methods
- Mobile-responsive authentication forms

### Development

- Comprehensive error logging
- Authentication flow testing
- Rate limiting implementation
- Session lifecycle management

#authentication #firebase #google-oauth #email-password #phone-auth #security #rbac #tournament-management
