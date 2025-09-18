#!/usr/bin/env node
/* eslint-disable no-console */
import { spawn, spawnSync } from 'node:child_process'

import { checkDevServer } from './utils/port-utils.js'

// Force test DB for built e2e server
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'file:./prisma/data-test.db?connection_limit=1'
process.env.PLAYWRIGHT_TEST = process.env.PLAYWRIGHT_TEST || 'true'

const PORT = 5174
process.env.PORT = PORT.toString() // Ensure consistent port for built server

console.log('[e2e-server-built] Using DATABASE_URL=', process.env.DATABASE_URL)
console.log('[e2e-server-built] PORT=', PORT)

// Check if server is already running
const serverStatus = await checkDevServer(PORT)

if (serverStatus.isResponding && serverStatus.isTestServer) {
  console.log(
    `[e2e-server-built] ✅ Test server is already running and responding at ${serverStatus.url}`
  )
  console.log(
    '[e2e-server-built] Reusing existing test server - no need to start a new one'
  )
  process.exit(0)
} else if (serverStatus.isResponding && !serverStatus.isTestServer) {
  console.log(`[e2e-server-built] ⚠️  Non-test server detected at ${serverStatus.url}`)
  console.log('[e2e-server-built] Need to start a proper test server instead')
  console.log(
    '[e2e-server-built] 🛑 Stopping to avoid conflicts. Please stop the dev server and try again.'
  )
  process.exit(1)
} else if (serverStatus.isRunning && !serverStatus.isResponding) {
  console.log(
    `[e2e-server-built] ⚠️  Port ${PORT} is in use but server is not responding`
  )
  console.log(
    '[e2e-server-built] This might be a stale process. Consider killing it and trying again.'
  )
  process.exit(1)
}

console.log(
  `[e2e-server-built] 🚀 No responsive server detected on port ${PORT}, starting new built server...`
)

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
