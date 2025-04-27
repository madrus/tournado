# Working with Fly.io

## Connect with SSH

```sh
fly ssh console -a tournado-staging # staging
# or
fly ssh console -a tournado # production
```

## Work with the database

```sh
cd /workdir # if not already in workdir
# Check the status of the database
npx prisma migrate status
# If you need to reset the database
# 1. Remove the existing database
rm /data/sqlite.db
# 2. Run a fresh migration deploy
npx prisma migrate deploy
# 3. Run the seed script to initialize with basic data (if needed)
npx prisma db seed
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
