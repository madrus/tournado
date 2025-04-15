# Remix Indie Stack

![The Remix Indie Stack](https://repository-images.githubusercontent.com/465928257/a241fa49-bd4d-485a-a2a5-5cb8e4ee0abf)

Learn more about [Remix Stacks](https://remix.run/stacks).

```sh
pnpm dlx create-remix@latest --template remix-run/indie-stack
```

## What's in the stack

- [Fly app deployment](https://fly.io) with [Docker](https://www.docker.com/)
- Production-ready [SQLite Database](https://sqlite.org)
- Healthcheck endpoint for [Fly backups region fallbacks](https://fly.io/docs/reference/configuration/#services-http_checks)
- [GitHub Actions](https://github.com/features/actions) for deploy on merge to production and staging environments
- Email/Password Authentication with [cookie-based sessions](https://remix.run/utils/sessions#md-createcookiesessionstorage)
- Database ORM with [Prisma](https://prisma.io)
- Styling with [Tailwind](https://tailwindcss.com/)
- End-to-end testing with [Cypress](https://cypress.io)
- Local third party request mocking with [MSW](https://mswjs.io)
- Unit testing with [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com)
- Code formatting with [Prettier](https://prettier.io)
- Linting with [ESLint](https://eslint.org)
- Static Types with [TypeScript](https://typescriptlang.org)

Not a fan of bits of the stack? Fork it, change it, and use `npx create-remix --template your/repo`! Make it your own.

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

- Email: `rachel@remix.run`
- Password: `racheliscool`

### Relevant code:

This is a pretty simple note-taking app, but it's a good example of how you can build a full stack app with Prisma and Remix. The main functionality is creating users, logging in and out, and creating and deleting notes.

- creating users, and logging in and out [./app/models/user.server.ts](./app/models/user.server.ts)
- user sessions, and verifying them [./app/session.server.ts](./app/session.server.ts)
- creating, and deleting notes [./app/models/note.server.ts](./app/models/note.server.ts)

## Deployment

This Remix Stack comes with two GitHub Actions that handle automatically deploying your app to production and staging environments.

Prior to your first deployment, you'll need to do a few things:

- [Install Fly](https://fly.io/docs/getting-started/installing-flyctl/)

- Sign up and log in to Fly

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

  ```
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

  ```
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

The sqlite database lives at `/data/sqlite.db` in your deployed application. You can connect to the live database by running `fly ssh console -C database-cli`.

### Getting Help with Deployment

If you run into any issues deploying to Fly, make sure you've followed all of the steps above and if you have, then post as many details about your deployment (including your app name) to [the Fly support community](https://community.fly.io). They're normally pretty responsive over there and hopefully can help resolve any of your deployment issues and questions.

## GitHub Actions

We use GitHub Actions for continuous integration and deployment. Anything that gets into the `main` branch will be deployed to production after running tests/build/etc. Anything in the `dev` branch will be deployed to staging.

## Testing

### Cypress

We use Cypress for our End-to-End tests in this project. You'll find those in the `cypress` directory. As you make changes, add to an existing file or create a new file in the `cypress/e2e` directory to test your changes.

We use [`@testing-library/cypress`](https://testing-library.com/cypress) for selecting elements on the page semantically.

To run these tests in development, run `npm run test:e2e:dev` which will start the dev server for the app as well as the Cypress client. Make sure the database is running in docker as described above.

We have a utility for testing authenticated features without having to go through the login flow:

```ts
cy.login()
// you are now logged in as a new user
```

We also have a utility to auto-delete the user at the end of your test. Just make sure to add this in each test file:

```ts
afterEach(() => {
  cy.cleanupUser()
})
```

That way, we can keep your local db clean and keep your tests isolated from one another.

### Vitest

For lower level tests of utilities and individual components, we use `vitest`. We have DOM-specific assertion helpers via [`@testing-library/jest-dom`](https://testing-library.com/jest-dom).

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your editor to get a really great in-editor experience with type checking and auto-complete. To run type checking across the whole project, run `npm run typecheck`.

### Linting

This project uses ESLint for linting. That is configured in `.eslintrc.cjs`.

### Formatting

We use [Prettier](https://prettier.io/) for auto-formatting in this project. It's recommended to install an editor plugin (like the [VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)) to get auto-formatting on save. There's also a `npm run format` script you can run to format all files in the project.

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
  ```
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
  
  Example output:
  ```
  machine 7815677a50d578 was found and is currently in stopped state, attempting to destroy...
  7815677a50d578 has been destroyed
  ```

- Now, we can safely destroy the volume:
  ```sh
  fly volumes destroy vol_4qpmz25gyggywxwv --app tournado-staging
  ```
  
  Example output:
  ```
  Warning! Every volume is pinned to a specific physical host. You should create two or more volumes per application. Deleting this volume will leave you with 0 volume(s) for this application, and it is not reversible.  Learn more at https://fly.io/docs/volumes/overview/
  ? Are you sure you want to destroy this volume? Yes
  Destroyed volume ID: vol_4qpmz25gyggywxwv name: data
  ```

- Create a new volume for the staging environment:
  ```sh
  fly volumes create data --size 1 --app tournado-staging
  ```

  Example output:
  ``` 
  Warning! Every volume is pinned to a specific physical host. You should create two or more volumes per application to avoid downtime. Learn more at https://fly.io/docs/volumes/overview/
  ? Do you still want to use the volumes feature? Yes
  ? Select region: Amsterdam, Netherlands (ams)
                    ID: vol_reme9x78j1oxl534
                  Name: data
                  App: tournado-staging
                Region: ams
                  Zone: ed57
              Size GB: 1
            Encrypted: true
            Created at: 15 Apr 25 21:46 UTC
    Snapshot retention: 5
  Scheduled snapshots: true
  ```

- Deploy your application again to ensure it uses the new volume:
  ```sh
  fly deploy --app tournado-staging
  ```
