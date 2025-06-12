#!/bin/sh -ex

# Script to reset the database on Fly.io deployments
# Usage: ./scripts/reset-database.sh [app-name]
# Example: ./scripts/reset-database.sh tournado-staging

APP_NAME=${1:-tournado}

echo "🗄️  Resetting database for app: $APP_NAME"
echo "⚠️  This will completely wipe the database and recreate it with seed data!"
echo "⏳ Waiting 5 seconds... Press Ctrl+C to cancel"
sleep 5

echo "🔄 Connecting to $APP_NAME and resetting database..."

# Use the simple one-command approach from documentation
flyctl ssh console --app $APP_NAME -C "npx prisma migrate reset --force"

echo "🎉 Database reset completed for $APP_NAME"
echo "🔗 You can verify by visiting your app and checking that the data is fresh"
