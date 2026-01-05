# Deployment

## Overview

The application is deployed using Fly.io with automatic deployments through GitHub Actions. We maintain four distinct contexts:

| Context                 | Purpose                | Firebase Project | Configuration Method   |
| ----------------------- | ---------------------- | ---------------- | ---------------------- |
| **CI (GitHub Actions)** | E2E testing            | Dummy values     | GitHub Actions secrets |
| **Development (Local)** | Local development      | `tournado-dev`   | `.env` file            |
| **Staging**             | Testing and acceptance | `tournado-dev`   | Fly.io secrets         |
| **Production**          | Live application       | `tournado-prod`  | Fly.io secrets         |

**Key principle**: Local development and Staging share the same Firebase project (`tournado-dev`) but serve different purposes - Local for development, Staging for deployed testing - with different databases and URLs.

See [Environment Variables Reference](../development/environment-variables.md) for complete setup details.

## Prerequisites

1. Install Fly CLI:

```sh
curl -L https://fly.io/install.sh | sh
```

2. Sign up and sign in to Fly:

```sh
fly auth signup
# or
fly auth signin
```

## Initial Deployment Setup

1. Create Fly apps:

```sh
fly apps create tournado
fly apps create tournado-staging
```

2. Set up secrets:

```sh
# For GitHub Actions (CI) - automated with dummy Firebase values
./setup-github-secrets.sh

# For Fly.io environments - run individual commands (see troubleshooting below)
# Use the template script as reference: docs/templates/setup-flyio-secrets.sh.template
```

**Important**: Due to Fly.io authentication token issues and deployment timeouts, running individual `flyctl secrets set` commands is more reliable than the automated script. **No web UI required** - everything is done via terminal commands. See [Environment Variables Guide](../development/environment-variables.md#setup-instructions) for detailed command-by-command instructions.

**Manual secret setup** (if needed):

```sh
# Generate and set session secret
fly secrets set SESSION_SECRET=$(openssl rand -hex 32) --app tournado
fly secrets set SESSION_SECRET=$(openssl rand -hex 32) --app tournado-staging
```

3. Create persistent volumes:

```sh
fly volumes create data --size 1 --app tournado
fly volumes create data --size 1 --app tournado-staging
```

## GitHub Actions

The project uses GitHub Actions for continuous integration and deployment:

- Pushes to `main` branch deploy to production
- Pushes to `dev` branch deploy to staging

Required secrets in GitHub repository:

- `FLY_API_TOKEN`: Fly.io API token

## Manual Deployment

To deploy manually:

```sh
# Deploy to production
fly deploy --app tournado

# Deploy to staging
fly deploy --app tournado-staging
```

## Database Management

The SQLite database is stored in a persistent volume at `/data/sqlite.db`. To connect to the database:

```sh
fly ssh console -C database-cli --app tournado
```

## Monitoring

Monitor your deployments:

- Production: https://fly.io/apps/tournado/monitoring/
- Staging: https://fly.io/apps/tournado-staging/monitoring/

Check application logs:

```sh
fly logs --app tournado
fly logs --app tournado-staging
```

Connect to the staging environment:

```sh
fly ssh console -a tournado-staging
fly ssh console --app tournado-staging
```

## Troubleshooting

### Fly.io Secret Setup Issues

**Problem**: Authentication errors (401 unauthorized) when setting secrets

**Solution**:

1. Re-authenticate with fresh token:

   ```sh
   fly auth logout
   fly auth login
   ```

2. Run `flyctl secrets set` commands individually in terminal instead of using the batch script
3. If timeouts occur, wait for deployment to complete before running the next `flyctl secrets set` command

**Problem**: Script timeouts during secret setup

**Cause**: Each `flyctl secrets set` triggers a deployment restart, and many secrets can cause cumulative timeouts

**Solution**: Use manual secret setup as documented in [Environment Variables Guide](../development/environment-variables.md#setup-instructions)

### Authentication Token Refresh

Fly.io authentication tokens can expire. If you encounter authentication issues:

```sh
# Check current authentication
fly auth whoami

# Re-authenticate if needed
fly auth login

# Alternative: Create new deploy token
fly tokens create deploy
```

### Secret Verification

After setting up secrets, verify they are configured correctly:

```sh
# List all secrets for staging
fly secrets list --app tournado-staging

# List all secrets for production
fly secrets list --app tournado-production

# Check app status
fly status --app tournado-staging
fly status --app tournado-production
```

**Expected secrets count**: You should see 15 secrets total for each app:

- 3 Core secrets (SESSION_SECRET, SUPER_ADMIN_EMAILS, BASE_URL)
- 6 Firebase Client secrets (VITE*FIREBASE*\*)
- 3 Firebase Admin secrets (FIREBASE*ADMIN*\*)
- 2 Email secrets (RESEND_API_KEY, EMAIL_FROM)
- 1 Legacy secret (EMAIL_BASE_URL - can be same as BASE_URL)
