#!/usr/bin/env node
/* eslint-disable no-console */
import { spawn, spawnSync } from 'node:child_process'

// Force test DB for built e2e server
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'file:./prisma/data-test.db?connection_limit=1'
process.env.PLAYWRIGHT_TEST = process.env.PLAYWRIGHT_TEST || 'true'

const port = process.env.PORT || '3000'
console.log('[e2e-server-built] Using DATABASE_URL=', process.env.DATABASE_URL)
console.log('[e2e-server-built] PORT=', port)

// Apply migrations to the test database before starting the built server
const migrate = spawnSync('pnpm', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  env: process.env,
})

if (migrate.status !== 0) {
  console.error('[e2e-server-built] prisma migrate deploy failed')
  process.exit(migrate.status || 1)
}

// Start the built server
const server = spawn('pnpm', ['start'], { stdio: 'inherit', env: process.env })

server.on('exit', code => {
  process.exit(code || 0)
})
