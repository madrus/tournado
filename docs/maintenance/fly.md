# Working with Fly.io

## Connect with SSH

```sh
fly ssh console -a tournado-staging # staging
# or
fly ssh console -a tournado # production
```

## Database Reset (Recommended)

### Simple One-Command Reset

Reset the database completely (drops all data, applies migrations, seeds):

```sh
# For staging
flyctl ssh console --app tournado-staging -C "npx prisma migrate reset --force"

# For production
flyctl ssh console --app tournado -C "npx prisma migrate reset --force"
```

### Check Database Status (if needed)

```sh
# Connect to app first
fly ssh console -a tournado-staging
cd /workdir
npx prisma migrate status
```

## Reset Session Secret

To set a new session secret:

```sh
fly secrets unset SESSION_SECRET -a tournado-staging
fly secrets set SESSION_SECRET=$(openssl rand -hex 32) -a tournado-staging
```

To set the secret from the Env variable:

```sh
printenv SESSION_SECRET
fly secrets set SESSION_SECRET=$SESSION_SECRET -a tournado
```
