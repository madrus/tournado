# Working with Prisma and SQLite

## Database Structure

This project uses a dual database setup to ensure separation between development and testing environments:

### Main Database

- **Location**: `prisma/data.db`
- **Purpose**: Primary database for running the application in development and production
- **Usage**: Used when starting the application with `pnpm dev` or in production

### E2E Test Database

- **Location**: `prisma/prisma/data.db`
- **Purpose**: Dedicated database for end-to-end (e2e) tests using Cypress
- **Usage**: Used automatically when running e2e tests with `pnpm test:e2e`

### Critical Requirement for E2E Tests

!> For e2e tests to run without Prisma connection issues, it is essential that the main database (`prisma/data.db`) is 100% in order. The e2e test setup depends on the main database being properly configured and migrated.

**Before running e2e tests, ensure:**

- The main database exists and is properly migrated
- No schema drift exists in the main database
- All migrations have been applied successfully
- The database is not corrupted or in an inconsistent state

If you encounter Prisma connection issues during e2e tests, first verify and fix the main database using the commands in the [Manual Database Reset](#manual-database-reset) section below.

---

## Testing Database Connectivity

The project includes a dedicated script to test Prisma database connectivity:

### Prisma Test Script

- **Location**: `test/prisma-test.ts`
- **Purpose**: Verifies that the Prisma client can successfully connect to and query the database
- **Usage**: Run with `pnpm prisma:test`

This script performs a basic connectivity test by:

- Connecting to the main database using Prisma Client
- Fetching all users from the database
- Displaying the results or any connection errors
- Properly disconnecting from the database

**When to use:**

- After setting up the database for the first time
- When troubleshooting Prisma connection issues
- Before running e2e tests to ensure database connectivity
- After making schema changes or migrations

**Example output:**

```bash
$ pnpm prisma:test
Users: [
  { id: 1, email: 'user@example.com', ... },
  { id: 2, email: 'admin@example.com', ... }
]
```

If the script fails with connection errors, check that:

- The main database (`prisma/data.db`) exists
- All migrations have been applied
- The database schema is up to date

---

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

!> Complete resets should generally only be done in development and staging environments. For production, consider using proper migrations once your application is live with real user data.

### Handling Database Resets in GitHub Actions

Your project already has a GitHub Actions workflow that handles database migrations. For the Cypress job, it uses:

```yaml
- name: 🛠 Setup Database
  run: pnpm exec prisma migrate reset --force
```

To perform a complete database reset in your staging and production environments:

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

### Handling Schema Drift

If your production database schema has drifted from your migrations (e.g., due to manual changes), you may need to use the `--force` flag with caution:

```sh
# Use with extreme caution in production!
pnpm prisma migrate deploy --force
```

Always backup your production database before applying migrations.

---

## Manual Database Reset

!> If the old data is important, back up your database first!

1. Connect to your production server or use your local machine with the production database URL:
   ```sh
   # Set the production database URL
   export DATABASE_URL="sqlite:./prisma/sqlite.db"
   ```
2. Push the schema directly and seed the database:

   ```sh
   # Generate the Prisma client
   pnpm prisma generate

   # Push the schema directly (bypassing migrations)
   pnpm prisma db push

   # Seed the database (only if needed)
   pnpm prisma db seed
   ```

3. Verify the database structure and data:
   ```bash
   # Open Prisma Studio to inspect the database
   pnpm prisma studio
   ```

## Establishing a Clean Migration History

Next to manually resetting the database, you may want to establish a clean migration history:

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

## Complete Database Reset on Fly.io (Remote Shell Method)

This method uses Fly.io's SSH console to directly reset the deployed database using Prisma's built-in reset command.

!> Use it with care because it completely resets all existing data!

### When to Use This Method

- **Complete fresh start**: When you need to completely reset your deployed database
- **Schema changes**: When local migrations don't match deployed state
- **Clean deployment**: Starting with a fresh database state
- **Troubleshooting**: When database corruption or inconsistencies occur

### Prerequisites

- Fly.io CLI installed and authenticated (`flyctl auth login`)
- Access to your Fly.io app (staging or production)
- **IMPORTANT**: Backup any important data first!

### Simple Two-Step Process

1. **Connect to your Fly.io instance and get sh prompt**

   ```sh
   # For staging environment
   flyctl ssh console --app tournado-staging

   # For production environment
   flyctl ssh console --app tournado
   ```

2. **Reset the database using Prisma**

   ```sh
   # This command handles everything: drops DB, applies migrations, runs seed
   npx prisma migrate reset --force
   ```

3. **Exit the SSH session**
   ```sh
   exit
   ```

### What `prisma migrate reset --force` Does

- **Drops the database**: Completely removes all existing data and tables
- **Applies all migrations**: Recreates the database schema from scratch using all migration files
- **Runs the seed script**: Automatically populates the database with initial data
- **Regenerates Prisma client**: Ensures the client matches the current schema

### Why This Method Is Ideal

- **Single Command**: Everything happens in one atomic operation
- **Migration History Preserved**: Uses your actual migration files, maintaining consistency
- **Automatic Seeding**: No need to manually run seed commands
- **Error Safe**: Prisma handles the entire process, reducing chance of manual errors
- **Clean State**: Guarantees a completely fresh database matching your current schema

### Alternative: One-Command from Local Terminal

Execute the reset without entering the SSH session:

```sh
# For staging
flyctl ssh console --app tournado-staging -C "npx prisma migrate reset --force"

# For production
flyctl ssh console --app tournado -C "npx prisma migrate reset --force"
```

### Important Notes

- **Data Loss**: This method completely removes all existing data
- **Staging First**: Always test this process on staging before applying to production
- **Downtime**: Consider scheduling maintenance windows for production resets
- **Migration Consistency**: Ensures deployed database matches your migration files exactly
- **Atomic Operation**: The entire reset happens as one transaction, reducing risk

!> **Production Warning**: Only use this method on production if you're certain you want to lose all existing data. Always backup first and inform your team/users of the reset.

---
