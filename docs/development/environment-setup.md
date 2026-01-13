# Environment Setup Guide

## Firebase Project Configuration

The application uses 3 Firebase project configurations across 4 contexts:

| Context                 | Firebase Project   | Purpose                           |
| ----------------------- | ------------------ | --------------------------------- |
| **CI (GitHub Actions)** | `ci-dummy-project` | Dummy values for testing          |
| **Development (Local)** | `tournado-dev`     | Local development                 |
| **Staging**             | `tournado-dev`     | Testing and acceptance deployment |
| **Production**          | `tournado-prod`    | Live application                  |

**Key Point**: Local development and Staging share the same Firebase project (`tournado-dev`) but serve different purposes. They differ in configuration method (`.env` vs Fly.io secrets), DATABASE_URL, and BASE_URL values.

## Automated Environment Setup

### Prerequisites

```bash
# Install Firebase CLI
npm install -g firebase-tools
firebase login

# Install GitHub CLI (for secrets management)
brew install gh
gh auth login

# Install Fly CLI (for deployment)
curl -L https://fly.io/install.sh | sh
fly auth login
```

### Setup Scripts

```bash
# Configure CI environment (automated - dummy Firebase values)
chmod +x setup-github-secrets.sh
./setup-github-secrets.sh

# Configure Fly.io environments (run individual commands due to auth/timeout issues)
# Use template as reference: docs/templates/setup-flyio-secrets.sh.template
# See docs/environment-variables.md for complete command-by-command instructions

# For staging (run each command individually in terminal):
fly auth login
flyctl secrets set SESSION_SECRET="$(openssl rand -hex 32)" --app tournado-staging
flyctl secrets set SUPER_ADMIN_EMAILS="your-email@domain.com" --app tournado-staging
# ... (continue with other secrets one-by-one via flyctl commands)

# Verify all secrets are configured
fly secrets list --app tournado-staging
```

**Important**: Fly.io script automation can fail due to authentication token expiration and deployment timeouts. Individual command execution is more reliable for Fly.io environments.

**Verification**: Use `fly secrets list --app [app-name]` to verify all 15 expected environment variables are set.

## Local Development Setup

Ensure your `.env` file has the required variables for local development:

**Note**: Local development and Staging deployment share the same Firebase project (`tournado-dev`).

```bash
# Core application
SESSION_SECRET="your-local-session-secret"
SUPER_ADMIN_EMAILS="your-email@domain.com"

# Firebase Client (shared with Staging deployment)
VITE_FIREBASE_API_KEY="[from tournado-dev project]"
VITE_FIREBASE_AUTH_DOMAIN="tournado-dev.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="tournado-dev"
VITE_FIREBASE_STORAGE_BUCKET="tournado-dev.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="[from tournado-dev]"
VITE_FIREBASE_APP_ID="[from tournado-dev]"
VITE_FIREBASE_MEASUREMENT_ID=""

# Firebase Admin (shared with Staging deployment)
FIREBASE_ADMIN_PROJECT_ID="tournado-dev"
FIREBASE_ADMIN_CLIENT_EMAIL="[service-account-email]"
FIREBASE_ADMIN_PRIVATE_KEY="[service-account-private-key]"

# Local development specific settings
EMAIL_FROM="Local Dev <dev@example.com>"
BASE_URL="http://localhost:5173"
RESEND_API_KEY="[your-resend-key]"  # Optional for local development
```

## For Complete Environment Variable Documentation

See [docs/environment-variables.md](./environment-variables.md) for:

- Complete catalog with security considerations
- Firebase configuration details
- E2E testing strategy and Firebase bypass
