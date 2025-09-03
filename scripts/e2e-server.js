#!/usr/bin/env node
/* eslint-disable no-console */
const { spawnSync, spawn } = require('node:child_process')

// Force test DB for e2e server
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'file:./prisma/data-test.db?connection_limit=1'
process.env.PLAYWRIGHT_TEST = process.env.PLAYWRIGHT_TEST || 'true'

console.log('[e2e-server] Using DATABASE_URL=', process.env.DATABASE_URL)

// Apply migrations to the test database before starting the dev server
const migrate = spawnSync('pnpm', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  env: process.env,
})

if (migrate.status !== 0) {
  console.error('[e2e-server] prisma migrate deploy failed')
  process.exit(migrate.status || 1)
}

// Start the dev server (react-router dev)
const server = spawn('pnpm', ['dev'], { stdio: 'inherit', env: process.env })

server.on('exit', code => {
  process.exit(code || 0)
})
