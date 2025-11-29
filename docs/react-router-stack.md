# React Router v7 Stack

!> This project was originally started from the Remix Indie Stack but migrated to React Router v7. This document reflects the current stack.

## What's in the stack

- [Fly app deployment](https://fly.io) with [Docker](https://www.docker.com/)
- Production-ready [SQLite Database](https://sqlite.org)
- Healthcheck endpoint for [Fly backups region fallbacks](https://fly.io/docs/reference/configuration/#services-http_checks)
- [GitHub Actions](https://github.com/features/actions) for deploy on merge to production and staging environments
- Email/Password Authentication with Firebase and cookie-based sessions
- Database ORM with [Prisma](https://prisma.io)
- Styling with [Tailwind CSS v4](https://tailwindcss.com/)
- End-to-end testing with [Playwright](https://playwright.dev)
- Local third party request mocking with [MSW](https://mswjs.io)
- Unit testing with [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com)
- Code formatting and linting with [Biome](https://biomejs.dev)
- Static Types with [TypeScript](https://typescriptlang.org)

## Quickstart

Click this button to create a [Gitpod](https://gitpod.io) workspace with the project set up and Fly pre-installed

[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/remix-run/indie-stack/tree/main)

## Development

- Initial setup:

   ```sh
   pnpm setup
   ```

- Start dev server:

   ```sh
   pnpm dev
   ```

This starts your app in development mode, rebuilding assets on file changes.

The database seed script creates a new user with some data you can use to get started:

- Email: See `SUPER_ADMIN_EMAILS` in your `.env` file
- Password: Configure via Firebase Authentication

### Relevant code:

This is a pretty simple team-taking app, but it's a good example of how you can build a full stack app with Prisma and React Router v7. The main functionality is creating users, logging in and out, and creating and deleting teams.

- creating users, and logging in and out [./app/models/user.server.ts](./app/models/user.server.ts)
- user sessions, and verifying them [./app/session.server.ts](./app/session.server.ts)
- creating, and deleting teams [./app/models/team.server.ts](./app/models/team.server.ts)

## Deployment

This stack comes with two GitHub Actions that handle automatically deploying your app to production and staging environments.

Prior to your first deployment, you'll need to do a few things:

- [Install Fly](https://fly.io/docs/getting-started/installing-flyctl/)

- Sign up and sign in to Fly

   ```sh
   fly launch
   # or
   #  fly auth signup
   ```

   > **Note:** If you have more than one Fly account, ensure that you are signed into the same account in the Fly CLI as you are in the browser. In your terminal, run `fly auth whoami` and ensure the email matches the Fly account signed into the browser.

- Create two apps on Fly, one for staging and one for production:

   ```sh
   fly apps create tournado
   fly apps create tournado-staging
   ```

   > **Note:** Make sure this name matches the `app` set in your `fly.toml` file. Otherwise, you will not be able to deploy.
   - Initialize Git.

   ```sh
   git init
   ```

- Create a new [GitHub Repository](https://repo.new), and then add it as the remote for your project. **Do not push your app yet!**

   ```sh
   git remote add origin <ORIGIN_URL>
   ```

- Add a `FLY_API_TOKEN` to your GitHub repo. To do this, go to your user settings on [Fly.io](https://fly.io) and create a new [token](https://web.fly.io/user/personal_access_tokens/new), then add it to [your repo secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) with the name `FLY_API_TOKEN`.
  It is also possible to run `fly tokens create deploy` command.

- Add a `SESSION_SECRET` to your fly app secrets, to do this you can run the following commands:

   ```sh
   fly secrets set SESSION_SECRET=$(openssl rand -hex 32) --app tournado
   fly secrets set SESSION_SECRET=$(openssl rand -hex 32) --app tournado-staging
   ```

   You should see something like this:

   ```text
   Secrets are staged for the first deployment
   Secrets are staged for the first deployment
   ```

   > **Note:** If you don't have openssl installed, you can also use [1Password](https://1password.com/password-generator) to generate a random secret, just replace `$(openssl rand -hex 32)` with the generated secret.

- Create a persistent volume for the sqlite database for both your staging and production environments. Run the following:

   ```sh
   fly volumes create data --size 1 --app tournado
   fly volumes create data --size 1 --app tournado-staging
   ```

   You should see something like this:

   ```text
   Warning! Every volume is pinned to a specific physical host. You should create two or more volumes per application to avoid downtime. Learn more at https://fly.io/docs/volumes/overview/
   ? Do you still want to use the volumes feature? Yes
   ? Select region: Amsterdam, Netherlands (ams)
                     ID: vol_vpzq5yo98zlo5jk4
                   Name: data
                   App: tournado
                 Region: ams
                   Zone: ed57
               Size GB: 1
             Encrypted: true
             Created at: 15 Apr 25 15:13 UTC
     Snapshot retention: 5
   Scheduled snapshots: true
   Warning! Every volume is pinned to a specific physical host. You should create two or more volumes per application to avoid downtime. Learn more at https://fly.io/docs/volumes/overview/
   ? Do you still want to use the volumes feature? Yes
   ? Select region: Amsterdam, Netherlands (ams)
                     ID: vol_453yz9koxd0xeg9r
                   Name: data
                   App: tournado-staging
                 Region: ams
                   Zone: ed57
               Size GB: 1
             Encrypted: true
             Created at: 15 Apr 25 15:13 UTC
     Snapshot retention: 5
   Scheduled snapshots: true
   ```

Now that everything is set up you can commit and push your changes to your repo. Every commit to your `main` branch will trigger a deployment to your production environment, and every commit to your `dev` branch will trigger a deployment to your staging environment.

### Connecting to your database

The sqlite database lives at `/data/sqlite.db` in your deployed application. You can connect to the live database by running `fly ssh console -C 'sqlite3 /data/sqlite.db'`.

### Getting Help with Deployment

If you run into any issues deploying to Fly, make sure you've followed all of the steps above and if you have, then post as many details about your deployment (including your app name) to [the Fly support community](https://community.fly.io). They're normally pretty responsive over there and hopefully can help resolve any of your deployment issues and questions.

## GitHub Actions

We use GitHub Actions for continuous integration and deployment. Anything that gets into the `main` branch will be deployed to production after running tests/build/etc. Anything in the `dev` branch will be deployed to staging.

## Testing

### Playwright

We use Playwright for our End-to-End tests in this project. You'll find those in the `playwright/tests` directory. As you make changes, add to an existing file or create a new file in the `playwright/tests` directory to test your changes.

We use Playwright's built-in locators and expect assertions for selecting elements on the page semantically.

To run these tests in development, run `pnpm test:e2e` which will start the dev server for the app as well as the Playwright client. Make sure the database is properly set up as described above.

We have global authentication setup for admin features and different test projects for different scenarios:

```ts
// Admin tests use pre-authenticated state
test.describe('Admin Features', () => {
   // These tests run with admin authentication already set up
})

// Public tests run without authentication
test.describe('Public Features', () => {
   test.use({ storageState: { cookies: [], origins: [] } })
})
```

Test cleanup is handled automatically through our database helpers:

```ts
import { cleanupUser, createAdminUser } from '../helpers/database'

test('admin feature test', async ({ page }) => {
   const user = await createAdminUser()
   // ... test logic ...
   await cleanupUser(user.email)
})
```

That way, we can keep your local db clean and keep your tests isolated from one another.

### Vitest

For lower level tests of utilities and individual components, we use `vitest`. We have DOM-specific assertion helpers via [`@testing-library/jest-dom`](https://testing-library.com/jest-dom).

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your editor to get a really great in-editor experience with type checking and auto-complete. To run type checking across the whole project, run `pnpm typecheck`.

### Code Quality

This project uses [Biome](https://biomejs.dev) for code formatting and linting. Biome combines the functionality of Prettier and ESLint into a single fast tool.

Run `pnpm lint` to format and lint all files in the project. Biome will automatically fix issues where possible.

It's recommended to install the Biome VS Code extension for format-on-save functionality.

## Troubleshooting

- Verify that your `SESSION_SECRET` is properly set in the staging environment:
   ```bash
   fly secrets list --app tournado-staging
   ```
- Monitor the application logs in your staging environment:
   ```sh
   fly logs --app tournado-staging
   ```
- Check the status of your Fly.io machines and volumes:

   ```sh
   fly machines list --app tournado-staging
   ```

   Example output:

   ```text
   1 machines have been retrieved from app tournado-staging.
   View them in the UI here (​https://fly.io/apps/tournado-staging/machines/)

   tournado-staging
   ID            	NAME                     	STATE  	CHECKS	REGION	ROLE	IMAGE                                                 	IP ADDRESS                     	VOLUME              	CREATED             	LAST UPDATED        	PROCESS GROUP	SIZE
   7815677a50d578	sparkling-wildflower-9325	stopped	0/2   	iad   	    	tournado-staging:deployment-01JRXM5WCTP3S2C0J2JWW3JR6X	fdaa:16:cce:a7b:2f7:a39b:1bad:2	vol_4qpmz25gyggywxwv	2025-04-15T21:06:25Z	2025-04-15T21:32:54Z	app          	shared-cpu-1x:256MB
   ```

   The machine `7815677a50d578` is currently stopped but still has the volume vol_4qpmz25gyggywxwv attached to it. To delete the volume, we need to first destroy the machine that's using it.

- Let's destroy the machine:
   ```sh
   fly machines destroy 7815677a50d578 --app tournado-staging
   ```
