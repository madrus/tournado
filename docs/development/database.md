# Working with Prisma and SQLite

## Database Structure

This project uses a dual database setup to ensure separation between development and testing environments:

### Main Database

- **Location**: `prisma/data.db`
- **Purpose**: Primary database for running the application in development and production
- **Usage**: Used when starting the application with `pnpm dev` or in production

### E2E Test Database

- **Location**: `prisma/prisma/data.db`
- **Purpose**: Dedicated database for end-to-end (e2e) tests using Playwright
- **Usage**: Used automatically when running e2e tests with `pnpm test:e2e:all`

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

### Database Reset for Staging and Production (Fly.io)

**IMPORTANT: This completely wipes all data! Backup first if needed.**

**Simple One-Command Reset:**

```bash
# For staging
flyctl ssh console --app tournado-staging -C "npx prisma migrate reset --force"

# For production
flyctl ssh console --app tournado -C "npx prisma migrate reset --force"

# Or use npm scripts
pnpm run db:reset:staging
pnpm run db:reset:production
```

**What this does:**

- ✅ Drops all existing data and tables
- ✅ Applies all migrations from scratch
- ✅ Runs the seed script automatically
- ✅ Regenerates Prisma client

!> Complete resets should generally only be done in development and staging environments. For production, consider using proper migrations once your application is live with real user data.

---

## Manual Step-by-Step Reset (if needed)

If you prefer to do the reset manually step-by-step on Fly.io:

1. **Connect to your Fly.io app:**

   ```sh
   fly ssh console -a tournado-staging  # or tournado for production
   ```

2. **Once connected, run these commands:**
   ```sh
   cd /workdir
   npx prisma migrate reset --force
   exit
   ```

This gives you the same result as the one-command approach but with more control.

---
