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

See [Environment Variables Reference](../environment-variables.md) for complete setup details.

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

2. Set up secrets using automated scripts:

```sh
# For GitHub Actions (CI) - dummy Firebase values
./setup-github-secrets.sh

# For Fly.io staging
./setup-flyio-secrets.sh tournado-staging

# For Fly.io production
./setup-flyio-secrets.sh tournado-production
```

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
