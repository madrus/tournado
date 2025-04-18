# Deployment

## Overview

The application is deployed using Fly.io with automatic deployments through GitHub Actions. We maintain two environments:

- Production (main branch)
- Staging (dev branch)

## Prerequisites

1. Install Fly CLI:

```sh
curl -L https://fly.io/install.sh | sh
```

2. Sign up and log in to Fly:

```sh
fly auth signup
# or
fly auth login
```

## Initial Deployment Setup

1. Create Fly apps:

```sh
fly apps create tournado
fly apps create tournado-staging
```

2. Set up secrets:

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
