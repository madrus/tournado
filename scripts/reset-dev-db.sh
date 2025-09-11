#!/bin/bash

# Reset development database script
# WARNING: This will destroy all data in the development database

echo "⚠️  WARNING: This will destroy all data in the development database!"
echo "This is intended for development only."
echo ""
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo "🗑️  Resetting development database..."

# Delete the existing database file
if [ -f "prisma/dev.db" ]; then
    rm prisma/dev.db
    echo "   ✅ Deleted existing database file"
fi

# Delete any migration files to start fresh
if [ -d "prisma/migrations" ]; then
    rm -rf prisma/migrations
    echo "   ✅ Cleared migration history"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm prisma generate

# Create new migration and apply it
echo "📦 Creating and applying new migration..."
pnpm prisma migrate dev --name "init-firebase-only-auth"

# Seed the database with Firebase-compatible test data
echo "🌱 Seeding database with Firebase test data..."
node prisma/seed.js

echo ""
echo "✅ Database reset complete!"
echo "📋 Next steps:"
echo "   1. Make sure your SUPER_ADMIN_EMAILS environment variable is set"
echo "   2. Configure your Firebase authentication"
echo "   3. Test the authentication flow"
echo ""