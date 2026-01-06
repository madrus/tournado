# E2E Testing Firebase Strategy

## Overview

This document details Tournado's End-to-End (E2E) testing strategy that implements the principle **"Test your code, not third-party services"**. Our approach bypasses Firebase authentication entirely in favor of session cookie-based authentication during tests.

## Core Philosophy

### "Test Your Code, Not Third-Party Services"

**Rationale**: E2E tests should verify application logic and user flows, not the functionality of external services like Firebase Authentication.

**Benefits**:

- **Faster execution**: No network calls to Firebase services
- **Reliability**: No dependency on external service availability
- **Consistency**: Tests run identically across environments
- **Simplicity**: Reduced test complexity and maintenance overhead

**What we DO test**:

- Application routing and navigation
- User interface interactions
- Form submissions and validation
- Authorization and role-based access control
- Database operations via our models
- Session management and user state

**What we DON'T test**:

- Firebase sign-in/sign-up/sign-out flows
- Google OAuth integration
- Firebase token validation
- Firebase user creation/management

## Implementation Strategy

### Authentication Bypass Mechanism

Instead of using Firebase authentication in E2E tests, we create session cookies directly:

```typescript
// playwright/helpers/global-setup.ts
export default async function globalSetup() {
   // Create authenticated session cookies directly
   const adminUser = await createAdminUser()
   const userUser = await createRegularUser()

   // Save session states for test contexts
   await saveAuthState(adminUser, 'admin-auth.json')
   await saveAuthState(userUser, 'user-auth.json')
}
```

### Environment Isolation

Our testing environments are completely isolated from Firebase services:

#### CI Environment (GitHub Actions)

- **Firebase Config**: Dummy values that never connect to real Firebase
- **Authentication**: Session cookies only, Firebase bypassed entirely
- **Database**: Temporary SQLite database (`prisma/data-test.db`)
- **Purpose**: Fast, reliable CI execution

#### Test Database Separation

- **Local Development**: `prisma/data.db`
- **Testing**: `prisma/data-test.db` (completely separate)
- **Automatic setup**: Migrations applied before each test run
- **Clean slate**: Database wiped and seeded for each test session

## Test Architecture

### Authentication Contexts

We maintain three distinct test contexts:

#### 1. No Authentication (`no-auth` project)

- **Purpose**: Test authentication flows and public access
- **Usage**: Sign-in, sign-up, public pages
- **Session**: No pre-authenticated user

#### 2. User Authentication (`user-authenticated` project)

- **Purpose**: Test user-level features and permissions
- **Usage**: Team management, user profile, user-restricted areas
- **Session**: Pre-authenticated regular user via `user-auth.json`

#### 3. Admin Authentication (`admin-authenticated` project)

- **Purpose**: Test admin features and management flows
- **Usage**: Tournament management, user administration, system settings
- **Session**: Pre-authenticated admin user via `admin-auth.json`

### Test Organization

```text
playwright/tests/
├── auth.spec.ts              # Authentication flows (no-auth project)
├── admin-*.spec.ts          # Admin features (admin-authenticated project)
├── user-*.spec.ts           # User features (user-authenticated project)
└── *.spec.ts                # Public access (no-auth project)
```

## Session Cookie Implementation

### Global Setup Process

1. **Database Preparation**

   ```typescript
   // Wipe test database and apply migrations
   await cleanupDatabase()
   await migrateDatabase()
   ```

2. **User Creation**

   ```typescript
   // Create test users directly in database
   const adminUser = await createAdminUser({
      email: 'admin@tournado.com',
      role: 'ADMIN',
      firebaseUid: 'test-admin-uid',
   })
   ```

3. **Session Creation**

   ```typescript
   // Create session cookies for authentication contexts
   const sessionId = await createSession(adminUser.id)
   await saveSessionCookie(sessionId, 'admin-auth.json')
   ```

### Authentication State Management

Pre-authenticated contexts are loaded automatically:

```typescript
// playwright.config.ts
{
  name: 'admin-authenticated',
  use: {
    ...devices['Desktop Chrome'],
    storageState: 'playwright/.auth/admin-auth.json'
  }
}
```

This eliminates the need for login flows in most tests, enabling direct testing of authenticated features.

## Benefits and Tradeoffs

### Benefits

✅ **Fast Test Execution**

- No Firebase network calls
- Pre-authenticated contexts skip login flows
- Parallel test execution without service limits

✅ **Reliable and Consistent**

- No external service dependencies
- Deterministic test outcomes
- Works offline or in restricted networks

✅ **Environment Isolation**

- CI tests never touch production Firebase
- Local/Staging Firebase unaffected by test runs
- Clean separation of concerns

✅ **Simplified Debugging**

- No Firebase service errors to diagnose
- Clear test failures related to application logic
- Easier to reproduce issues locally

### Tradeoffs

⚠️ **Firebase Integration Not Tested**

- Firebase authentication flows must be tested manually
- Google OAuth integration requires separate testing
- Firebase service configuration not validated

⚠️ **Authentication Logic Partially Mocked**

- Session creation bypasses Firebase token validation
- Real authentication flow complexity not exercised
- Firebase Admin SDK integration not fully tested

## Testing Coverage

### What IS Tested

- **Application Logic**: All business logic and user flows
- **Session Management**: Cookie-based authentication state
- **Authorization**: Role-based access control (RBAC)
- **Database Operations**: Data persistence and retrieval
- **UI Interactions**: Form submissions, navigation, user feedback
- **Error Handling**: Application error states and validation

### What is NOT Tested

- **Firebase Authentication**: Sign-in/sign-up/sign-out flows
- **OAuth Integration**: Google sign-in functionality
- **Firebase Security Rules**: Database access rules
- **Firebase Token Management**: JWT token validation and refresh
- **Firebase Admin Operations**: User management via Firebase Admin SDK

## Manual Testing Requirements

Since E2E tests bypass Firebase authentication, the following must be tested manually:

### Authentication Flows

- Google OAuth sign-in flow
- Email/password sign-up flow
- Email/password sign-in flow
- Password reset functionality
- Account verification emails

### Firebase Integration

- Firebase project configuration
- Security rules validation
- User synchronization between Firebase and application database
- Session cookie creation from Firebase tokens

## Environment Configuration

### CI Environment Variables

The CI environment uses dummy Firebase values to prevent real service connections:

```bash
# GitHub Actions secrets (dummy values)
VITE_FIREBASE_API_KEY="ci-dummy-api-key"
VITE_FIREBASE_AUTH_DOMAIN="ci-dummy.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="ci-dummy-project"
# ... other dummy Firebase config
```

### Local Testing

For local E2E test development:

```bash
# Uses test database automatically
pnpm test:e2e:dev

# Or run specific tests
pnpm exec playwright test auth.spec.ts --project=no-auth
```

The test environment automatically:

1. Applies migrations to `prisma/data-test.db`
2. Seeds test users with known credentials
3. Creates authentication contexts
4. Starts application with test configuration

## Security Considerations

### Session Security in Tests

- Test sessions use secure secrets appropriate for testing
- Session cookies are temporary and test-specific
- No production credentials are used in CI environment

### Firebase Project Isolation

- CI never connects to real Firebase projects
- Test database is completely separate from local/staging/production
- Firebase configuration is environment-specific

## Troubleshooting

### Common Issues

#### "Authentication required" errors in tests

- **Cause**: Test trying to access protected route without proper context
- **Solution**: Ensure test uses correct authentication project (admin-authenticated, user-authenticated)

#### Tests failing with Firebase connection errors

- **Cause**: Test environment trying to connect to real Firebase
- **Solution**: Verify CI environment variables use dummy Firebase values

#### Database state conflicts

- **Cause**: Tests interfering with each other's data
- **Solution**: Tests should be isolated; global setup wipes database between runs

#### Session cookie not working

- **Cause**: Session creation failed during global setup
- **Solution**: Check that test users are created successfully and session service is initialized

### Debugging Tips

1. **Check authentication context**:

   ```bash
   # Verify which authentication context test is using
   grep -n "project:" playwright.config.ts
   ```

2. **Inspect session cookies**:

   ```bash
   # Check generated authentication files
   ls playwright/.auth/
   cat playwright/.auth/admin-auth.json
   ```

3. **Verify test database**:

   ```bash
   # Check test database exists and has data
   sqlite3 prisma/data-test.db ".tables"
   sqlite3 prisma/data-test.db "SELECT * FROM User;"
   ```

4. **Environment variable validation**:

   ```bash
   # In CI, verify dummy Firebase values are set
   echo $VITE_FIREBASE_PROJECT_ID  # Should be "ci-dummy-project"
   ```

## Migration from Firebase Testing

If you previously had E2E tests that used real Firebase authentication:

### Old Pattern (Avoid)

```typescript
// Don't do this in E2E tests
test('admin feature', async ({ page }) => {
   await page.goto('/auth/signin')
   await page.fill('#email', 'admin@example.com')
   await page.fill('#password', 'password')
   await page.click('[type="submit"]')
   await page.waitForURL('/admin')

   // Test admin feature...
})
```

### New Pattern (Preferred)

```typescript
// Use pre-authenticated context instead
test('admin feature', async ({ page }) => {
   // User is already authenticated as admin
   await page.goto('/admin')

   // Test admin feature directly...
})
```

Configure the test to use the admin-authenticated project in `playwright.config.ts`.

## Related Documentation

- [Testing Overview](overview.md) - High-level testing strategy and tools
- [Environment Variables Reference](../environment-variables.md) - Complete environment configuration
- [Authentication Guide](../development/authentication.md) - Firebase authentication implementation
- [Playwright Guide](playwright-guide.md) - Complete Playwright setup and usage

#testing #e2e #firebase #authentication #strategy #documentation
