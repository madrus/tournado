#!/bin/sh -ex

# This file is how Fly starts the server (configured in fly.toml). Before starting
# the server though, we need to run any prisma migrations that haven't yet been
# run, which is why this file exists in the first place.
# Learn more: https://community.fly.io/t/sqlite-not-getting-setup-properly/4386

# Ensure the data directory exists and has proper permissions
mkdir -p /data
chmod 777 /data

# Run migrations
npx prisma migrate deploy

# Start the server
NODE_ENV=production PORT=8080 HOST=0.0.0.0 pnpm run start
