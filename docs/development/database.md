# Working with Prisma and SQLite

For local development, we use SQLite with Prisma. Prisma provides a database client and a migration system. We can connect to the database by running:

```sh
sqlite3 prisma/data.db
```

or using the Prisma Studio:

```sh
pnpm prisma studio
```

---

## Migrations

We can hold off on actually running migrations while we iterate on our schema. Prisma will pick up all our changes when we're ready and create a single migration for us. Here's a typical workflow:

1. Keep editing schema.prisma as much as you like.
2. Once your model design is stable, run:
   ```bash
   pnpm prisma migrate dev --name init
   ```
   This will:
   - create a new SQL migration in `prisma/migrations/.../init/`
   - apply it to your local database
   - regenerate the Prisma client
3. If you need to tweak the schema again, repeat:
   ```bash
   pnpm prisma migrate dev --name tweak-xyz
   ```
   Each run snapshots just the delta since your last migration.
4. If this is still pre-production and you don't care about preserving any existing data, you can also do:
   ```bash
   pnpm prisma migrate reset
   ```
   This will drop the DB, apply all pending migrations from scratch, and re-seed.

---

## Deploying Database Changes

When deploying database changes to staging and production environments, you have a few options depending on your deployment setup:

### Using Prisma Migrate Deploy

For production environments, use `prisma migrate deploy` instead of `prisma migrate dev`. This command applies migrations without generating the Prisma client (which should be done during the build step).

```bash
# In your CI/CD pipeline or deployment script
pnpm prisma migrate deploy
```

This command:

- Applies pending migrations to the database
- Does not create new migrations
- Does not reset the database
- Does not generate the Prisma client

### Seeding Production Data

If you need to seed production data, you can run:

```bash
# Only run this if you need to seed initial data
NODE_ENV=production pnpm prisma db seed
```

### Complete Database Reset for Staging and Production

If you need to completely reset your staging or production database without preserving migration history (useful during early development):

1. **IMPORTANT: Back up any important data first!**

2. Connect to your staging/production environment and set the correct DATABASE_URL

3. Run the complete reset command:

```bash
# CAUTION: This will delete all data!
pnpm prisma migrate reset --force
```

This command:

- Drops the database (if possible) or all tables in the database
- Creates a new database or recreates all tables
- Applies all migrations from scratch
- Runs the seed script

4. For a cleaner approach that doesn't rely on migration history:

```bash
# Alternative approach
# 1. Push the schema directly (bypassing migrations)
pnpm prisma db push

# 2. Seed the database
pnpm prisma db seed
```

The `db push` approach is useful when you want to start fresh without migration history.

5. After the reset, you may want to establish a new baseline migration:

```bash
# Create a clean initial migration
pnpm prisma migrate dev --name initial_schema
```

**Note:** Complete resets should generally only be done in development and staging environments. For production, consider using proper migrations once your application is live with real user data.

### Handling Database Resets in GitHub Actions

Your project already has a GitHub Actions workflow that handles database migrations. For the Cypress job, it uses:

```yaml
- name: 🛠 Setup Database
  run: pnpm exec prisma migrate reset --force
```

To perform a complete database reset in your staging and production environments:

#### Option 1: Modify your deployment workflow

Add a step to your existing deploy job in `.github/workflows/deploy.yml` before the deployment:

```yaml
# For staging (already using dev branch)
- name: Reset Staging Database
  if: ${{ github.ref == 'refs/heads/dev' }}
  run: |
     # Set DATABASE_URL for staging
     export DATABASE_URL=${{ secrets.STAGING_DATABASE_URL }}
     pnpm exec prisma db push
     pnpm exec prisma db seed

# For production (using main branch)
- name: Reset Production Database
  if: ${{ github.ref == 'refs/heads/main' }}
  run: |
     # Set DATABASE_URL for production
     export DATABASE_URL=${{ secrets.PRODUCTION_DATABASE_URL }}
     pnpm exec prisma db push
     pnpm exec prisma db seed
```

#### Option 2: Create a one-time manual workflow

For a one-time reset, create a new workflow file `.github/workflows/db-reset.yml`:

```yaml
name: 🗄️ Database Reset

on:
   workflow_dispatch:
      inputs:
         environment:
            description: 'Environment to reset'
            required: true
            default: 'staging'
            type: choice
            options:
               - staging
               - production

jobs:
   reset-database:
      name: Reset Database
      runs-on: ubuntu-latest
      environment: ${{ github.event.inputs.environment }}

      steps:
         - name: ⬇️ Checkout repo
           uses: actions/checkout@v4

         - name: ⎔ Setup node
           uses: actions/setup-node@v4
           with:
              node-version: 22

         - name: ⎔ Setup pnpm
           uses: pnpm/action-setup@v3
           with:
              version: 10
              run_install: false

         - name: 📥 Install deps
           run: pnpm install --no-frozen-lockfile

         - name: 🛠 Generate Prisma Client
           run: pnpm exec prisma generate

         - name: 🗄️ Reset Database
           run: |
              # Set DATABASE_URL based on environment
              if [ "${{ github.event.inputs.environment }}" = "production" ]; then
                export DATABASE_URL=${{ secrets.PRODUCTION_DATABASE_URL }}
              else
                export DATABASE_URL=${{ secrets.STAGING_DATABASE_URL }}
              fi

              # Push schema directly (bypassing migrations)
              pnpm exec prisma db push

              # Seed the database
              pnpm exec prisma db seed
```

This gives you a button in the GitHub Actions UI to reset either environment on demand, which is safer than automatically resetting on every deployment.

#### Important Notes:

1. Make sure your GitHub repository has the necessary secrets:

   - `STAGING_DATABASE_URL`
   - `PRODUCTION_DATABASE_URL`

2. The `db push` approach will:

   - Bypass your existing migrations
   - Directly synchronize the database with your schema
   - Preserve data in tables that match the schema
   - Drop tables/columns that don't match the schema

3. After resetting, if you want to establish a clean migration history:
   ```bash
   # Locally, after the reset
   rm -rf prisma/migrations
   pnpm prisma migrate dev --name initial_schema
   ```
   Then commit and push the new migration files.

### Database URL Configuration

Make sure your staging and production environments have the correct `DATABASE_URL` environment variable set. For example:

```
# .env.staging
DATABASE_URL="postgresql://user:password@staging-db-host:5432/tournado"

# .env.production
DATABASE_URL="postgresql://user:password@production-db-host:5432/tournado"
```

### Handling Schema Drift

If your production database schema has drifted from your migrations (e.g., due to manual changes), you may need to use the `--force` flag with caution:

```bash
# Use with extreme caution in production!
pnpm prisma migrate deploy --force
```

Always backup your production database before applying migrations.

---

## Manual Database Reset

If you prefer to handle the database reset manually, here's a straightforward approach:

For staging and production environments, you can follow these steps:
[Manual Database Reset Process](#manual-database-reset)

### For Staging Environment

1. Connect to your staging server or use your local machine with the staging database URL:

   ```bash
   # Set the staging database URL (replace with your actual URL)
   export DATABASE_URL="postgresql://user:password@staging-db-host:5432/tournado"

   # Or use a .env.staging file
   cp .env.staging .env
   ```

2. Push the schema directly and seed the database:

   ```bash
   # Generate the Prisma client
   pnpm prisma generate

   # Push the schema directly (bypassing migrations)
   pnpm prisma db push

   # Seed the database
   pnpm prisma db seed
   ```

### For Production Environment

1. IMPORTANT: Back up your production database first!
2. Connect to your production server or use your local machine with the production database URL:

   ```bash
   # Set the production database URL (replace with your actual URL)
   export DATABASE_URL="postgresql://user:password@production-db-host:5432/tournado"

   # Or use a .env.production file
   cp .env.production .env
   ```

3. Push the schema directly and seed the database:

   ```bash
   # Generate the Prisma client
   pnpm prisma generate

   # Push the schema directly (bypassing migrations)
   pnpm prisma db push

   # Seed the database (only if needed)
   pnpm prisma db seed
   ```

4. Verify the database structure and data:
   ```bash
   # Open Prisma Studio to inspect the database
   pnpm prisma studio
   ```

### Establishing a Clean Migration History

After manually resetting the database, you may want to establish a clean migration history:

1. Delete existing migrations locally:
   ```bash
   rm -rf prisma/migrations
   ```
2. Create a new initial migration:
   ```bash
   pnpm prisma migrate dev --name initial_schema
   ```
3. Commit and push the new migration files to your repository.

This approach gives you full control over the database reset process and allows you to verify each step along the way.

---

## Resetting everything to initial state

1. Delete the database file and old migrations

   ```sh
   # Delete the SQLite database file
   rm -f prisma/data.db

   # Remove all migration files (keep migration_lock.toml)
   rm -rf prisma/migrations/*
   ```

2. Create a new initial migration:
   ```sh
   pnpm prisma migrate dev --name initial_schema
   ```
3. Seed the database:
   ```sh
   pnpm prisma db seed
   ```
