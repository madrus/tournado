# Tournado

A modern tournament management system built with Remix.

## Quick Start

To get started with the project:

```sh
pnpm setup
pnpm dev
```

## Documentation

The project documentation is available in the `docs` directory. To view it:

1. Install docsify globally:
```sh
pnpm add -g docsify-cli
```

2. Start the documentation server:
```sh
docsify serve docs
```

3. Open your browser and navigate to `http://localhost:3000`

<<<<<<< HEAD
For more detailed information about the project, please refer to the documentation.
=======
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

- Another direct way to deploy to Staging:
  ```sh
  fly deploy --app tournado-staging --remote-only --strategy rolling --max-unavailable 0.33 --wait-timeout 5m --yes
  ```

## Monitoring

- We can monitor our machine in Staging at <https://fly.io/apps/tournado-staging/monitoring/>
- We can list our machines in Staging:
  ```sh
  fly machines list --app tournado-staging
  ```

  Example output:
  ```
  1 machines have been retrieved from app tournado-staging.
  View them in the UI here (​https://fly.io/apps/tournado-staging/machines/)
  ```
>>>>>>> main
