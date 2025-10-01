# Environment Variables Reference

## Overview

This document provides a complete reference for all environment variables used in Tournado across different environments. Each environment (CI, staging, production) has its own configuration strategy to ensure security and functionality.

## Environment Strategy

### Environment Separation

| Deployment Context      | Purpose                | Firebase Project | Configuration                       |
| ----------------------- | ---------------------- | ---------------- | ----------------------------------- |
| **CI (GitHub Actions)** | E2E testing            | Dummy values     | Bypasses Firebase authentication    |
| **Development (Local)** | Local development      | `tournado-dev`   | Shares Firebase config with Staging |
| **Staging**             | Testing and acceptance | `tournado-dev`   | Shares Firebase config with Local   |
| **Production**          | Live application       | `tournado-prod`  | Real Firebase for users             |

### Setup Scripts

- **`setup-github-secrets.sh`**: Configures CI environment with dummy values
- **`setup-flyio-secrets.sh`**: Configures Fly.io environments with real values

## Required Environment Variables

### Core Application Variables

#### `SESSION_SECRET`

- **Purpose**: Cookie session encryption
- **Required**: Yes (all environments)
- **Format**: Random hex string (32+ characters)
- **Example**: `daf8e021c28c5e3d29794fa41ab6c84a`
- **Generation**: `openssl rand -hex 32`

#### `SUPER_ADMIN_EMAILS`

- **Purpose**: Comma-separated list of admin email addresses with dynamic role assignment
- **Required**: Yes
- **Format**: `email1@domain.com,email2@domain.com`
- **Example**: `madrus@gmail.com,otmanabdel@hotmail.com`
- **Behavior**: See [Admin Role Management](#admin-role-management) section for details on dynamic role assignment

#### `SUPER_ADMIN_PASSWORD`

- **Purpose**: Password used when creating seed admin users in the database
- **Required**: Yes (required by `prisma/seed.js`)
- **Format**: Strong password string (12+ characters recommended)
- **Behavior**: Seeding fails if this variable is not set

### Firebase Client Configuration (VITE\_\*)

These variables configure the Firebase client SDK and are exposed to the browser.

#### `VITE_FIREBASE_API_KEY`

- **Purpose**: Firebase project API key
- **Required**: Yes
- **CI Value**: `"ci-dummy-api-key"`
- **Staging**: Real API key from `tournado-dev` project
- **Production**: Real API key from `tournado-prod` project

#### `VITE_FIREBASE_AUTH_DOMAIN`

- **Purpose**: Firebase authentication domain
- **Required**: Yes
- **CI Value**: `"ci-dummy.firebaseapp.com"`
- **Staging**: `"tournado-dev.firebaseapp.com"`
- **Production**: `"tournado-prod.firebaseapp.com"`

#### `VITE_FIREBASE_PROJECT_ID`

- **Purpose**: Firebase project identifier
- **Required**: Yes
- **CI Value**: `"ci-dummy-project"`
- **Staging**: `"tournado-dev"`
- **Production**: `"tournado-prod"`

#### `VITE_FIREBASE_STORAGE_BUCKET`

- **Purpose**: Firebase storage bucket
- **Required**: Yes
- **CI Value**: `"ci-dummy-project.appspot.com"`
- **Staging**: `"tournado-dev.firebasestorage.app"`
- **Production**: `"tournado-prod.firebasestorage.app"`

#### `VITE_FIREBASE_MESSAGING_SENDER_ID`

- **Purpose**: Firebase messaging sender ID
- **Required**: Yes
- **CI Value**: `"123456789"`
- **Staging**: Real sender ID from `tournado-dev`
- **Production**: Real sender ID from `tournado-prod`

#### `VITE_FIREBASE_APP_ID`

- **Purpose**: Firebase web app identifier
- **Required**: Yes
- **CI Value**: `"1:123456789:web:ci-dummy-app-id"`
- **Staging**: Real app ID from `tournado-dev`
- **Production**: Real app ID from `tournado-prod`

#### `VITE_FIREBASE_MEASUREMENT_ID`

- **Purpose**: Firebase Analytics measurement ID
- **Required**: Optional
- **CI Value**: `"G-CI-DUMMY-ID"`
- **Staging**: `""` (empty, can be configured later)
- **Production**: `""` (empty, can be configured later)

### Firebase Admin Configuration

These variables configure the Firebase Admin SDK for server-side operations.

#### `FIREBASE_ADMIN_PROJECT_ID`

- **Purpose**: Firebase Admin project ID
- **Required**: Yes (server-side)
- **CI Value**: `"ci-dummy-project"`
- **Staging**: `"tournado-dev"`
- **Production**: `"tournado-prod"`

#### `FIREBASE_ADMIN_CLIENT_EMAIL`

- **Purpose**: Firebase service account email
- **Required**: Yes (server-side)
- **CI Value**: `"ci-dummy@ci-dummy-project.iam.gserviceaccount.com"`
- **Staging**: Service account email from `tournado-dev`
- **Production**: Service account email from `tournado-prod`

#### `FIREBASE_ADMIN_PRIVATE_KEY`

- **Purpose**: Firebase service account private key
- **Required**: Yes (server-side)
- **Format**: PEM format private key with escaped newlines
- **CI Value**: `"-----BEGIN PRIVATE KEY-----\nCI_DUMMY_PRIVATE_KEY_FOR_TESTING_ONLY\n-----END PRIVATE KEY-----"`
- **Staging**: Real private key from `tournado-dev` service account
- **Production**: Real private key from `tournado-prod` service account

### Email Configuration

#### `RESEND_API_KEY`

- **Purpose**: Resend email service API key
- **Required**: Yes
- **Example**: `"re_KkAyxbkm_CDrhg4JZ82S4NdHYTxiueZ7z"`

#### `EMAIL_FROM`

- **Purpose**: Email sender address and name
- **Required**: Yes
- **CI Value**: `"ci-test@example.com"`
- **Staging**: `"Team Registration <staging@resend.dev>"`
- **Production**: `"Team Registration <onboarding@resend.dev>"`

#### `BASE_URL`

- **Purpose**: Base URL for email links
- **Required**: Yes
- **CI Value**: `"http://localhost:8811"`
- **Staging**: `"https://tournado-staging.fly.dev"`
- **Production**: `"https://tournado-production.fly.dev"`

### Database Configuration

#### `DATABASE_URL`

- **Purpose**: Database connection string
- **Required**: Yes
- **Local Dev**: `"file:./prisma/data.db?connection_limit=1"`
- **Local Test**: `"file:./prisma/data-test.db?connection_limit=1"`
- **Production**: `"file:/data/sqlite.db?connection_limit=1"`

### Optional Configuration

#### `PLAYWRIGHT`

- **Purpose**: Indicates Playwright testing environment
- **Required**: No
- **Value**: `"true"` (set automatically during E2E tests)
- **Usage**: Disables secure cookies over HTTP for testing

#### `NODE_ENV`

- **Purpose**: Node.js environment indicator
- **Required**: No (automatically set)
- **Values**: `"development"`, `"production"`, `"test"`

## Security Considerations

### Secret Management

1. **Never commit secrets to version control**
2. **Use environment-specific values** - never share secrets between environments
3. **Rotate secrets regularly**, especially for production
4. **Use minimum required permissions** for service accounts

### CI/CD Security

- **CI uses dummy Firebase values** because E2E tests bypass Firebase authentication
- **Real secrets are never exposed** in CI logs or artifacts
- **GitHub secrets are encrypted** and only accessible during workflow execution

### Production Security

- **Firebase service accounts** have minimal required permissions
- **Session secrets are unique** per environment
- **HTTPS is enforced** in production (secure cookies enabled)

## Setup Instructions

### Initial Setup

1. **Install required tools**:

   ```bash
   # Firebase CLI
   npm install -g firebase-tools
   firebase login

   # GitHub CLI (for secrets)
   brew install gh
   gh auth login
   ```

2. **Set up CI environment (automated)**:

   ```bash
   # Make script executable and run
   chmod +x setup-github-secrets.sh
   ./setup-github-secrets.sh
   ```

3. **Set up Fly.io environments (manual command-line process recommended)**:

   Due to Fly.io authentication token issues and deployment restarts, **running individual `flyctl` commands is more reliable** than using the automated script.

   **Note**: "Manual setup" means running these terminal commands one-by-one, **NOT** using the Fly.io web dashboard UI:

   ```bash
   # First, ensure you're authenticated (may need to re-login)
   fly auth login

   # Then set secrets one by one for staging
   flyctl secrets set SESSION_SECRET="$(openssl rand -hex 32)" --app tournado-staging
   flyctl secrets set SUPER_ADMIN_EMAILS="admin1@domain1.com,admin2@domain2.com" --app tournado-staging
   flyctl secrets set SUPER_ADMIN_PASSWORD="your-strong-password" --app tournado-staging

   # Firebase Client secrets (for staging - using tournado-dev project)
   flyctl secrets set VITE_FIREBASE_API_KEY="AIzaSyBIZVQlh4hbauqErOgp-qmeuBDhMfw6QrQ" --app tournado-staging
   flyctl secrets set VITE_FIREBASE_AUTH_DOMAIN="tournado-dev.firebaseapp.com" --app tournado-staging
   flyctl secrets set VITE_FIREBASE_PROJECT_ID="tournado-dev" --app tournado-staging
   flyctl secrets set VITE_FIREBASE_STORAGE_BUCKET="tournado-dev.firebasestorage.app" --app tournado-staging
   flyctl secrets set VITE_FIREBASE_MESSAGING_SENDER_ID="795732059131" --app tournado-staging
   flyctl secrets set VITE_FIREBASE_APP_ID="1:795732059131:web:7b27328b7ac7736ea2615e" --app tournado-staging
   flyctl secrets set VITE_FIREBASE_MEASUREMENT_ID="" --app tournado-staging

   # Firebase Admin secrets (copy from your .env file)
   flyctl secrets set FIREBASE_ADMIN_PROJECT_ID="tournado-dev" --app tournado-staging
   flyctl secrets set FIREBASE_ADMIN_CLIENT_EMAIL="your-service-account@tournado-dev.iam.gserviceaccount.com" --app tournado-staging
   flyctl secrets set FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
   [your-private-key]
   -----END PRIVATE KEY-----" --app tournado-staging

   # Email and other config
   flyctl secrets set RESEND_API_KEY="your-resend-key" --app tournado-staging
   flyctl secrets set EMAIL_FROM="Team Registration <staging@resend.dev>" --app tournado-staging
   flyctl secrets set BASE_URL="https://tournado-staging.fly.dev" --app tournado-staging
   flyctl secrets set DATABASE_URL="file:/data/sqlite.db?connection_limit=1" --app tournado-staging

   # Verify all secrets are set correctly
   fly secrets list --app tournado-staging
   ```

   **Why individual command execution is recommended:**
   - Fly.io authentication tokens can expire during script execution
   - Each secret update triggers a deployment restart (can timeout with many secrets)
   - Running commands individually allows you to handle authentication issues per command
   - You can verify each secret is set correctly before proceeding to the next
   - No need to use web UI - everything is done via terminal commands

   **Verification Commands**:

   After setting up secrets, verify they are all configured correctly:

   ```bash
   # Check all secrets for staging
   fly secrets list --app tournado-staging

   # Check all secrets for production
   fly secrets list --app tournado-production

   # Expected secrets for staging/production:
   # SESSION_SECRET, SUPER_ADMIN_EMAILS, SUPER_ADMIN_PASSWORD, BASE_URL, DATABASE_URL
   # VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID
   # VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID
   # VITE_FIREBASE_APP_ID, VITE_FIREBASE_MEASUREMENT_ID
   # FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY
   # RESEND_API_KEY, EMAIL_FROM
   ```

   **Alternative: Use the script as reference**:
   The `setup-flyio-secrets.sh` script is provided as a template in `docs/templates/setup-flyio-secrets.sh.template`, but manual execution of individual commands is more reliable.

### Development Environment (Local)

Ensure your `.env` file has the required variables for local development:

**Important**: Local development and Staging share the same Firebase project (`tournado-dev`) but serve different purposes. They differ only in DATABASE_URL, BASE_URL, and how they're configured:

- **Local**: Uses `.env` file, local database, localhost URLs
- **Staging**: Uses Fly.io secrets, deployed database, staging URLs

```bash
# Core
SESSION_SECRET="your-local-session-secret"
SUPER_ADMIN_EMAILS="your-email@domain.com"
SUPER_ADMIN_PASSWORD="your-strong-password"

# Firebase Client (shared with Staging deployment context)
VITE_FIREBASE_API_KEY="AIzaSyBIZVQlh4hbauqErOgp-qmeuBDhMfw6QrQ"
VITE_FIREBASE_AUTH_DOMAIN="tournado-dev.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="tournado-dev"
VITE_FIREBASE_STORAGE_BUCKET="tournado-dev.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="795732059131"
VITE_FIREBASE_APP_ID="1:795732059131:web:7b27328b7ac7736ea2615e"
VITE_FIREBASE_MEASUREMENT_ID=""

# Firebase Admin (shared with Staging deployment context)
FIREBASE_ADMIN_PROJECT_ID="tournado-dev"
FIREBASE_ADMIN_CLIENT_EMAIL="[service-account-email]"
FIREBASE_ADMIN_PRIVATE_KEY="[service-account-private-key]"

# Local development specific settings (different from Staging deployment)
DATABASE_URL="file:./prisma/data.db?connection_limit=1"
BASE_URL="http://localhost:5173"
EMAIL_FROM="Local Dev <dev@example.com>"
RESEND_API_KEY="[your-resend-key]"  # Optional for local development
```

### Service Account Setup

For each Firebase project, create a service account:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`tournado-dev` or `tournado-prod`)
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract the `client_email` and `private_key` values

## Troubleshooting

### Common Issues

#### "SESSION_SECRET must be set"

- **Cause**: Missing or invalid session secret
- **Solution**: Ensure `SESSION_SECRET` is set in all environments

#### "Firebase Admin not initialized"

- **Cause**: Invalid Firebase Admin configuration
- **Solution**: Check `FIREBASE_ADMIN_*` variables are correctly set

#### Authentication failures in CI

- **Cause**: CI trying to use real Firebase instead of mocks
- **Solution**: Verify CI uses dummy Firebase values from setup script

#### Secure cookie issues in development

- **Cause**: HTTPS required for secure cookies
- **Solution**: Either use HTTPS locally or ensure `PLAYWRIGHT=true` is set for tests

### Environment-Specific Debugging

#### CI Environment

- Check GitHub Actions secrets are set correctly
- Verify dummy Firebase values are being used
- Ensure `PLAYWRIGHT=true` is set during E2E tests

#### Staging Environment

- Verify Fly.io secrets are set: `fly secrets list --app tournado-staging`
- Check Firebase project permissions for `tournado-dev`
- Test authentication with staging Firebase project

#### Production Environment

- Verify Fly.io secrets are set: `fly secrets list --app tournado-production`
- Check Firebase project permissions for `tournado-prod`
- Monitor logs for authentication errors: `fly logs --app tournado-production`

## Admin Role Management

### Overview

Tournado implements **dynamic admin role assignment** that updates user roles on every login based on the `SUPER_ADMIN_EMAILS` environment variable. This provides zero-touch admin management without requiring manual database updates.

See [ADR-003: Dynamic Admin Role Assignment](../.cursor/rules/adr-003-dynamic-admin-roles.mdc) for the full architectural decision.

### How It Works

1. **On Every Login**: The system checks if the user's email is in `SUPER_ADMIN_EMAILS`
2. **Promotion**: If email is added to the list → user promoted to ADMIN on next login
3. **Demotion**: If email is removed from the list → admin demoted to MANAGER on next login
4. **Role Preservation**: Non-admin users (MANAGER, REFEREE, PUBLIC) keep their existing roles

### Granting Admin Access

To grant admin access to a user:

1. **Update environment variable** for the target environment:

   ```bash
   # Local development (.env file)
   SUPER_ADMIN_EMAILS="existing-admin@domain.com,new-admin@domain.com"

   # Staging (Fly.io)
   flyctl secrets set SUPER_ADMIN_EMAILS="existing-admin@domain.com,new-admin@domain.com" --app tournado-staging

   # Production (Fly.io)
   flyctl secrets set SUPER_ADMIN_EMAILS="existing-admin@domain.com,new-admin@domain.com" --app tournado-production
   ```

2. **User logs in again** → automatically promoted to ADMIN role

**Notes**:

- No database migration needed for new admins
- User must log in after the change for promotion to take effect
- If user doesn't exist yet, they'll be created with ADMIN role on first login

### Revoking Admin Access

To revoke admin access from a user:

1. **Remove email from environment variable**:

   ```bash
   # Local development (.env file)
   SUPER_ADMIN_EMAILS="remaining-admin@domain.com"

   # Staging (Fly.io)
   flyctl secrets set SUPER_ADMIN_EMAILS="remaining-admin@domain.com" --app tournado-staging

   # Production (Fly.io)
   flyctl secrets set SUPER_ADMIN_EMAILS="remaining-admin@domain.com" --app tournado-production
   ```

2. **User logs in again** → automatically demoted from ADMIN to MANAGER

**Important**:

- Admin users are demoted to MANAGER (not PUBLIC)
- This preserves their ability to manage teams/tournaments
- If you need complete access removal, manually update role to PUBLIC via database

### One-Time Migration for Existing Users

When deploying the dynamic role assignment feature, run the migration script once to sync existing users:

```bash
# Local development
pnpm migrate:admin-roles

# Staging
fly ssh console --app tournado-staging -C "pnpm migrate:admin-roles"

# Production
fly ssh console --app tournado-production -C "pnpm migrate:admin-roles"
```

**What the migration does**:

- Promotes users in `SUPER_ADMIN_EMAILS` to ADMIN
- Demotes admins not in `SUPER_ADMIN_EMAILS` to MANAGER
- Shows summary of all changes

**Note**: This is a one-time operation. After initial deployment, role changes happen automatically on login.

### Environment-Specific Behavior

| Environment    | Configuration Method | When Changes Take Effect     |
| -------------- | -------------------- | ---------------------------- |
| **Local**      | `.env` file          | Next login after dev restart |
| **Staging**    | Fly.io secrets       | Next login after deploy      |
| **Production** | Fly.io secrets       | Next login after deploy      |

**Important for Local Development**:

- After updating `.env`, completely restart the dev server
- Kill existing processes: `lsof -ti:5173 | xargs kill -9`
- Then start fresh: `pnpm dev`

### Admin Role Matrix

Current admin configuration:

| Email                    | Auth Method    | Role    | Environment              |
| ------------------------ | -------------- | ------- | ------------------------ |
| `madrus@gmail.com`       | Google OAuth   | ADMIN   | All                      |
| `otmanabdel@hotmail.com` | Email/Password | ADMIN   | All                      |
| `madrusnl@hotmail.com`   | Email/Password | MANAGER | All (demoted from ADMIN) |

### Security Considerations

✅ **Benefits**:

- Admin access can be revoked instantly (takes effect on next login)
- No manual database access needed
- Consistent state across environments
- Audit trail via console logs

⚠️ **Limitations**:

- Role changes don't take effect until user logs in
- Demoted users retain MANAGER role (not PUBLIC)
- No email notification when roles change

## Related Documentation

- [Deployment Overview](deployment/overview.md) - Environment setup and deployment process
- [Authentication Guide](development/authentication.md) - Firebase authentication implementation
- [E2E Testing Strategy](testing/e2e-firebase-strategy.md) - Testing approach and rationale
- [ADR-003: Dynamic Admin Role Assignment](../.cursor/rules/adr-003-dynamic-admin-roles.mdc) - Architectural decision
- [Setup Scripts](../setup-github-secrets.sh) - Automated CI setup
- [Setup Scripts](../setup-flyio-secrets.sh) - Automated Fly.io setup

#environment-variables #firebase #deployment #security #configuration
